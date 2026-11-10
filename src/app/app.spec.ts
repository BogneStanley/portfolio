import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './app';
import { WindowManager } from './windows/window-manager';

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

  it('uses the layout menu and assistant without recreating the project content', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const manager = TestBed.inject(WindowManager);
    manager.setWorkspace({ x: 12, y: 58, width: 1256, height: 640 }, true);
    manager.open('projects');
    manager.open('about');
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const projectContent = root.querySelector('app-window-content');
    root.querySelectorAll<HTMLButtonElement>('.project-filters button')[2].click();
    fixture.detectChanges();
    manager.menu.set('projects');
    fixture.detectChanges();
    root.querySelector<HTMLButtonElement>('[aria-label="Deux moitiés, zone 1 / 1"]')!.click();
    fixture.detectChanges();
    expect(root.querySelector('.snap-assist')).not.toBeNull();
    root.querySelector<HTMLButtonElement>('.suggestions button')!.click();
    fixture.detectChanges();
    expect(manager.group()?.occupants).toEqual({ '0-0': 'projects', '0-1': 'about' });
    expect(root.querySelector('app-window-content')).toBe(projectContent);
    expect(root.querySelectorAll('.project-card')).toHaveLength(1);
    expect(root.querySelector('.separator--vertical')).not.toBeNull();
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
    expect(element.querySelectorAll('app-desktop-window')).toHaveLength(5);
    expect(element.querySelectorAll('.skill-group')).toHaveLength(3);
    expect(element.querySelectorAll('.experience-item')).toHaveLength(3);
    expect(element.textContent).toContain('Atelier Pixel');
    expect(element.querySelector<HTMLAnchorElement>('.email-block a')?.getAttribute('href')).toBe(
      'mailto:bonjour@example.com',
    );
  });
});

describe('Immersive desktop', () => {
  const properties = ['fullscreenElement', 'fullscreenEnabled', 'exitFullscreen'] as const;
  let descriptors: (PropertyDescriptor | undefined)[];
  beforeEach(() => {
    descriptors = properties.map((property) => Object.getOwnPropertyDescriptor(document, property));
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
    properties.forEach((property, index) => {
      const descriptor = descriptors[index];
      if (descriptor) Object.defineProperty(document, property, descriptor);
      else Reflect.deleteProperty(document, property);
    });
  });
  async function createDesktop() {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const desktop = root.querySelector<HTMLElement>('.desktop')!;
    return { fixture, root, desktop };
  }
  it('enters in-page immersion when fullscreen is unavailable, without opening projects', async () => {
    const { fixture, root, desktop } = await createDesktop();
    Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: false });
    root.querySelector<HTMLButtonElement>('.primary-button')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(desktop.classList.contains('desktop--immersive')).toBe(true);
    expect(root.querySelector('app-desktop-window')).toBeNull();
    expect(root.querySelector('.immersive-notice')?.textContent).toContain('pas disponible');
    root.querySelector<HTMLButtonElement>('.immersive-exit')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(desktop.classList.contains('desktop--immersive')).toBe(false);
    expect(root.querySelector('.immersive-exit')).toBeNull();
  });
  it('requests fullscreen from the CTA and follows native fullscreen exit', async () => {
    const { fixture, root, desktop } = await createDesktop();
    let fullscreen: Element | null = null;
    Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: true });
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => fullscreen,
    });
    const request = vi.fn(async () => {
      fullscreen = desktop;
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    Object.defineProperty(desktop, 'requestFullscreen', { value: request });
    root.querySelector<HTMLButtonElement>('.primary-button')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(request).toHaveBeenCalledWith({ navigationUI: 'hide' });
    expect(root.querySelector('.immersive-hint')?.textContent).toContain('Échap');
    fullscreen = null;
    document.dispatchEvent(new Event('fullscreenchange'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(desktop.classList.contains('desktop--immersive')).toBe(false);
  });
  it('exits fullscreen with the visible control and keeps open applications', async () => {
    const { fixture, root, desktop } = await createDesktop();
    let fullscreen: Element | null = null;
    Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: true });
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => fullscreen,
    });
    Object.defineProperty(desktop, 'requestFullscreen', {
      value: vi.fn(async () => {
        fullscreen = desktop;
        document.dispatchEvent(new Event('fullscreenchange'));
      }),
    });
    const exit = vi.fn(async () => {
      fullscreen = null;
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    Object.defineProperty(document, 'exitFullscreen', { configurable: true, value: exit });
    root.querySelector<HTMLButtonElement>('.primary-button')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    root.querySelector<HTMLButtonElement>('.desktop-icon')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    root.querySelector<HTMLButtonElement>('.immersive-exit')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(exit).toHaveBeenCalledOnce();
    expect(root.querySelector('app-desktop-window')).not.toBeNull();
    expect(desktop.classList.contains('desktop--immersive')).toBe(false);
  });
  it('handles a rejected request without an unhandled error or a stuck button', async () => {
    const { fixture, root, desktop } = await createDesktop();
    Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: true });
    Object.defineProperty(desktop, 'requestFullscreen', {
      value: vi.fn().mockRejectedValue(new Error('Denied')),
    });
    root.querySelector<HTMLButtonElement>('.primary-button')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(desktop.classList.contains('desktop--immersive')).toBe(true);
    expect(root.querySelector('.immersive-notice')?.textContent).toContain('refusé');
    expect(root.querySelector<HTMLButtonElement>('.immersive-exit')?.disabled).toBe(false);
  });
  it('allows Escape to leave the fallback immersive desktop', async () => {
    const { fixture, root, desktop } = await createDesktop();
    Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: false });
    root.querySelector<HTMLButtonElement>('.primary-button')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(desktop.classList.contains('desktop--immersive')).toBe(false);
  });
});
