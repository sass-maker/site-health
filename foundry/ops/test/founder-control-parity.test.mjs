import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { attributionReady } from '../lib/founder-control/recommendations.mjs';
import { draftMission } from '../lib/founder-control/intake.mjs';
import { buildDailyBrief } from '../lib/founder-control/projections.mjs';
import { FounderControlStore } from '../lib/founder-control/store.mjs';

const now = '2026-07-25T08:00:00.000Z';
const owner = { type: 'owner', id: 'founder', label: 'Founder' };
const automation = { type: 'automation', id: 'foundry', label: 'Foundry' };

test('covers intake, current work, owner request, timeline, schedules, and daily summary locally', () => {
  const projects = [{ id: 'codevetter', name: 'CodeVetter', attention: 'focus' }];
  const store = new FounderControlStore({
    databasePath: join(mkdtempSync(join(tmpdir(), 'founder-parity-')), 'parity.sqlite'),
    projects,
  });
  const drafted = draftMission(
    {
      title: 'Verify release',
      projectId: 'codevetter',
      outcome: 'The release is verified with provider evidence.',
    },
    { projects, now },
  );
  store.append(drafted.event, { now });
  store.append(
    {
      type: 'mission.accepted',
      actor: owner,
      missionId: drafted.event.missionId,
      projectId: 'codevetter',
      idempotencyKey: 'parity/accepted',
      occurredAt: now,
      payload: { reason: 'Approved' },
    },
    { now },
  );
  store.append(
    {
      type: 'mission.started',
      actor: { type: 'agent', id: 'codex', label: 'Codex' },
      missionId: drafted.event.missionId,
      projectId: 'codevetter',
      idempotencyKey: 'parity/started',
      occurredAt: now,
      payload: { summary: 'Verification started' },
    },
    { now },
  );
  store.append(
    {
      type: 'decision.requested',
      actor: automation,
      missionId: drafted.event.missionId,
      projectId: 'codevetter',
      idempotencyKey: 'parity/decision',
      occurredAt: now,
      payload: {
        decisionId: 'decision/release',
        question: 'Approve the release evidence?',
        why: 'Publication needs an owner receipt.',
        allowedResponses: ['approve', 'reject'],
        scope: 'release',
        reversible: true,
      },
    },
    { now },
  );
  store.append(
    {
      type: 'schedule.recorded',
      actor: automation,
      idempotencyKey: 'parity/schedule',
      occurredAt: now,
      payload: {
        id: 'schedule/daily-brief',
        name: 'Daily owner brief',
        enabled: false,
        nextRunAt: '2026-07-26T02:30:00.000Z',
        lastState: 'not-run',
      },
    },
    { now },
  );

  const projections = store.rebuildProjections({ now });
  const brief = buildDailyBrief(projections);
  assert.equal(projections.projects.find((project) => project.id === 'codevetter').name, 'CodeVetter');
  assert.equal(projections.home.workingNow[0].actor.id, 'codex');
  assert.equal(projections.home.needsMe[0].id, 'decision/release');
  assert.ok(projections.missions[0].timeline.length >= 3);
  assert.equal(projections.schedules[0].enabled, false);
  assert.match(brief.headline, /owner decision/);

  const evidence = [
    { provider: 'github', kind: 'pull-request', state: 'verified' },
    { provider: 'github', kind: 'workflow-run', state: 'verified' },
    { provider: 'cloudflare', kind: 'deployment', state: 'verified' },
    { provider: 'cloudflare', kind: 'production-smoke', state: 'verified' },
  ];
  assert.equal(attributionReady(evidence).ready, true);
  store.close();
});
