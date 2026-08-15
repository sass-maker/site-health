import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';

import {
  ACCREDITATION_EVIDENCE_SCHEMA,
  ACCREDITATION_BLOCKERS,
  applyTransition,
  isStale,
  readAccreditationState,
  seedAccreditationState,
  summarizeAccreditationState,
  TRANSITION_HISTORY_LIMIT,
  validateAccreditationState,
  validateEvidence,
  writeAccreditationState,
} from '../lib/accreditation-state.mjs';

const cli = resolve(import.meta.dirname, '../scripts/accreditation/update-state.mjs');

function seeded() {
  return seedAccreditationState({ updated: '2026-08-15' });
}

function confirm(state, platformId, toState, extra = {}) {
  return applyTransition(state, {
    platformId,
    toState,
    outcome: 'confirmed',
    observedAt: '2026-08-15T10:00:00.000Z',
    ...extra,
  }).state;
}

test('seeds every registry platform as seed evidence with populated source and fit', () => {
  const state = seeded();
  assert.equal(validateAccreditationState(state).ok, true);
  assert.deepEqual(state.ownerExclusions, ['hacker-news', 'linkedin', 'x']);
  assert.equal(state.stalenessDays, 30);
  assert.ok(state.platforms.length > 100);

  const sources = new Set(state.platforms.map((platform) => platform.source));
  assert.deepEqual([...sources].sort(), [
    'article-syndication',
    'curated-directory-registry',
    'protected-channel',
    'research-probe',
  ]);
  for (const platform of state.platforms) {
    assert.equal(platform.currentState, 'seed');
    assert.deepEqual(platform.transitions, []);
    assert.equal(platform.verifiedAt, null);
    assert.ok(platform.artifactFit.length > 0);
  }

  const byId = new Map(state.platforms.map((platform) => [platform.id, platform]));
  for (const id of ['hacker-news', 'linkedin', 'x']) {
    assert.equal(byId.get(id).qualityGate, 'protected');
    assert.deepEqual(byId.get(id).artifactFit, ['product', 'major-feature', 'article']);
  }
  assert.deepEqual(byId.get('medium').artifactFit, ['article']);
  assert.deepEqual(byId.get('smol-launch').artifactFit, ['product', 'major-feature']);
});

test('rejects an invalid state document', () => {
  const state = seeded();
  state.platforms[3].currentState = 'unknown-state';
  state.ownerExclusions.push('not-a-platform');
  const validation = validateAccreditationState(state);
  assert.equal(validation.ok, false);
  assert.equal(validation.issues.length, 2);
  assert.match(validation.issues.join('\n'), /currentState must be one of/u);
  assert.match(validation.issues.join('\n'), /unknown platform: not-a-platform/u);
});

test('advances seed to accredited and records evidence with the accreditation schema', () => {
  let state = seeded();
  state = confirm(state, 'insidr', 'verified', {
    evidence: {
      liveUrl: 'https://www.insidr.ai/submit-tools/',
      httpStatus: 200,
      formDetected: true,
      captchaDetected: false,
      signinRequired: false,
    },
  });
  state = confirm(state, 'insidr', 'accredited');

  const platform = state.platforms.find((entry) => entry.id === 'insidr');
  assert.equal(platform.currentState, 'accredited');
  assert.equal(platform.verifiedAt, '2026-08-15T10:00:00.000Z');
  assert.equal(platform.transitions.length, 2);
  assert.equal(platform.transitions[0].$schema, ACCREDITATION_EVIDENCE_SCHEMA);
  assert.equal(platform.transitions[0].evidence.liveUrl, 'https://www.insidr.ai/submit-tools/');
  assert.equal(platform.transitions[0].applied, true);
});

test('rejects invalid transitions and keeps a rejection reason until overridden', () => {
  let state = seeded();
  state = confirm(state, 'betabound', 'rejected', { reason: 'beta-tester recruiting only' });
  assert.throws(
    () =>
      confirm(state, 'betabound', 'live', {
        evidence: { liveUrl: 'https://betabound.com/x', httpStatus: 200 },
      }),
    /invalid transition rejected -> live/u,
  );
  assert.equal(
    state.platforms.find((entry) => entry.id === 'betabound').rejectionReason,
    'beta-tester recruiting only',
  );

  const overridden = confirm(state, 'betabound', 'verified');
  assert.equal(
    overridden.platforms.find((entry) => entry.id === 'betabound').currentState,
    'verified',
  );
});

test('protected channels cannot enter broad accreditation', () => {
  let state = seeded();
  state = confirm(state, 'linkedin', 'verified', {
    evidence: { liveUrl: 'https://www.linkedin.com/', httpStatus: 200 },
  });
  assert.throws(
    () => confirm(state, 'linkedin', 'accredited'),
    /individually planned and never broad-accredited/u,
  );
});

test('post-submission states require verified live evidence', () => {
  let state = seeded();
  state = confirm(state, 'insidr', 'verified');
  state = confirm(state, 'insidr', 'accredited');
  state = confirm(state, 'insidr', 'queued');

  assert.throws(() => confirm(state, 'insidr', 'live'), /requires evidence.liveUrl/u);
  assert.throws(
    () => confirm(state, 'insidr', 'live', { evidence: { liveUrl: 'https://insidr.ai/tool' } }),
    /requires evidence.httpStatus/u,
  );

  state = confirm(state, 'insidr', 'live', {
    evidence: { liveUrl: 'https://www.insidr.ai/tools/pace', httpStatus: 200 },
  });
  assert.equal(state.platforms.find((entry) => entry.id === 'insidr').currentState, 'live');

  assert.equal(
    validateEvidence({ liveUrl: 'https://a.invalid', httpStatus: 302 }, 'indexable').ok,
    false,
  );
  assert.equal(
    validateEvidence({ liveUrl: 'https://a.invalid', httpStatus: 301, finalStatus: 200 }, 'indexable')
      .ok,
    true,
  );
});

test('blocked transitions require one normalized blocker value', () => {
  for (const blocker of ACCREDITATION_BLOCKERS) {
    const result = applyTransition(seeded(), {
      platformId: 'betabound',
      toState: 'blocked',
      blocker,
      observedAt: '2026-08-15T10:00:00.000Z',
    });
    assert.equal(
      result.state.platforms.find((entry) => entry.id === 'betabound').blocker,
      blocker,
    );
  }

  assert.throws(
    () => confirm(seeded(), 'betabound', 'blocked'),
    /blocker must be one of captcha, signin, payment, anti-bot, moderation, offline/u,
  );
  assert.throws(
    () => confirm(seeded(), 'betabound', 'blocked', { blocker: 'CAPTCHA' }),
    /blocker must be one of captcha, signin, payment, anti-bot, moderation, offline/u,
  );
});

test('indeterminate outcomes record evidence without advancing state', () => {
  const state = seeded();
  const result = applyTransition(state, {
    platformId: 'openfuture',
    toState: 'verified',
    outcome: 'indeterminate',
    observedAt: '2026-08-15T10:00:00.000Z',
    note: 'probe timed out',
  });
  const platform = result.state.platforms.find((entry) => entry.id === 'openfuture');
  assert.equal(platform.currentState, 'seed');
  assert.equal(platform.verifiedAt, null);
  assert.equal(platform.transitions.length, 1);
  assert.equal(platform.transitions[0].applied, false);
  assert.equal(platform.transitions[0].outcome, 'indeterminate');
});

test('flags stale accredited platforms and caps transition history', () => {
  let state = seeded();
  state = confirm(state, 'insidr', 'verified');
  state = confirm(state, 'insidr', 'accredited');
  const platform = state.platforms.find((entry) => entry.id === 'insidr');
  assert.equal(
    isStale(platform, { stalenessDays: 30, now: new Date('2026-08-20T10:00:00Z') }),
    false,
  );
  assert.equal(isStale(platform, { stalenessDays: 30, now: new Date('2026-10-01T10:00:00Z') }), true);

  for (let index = 0; index < 12; index += 1) {
    state = confirm(state, 'insidr', 'accredited', {
      observedAt: `2026-09-${String(index + 1).padStart(2, '0')}T10:00:00.000Z`,
    });
  }
  const capped = state.platforms.find((entry) => entry.id === 'insidr');
  assert.equal(capped.transitions.length, TRANSITION_HISTORY_LIMIT);
  assert.equal(capped.transitionsArchive.length, 4);
  assert.equal(capped.transitionsArchive[0].toState, 'verified');
  assert.equal(validateAccreditationState(state).ok, true);

  const summary = summarizeAccreditationState(state, { now: new Date('2026-11-01T00:00:00Z') });
  assert.equal(summary.staleCount, 1);
  assert.equal(summary.protectedCount, 3);
  assert.equal(summary.counts.accredited, 1);
  const summarized = summary.platforms.find((entry) => entry.id === 'insidr');
  assert.equal(summarized.stale, true);
  assert.equal(summarized.lastEvidence.outcome, 'confirmed');
});

test('CLI initializes, records a transition, and refuses to clobber recorded evidence', () => {
  const dir = mkdtempSync(resolve(tmpdir(), 'fleet-accreditation-'));
  const statePath = resolve(dir, 'accreditation-state.json');
  const run = (...args) => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });

  const init = run('init', '--state', statePath, '--date', '2026-08-15');
  assert.equal(init.status, 0, init.stderr);
  assert.ok(JSON.parse(init.stdout).platforms > 100);

  const reinit = run('init', '--state', statePath);
  assert.equal(reinit.status, 2);
  assert.match(reinit.stderr, /already exists/u);

  const transition = run(
    'transition',
    '--state', statePath,
    '--platform', 'insidr',
    '--to', 'verified',
    '--outcome', 'confirmed',
    '--live-url', 'https://www.insidr.ai/submit-tools/',
    '--http-status', '200',
    '--form-detected', 'true',
    '--captcha-detected', 'false',
    '--observed-at', '2026-08-15T10:00:00.000Z',
  );
  assert.equal(transition.status, 0, transition.stderr);
  assert.equal(JSON.parse(transition.stdout).currentState, 'verified');

  const invalid = run('transition', '--state', statePath, '--platform', 'insidr', '--to', 'live');
  assert.equal(invalid.status, 2);
  assert.match(invalid.stderr, /invalid transition verified -> live/u);

  const persisted = readAccreditationState(statePath);
  assert.equal(persisted.platforms.find((entry) => entry.id === 'insidr').currentState, 'verified');

  const summaryCli = resolve(import.meta.dirname, '../scripts/accreditation/summary.mjs');
  const before = readFileSync(statePath, 'utf8');
  const summary = spawnSync(process.execPath, [summaryCli, '--state', statePath, '--json'], {
    encoding: 'utf8',
  });
  assert.equal(summary.status, 0, summary.stderr);
  const parsed = JSON.parse(summary.stdout);
  assert.equal(parsed.counts.verified, 1);
  const summarized = parsed.platforms.find((entry) => entry.id === 'insidr');
  assert.equal(summarized.lastEvidence.liveUrl, 'https://www.insidr.ai/submit-tools/');
  assert.equal(readFileSync(statePath, 'utf8'), before, 'summary is read-only');
});

test('read rejects a missing state file and write refuses invalid documents', () => {
  const dir = mkdtempSync(resolve(tmpdir(), 'fleet-accreditation-invalid-'));
  const statePath = resolve(dir, 'accreditation-state.json');
  assert.throws(() => readAccreditationState(statePath), /accreditation state not found/u);

  const state = seeded();
  state.platforms[0].artifactFit = [];
  assert.throws(() => writeAccreditationState(statePath, state), /refusing to write invalid state/u);
});
