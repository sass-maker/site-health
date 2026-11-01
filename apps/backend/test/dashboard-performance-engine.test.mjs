import assert from 'node:assert/strict';
import test from 'node:test';
import { latestPerformanceBatch } from '../lib/dashboard-projection.mjs';

const tag = 'console-manual-12345678-1234-1234-1234-123456789abc';
const start = Date.parse('2026-11-01T10:00:00Z');
const run = (index, lighthouseVersion, score = 98, lcp = 1200) => ({
  observedAt: new Date(start + index * 1000).toISOString(),
  preset: 'desktop', tag, lighthouseVersion, score, lcp,
});

test('a new engine cannot complete its cohort with older-engine samples under the same tag', () => {
  const old = Array.from({ length: 5 }, (_, i) => run(i, '13.4.1'));
  const reading = latestPerformanceBatch([...old, run(5, '13.6.0', 10, 9000)]);
  assert.equal(reading.sampleCount, 5);
  assert.equal(reading.score, 98);
  assert.equal(reading.lighthouseVersion, '13.4.1');
  assert.equal(reading.pendingBatch.sampleCount, 1);
  assert.equal(reading.pendingBatch.score, 10);
  assert.equal(reading.pendingBatch.lighthouseVersion, '13.6.0');
});

test('unknown historical engines stay separate from a partial known-engine reading', () => {
  const old = Array.from({ length: 5 }, (_, i) => run(i, null));
  const reading = latestPerformanceBatch([...old, run(5, '13.6.0'), run(6, '13.6.0')]);
  assert.equal(reading.sampleCount, 5);
  assert.equal(reading.lighthouseVersion ?? null, null);
  assert.equal(reading.pendingBatch.sampleCount, 2);
  assert.equal(reading.pendingBatch.lighthouseVersion, '13.6.0');
});

test('a complete new-engine reading replaces the old cohort without changing either history', () => {
  const history = [
    ...Array.from({ length: 5 }, (_, i) => run(i, '13.4.1', 80, 3000)),
    ...Array.from({ length: 5 }, (_, i) => run(i + 5, '13.6.0')),
  ];
  const before = structuredClone(history);
  const reading = latestPerformanceBatch(history);
  assert.equal(reading.sampleCount, 5);
  assert.equal(reading.score, 98);
  assert.equal(reading.lcp, 1200);
  assert.equal(reading.lighthouseVersion, '13.6.0');
  assert.equal(reading.pendingBatch, undefined);
  assert.deepEqual(history, before);
});
