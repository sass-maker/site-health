import assert from 'node:assert/strict';
import test from 'node:test';
import { startEvidenceScheduler } from '../lib/dashboard-backend/evidence-scheduler.mjs';

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
