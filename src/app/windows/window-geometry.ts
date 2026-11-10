export interface WindowRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export type WindowPresentation = 'free' | 'snapped' | 'maximized';
export type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
export interface SnapZone {
  id: string;
  column: number;
  row: number;
}
export interface SnapLayout {
  id: string;
  label: string;
  columns: number[];
  rows: number[];
  zones: SnapZone[];
}
export const GAP = 12;
export const MIN_WIDTH = 320;
export const MIN_HEIGHT = 220;
const layout = (id: string, label: string, columns: number[], rows = [0, 1]): SnapLayout => ({
  id,
  label,
  columns,
  rows,
  zones: Array.from({ length: rows.length - 1 }, (_, row) =>
    Array.from({ length: columns.length - 1 }, (_, column) => ({
      id: `${row}-${column}`,
      row,
      column,
    })),
  ).flat(),
});
export const SNAP_LAYOUTS = [
  layout('halves', 'Deux moitiés', [0, 0.5, 1]),
  layout('wide-left', 'Deux tiers à gauche', [0, 2 / 3, 1]),
  layout('wide-right', 'Deux tiers à droite', [0, 1 / 3, 1]),
  layout('thirds', 'Trois colonnes', [0, 1 / 3, 2 / 3, 1]),
  layout('quarters', 'Quatre quarts', [0, 0.5, 1], [0, 0.5, 1]),
];
export function zoneRect(area: WindowRect, layout: SnapLayout, zone: SnapZone): WindowRect {
  const w = area.width - GAP * (layout.columns.length - 2);
  const h = area.height - GAP * (layout.rows.length - 2);
  return {
    x: area.x + w * layout.columns[zone.column] + GAP * zone.column,
    y: area.y + h * layout.rows[zone.row] + GAP * zone.row,
    width: w * (layout.columns[zone.column + 1] - layout.columns[zone.column]),
    height: h * (layout.rows[zone.row + 1] - layout.rows[zone.row]),
  };
}
export function fits(area: WindowRect, layout: SnapLayout): boolean {
  return layout.zones.every((zone) => {
    const r = zoneRect(area, layout, zone);
    return r.width >= MIN_WIDTH && r.height >= MIN_HEIGHT;
  });
}
export function clampRect(rect: WindowRect, area: WindowRect): WindowRect {
  const width = Math.min(area.width, Math.max(Math.min(MIN_WIDTH, area.width), rect.width));
  const height = Math.min(area.height, Math.max(Math.min(MIN_HEIGHT, area.height), rect.height));
  return {
    width,
    height,
    x: Math.max(area.x, Math.min(area.x + area.width - width, rect.x)),
    y: Math.max(area.y, Math.min(area.y + area.height - height, rect.y)),
  };
}
export function resizedRect(
  rect: WindowRect,
  edge: ResizeEdge,
  dx: number,
  dy: number,
  area: WindowRect,
): WindowRect {
  let left = rect.x,
    right = rect.x + rect.width,
    top = rect.y,
    bottom = rect.y + rect.height;
  if (edge.includes('w'))
    left = Math.max(area.x, Math.min(right - Math.min(MIN_WIDTH, area.width), left + dx));
  if (edge.includes('e'))
    right = Math.min(
      area.x + area.width,
      Math.max(left + Math.min(MIN_WIDTH, area.width), right + dx),
    );
  if (edge.includes('n'))
    top = Math.max(area.y, Math.min(bottom - Math.min(MIN_HEIGHT, area.height), top + dy));
  if (edge.includes('s'))
    bottom = Math.min(
      area.y + area.height,
      Math.max(top + Math.min(MIN_HEIGHT, area.height), bottom + dy),
    );
  return { x: left, y: top, width: right - left, height: bottom - top };
}
export interface SnapTarget {
  layoutId: string;
  zoneId: string;
}
export function snapTarget(
  x: number,
  y: number,
  area: WindowRect,
): SnapTarget | 'maximized' | null {
  const left = x <= area.x + 64,
    right = x >= area.x + area.width - 64;
  const top = y <= area.y + 64,
    bottom = y >= area.y + area.height - 64;
  const edgeX = x <= area.x + 24 || x >= area.x + area.width - 24;
  const edgeY = y <= area.y + 24 || y >= area.y + area.height - 24;
  if ((left || right) && (top || bottom) && (edgeX || edgeY)) {
    const quarters = SNAP_LAYOUTS.find((l) => l.id === 'quarters')!;
    if (fits(area, quarters))
      return { layoutId: 'quarters', zoneId: `${bottom ? 1 : 0}-${right ? 1 : 0}` };
  }
  if (y <= area.y + 24) return 'maximized';
  if (fits(area, SNAP_LAYOUTS[0])) {
    if (x <= area.x + 24) return { layoutId: 'halves', zoneId: '0-0' };
    if (x >= area.x + area.width - 24) return { layoutId: 'halves', zoneId: '0-1' };
  }
  return null;
}
