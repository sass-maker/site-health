import assert from 'node:assert/strict';
import test from 'node:test';
import { importUsageExport, usageObservations } from '../lib/dashboard-backend/usage-evidence.mjs';

const now = '2026-10-30T10:00:00Z';
const projects = [{ id: 'agent-inbox', lifecycle: { status: 'active' } }];
function imported(tracking, events = [], count = null) {
  return importUsageExport({ kind: 'portfolio-usage', schemaVersion: 1, usage: { updatedAt: now, records: {
    'agent-inbox': { checkedAt: now, windowStart: '2026-09-30T10:00:00Z', windowEnd: now,
      tracking, proxy: { count, unit: 'devices' }, events, evidence: [{ source: 'Agent Inbox local counter' }] },
  } } }, projects);
}

test('an explicit missing tracker cannot turn an empty event export into a measured zero', () => {
  const snapshot = imported('missing');
  assert.equal(snapshot.records['agent-inbox'].actionEvents, null);
  assert.match(snapshot.records['agent-inbox'].gap, /Tracking is missing/);
  const rows = usageObservations(projects, snapshot);
  assert.ok(rows.every(row => row.value === null && row.qualification === 'unknown'));
  assert.equal(imported('missing', [{ count: 8 }], 2).records['agent-inbox'].count, null);
});

test('an available partial counter still preserves explicit recorded zeroes', () => {
  const snapshot = imported('partial', [{ count: 0 }], 0);
  assert.equal(snapshot.records['agent-inbox'].actionEvents, 0);
  assert.equal(snapshot.records['agent-inbox'].count, 0);
});
