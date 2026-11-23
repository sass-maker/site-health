import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { startEvidenceScheduler } from '../lib/dashboard-backend/evidence-scheduler.mjs';
import { readRefreshReceipt, recordRefreshReceipt, reconcileAbandonedRefreshReceipts, refreshReceiptSchedule } from '../lib/dashboard-backend/evidence-freshness.mjs';
import { DashboardStore } from '../lib/dashboard-backend/store.mjs';

test('independent lanes do not overlap and retry only when their own interval expires', async () => {
  let time = 0; let resolve; let slow = 0; let failing = 0; let errors = 0;
  const scheduler = startEvidenceScheduler({
    now: () => time, setTimer: () => 1, clearTimer: () => {},
    onError: () => { errors++; },
    lanes: [
      { id: 'slow', intervalMs: 10, run: () => { slow++; return new Promise((done) => { resolve = done; }); } },
      { id: 'failure', intervalMs: 5, run: () => { failing++; throw new Error('fixture'); } },
    ],
  });
  scheduler.tick(); await new Promise(setImmediate);
  scheduler.tick(); await new Promise(setImmediate);
  assert.equal(slow, 1); assert.equal(failing, 1); assert.equal(errors, 1);
  time = 5; scheduler.tick(); await new Promise(setImmediate);
  assert.equal(slow, 1); assert.equal(failing, 2);
  resolve(); await scheduler.stop();
  time = 100; scheduler.tick(); assert.equal(slow, 1);
});

test('a persisted receipt delays the restart poll until due; an absent receipt still runs immediately', async () => {
  const intervalMs = 24 * 60 * 60_000;
  const finishedAt = Date.parse('2026-11-23T10:00:00.000Z');
  let time = finishedAt + intervalMs - 1;
  const store = new DashboardStore({ databasePath: join(mkdtempSync(join(tmpdir(), 'evidence-scheduler-')), 'dashboard.sqlite') });
  recordRefreshReceipt(store, { runId: 'usage_prior', family: 'usage', scope: 'portfolio', state: 'failed',
    startedAt: new Date(finishedAt - 60_000).toISOString(), finishedAt: new Date(finishedAt).toISOString(), summary: 'fixture' });
  let reportReads = 0;
  const lane = {
    id: 'usage', intervalMs,
    schedule: (now, startup) => refreshReceiptSchedule(readRefreshReceipt(store, 'usage'), intervalMs, now, { startup }),
    run: () => { reportReads += 39; },
  };
  const scheduler = startEvidenceScheduler({ lanes: [lane], now: () => time, setTimer: () => 1, clearTimer: () => {} });
  scheduler.tick(); await new Promise(setImmediate);
  assert.equal(reportReads, 0, 'recent persisted failure does not replay the portfolio after restart');
  time += 1;
  scheduler.tick(); await new Promise(setImmediate);
  assert.equal(reportReads, 39, 'one due run performs one portfolio collection');
  scheduler.tick(); await new Promise(setImmediate);
  assert.equal(reportReads, 39, 'the due run does not overlap or repeat');
  await scheduler.stop();

  time += 1_000;
  recordRefreshReceipt(store, { runId: 'usage_interrupted', family: 'usage', scope: 'portfolio', state: 'running',
    startedAt: new Date(time - 60 * 60_000).toISOString(), summary: 'interrupted fixture' });
  const restartScheduler = startEvidenceScheduler({ lanes: [lane], now: () => time, setTimer: () => 1, clearTimer: () => {} });
  restartScheduler.tick(); await new Promise(setImmediate);
  assert.equal(reportReads, 78, 'a persisted in-progress receipt is recovered on scheduler startup');
  await restartScheduler.stop();

  time += 1_000;
  recordRefreshReceipt(store, { runId: 'usage_abandoned', family: 'usage', scope: 'portfolio', state: 'running',
    startedAt: new Date(time - 7 * 60 * 60_000).toISOString(), summary: 'abandoned fixture' });
  reconcileAbandonedRefreshReceipts(store, { now: new Date(time).toISOString() });
  assert.equal(readRefreshReceipt(store, 'usage').failure.code, 'REFRESH_ABANDONED');
  const abandonedScheduler = startEvidenceScheduler({ lanes: [lane], now: () => time, setTimer: () => 1, clearTimer: () => {} });
  abandonedScheduler.tick(); await new Promise(setImmediate);
  assert.equal(reportReads, 117, 'a reconciled abandoned receipt is recovered on scheduler startup');
  await abandonedScheduler.stop();
  store.close();

  time = finishedAt;
  const emptyStore = new DashboardStore({ databasePath: join(mkdtempSync(join(tmpdir(), 'evidence-scheduler-empty-')), 'dashboard.sqlite') });
  const firstRunLane = { ...lane, schedule: (now) => refreshReceiptSchedule(readRefreshReceipt(emptyStore, 'usage'), intervalMs, now) };
  const freshScheduler = startEvidenceScheduler({ lanes: [firstRunLane], now: () => time, setTimer: () => 1, clearTimer: () => {} });
  freshScheduler.tick(); await new Promise(setImmediate);
  assert.equal(reportReads, 156, 'no persisted receipt preserves immediate first-run behavior');
  await freshScheduler.stop();
  emptyStore.close();
});

test('a failed persisted schedule hint keeps the lane interval backoff', async () => {
  let time = 0;
  let runs = 0;
  const scheduler = startEvidenceScheduler({
    now: () => time, setTimer: () => 1, clearTimer: () => {},
    lanes: [{ id: 'usage', intervalMs: 100, schedule: () => { throw new Error('transient metadata read'); }, run: () => { runs++; } }],
  });
  scheduler.tick(); await new Promise(setImmediate);
  assert.equal(runs, 1, 'a missing startup hint still permits the initial collection');
  time = 50;
  scheduler.tick(); await new Promise(setImmediate);
  assert.equal(runs, 1, 'a later hint failure does not clear the post-run interval');
  time = 100;
  scheduler.tick(); await new Promise(setImmediate);
  assert.equal(runs, 2, 'normal interval retry proceeds when due');
  await scheduler.stop();
});
