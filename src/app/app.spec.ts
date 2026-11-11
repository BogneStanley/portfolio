import { DeferBlockBehavior } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './app';
import { PROJECTS, PROFILE, SKILLS, SOCIAL_PROFILES } from './data/portfolio';
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
    TestBed.configureTestingModule({
      imports: [App],
      deferBlockBehavior: DeferBlockBehavior.Playthrough,
    });
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
  });

  it('keeps only pinned or launched apps in the dock and follows the foreground window', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const dockIds = () => [...root.querySelectorAll('.dock__item')].map((item) => item.id);
    const click = async (selector: string) => {
      root.querySelector<HTMLButtonElement>(selector)!.click();
      fixture.detectChanges();
      await fixture.whenStable();
    };
    expect(dockIds()).toEqual(['dock-chat', 'dock-settings']);
    await click('[data-window-id="projects"]');
    await click('[data-window-id="about"]');
    expect(dockIds()).toEqual(['dock-projects', 'dock-about', 'dock-chat', 'dock-settings']);
    expect(root.querySelector('.dock__item.is-active')?.id).toBe('dock-about');
    root.querySelector('.window[aria-label="Projets"]')!.dispatchEvent(new Event('pointerdown'));
    fixture.detectChanges();
    expect(root.querySelector('.dock__item.is-active')?.id).toBe('dock-projects');
    expect(root.querySelector('#dock-projects')?.getAttribute('aria-current')).toBe('true');
    await click('.window[aria-label="Projets"] .window__minimize');
    expect(dockIds()).toContain('dock-projects');
    expect(root.querySelector('#dock-projects')?.classList.contains('is-open')).toBe(false);
    expect(root.querySelector('.dock__item.is-active')?.id).toBe('dock-about');
    await click('.window[aria-label="À propos"] .window__close');
    expect(dockIds()).not.toContain('dock-about');
    expect(root.querySelector('.dock__item.is-active')).toBeNull();
    await click('#dock-projects');
    expect(root.querySelector('#dock-projects')?.classList.contains('is-open')).toBe(true);
    expect(root.querySelector('.dock__item.is-active')?.id).toBe('dock-projects');
    await click('.window__close');
    await click('#dock-chat');
    await click('.window__close');
    expect(dockIds()).toEqual(['dock-chat', 'dock-settings']);
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
    expect(element.querySelectorAll('.project-card')).toHaveLength(PROJECTS.length);
    await click('.project-filters button:last-child');
    expect(element.querySelectorAll('.project-card')).toHaveLength(1);
    expect(element.querySelector('.project-card h4')?.textContent).toContain('Kusa');
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
    root.querySelector<HTMLButtonElement>('[data-filter="backend"]')!.click();
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

  it('returns to the mobile desktop after closing each full-screen folder', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const manager = TestBed.inject(WindowManager);
    manager.setWorkspace({ x: 0, y: 0, width: 390, height: 844 }, false, true);
    const root = fixture.nativeElement as HTMLElement;
    const click = async (selector: string) => {
      root.querySelector<HTMLButtonElement>(selector)!.click();
      fixture.detectChanges();
      await fixture.whenStable();
    };
    await click('[data-window-id="projects"]');
    expect(root.querySelector('.desktop')?.classList.contains('desktop--mobile-folder')).toBe(true);
    expect(root.querySelector('.window__minimize')).toBeNull();
    await click('.window__close');
    expect(root.querySelector('.desktop')?.classList.contains('desktop--mobile-folder')).toBe(
      false,
    );
    await click('[data-window-id="experiences"]');
    expect(root.querySelector('.experience-list')).not.toBeNull();
    await click('.window__close');
    expect(
      Object.values(manager.windows()).filter((state) => state.status === 'open'),
    ).toHaveLength(0);
  });
  it('does not reveal the previous mobile folder when an internal destination is closed', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const manager = TestBed.inject(WindowManager);
    manager.setWorkspace({ x: 0, y: 0, width: 390, height: 844 }, false, true);
    const root = fixture.nativeElement as HTMLElement;
    manager.open('about');
    fixture.detectChanges();
    await fixture.whenStable();
    root.querySelector<HTMLButtonElement>('.text-button')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(manager.windows().about.status).toBe('minimized');
    expect(manager.windows().contact.status).toBe('open');
    root
      .querySelector<HTMLButtonElement>('app-desktop-window:not(.is-minimized) .window__close')!
      .click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(root.querySelector('.desktop')?.classList.contains('desktop--mobile-folder')).toBe(
      false,
    );
    manager.open('about');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(manager.windows().about.status).toBe('open');
  });
  it('remeasures current chrome and ignores hidden chrome without collapsing windows', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const manager = TestBed.inject(WindowManager);
    manager.setWorkspace({ x: 12, y: 58, width: 1000, height: 600 }, true);
    manager.open('projects');
    const original = manager.windows().projects.rect;
    document.dispatchEvent(new Event('fullscreenchange'));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    expect(manager.windows().projects.rect).toEqual(original);
    const root = fixture.nativeElement as HTMLElement;
    for (const selector of ['.menu-bar', '.dock']) {
      const previous = root.querySelector<HTMLElement>(selector)!;
      const replacement = previous.cloneNode(true) as HTMLElement;
      Object.defineProperties(replacement, {
        offsetHeight: { value: selector === '.menu-bar' ? 46 : 69 },
        offsetTop: { value: selector === '.menu-bar' ? 0 : 700 },
      });
      previous.replaceWith(replacement);
    }
    document.dispatchEvent(new Event('fullscreenchange'));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    expect(manager.area().y).toBe(58);
    expect(manager.area().height).toBe(630);
    expect(manager.windows().projects.rect.height).toBeGreaterThanOrEqual(220);
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
    expect(element.querySelectorAll('app-desktop-window')).toHaveLength(7);
    expect(element.querySelectorAll('.skill-group')).toHaveLength(SKILLS.length);
    expect(element.querySelectorAll('.experience-item')).toHaveLength(3);
    expect(element.textContent).toContain('Freemo');
    for (const section of ['À propos', 'Contact']) {
      const panel = element.querySelector(`.window[aria-label="${section}"]`)!;
      for (const [network, href] of Object.entries(SOCIAL_PROFILES)) {
        const link = panel.querySelector<HTMLAnchorElement>(`app-social-links a[href="${href}"]`);
        expect(link, network).not.toBeNull();
        expect(link!.target).toBe('_blank');
        expect(link!.rel).toContain('noopener');
        expect(link!.querySelector('app-icon')).not.toBeNull();
      }
    }
    expect(element.querySelector<HTMLAnchorElement>('.email-block a')?.getAttribute('href')).toBe(
      'mailto:' + PROFILE.email,
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
    TestBed.configureTestingModule({
      imports: [App],
      deferBlockBehavior: DeferBlockBehavior.Playthrough,
    });
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
