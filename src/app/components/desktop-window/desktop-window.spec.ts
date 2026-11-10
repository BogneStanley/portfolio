import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DesktopWindow } from './desktop-window';

describe('DesktopWindow', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
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
});
