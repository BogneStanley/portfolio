import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './app';

describe('Portfolio desktop', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    TestBed.configureTestingModule({ imports: [App] });
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
  });

  it('opens, minimizes, restores and closes a window without losing its filter', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const click = async (selector: string) => {
      const button = element.querySelector<HTMLButtonElement>(selector);
      expect(button, selector).not.toBeNull();
      button!.click();
      fixture.detectChanges();
      await fixture.whenStable();
    };
    await click('.desktop-icon');
    expect(element.querySelectorAll('.project-card')).toHaveLength(3);
    await click('.project-filters button:last-child');
    expect(element.querySelectorAll('.project-card')).toHaveLength(1);
    expect(element.querySelector('.project-card h4')?.textContent).toContain('Orbit');
    const original = element.querySelector('app-desktop-window');
    await click('.window__minimize');
    expect(original?.classList.contains('is-minimized')).toBe(true);
    await click('#dock-projects');
    expect(element.querySelector('app-desktop-window')).toBe(original);
    expect(original?.classList.contains('is-minimized')).toBe(false);
    expect(element.querySelectorAll('.project-card')).toHaveLength(1);
    await click('.window__close');
    expect(element.querySelector('app-desktop-window')).toBeNull();
  });

  it('opens every application with its own content', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    for (const button of element.querySelectorAll<HTMLButtonElement>('.desktop-icon')) {
      button.click();
      fixture.detectChanges();
      await fixture.whenStable();
    }
    expect(element.querySelectorAll('app-desktop-window')).toHaveLength(4);
    expect(element.querySelectorAll('.skill-group')).toHaveLength(3);
    expect(element.querySelector<HTMLAnchorElement>('.email-block a')?.getAttribute('href')).toBe(
      'mailto:bonjour@example.com',
    );
  });
});
