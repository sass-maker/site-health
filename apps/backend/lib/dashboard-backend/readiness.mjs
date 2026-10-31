import { currentProjects, emptyReadinessState, effortSummary, resultSummary, READINESS_VERSION } from './readiness-model.mjs';
import { qualifyObservation, measurementCoverage } from './measurement-contract.mjs';
import { uiLibraryCoverage } from './ui-library-coverage-core.mjs';
import { PERFORMANCE_TARGET } from './performance-policy.mjs';

const FAMILIES = {
  domains: [['signal', 'Ahrefs Domain Rating', 'DR /100']],
  performance: [['psi', 'Desktop PSI performance', '/100'], ['lcp', 'Desktop largest contentful paint', 'ms']],
  search: [['impressions', 'Search impressions', 'impressions'], ['clicks', 'Search clicks', 'clicks'], ['averagePosition', 'Google average position', 'position']],
  seoAudit: [['pass', 'SEO checks passed', 'checks'], ['fail', 'SEO checks failed', 'checks'], ['warn', 'SEO checks warned', 'checks'], ['checks', 'SEO checks total', 'checks']],
  geoAwareness: [['topThree', 'Web search top-three coverage', '%'], ['pageOne', 'Web search page-one coverage', '%']],
  aiAwareness: [['mention', 'AI mentions', '%'], ['recommendation', 'AI recommendations', '%'], ['citation', 'AI citations', '%']],
};

function incompletePerformanceDetail(batch, samples) {
  if (!batch) return undefined;
  return `Latest attempt incomplete: ${batch.sampleCount}/${PERFORMANCE_TARGET.samplesPerPreset} samples observed ${batch.observedAt}. ${samples >= PERFORMANCE_TARGET.samplesPerPreset ? 'Last complete reading retained.' : 'Partial reading; no complete cohort available.'}`;
}

function performanceDetail(row) {
  return [incompletePerformanceDetail(row?.pendingBatch, row?.samples), row?.provenanceDetail].filter(Boolean).join(' · ') || undefined;
}

function sourceContext(family, row) {
  const context = { scope: row.domain ?? row.url ?? null };
  if (family === 'performance') return { ...context, method: 'Laboratory median; field CWV and native workflow speed unmeasured', preset: row.preset ?? 'desktop', samples: row.samples ?? null, detail: performanceDetail(row) };
  if (family === 'seoAudit') return { ...context, method: 'Technical audit of the stated URL; not all-site content quality', detail: `${row.checks ?? '?'} total checks; reachable: ${row.reachable ?? 'unknown'}; ${row.url ?? ''}` };
  if (family === 'aiAwareness') return { ...context, method: 'Exploratory pooled AI sample; not neutral discovery unless prompt intent is known',
    completed: row.coverage?.completed ?? null, configured: row.coverage?.configured ?? null,
    unavailable: row.coverage ? (row.coverage.unavailable ?? 0) + (row.coverage.timedOut ?? 0) + (row.coverage.failed ?? 0) : null,
    intent: 'Mixed/unspecified intent; do not interpret as nonbrand visibility',
    models: [...new Set((row.attempts ?? []).map(a => `${a.providerId ?? '?'} / ${a.model ?? '?'}`))].join(', '),
    detail: (row.questions ?? []).map(q => q.text).filter(Boolean).join(' | ') };
  if (family === 'geoAwareness') return { ...context, method: 'Fixed mixed-intent web-search panel; not market-wide visibility', samples: row.queries ?? null, intent: [...new Set((row.observations ?? []).map(item => item.kind ?? 'unspecified'))].join(', '), detail: (row.observations ?? []).map(item => `${item.kind ?? 'unspecified'}: ${item.query} → ${item.class}`).join(' | ') };
  return context;
}
function indexObservations(projectId, rows) {
  return rows.filter(row => row.projectId === projectId).flatMap((row, index) => {
    const c = row.indexCoverage ?? {};
    const report = c.googleReport;
    const scope = c.surfaceUrl ?? row.domain;
    const exempt = ['private-surface', 'no-public-surface'].includes(c.state);
    const base = { projectId, source: 'indexCoverage', unit: '%', qualification: exempt ? 'exempt' : 'proxy' };
    return [
      { ...base, id: `indexCoverage:google:${index}`, label: `Google indexed share of named sitemap · ${scope ?? ''}`,
        value: report?.totalKnownCount > 0 ? 100 * report.indexedCount / report.totalKnownCount : null,
        observedAt: report?.reportDate ? `${report.reportDate}T00:00:00Z` : null,
        status: c.googleReportStale ? 'stale' : undefined,
        context: { scope, method: 'Google Page Indexing named-sitemap report', numerator: report?.indexedCount, denominator: report?.totalKnownCount, cohort: 'Google-known URLs', detail: report?.sitemapUrl },
        gap: 'Google-known sitemap URLs are a separate cohort from today’s discovered inventory. No report is not zero indexed.' },
      { ...base, id: `indexCoverage:inventory:${index}`, label: `Current inventory indexed share · ${scope ?? ''}`,
        value: c.indexedPercentage ?? null, observedAt: c.observedAt ?? null,
        context: { scope, method: 'URL Inspection of current sitemap inventory', numerator: c.indexed, denominator: c.total, cohort: 'discovered URLs', detail: `${c.checked ?? 0}/${c.total ?? '?'} inspected; inventory ${c.inventoryComplete ? 'complete' : 'partial'} dated ${c.inventoryObservedAt ?? 'unknown'}` },
        gap: 'A full-inventory percentage requires a fresh complete inventory and a known, fresh inspection for every URL; partial inspection is not full indexing coverage.' },
    ];
  });
}

export function readinessObservations(projects, projection = {}, clarityByProject = {}) {
  return projects.flatMap(project => {
    const rows = [];
    for (const [family, metrics] of Object.entries(FAMILIES)) {
      const matches = (projection.outcomes?.[family] ?? []).filter(row => row.projectId === project.id || row.projects?.some(p => p.projectId === project.id));
      for (const [key, label, unit] of metrics) {
        if (!matches.length) rows.push({ projectId: project.id, id: `${family}:${key}`, source: family, label, unit, value: null, observedAt: null, qualification: 'unknown', gap: 'No source observation for this product' });
        for (const [index, row] of matches.entries()) {
          const signal = key === 'checks' ? { value: row.checks, observedAt: row.observedAt } : row[key];
          const value = typeof signal?.value === 'number' && Number.isFinite(signal.value) ? signal.value : null;
          rows.push({ projectId: project.id, id: `${family}:${key}:${index}`, source: family, label: `${label}${row.domain ? ` · ${row.domain}` : ''}`, unit, value, observedAt: signal?.observedAt ?? row.observedAt ?? null, qualification: value === null ? 'unknown' : 'proxy', status: ['stale', 'invalid', 'unavailable', 'retained'].includes(row.status) ? row.status : undefined, context: sourceContext(family, row), window: typeof row.period === 'string' ? row.period : JSON.stringify(row.period ?? null), gap: value === null ? `Not measured${row.status ? ` (${row.status})` : ''}` : [row.status === 'stale' ? 'Source observation is stale' : null, row.coverage ? `Samples: ${row.coverage.completed ?? 'unknown'} completed / ${row.coverage.configured ?? 'unknown'} configured` : null, row.queries !== undefined ? `${row.queries} observed queries` : null, 'Source evidence; qualifying definition and benchmark still require review'].filter(Boolean).join(' · ') });
        }
      }
    }
    const performance = projection.outcomes?.performance?.find(row => row.projectId === project.id);
    for (const key of ['psi', 'lcp']) {
      const signal = performance?.mobile?.[key];
      rows.push({ projectId: project.id, id: `mobile:${key}`, label: key === 'psi' ? 'Mobile PSI performance' : 'Mobile LCP',
        value: signal?.value ?? null, unit: key === 'psi' ? '/100' : 'ms', observedAt: signal?.observedAt ?? null,
        source: 'psi-swarm.mobile', status: performance?.mobile?.status === 'retained' ? 'retained' : undefined, context: { scope: performance?.domain, method: 'Laboratory median; field CWV and native workflow speed unmeasured', preset: 'mobile-mid', samples: performance?.mobile?.samples ?? null, detail: performanceDetail(performance?.mobile) }, qualification: signal?.value == null ? 'unknown' : 'proxy',
        gap: 'Mobile-mid laboratory samples. Field Core Web Vitals and core-workflow interaction budgets are separate.' });
    }
    rows.push(...indexObservations(project.id, projection.outcomes?.indexCoverage ?? []));
    const clarity = clarityByProject[project.id];
    for (const [key, label] of [['sessions', 'Clarity sessions'], ['uniqueBrowsers', 'Clarity unique browsers']]) {
      const value = clarity?.snapshot?.metrics?.[key];
      rows.push({ projectId: project.id, id: `clarity:${key}`, source: 'clarity', label, unit: key === 'sessions' ? 'sessions' : 'browsers', value: typeof value === 'number' && Number.isFinite(value) ? value : null, observedAt: clarity?.snapshot?.observedAt ?? null, qualification: typeof value === 'number' && Number.isFinite(value) ? 'proxy' : 'unknown', gap: 'Browser traffic is not meaningful product use; bots, QA and background work need qualification' });
    }
    return rows;
  });
}
export function buildReadinessProjection({ projects = [], readiness = {}, observations = [], uiCoverage = null, coverageProvider = uiLibraryCoverage, generatedAt = new Date().toISOString() }) {
  const current = currentProjects(projects);
  return {
    schemaVersion: READINESS_VERSION,
    generatedAt,
    projects: current.map(project => {
      const saved = readiness[project.id] ?? { revision: 0, updatedAt: null, state: emptyReadinessState() };
      const evidence = observations.filter(row => row.projectId === project.id).map(row => qualifyObservation(row, generatedAt));
      return { id: project.id, name: project.name, ...saved, form: project.form, platforms: project.platforms, audience: project.audience, priority: project.priority, priorityApplicable: project.priorityApplicable, growthFocus: project.growthFocus, evidence, uiLibrary: coverageProvider(uiCoverage, project.id, Date.parse(generatedAt)),
        measurementCoverage: measurementCoverage(evidence),
        coverageGaps: [...new Set(evidence.filter(row => !['current', 'exempt'].includes(row.measurement.state)).map(row => row.gap).filter(Boolean))],
        scores: Object.fromEntries(['product', 'growth'].map(area => [area, { effort: effortSummary(saved.state, area), results: resultSummary(saved.state, area, generatedAt) }])),
      };
    }),
  };
}
export function saveReadiness(store, projectId, body, now) {
  if (!body || Object.keys(body).some(key => !['expectedRevision', 'idempotencyKey', 'state'].includes(key))) throw Object.assign(new Error('Invalid readiness update'), { code: 'INVALID_READINESS_REQUEST', statusCode: 422 });
  if (!currentProjects(store.projects).some(project => project.id === projectId)) throw Object.assign(new Error('Readiness product is not current'), { statusCode: 404 });
  const result = store.append({ type: 'readiness.state-updated', projectId, actor: { type: 'owner', id: 'readiness-owner' }, idempotencyKey: body.idempotencyKey, payload: { expectedRevision: body.expectedRevision, state: body.state } }, { now });
  return { projectId, revision: result.event.payload.expectedRevision + 1, updatedAt: result.event.recordedAt, duplicate: result.duplicate, state: result.event.payload.state };
}
