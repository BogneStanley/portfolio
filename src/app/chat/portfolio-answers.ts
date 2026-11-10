import { EDUCATION, EXPERIENCES, PROFILE, PROJECTS, SKILLS } from '../data/portfolio';

export type ChatSource = 'about' | 'projects' | 'skills' | 'experiences' | 'contact';
export interface PortfolioAnswer {
  text: string;
  sources: ChatSource[];
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/** Réponses déterministes : aucune information extérieure au portfolio. */
export function answerPortfolio(question: string): PortfolioAnswer {
  const query = normalize(question);
  const sections: PortfolioAnswer[] = [];
  const matches = (pattern: RegExp) => pattern.test(query);
  const courseQuestion = matches(/\b(cours|playlist\w*|tutoriel\w*|youtube)\b/);
  const compactQuery = query.replace(/[\s-]+/g, '');
  const projects = PROJECTS.filter(
    (project) =>
      query.includes(normalize(project.title.split(' · ')[0])) ||
      compactQuery.includes(normalize(project.id).replace(/[\s-]+/g, '')),
  );
  const missing = matches(/\b(salaire|tarif|tjm|age|ans|disponib\w*|recrut\w*)\b/);
  if (missing)
    sections.push({
      text: 'Cette information n’est pas renseignée dans le portfolio. Vous pouvez la demander directement à Stanley.',
      sources: ['contact'],
    });
  if (
    matches(
      /\b(qui|presente|presenter|presentation|profil|biographie|bio|approche|philosophie)\b/,
    ) &&
    !projects.length
  ) {
    sections.push({
      text: `${PROFILE.fullName} est ${PROFILE.role.toLowerCase()}. ${PROFILE.introduction}\n\n${PROFILE.biography}`,
      sources: ['about'],
    });
  }
  if (
    projects.length ||
    courseQuestion ||
    matches(/\b(projet\w*|realisation\w*|portfolio|application\w*)\b/)
  ) {
    const selection = projects.length
      ? projects
      : courseQuestion
        ? PROJECTS.filter((project) => project.category === 'learning')
        : PROJECTS;
    sections.push({
      text: `Voici ${projects.length ? 'le détail des projets demandés' : 'les projets présentés'} dans le portfolio :\n\n${selection.map((project) => `${project.title} — ${project.description}\n${project.technologies.length ? 'Technologies : ' + project.technologies.join(', ') + '.' : 'Domaines : ' + (project.topics ?? []).join(', ') + '.'}`).join('\n\n')}`,
      sources: ['projects'],
    });
  }
  const technologies = [...new Set(SKILLS.flatMap((group) => group.items))];
  const mentioned = technologies.filter((skill) => {
    const phrase = normalize(skill).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^a-z0-9])${phrase}($|[^a-z0-9])`).test(query);
  });
  if (
    matches(
      /\b(competence\w*|technolog\w*|stack|outil\w*|maitris\w*|sait|savoir|frontend|backend|animation\w*)\b/,
    ) ||
    (mentioned.length && !projects.length && !courseQuestion)
  ) {
    const related = PROJECTS.filter((project) =>
      project.technologies.some((technology) =>
        mentioned.some((skill) => normalize(skill) === normalize(technology)),
      ),
    );
    sections.push({
      text: `${SKILLS.map((group) => `${group.title} : ${group.items.join(', ')}.`).join('\n\n')}${related.length ? `\n\nÀ retrouver dans : ${related.map((project) => project.title).join(', ')}.` : ''}`,
      sources: related.length ? ['skills', 'projects'] : ['skills'],
    });
  }
  if (
    matches(
      /\b(experience\w*|parcours|mission\w*|entreprise\w*|carriere|travaille\w*|freemo|sdk|itnovation)\b/,
    )
  ) {
    sections.push({
      text: `Le parcours comporte ${EXPERIENCES.length} étapes :\n\n${EXPERIENCES.map((experience) => `${experience.period} · ${experience.organization}\n${experience.role}. ${experience.description}\n${experience.highlights.join(' ')}`).join('\n\n')}`,
      sources: ['experiences'],
    });
  }
  if (
    !courseQuestion &&
    matches(/\b(formation\w*|diplome\w*|etude\w*|ecole|universite|sup.?ptic)\b/)
  )
    sections.push({
      text: EDUCATION.map(
        (step) =>
          `${step.period} · ${step.degree}\nOption : ${step.specialization}.\n${step.school}, ${step.location}.`,
      ).join('\n\n'),
      sources: ['about'],
    });
  if (matches(/\b(langue\w*|francais|anglais)\b/))
    sections.push({ text: PROFILE.languages.join('\n'), sources: ['about'] });
  if (matches(/\b(association\w*|associati\w*|encadr\w*|club)\b/))
    sections.push({ text: PROFILE.community, sources: ['about'] });
  if (matches(/\b(loisir\w*|interet\w*|passion\w*)\b/))
    sections.push({
      text: `Ses centres d’intérêt : ${PROFILE.interests.join(', ')}.`,
      sources: ['about'],
    });
  if (
    matches(/\b(adresse|ville|pays|localisation|habite|base|mobilite)\b/) ||
    /ou (est|vit|travaille)/.test(query)
  )
    sections.push({
      text: `${PROFILE.name} est basé à ${PROFILE.location}. ${PROFILE.mobility}.`,
      sources: ['contact'],
    });
  if (
    !missing &&
    matches(
      /\b(contact\w*|mail|email|e-mail|joindre|ecrire|collabor\w*|telephone|tel|numero|cv|curriculum)\b/,
    )
  )
    sections.push({
      text: `Vous pouvez joindre ${PROFILE.name} à ${PROFILE.email} ou au ${PROFILE.phone}. Il est basé à ${PROFILE.location}. Son CV au format PDF est téléchargeable depuis le dossier Contact.`,
      sources: ['contact'],
    });
  if (matches(/\b(linkedin|github|reseaux|reseau|social|sociaux)\b/)) {
    sections.push({
      text: `Retrouvez ${PROFILE.name} sur LinkedIn et GitHub via les liens ci-dessous.`,
      sources: ['contact'],
    });
  }
  if (sections.length)
    return {
      text: sections.map((section) => section.text).join('\n\n'),
      sources: [...new Set(sections.flatMap((section) => section.sources))],
    };
  if (matches(/\b(bonjour|salut|hello|coucou|merci)\b/))
    return {
      text: `Bonjour ! Je peux vous présenter ${PROFILE.name}, ses projets, ses compétences ou son parcours. Que souhaitez-vous découvrir ?`,
      sources: [],
    };
  return {
    text: 'Je n’ai pas trouvé de réponse à cette question dans le portfolio. Essayez une question sur le profil, les projets, les compétences, le parcours ou le contact. Je suis un assistant local, mes réponses restent limitées à ces rubriques.',
    sources: [],
  };
}
