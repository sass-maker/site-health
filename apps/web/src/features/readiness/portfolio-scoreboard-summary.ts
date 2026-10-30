import { PERFORMANCE_TARGET } from '../../../../backend/lib/dashboard-backend/performance-policy.mjs';
import { CHECKLIST_ITEMS, effortSummary, requirementCompletion, resultSummary, type ReadinessArea, type ReadinessProduct } from './readiness-framework';

export function summarizePortfolioProduct(product: ReadinessProduct) {
  const productEffort = effortSummary(product.state, 'product');
  const growthEffort = effortSummary(product.state, 'growth');
  const designEntry = product.state.checklist?.['product-design'];
  const designScore = product.state.applicability.product.state === 'exempt' ? null : requirementCompletion(designEntry);
  const foundationsScore = requirementCompletion(product.state.checklist?.['growth-foundations']);
  const designObservedAt = designEntry?.evidenceRefs.reduce<string | null>((latest, ref) => !latest || Date.parse(ref.observedAt) > Date.parse(latest) ? ref.observedAt : latest, null) ?? null;
  const itemCount = (area: ReadinessArea) => CHECKLIST_ITEMS[area].filter(item => product.state.checklist?.[item.id]).length;
  const knownApplicable = [productEffort, growthEffort].filter(summary => summary.status !== 'exempt' && summary.status !== 'unknown');
  const unresolvedScope = [productEffort, growthEffort].some(summary => summary.status === 'unknown');
  const divisor = knownApplicable.length === 2 ? 20 : 10;
  const knownScore = knownApplicable.reduce((sum, summary) => sum + (summary.score ?? summary.minimumScore ?? 0), 0);
  const maxKnownScore = knownApplicable.reduce((sum, summary) => sum + (summary.score ?? summary.maximumScore ?? 0), 0);
  const exactTotal = !unresolvedScope && knownApplicable.every(summary => summary.score !== null);
  const effortTotal = unresolvedScope
    ? 'Scope unknown'
    : knownApplicable.length === 0
      ? 'Exempt'
    : exactTotal
      ? `${Math.round(knownApplicable.reduce((sum, summary) => sum + summary.score!, 0) * 10) / 10}/${divisor}`
      : knownApplicable.every(summary => summary.minimumScore !== null && summary.maximumScore !== null)
        ? `${Math.round(knownScore * 10) / 10}–${Math.round(maxKnownScore * 10) / 10}/${divisor} range`
        : 'Not estimated';
  const effortSortValue = unresolvedScope || knownApplicable.length === 0 || (exactTotal === false && knownApplicable.some(summary => summary.minimumScore === null))
    ? null
    : Math.round((exactTotal ? knownApplicable.reduce((sum, summary) => sum + summary.score!, 0) : knownScore) / divisor * 1000) / 1000;

  const evidence = (predicate: (row: ReadinessProduct['evidence'][number]) => boolean) => product.evidence
    .filter(row => row.value !== null && predicate(row))
    .sort((a, b) => Number(b.measurement?.state === 'current') - Number(a.measurement?.state === 'current') || Date.parse(b.observedAt ?? '') - Date.parse(a.observedAt ?? ''))[0] ?? null;
  const desktop = evidence(row => row.source === 'performance' && row.id.includes('psi'));
  const mobile = evidence(row => row.id === 'mobile:psi');
  const speedEffort = requirementCompletion(product.state.checklist?.['product-speed']);
  const seoSurface = evidence(row => row.source === 'seoAudit' && /^seoAudit:(pass|fail):/.test(row.id));
  const sameSeoSurface = (row: ReadinessProduct['evidence'][number]) => row.id.split(':').slice(2).join(':') === seoSurface?.id.split(':').slice(2).join(':') && row.observedAt === seoSurface?.observedAt;
  const seoPass = evidence(row => row.source === 'seoAudit' && row.id.startsWith('seoAudit:pass:') && sameSeoSurface(row));
  const seoWarn = evidence(row => row.source === 'seoAudit' && row.id.startsWith('seoAudit:warn:') && sameSeoSurface(row));
  const seoChecks = evidence(row => row.source === 'seoAudit' && row.id.startsWith('seoAudit:checks:') && sameSeoSurface(row));
  const seoFail = evidence(row => row.source === 'seoAudit' && row.id.startsWith('seoAudit:fail:') && sameSeoSurface(row));
  const clicks = evidence(row => row.source === 'search' && row.id.startsWith('search:clicks'));
  const localProxy = product.evidence.find(row => row.id === 'monthly-local-proxy') ?? null;
  const browserProxy = localProxy ?? evidence(row => row.id === 'monthly-browser-proxy' && row.source === 'app-health.browser-report');
  const productResults = resultSummary(product.state, 'product');
  const growthResults = resultSummary(product.state, 'growth');
  const qualifiedResultScores = productResults.qualified + growthResults.qualified;

  return {
    productEffort, growthEffort, effortTotal, effortSortValue, unresolvedScope, itemCount,
    designScore, designConfidence: designEntry?.confidence ?? 'Unrecorded', designStatus: designEntry?.status ?? 'not-started', designObservedAt, foundationsScore,
    desktop, mobile, speedEffort, seoPass, seoFail, seoWarn, seoChecks, clicks, browserProxy,
    productResults, growthResults, qualifiedResultScores,
  };
}

export function effortCell(summary: ReturnType<typeof summarizePortfolioProduct>['productEffort']) {
  if (summary.status === 'exempt') return 'Exempt';
  if (summary.status === 'unknown') return 'Scope unknown';
  if (summary.score !== null) return `${summary.score}/10`;
  if (summary.minimumScore !== null && summary.maximumScore !== null) return `${summary.minimumScore}–${summary.maximumScore}/10 range`;
  return 'Not estimated';
}

export function observationText(row: ReadinessProduct['evidence'][number] | null) {
  if (!row) return 'No dated reading';
  return `${row.value?.toLocaleString() ?? 'Unknown'}${row.value != null && row.unit ? ` ${row.unit}` : ''}${row.measurement && row.measurement.state !== 'current' ? ` · ${row.measurement.state}` : ''}`.trim();
}

export function currentReadingValue(row: ReadinessProduct['evidence'][number] | null) {
  return row?.measurement && row.measurement.state !== 'current' ? null : row?.value ?? null;
}

export function externalPerformanceQuality(product: ReadinessProduct) {
  if (product.audience !== 'public') return { state: 'internal', label: 'Internal scope' };
  const summary = summarizePortfolioProduct(product);
  const rows = [summary.desktop, summary.mobile];
  if (rows.some(row => row?.value == null)) return { state: 'missing', label: 'Not measured' };
  if (rows.some(row => row?.measurement?.state === 'retained')) return { state: 'retained', label: 'Latest check incomplete' };
  if (rows.some(row => row?.measurement?.state !== 'current')) return { state: 'stale', label: 'Historical reading' };
  const lcp = product.evidence.filter(row => row.id === 'mobile:lcp' || row.source === 'performance' && row.id.startsWith('performance:lcp:'));
  if (lcp.length !== 2 || lcp.some(row => currentReadingValue(row) === null)) return { state: 'missing', label: 'LCP unmeasured' };
  const strong = rows.every(row => row!.value! >= PERFORMANCE_TARGET.psiScore) && lcp.every(row => row.value! <= PERFORMANCE_TARGET.lcpMilliseconds);
  if (!strong) return { state: 'below', label: 'Below target' };
  if (rows.some(row => { const samples = row?.context?.samples; return typeof samples !== 'number' || !Number.isInteger(samples) || samples < PERFORMANCE_TARGET.samplesPerPreset; })) return { state: 'samples', label: 'Needs 5-run check' };
  return { state: 'strong', label: 'Strong lab' };
}
