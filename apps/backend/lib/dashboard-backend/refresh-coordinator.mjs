import { randomUUID } from 'node:crypto';

import { AI_COLLECTION_UNAVAILABLE, buildEvidenceEnvelope, evidenceRefreshDue, readRefreshReceipt, recordRefreshReceipt } from './evidence-freshness.mjs';

const SOURCES = Object.freeze([
  { family: 'drank', outcome: 'domains', auto: () => true },
  { family: 'psi', outcome: 'performance', auto: () => true },
  { family: 'search', outcome: 'search', auto: () => true },
  { family: 'seo', outcome: 'seoAudit', auto: () => true },
  { family: 'ai', outcome: 'aiAwareness', auto: () => false },
]);

function unavailableRun(family, now, code, summary) {
  return {
    runId: `boot_${family}_${randomUUID().replaceAll('-', '')}`,
    family,
    projectId: null,
    scope: 'portfolio',
    label: `${family} startup refresh`,
    state: 'unavailable',
    startedAt: now,
    finishedAt: now,
    code,
    summary,
  };
}

export function refreshStaleEvidence({
  store,
  projection,
  metricRunController,
  env = process.env,
  now = new Date().toISOString(),
  force = false,
} = {}) {
  const results = [];
  for (const source of SOURCES) {
    const rows = projection?.outcomes?.[source.outcome] ?? [];
    const envelope = buildEvidenceEnvelope({
      family: source.family,
      rows,
      receipt: readRefreshReceipt(store, source.family),
      now,
    });
    if (!force && !evidenceRefreshDue(envelope, now)) {
      results.push({ family: source.family, action: 'cached', state: envelope.state });
      continue;
    }
    if (!source.auto(env)) {
      const run = unavailableRun(source.family, now, AI_COLLECTION_UNAVAILABLE.code, AI_COLLECTION_UNAVAILABLE.message);
      recordRefreshReceipt(store, run);
      results.push({ family: source.family, action: 'unavailable', state: run.state, code: run.code });
      continue;
    }
    try {
      const run = metricRunController.start({ family: source.family, scope: 'portfolio' });
      results.push({ family: source.family, action: 'refresh', state: run.state, runId: run.runId });
    } catch (error) {
      const run = unavailableRun(source.family, now, error.code ?? 'METRIC_RUNNER_UNAVAILABLE',
        'Collector unavailable. Cached evidence remains available.');
      recordRefreshReceipt(store, run);
      results.push({ family: source.family, action: 'unavailable', state: run.state, code: run.code });
    }
  }
  return results;
}
