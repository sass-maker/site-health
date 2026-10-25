import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { BrandEvidenceStore } from '../lib/brand-evidence/store.mjs';
import { dueBrandProjects } from '../lib/brand-evidence/scheduler.mjs';

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
