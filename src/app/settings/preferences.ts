import { DOCUMENT } from '@angular/common';
import { computed, DestroyRef, effect, inject, Service, signal } from '@angular/core';
export type Theme = 'dark' | 'light' | 'system';
export interface Preferences {
  theme: Theme;
  accent: string;
  textScale: number;
  reducedMotion: boolean;
  showGrid: boolean;
}
export const PREFERENCES_KEY = 'portfolio.preferences.v1';
export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'dark',
  accent: '#c7e99a',
  textScale: 1,
  reducedMotion: false,
  showGrid: true,
};
export const ACCENTS = [
  { name: 'Sauge', color: '#c7e99a' },
  { name: 'Bleu', color: '#8cbcff' },
  { name: 'Violet', color: '#b8a1ef' },
  { name: 'Rose', color: '#e9a4c1' },
  { name: 'Ambre', color: '#f4c56b' },
  { name: 'Corail', color: '#ed9c83' },
];
export function normalizePreferences(value: unknown): Preferences {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return { ...DEFAULT_PREFERENCES };
  const input = value as Record<string, unknown>;
  return {
    theme:
      input['theme'] === 'light' || input['theme'] === 'system' || input['theme'] === 'dark'
        ? input['theme']
        : 'dark',
    accent:
      typeof input['accent'] === 'string' && /^#[0-9a-f]{6}$/i.test(input['accent'])
        ? input['accent'].toLowerCase()
        : DEFAULT_PREFERENCES.accent,
    textScale: [1, 1.1, 1.2].includes(Number(input['textScale'])) ? Number(input['textScale']) : 1,
    reducedMotion: input['reducedMotion'] === true,
    showGrid: typeof input['showGrid'] === 'boolean' ? input['showGrid'] : true,
  };
}
function rgb(hex: string): number[] {
  return [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
}
function luminance(hex: string): number {
  const channels = rgb(hex).map((value) => {
    const c = value / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
export function contrast(first: string, second: string): number {
  const a = luminance(first),
    b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
export function readableAccent(source: string, theme: 'dark' | 'light'): string {
  const surface = theme === 'dark' ? '#30382b' : '#e9ede3',
    target = theme === 'dark' ? 255 : 0;
  if (contrast(source, surface) >= 4.8) return source;
  const channels = rgb(source);
  for (let step = 1; step <= 100; step++) {
    const color =
      '#' +
      channels
        .map((channel) =>
          Math.round(channel + ((target - channel) * step) / 100)
            .toString(16)
            .padStart(2, '0'),
        )
        .join('');
    if (contrast(color, surface) >= 4.8) return color;
  }
  return theme === 'dark' ? '#ffffff' : '#000000';
}
@Service()
export class PreferencesStore {
  private readonly document = inject(DOCUMENT);
  private readonly value = signal(this.load());
  readonly preferences = this.value.asReadonly();
  readonly systemDark = signal(true);
  readonly systemReducedMotion = signal(false);
  readonly effectiveTheme = computed(() =>
    this.value().theme === 'system'
      ? this.systemDark()
        ? 'dark'
        : 'light'
      : (this.value().theme as 'dark' | 'light'),
  );
  readonly reducedMotion = computed(() => this.value().reducedMotion || this.systemReducedMotion());
  readonly storageAvailable = signal(true);
  constructor() {
    const dark =
      typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;
    const motion =
      typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
    this.systemDark.set(dark?.matches ?? true);
    this.systemReducedMotion.set(motion?.matches ?? false);
    const updateDark = () => this.systemDark.set(dark?.matches ?? true),
      updateMotion = () => this.systemReducedMotion.set(motion?.matches ?? false);
    dark?.addEventListener?.('change', updateDark);
    motion?.addEventListener?.('change', updateMotion);
    const root = this.document.documentElement;
    const attributes = ['data-theme', 'data-motion', 'data-grid'];
    const originalAttributes = attributes.map((key) => root.getAttribute(key));
    const variables = ['--accent', '--accent-fill', '--accent-contrast', '--text-scale'];
    const originalVariables = variables.map((key) => root.style.getPropertyValue(key));
    effect(() => {
      const prefs = this.value(),
        theme = this.effectiveTheme();
      root.setAttribute('data-theme', theme);
      root.setAttribute('data-motion', this.reducedMotion() ? 'reduced' : 'normal');
      root.setAttribute('data-grid', prefs.showGrid ? 'on' : 'off');
      root.style.setProperty('--accent', readableAccent(prefs.accent, theme));
      root.style.setProperty('--accent-fill', prefs.accent);
      root.style.setProperty(
        '--accent-contrast',
        contrast(prefs.accent, '#11180e') >= contrast(prefs.accent, '#ffffff')
          ? '#11180e'
          : '#ffffff',
      );
      root.style.setProperty('--text-scale', String(prefs.textScale));
      try {
        this.document.defaultView?.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
        this.storageAvailable.set(true);
      } catch {
        this.storageAvailable.set(false);
      }
    });
    inject(DestroyRef).onDestroy(() => {
      dark?.removeEventListener?.('change', updateDark);
      motion?.removeEventListener?.('change', updateMotion);
      attributes.forEach((key, index) => {
        const value = originalAttributes[index];
        if (value === null) root.removeAttribute(key);
        else root.setAttribute(key, value);
      });
      variables.forEach((key, index) => {
        const value = originalVariables[index];
        if (value) root.style.setProperty(key, value);
        else root.style.removeProperty(key);
      });
    });
  }
  update(patch: Partial<Preferences>): void {
    this.value.update((current) => normalizePreferences({ ...current, ...patch }));
  }
  reset(): void {
    this.value.set({ ...DEFAULT_PREFERENCES });
  }
  private load(): Preferences {
    try {
      return normalizePreferences(
        JSON.parse(this.document.defaultView?.localStorage.getItem(PREFERENCES_KEY) ?? 'null'),
      );
    } catch {
      return { ...DEFAULT_PREFERENCES };
    }
  }
}
