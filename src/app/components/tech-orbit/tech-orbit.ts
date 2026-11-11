import { NgOptimizedImage } from '@angular/common';
import { afterNextRender, Component, DestroyRef, ElementRef, effect, inject } from '@angular/core';
import { gsap } from 'gsap';
import { PreferencesStore } from '../../settings/preferences';

@Component({
  selector: 'app-tech-orbit',
  imports: [NgOptimizedImage],
  templateUrl: './tech-orbit.html',
  styleUrl: './tech-orbit.scss',
  host: {
    'aria-hidden': 'true',
    '[class.motion-reduced]': 'preferences.reducedMotion()',
    '(pointermove)': 'move($event)',
    '(pointerleave)': 'reset()',
    '(pointercancel)': 'reset()',
  },
})
export class TechOrbit {
  protected readonly preferences = inject(PreferencesStore);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private movers: { x: (value: number) => void; y: (value: number) => void }[] = [];
  protected readonly technologies = [
    { id: 'angular', label: 'Angular', x: 28, y: 15 },
    { id: 'flutter', label: 'Flutter', x: 70, y: 13 },
    { id: 'java', label: 'Java', x: 89, y: 42 },
    { id: 'spring', label: 'Spring Boot', x: 72, y: 76 },
    { id: 'docker', label: 'Docker', x: 34, y: 88 },
    { id: 'figma', label: 'Figma', x: 9, y: 63 },
    { id: 'typescript', label: 'TypeScript', x: 7, y: 30 },
    { id: 'git', label: 'Git', x: 48, y: 47 },
  ];

  constructor() {
    effect(() => {
      if (this.preferences.reducedMotion()) this.reset();
    });
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const elements = this.host.nativeElement.querySelectorAll<HTMLElement>('.tech-motion');
      this.movers = Array.from(elements, (element) => ({
        x: gsap.quickTo(element, 'x', { duration: 0.6, ease: 'power3.out' }),
        y: gsap.quickTo(element, 'y', { duration: 0.6, ease: 'power3.out' }),
      }));
      destroyRef.onDestroy(() => {
        gsap.killTweensOf(elements);
        this.movers = [];
      });
    });
  }

  protected move(event: PointerEvent): void {
    if (event.pointerType === 'touch' || this.preferences.reducedMotion()) return;
    const rect = this.host.nativeElement.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    this.technologies.forEach((technology, index) => {
      const dx = (technology.x / 100) * rect.width - pointerX;
      const dy = (technology.y / 100) * rect.height - pointerY;
      const distance = Math.hypot(dx, dy);
      const force = Math.max(0, 1 - distance / 190) * 28;
      const mover = this.movers[index];
      mover?.x((dx / Math.max(distance, 1)) * force);
      mover?.y((dy / Math.max(distance, 1)) * force);
    });
  }

  protected reset(): void {
    if (this.preferences.reducedMotion()) {
      gsap.set(this.host.nativeElement.querySelectorAll('.tech-motion'), {
        x: 0,
        y: 0,
        overwrite: true,
      });
      return;
    }
    this.movers.forEach((mover) => {
      mover.x(0);
      mover.y(0);
    });
  }
}
