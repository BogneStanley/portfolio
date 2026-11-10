import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ACCENTS,
  contrast,
  DEFAULT_PREFERENCES,
  normalizePreferences,
  PREFERENCES_KEY,
  PreferencesStore,
  readableAccent,
} from './preferences';
describe('Preferences', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    );
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    localStorage.clear();
  });
  it('validates stored preferences instead of trusting malformed values', () => {
    expect(
      normalizePreferences({
        theme: 'invalid',
        accent: 'red',
        textScale: 4,
        reducedMotion: 'true',
        showGrid: 0,
      }),
    ).toEqual(DEFAULT_PREFERENCES);
    expect(normalizePreferences(null)).toEqual(DEFAULT_PREFERENCES);
  });
  it('loads persisted preferences and applies the light theme to the whole document', () => {
    localStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({
        theme: 'light',
        accent: '#8CBCFF',
        textScale: 1.2,
        reducedMotion: true,
        showGrid: false,
      }),
    );
    const settings = TestBed.inject(PreferencesStore);
    TestBed.tick();
    expect(settings.preferences().accent).toBe('#8cbcff');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-motion')).toBe('reduced');
    expect(document.documentElement.getAttribute('data-grid')).toBe('off');
    expect(document.documentElement.style.getPropertyValue('--text-scale')).toBe('1.2');
  });
  it('persists changes and restores defaults without disturbing other storage', () => {
    localStorage.setItem('unrelated', 'keep');
    const settings = TestBed.inject(PreferencesStore);
    settings.update({ theme: 'light', textScale: 1.1 });
    TestBed.tick();
    expect(JSON.parse(localStorage.getItem(PREFERENCES_KEY)!)).toMatchObject({
      theme: 'light',
      textScale: 1.1,
    });
    settings.reset();
    TestBed.tick();
    expect(settings.preferences()).toEqual(DEFAULT_PREFERENCES);
    expect(localStorage.getItem('unrelated')).toBe('keep');
  });
  it('follows system theme and never disables a system motion preference', () => {
    const settings = TestBed.inject(PreferencesStore);
    settings.update({ theme: 'system', reducedMotion: false });
    expect(settings.effectiveTheme()).toBe('light');
    settings.systemDark.set(true);
    expect(settings.effectiveTheme()).toBe('dark');
    settings.systemReducedMotion.set(true);
    expect(settings.reducedMotion()).toBe(true);
  });
  it('survives invalid JSON and denied storage while still changing appearance', () => {
    localStorage.setItem(PREFERENCES_KEY, 'broken');
    const settings = TestBed.inject(PreferencesStore);
    expect(settings.preferences()).toEqual(DEFAULT_PREFERENCES);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Unavailable');
    });
    settings.update({ theme: 'light' });
    TestBed.tick();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(settings.storageAvailable()).toBe(false);
  });
  for (const theme of ['dark', 'light'] as const)
    it(`keeps every accent readable in ${theme}`, () => {
      for (const color of [
        ...ACCENTS.map((accent) => accent.color),
        '#000000',
        '#ffffff',
        '#112233',
        '#ff0000',
      ]) {
        const adjusted = readableAccent(color, theme);
        expect(contrast(adjusted, theme === 'dark' ? '#30382b' : '#e9ede3')).toBeGreaterThanOrEqual(
          4.8,
        );
      }
    });
});
