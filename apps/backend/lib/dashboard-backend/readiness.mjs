import { currentProjects, emptyReadinessState, effortSummary, resultSummary, READINESS_VERSION } from './readiness-model.mjs';
import { uiLibraryCoverage } from './ui-library-coverage.mjs';

const FAMILIES = {
  domains: [['signal', 'Domain authority', 'score']],
  performance: [['psi', 'Desktop PSI performance', '/100'], ['lcp', 'Desktop largest contentful paint', 'ms']],
  search: [['impressions', 'Search impressions', 'impressions'], ['clicks', 'Search clicks', 'clicks'], ['averagePosition', 'Google average position', 'position']],
  seoAudit: [['pass', 'SEO checks passed', 'checks'], ['fail', 'SEO checks failed', 'checks']],
  geoAwareness: [['topThree', 'Web search top-three coverage', '%'], ['pageOne', 'Web search page-one coverage', '%']],
  aiAwareness: [['mention', 'AI mentions', '%'], ['recommendation', 'AI recommendations', '%'], ['citation', 'AI citations', '%']],
};
export function readinessObservations(projects, projection = {}, clarityByProject = {}) {
  return projects.flatMap(project => {
    const rows = [];
    for (const [family, metrics] of Object.entries(FAMILIES)) {
      const matches = (projection.outcomes?.[family] ?? []).filter(row => row.projectId === project.id || row.projects?.some(p => p.projectId === project.id));
      for (const [key, label, unit] of metrics) {
        if (!matches.length) rows.push({ projectId: project.id, id: `${family}:${key}`, source: family, label, unit, value: null, observedAt: null, qualification: 'unknown', gap: 'No source observation for this product' });
        for (const [index, row] of matches.entries()) {
          const signal = row[key];
          const value = typeof signal?.value === 'number' && Number.isFinite(signal.value) ? signal.value : null;
          rows.push({ projectId: project.id, id: `${family}:${key}:${index}`, source: family, label: `${label}${row.domain ? ` · ${row.domain}` : ''}`, unit, value, observedAt: signal?.observedAt ?? row.observedAt ?? null, qualification: value === null ? 'unknown' : 'proxy', window: typeof row.period === 'string' ? row.period : JSON.stringify(row.period ?? null), gap: value === null ? `Not measured${row.status ? ` (${row.status})` : ''}` : [row.status === 'stale' ? 'Source observation is stale' : null, row.coverage ? `Samples: ${row.coverage.completed ?? 'unknown'} completed / ${row.coverage.configured ?? 'unknown'} configured` : null, row.queries !== undefined ? `${row.queries} observed queries` : null, 'Source evidence; qualifying definition and benchmark still require review'].filter(Boolean).join(' · ') });
        }
      }
    }
    const performance = projection.outcomes?.performance?.find(row => row.projectId === project.id);
    for (const key of ['psi', 'lcp']) {
      const signal = performance?.mobile?.[key];
      rows.push({ projectId: project.id, id: `mobile:${key}`, label: key === 'psi' ? 'Mobile PSI performance' : 'Mobile LCP',
        value: signal?.value ?? null, unit: key === 'psi' ? '/100' : 'ms', observedAt: signal?.observedAt ?? null,
        source: 'psi-swarm.mobile', qualification: signal?.value == null ? 'unknown' : 'proxy',
        gap: 'Mobile-mid laboratory samples. Field Core Web Vitals and core-workflow interaction budgets are separate.' });
    }
    const clarity = clarityByProject[project.id];
    for (const [key, label] of [['sessions', 'Clarity sessions'], ['uniqueBrowsers', 'Clarity unique browsers']]) {
      const value = clarity?.snapshot?.metrics?.[key];
      rows.push({ projectId: project.id, id: `clarity:${key}`, source: 'clarity', label, unit: key === 'sessions' ? 'sessions' : 'browsers', value: typeof value === 'number' && Number.isFinite(value) ? value : null, observedAt: clarity?.snapshot?.observedAt ?? null, qualification: typeof value === 'number' ? 'proxy' : 'unknown', gap: 'Browser traffic is not meaningful product use; bots, QA and background work need qualification' });
    }
    return rows;
  });
}
export function buildReadinessProjection({ projects = [], readiness = {}, observations = [], uiCoverage = null, generatedAt = new Date().toISOString() }) {
  const current = currentProjects(projects);
  return {
    schemaVersion: READINESS_VERSION,
    generatedAt,
    projects: current.map(project => {
      const saved = readiness[project.id] ?? { revision: 0, updatedAt: null, state: emptyReadinessState() };
      const evidence = observations.filter(row => row.projectId === project.id).map(row => ({ ...row }));
      return { id: project.id, name: project.name, ...saved, form: project.form, platforms: project.platforms, audience: project.audience, priority: project.priority, priorityApplicable: project.priorityApplicable, growthFocus: project.growthFocus, evidence, uiLibrary: uiLibraryCoverage(uiCoverage, project.id, Date.parse(generatedAt)),
        coverageGaps: [...new Set(evidence.filter(row => row.qualification !== 'qualified').map(row => row.gap).filter(Boolean))],
        scores: Object.fromEntries(['product', 'growth'].map(area => [area, { effort: effortSummary(saved.state, area), results: resultSummary(saved.state, area) }])),
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
