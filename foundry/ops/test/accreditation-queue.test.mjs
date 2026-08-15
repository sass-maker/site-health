import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';

import {
  accreditationQueueFilename,
  renderAccreditationQueue,
} from '../lib/accreditation-queue.mjs';
import {
  ACCREDITATION_STATE_SCHEMA,
  seedAccreditationState,
  writeAccreditationState,
} from '../lib/accreditation-state.mjs';

const cli = resolve(import.meta.dirname, '../scripts/accreditation/generate-queue.mjs');
const now = new Date('2026-08-15T12:00:00.000Z');

function platform(id, overrides = {}) {
  return {
    id,
    name: id,
    source: 'research-probe',
    artifactFit: ['product', 'major-feature'],
    submitUrl: `https://${id}.invalid/submit`,
    home: null,
    currentState: 'seed',
    verifiedAt: null,
    qualityGate: 'standard',
    blocker: null,
    rejectionReason: null,
    transitions: [],
    transitionsArchive: [],
    ...overrides,
  };
}

const state = {
  $schema: ACCREDITATION_STATE_SCHEMA,
  version: 1,
  updated: '2026-08-15',
  ownerExclusions: ['hacker-news', 'linkedin', 'x'],
  stalenessDays: 30,
  platforms: [
    platform('hacker-news', {
      name: 'Hacker News',
      source: 'protected-channel',
      artifactFit: ['product', 'major-feature', 'article'],
      qualityGate: 'protected',
      home: 'https://news.ycombinator.com/submit',
    }),
    platform('linkedin', { source: 'protected-channel', qualityGate: 'protected' }),
    platform('x', { source: 'protected-channel', qualityGate: 'protected' }),
    platform('smol-launch', {
      source: 'curated-directory-registry',
      currentState: 'accredited',
      verifiedAt: '2026-08-14T00:00:00.000Z',
    }),
    platform('stale-directory', {
      source: 'curated-directory-registry',
      currentState: 'accredited',
      verifiedAt: '2026-05-01T00:00:00.000Z',
    }),
    platform('insidr'),
    platform('openfuture'),
    platform('betabound', { currentState: 'blocked', blocker: 'captcha' }),
    platform('signin-gate', { currentState: 'blocked', blocker: 'signin' }),
    platform('payment-gate', { currentState: 'blocked', blocker: 'payment' }),
    platform('anti-bot-gate', { currentState: 'blocked', blocker: 'anti-bot' }),
    platform('moderation-gate', { currentState: 'blocked', blocker: 'moderation' }),
    platform('offline-gate', { currentState: 'blocked', blocker: 'offline' }),
    platform('spammy', { currentState: 'rejected', rejectionReason: 'spam-only audience' }),
  ],
};

const projects = [
  {
    id: 'codevetter',
    name: 'CodeVetter',
    portfolio: {
      kind: 'product',
      priority: 'P1',
      status: 'active',
      deployed: true,
      readyToBeShared: true,
    },
  },
  {
    id: 'agent-office',
    name: 'Office OS',
    portfolio: {
      kind: 'product',
      priority: 'P1',
      status: 'active',
      deployed: true,
      readyToBeShared: false,
      sharingReadiness: { verifiedAt: '2026-08-11', reason: 'No maintained public listing yet.' },
    },
  },
  {
    id: 'reader',
    name: 'Reader',
    portfolio: {
      kind: 'product',
      priority: 'P2',
      status: 'active',
      deployed: true,
      readyToBeShared: true,
    },
  },
  {
    id: 'drank',
    name: 'Drank',
    portfolio: {
      kind: 'product',
      priority: 'P4',
      status: 'active',
      deployed: true,
      readyToBeShared: true,
    },
  },
];

function queue(overrides = {}) {
  return renderAccreditationQueue({ state, projects, date: '2026-08-15', now, ...overrides });
}

test('queue orders products P1 then P2 then P4 and separates protected channels', () => {
  const markdown = queue();
  assert.match(markdown, /^# Platform accreditation queue — 2026-08-15/u);

  const positions = ['## Protected channels', '## P1 products', '## P2 products', '## P4 products']
    .map((heading) => markdown.indexOf(heading));
  assert.equal(
    positions.every((position) => position >= 0),
    true,
  );
  assert.deepEqual(positions, [...positions].sort((left, right) => left - right));
  assert.ok(markdown.indexOf('CodeVetter') < markdown.indexOf('Reader'));
  assert.ok(markdown.indexOf('Reader') < markdown.indexOf('Drank'));

  const productSections = markdown.slice(
    markdown.indexOf('## P1 products'),
    markdown.indexOf('## Seed inventory'),
  );
  for (const protectedId of ['`hacker-news`', '`linkedin`', '`x`']) {
    assert.equal(
      productSections.includes(protectedId),
      false,
      `${protectedId} must stay in the protected section only`,
    );
  }
});

test('queue distinguishes seed evidence from accredited evidence', () => {
  const markdown = queue();
  assert.match(markdown, /`seed` entries are \*\*unverified\*\* registry evidence/u);
  assert.match(markdown, /never ready for submission/u);
  assert.match(markdown, /`accredited` entries have been probed with recorded evidence/u);
  assert.match(markdown, /hash-approved campaign/u);
});

test('queue groups each product by state and re-queues stale accreditations', () => {
  const markdown = queue();
  const codevetter = markdown.slice(
    markdown.indexOf('### CodeVetter'),
    markdown.indexOf('### Reader'),
  );
  assert.match(codevetter, /\*\*Accredited — ready for manifest inclusion \(1\)\*\*/u);
  assert.match(codevetter, /smol-launch/u);
  assert.match(codevetter, /\*\*Accredited but stale — re-verification required \(1\)\*\*/u);
  assert.match(codevetter, /stale-directory/u);
  assert.match(codevetter, /\*\*Seed — live verification required before any submission \(2\)\*\*/u);
  assert.match(codevetter, /\*\*Blocked — enablement decision required \(6\)\*\*/u);
  for (const blocker of ['captcha', 'signin', 'payment', 'anti-bot', 'moderation', 'offline']) {
    assert.match(codevetter, new RegExp(`_${blocker} \\(1\\)_`, 'u'));
    assert.match(codevetter, new RegExp(`blocker: ${blocker}`, 'u'));
  }
  assert.match(codevetter, /\*\*Rejected — excluded unless the owner overrides \(1\)\*\*/u);
  assert.match(codevetter, /reason: spam-only audience/u);
});

test('products that are not ready to share are excluded from submission planning', () => {
  const markdown = queue();
  const officeOs = markdown.slice(
    markdown.indexOf('### Office OS'),
    markdown.indexOf('### CodeVetter'),
  );
  assert.match(officeOs, /Not ready to share — excluded from submission planning/u);
  assert.match(officeOs, /No maintained public listing yet\./u);
  assert.equal(officeOs.includes('Accredited — ready for manifest inclusion'), false);
});

test('summary counts report the full inventory by state', () => {
  const summary = queue().slice(queue().indexOf('## Summary counts'));
  assert.match(summary, /\| seed \| 5 \|/u);
  assert.match(summary, /\| accredited \| 2 \|/u);
  assert.match(summary, /\| blocked \| 6 \|/u);
  assert.match(summary, /\| rejected \| 1 \|/u);
  assert.match(summary, /\| \*\*total\*\* \| \*\*14\*\* \|/u);
  assert.match(summary, /Protected channels \(owner exclusions\): 3/u);
  assert.match(summary, /past the 30-day staleness window: 1/u);
});

test('summary mode points at the shared seed inventory and full mode expands it', () => {
  const summaryMode = queue();
  const summarySection = summaryMode.slice(
    summaryMode.indexOf('### CodeVetter'),
    summaryMode.indexOf('### Reader'),
  );
  assert.match(summarySection, /listed once under \[Seed inventory\]\(#seed-inventory\)/u);
  assert.equal(summarySection.includes('`insidr`'), false);

  const fullMode = queue({ detail: 'full' });
  const fullSection = fullMode.slice(fullMode.indexOf('### CodeVetter'), fullMode.indexOf('### Reader'));
  assert.match(fullSection, /`insidr`/u);
  assert.match(fullSection, /`openfuture`/u);
  assert.match(fullMode, /## Seed inventory/u);
  assert.throws(() => queue({ detail: 'noisy' }), /detail must be summary or full/u);
});

test('CLI writes the dated queue file and fails clearly without a state file', () => {
  const dir = mkdtempSync(resolve(tmpdir(), 'fleet-accreditation-queue-'));
  const statePath = resolve(dir, 'accreditation-state.json');
  const outDir = resolve(dir, 'out');
  const run = (...args) => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });

  const missing = run('--state', statePath, '--out-dir', outDir);
  assert.equal(missing.status, 2);
  assert.match(missing.stderr, /accreditation state not found/u);
  assert.match(missing.stderr, /update-state\.mjs init/u);

  writeAccreditationState(statePath, seedAccreditationState({ updated: '2026-08-15' }));
  const generated = run('--state', statePath, '--out-dir', outDir, '--date', '2026-08-15');
  assert.equal(generated.status, 0, generated.stderr);

  const expected = resolve(outDir, accreditationQueueFilename('2026-08-15'));
  assert.equal(JSON.parse(generated.stdout).path, expected);
  assert.equal(existsSync(expected), true);
  const markdown = readFileSync(expected, 'utf8');
  assert.match(markdown, /# Platform accreditation queue — 2026-08-15/u);
  assert.match(markdown, /## Protected channels/u);
  assert.match(markdown, /## Summary counts/u);
});
