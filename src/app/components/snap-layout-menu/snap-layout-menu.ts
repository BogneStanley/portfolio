import { Component, computed, inject } from '@angular/core';
import { WindowManager } from '../../windows/window-manager';
@Component({
  selector: 'app-snap-layout-menu',
  template: `@if (manager.menu(); as id) {
    <section
      class="snap-menu"
      aria-label="Dispositions des fenêtres"
      [style.left.px]="position().x"
      [style.top.px]="position().y"
      (pointerleave)="manager.menu.set(null)"
    >
      <p>Organiser les fenêtres</p>
      <div class="layouts">
        @for (layout of manager.layouts(); track layout.id) {
          <div
            class="layout"
            role="group"
            [attr.aria-label]="layout.label"
            [style.grid-template-columns]="tracks(layout.columns)"
            [style.grid-template-rows]="tracks(layout.rows)"
          >
            @for (zone of layout.zones; track zone.id) {
              <button
                type="button"
                [attr.aria-label]="
                  layout.label + ', zone ' + (zone.row + 1) + ' / ' + (zone.column + 1)
                "
                (click)="manager.snap(id, layout.id, zone.id)"
              ></button>
            }
          </div>
        } @empty {
          <span>Espace insuffisant pour une disposition.</span>
        }
      </div>
    </section>
  }`,
  styles: `
    :host {
      display: contents;
    }
    .snap-menu {
      position: absolute;
      z-index: 2147483003;
      width: 290px;
      padding: 16px;
      background: var(--surface-strong);
      border: 1px solid var(--control-line);
      border-radius: 10px;
      box-shadow: 0 16px 40px var(--shadow);
      pointer-events: auto;
      color: var(--text);
    }
    p {
      font-size: calc((11px) * var(--text-scale));
      margin: 0 0 14px;
    }
    .layouts {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }
    .layout {
      display: grid;
      gap: 4px;
      height: 52px;
    }
    button {
      min-width: 0;
      background: var(--surface-hover);
      border: 1px solid var(--control-line);
      border-radius: 3px;
      cursor: pointer;
    }
    button:hover,
    button:focus-visible {
      background: var(--accent);
    }
    span {
      font-size: calc((11px) * var(--text-scale));
    }
  `,
})
export class SnapLayoutMenu {
  protected readonly manager = inject(WindowManager);
  protected readonly position = computed(() => {
    const id = this.manager.menu(),
      area = this.manager.area();
    const rect = id ? this.manager.windows()[id].rect : area;
    return {
      x: Math.max(area.x, Math.min(area.x + area.width - 290, rect.x + rect.width - 300)),
      y: Math.min(rect.y + 48, area.y + area.height - 200),
    };
  });
  protected tracks(cuts: number[]): string {
    return cuts
      .slice(1)
      .map((cut, i) => `${cut - cuts[i]}fr`)
      .join(' ');
  }
}
