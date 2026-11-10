import {
  afterNextRender,
  Component,
  computed,
  effect,
  untracked,
  DestroyRef,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { SocialLinks } from './components/social-links/social-links';
import { BrandMark } from './components/brand-mark/brand-mark';
import { gsap } from 'gsap';
import { DesktopWindow } from './components/desktop-window/desktop-window';
import { AppIcon, IconName } from './components/app-icon/app-icon';
import { WindowContent } from './components/window-content/window-content';
import { APPLICATIONS, PROFILE, WindowId, WindowStatus } from './data/portfolio';
import { WindowManager } from './windows/window-manager';
import { WindowOverlays } from './components/window-overlays/window-overlays';
import { PreferencesStore, Theme } from './settings/preferences';

@Component({
  selector: 'app-root',
  imports: [DesktopWindow, AppIcon, WindowContent, WindowOverlays, BrandMark, SocialLinks],
  templateUrl: './app.html',
  styleUrls: ['./app.scss', './app-interactions.scss'],
})
export class App {
  protected readonly themes: readonly { value: Theme; label: string; icon: IconName }[] = [
    { value: 'light', label: 'Thème clair', icon: 'sun' },
    { value: 'dark', label: 'Thème sombre', icon: 'moon' },
    { value: 'system', label: 'Thème du système', icon: 'system' },
  ];
  protected readonly profile = PROFILE;
  protected readonly applications = APPLICATIONS;
  protected readonly currentTime = signal(this.formatTime());
  protected readonly settings = inject(PreferencesStore);
  protected readonly manager = inject(WindowManager);
  protected readonly windows = this.manager.windows;
  protected readonly dockApplications = computed(() =>
    this.applications.filter(
      (app) =>
        app.id === 'chat' || app.id === 'settings' || this.windows()[app.id].status !== 'closed',
    ),
  );
  protected readonly foregroundWindow = computed(() => {
    let foreground: WindowId | null = null;
    for (const app of this.applications) {
      const state = this.windows()[app.id];
      if (
        state.status === 'open' &&
        (foreground === null || state.layer > this.windows()[foreground].layer)
      )
        foreground = app.id;
    }
    return foreground;
  });
  protected readonly activeWindow = computed(() =>
    Object.values(this.windows()).some((item) => item.status === 'open'),
  );
  protected readonly immersive = signal(false);
  protected readonly fullscreenActive = signal(false);
  protected readonly enteringImmersive = signal(false);
  protected readonly immersiveNotice = signal('');
  private focusFrame?: number;
  private introduction?: gsap.core.Timeline;
  private immersionContext?: gsap.Context;
  private immersionTimeline?: gsap.core.Timeline;
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    effect(() => {
      if (this.settings.reducedMotion())
        untracked(() => {
          this.introduction?.progress(1).pause();
          this.immersionTimeline?.progress(1).pause();
        });
    });
    afterNextRender(() => {
      const root = this.host.nativeElement;
      const desktop = root.querySelector<HTMLElement>('.desktop');
      const onFullscreenChange = () => {
        const active = document.fullscreenElement === desktop;
        const wasActive = this.fullscreenActive();
        this.fullscreenActive.set(active);
        if (wasActive && !active) this.finishImmersive();
        schedule();
      };
      const onEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && this.immersive() && !this.enteringImmersive())
          void this.exitImmersive();
      };
      document.addEventListener('fullscreenchange', onFullscreenChange);
      document.addEventListener('keydown', onEscape);
      this.destroyRef.onDestroy(() => {
        document.removeEventListener('fullscreenchange', onFullscreenChange);
        document.removeEventListener('keydown', onEscape);
        if (this.focusFrame !== undefined) cancelAnimationFrame(this.focusFrame);
        this.immersionContext?.revert();
      });
      let frame = 0;
      const measure = () => {
        const mobile = innerWidth <= 600;
        // Relire les éléments courants : le rechargement à chaud peut remplacer le template.
        const bar = root.querySelector<HTMLElement>('.menu-bar');
        const dock = root.querySelector<HTMLElement>('.dock');
        // Ne pas borner les fenêtres sur une mesure transitoire de chrome masqué/détaché.
        if (!mobile && (!bar?.offsetHeight || !dock?.offsetHeight)) return;
        const barBottom = bar ? bar.offsetTop + bar.offsetHeight : 46;
        const dockTop = dock ? dock.offsetTop : innerHeight - 90;
        if (!mobile && dockTop - barBottom <= 24) return;
        this.manager.setWorkspace(
          mobile
            ? { x: 0, y: 0, width: innerWidth, height: innerHeight }
            : {
                x: 12,
                y: barBottom + 12,
                width: Math.max(1, innerWidth - 24),
                height: Math.max(1, dockTop - 12 - barBottom - 12),
              },
          !mobile && matchMedia('(pointer: fine)').matches,
          mobile,
        );
      };
      const schedule = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(measure);
      };
      const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
      observer?.observe(root);
      for (const chrome of root.querySelectorAll('.menu-bar, .dock')) observer?.observe(chrome);
      window.addEventListener('resize', schedule);
      measure();
      this.destroyRef.onDestroy(() => {
        observer?.disconnect();
        window.removeEventListener('resize', schedule);
        cancelAnimationFrame(frame);
      });
      const clock = window.setInterval(() => this.currentTime.set(this.formatTime()), 1000);
      const media = gsap.matchMedia();
      media.add(
        '(prefers-reduced-motion: no-preference)',
        () => {
          if (this.settings.reducedMotion()) return;
          this.introduction = gsap
            .timeline({ defaults: { ease: 'power3.out' } })
            .from('.menu-bar', { y: -12, opacity: 0, duration: 0.6 })
            .from('.hero__line', { y: 35, opacity: 0, stagger: 0.09, duration: 0.8 }, '-=0.3')
            .from('.desktop-icon', { y: 16, opacity: 0, stagger: 0.07, duration: 0.5 }, '-=0.5')
            .from('.dock', { y: 30, opacity: 0, duration: 0.65 }, '-=0.4');
        },
        this.host.nativeElement,
      );
      this.destroyRef.onDestroy(() => {
        clearInterval(clock);
        media.revert();
      });
    });
  }
  protected async enterImmersive(): Promise<void> {
    if (this.immersive() || this.enteringImmersive()) return;
    const desktop = this.host.nativeElement.querySelector<HTMLElement>('.desktop');
    if (!desktop) return;
    this.enteringImmersive.set(true);
    this.immersiveNotice.set('');
    this.manager.dismissPanels();
    this.introduction?.progress(1).pause();
    this.immersive.set(true);
    this.immersionContext?.revert();
    if (!this.settings.reducedMotion()) {
      this.immersionContext = gsap.context(() => {
        this.immersionTimeline = gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .fromTo(
            '.desktop-icon',
            { y: 12, opacity: 0.35 },
            { y: 0, opacity: 1, stagger: 0.06, duration: 0.45, clearProps: 'transform,opacity' },
          )
          .fromTo(
            '.dock',
            { opacity: 0.25 },
            { opacity: 1, duration: 0.5, clearProps: 'opacity' },
            0,
          );
      }, this.host.nativeElement);
    }
    try {
      // Appel direct depuis le clic : le navigateur exige une activation utilisateur.
      if (!desktop.requestFullscreen || document.fullscreenEnabled === false) {
        this.immersiveNotice.set(
          'Le plein écran n’est pas disponible ici. Le bureau reste accessible dans la page.',
        );
      } else {
        await desktop.requestFullscreen({ navigationUI: 'hide' });
        if (!this.destroyRef.destroyed)
          this.fullscreenActive.set(document.fullscreenElement === desktop);
      }
    } catch {
      if (!this.destroyRef.destroyed)
        this.immersiveNotice.set(
          'Le plein écran a été refusé. Vous pouvez explorer le bureau dans la page.',
        );
    } finally {
      if (!this.destroyRef.destroyed) this.enteringImmersive.set(false);
    }
  }
  protected async exitImmersive(): Promise<void> {
    const desktop = this.host.nativeElement.querySelector('.desktop');
    try {
      if (document.fullscreenElement === desktop && document.exitFullscreen)
        await document.exitFullscreen();
      if (!this.destroyRef.destroyed) this.finishImmersive();
    } catch {
      if (!this.destroyRef.destroyed && this.immersive())
        this.immersiveNotice.set(
          'Utilisez la commande de votre navigateur pour quitter le plein écran.',
        );
    }
  }
  private finishImmersive(): void {
    this.immersive.set(false);
    this.fullscreenActive.set(false);
    this.immersiveNotice.set('');
    this.manager.dismissPanels();
  }
  protected dismissMenu(event: PointerEvent): void {
    if (
      event.target instanceof Element &&
      !event.target.closest('.snap-menu, .window__maximize, .window__layouts')
    )
      this.manager.menu.set(null);
  }
  protected open(id: WindowId): void {
    this.manager.open(id);
  }
  protected setStatus(id: WindowId, status: WindowStatus): void {
    this.manager.setStatus(id, status);
    if (this.manager.mobile() && status === 'closed') {
      if (this.focusFrame !== undefined) cancelAnimationFrame(this.focusFrame);
      this.focusFrame = requestAnimationFrame(() => {
        if (!this.activeWindow() && this.manager.mobile())
          this.host.nativeElement
            .querySelector<HTMLButtonElement>(`.desktop-icon[data-window-id="${id}"]`)
            ?.focus({ preventScroll: true });
      });
    }
  }
  protected bringToFront(id: WindowId): void {
    this.manager.activate(id);
  }
  private formatTime(): string {
    return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(
      new Date(),
    );
  }
}
