import { describe, expect, it } from 'vitest';
import { PROJECTS } from './portfolio';

describe('Project catalogue', () => {
  it('preserves all original projects and adds the supplied references once', () => {
    const ids = PROJECTS.map((project) => project.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'freemopay',
        'mokaa',
        'kusa',
        'metoua',
        'toupesu',
        'afrolancer',
        'get-typed-router',
        'form-validator-x',
        'dev-talk',
        'portfolio',
      ]),
    );
    expect(new Set(ids).size).toBe(16);
    expect(PROJECTS.filter((project) => project.category === 'learning')).toHaveLength(2);
  });
  it('places projects without public links last and numbers the catalogue in display order', () => {
    const firstWithoutLink = PROJECTS.findIndex((project) => !project.links?.length);
    expect(firstWithoutLink).toBeGreaterThan(0);
    expect(PROJECTS.slice(firstWithoutLink).every((project) => !project.links?.length)).toBe(true);
    expect(PROJECTS.map((project) => project.number)).toEqual(
      PROJECTS.map((_, index) => String(index + 1).padStart(2, '0')),
    );
    expect(PROJECTS.find((project) => project.id === 'portfolio')?.links).toContainEqual({
      label: 'Explorer le portfolio',
      url: 'https://stanley-bogne.me/',
    });
  });
  it('provides external links and locally hosted screenshots for the seven linked products', () => {
    for (const id of [
      'freemopay',
      'mokaa',
      'toupesu',
      'lehiboo',
      'smalldeals',
      'badgee',
      'bluedata',
    ]) {
      const project = PROJECTS.find((entry) => entry.id === id)!;
      expect(project.links?.[0].url).toMatch(/^https:\/\//);
      expect(project.screenshot?.src).toMatch(/^\/projects\/screens\/.+\.webp$/);
      expect(project.screenshot?.alt).toBeTruthy();
    }
  });
});
