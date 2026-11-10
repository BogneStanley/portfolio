import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'app-desktop-window',
  imports: [],
  templateUrl: './desktop-window.html',
  styleUrl: './desktop-window.scss',
})
export class DesktopWindow {
  readonly title = input.required<string>();
  readonly closed = output<void>();
  readonly layer = input(1);
  readonly top = input(110);
  readonly offsetX = input(0);
  protected readonly dragX = signal(0);
  protected readonly dragY = signal(0);

  readonly activated = output<void>();

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  private animation?: gsap.core.Timeline;
  private closing = false;

  private drag: {
    pointerId: number;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } | null = null;

  constructor() {
    afterNextRender(() => {
      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      if (reduceMotion) {
        return;
      }

      const context = gsap.context(() => {
        this.animation = gsap.timeline({
          defaults: {
            ease: 'power3.out',
          },
          onReverseComplete: () => this.closed.emit(),
        });

        this.animation.from('.window', {
          opacity: 0,
          y: 24,
          scale: 0.96,
          duration: 0.5,
        });

        this.animation.from(
          '.project-card, .about',
          {
            opacity: 0,
            y: 16,
            duration: 0.4,
            stagger: 0.15,
          },
          '-=0.2',
        );
      }, this.host.nativeElement);

      this.destroyRef.onDestroy(() => context.revert());
    });
  }

  protected close(): void {
    if (this.closing) {
      return;
    }

    this.closing = true;

    if (!this.animation) {
      this.closed.emit();
      return;
    }

    this.animation.timeScale(1.5).reverse();
  }


  protected startDrag(event: PointerEvent): void {
    if (
      event.button !== 0 ||
      window.matchMedia('(max-width: 600px)').matches
    ) {
      return;
    }

    const target = event.target;

    // Le bouton de fermeture doit conserver son fonctionnement.
    if (target instanceof Element && target.closest('button')) {
      return;
    }

    const header = event.currentTarget as HTMLElement;
    const windowElement = header.closest<HTMLElement>('.window');

    if (!windowElement) {
      return;
    }

    // Termine l'ouverture pour mesurer la position finale.
    this.animation?.progress(1);

    const rect = windowElement.getBoundingClientRect();

    this.drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      initialX: this.dragX(),
      initialY: this.dragY(),

      // Limites de déplacement depuis la position actuelle.
      minX: 16 - rect.left,
      maxX: window.innerWidth - 16 - rect.right,
      minY: 48 - rect.top,
      maxY: window.innerHeight - 120 - rect.top,
    };

    header.setPointerCapture(event.pointerId);
  }

  protected moveDrag(event: PointerEvent): void {
    const drag = this.drag;

    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;

    const boundedX = Math.max(
      drag.minX,
      Math.min(drag.maxX, deltaX),
    );

    const boundedY = Math.max(
      drag.minY,
      Math.min(drag.maxY, deltaY),
    );

    this.dragX.set(drag.initialX + boundedX);
    this.dragY.set(drag.initialY + boundedY);
  }

  protected endDrag(event: PointerEvent): void {
    if (this.drag?.pointerId !== event.pointerId) {
      return;
    }

    this.drag = null;

    const header = event.currentTarget as HTMLElement;

    if (header.hasPointerCapture(event.pointerId)) {
      header.releasePointerCapture(event.pointerId);
    }
  }


}