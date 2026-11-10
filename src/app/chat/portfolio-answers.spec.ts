import { describe, expect, it } from 'vitest';
import { answerPortfolio } from './portfolio-answers';
import { EXPERIENCES, PROFILE, PROJECTS, SKILLS } from '../data/portfolio';

describe('Local portfolio answers', () => {
  it('answers about identity, projects, skills and experience from the portfolio data', () => {
    expect(answerPortfolio('Qui est Stanley ?').text).toContain(PROFILE.biography);
    const projects = answerPortfolio('Quels sont ses projets ?');
    for (const project of PROJECTS) expect(projects.text).toContain(project.title);
    expect(projects.sources).toEqual(['projects']);
    const skills = answerPortfolio('Quelles sont ses COMPÉTENCES ?');
    for (const group of SKILLS)
      for (const skill of group.items) expect(skills.text).toContain(skill);
    const experience = answerPortfolio('Quel est son parcours ?');
    for (const step of EXPERIENCES) expect(experience.text).toContain(step.organization);
    expect(experience.sources).toEqual(['experiences']);
  });
  it('selects a named project and supports questions spanning multiple sections', () => {
    const detail = answerPortfolio('Parle-moi de Kusa');
    expect(detail.text).toContain(PROJECTS[2].description);
    expect(detail.text).not.toContain('FreemoPay');
    const combined = answerPortfolio('Quels sont ses projets et ses compétences ?');
    expect(combined.sources).toEqual(['projects', 'skills']);
  });
  it('finds the new projects and distinguishes teaching playlists from education', () => {
    const courses = answerPortfolio('Quels cours YouTube a-t-il créés ?');
    expect(courses.text).toContain('Cours Flutter');
    expect(courses.text).toContain('Cours Figma');
    expect(courses.text).not.toContain('FreemoPay');
    expect(courses.sources).toEqual(['projects']);
    const blueData = answerPortfolio('Parle-moi de BlueData');
    expect(blueData.text).toContain('Blue Camtel');
    expect(blueData.text).not.toContain('Technologies : .');
    expect(blueData.text).not.toContain('FreemoPay');
  });
  it('answers education, languages, location and telephone from the CV', () => {
    expect(answerPortfolio('Quelle est sa formation ?').text).toContain('2021 — 2023');
    expect(answerPortfolio('Quel diplôme a-t-il ?').sources).toEqual(['about']);
    expect(answerPortfolio('Quelles langues parle-t-il ?').text).toContain('Anglais · B1');
    expect(answerPortfolio('Dans quelle ville est-il basé ?').text).toContain(PROFILE.location);
    expect(answerPortfolio('Quel est son téléphone ?').text).toContain(PROFILE.phone);
    expect(answerPortfolio('Où télécharger son CV ?').text).toContain('PDF');
  });
  it('uses portfolio contact details and does not invent missing facts', () => {
    expect(answerPortfolio('Comment le contacter ?').text).toContain(PROFILE.email);
    expect(answerPortfolio('Comment le contacter ?').sources).toEqual(['contact']);
    const social = answerPortfolio('Quels sont ses profils LinkedIn et GitHub ?');
    expect(social.text).toContain('LinkedIn et GitHub');
    expect(social.text).not.toContain('n’est pas renseignée');
    expect(social.sources).toEqual(['contact']);
    for (const question of [
      'Quel est son âge ?',
      'Est-il disponible ?',
      'Quel est son salaire ?',
    ]) {
      expect(answerPortfolio(question).text).toContain('n’est pas renseignée');
    }
    const unknown = answerPortfolio('Quelle est la météo demain ?');
    expect(unknown.sources).toEqual([]);
    expect(unknown.text).toContain('pas trouvé');
  });
});
