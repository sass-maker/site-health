import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { FounderControlStore, verifyBackup } from '../lib/founder-control/store.mjs';

const now = '2026-07-25T08:00:00.000Z';
const actor = { type: 'automation', id: 'foundry-test', label: 'Foundry test' };

function createStore(name = 'ledger.sqlite') {
  return new FounderControlStore({
    databasePath: join(mkdtempSync(join(tmpdir(), 'founder-control-')), name),
    projects: [{ id: 'codevetter', name: 'CodeVetter', attention: 'focus' }],
  });
}

function recommendationInput() {
  return {
    type: 'recommendation.created',
    actor,
    projectId: 'codevetter',
    idempotencyKey: 'test/recommendation/example',
    occurredAt: now,
    payload: {
      recommendationId: 'recommendation/example',
      title: 'Verify the release',
      rationale: 'Current evidence is incomplete.',
      impact: 0.8,
      confidence: 0.7,
      effort: 0.2,
      reversibility: 1,
      score: 80,
    },
  };
}

test('appends evidence events idempotently and rejects conflicts', () => {
  const store = createStore();
  const first = store.append(recommendationInput(), { now });
  const repeated = store.append(recommendationInput(), { now });
  assert.equal(first.duplicate, false);
  assert.equal(repeated.duplicate, true);
  assert.equal(store.listEvents().length, 1);
  assert.throws(
    () => store.append({
      ...recommendationInput(),
      payload: { ...recommendationInput().payload, title: 'Different' },
    }, { now }),
    (error) => error.code === 'IDEMPOTENCY_CONFLICT',
  );
  store.close();
});

test('rebuilds deterministic projections and verifies restore/replay', () => {
  const store = createStore();
  store.append(recommendationInput(), { now });
  const firstProjection = store.rebuildProjections({ now: '2026-07-25T09:00:00.000Z' });
  assert.equal(firstProjection.home.recommendedNext[0].id, 'recommendation/example');
  const backup = store.createBackup({ now: '2026-07-25T09:00:00.000Z' });
  assert.equal(verifyBackup(backup).valid, true);

  const restored = createStore('restored.sqlite');
  const replayed = restored.restoreBackup(backup);
  assert.deepEqual(replayed, firstProjection);
  store.close();
  restored.close();
});
