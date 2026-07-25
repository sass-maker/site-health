import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { FounderControlStore, verifyBackup } from '../lib/founder-control/store.mjs';

const now = '2026-07-25T08:00:00.000Z';
const actor = { type: 'owner', id: 'founder', label: 'Founder' };

function createStore(name = 'ledger.sqlite') {
  return new FounderControlStore({
    databasePath: join(mkdtempSync(join(tmpdir(), 'founder-control-')), name),
    projects: [{ id: 'codevetter', name: 'CodeVetter', attention: 'focus' }],
  });
}

function draftInput() {
  return {
    type: 'mission.drafted',
    actor,
    missionId: 'mission/example',
    projectId: 'codevetter',
    idempotencyKey: 'test/mission/example',
    occurredAt: now,
    payload: {
      title: 'Verify the release',
      outcome: 'The release is verified',
      completionCriteria: ['Production evidence exists'],
      authority: { mode: 'owner-acceptance-required' },
    },
  };
}

test('appends idempotently and rejects conflicting or illegal writes', () => {
  const store = createStore();
  const first = store.append(draftInput(), { now });
  const repeated = store.append(draftInput(), { now });
  assert.equal(first.duplicate, false);
  assert.equal(repeated.duplicate, true);
  assert.equal(store.listEvents().length, 1);
  assert.throws(
    () => store.append({ ...draftInput(), payload: { ...draftInput().payload, title: 'Different' } }, { now }),
    (error) => error.code === 'IDEMPOTENCY_CONFLICT',
  );
  assert.throws(
    () =>
      store.append(
        {
          type: 'mission.completed',
          actor,
          missionId: 'mission/example',
          idempotencyKey: 'test/mission/illegal',
          occurredAt: now,
          payload: { summary: 'Done' },
        },
        { now },
      ),
    (error) => error.code === 'ILLEGAL_MISSION_TRANSITION',
  );
  store.close();
});

test('rebuilds deterministic projections and verifies restore/replay', () => {
  const store = createStore();
  store.append(draftInput(), { now });
  store.append(
    {
      type: 'mission.accepted',
      actor,
      missionId: 'mission/example',
      projectId: 'codevetter',
      idempotencyKey: 'test/mission/accepted',
      occurredAt: '2026-07-25T08:01:00.000Z',
      payload: { reason: 'Approved' },
    },
    { now: '2026-07-25T08:01:00.000Z' },
  );
  store.append(
    {
      type: 'mission.started',
      actor: { type: 'agent', id: 'codex', label: 'Codex' },
      missionId: 'mission/example',
      projectId: 'codevetter',
      idempotencyKey: 'test/mission/started',
      occurredAt: '2026-07-25T08:02:00.000Z',
      payload: { summary: 'Started' },
    },
    { now: '2026-07-25T08:02:00.000Z' },
  );
  const firstProjection = store.rebuildProjections({ now: '2026-07-25T09:00:00.000Z' });
  assert.equal(firstProjection.home.workingNow[0].state, 'active');
  const backup = store.createBackup({ now: '2026-07-25T09:00:00.000Z' });
  assert.equal(verifyBackup(backup).valid, true);

  const restored = createStore('restored.sqlite');
  const replayed = restored.restoreBackup(backup);
  assert.deepEqual(replayed, firstProjection);
  store.close();
  restored.close();
});
