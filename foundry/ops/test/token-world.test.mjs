import assert from 'node:assert/strict';
import test from 'node:test';

import { buildTokenWorldProjection } from '../lib/token-world.mjs';

const seed = (overrides = {}) => ({
  schemaVersion: 1,
  snapshotDate: '2026-08-09',
  lastUpdatedAt: '2026-08-09T12:20:08.480796+00:00',
  authoritative: true,
  lifetimeTokens: 165_444_915_616,
  todayTokens: 65_896_278,
  publicAggregationFloor: 5,
  coverage: 'Verified CodeVetter usage baseline with privacy-safe daily aggregates.',
  projects: [{ id: 'codevetter', name: 'CodeVetter', tokens: 165_444_915_616 }],
  pulses: [],
  provenance: { source: 'fixture', accounting: 'authoritative provider usage' },
  ...overrides,
});

test('builds a first CodeVetter-scale snapshot without invented geography', () => {
  const result = buildTokenWorldProjection(seed());
  assert.equal(result.lifetimeTokens, 165_444_915_616);
  assert.equal(result.previousLifetimeTokens, 165_379_019_338);
  assert.equal(result.lastUpdatedAt, '2026-08-09T12:20:08.480796+00:00');
  assert.equal(result.countriesServed, 0);
  assert.equal(result.projectsContributing, 1);
  assert.deepEqual(result.pulses, []);
});

test('advances from the last verified lifetime total', () => {
  const previous = buildTokenWorldProjection(seed());
  const nextTotal = previous.lifetimeTokens + 4_000;
  const result = buildTokenWorldProjection(seed({
    snapshotDate: '2026-08-10',
    lastUpdatedAt: '2026-08-10T08:30:00Z',
    lifetimeTokens: nextTotal,
    todayTokens: 4_000,
    projects: [{ id: 'codevetter', name: 'CodeVetter', tokens: nextTotal }],
  }), previous);
  assert.equal(result.previousLifetimeTokens, previous.lifetimeTokens);
  assert.equal(result.lifetimeTokens, nextTotal);
});

test('rejects estimates, regressions, conflicting sums, and forbidden fields', () => {
  assert.throws(() => buildTokenWorldProjection(seed({ authoritative: false })), /authoritative/);
  assert.throws(() => buildTokenWorldProjection(seed({ lastUpdatedAt: 'yesterday' })), /lastUpdatedAt/);
  const previous = buildTokenWorldProjection(seed());
  assert.throws(() => buildTokenWorldProjection(seed({ snapshotDate: '2026-08-10', lifetimeTokens: 10, todayTokens: 10, projects: [{ id: 'codevetter', name: 'CodeVetter', tokens: 10 }] }), previous), /cannot decrease/);
  assert.throws(() => buildTokenWorldProjection(seed({ projects: [{ id: 'codevetter', name: 'CodeVetter', tokens: 1 }] })), /does not equal/);
  assert.throws(() => buildTokenWorldProjection(seed({ provenance: { prompt: 'private' } })), /forbidden/);
});

test('withholds sparse geography and rounds public pulse totals', () => {
  const result = buildTokenWorldProjection(seed({
    pulses: [
      { project: 'CodeVetter', country: 'IN', locality: 'Delhi', tokens: 42_019, events: 7 },
      { project: 'CodeVetter', country: 'JP', locality: 'Tokyo', tokens: 9_999, events: 2 },
    ],
  }));
  assert.equal(result.countriesServed, 1);
  assert.equal(result.pulses.length, 1);
  assert.equal(result.pulses[0].tokens, 42_000);
});

test('is deterministic for identical input', () => {
  const first = buildTokenWorldProjection(seed());
  assert.deepEqual(buildTokenWorldProjection(seed(), first), first);
  assert.throws(() => buildTokenWorldProjection(seed({
    lifetimeTokens: seed().lifetimeTokens + 1,
    projects: [{ id: 'codevetter', name: 'CodeVetter', tokens: seed().lifetimeTokens + 1 }],
  }), first), /conflicts/);
});
