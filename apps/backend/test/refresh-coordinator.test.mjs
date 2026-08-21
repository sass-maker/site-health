import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { refreshStaleEvidence } from '../lib/dashboard-backend/refresh-coordinator.mjs';
import { readRefreshReceipt } from '../lib/dashboard-backend/evidence-freshness.mjs';
import { DashboardStore } from '../lib/dashboard-backend/store.mjs';

const projection = {
  outcomes: {
    domains: [{ observedAt: '2026-08-21T10:00:00.000Z' }],
    performance: [{ observedAt: '2026-08-21T10:00:00.000Z' }],
    search: [{ observedAt: '2026-08-21T10:00:00.000Z' }],
    aiAwareness: [{ observedAt: '2026-08-21T10:00:00.000Z' }],
  },
};

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
    ]);
    assert.deepEqual(results.map((item) => [item.family, item.action]), [
      ['drank', 'refresh'],
      ['psi', 'refresh'],
      ['search', 'refresh'],
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
