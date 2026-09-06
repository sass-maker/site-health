import assert from 'node:assert/strict';
import test from 'node:test';

import { latestPerformanceBatch, performanceStatus } from '../lib/dashboard-projection.mjs';

function run(observedAt, score, lcp, preset = 'desktop') {
  return { observedAt, preset, score, lcp };
}

test('a two-sample batch straddling the LCP gate reads from the median, not the last run', () => {
  // Both samples are the same target minutes apart; the slow one is lab noise the runner's
  // `--runs 2` exists to cancel. Reading the last row alone would report the fast sample.
  const history = [
    run('2026-09-05T07:31:45.000Z', 81, 2828.71),
    run('2026-09-05T07:31:54.000Z', 92, 1798.63),
  ];
  const batch = latestPerformanceBatch(history);
  assert.equal(batch.sampleCount, 2);
  assert.equal(batch.score, 86.5);
  assert.equal(batch.lcp, 2313.67);
  assert.equal(performanceStatus(batch.score, batch.lcp), 'needs-work');
  assert.equal(batch.observedAt, '2026-09-05T07:31:54.000Z');
});

test('a third same-window sample moves the median across the threshold', () => {
  // saas-maker as stored on 2026-09-05: two portfolio runs plus a re-run 5 minutes later.
  const history = [
    run('2026-09-05T07:31:45.000Z', 81, 2828.71),
    run('2026-09-05T07:31:54.000Z', 92, 1798.63),
    run('2026-09-05T07:37:10.000Z', 92, 1802.71),
  ];
  const batch = latestPerformanceBatch(history);
  assert.equal(batch.sampleCount, 3);
  assert.equal(batch.score, 92);
  assert.equal(batch.lcp, 1802.71);
  assert.equal(performanceStatus(batch.score, batch.lcp), 'fast-enough');
});

test('the batch window ignores older runs of the same surface', () => {
  const history = [
    run('2026-08-27T14:07:09.000Z', 98, 1064.05),
    run('2026-08-27T14:07:17.000Z', 98, 1044.1),
    run('2026-09-05T07:31:45.000Z', 81, 2828.71),
    run('2026-09-05T07:31:54.000Z', 92, 1798.63),
  ];
  const batch = latestPerformanceBatch(history);
  assert.equal(batch.sampleCount, 2);
  assert.equal(batch.score, 86.5);
});

test('the window is anchored on the newest run and does not chain run-to-run', () => {
  // Nine minutes apart each, so a chaining rule would swallow all three; only the two runs
  // inside the window of the newest one are the current batch.
  const history = [
    run('2026-09-05T07:20:00.000Z', 60, 5000),
    run('2026-09-05T07:29:00.000Z', 92, 1800),
    run('2026-09-05T07:38:00.000Z', 96, 1200),
  ];
  const batch = latestPerformanceBatch(history);
  assert.equal(batch.sampleCount, 2);
  assert.equal(batch.score, 94);
  assert.equal(batch.lcp, 1500);
});

test('a batch never mixes presets', () => {
  const history = [
    run('2026-09-05T07:31:30.000Z', 76, 6185.34, 'mobile-slow'),
    run('2026-09-05T07:31:40.000Z', 76, 6180.66, 'mobile-slow'),
    run('2026-09-05T07:31:45.000Z', 96, 900, 'desktop'),
    run('2026-09-05T07:31:54.000Z', 92, 1100, 'desktop'),
  ];
  const batch = latestPerformanceBatch(history);
  assert.equal(batch.sampleCount, 2);
  assert.equal(batch.score, 94);
  assert.equal(batch.lcp, 1000);
  assert.equal(performanceStatus(batch.score, batch.lcp), 'fast-enough');
});

test('runs without a usable score, LCP, or timestamp are skipped', () => {
  assert.equal(latestPerformanceBatch([]), null);
  assert.equal(latestPerformanceBatch([run('not-a-date', 92, 1800)]), null);
  assert.equal(latestPerformanceBatch([run('2026-09-05T07:31:45.000Z', 92, Number.NaN)]), null);
  const batch = latestPerformanceBatch([
    run('2026-09-05T07:31:45.000Z', 92, 1800),
    run('2026-09-05T07:31:54.000Z', Number.NaN, 900),
  ]);
  assert.equal(batch.sampleCount, 1);
  assert.equal(batch.observedAt, '2026-09-05T07:31:45.000Z');
});

test('status needs both signals inside their gates', () => {
  assert.equal(performanceStatus(90, 2500), 'fast-enough');
  assert.equal(performanceStatus(89.5, 2500), 'needs-work');
  assert.equal(performanceStatus(90, 2500.5), 'needs-work');
  assert.equal(performanceStatus(Number.NaN, 2500), 'not-measured');
  assert.equal(performanceStatus(90, null), 'not-measured');
});
