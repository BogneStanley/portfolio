import { describe, expect, it } from 'vitest';
import {
  clampRect,
  fits,
  GAP,
  resizedRect,
  SNAP_LAYOUTS,
  snapTarget,
  ResizeEdge,
  zoneRect,
} from './window-geometry';
const area = { x: 12, y: 58, width: 1256, height: 640 };
describe('Window geometry', () => {
  it('tiles halves without gaps except the shared gutter', () => {
    const layout = SNAP_LAYOUTS[0],
      left = zoneRect(area, layout, layout.zones[0]),
      right = zoneRect(area, layout, layout.zones[1]);
    expect(left.x).toBe(12);
    expect(right.x - left.x - left.width).toBe(GAP);
    expect(right.x + right.width).toBe(area.x + area.width);
  });
  it('prioritizes corners and does not snap at the lower edge alone', () => {
    expect(snapTarget(13, 59, area)).toEqual({ layoutId: 'quarters', zoneId: '0-0' });
    expect(snapTarget(1267, 697, area)).toEqual({ layoutId: 'quarters', zoneId: '1-1' });
    expect(snapTarget(600, 59, area)).toBe('maximized');
    expect(snapTarget(600, 697, area)).toBeNull();
    expect(snapTarget(13, 300, area)).toEqual({ layoutId: 'halves', zoneId: '0-0' });
    expect(snapTarget(600, 300, area)).toBeNull();
  });
  it('hides layouts that violate minimum sizes, including gutters', () => {
    expect(fits({ ...area, width: 651 }, SNAP_LAYOUTS[0])).toBe(false);
    expect(fits({ ...area, width: 652 }, SNAP_LAYOUTS[0])).toBe(true);
    expect(fits({ ...area, height: 451 }, SNAP_LAYOUTS[4])).toBe(false);
    expect(fits({ ...area, width: 983 }, SNAP_LAYOUTS[3])).toBe(false);
  });
  it('resizes each corner while preserving its opposite corner and minimum size', () => {
    const rect = { x: 100, y: 100, width: 500, height: 400 };
    expect(resizedRect(rect, 'nw', 900, 900, area)).toEqual({
      x: 280,
      y: 280,
      width: 320,
      height: 220,
    });
    expect(resizedRect(rect, 'se', -900, -900, area)).toEqual({
      x: 100,
      y: 100,
      width: 320,
      height: 220,
    });
    const large = resizedRect(rect, 'se', 2000, 2000, area);
    expect(large.x + large.width).toBe(area.x + area.width);
    expect(large.y + large.height).toBe(area.y + area.height);
  });
  it('keeps free windows accessible even when the workspace is smaller than the minimum', () => {
    expect(
      clampRect(
        { x: -500, y: 800, width: 900, height: 900 },
        { x: 12, y: 58, width: 250, height: 180 },
      ),
    ).toEqual({ x: 12, y: 58, width: 250, height: 180 });
  });
  it.each<ResizeEdge>(['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'])(
    'keeps the opposite edges fixed for %s',
    (edge) => {
      const original = { x: 200, y: 180, width: 600, height: 400 };
      const resized = resizedRect(original, edge, 45, 35, area);
      expect(resized.width).toBeGreaterThanOrEqual(320);
      expect(resized.height).toBeGreaterThanOrEqual(220);
      if (!edge.includes('w')) expect(resized.x).toBe(original.x);
      if (!edge.includes('e')) expect(resized.x + resized.width).toBe(original.x + original.width);
      if (!edge.includes('n')) expect(resized.y).toBe(original.y);
      if (!edge.includes('s'))
        expect(resized.y + resized.height).toBe(original.y + original.height);
    },
  );
});
