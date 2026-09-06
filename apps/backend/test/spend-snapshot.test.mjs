import assert from 'node:assert/strict';
import test from 'node:test';

import { readSpendSnapshot } from '../lib/dashboard-backend/spend.mjs';

function storeWith(value) {
  return {
    getMetadata(key) {
      return key === 'spend-snapshot:portfolio' && value ? { value } : null;
    },
  };
}

test('no stored snapshot reports not-collected rather than an empty run of zeroes', () => {
  const snapshot = readSpendSnapshot(storeWith(null));
  assert.equal(snapshot.state, 'not-collected');
  assert.equal(snapshot.observedAt, null);
  assert.equal(snapshot.runId, null);
  assert.deepEqual(snapshot.providers, []);
});

test('a provider whose billing surface was unreachable stays unknown, never zero', () => {
  // SAR-17 as stored: the authorized Cloudflare grant carries no billing scope, so the cost is
  // unreadable. Rendering that as $0 would report a run-rate nobody measured.
  const snapshot = readSpendSnapshot(storeWith({
    schemaVersion: 'site-health.spend-snapshot.v1',
    scope: 'portfolio',
    state: 'partial',
    runId: '2026-09-05-sar-17-baseline',
    observedAt: '2026-09-05T07:28:03.000Z',
    alert: { severity: 'warning', reasons: [{ provider: 'turso', detail: 'Consequential provider evidence is unavailable' }] },
    providers: [{
      provider: 'cloudflare',
      spendState: 'unknown',
      evidenceStatus: 'partial',
      confidence: 'medium',
      costs: [],
      quotas: [{ metric: 'd1.storage.total', used: 2.561, limit: 5, unit: 'GB', percent: 51.22 }],
      evidenceGaps: ['Billing surface unreachable'],
    }],
  }));
  assert.equal(snapshot.state, 'partial');
  assert.equal(snapshot.providers.length, 1);
  const [cloudflare] = snapshot.providers;
  assert.equal(cloudflare.spendState, 'unknown');
  assert.deepEqual(cloudflare.costs, []);
  assert.equal(cloudflare.quotas[0].percent, 51.22);
  assert.equal(cloudflare.evidenceGaps.length, 1);
  assert.equal(snapshot.alert.severity, 'warning');
});

test('a non-numeric quota reading is dropped to null rather than coerced', () => {
  const snapshot = readSpendSnapshot(storeWith({
    state: 'partial',
    providers: [{
      provider: 'turso',
      spendState: 'unknown',
      quotas: [{ metric: 'rows.read', used: 'not retrievable', limit: null, unit: 'rows', percent: null }],
    }],
  }));
  const [quota] = snapshot.providers[0].quotas;
  assert.equal(quota.used, null);
  assert.equal(quota.limit, null);
  assert.equal(quota.percent, null);
});
