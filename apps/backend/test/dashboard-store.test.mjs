import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { DashboardStore, verifyBackup } from '../lib/dashboard-backend/store.mjs';

const now = '2026-07-25T08:00:00.000Z';
const actor = { type: 'automation', id: 'dashboard-test', label: 'Dashboard test' };

function createStore(name = 'ledger.sqlite') {
  return new DashboardStore({
    databasePath: join(mkdtempSync(join(tmpdir(), 'dashboard-backend-')), name),
    projects: [{ id: 'codevetter', name: 'CodeVetter', attention: 'focus' }],
  });
}

function visibilityInput() {
  return {
    type: 'visibility.run-recorded',
    actor,
    projectId: 'codevetter',
    idempotencyKey: 'test/visibility/example',
    occurredAt: now,
    payload: {
      runId: 'run-1',
      promptSetId: 'buyer-discovery',
      coverage: {},
      cost: {},
      metrics: {},
      citations: [],
      attempts: [],
    },
  };
}

test('appends AI-awareness events idempotently and rejects conflicts', () => {
  const store = createStore();
  const first = store.append(visibilityInput(), { now });
  const repeated = store.append(visibilityInput(), { now });
  assert.equal(first.duplicate, false);
  assert.equal(repeated.duplicate, true);
  assert.equal(store.listEvents().length, 1);
  assert.throws(
    () => store.append({
      ...visibilityInput(),
      payload: { ...visibilityInput().payload, runId: 'different' },
    }, { now }),
    (error) => error.code === 'IDEMPOTENCY_CONFLICT',
  );
  store.close();
});

test('rebuilds deterministic projections and verifies restore/replay', () => {
  const store = createStore();
  store.append(visibilityInput(), { now });
  const firstProjection = store.rebuildProjections({ now: '2026-07-25T09:00:00.000Z' });
  assert.equal(firstProjection.aiVisibility.projects[0].latest.runId, 'run-1');
  const backup = store.createBackup({ now: '2026-07-25T09:00:00.000Z' });
  assert.equal(verifyBackup(backup).valid, true);

  const restored = createStore('restored.sqlite');
  const replayed = restored.restoreBackup(backup);
  assert.deepEqual(replayed, firstProjection);
  store.close();
  restored.close();
});
