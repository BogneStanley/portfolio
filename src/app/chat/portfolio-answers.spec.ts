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
    const detail = answerPortfolio('Parle-moi de Orbit API');
    expect(detail.text).toContain(PROJECTS[2].description);
    expect(detail.text).not.toContain('Forma Studio');
    const combined = answerPortfolio('Quels sont ses projets et ses compétences ?');
    expect(combined.sources).toEqual(['projects', 'skills']);
  });
  it('uses portfolio contact details and does not invent missing facts', () => {
    expect(answerPortfolio('Comment le contacter ?').text).toContain(PROFILE.email);
    expect(answerPortfolio('Comment le contacter ?').sources).toEqual(['contact']);
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
