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

function evidenceInput() {
  return {
    type: 'evidence.recorded',
    actor,
    projectId: 'codevetter',
    idempotencyKey: 'test/evidence/example',
    occurredAt: now,
    payload: {
      summary: 'Release evidence recorded.',
    },
  };
}

test('appends evidence events idempotently and rejects conflicts', () => {
  const store = createStore();
  const first = store.append(evidenceInput(), { now });
  const repeated = store.append(evidenceInput(), { now });
  assert.equal(first.duplicate, false);
  assert.equal(repeated.duplicate, true);
  assert.equal(store.listEvents().length, 1);
  assert.throws(
    () => store.append({
      ...evidenceInput(),
      payload: { ...evidenceInput().payload, summary: 'Different' },
    }, { now }),
    (error) => error.code === 'IDEMPOTENCY_CONFLICT',
  );
  store.close();
});

test('rebuilds deterministic projections and verifies restore/replay', () => {
  const store = createStore();
  store.append(evidenceInput(), { now });
  const firstProjection = store.rebuildProjections({ now: '2026-07-25T09:00:00.000Z' });
  assert.equal(firstProjection.home.whatChanged[0].type, 'evidence.recorded');
  const backup = store.createBackup({ now: '2026-07-25T09:00:00.000Z' });
  assert.equal(verifyBackup(backup).valid, true);

  const restored = createStore('restored.sqlite');
  const replayed = restored.restoreBackup(backup);
  assert.deepEqual(replayed, firstProjection);
  store.close();
  restored.close();
});
