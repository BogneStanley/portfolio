import { EXPERIENCES, PROFILE, PROJECTS, SKILLS } from '../data/portfolio';

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
  const projects = PROJECTS.filter(
    (project) =>
      query.includes(normalize(project.title)) ||
      (project.id === 'orbit' && /\borbit\b/.test(query)) ||
      (project.id === 'studio' && /\bforma\b/.test(query)) ||
      (project.id === 'desktop' && /\bdesktop\b/.test(query)),
  );
  const missing = matches(
    /\b(salaire|tarif|tjm|age|ans|adresse|ville|pays|diplome|formation|disponib\w*|recrut\w*|telephone|cv|linkedin|github)\b/,
  );
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
      text: `${PROFILE.name} est ${PROFILE.role.toLowerCase()}. ${PROFILE.introduction}\n\n${PROFILE.biography}`,
      sources: ['about'],
    });
  }
  if (projects.length || matches(/\b(projet\w*|realisation\w*|portfolio|application\w*)\b/)) {
    const selection = projects.length ? projects : PROJECTS;
    sections.push({
      text: `Voici ${projects.length ? 'le détail des projets demandés' : 'les projets présentés'} dans le portfolio :\n\n${selection.map((project) => `${project.title} — ${project.description}\nTechnologies : ${project.technologies.join(', ')}.`).join('\n\n')}`,
      sources: ['projects'],
    });
  }
  const technologies = [...new Set(SKILLS.flatMap((group) => group.items))];
  const mentioned = technologies.filter((skill) => query.includes(normalize(skill)));
  if (
    matches(
      /\b(competence\w*|technolog\w*|stack|outil\w*|maitris\w*|sait|savoir|frontend|backend|animation\w*)\b/,
    ) ||
    mentioned.length
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
      /\b(experience\w*|parcours|mission\w*|entreprise\w*|carriere|travaille\w*|atelier|pixel|laboratoire)\b/,
    )
  ) {
    sections.push({
      text: `Le parcours comporte ${EXPERIENCES.length} étapes :\n\n${EXPERIENCES.map((experience) => `${experience.period} · ${experience.organization}\n${experience.role}. ${experience.description}`).join('\n\n')}`,
      sources: ['experiences'],
    });
  }
  if (!missing && matches(/\b(contact\w*|mail|email|e-mail|joindre|ecrire|collabor\w*)\b/))
    sections.push({
      text: `L’adresse affichée est ${PROFILE.email}. Le dossier Contact regroupe les coordonnées et les liens disponibles.`,
      sources: ['contact'],
    });
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
