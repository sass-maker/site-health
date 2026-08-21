import { randomUUID } from 'node:crypto';

import { buildEvidenceEnvelope, evidenceRefreshDue, readRefreshReceipt, recordRefreshReceipt } from './evidence-freshness.mjs';

const SOURCES = Object.freeze([
  { family: 'drank', outcome: 'domains', auto: () => true },
  { family: 'psi', outcome: 'performance', auto: () => true },
  { family: 'search', outcome: 'search', auto: () => true },
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
    if (!force && !evidenceRefreshDue(envelope)) {
      results.push({ family: source.family, action: 'cached', state: envelope.state });
      continue;
    }
    if (!source.auto(env)) {
      const blocker = [
        'AI_RECURRING_APPROVAL_REQUIRED',
        'Latest provider evidence is retained; recurring paid AI collection requires an approved provider connection and per-launch cost cap.',
      ];
      const run = unavailableRun(source.family, now, blocker[0], blocker[1]);
      recordRefreshReceipt(store, run);
      results.push({ family: source.family, action: 'unavailable', state: run.state, code: run.code });
      continue;
    }
    const run = metricRunController.start({ family: source.family, scope: 'portfolio' });
    results.push({ family: source.family, action: 'refresh', state: run.state, runId: run.runId });
  }
  return results;
}
