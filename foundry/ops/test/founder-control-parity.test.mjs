import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  appendCurrentEvidenceBatch,
  appendMarketingReceipt,
} from '../lib/founder-control/evidence-ingestion.mjs';
import { attributionReady } from '../lib/founder-control/recommendations.mjs';
import { draftMission } from '../lib/founder-control/intake.mjs';
import { buildDailyBrief } from '../lib/founder-control/projections.mjs';
import {
  fleetWorkspaceRepository,
  loadFounderProjects,
} from '../lib/founder-control/registry.mjs';
import { recommendationEvent } from '../lib/founder-control/recommendations.mjs';
import { FounderControlStore } from '../lib/founder-control/store.mjs';

const now = '2026-07-25T08:00:00.000Z';
const owner = { type: 'owner', id: 'founder', label: 'Founder' };
const automation = { type: 'automation', id: 'foundry', label: 'Foundry' };
const catalog = JSON.parse(
  readFileSync(new URL('../config/projects.json', import.meta.url), 'utf8'),
);

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
  assert.equal(brief.ownerActionPath, '/decisions');

  const evidence = [
    { provider: 'github', kind: 'pull-request', state: 'verified' },
    { provider: 'github', kind: 'workflow-run', state: 'verified' },
    { provider: 'cloudflare', kind: 'deployment', state: 'verified' },
    { provider: 'cloudflare', kind: 'production-smoke', state: 'verified' },
  ];
  assert.equal(attributionReady(evidence).ready, true);
  store.close();
});

test('passes the canonical proof, learning, approval, ranking, and local-first owner journeys', () => {
  const projects = loadFounderProjects();
  const project = projects.find((entry) => entry.id === 'codevetter');
  assert.equal(project.repo, 'codevetter');
  assert.equal(project.websiteUrl, 'https://codevetter.com');
  assert.equal(project.changelogUrl, 'https://codevetter.com/changelog');
  assert.equal(project.repositoryUrl, fleetWorkspaceRepository);
  assert.equal(
    projects.find((entry) => entry.id === 'significanthobbies').familyName,
    'Significant Hobbies',
  );
  const rolepatch = projects.find((entry) => entry.id === 'rolepatch');
  const emailManager = projects.find((entry) => entry.id === 'email-manager');
  assert.equal(rolepatch.family, 'rolepatch');
  assert.equal(emailManager.family, 'email-manager');
  assert.equal(rolepatch.repositoryUrl, fleetWorkspaceRepository);
  assert.equal(emailManager.repositoryUrl, fleetWorkspaceRepository);
  assert.equal(
    projects.find((entry) => entry.id === 'protein-index').repositoryUrl,
    'https://github.com/Significant-Hobbies/protein-index-resilience',
  );
  assert.equal(
    projects.find((entry) => entry.id === 'mashup').repositoryUrl,
    'https://github.com/sass-maker/fleet-workspace',
  );
  const directoryProjects = projects.filter(
    (entry) =>
      entry.lifecycle !== 'non-product' &&
      entry.attention !== 'ignored' &&
      entry.category !== 'helper',
  );
  const canonicalDirectoryProjectIds = catalog.projects
    .filter(
      (entry) =>
        entry.status !== 'orphan' &&
        entry.lifecycle !== 'non-product' &&
        entry.attention !== 'ignored' &&
        entry.public?.category !== 'helper',
    )
    .map((entry) => entry.id)
    .sort();
  assert.deepEqual(
    directoryProjects.map((entry) => entry.id).sort(),
    canonicalDirectoryProjectIds,
  );
  for (const entry of directoryProjects) {
    assert.equal(
      entry.repositoryUrl,
      fleetWorkspaceRepository,
      `${entry.id}: maintained directory project must share the Fleet source`,
    );
    assert.equal(
      entry.websiteUrl,
      entry.domains[0] ? `https://${entry.domains[0]}` : null,
      `${entry.id}: website URL must use its canonical first domain`,
    );
  }
  assert.equal(
    projects.find((entry) => entry.id === 'psi-swarm').repositoryUrl,
    fleetWorkspaceRepository,
  );
  assert.ok(project.domains.includes('codevetter.com'));

  const store = new FounderControlStore({
    databasePath: join(mkdtempSync(join(tmpdir(), 'founder-over-parity-')), 'owner.sqlite'),
    projects,
  });
  const missionId = 'mission/codevetter-post-ship';
  store.append(
    {
      type: 'mission.drafted',
      actor: owner,
      missionId,
      projectId: project.id,
      idempotencyKey: 'over-parity/mission',
      occurredAt: now,
      payload: {
        title: 'Learn from the CodeVetter release',
        outcome: 'Marketing and feedback evidence inform the next choice.',
        completionCriteria: ['Deployment, approval, publication, and measurement evidence exist'],
        authority: { mode: 'owner-acceptance-required' },
      },
    },
    { now },
  );

  const currentReceipts = [
    ['github', 'pull-request', 'pr-42', 'https://github.com/sass-maker/codevetter/pull/42'],
    ['github', 'workflow-run', 'ci-42', 'https://github.com/sass-maker/codevetter/actions/runs/42'],
    ['cloudflare', 'deployment', 'deploy-42', 'https://dash.cloudflare.com/example'],
    ['cloudflare', 'production-smoke', 'smoke-42', 'https://codevetter.com'],
    ['ai-visibility', 'run', 'visibility-42', 'https://fleet.sassmaker.com/marketing'],
    ['high-signal', 'feedback-summary', 'feedback-42', 'https://highsignal.app/mentions'],
  ].map(([provider, kind, id, url]) => ({
    missionId,
    projectId: project.id,
    provider,
    kind,
    id,
    state: 'verified',
    observedAt: now,
    freshUntil: '2026-07-26T08:00:00.000Z',
    url,
    summary: { status: 'verified' },
    confidence: 1,
  }));
  assert.deepEqual(appendCurrentEvidenceBatch(store, {
    version: 1,
    receipts: currentReceipts,
  }), {
    received: 6,
    appended: 6,
    duplicates: 0,
  });

  for (const stage of ['approval', 'publication', 'measurement']) {
    appendMarketingReceipt(store, {
      missionId,
      projectId: project.id,
      stage,
      provider: stage === 'approval' ? 'foundry' : 'postiz',
      kind: stage,
      id: `${stage}-42`,
      state: 'verified',
      observedAt: now,
      url: `https://fleet.sassmaker.com/missions/${encodeURIComponent(missionId)}`,
      summary: { status: 'verified' },
      confidence: 1,
    });
  }

  store.append(recommendationEvent({
    title: 'Improve cited comparison coverage',
    rationale: 'Visibility and feedback evidence agree on the gap.',
    impact: 0.9,
    confidence: 0.8,
    effort: 0.3,
    reversibility: 1,
    attention: 'my-work',
    projectId: project.id,
    missionId,
    idempotencyKey: 'over-parity/recommendation',
    observedAt: now,
    actor: automation,
    evidence: currentReceipts.slice(3).map((receipt) => ({
      provider: receipt.provider,
      kind: receipt.kind,
      id: receipt.id,
      state: receipt.state,
      observedAt: receipt.observedAt,
      freshUntil: receipt.freshUntil,
      url: receipt.url,
      summary: receipt.summary,
      confidence: receipt.confidence,
    })),
  }, { now }));

  const projections = store.rebuildProjections({ now });
  assert.equal(projections.projects.find((entry) => entry.id === project.id).repo, project.repo);
  assert.equal(projections.missions[0].evidence.length, 9);
  assert.equal(projections.home.recommendedNext[0].title, 'Improve cited comparison coverage');
  assert.equal(
    attributionReady(currentReceipts.map((receipt) => ({
      provider: receipt.provider,
      kind: receipt.kind,
      state: receipt.state,
    }))).ready,
    true,
  );
  assert.equal(store.databasePath.endsWith('owner.sqlite'), true);
  store.close();
});
