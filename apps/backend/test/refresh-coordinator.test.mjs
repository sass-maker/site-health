import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { refreshStaleEvidence } from '../lib/dashboard-backend/refresh-coordinator.mjs';
import { readRefreshReceipt } from '../lib/dashboard-backend/evidence-freshness.mjs';
import { evidenceRefreshDue } from '../lib/dashboard-backend/evidence-freshness.mjs';
import { DashboardStore } from '../lib/dashboard-backend/store.mjs';

const projection = {
  outcomes: {
    domains: [{ observedAt: '2026-08-21T10:00:00.000Z' }],
    performance: [{ observedAt: '2026-08-21T10:00:00.000Z' }],
    search: [{ observedAt: '2026-08-21T10:00:00.000Z' }],
    seoAudit: [{ observedAt: '2026-08-21T10:00:00.000Z' }],
    aiAwareness: [{ observedAt: '2026-08-21T10:00:00.000Z' }],
  },
};

test('failed weekly collectors back off rather than retry on every ten-minute poll', () => {
  const envelope = { source: 'psi', state: 'failed', lastAttemptAt: '2026-10-27T00:00:00Z' };
  assert.equal(evidenceRefreshDue(envelope, '2026-10-27T00:10:00Z'), false);
  assert.equal(evidenceRefreshDue(envelope, '2026-10-27T06:00:00Z'), true);
});

test('forced prefill starts every free portfolio collector and records paid AI approval', () => {
  const store = new DashboardStore({
    databasePath: join(mkdtempSync(join(tmpdir(), 'refresh-coordinator-')), 'dashboard.sqlite'),
  });
  const calls = [];
  try {
    const results = refreshStaleEvidence({
      store,
      projection,
      force: true,
      now: '2026-08-21T12:00:00.000Z',
      metricRunController: {
        start(input) {
          calls.push(input);
          return { ...input, runId: `run_${input.family}`, state: 'running' };
        },
      },
    });
    assert.deepEqual(calls, [
      { family: 'drank', scope: 'portfolio' },
      { family: 'psi', scope: 'portfolio' },
      { family: 'search', scope: 'portfolio' },
      { family: 'seo', scope: 'portfolio' },
    ]);
    assert.deepEqual(results.map((item) => [item.family, item.action]), [
      ['drank', 'refresh'],
      ['psi', 'refresh'],
      ['search', 'refresh'],
      ['seo', 'refresh'],
      ['ai', 'unavailable'],
    ]);
    assert.equal(readRefreshReceipt(store, 'ai').failure.code, 'AI_RECURRING_APPROVAL_REQUIRED');
  } finally {
    store.close();
  }
});

test('non-forced startup keeps fresh provider evidence cached', () => {
  const store = new DashboardStore({
    databasePath: join(mkdtempSync(join(tmpdir(), 'refresh-coordinator-')), 'dashboard.sqlite'),
  });
  try {
    const results = refreshStaleEvidence({
      store,
      projection,
      force: false,
      now: '2026-08-21T12:00:00.000Z',
      metricRunController: { start() { throw new Error('fresh evidence should not refresh'); } },
    });
    assert.equal(results.every((item) => item.action === 'cached'), true);
  } finally {
    store.close();
  }
});

test('an unavailable sibling collector cannot take the owner backend offline', () => {
  const store = new DashboardStore({ databasePath: join(mkdtempSync(join(tmpdir(), 'refresh-unavailable-')), 'dashboard.sqlite') });
  try {
    const results = refreshStaleEvidence({
      store, projection, force: true,
      metricRunController: { start() { throw Object.assign(new Error('missing checkout'), { code: 'METRIC_RUNNER_UNAVAILABLE' }); } },
    });
    assert.equal(results.length, 5);
    assert.ok(results.every((result) => result.action === 'unavailable'));
    assert.equal(readRefreshReceipt(store, 'drank').failure.code, 'METRIC_RUNNER_UNAVAILABLE');
  } finally { store.close(); }
});
