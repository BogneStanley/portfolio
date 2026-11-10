import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { gsap } from 'gsap';
import { PreferencesStore } from '../../settings/preferences';
import { DesktopWindow } from './desktop-window';
import { WindowManager } from '../../windows/window-manager';

describe('DesktopWindow', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });
  it('emits close immediately when reduced motion is requested', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true })),
    );
    TestBed.configureTestingModule({ imports: [DesktopWindow] });
    const fixture = TestBed.createComponent(DesktopWindow);
    fixture.componentRef.setInput('title', 'Projets');
    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);
    fixture.detectChanges();
    await fixture.whenStable();
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.window__close')!
      .click();
    expect(closed).toHaveBeenCalledOnce();
  });
  it('opens the hover menu after 350 ms and cancels a pending hover on maximize', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true })),
    );
    TestBed.configureTestingModule({ imports: [DesktopWindow] });
    const fixture = TestBed.createComponent(DesktopWindow);
    fixture.componentRef.setInput('title', 'Projets');
    fixture.detectChanges();
    await fixture.whenStable();
    const manager = TestBed.inject(WindowManager);
    const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.window__maximize',
    )!;
    vi.useFakeTimers();
    button.dispatchEvent(new Event('pointerenter'));
    vi.advanceTimersByTime(349);
    expect(manager.menu()).toBeNull();
    vi.advanceTimersByTime(1);
    expect(manager.menu()).toBe('projects');
    manager.menu.set(null);
    button.dispatchEvent(new Event('pointerenter'));
    button.click();
    vi.advanceTimersByTime(400);
    expect(manager.menu()).toBeNull();
    expect(manager.windows().projects.presentation).toBe('maximized');
  });
});

describe('Window animation interruptions', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  it.each(['minimize', 'close'] as const)(
    'keeps a reopened folder visible when an earlier %s finishes late',
    async (action) => {
      TestBed.configureTestingModule({ imports: [DesktopWindow] });
      const preferences = TestBed.inject(PreferencesStore);
      preferences.systemReducedMotion.set(false);
      preferences.update({ reducedMotion: false });
      const manager = TestBed.inject(WindowManager);
      manager.open('projects');
      const fixture = TestBed.createComponent(DesktopWindow);
      fixture.componentRef.setInput('title', 'Projets');
      fixture.componentRef.setInput('windowId', 'projects');
      fixture.componentInstance.reduced.subscribe(() => manager.setStatus('projects', 'minimized'));
      fixture.componentInstance.closed.subscribe(() => manager.setStatus('projects', 'closed'));
      fixture.detectChanges();
      await fixture.whenStable();
      const pending: gsap.core.Tween[] = [];
      const originalTo = gsap.to.bind(gsap);
      vi.spyOn(gsap, 'to').mockImplementation((target, vars) => {
        const tween = originalTo(target, { ...vars, paused: true });
        pending.push(tween);
        return tween;
      });
      const root = fixture.nativeElement as HTMLElement;
      const selector = action === 'minimize' ? '.window__minimize' : '.window__close';
      root.querySelector<HTMLButtonElement>(selector)!.click();
      expect(pending).toHaveLength(1);
      manager.open('projects');
      // Simule le callback tardif avant même le rendu de la réouverture.
      pending[0].progress(1);
      expect(manager.windows().projects.status).toBe('open');
      fixture.detectChanges();
      await fixture.whenStable();
      // Termine l'entrée pour contrôler la visibilité finale sans attendre le temps réel.
      preferences.update({ reducedMotion: true });
      fixture.detectChanges();
      await fixture.whenStable();
      expect(root.querySelector<HTMLElement>('.window')!.style.opacity).toBe('1');
      expect(root.querySelector<HTMLElement>('.window__content')!.style.opacity).toBe('1');
      root.querySelector<HTMLButtonElement>('.window__close')!.click();
      expect(manager.windows().projects.status).toBe('closed');
    },
  );
});
