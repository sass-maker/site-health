import { describe, it, expect } from 'vitest';
import { categoryProducts, categoryQueue } from '../../src/features/readiness/category-model';
import type { Lever, ScoreProject, ScoreWorkspace } from '../../src/features/readiness/scoreboard';

describe('current category membership', () => {
  const assessed = [{ id: 'known', name: 'Known', domains: [] }, { id: 'retired', name: 'Retired', domains: [] }] as unknown as ScoreProject[];
  it('includes an unassessed current product without synthesizing scores and excludes inactive assessment rows', () => {
    const inventory = [
      { id: 'known', name: 'Current name', domains: [], lifecycle: { status: 'primary' } },
      { id: 'motion', name: 'Motion', domains: [], lifecycle: { status: 'active' } },
      { id: 'retired', name: 'Retired', domains: [], lifecycle: { status: 'archived' } },
    ];
    const rows = categoryProducts(inventory, assessed);
    expect(rows.map((p) => p.id)).toEqual(['known', 'motion']);
    expect(rows[0].name).toBe('Current name');
    expect(rows[0].assessment).toBe(assessed[0]);
    expect(rows[1].assessment).toBeUndefined();
    expect(assessed).toHaveLength(2);
  });
  it('distinguishes unknown inventory from a known empty current cohort', () => {
    expect(categoryProducts(null, assessed).map((p) => p.id)).toEqual(['known', 'retired']);
    expect(categoryProducts([], assessed)).toEqual([]);
  });
});

describe('category queue respects current membership without hiding active work', () => {
  const inactive = { id: 'old:geo', projectId: 'old', category: 'geo', kind: 'action', dependencies: [] } as unknown as Lever;
  const current = { id: 'current:geo', projectId: 'current', category: 'geo', kind: 'action', dependencies: [] } as unknown as Lever;
  const inventory = [{ id: 'old', name: 'Old', domains: [], lifecycle: { status: 'archived' } }, { id: 'current', name: 'Current', domains: [], lifecycle: { status: 'active' } }];
  it('skips an inactive first-ready recommendation and selects the current product', () => {
    const workspace = { progress: {} } as ScoreWorkspace;
    expect(categoryQueue([inactive, current], workspace, 'geo', inventory)).toBe(current);
    expect(categoryQueue([inactive, current], workspace, 'geo', [])).toBeUndefined();
    expect(categoryQueue([inactive, current], workspace, 'geo', null)).toBeUndefined();
  });
  it('always retains an active inactive-product lever, including while current inventory is unavailable', () => {
    const workspace = { progress: { 'old:geo': { status: 'active' } } } as ScoreWorkspace;
    expect(categoryQueue([inactive, current], workspace, 'geo', inventory)).toBe(inactive);
    expect(categoryQueue([inactive, current], workspace, 'geo', null)).toBe(inactive);
    expect(categoryQueue([inactive, current], workspace, 'design', inventory)).toBeUndefined();
  });
});
