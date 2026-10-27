import { describe, expect, it } from 'vitest';
import { frameworkHref, frameworkRoute, LEVEL_STRUCTURE, READINESS_AREAS, RESULT_METRICS, VISIBILITY_LEVELS, requirementStatusChange, emptyReadinessState, validateReadinessState, requirementCompletion } from '../../src/features/readiness/readiness-framework';

describe('current readiness framework and historical routes', () => {
  it('keeps the agreed four Product and three Growth measures in exactly two areas', () => {
    expect(READINESS_AREAS.map(a => a.label)).toEqual(['Product & design', 'SEO & growth']);
    expect(RESULT_METRICS.product.map(m => m.name)).toEqual(['DAU', 'High-intent actions', 'Revenue', 'Churn']);
    expect(RESULT_METRICS.growth.map(m => m.name)).toEqual(['Discoverability', 'Visits', 'AI & Google answers']);
    expect(VISIBILITY_LEVELS.map(l => l.name)).toEqual(['Brand', 'Category', 'Problem', 'Alternatives & comparisons', 'Specific buying intent']);
    expect(LEVEL_STRUCTURE.reduce((sum, l) => sum + l.possiblePoints, 0)).toBe(10);
    expect(LEVEL_STRUCTURE.every(l => l.gate.length > 20 && !l.gate.includes('not defined'))).toBe(true);
  });
  it('opens the unassessed current framework by default, including a product-scoped results link', () => {
    expect(frameworkRoute(new URLSearchParams())).toEqual({ historical: false, area: null, view: 'effort' });
    const href = frameworkHref('growth', 'results', 'a product/one');
    const params = new URL(href, 'http://local.test').searchParams;
    expect(params.get('project')).toBe('a product/one');
    expect(frameworkRoute(params)).toEqual({ historical: false, area: 'growth', view: 'results' });
    expect(frameworkRoute(new URLSearchParams('pillar=unknown&tab=unsupported'))).toEqual({ historical: false, area: null, view: 'effort' });
  });
  it('retains previous assessment, evidence and lever deep links without relabelling old scores as current', () => {
    for (const query of ['page=legacy&mode=history', 'page=category&category=geo', 'product=codevetter', 'category=seo', 'domain=codevetter.com', 'mode=levers&project=codevetter', 'q=CodeVetter']) {
      const params = new URLSearchParams(query);
      const originalQuery = params.toString();
      expect(frameworkRoute(params).historical).toBe(true);
      expect(params.toString()).toBe(originalQuery);
    }
  });
});

describe('independent work estimates and verification status edits', () => {
  const blank = { status: 'in-progress' as const, note: '', evidenceRefs: [] };
  it('does not invent a percentage or confidence when a blank gate is marked not started', () => {
    const state = emptyReadinessState();
    state.requirements['product-core'] = requirementStatusChange(blank, 'not-started');
    expect(() => validateReadinessState(state)).not.toThrow();
    expect(requirementCompletion(state.requirements['product-core'])).toBeNull();
    expect(state.requirements['product-core'].confidence).toBeUndefined();
  });
  it('uses verified proof without requiring a fabricated estimate and preserves partial work during verification', () => {
    const entry = { ...blank, note: 'Implemented core loop; verification documented', evidenceRefs: [{ref: 'repo:core-runtime', observedAt: '2026-10-27T00:00:00Z'}], completion: 75, confidence: 'medium' as const };
    const state = emptyReadinessState();
    state.requirements['product-core'] = requirementStatusChange(entry, 'verified');
    expect(() => validateReadinessState(state)).not.toThrow();
    expect(requirementCompletion(state.requirements['product-core'])).toBe(100);
    expect(requirementStatusChange(entry, 'awaiting-evidence')).toEqual({...entry, status: 'awaiting-evidence'});
    expect(requirementCompletion(requirementStatusChange(entry, 'not-started'))).toBeNull();
  });
});
