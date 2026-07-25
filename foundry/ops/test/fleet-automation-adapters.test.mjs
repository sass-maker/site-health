#!/usr/bin/env node

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  githubActionsAdapter,
  cloudflareDeployAdapter,
  liveSmokeAdapter,
  siteHealthAdapter,
  cronJobAdapter,
  marketingReceiptAdapter,
  performanceAdapter,
  localCheckAdapter,
  collectEvidence,
} from '../lib/fleet-automation/adapters.mjs';

const codevetter = {
  id: 'codevetter',
  name: 'CodeVetter',
  surfaces: ['https://codevetter.com'],
  contracts: ['build', 'live', 'indexing'],
};

test('githubActionsAdapter produces build evidence from latest run', () => {
  const runs = [
    { id: 2, name: 'CI', conclusion: 'success', created_at: '2026-07-20T10:00:00Z', head_sha: 'abc', html_url: 'https://github.com/r/run/2' },
    { id: 1, name: 'CI', conclusion: 'failure', created_at: '2026-07-19T10:00:00Z', head_sha: 'def', html_url: 'https://github.com/r/run/1' },
  ];
  const [record] = githubActionsAdapter(runs, codevetter);
  assert.equal(record.contract, 'build');
  assert.equal(record.status, 'pass');
  assert.equal(record.revision, 'abc');
  assert.match(record.summary, /success/);
});

test('githubActionsAdapter returns empty for no runs', () => {
  assert.deepEqual(githubActionsAdapter([], codevetter), []);
  assert.deepEqual(githubActionsAdapter(null, codevetter), []);
});

test('cloudflareDeployAdapter matches project surfaces and emits live evidence', () => {
  const audit = {
    generatedAt: '2026-07-20T12:00:00Z',
    domains: [
      { url: 'https://codevetter.com', status: 200, healthy: true, checkedAt: '2026-07-20T12:00:00Z' },
      { url: 'https://other.com', status: 200, healthy: true, checkedAt: '2026-07-20T12:00:00Z' },
    ],
    findings: [
      { project: 'codevetter', severity: 'high', title: 'Bad deploy', observedAt: '2026-07-20T12:00:00Z' },
      { project: 'other', severity: 'low', title: 'Minor', observedAt: '2026-07-20T12:00:00Z' },
    ],
  };
  const records = cloudflareDeployAdapter(audit, codevetter);
  assert.ok(records.some((r) => r.contract === 'live' && r.status === 'pass'));
  assert.ok(records.some((r) => r.contract === 'errors' && r.status === 'fail' && r.summary.includes('Bad deploy')));
});

test('liveSmokeAdapter only emits evidence for matching surfaces', () => {
  const probes = [
    { url: 'https://codevetter.com', status: 200, ok: true, checkedAt: '2026-07-20T12:00:00Z' },
    { url: 'https://other.com', status: 500, ok: false, checkedAt: '2026-07-20T12:00:00Z' },
  ];
  const records = liveSmokeAdapter(probes, codevetter);
  assert.equal(records.length, 1);
  assert.equal(records[0].status, 'pass');
});

test('siteHealthAdapter emits indexing and live evidence', () => {
  const scorecard = {
    observedAt: '2026-07-20T12:00:00Z',
    indexing: { pass: true, summary: 'llms.txt present' },
    live: { pass: true, summary: 'Homepage 200' },
  };
  const records = siteHealthAdapter(scorecard, codevetter);
  assert.equal(records.length, 2);
  assert.ok(records.some((r) => r.contract === 'indexing' && r.status === 'pass'));
  assert.ok(records.some((r) => r.contract === 'live' && r.status === 'pass'));
});

test('cronJobAdapter emits jobs evidence from last run exit status', () => {
  const health = {
    jobs: [
      { id: 'daily-fleet-health-sentinel', lastRun: { at: '2026-07-20T08:00:00Z', exitStatus: 0, log: '/tmp/log' } },
      { id: 'weekly-audit', lastRun: { at: '2026-07-20T08:00:00Z', exitStatus: 1, log: '/tmp/log2' } },
    ],
  };
  const records = cronJobAdapter(health, codevetter);
  assert.ok(records.length >= 1);
  assert.ok(records.some((r) => r.contract === 'jobs'));
});

test('marketingReceiptAdapter matches by slug or alias', () => {
  const program = {
    projects: [
      { slug: 'codevetter', aliases: ['CodeVetter'], mode: 'focus', cta: 'Download', publicMarketing: true },
    ],
  };
  const [record] = marketingReceiptAdapter(program, codevetter);
  assert.equal(record.contract, 'marketing');
  assert.equal(record.status, 'pass');
});

test('marketingReceiptAdapter returns not-applicable for private projects', () => {
  const program = {
    projects: [
      { slug: 'codevetter', mode: 'private', cta: 'n/a', publicMarketing: false },
    ],
  };
  const [record] = marketingReceiptAdapter(program, codevetter);
  assert.equal(record.status, 'not-applicable');
});

test('performanceAdapter maps score to pass/fail', () => {
  const good = performanceAdapter({ performanceScore: 95, lcpMs: 1200, observedAt: '2026-07-20T12:00:00Z' }, codevetter);
  assert.equal(good[0].status, 'pass');
  const bad = performanceAdapter({ performanceScore: 30, lcpMs: 5000, observedAt: '2026-07-20T12:00:00Z' }, codevetter);
  assert.equal(bad[0].status, 'fail');
});

test('localCheckAdapter emits build evidence from exit code', () => {
  const [record] = localCheckAdapter({ command: 'npm test', exitCode: 0, checkedAt: '2026-07-20T12:00:00Z' }, codevetter);
  assert.equal(record.contract, 'build');
  assert.equal(record.status, 'pass');
});

test('collectEvidence folds all available sources', () => {
  const records = collectEvidence(codevetter, {
    githubActions: [{ id: 1, name: 'CI', conclusion: 'success', created_at: '2026-07-20T10:00:00Z', head_sha: 'x', html_url: 'u' }],
    liveSmoke: [{ url: 'https://codevetter.com', status: 200, ok: true, checkedAt: '2026-07-20T12:00:00Z' }],
  });
  assert.ok(records.some((r) => r.contract === 'build'));
  assert.ok(records.some((r) => r.contract === 'live'));
});

test('adapters do not leak credential-shaped values', () => {
  const records = collectEvidence(codevetter, {
    githubActions: [{ id: 1, name: 'CI', conclusion: 'success', created_at: '2026-07-20T10:00:00Z', head_sha: 'x', html_url: 'u', authorization: 'Bearer secret.token.value' }],
  });
  for (const r of records) {
    assert.doesNotMatch(JSON.stringify(r), /Bearer|secret\.token/i);
  }
});

test('Foundry helper entries (PSI Swarm, Drank, Reel Pipeline) receive evidence', () => {
  const psiSwarm = {
    id: 'psi-swarm', name: 'PSI Swarm', attention: 'foundry',
    surfaces: ['https://performance.sassmaker.com'],
    contracts: ['build', 'live', 'performance'],
  };
  const drank = {
    id: 'drank', name: 'Drank', attention: 'foundry',
    surfaces: ['https://domains.sassmaker.com'],
    contracts: ['build', 'live', 'jobs'],
  };
  const reelPipeline = {
    id: 'reel-pipeline', name: 'Reel Pipeline', attention: 'foundry',
    surfaces: [], contracts: ['build', 'jobs', 'marketing'],
  };

  // PSI Swarm gets performance evidence
  const psiPerf = performanceAdapter(
    { performanceScore: 92, lcpMs: 1100, observedAt: '2026-07-20T12:00:00Z', url: 'https://performance.sassmaker.com' },
    psiSwarm
  );
  assert.equal(psiPerf.length, 1);
  assert.equal(psiPerf[0].contract, 'performance');
  assert.equal(psiPerf[0].status, 'pass');

  // Drank gets live evidence from smoke probes
  const drankLive = liveSmokeAdapter(
    [{ url: 'https://domains.sassmaker.com', status: 200, ok: true, checkedAt: '2026-07-20T12:00:00Z' }],
    drank
  );
  assert.equal(drankLive.length, 1);
  assert.equal(drankLive[0].contract, 'live');

  // Reel Pipeline gets marketing evidence from program
  const reelMarketing = marketingReceiptAdapter(
    { projects: [{ slug: 'reel-pipeline', mode: 'infrastructure', cta: 'Review', publicMarketing: false }] },
    reelPipeline
  );
  assert.equal(reelMarketing.length, 1);
  assert.equal(reelMarketing[0].status, 'not-applicable');
});
