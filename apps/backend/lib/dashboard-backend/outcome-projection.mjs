import { PERFORMANCE_TARGET } from './performance-policy.mjs';
import { buildEvidenceEnvelope } from './evidence-freshness.mjs';

function boundedSignal(signal, { includeSeries = false } = {}) {
  if (!signal) return null;
  const { series, ...bounded } = signal;
  return includeSeries
    ? { ...bounded, series: (series ?? []).slice(-60) }
    : bounded;
}

export const OUTCOME_SOURCES = Object.freeze({
  domains: 'drank',
  performance: 'psi',
  search: 'search',
  'seo-audit': 'seo',
  'geo-awareness': 'geo',
  'ai-awareness': 'ai',
});

export function outcomeProjection(projection, family, { receipt = null, now } = {}) {
  const outcomes = projection.outcomes ?? {};
  let rows = [];
  if (family === 'domains') {
    rows = (outcomes.domains ?? []).map((row) => ({
      ...row,
      signal: boundedSignal(row.signal, { includeSeries: true }),
    }));
  } else if (family === 'ai-awareness') {
    rows = (outcomes.aiAwareness ?? []).map((row) => ({
      ...row,
      mention: boundedSignal(row.mention),
      recommendation: boundedSignal(row.recommendation),
      citation: boundedSignal(row.citation),
      averageRank: boundedSignal(row.averageRank),
      questions: (row.questions ?? []).slice(0, 12).map((question) => ({
        id: question.id,
        setId: question.setId,
        text: question.text,
      })),
      coverage: row.coverage
        ? {
            configured: Number(row.coverage.configured ?? 0),
            completed: Number(row.coverage.completed ?? 0),
            unavailable: Number(row.coverage.unavailable ?? 0),
            timedOut: Number(row.coverage.timedOut ?? 0),
            failed: Number(row.coverage.failed ?? 0),
          }
        : null,
      attempts: (row.attempts ?? []).slice(0, 24).map((attempt) => ({
        promptId: attempt.promptId,
        persona: attempt.persona,
        providerId: attempt.providerId,
        model: attempt.model,
        status: attempt.status,
      })),
      citationSources: {
        total: Number(row.citationSources?.total ?? 0),
        owned: Number(row.citationSources?.owned ?? 0),
        external: Number(row.citationSources?.external ?? 0),
        unclassified: Number(row.citationSources?.unclassified ?? 0),
        sources: (row.citationSources?.sources ?? []).slice(0, 50).map((source) => ({
          url: source.url,
          host: source.host,
          ownership: source.ownership,
        })),
      },
    }));
  } else if (family === 'performance') {
    rows = (outcomes.performance ?? []).map((row) => ({
      ...row,
      psi: boundedSignal(row.psi),
      lcp: boundedSignal(row.lcp),
    }));
  } else if (family === 'search') {
    rows = (outcomes.search ?? []).map((row) => ({
      ...row,
      impressions: boundedSignal(row.impressions, { includeSeries: true }),
      clicks: boundedSignal(row.clicks, { includeSeries: true }),
      ctr: boundedSignal(row.ctr, { includeSeries: true }),
      averagePosition: boundedSignal(row.averagePosition, { includeSeries: true }),
    }));
  } else if (family === 'seo-audit') {
    rows = (outcomes.seoAudit ?? []).map((row) => ({
      ...row,
      pass: boundedSignal(row.pass),
      fail: boundedSignal(row.fail),
      warn: boundedSignal(row.warn),
      failedChecks: (row.failedChecks ?? []).slice(0, 20),
      warningChecks: (row.warningChecks ?? []).slice(0, 20),
    }));
  } else if (family === 'geo-awareness') {
    rows = (outcomes.geoAwareness ?? []).map((row) => ({
      ...row,
      topThree: boundedSignal(row.topThree, { includeSeries: true }),
      pageOne: boundedSignal(row.pageOne, { includeSeries: true }),
      observations: (row.observations ?? []).slice(0, 12),
    }));
  } else {
    return null;
  }
  return {
    schemaVersion: 'dashboard.owner-outcome.v1',
    generatedAt: projection.generatedAt,
    family,
    source: buildEvidenceEnvelope({ family: OUTCOME_SOURCES[family], rows, receipt, now }),
    rows,
    ...(family === 'search' ? { indexCoverage: outcomes.indexCoverage ?? [] } : {}),
    ...(family === 'performance'
      ? { thresholds: { psiScore: PERFORMANCE_TARGET.psiScore, lcpMilliseconds: PERFORMANCE_TARGET.lcpMilliseconds } }
      : {}),
  };
}

