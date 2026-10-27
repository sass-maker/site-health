import { describe, it, expect } from 'vitest';
import { categoryProducts } from '../../src/features/readiness/category-model';
import type { ScoreProject } from '../../src/features/readiness/scoreboard';

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
