import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  buildEvidenceEnvelope,
  readRefreshReceipt,
  recordRefreshReceipt,
} from '../lib/dashboard-backend/evidence-freshness.mjs';
import { DashboardStore } from '../lib/dashboard-backend/store.mjs';

test('failed refresh never advances successful evidence freshness', () => {
  const store = new DashboardStore({
    databasePath: join(mkdtempSync(join(tmpdir(), 'evidence-freshness-')), 'dashboard.sqlite'),
  });
  try {
    recordRefreshReceipt(store, {
      runId: 'metric_one', family: 'drank', scope: 'portfolio', state: 'succeeded',
      startedAt: '2026-08-17T00:00:00.000Z', finishedAt: '2026-08-17T00:01:00.000Z',
      label: 'Portfolio D-Rank', summary: 'completed',
    });
    recordRefreshReceipt(store, {
      runId: 'metric_two', family: 'drank', scope: 'portfolio', state: 'failed',
      startedAt: '2026-08-21T00:00:00.000Z', finishedAt: '2026-08-21T00:01:00.000Z',
      label: 'Portfolio D-Rank', summary: '/Users/private/provider failed',
    });
    const receipt = readRefreshReceipt(store, 'drank');
    assert.equal(receipt.lastSuccessAt, '2026-08-17T00:01:00.000Z');
    assert.equal(receipt.failure.message.includes('/Users/'), false);
    const envelope = buildEvidenceEnvelope({
      family: 'drank',
      rows: [{ observedAt: '2026-08-17T00:00:00.000Z' }],
      receipt,
      now: '2026-08-21T12:00:00.000Z',
    });
    assert.equal(envelope.state, 'failed');
    assert.equal(envelope.observedAt, '2026-08-17T00:00:00.000Z');
    assert.equal(envelope.lastSuccessAt, '2026-08-17T00:01:00.000Z');
  } finally {
    store.close();
  }
});

test('a current observation is fresh without requiring a refresh receipt', () => {
  const envelope = buildEvidenceEnvelope({
    family: 'search',
    rows: [{ observedAt: '2026-08-21T08:00:00.000Z' }],
    now: '2026-08-21T12:00:00.000Z',
  });
  assert.equal(envelope.state, 'fresh');
  assert.equal(envelope.lastSuccessAt, '2026-08-21T08:00:00.000Z');
});
