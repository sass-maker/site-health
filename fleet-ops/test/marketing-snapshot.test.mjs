import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { validateMarketingProgram } from '../lib/marketing-program.mjs';
import { buildMarketingSnapshot } from '../lib/marketing-snapshot.mjs';

const registry = validateMarketingProgram(JSON.parse(await readFile(new URL('../config/marketing-program.json', import.meta.url), 'utf8')));

test('snapshot canonicalizes projects and summarizes the Postiz lifecycle', () => {
  const events = [
    { project_slug: 'linkchat', request_id: 'one', kind: 'package', recorded_at: '2026-07-20T00:00:00Z', body: 'private copy' },
    { project_slug: 'karte', request_id: 'one', kind: 'media', recorded_at: '2026-07-20T01:00:00Z' },
    { project_slug: 'karte', request_id: 'one', kind: 'postiz-draft', recorded_at: '2026-07-20T02:00:00Z' },
    { project_slug: 'karte', request_id: 'one', kind: 'postiz-published', recorded_at: '2026-07-20T03:00:00Z' },
    { project_slug: 'karte', request_id: 'one', kind: 'postiz-analytics', recorded_at: '2026-07-20T04:00:00Z' },
  ];
  const before = structuredClone(events);
  const snapshot = buildMarketingSnapshot(events, registry, { now: '2026-07-21T00:00:00Z' });
  const karte = snapshot.projects.find((project) => project.slug === 'karte');
  assert.deepEqual(karte.stages, { packages: 1, produced: 1, drafts: 1, scheduled: 0, published: 1, measured: 1 });
  assert.equal(karte.reviewDebt, 0);
  assert.deepEqual(events, before);
});

test('snapshot reports review debt, failures, freshness, and next action', () => {
  const snapshot = buildMarketingSnapshot([
    { projectSlug: 'pace', requestId: 'draft', kind: 'postiz-draft', recordedAt: '2026-07-01T00:00:00Z' },
    { projectSlug: 'high-signal', requestId: 'failed', kind: 'failure', recordedAt: '2026-07-20T00:00:00Z' },
  ], registry, { now: '2026-07-21T00:00:00Z' });
  const pace = snapshot.projects.find((project) => project.slug === 'pace');
  const highSignal = snapshot.projects.find((project) => project.slug === 'high-signal');
  assert.equal(pace.reviewDebt, 1);
  assert.equal(pace.nextAction, 'Review drafts in Postiz');
  assert.equal(highSignal.failures, 1);
  assert.equal(highSignal.nextAction, 'Inspect failed marketing handoff');
});

test('public snapshot contains no unpublished content or private identifiers', () => {
  const snapshot = buildMarketingSnapshot([{
    projectSlug: 'karte', requestId: 'secret-request', kind: 'postiz-draft', recordedAt: '2026-07-20T00:00:00Z',
    title: 'unpublished title', body: 'unpublished body', integrationId: 'private-integration', apiKey: 'secret-key',
  }], registry, { now: '2026-07-21T00:00:00Z' });
  const serialized = JSON.stringify(snapshot);
  for (const secret of ['secret-request', 'unpublished title', 'unpublished body', 'private-integration', 'secret-key']) {
    assert.equal(serialized.includes(secret), false);
  }
});
