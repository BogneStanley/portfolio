import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { gsap } from 'gsap';
import { DesktopWindow } from './components/desktop-window/desktop-window';
import { AppIcon } from './components/app-icon/app-icon';
import { WindowContent } from './components/window-content/window-content';
import { APPLICATIONS, PROFILE, WindowId, WindowStatus } from './data/portfolio';

interface WindowState {
  status: WindowStatus;
  layer: number;
}
@Component({
  selector: 'app-root',
  imports: [DesktopWindow, AppIcon, WindowContent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly profile = PROFILE;
  protected readonly applications = APPLICATIONS;
  protected readonly currentTime = signal(this.formatTime());
  protected readonly windows = signal<Record<WindowId, WindowState>>({
    projects: { status: 'closed', layer: 1 },
    about: { status: 'closed', layer: 2 },
    skills: { status: 'closed', layer: 3 },
    contact: { status: 'closed', layer: 4 },
  });
  protected readonly activeWindow = computed(() =>
    Object.values(this.windows()).some((item) => item.status === 'open'),
  );
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private highestLayer = 4;

  constructor() {
    afterNextRender(() => {
      const clock = window.setInterval(() => this.currentTime.set(this.formatTime()), 1000);
      const media = gsap.matchMedia();
      media.add(
        '(prefers-reduced-motion: no-preference)',
        () => {
          gsap
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
  protected open(id: WindowId): void {
    this.highestLayer += 1;
    this.windows.update((current) => ({
      ...current,
      [id]: { status: 'open', layer: this.highestLayer },
    }));
  }
  protected setStatus(id: WindowId, status: WindowStatus): void {
    this.windows.update((current) => ({ ...current, [id]: { ...current[id], status } }));
  }
  protected bringToFront(id: WindowId): void {
    if (this.windows()[id].layer === this.highestLayer) return;
    this.highestLayer += 1;
    this.windows.update((current) => ({
      ...current,
      [id]: { ...current[id], layer: this.highestLayer },
    }));
  }
  private formatTime(): string {
    return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(
      new Date(),
    );
  }
}
