import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  buildEvidenceEnvelope,
  readRefreshReceipt,
  recordRefreshReceipt,
  reconcileAbandonedRefreshReceipts,
  withRefreshReceipt,
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

const runningReceipt = Object.freeze({
  schemaVersion: 'site-health.refresh-receipt.v1',
  source: 'search',
  scope: 'portfolio',
  projectId: null,
  runId: 'metric_stuck',
  label: 'Portfolio Search Console evidence',
  state: 'running',
  lastAttemptAt: '2026-09-05T07:38:47.096Z',
  lastSuccessAt: '2026-08-22T07:43:48.850Z',
  finishedAt: null,
  resultCount: null,
  failure: null,
});

test('a refresh still running past the abandonment bound reports failed, not refreshing', () => {
  const inFlight = buildEvidenceEnvelope({
    family: 'search',
    receipt: runningReceipt,
    now: '2026-09-05T09:38:47.096Z', // two hours in
  });
  assert.equal(inFlight.state, 'refreshing');

  const abandoned = buildEvidenceEnvelope({
    family: 'search',
    receipt: runningReceipt,
    now: '2026-09-05T15:38:47.096Z', // eight hours in
  });
  assert.equal(abandoned.state, 'failed');
  assert.equal(abandoned.failure.code, 'REFRESH_ABANDONED');
  // The stale success it was hiding is still reported honestly.
  assert.equal(abandoned.lastSuccessAt, '2026-08-22T07:43:48.850Z');
});

test('abandoned receipts are retired in the store without losing the last success', () => {
  const store = new DashboardStore({
    databasePath: join(mkdtempSync(join(tmpdir(), 'evidence-abandoned-')), 'dashboard.sqlite'),
  });
  try {
    store.setMetadata('evidence-refresh:search:portfolio', runningReceipt);
    store.setMetadata('evidence-refresh:psi:portfolio', {
      ...runningReceipt,
      source: 'psi',
      runId: 'metric_live',
      lastAttemptAt: '2026-09-05T15:00:00.000Z',
    });

    const reconciled = reconcileAbandonedRefreshReceipts(store, { now: '2026-09-05T15:38:47.096Z' });
    assert.deepEqual(reconciled.map((item) => item.key), ['evidence-refresh:search:portfolio']);

    const retired = readRefreshReceipt(store, 'search');
    assert.equal(retired.state, 'failed');
    assert.equal(retired.finishedAt, '2026-09-05T15:38:47.096Z');
    assert.equal(retired.failure.code, 'REFRESH_ABANDONED');
    assert.equal(retired.lastSuccessAt, '2026-08-22T07:43:48.850Z');
    // A run that started 38 minutes ago is still in flight and is left alone.
    assert.equal(readRefreshReceipt(store, 'psi').state, 'running');
  } finally {
    store.close();
  }
});

test('a collector that throws records a terminal failed receipt', async () => {
  const store = new DashboardStore({
    databasePath: join(mkdtempSync(join(tmpdir(), 'evidence-receipt-')), 'dashboard.sqlite'),
  });
  try {
    const run = {
      family: 'search',
      scope: 'portfolio',
      runId: 'search_one',
      label: 'Portfolio Search Console evidence',
      startedAt: '2026-09-05T08:00:00.000Z',
    };
    await assert.rejects(
      withRefreshReceipt(
        store,
        run,
        () => {
          assert.equal(readRefreshReceipt(store, 'search').state, 'running');
          throw Object.assign(new Error('Google Application Default Credentials are unavailable'), {
            code: 'SEARCH_CONSOLE_CREDENTIALS_UNAVAILABLE',
          });
        },
        { now: () => '2026-09-05T08:00:30.000Z', signals: [] },
      ),
      /Application Default Credentials/,
    );
    const receipt = readRefreshReceipt(store, 'search');
    assert.equal(receipt.state, 'failed');
    assert.equal(receipt.finishedAt, '2026-09-05T08:00:30.000Z');
    assert.equal(receipt.failure.code, 'SEARCH_CONSOLE_CREDENTIALS_UNAVAILABLE');
  } finally {
    store.close();
  }
});

test('a collector stopped by a signal records failed rather than staying running', async () => {
  const store = new DashboardStore({
    databasePath: join(mkdtempSync(join(tmpdir(), 'evidence-signal-')), 'dashboard.sqlite'),
  });
  const interrupts = [];
  try {
    await withRefreshReceipt(
      store,
      { family: 'psi', scope: 'portfolio', runId: 'psi_one', label: 'Portfolio PSI' },
      async () => {
        process.emit('SIGTERM');
        return 'the work never got this far in a real stop';
      },
      {
        now: () => '2026-09-05T08:10:00.000Z',
        signals: ['SIGTERM'],
        onInterrupt: (signal) => interrupts.push(signal),
      },
    );
    assert.deepEqual(interrupts, ['SIGTERM']);
    const receipt = readRefreshReceipt(store, 'psi');
    assert.equal(receipt.state, 'failed');
    assert.equal(receipt.failure.code, 'REFRESH_INTERRUPTED');
    assert.equal(receipt.finishedAt, '2026-09-05T08:10:00.000Z');
  } finally {
    store.close();
  }
});

test('a succeeded receipt records how many surfaces the run actually covered', async () => {
  const store = new DashboardStore({
    databasePath: join(mkdtempSync(join(tmpdir(), 'evidence-coverage-')), 'dashboard.sqlite'),
  });
  try {
    await withRefreshReceipt(
      store,
      { family: 'psi', scope: 'portfolio', runId: 'psi_partial', label: 'Portfolio PSI' },
      async () => ({ completed: 6, failed: [] }),
      {
        now: () => '2026-09-05T08:20:00.000Z',
        signals: [],
        summarize: (result) => ({ resultCount: result.completed }),
      },
    );
    // Six of the 36 public targets: the receipt succeeded, but it must not read
    // like the full sweep the backend launches.
    assert.equal(readRefreshReceipt(store, 'psi').resultCount, 6);
  } finally {
    store.close();
  }
});
