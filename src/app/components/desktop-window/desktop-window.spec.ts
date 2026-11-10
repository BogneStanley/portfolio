import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
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
