import { describe, expect, it } from 'vitest';
import { PROJECTS } from './portfolio';

describe('Project catalogue', () => {
  it('preserves all original projects and adds the supplied references once', () => {
    const ids = PROJECTS.map((project) => project.id);
    expect(ids.slice(0, 9)).toEqual([
      'freemopay',
      'mokaa',
      'kusa',
      'metoua',
      'toupesu',
      'afrolancer',
      'get-typed-router',
      'form-validator-x',
      'dev-talk',
    ]);
    expect(new Set(ids).size).toBe(15);
    expect(PROJECTS.filter((project) => project.category === 'learning')).toHaveLength(2);
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
