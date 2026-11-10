import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsPanel } from './settings-panel';
import { PreferencesStore } from '../../settings/preferences';
describe('SettingsPanel', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    );
    TestBed.configureTestingModule({ imports: [SettingsPanel] });
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    vi.unstubAllGlobals();
  });
  it('changes theme, accent and reading controls through their native inputs', () => {
    const fixture = TestBed.createComponent(SettingsPanel);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement,
      settings = TestBed.inject(PreferencesStore);
    root.querySelectorAll<HTMLButtonElement>('.theme-options button')[1].click();
    fixture.detectChanges();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    const color = root.querySelector<HTMLInputElement>('input[type=color]')!;
    color.value = '#ff0000';
    color.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(settings.preferences().accent).toBe('#ff0000');
    const scale = root.querySelector('select')!;
    scale.value = '1.2';
    scale.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(settings.preferences().textScale).toBe(1.2);
    const motion = root.querySelector<HTMLInputElement>('input[type=checkbox]')!;
    motion.checked = true;
    motion.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(settings.reducedMotion()).toBe(true);
    root.querySelectorAll<HTMLButtonElement>('.action-button')[1].click();
    fixture.detectChanges();
    expect(settings.preferences().theme).toBe('dark');
    expect(root.querySelector('[role=status]')?.textContent).toContain('rétablies');
  });
});
