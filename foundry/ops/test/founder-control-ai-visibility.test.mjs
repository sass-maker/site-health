import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { NormalizedAiVisibilityCache } from '../lib/founder-control/ai-visibility-cache.mjs';
import {
  createFixtureVisibilityProviders,
  loadAiVisibilityEngine,
  runAiVisibilityCanary,
} from '../lib/founder-control/ai-visibility.mjs';
import {
  assertAiVisibilityScheduleCanRun,
  evaluateAiVisibilityScheduleActivation,
  findAiVisibilityProject,
  loadAiVisibilityPortfolio,
  resolveAiVisibilityPortfolio,
} from '../lib/founder-control/ai-visibility-registry.mjs';
import { loadFounderProjects } from '../lib/founder-control/registry.mjs';
import { buildMarketingProjection } from '../lib/founder-control/service.mjs';
import { FounderControlStore } from '../lib/founder-control/store.mjs';

const engine = await loadAiVisibilityEngine();
const fixture = JSON.parse(
  readFileSync(new URL('./fixtures/ai-visibility/providers-v1.json', import.meta.url), 'utf8'),
);
const marketing = JSON.parse(
  readFileSync(new URL('../config/marketing-program.json', import.meta.url), 'utf8'),
);
const automation = JSON.parse(
  readFileSync(new URL('../config/automation-registry.json', import.meta.url), 'utf8'),
);

test('ignored projects are excluded unless the caller explicitly reactivates them', () => {
  const configured = structuredClone(marketing);
  configured.catalogExclusions = configured.catalogExclusions.filter((entry) => entry.slug !== 'aliveville');
  configured.projects.push({
    ...structuredClone(configured.projects.find((project) => project.slug === 'pace')),
    slug: 'aliveville',
    name: 'AliveVille',
    aliases: [],
    mode: 'evergreen',
  });
  configured.aiVisibility.projects.push({
    ...structuredClone(configured.aiVisibility.projects.find((project) => project.slug === 'pace')),
    slug: 'aliveville',
    aliases: ['Alive Ville'],
  });

  const inert = resolveAiVisibilityPortfolio({
    marketingProgram: configured,
    automationRegistry: automation,
  });
  assert.equal(inert.eligible.some((project) => project.slug === 'aliveville'), false);
  assert.deepEqual(
    inert.excluded.find((project) => project.projectId === 'aliveville'),
    { projectId: 'aliveville', reason: 'ignored' },
  );
  assert.throws(() => findAiVisibilityProject(inert, 'aliveville'), /explicit reactivation/);

  const reactivated = resolveAiVisibilityPortfolio({
    marketingProgram: configured,
    automationRegistry: automation,
    reactivatedProjectIds: ['aliveville'],
  });
  assert.equal(findAiVisibilityProject(reactivated, 'Alive Ville').reactivated, true);
});

test('fresh clones, unverified hosts, and disabled intent cannot execute a schedule', () => {
  const scheduleIntent = loadAiVisibilityPortfolio().scheduleIntent;
  assert.equal(scheduleIntent.enabled, false);
  assert.deepEqual(
    evaluateAiVisibilityScheduleActivation({ scheduleIntent }).blockers,
    [
      'schedule-intent-disabled',
      'designated-host-required',
      'host-verification-required',
      'approved-canary-required',
    ],
  );
  assert.throws(
    () =>
      assertAiVisibilityScheduleCanRun({
        scheduleIntent,
        designatedHost: true,
        hostVerified: true,
        approvedCanaryRunId: 'approved-run',
      }),
    /schedule-intent-disabled/,
  );
  assert.equal(
    evaluateAiVisibilityScheduleActivation({
      scheduleIntent: { ...scheduleIntent, enabled: true },
      designatedHost: true,
      hostVerified: true,
      approvedCanaryRunId: 'approved-run',
    }).allowed,
    true,
  );
});

test('fixture canary records bounded normalized receipts, history, cache use, and recommendations only', async () => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'foundry-ai-visibility-'));
  const cachePath = join(temporaryDirectory, 'cache.json');
  const store = new FounderControlStore({
    databasePath: join(temporaryDirectory, 'foundry.sqlite'),
    projects: loadFounderProjects(),
  });
  const project = findAiVisibilityProject(loadAiVisibilityPortfolio(), 'heypace');
  const providers = createFixtureVisibilityProviders(fixture, engine);
  const cache = new NormalizedAiVisibilityCache({ path: cachePath });

  try {
    const first = await runAiVisibilityCanary({
      project,
      providers,
      store,
      cache,
      engine,
      runId: 'fixture-run-1',
      now: () => '2026-07-25T08:00:00.000Z',
    });
    assert.deepEqual(first.coverage, {
      configured: 8,
      completed: 4,
      cached: 0,
      unavailable: 4,
      timedOut: 0,
      failed: 0,
    });
    assert.equal(first.cost.providerCalls, 8);
    assert.equal(first.cost.cacheHits, 0);
    assert.equal(first.cost.observedUsd, 0.004);
    assert.equal(first.cost.receipts.length, 8);
    assert.equal(first.metrics.coverageRate, 0.5);
    assert.equal(first.metrics.averagePosition, 1);
    assert.ok(first.metrics.visibilityScore > 0);
    assert.ok(first.recommendationIds.length > 0);

    const second = await runAiVisibilityCanary({
      project,
      providers,
      store,
      cache,
      engine,
      runId: 'fixture-run-2',
      now: () => '2026-07-25T09:00:00.000Z',
    });
    assert.equal(second.coverage.cached, 4);
    assert.equal(second.coverage.unavailable, 4);
    assert.equal(second.cost.providerCalls, 4);
    assert.equal(second.cost.cacheHits, 4);
    assert.equal(second.cost.observedUsd, 0);
    assert.equal(second.comparison.previousRunId, 'fixture-run-1');

    const events = store.listEvents();
    assert.equal(events.filter((event) => event.type === 'visibility.run-recorded').length, 2);
    assert.equal(events.some((event) => event.type.startsWith('mission.')), false);
    assert.ok(events.some((event) => event.type === 'recommendation.created'));
    assert.doesNotMatch(JSON.stringify(events), /HeyPace is the first recommendation/);
    assert.doesNotMatch(JSON.stringify(events), /responseText/);

    const projection = store.rebuildProjections({ now: '2026-07-25T09:00:00.000Z' });
    const pace = projection.aiVisibility.projects.find((entry) => entry.projectId === 'pace');
    assert.equal(pace.history.length, 2);
    assert.equal(pace.latest.runId, 'fixture-run-2');
    assert.equal(pace.comparison.previousRunId, 'fixture-run-1');
    const marketingView = buildMarketingProjection(
      projection,
      loadAiVisibilityPortfolio(),
    );
    const visiblePace = marketingView.aiVisibility.projects.find(
      (entry) => entry.projectId === 'pace',
    );
    assert.equal(visiblePace.latest.metrics.visibilityScore, first.metrics.visibilityScore);
    assert.equal(marketingView.aiVisibility.scheduleIntent.activation.allowed, false);

    const persistedCache = readFileSync(cachePath, 'utf8');
    assert.doesNotMatch(persistedCache, /HeyPace is the first recommendation/);
    assert.match(persistedCache, /"responseText": null/);
  } finally {
    store.close();
  }
});
