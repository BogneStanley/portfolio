import {
  afterRenderEffect,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  computed,
  effect,
  untracked,
} from '@angular/core';
import { gsap } from 'gsap';
import { AppIcon } from '../app-icon/app-icon';
import { WindowId } from '../../data/portfolio';
import { WindowManager } from '../../windows/window-manager';
import { ResizeEdge, WindowRect } from '../../windows/window-geometry';
import { PreferencesStore } from '../../settings/preferences';
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
  readonly minimized = input(false);
  readonly closed = output<void>();
  readonly reduced = output<void>();
  readonly activated = output<void>();
  private readonly preferences = inject(PreferencesStore);
  protected readonly manager = inject(WindowManager);
  protected readonly state = computed(() => this.manager.windows()[this.windowId()]);
  protected readonly rect = computed(() => this.state().rect);
  protected readonly edges: ResizeEdge[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private context?: gsap.Context;
  private animation?: gsap.core.Timeline;
  private actionAnimation?: gsap.core.Tween;
  private placementAnimation?: gsap.core.Tween;
  private previousRect?: WindowRect;
  private busy = false;
  private pointerId: number | null = null;
  private hoverTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      if (this.preferences.reducedMotion())
        untracked(() => {
          this.animation?.progress(1).pause();
          this.placementAnimation?.progress(1).pause();
          this.actionAnimation?.progress(1).pause();
        });
    });
    // Rejoue l'entrée à l'ouverture et à la restauration, sans perdre la position.
    afterRenderEffect(() => {
      const minimized = this.minimized();
      if (minimized) return;
      this.actionAnimation?.kill();
      this.context?.revert();
      this.busy = false;
      const panel = this.host.nativeElement.querySelector('.window');
      if (untracked(() => this.manager.mobile()))
        panel?.querySelector<HTMLButtonElement>('.window__close')?.focus({ preventScroll: true });
      if (panel) gsap.set(panel, { clearProps: 'transform,opacity' });
      if (untracked(() => this.preferences.reducedMotion())) return;
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
    afterRenderEffect(() => {
      const rect = this.rect();
      const previous = this.previousRect;
      this.previousRect = rect;
      if (
        !previous ||
        ![this.windowId(), 'group'].includes(untracked(() => this.manager.transitionId()) ?? '') ||
        untracked(() => this.manager.interacting()) ||
        untracked(() => this.preferences.reducedMotion())
      )
        return;
      const panel = this.host.nativeElement.querySelector('.window');
      this.animation?.progress(1).pause();
      this.placementAnimation?.kill();
      if (panel)
        this.placementAnimation = gsap.fromTo(
          panel,
          {
            x: previous.x - rect.x,
            y: previous.y - rect.y,
            scaleX: previous.width / rect.width,
            scaleY: previous.height / rect.height,
            transformOrigin: '0 0',
          },
          {
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            duration: 0.2,
            ease: 'power2.out',
            clearProps: 'transform,transformOrigin',
          },
        );
    });
    this.destroyRef.onDestroy(() => {
      this.actionAnimation?.kill();
      this.placementAnimation?.kill();
      clearTimeout(this.hoverTimer);
      if (this.pointerId !== null) this.manager.cancel();
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
    this.cancelMenuTimer();
    this.manager.dismissPanels();
    this.finishAnimations();
    const finish = () => {
      if (action === 'close') this.closed.emit();
      else this.reduced.emit();
    };
    if (untracked(() => this.preferences.reducedMotion())) {
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
  protected toggleMaximize(): void {
    this.cancelMenuTimer();
    this.finishAnimations();
    this.manager.toggleMaximize(this.windowId());
  }
  protected doubleClick(event: MouseEvent): void {
    if (!(event.target instanceof Element && event.target.closest('button'))) this.toggleMaximize();
  }
  protected scheduleMenu(): void {
    this.cancelMenuTimer();
    this.hoverTimer = setTimeout(() => {
      this.manager.assist.set(false);
      this.manager.menu.set(this.windowId());
    }, 350);
  }
  protected cancelMenuTimer(): void {
    clearTimeout(this.hoverTimer);
  }
  protected toggleMenu(): void {
    this.cancelMenuTimer();
    this.manager.assist.set(false);
    this.manager.menu.set(this.manager.menu() === this.windowId() ? null : this.windowId());
  }
  private finishAnimations(): void {
    this.animation?.progress(1).pause();
    this.placementAnimation?.kill();
    const panel = this.host.nativeElement.querySelector('.window');
    if (panel) gsap.set(panel, { clearProps: 'transform,transformOrigin' });
  }
  protected startDrag(event: PointerEvent): void {
    this.startGesture(event, 'move');
  }
  protected startResize(event: PointerEvent, edge: ResizeEdge): void {
    if (this.manager.sharedEdge(this.windowId(), edge)) return;
    event.stopPropagation();
    this.startGesture(event, edge);
  }
  private startGesture(event: PointerEvent, kind: 'move' | ResizeEdge): void {
    if (
      this.pointerId !== null ||
      this.busy ||
      event.button !== 0 ||
      event.pointerType === 'touch' ||
      !this.manager.desktop()
    )
      return;
    if (kind === 'move' && event.target instanceof Element && event.target.closest('button'))
      return;
    event.preventDefault();
    this.cancelMenuTimer();
    this.finishAnimations();
    this.pointerId = event.pointerId;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.manager.start(this.windowId(), kind, event.clientX, event.clientY);
  }
  protected moveDrag(event: PointerEvent): void {
    if (event.pointerId === this.pointerId) this.manager.move(event.clientX, event.clientY);
  }
  protected endDrag(event: PointerEvent, cancel = false): void {
    if (event.pointerId !== this.pointerId) return;
    this.pointerId = null;
    if (cancel) this.manager.cancel();
    else this.manager.finish();
    const element = event.currentTarget as HTMLElement;
    if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
  }
}
