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
import { WindowManager } from './windows/window-manager';
import { WindowOverlays } from './components/window-overlays/window-overlays';

@Component({
  selector: 'app-root',
  imports: [DesktopWindow, AppIcon, WindowContent, WindowOverlays],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly profile = PROFILE;
  protected readonly applications = APPLICATIONS;
  protected readonly currentTime = signal(this.formatTime());
  protected readonly manager = inject(WindowManager);
  protected readonly windows = this.manager.windows;
  protected readonly activeWindow = computed(() =>
    Object.values(this.windows()).some((item) => item.status === 'open'),
  );
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterNextRender(() => {
      const root = this.host.nativeElement;
      const bar = root.querySelector<HTMLElement>('.menu-bar');
      const dock = root.querySelector<HTMLElement>('.dock');
      let frame = 0;
      const measure = () => {
        const barBottom = bar ? bar.offsetTop + bar.offsetHeight : 46;
        const dockTop = dock ? dock.offsetTop : innerHeight - 90;
        this.manager.setWorkspace(
          {
            x: 12,
            y: barBottom + 12,
            width: Math.max(1, innerWidth - 24),
            height: Math.max(1, dockTop - 12 - barBottom - 12),
          },
          innerWidth > 600 && matchMedia('(pointer: fine)').matches,
        );
      };
      const schedule = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(measure);
      };
      const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
      if (bar) observer?.observe(bar);
      if (dock) observer?.observe(dock);
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
