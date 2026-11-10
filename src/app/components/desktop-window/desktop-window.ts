import {
  afterRenderEffect,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { gsap } from 'gsap';
import { AppIcon } from '../app-icon/app-icon';
import { WindowId } from '../../data/portfolio';
interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  initialX: number;
  initialY: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}
@Component({
  selector: 'app-desktop-window',
  imports: [AppIcon],
  templateUrl: './desktop-window.html',
  styleUrl: './desktop-window.scss',
  host: { '[class.is-minimized]': 'minimized()' },
})
export class DesktopWindow {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly windowId = input<WindowId>('projects');
  readonly layer = input(1);
  readonly top = input(84);
  readonly offsetX = input(0);
  readonly minimized = input(false);
  readonly closed = output<void>();
  readonly reduced = output<void>();
  readonly activated = output<void>();
  protected readonly dragX = signal(0);
  protected readonly dragY = signal(0);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private context?: gsap.Context;
  private animation?: gsap.core.Timeline;
  private actionAnimation?: gsap.core.Tween;
  private busy = false;
  private drag: DragState | null = null;

  constructor() {
    // Rejoue l'entrée à l'ouverture et à la restauration, sans perdre la position.
    afterRenderEffect(() => {
      const minimized = this.minimized();
      if (minimized) return;
      this.actionAnimation?.kill();
      this.context?.revert();
      this.busy = false;
      const panel = this.host.nativeElement.querySelector('.window');
      if (panel) gsap.set(panel, { clearProps: 'transform,opacity' });
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      this.context = gsap.context(() => {
        this.animation = gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .fromTo(
            '.window',
            { opacity: 0, y: 18, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.48 },
          )
          .from('.window__content', { opacity: 0, y: 10, duration: 0.35 }, '-=.24');
      }, this.host.nativeElement);
    });
    this.destroyRef.onDestroy(() => {
      this.actionAnimation?.kill();
      this.context?.revert();
    });
  }
  protected close(): void {
    this.dismiss('close');
  }
  protected minimize(): void {
    this.dismiss('minimize');
  }
  private dismiss(action: 'close' | 'minimize'): void {
    if (this.busy) return;
    this.busy = true;
    this.animation?.progress(1).pause();
    const finish = () => {
      if (action === 'close') this.closed.emit();
      else this.reduced.emit();
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }
    const panel = this.host.nativeElement.querySelector<HTMLElement>('.window');
    if (!panel) {
      finish();
      return;
    }
    const dock = document.getElementById('dock-' + this.windowId());
    const rect = panel.getBoundingClientRect();
    const target = dock?.getBoundingClientRect();
    this.actionAnimation = gsap.to(panel, {
      opacity: 0,
      scale: action === 'minimize' ? 0.2 : 0.97,
      x:
        action === 'minimize' && target
          ? target.left + target.width / 2 - (rect.left + rect.width / 2)
          : 0,
      y:
        action === 'minimize' && target
          ? target.top + target.height / 2 - (rect.top + rect.height / 2)
          : 12,
      duration: action === 'minimize' ? 0.38 : 0.22,
      ease: 'power2.inOut',
      onComplete: finish,
    });
  }
  protected startDrag(event: PointerEvent): void {
    if (this.busy || event.button !== 0 || matchMedia('(max-width: 600px)').matches) return;
    if (event.target instanceof Element && event.target.closest('button')) return;
    const header = event.currentTarget as HTMLElement;
    const panel = header.closest<HTMLElement>('.window');
    if (!panel) return;
    this.animation?.progress(1);
    const rect = panel.getBoundingClientRect();
    this.drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      initialX: this.dragX(),
      initialY: this.dragY(),
      minX: 12 - rect.left,
      maxX: innerWidth - 12 - rect.right,
      minY: 52 - rect.top,
      maxY: innerHeight - 150 - rect.top,
    };
    header.setPointerCapture(event.pointerId);
  }
  protected moveDrag(event: PointerEvent): void {
    const drag = this.drag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    this.dragX.set(
      drag.initialX + Math.max(drag.minX, Math.min(drag.maxX, event.clientX - drag.startX)),
    );
    this.dragY.set(
      drag.initialY + Math.max(drag.minY, Math.min(drag.maxY, event.clientY - drag.startY)),
    );
  }
  protected endDrag(event: PointerEvent): void {
    if (this.drag?.pointerId !== event.pointerId) return;
    this.drag = null;
    const header = event.currentTarget as HTMLElement;
    if (header.hasPointerCapture(event.pointerId)) header.releasePointerCapture(event.pointerId);
  }
}
