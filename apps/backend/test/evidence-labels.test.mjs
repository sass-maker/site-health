import assert from 'node:assert/strict';
import test from 'node:test';
import { evidenceStateLabel, refreshAttemptLabel } from '../../web/src/lib/evidence-labels.mjs';

test('missing attempt does not imply a refresh is unnecessary', () => {
  for (const state of ['fresh', 'stale', 'failed', 'unavailable']) {
    assert.equal(refreshAttemptLabel({ state }, String), 'no refresh attempt recorded');
  }
  assert.equal(refreshAttemptLabel({ lastAttemptAt: '2026-09-07' }, String), 'last refresh attempt 2026-09-07');
});

test('unmeasured evidence is distinct from stale observations and actual running or failed attempts', () => {
  assert.equal(evidenceStateLabel({ state: 'stale', observedAt: null }), 'Not measured');
  assert.equal(evidenceStateLabel({ state: 'stale', observedAt: '2026-08-17' }), 'stale');
  assert.equal(evidenceStateLabel({ state: 'fresh', observedAt: '2026-09-07' }), 'fresh');
  for (const state of ['refreshing', 'failed', 'unavailable']) assert.equal(evidenceStateLabel({ state, observedAt: null }), state);
  assert.equal(evidenceStateLabel(undefined), 'Not measured');
});
