import { Component, DestroyRef, inject } from '@angular/core';
import { WindowManager } from '../../windows/window-manager';
import { AppIcon } from '../app-icon/app-icon';
import { SnapLayoutMenu } from '../snap-layout-menu/snap-layout-menu';
@Component({
  selector: 'app-window-overlays',
  imports: [AppIcon, SnapLayoutMenu],
  templateUrl: './window-overlays.html',
  styleUrl: './window-overlays.scss',
})
export class WindowOverlays {
  protected readonly manager = inject(WindowManager);
  private pointerId: number | null = null;
  constructor() {
    inject(DestroyRef).onDestroy(() => {
      if (this.pointerId !== null) this.manager.cancel();
    });
  }
  protected start(event: PointerEvent, axis: 'columns' | 'rows', index: number): void {
    if (event.button !== 0 || event.pointerType === 'touch' || this.pointerId !== null) return;
    event.preventDefault();
    this.pointerId = event.pointerId;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.manager.startSeparator(axis, index);
  }
  protected move(event: PointerEvent): void {
    if (event.pointerId === this.pointerId)
      this.manager.moveSeparator(event.clientX, event.clientY);
  }
  protected end(event: PointerEvent, cancel = false): void {
    if (event.pointerId !== this.pointerId) return;
    this.pointerId = null;
    if (cancel) this.manager.cancel();
    else this.manager.finishSeparator();
    const element = event.currentTarget as HTMLElement;
    if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
  }
}
