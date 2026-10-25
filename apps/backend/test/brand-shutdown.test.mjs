import assert from 'node:assert/strict';
import { existsSync, lstatSync, mkdtempSync, readFileSync, readdirSync, symlinkSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
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
    assert.equal(readdirSync(join(databasePath, '..')).some((name) => name.startsWith('.evidence.sqlite.interrupted-')), false);
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

test('failed shutdown journals exact owned work, waits once and recovers only listed running rows', { timeout: 10_000 }, () => {
  const databasePath = join(mkdtempSync(join(tmpdir(), 'brand-lock-')), 'evidence.sqlite');
  const active = new BrandEvidenceStore({ databasePath });
  active.saveProfile('alpha', { brandName: 'Alpha' });
  const run = active.startCollection('alpha', 'reddit', 'alpha', now);
  const lateCompleted = active.startCollection('alpha', 'website', 'https://alpha.example', now);
  const check = active.createCheck({ projectId: 'alpha', startedAt: now });
  const imported = active.createCheck({ projectId: 'alpha', trigger: 'imported', startedAt: now });
  const other = new BrandEvidenceStore({ databasePath });
  const otherRun = other.startCollection('alpha', 'reddit', 'other', now);
  const otherCheck = other.createCheck({ projectId: 'alpha', startedAt: now });
  const empty = new BrandEvidenceStore({ databasePath });
  const writer = new DatabaseSync(databasePath);
  writer.exec('BEGIN IMMEDIATE');
  try {
    const fast = Date.now();
    empty.stopOwnedWork(now);
    assert.equal(empty.shutdownController.signal.aborted, true);
    assert.equal(readdirSync(join(databasePath, '..')).some((name) => name.startsWith('.evidence.sqlite.interrupted-')), false);
    assert.ok(Date.now() - fast < 500, 'empty shutdown tried to acquire the other writer’s lock');
    const started = Date.now();
    assert.throws(() => active.stopOwnedWork(now), /locked/);
    assert.ok(Date.now() - started < 2_500, 'shutdown write exceeded the supervisor grace budget');
    assert.equal(active.database.prepare('PRAGMA busy_timeout').get().timeout, 5_000);
    active.close();
    assert.ok(Date.now() - started < 1_800, 'close retried the shutdown busy wait');
    assert.throws(() => active.database.prepare('SELECT 1'), /not open|closed/);
    const journals = readdirSync(join(databasePath, '..')).filter((name) => name.startsWith('.evidence.sqlite.interrupted-'));
    assert.equal(journals.length, 1);
    const journalPath = join(databasePath, '..', journals[0]);
    assert.equal(lstatSync(journalPath).mode & 0o777, 0o600);
    const journal = JSON.parse(readFileSync(journalPath, 'utf8'));
    assert.deepEqual(journal.collections.sort(), [run, lateCompleted].sort());
    assert.deepEqual(journal.checks, [check]);
    assert.equal(journal.interruptedAt, now);
    assert.ok(lstatSync(journalPath).size <= 32_768);
    writer.exec('ROLLBACK');
    other.finishCollection(lateCompleted, { status: 'completed', received: 1 }, now);
    const recovered = new BrandEvidenceStore({ databasePath });
    try {
      assert.equal(recovered.listCollections('alpha').find((row) => row.id === run).status, 'error');
      assert.equal(recovered.getCheck(check).status, 'failed');
      assert.match(recovered.getCheck(check).summary, /Interrupted/);
      assert.equal(recovered.listCollections('alpha').find((row) => row.id === lateCompleted).status, 'completed');
      assert.equal(recovered.listCollections('alpha').find((row) => row.id === otherRun).status, 'running');
      assert.equal(recovered.getCheck(otherCheck).status, 'running');
      assert.equal(recovered.getCheck(imported).status, 'running');
      assert.equal(existsSync(journalPath), false);
    } finally { recovered.close(); }
  } finally {
    if (writer.isTransaction) writer.exec('ROLLBACK');
    writer.close(); empty.close(); other.close();
  }
});

test('malformed, oversized, symlink and unrelated journals remain untouched', () => {
  const directory = mkdtempSync(join(tmpdir(), 'brand-journal-invalid-'));
  const databasePath = join(directory, 'evidence.sqlite');
  const store = new BrandEvidenceStore({ databasePath });
  store.saveProfile('alpha', { brandName: 'Alpha' });
  const check = store.createCheck({ projectId: 'alpha', startedAt: now });
  const record = JSON.stringify({ version: 1, interruptedAt: now, collections: [], checks: [check] });
  const name = () => join(directory, `.evidence.sqlite.interrupted-${randomUUID()}.json`);
  const truncated = name(); writeFileSync(truncated, '{"version":1,', { mode: 0o600 });
  const oversized = name(); writeFileSync(oversized, 'x'.repeat(32_769), { mode: 0o600 });
  const overLimit = name(); writeFileSync(overLimit, JSON.stringify({ version: 1, interruptedAt: now, collections: [], checks: Array.from({ length: 101 }, () => randomUUID()) }), { mode: 0o600 });
  const unrelated = join(directory, `.another.sqlite.interrupted-${randomUUID()}.json`); writeFileSync(unrelated, record, { mode: 0o600 });
  const target = join(directory, 'target.json'); writeFileSync(target, record, { mode: 0o600 });
  const link = name(); symlinkSync(target, link);
  const reopened = new BrandEvidenceStore({ databasePath });
  try {
    assert.equal(reopened.getCheck(check).status, 'running');
    for (const path of [truncated, oversized, overLimit, unrelated, target, link]) assert.equal(existsSync(path), true);
    assert.equal(lstatSync(link).isSymbolicLink(), true);
  } finally { reopened.close(); store.close(); }
});

test('ownership admission fits one bounded interruption journal', () => {
  const store = new BrandEvidenceStore({ databasePath: ':memory:' });
  try {
    assert.throws(() => store.createCheck({ id: 'x'.repeat(32_768), projectId: 'alpha', startedAt: now }), /Too much active/);
    for (let i = 0; i < 100; i++) store.startCollection('alpha', 'reddit', `query-${i}`, now);
    assert.throws(() => store.startCollection('alpha', 'reddit', 'overflow', now), /Too much active/);
    assert.throws(() => store.createCheck({ projectId: 'alpha', startedAt: now }), /Too much active/);
  } finally { store.close(); }
});

test('shutdown aborts an in-flight provider and reports failure while journal recovery is pending', { timeout: 10_000 }, async () => {
  const databasePath = join(mkdtempSync(join(tmpdir(), 'brand-abort-')), 'evidence.sqlite');
  const store = new BrandEvidenceStore({ databasePath });
  store.saveProfile('alpha', { brandName: 'Alpha', brandUrl: 'https://alpha.example' });
  for (const prompt of ['first', 'second', 'third']) store.addPrompt('alpha', prompt);
  let started;
  const admitted = new Promise((resolve) => { started = resolve; });
  let aborted = false;
  let calls = 0;
  const running = runApiModelCheck({
    store, projectId: 'alpha', env: { AI_GATEWAY_API_KEY: 'synthetic-test-key' },
    fetchImpl: async (_url, init) => {
      calls++;
      if (calls === 1) return new Response(JSON.stringify({ id: 'fixture', object: 'chat.completion', created: 1, model: 'auto',
        choices: [{ index: 0, finish_reason: 'stop', message: { role: 'assistant', content: 'Alpha https://alpha.example' } }],
      }), { headers: { 'content-type': 'application/json' } });
      started();
      return new Promise((_resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Fixture provider did not abort')), 2_000);
        const abort = () => { aborted = true; clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); };
        if (init.signal.aborted) abort(); else init.signal.addEventListener('abort', abort, { once: true });
      });
    },
  });
  await admitted;
  const writer = new DatabaseSync(databasePath);
  writer.exec('BEGIN IMMEDIATE');
  try {
    assert.throws(() => store.stopOwnedWork(now), /locked/);
    const result = await running;
    assert.equal(aborted, true);
    assert.equal(calls, 2);
    assert.equal(result.status, 'failed');
    assert.match(result.summary, /Interrupted.*journal pending/);
    assert.deepEqual([result.attempted, result.completed, result.failed, result.mentionRate], [1, 1, 0, 1]);
    assert.equal(store.getCheck(result.checkId).status, 'running');
    assert.equal(store.listObservations('alpha').length, 1);
    store.close();
    writer.exec('ROLLBACK');
    const recovered = new BrandEvidenceStore({ databasePath });
    try {
      const check = recovered.getCheck(result.checkId);
      assert.equal(check.status, 'failed');
      assert.deepEqual([check.attempted, check.completed, check.failed, check.mentionRate], [1, 1, 0, 1]);
    }
    finally { recovered.close(); }
  } finally {
    if (writer.isTransaction) writer.exec('ROLLBACK');
    writer.close();
    if (store.database.isOpen) store.close();
  }
});
