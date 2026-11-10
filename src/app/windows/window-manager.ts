import { computed, Service, signal } from '@angular/core';
import { APPLICATIONS, WindowId, WindowStatus } from '../data/portfolio';
import {
  clampRect,
  fits,
  GAP,
  MIN_HEIGHT,
  MIN_WIDTH,
  ResizeEdge,
  resizedRect,
  SNAP_LAYOUTS,
  SnapLayout,
  SnapTarget,
  snapTarget,
  WindowPresentation,
  WindowRect,
  zoneRect,
} from './window-geometry';
export interface ManagedWindow {
  status: WindowStatus;
  layer: number;
  presentation: WindowPresentation;
  rect: WindowRect;
  freeRect: WindowRect;
  placement: SnapTarget | null;
}
type Windows = Record<WindowId, ManagedWindow>;
interface Group {
  layout: SnapLayout;
  occupants: Partial<Record<string, WindowId>>;
}
interface Snapshot {
  windows: Windows;
  group: Group | null;
}
interface Gesture {
  id: WindowId;
  kind: 'move' | ResizeEdge;
  startX: number;
  startY: number;
  rect: WindowRect;
  snapshot: Snapshot;
  moved: boolean;
}
interface SeparatorGesture {
  axis: 'columns' | 'rows';
  index: number;
  snapshot: Snapshot;
}
@Service()
export class WindowManager {
  readonly area = signal<WindowRect>({ x: 12, y: 58, width: 1256, height: 620 });
  readonly desktop = signal(true);
  readonly windows = signal<Windows>(
    Object.fromEntries(
      APPLICATIONS.map((app, index) => {
        const rect = {
          x: 280 + index * 24,
          y: 84 + index * 24,
          width: app.id === 'projects' ? 670 : 510,
          height: 540,
        };
        return [
          app.id,
          {
            status: 'closed',
            layer: index + 1,
            presentation: 'free',
            rect,
            freeRect: rect,
            placement: null,
          },
        ];
      }),
    ) as Windows,
  );
  readonly group = signal<Group | null>(null);
  readonly preview = signal<WindowRect | null>(null);
  readonly assist = signal(false);
  readonly menu = signal<WindowId | null>(null);
  readonly interacting = signal(false);
  readonly previewLayer = computed(
    () => Math.max(...Object.values(this.windows()).map((state) => state.layer)) - 0.5,
  );
  readonly separatorLayer = computed(
    () =>
      Math.max(
        0,
        ...Object.values(this.group()?.occupants ?? {})
          .filter((id): id is WindowId => !!id)
          .map((id) => this.windows()[id].layer),
      ) + 0.25,
  );
  readonly transitionId = signal<WindowId | 'group' | null>(null);
  readonly layouts = computed(() => SNAP_LAYOUTS.filter((layout) => fits(this.area(), layout)));
  readonly assistZone = computed(() => {
    const group = this.group();
    return this.assist() && group
      ? (group.layout.zones.find((zone) => !group.occupants[zone.id]) ?? null)
      : null;
  });
  readonly candidates = computed(() =>
    APPLICATIONS.filter(
      (app) =>
        this.windows()[app.id].status !== 'closed' &&
        !Object.values(this.group()?.occupants ?? {}).includes(app.id),
    ),
  );
  readonly assistRect = computed(() => {
    const group = this.group(),
      zone = this.assistZone();
    return group && zone ? zoneRect(this.area(), group.layout, zone) : null;
  });
  private highestLayer = APPLICATIONS.length;
  private gesture: Gesture | null = null;
  private separatorGesture: SeparatorGesture | null = null;
  private target: SnapTarget | 'maximized' | null = null;
  private patch(id: WindowId, value: Partial<ManagedWindow>): void {
    this.windows.update((all) => ({ ...all, [id]: { ...all[id], ...value } }));
  }
  activate(id: WindowId): void {
    if (this.windows()[id].layer !== this.highestLayer)
      this.patch(id, { layer: ++this.highestLayer });
  }
  open(id: WindowId): void {
    this.dismissPanels();
    const state = this.windows()[id];
    if (state.status === 'minimized' && state.presentation === 'snapped' && state.placement) {
      const group = this.group();
      if (
        group?.layout.id === state.placement.layoutId &&
        !group.occupants[state.placement.zoneId]
      ) {
        this.group.set({
          ...group,
          occupants: { ...group.occupants, [state.placement.zoneId]: id },
        });
        const zone = group.layout.zones.find((z) => z.id === state.placement!.zoneId)!;
        this.patch(id, { rect: zoneRect(this.area(), group.layout, zone) });
      } else
        this.patch(id, {
          presentation: 'free',
          rect: clampRect(state.freeRect, this.area()),
          placement: null,
        });
    }
    if (state.status === 'closed')
      this.patch(id, {
        presentation: 'free',
        placement: null,
        rect: clampRect(state.freeRect, this.area()),
      });
    this.patch(id, { status: 'open', layer: ++this.highestLayer });
  }
  setStatus(id: WindowId, status: WindowStatus): void {
    this.detach(id);
    this.patch(id, { status });
    this.dismissPanels();
  }
  resetPositions(): void {
    this.cancel();
    this.dismissPanels();
    this.group.set(null);
    this.transitionId.set('group');
    const area = this.area();
    for (const [index, app] of APPLICATIONS.entries()) {
      const width = app.id === 'projects' ? 670 : 510;
      const rect = clampRect(
        {
          x: area.x + (area.width - width) / 2 + index * 18 - 36,
          y: area.y + 26 + index * 20,
          width,
          height: 540,
        },
        area,
      );
      this.patch(app.id, { presentation: 'free', placement: null, rect, freeRect: rect });
    }
  }
  dismissPanels(): void {
    this.menu.set(null);
    this.assist.set(false);
  }
  private detach(id: WindowId): void {
    const group = this.group();
    if (!group) return;
    const occupants = { ...group.occupants };
    for (const [zone, occupant] of Object.entries(occupants))
      if (occupant === id) delete occupants[zone];
    this.group.set({ ...group, occupants });
  }
  setWorkspace(area: WindowRect, desktop: boolean): void {
    if (this.interacting()) this.cancel();
    this.transitionId.set(null);
    this.area.set(area);
    this.desktop.set(desktop);
    this.dismissPanels();
    let group = this.group();
    if (group && (!desktop || !fits(area, group.layout))) {
      for (const id of Object.values(group.occupants))
        if (id) this.patch(id, { presentation: 'free', placement: null });
      this.group.set(null);
      group = null;
    }
    for (const app of APPLICATIONS) {
      const state = this.windows()[app.id];
      const zone =
        group && state.presentation === 'snapped'
          ? group.layout.zones.find((z) => group!.occupants[z.id] === app.id)
          : null;
      this.patch(app.id, {
        rect:
          state.presentation === 'maximized'
            ? area
            : zone && group
              ? zoneRect(area, group.layout, zone)
              : clampRect(state.rect, area),
        freeRect: clampRect(state.freeRect, area),
      });
    }
  }
  toggleMaximize(id: WindowId): void {
    if (!this.desktop()) return;
    this.dismissPanels();
    this.transitionId.set(id);
    this.activate(id);
    const state = this.windows()[id];
    this.detach(id);
    if (state.presentation === 'maximized')
      this.patch(id, {
        presentation: 'free',
        rect: clampRect(state.freeRect, this.area()),
        placement: null,
      });
    else
      this.patch(id, {
        presentation: 'maximized',
        freeRect: state.presentation === 'free' ? state.rect : state.freeRect,
        rect: this.area(),
        placement: null,
      });
  }
  snap(id: WindowId, layoutId: string, zoneId: string): void {
    if (!this.desktop()) return;
    const requested = SNAP_LAYOUTS.find((l) => l.id === layoutId);
    if (!requested || !fits(this.area(), requested)) return;
    this.menu.set(null);
    this.transitionId.set(id);
    this.activate(id);
    let group = this.group();
    if (!group || group.layout.id !== layoutId) {
      if (group)
        for (const occupant of Object.values(group.occupants))
          if (occupant)
            this.patch(occupant, {
              presentation: 'free',
              freeRect: this.windows()[occupant].rect,
              placement: null,
            });
      group = { layout: structuredClone(requested), occupants: {} };
      this.group.set(group);
    }
    const zone = group.layout.zones.find((z) => z.id === zoneId);
    if (!zone) return;
    const occupied = group.occupants[zoneId];
    if (occupied && occupied !== id)
      this.patch(occupied, {
        presentation: 'free',
        rect: clampRect(this.windows()[occupied].freeRect, this.area()),
        placement: null,
      });
    this.detach(id);
    group = this.group()!;
    const state = this.windows()[id];
    this.patch(id, {
      status: 'open',
      presentation: 'snapped',
      freeRect: state.presentation === 'free' ? state.rect : state.freeRect,
      rect: zoneRect(this.area(), group.layout, zone),
      placement: { layoutId, zoneId },
    });
    this.group.set({ ...group, occupants: { ...group.occupants, [zoneId]: id } });
    this.assist.set(true);
  }
  choose(id: WindowId): void {
    const group = this.group(),
      zone = this.assistZone();
    if (group && zone) this.snap(id, group.layout.id, zone.id);
  }
  start(id: WindowId, kind: 'move' | ResizeEdge, x: number, y: number): void {
    if (!this.desktop()) return;
    this.dismissPanels();
    this.transitionId.set(null);
    this.activate(id);
    const state = this.windows()[id];
    this.gesture = {
      id,
      kind,
      startX: x,
      startY: y,
      rect: state.rect,
      snapshot: { windows: this.windows(), group: this.group() },
      moved: false,
    };
    this.interacting.set(true);
  }
  move(x: number, y: number): void {
    const gesture = this.gesture;
    if (!gesture) return;
    let dx = x - gesture.startX,
      dy = y - gesture.startY;
    if (!gesture.moved && Math.hypot(dx, dy) < 3) return;
    const state = this.windows()[gesture.id];
    if (!gesture.moved && gesture.kind === 'move' && state.presentation !== 'free') {
      const ratio = Math.max(
        0,
        Math.min(1, (gesture.startX - gesture.rect.x) / gesture.rect.width),
      );
      const rect = clampRect(
        {
          ...state.freeRect,
          x: x - state.freeRect.width * ratio,
          y: y - Math.min(25, gesture.startY - gesture.rect.y),
        },
        this.area(),
      );
      this.detach(gesture.id);
      this.patch(gesture.id, { presentation: 'free', placement: null, rect });
      gesture.rect = rect;
      gesture.startX = x;
      gesture.startY = y;
      dx = 0;
      dy = 0;
    }
    if (!gesture.moved && gesture.kind !== 'move' && state.presentation !== 'free') {
      this.detach(gesture.id);
      this.patch(gesture.id, { presentation: 'free', placement: null, freeRect: state.rect });
    }
    gesture.moved = true;
    const rect =
      gesture.kind === 'move'
        ? clampRect(
            { ...gesture.rect, x: gesture.rect.x + dx, y: gesture.rect.y + dy },
            this.area(),
          )
        : resizedRect(gesture.rect, gesture.kind, dx, dy, this.area());
    this.patch(gesture.id, { rect });
    if (gesture.kind === 'move') {
      this.target = snapTarget(x, y, this.area());
      if (this.target === 'maximized') this.preview.set(this.area());
      else if (this.target) {
        const layout = SNAP_LAYOUTS.find((l) => l.id === (this.target as SnapTarget).layoutId)!;
        this.preview.set(
          zoneRect(
            this.area(),
            layout,
            layout.zones.find((z) => z.id === (this.target as SnapTarget).zoneId)!,
          ),
        );
      } else this.preview.set(null);
    }
  }
  finish(): void {
    const gesture = this.gesture;
    this.gesture = null;
    this.interacting.set(false);
    this.preview.set(null);
    if (!gesture) return;
    if (gesture.moved && this.target === 'maximized') this.toggleMaximize(gesture.id);
    else if (gesture.moved && this.target && this.target !== 'maximized')
      this.snap(gesture.id, this.target.layoutId, this.target.zoneId);
    else if (gesture.moved) this.patch(gesture.id, { freeRect: this.windows()[gesture.id].rect });
    this.target = null;
  }
  cancel(): void {
    const snapshot = this.gesture?.snapshot ?? this.separatorGesture?.snapshot;
    if (snapshot) {
      this.windows.set(snapshot.windows);
      this.group.set(snapshot.group);
    }
    this.gesture = null;
    this.separatorGesture = null;
    this.target = null;
    this.preview.set(null);
    this.interacting.set(false);
  }
  sharedEdge(id: WindowId, edge: ResizeEdge): boolean {
    const group = this.group();
    if (!group || edge.length !== 1) return false;
    const zone = group.layout.zones.find((z) => group.occupants[z.id] === id);
    if (!zone) return false;
    const neighbor = group.layout.zones.find((z) =>
      edge === 'e'
        ? z.row === zone.row && z.column === zone.column + 1
        : edge === 'w'
          ? z.row === zone.row && z.column === zone.column - 1
          : edge === 's'
            ? z.column === zone.column && z.row === zone.row + 1
            : z.column === zone.column && z.row === zone.row - 1,
    );
    return !!neighbor && !!group.occupants[neighbor.id];
  }
  readonly separators = computed(() => {
    const group = this.group();
    if (!group) return [];
    const occupied = group.layout.zones.filter((zone) => group.occupants[zone.id]);
    const area = this.area();
    return (['columns', 'rows'] as const).flatMap((axis) =>
      group.layout[axis].slice(1, -1).flatMap((cut, i) => {
        const index = i + 1;
        if (
          !occupied.some((z) => (axis === 'columns' ? z.column : z.row) < index) ||
          !occupied.some((z) => (axis === 'columns' ? z.column : z.row) >= index)
        )
          return [];
        const usable =
          (axis === 'columns' ? area.width : area.height) - GAP * (group.layout[axis].length - 2);
        return [
          {
            axis,
            index,
            rect:
              axis === 'columns'
                ? { x: area.x + usable * cut + GAP * i, y: area.y, width: GAP, height: area.height }
                : { x: area.x, y: area.y + usable * cut + GAP * i, width: area.width, height: GAP },
          },
        ];
      }),
    );
  });
  startSeparator(axis: 'columns' | 'rows', index: number): void {
    this.dismissPanels();
    this.transitionId.set(null);
    this.separatorGesture = {
      axis,
      index,
      snapshot: { windows: this.windows(), group: this.group() },
    };
    this.interacting.set(true);
  }
  moveSeparator(x: number, y: number): void {
    const gesture = this.separatorGesture,
      group = this.group();
    if (!gesture || !group) return;
    const { axis, index } = gesture,
      area = this.area();
    const cuts = [...group.layout[axis]],
      usable = (axis === 'columns' ? area.width : area.height) - GAP * (cuts.length - 2);
    const position =
      ((axis === 'columns' ? x - area.x : y - area.y) - GAP * (index - 0.5)) / usable;
    const min = (axis === 'columns' ? MIN_WIDTH : MIN_HEIGHT) / usable;
    cuts[index] = Math.max(cuts[index - 1] + min, Math.min(cuts[index + 1] - min, position));
    const layout = { ...group.layout, [axis]: cuts };
    this.group.set({ ...group, layout });
    for (const zone of layout.zones) {
      const id = group.occupants[zone.id];
      if (id) this.patch(id, { rect: zoneRect(area, layout, zone) });
    }
  }
  finishSeparator(): void {
    this.separatorGesture = null;
    this.interacting.set(false);
  }
}
