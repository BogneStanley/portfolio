import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { WindowManager } from './window-manager';
import { MIN_WIDTH } from './window-geometry';
const area = { x: 12, y: 58, width: 1256, height: 640 };
describe('WindowManager', () => {
  let manager: WindowManager;
  beforeEach(() => {
    manager = TestBed.inject(WindowManager);
    manager.setWorkspace(area, true);
    manager.open('projects');
    manager.open('about');
  });
  afterEach(() => TestBed.resetTestingModule());
  it('preserves desktop geometry across mobile navigation and repeated viewport changes', () => {
    const original = manager.windows().projects.rect;
    const closed = manager.windows().skills.freeRect;
    for (let count = 0; count < 2; count++) {
      manager.setWorkspace({ x: 0, y: 0, width: 390, height: 844 }, false, true);
      manager.open('skills');
      manager.setStatus('skills', 'closed');
      manager.open('projects');
      manager.setWorkspace({ x: 0, y: 0, width: 320, height: 568 }, false, true);
      expect(manager.windows().projects.freeRect).toEqual(original);
      expect(manager.windows().skills.freeRect).toEqual(closed);
      manager.setWorkspace(area, true, false);
      expect(manager.windows().projects.rect).toEqual(original);
      manager.open('skills');
      expect(manager.windows().skills.rect).toEqual(closed);
    }
  });
  it('restores free desktop geometry after mobile dissolves a snapped layout', () => {
    const original = manager.windows().projects.freeRect;
    manager.snap('projects', 'halves', '0-0');
    manager.setWorkspace({ x: 0, y: 0, width: 390, height: 844 }, false, true);
    expect(manager.group()).toBeNull();
    manager.setWorkspace(area, true, false);
    expect(manager.windows().projects.presentation).toBe('free');
    expect(manager.windows().projects.rect).toEqual(original);
    manager.toggleMaximize('projects');
    manager.setWorkspace({ x: 0, y: 0, width: 390, height: 844 }, false, true);
    manager.setWorkspace(area, true, false);
    expect(manager.windows().projects.rect).toEqual(area);
    manager.toggleMaximize('projects');
    expect(manager.windows().projects.rect).toEqual(original);
  });
  it('maximizes and restores the exact free rectangle', () => {
    const free = manager.windows().projects.rect;
    manager.toggleMaximize('projects');
    expect(manager.windows().projects.rect).toEqual(area);
    manager.toggleMaximize('projects');
    expect(manager.windows().projects.rect).toEqual(free);
  });
  it('offers only existing windows and fills the next free zone', () => {
    manager.snap('projects', 'halves', '0-0');
    expect(manager.candidates().map((app) => app.id)).toEqual(['about']);
    manager.choose('about');
    expect(manager.group()?.occupants).toEqual({ '0-0': 'projects', '0-1': 'about' });
    expect(manager.assistRect()).toBeNull();
  });
  it('keeps the placement of a minimized window only if its slot is free', () => {
    manager.snap('projects', 'halves', '0-0');
    const rect = manager.windows().projects.rect;
    manager.setStatus('projects', 'minimized');
    manager.open('projects');
    expect(manager.windows().projects.rect).toEqual(rect);
    manager.setStatus('projects', 'minimized');
    manager.snap('about', 'halves', '0-0');
    manager.open('projects');
    expect(manager.windows().projects.presentation).toBe('free');
    expect(manager.group()?.occupants['0-0']).toBe('about');
  });
  it('restores an occupant before replacing it and dissolves old layouts without moving others', () => {
    const original = manager.windows().projects.rect;
    manager.snap('projects', 'halves', '0-0');
    manager.snap('about', 'halves', '0-0');
    expect(manager.windows().projects.rect).toEqual(original);
    const snapped = manager.windows().about.rect;
    manager.snap('projects', 'quarters', '0-0');
    expect(manager.windows().about.presentation).toBe('free');
    expect(manager.windows().about.rect).toEqual(snapped);
  });
  it('resizes a shared divider atomically, clamps minimums, and cancels exactly', () => {
    manager.snap('projects', 'halves', '0-0');
    manager.choose('about');
    const before = manager.windows();
    manager.startSeparator('columns', 1);
    manager.moveSeparator(5000, 200);
    expect(manager.windows().about.rect.width).toBeCloseTo(MIN_WIDTH);
    expect(
      manager.windows().about.rect.x -
        manager.windows().projects.rect.x -
        manager.windows().projects.rect.width,
    ).toBeCloseTo(12);
    manager.cancel();
    expect(manager.windows()).toEqual(before);
  });
  it('shows and clears a preview, and restores a cancelled drag', () => {
    const before = manager.windows().projects;
    manager.start('projects', 'move', 400, 100);
    manager.move(13, 300);
    expect(manager.preview()).not.toBeNull();
    manager.move(500, 300);
    expect(manager.preview()).toBeNull();
    manager.cancel();
    expect(manager.windows().projects.rect).toEqual(before.rect);
  });
  it('detaches a snapped drag at the pointer while preserving the last free dimensions', () => {
    const free = manager.windows().projects.freeRect;
    manager.snap('projects', 'halves', '0-0');
    manager.start('projects', 'move', 200, 75);
    manager.move(450, 200);
    manager.finish();
    expect(manager.windows().projects.presentation).toBe('free');
    expect(manager.windows().projects.rect.width).toBe(free.width);
  });
  it('dissolves an impossible layout and keeps every window within the new workspace', () => {
    manager.snap('projects', 'quarters', '0-0');
    manager.choose('about');
    const smaller = { x: 12, y: 58, width: 700, height: 300 };
    manager.setWorkspace(smaller, true);
    expect(manager.group()).toBeNull();
    for (const state of Object.values(manager.windows())) {
      expect(state.rect.x).toBeGreaterThanOrEqual(12);
      expect(state.rect.y + state.rect.height).toBeLessThanOrEqual(358);
    }
  });
  it('moves a shared row boundary across both columns with the same minimum height', () => {
    manager.open('skills');
    manager.open('contact');
    manager.snap('projects', 'quarters', '0-0');
    manager.choose('about');
    manager.choose('skills');
    manager.choose('contact');
    manager.startSeparator('rows', 1);
    manager.moveSeparator(300, 5000);
    manager.finishSeparator();
    const state = manager.windows();
    expect(state.skills.rect.height).toBeCloseTo(220);
    expect(state.contact.rect.height).toBeCloseTo(220);
    expect(state.projects.rect.height).toBe(state.about.rect.height);
    expect(state.skills.rect.y - state.projects.rect.y - state.projects.rect.height).toBeCloseTo(
      12,
    );
  });
  it('reorganizes windows without closing or restoring minimized applications', () => {
    manager.snap('projects', 'halves', '0-0');
    manager.choose('about');
    manager.setStatus('about', 'minimized');
    manager.resetPositions();
    expect(manager.group()).toBeNull();
    expect(manager.windows().projects.status).toBe('open');
    expect(manager.windows().about.status).toBe('minimized');
    expect(manager.windows().projects.presentation).toBe('free');
    expect(manager.windows().projects.rect.x).toBeGreaterThanOrEqual(area.x);
  });

  it('keeps only the foreground folder open when entering mobile mode', () => {
    manager.setWorkspace({ x: 0, y: 0, width: 390, height: 844 }, false, true);
    expect(manager.mobile()).toBe(true);
    expect(manager.windows().about.status).toBe('open');
    expect(manager.windows().projects.status).toBe('minimized');
    manager.open('skills');
    expect(manager.windows().about.status).toBe('minimized');
    manager.setStatus('skills', 'closed');
    expect(Object.values(manager.windows()).some((state) => state.status === 'open')).toBe(false);
    manager.setWorkspace(area, true, false);
    manager.open('about');
    manager.open('projects');
    expect(manager.mobile()).toBe(false);
    expect(manager.windows().about.status).toBe('open');
    expect(manager.windows().projects.status).toBe('open');
  });
  it('does not expose desktop actions on mobile', () => {
    manager.setWorkspace({ ...area, width: 366 }, false);
    manager.toggleMaximize('projects');
    manager.snap('projects', 'halves', '0-0');
    expect(manager.windows().projects.presentation).toBe('free');
    expect(manager.group()).toBeNull();
  });
});

describe('Gesture edge cases', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('does not detach a snapped window for a stationary resize press', () => {
    const manager = TestBed.inject(WindowManager);
    manager.setWorkspace(area, true);
    manager.open('projects');
    manager.snap('projects', 'halves', '0-0');
    manager.start('projects', 's', 200, 698);
    manager.finish();
    expect(manager.windows().projects.presentation).toBe('snapped');
  });
  it('commits the top and corner target on release, not while moving', () => {
    const manager = TestBed.inject(WindowManager);
    manager.setWorkspace(area, true);
    manager.open('projects');
    manager.start('projects', 'move', 400, 100);
    manager.move(600, 60);
    expect(manager.windows().projects.presentation).toBe('free');
    manager.finish();
    expect(manager.windows().projects.presentation).toBe('maximized');
    manager.start('projects', 'move', 600, 75);
    manager.move(13, 697);
    manager.finish();
    expect(manager.windows().projects.placement).toEqual({ layoutId: 'quarters', zoneId: '1-0' });
  });
  it('keeps free geometry unchanged when suggestions are dismissed', () => {
    const manager = TestBed.inject(WindowManager);
    manager.setWorkspace(area, true);
    manager.open('projects');
    manager.open('about');
    const before = manager.windows().about.rect;
    manager.snap('projects', 'halves', '0-0');
    manager.dismissPanels();
    expect(manager.windows().about.rect).toEqual(before);
    expect(manager.assist()).toBe(false);
  });
});
