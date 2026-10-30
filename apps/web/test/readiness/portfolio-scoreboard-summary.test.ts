import { describe, expect, it } from 'vitest';
import { emptyReadinessState, localMeasurementDate, measurementDateInstant, type ReadinessProduct } from '../../src/features/readiness/readiness-framework';
import { effortCell, observationText, currentReadingValue, externalPerformanceQuality, summarizePortfolioProduct } from '../../src/features/readiness/portfolio-scoreboard-summary';

function product(): ReadinessProduct {
  return { id: 'sample', name: 'Sample', revision: 1, updatedAt: null, state: emptyReadinessState(), evidence: [], coverageGaps: [] };
}
function estimateAllProductItems(row: ReadinessProduct, score: number) {
  row.state.applicability.product = { state: 'applicable', reason: '' };
  row.state.checklist = Object.fromEntries(['product-core', 'product-features', 'product-understandable', 'product-design', 'product-agent', 'product-delivery', 'product-speed', 'product-measurement'].map(id => [id, { status: 'in-progress' as const, completion: score, confidence: 'medium' as const, note: 'Estimate based on current work', evidenceRefs: [{ ref: `local:${id}`, observedAt: '2026-10-20T00:00:00.000Z' }] }]));
}

describe('portfolio scoreboard aggregation', () => {
  it('combines exact applicable effort and labels the total denominator', () => {
    const row = product();
    estimateAllProductItems(row, 50);
    row.state.applicability.growth = { state: 'exempt', reason: 'Internal product without public acquisition surface' };
    const result = summarizePortfolioProduct(row);
    expect(result.effortTotal).toBe('5/10');
    expect(result.effortSortValue).toBe(0.5);
    expect(effortCell(result.growthEffort)).toBe('Exempt');
    row.state.applicability.product = { state: 'exempt', reason: 'No applicable product surface' };
    expect(summarizePortfolioProduct(row).effortTotal).toBe('Exempt');
  });

  it('uses bounded ranges for missing estimates and keeps unknown applicability out of exact totals', () => {
    const row = product();
    row.state.applicability.product = { state: 'applicable', reason: '' };
    row.state.checklist = { 'product-core': { status: 'in-progress', completion: 50, confidence: 'low', note: 'Partial estimate', evidenceRefs: [{ ref: 'local:core', observedAt: '2026-10-20T00:00:00.000Z' }] } };
    row.state.applicability.growth = { state: 'exempt', reason: 'No public search surface' };
    const partial = summarizePortfolioProduct(row);
    expect(partial.effortTotal).toBe('0.6–9.4/10 range');
    expect(partial.effortSortValue).toBe(0.06);
    row.state.applicability.growth = { state: 'unknown', reason: '' };
    expect(summarizePortfolioProduct(row).effortTotal).toBe('Scope unknown');
  });

  it('preserves zero-valued dated observations and does not convert them to missing readings', () => {
    const row = product();
    row.evidence = [{ id: 'search:clicks:0', source: 'search', projectId: row.id, label: 'Search clicks', unit: 'clicks', value: 0, observedAt: '2026-10-29T00:00:00.000Z', qualification: 'proxy' }];
    const result = summarizePortfolioProduct(row);
    expect(observationText(result.clicks)).toBe('0 clicks');
    expect(result.clicks?.observedAt).toBe('2026-10-29T00:00:00.000Z');
    expect(result.qualifiedResultScores).toBe(0);
  });

  it('selects mobile PSI instead of mobile LCP and uses only the explicit 30-day browser proxy', () => {
    const row = product();
    row.evidence = [
      { id: 'mobile:lcp', source: 'psi-swarm.mobile', projectId: row.id, label: 'Mobile LCP', unit: 'ms', value: 900, observedAt: '2026-10-30T00:00:00Z', qualification: 'proxy' },
      { id: 'mobile:psi', source: 'psi-swarm.mobile', projectId: row.id, label: 'Mobile PSI', unit: '/100', value: 82, observedAt: '2026-10-20T00:00:00Z', qualification: 'proxy' },
      { id: 'clarity:uniqueBrowsers', source: 'clarity', projectId: row.id, label: 'Clarity unique browsers', unit: 'browsers', value: 10, observedAt: '2026-10-30T00:00:00Z', qualification: 'proxy' },
      { id: 'monthly-browser-proxy', source: 'app-health.browser-report', projectId: row.id, label: '30-day browser / session proxy', unit: 'browsers', value: 38, observedAt: '2026-10-30T00:00:00Z', qualification: 'proxy', window: 'rolling 30 days' },
    ];
    const result = summarizePortfolioProduct(row);
    expect(result.mobile?.value).toBe(82);
    expect(result.mobile?.unit).toBe('/100');
    expect(result.browserProxy?.id).toBe('monthly-browser-proxy');
  });
});


it('keeps multi-surface readings scoped and never pairs SEO counts from different sites', () => {
  const row = product();
  row.evidence = [
    { id: 'seoAudit:pass:0', source: 'seoAudit', projectId: row.id, label: 'SEO checks passed · a.test', unit: 'checks', value: 15, observedAt: '2026-10-29T00:00:00Z', qualification: 'proxy' },
    { id: 'seoAudit:fail:1', source: 'seoAudit', projectId: row.id, label: 'SEO checks failed · b.test', unit: 'checks', value: 2, observedAt: '2026-10-29T01:00:00Z', qualification: 'proxy' },
    { id: 'search:clicks:0', source: 'search', projectId: row.id, label: 'Search clicks · a.test', unit: 'clicks', value: 7, observedAt: '2026-10-29T00:00:00Z', qualification: 'proxy' },
    { id: 'search:clicks:1', source: 'search', projectId: row.id, label: 'Search clicks · b.test', unit: 'clicks', value: 3, observedAt: '2026-10-29T01:00:00Z', qualification: 'proxy' },
  ];
  const summary = summarizePortfolioProduct(row);
  expect(summary.seoPass).toBeNull();
  expect(summary.seoFail?.label).toContain('b.test');
  expect(summary.clicks?.value).toBe(3);
  expect(summary.clicks?.label).toContain('b.test');
});

it('does not sort an exempt product design by its retained historical estimate', () => {
  const row = product();
  estimateAllProductItems(row, 50);
  row.state.applicability.product = { state: 'exempt', reason: 'Scope exemption' };
  expect(summarizePortfolioProduct(row).designScore).toBeNull();
});

it('labels historical readings, prefers a current scoped reading, and excludes stale data from numeric sort', () => {
  const row = product();
  const stale = { id: 'search:clicks:0', source: 'search', projectId: row.id, label: 'Search clicks · old.test', unit: 'clicks', value: 99, observedAt: '2026-10-29T00:00:00Z', qualification: 'unknown' as const, measurement: { state: 'stale' as const, cadence: 'daily', maximumAgeDays: 1, freshUntil: '2026-10-30T00:00:00Z' } };
  row.evidence = [stale];
  expect(observationText(summarizePortfolioProduct(row).clicks)).toContain('stale');
  expect(currentReadingValue(summarizePortfolioProduct(row).clicks)).toBeNull();
  row.evidence.push({ ...stale, id: 'search:clicks:1', label: 'Search clicks · current.test', value: 0, measurement: { ...stale.measurement, state: 'current' } });
  expect(currentReadingValue(summarizePortfolioProduct(row).clicks)).toBe(0);
  expect(summarizePortfolioProduct(row).clicks?.label).toContain('current.test');
});

it('round-trips local measurement dates without creating a future instant after local midnight', () => {
  const now = new Date();
  const localToday = localMeasurementDate(now.toISOString());
  const observedAt = measurementDateInstant(localToday);
  expect(localMeasurementDate(observedAt)).toBe(localToday);
  expect(Date.parse(observedAt)).toBeLessThanOrEqual(now.getTime());
});

it('requires both current device cohorts and five samples before calling lab performance strong', () => {
  const row = product(); row.audience = 'public';
  const observation = (id: string, source: string, value: number, samples = 5) => ({ id, source, projectId: row.id, label: id, value, unit: id.includes('psi') ? '/100' : 'ms', observedAt: '2026-10-30T00:00:00Z', qualification: 'proxy' as const, context: { samples }, measurement: { state: 'current' as const, cadence: 'weekly', maximumAgeDays: 7, freshUntil: '2026-11-06T00:00:00Z' } });
  row.evidence = [observation('performance:psi:0', 'performance', 98), observation('mobile:psi', 'psi-swarm.mobile', 96), observation('performance:lcp:0', 'performance', 1000), observation('mobile:lcp', 'psi-swarm.mobile', 2200)];
  expect(externalPerformanceQuality(row).state).toBe('strong');
  row.evidence[1].value = 94;
  expect(externalPerformanceQuality(row).state).toBe('below');
  row.evidence[1].value = 96; row.evidence[1].context!.samples = 2;
  expect(externalPerformanceQuality(row).state).toBe('samples');
  row.evidence[1].context!.samples = 5; row.evidence[1].measurement!.state = 'stale';
  expect(externalPerformanceQuality(row).state).toBe('stale');
  row.audience = 'internal';
  expect(externalPerformanceQuality(row).state).toBe('internal');
});
