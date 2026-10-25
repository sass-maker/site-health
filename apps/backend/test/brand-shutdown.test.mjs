import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { BrandEvidenceStore } from '../lib/brand-evidence/store.mjs';
import { dueBrandProjects } from '../lib/brand-evidence/scheduler.mjs';
import { runApiModelCheck } from '../lib/brand-evidence/runner.mjs';

const now = '2026-10-25T12:00:00.000Z';
const completed = { status: 'completed', attempted: 1, completed: 1, failed: 0, mentionRate: 0, summary: 'Completed', finishedAt: now };

test('shutdown interrupts only this store’s active work and rejects new admission', () => {
  const databasePath = join(mkdtempSync(join(tmpdir(), 'brand-shutdown-')), 'evidence.sqlite');
  const first = new BrandEvidenceStore({ databasePath });
  first.saveProfile('alpha', { brandName: 'Alpha' });
  const collection = first.startCollection('alpha', 'hacker-news', 'alpha', now);
  const check = first.createCheck({ projectId: 'alpha', startedAt: now });
  const done = first.startCollection('alpha', 'website', 'https://alpha.example', now);
  first.finishCollection(done, { status: 'completed', received: 1 }, now);
  const completedCheck = first.createCheck({ projectId: 'alpha', startedAt: now });
  first.finishCheck(completedCheck, completed);
  const imported = first.createCheck({ projectId: 'alpha', trigger: 'imported', source: 'mentionpilot', startedAt: now });
  const second = new BrandEvidenceStore({ databasePath });
  try {
    assert.equal(second.listChecks('alpha').find((row) => row.id === check).status, 'running');
    const otherCollection = second.startCollection('alpha', 'reddit', 'alpha', now);
    const otherCheck = second.createCheck({ projectId: 'alpha', startedAt: now });
    first.stopOwnedWork(now);
    const interrupted = second.listCollections('alpha').find((row) => row.id === collection);
    assert.equal(interrupted.status, 'error');
    assert.equal(interrupted.errorMessage, 'Interrupted during backend shutdown');
    assert.equal(interrupted.finishedAt, now);
    assert.equal(second.listChecks('alpha').find((row) => row.id === check).status, 'failed');
    assert.match(second.listChecks('alpha').find((row) => row.id === check).summary, /Interrupted/);
    assert.equal(second.listCollections('alpha').find((row) => row.id === done).status, 'completed');
    assert.equal(second.listChecks('alpha').find((row) => row.id === completedCheck).status, 'completed');
    assert.equal(second.listChecks('alpha').find((row) => row.id === imported).status, 'running');
    assert.equal(second.listCollections('alpha').find((row) => row.id === otherCollection).status, 'running');
    assert.equal(second.listChecks('alpha').find((row) => row.id === otherCheck).status, 'running');
    first.finishCollection(collection, { status: 'completed', received: 1 }, now);
    first.finishCheck(check, completed);
    assert.equal(second.listCollections('alpha').find((row) => row.id === collection).status, 'error');
    assert.equal(second.listChecks('alpha').find((row) => row.id === check).status, 'failed');
    assert.throws(() => first.startCollection('alpha', 'reddit', 'late', now), /shutting down/);
    assert.throws(() => first.createCheck({ projectId: 'alpha', startedAt: now }), /shutting down/);
    second.finishCollection(otherCollection, { status: 'completed', received: 0 }, now);
    second.finishCheck(otherCheck, completed);
    assert.equal(second.listChecks('alpha').find((row) => row.id === otherCheck).status, 'completed');
    first.stopOwnedWork(now);
  } finally { first.close(); second.close(); }
});

test('shared due-project plan separates API-only, community-only and both scopes', () => {
  const store = new BrandEvidenceStore({ databasePath: ':memory:' });
  try {
    for (const projectId of ['api', 'community', 'both']) store.saveProfile(projectId, { brandName: projectId, schedule: 'daily' });
    const collection = store.startCollection('api', 'hacker-news', 'api', now);
    store.finishCollection(collection, { status: 'completed', received: 0 }, now);
    const check = store.createCheck({ projectId: 'community', startedAt: now });
    store.finishCheck(check, completed);
    assert.deepEqual(Object.fromEntries(dueBrandProjects(store, { now }).map(({ projectId, scope }) => [projectId, scope])), {
      api: 'api', both: 'all', community: 'community',
    });
  } finally { store.close(); }
});

for (const lateStatus of [200, 503]) test(`shutdown during a provider request (${lateStatus}) preserves prior results and stops later work`, async () => {
  const store = new BrandEvidenceStore({ databasePath: ':memory:' });
  store.saveProfile('alpha', { brandName: 'Alpha', brandUrl: 'https://alpha.example' });
  for (const prompt of ['first', 'second', 'third']) store.addPrompt('alpha', prompt);
  let started;
  const secondStarted = new Promise((resolve) => { started = resolve; });
  let release;
  const pending = new Promise((resolve) => { release = resolve; });
  let calls = 0;
  const running = runApiModelCheck({
    store, projectId: 'alpha', env: { AI_GATEWAY_API_KEY: 'synthetic-test-key' }, now: () => now,
    fetchImpl: async () => {
      calls++;
      if (calls === 2) { started(); await pending; }
      if (calls === 2 && lateStatus === 503) return new Response('{}', { status: 503, headers: { 'content-type': 'application/json' } });
      return new Response(JSON.stringify({ id: 'fixture', object: 'chat.completion', created: 1, model: 'auto',
        choices: [{ index: 0, finish_reason: 'stop', message: { role: 'assistant', content: 'Alpha https://alpha.example' } }],
      }), { headers: { 'content-type': 'application/json' } });
    },
  });
  try {
    await secondStarted;
    assert.equal(store.listObservations('alpha').length, 1);
    store.stopOwnedWork(now);
    release();
    const result = await running;
    const persisted = store.getCheck(result.checkId);
    assert.equal(result.status, 'failed');
    assert.equal(result.status, persisted.status);
    assert.deepEqual([result.attempted, result.completed, result.failed, result.mentionRate], [1, 1, 0, 1]);
    assert.match(result.summary, /Interrupted/);
    assert.equal(calls, 2);
    assert.equal(store.listObservations('alpha').length, 1);
    assert.equal(persisted.finishedAt, now);
  } finally { release(); await running; store.close(); }
});

test('shutdown avoids empty writes, bounds lock contention and always closes its connection', { timeout: 10_000 }, (t) => {
  const databasePath = join(mkdtempSync(join(tmpdir(), 'brand-lock-')), 'evidence.sqlite');
  const active = new BrandEvidenceStore({ databasePath });
  active.saveProfile('alpha', { brandName: 'Alpha' });
  active.startCollection('alpha', 'reddit', 'alpha', now);
  const empty = new BrandEvidenceStore({ databasePath });
  const writer = new DatabaseSync(databasePath);
  const logs = [];
  t.mock.method(console, 'error', (message) => logs.push(message));
  writer.exec('BEGIN IMMEDIATE');
  try {
    const fast = Date.now();
    empty.stopOwnedWork(now);
    assert.ok(Date.now() - fast < 500, 'empty shutdown tried to acquire the other writer’s lock');
    const started = Date.now();
    assert.throws(() => active.stopOwnedWork(now), /locked/);
    assert.ok(Date.now() - started < 2_500, 'shutdown write exceeded the supervisor grace budget');
    assert.equal(active.database.prepare('PRAGMA busy_timeout').get().timeout, 5_000);
    active.close();
    assert.match(logs.join('\n'), /Could not interrupt owned brand evidence.*locked/);
    assert.throws(() => active.database.prepare('SELECT 1'), /not open|closed/);
  } finally { writer.exec('ROLLBACK'); writer.close(); empty.close(); }
});
