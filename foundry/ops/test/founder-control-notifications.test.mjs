import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

import { FounderControlStore } from '../lib/founder-control/store.mjs';

const root = resolve(import.meta.dirname, '..', '..', '..');
const cli = resolve(root, 'foundry/ops/scripts/founder-control.mjs');

test('founder notification sync queues one material-risk event and suppresses its retry', () => {
  const scratch = mkdtempSync(join(tmpdir(), 'founder-notifications-'));
  const databasePath = join(scratch, 'foundry.sqlite');
  const notificationState = join(scratch, 'notifications');
  const store = new FounderControlStore({ databasePath });
  store.append({
    type: 'recommendation.created',
    actor: { type: 'automation', id: 'foundry-test' },
    projectId: 'codevetter',
    idempotencyKey: 'founder-notification-test/risk',
    occurredAt: '2026-07-25T08:00:00.000Z',
    payload: {
      recommendationId: 'recommendation/cost-risk',
      title: 'Stop unexpected provider spend',
      rationale: 'The latest provider evidence shows an unplanned charge.',
      impact: 1,
      confidence: 1,
      effort: 0.2,
      reversibility: 1,
      score: 90,
      risk: 'cost',
    },
  });
  store.close();

  const run = () => spawnSync(process.execPath, [cli, 'notify', '--no-drain'], {
    encoding: 'utf8',
    env: {
      ...process.env,
      FOUNDER_CONTROL_DB: databasePath,
      FLEET_NOTIFY_STATE_DIR: notificationState,
    },
  });

  try {
    const first = run();
    assert.equal(first.status, 0, first.stderr);
    assert.equal(JSON.parse(first.stdout).queued, 1);
    assert.equal(readdirSync(join(notificationState, 'pending')).length, 1);

    const second = run();
    assert.equal(second.status, 0, second.stderr);
    assert.equal(JSON.parse(second.stdout).duplicates, 1);
    assert.equal(readdirSync(join(notificationState, 'pending')).length, 1);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});
