import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { NormalizedAiVisibilityCache } from '../lib/dashboard-backend/ai-visibility-cache.mjs';
import {
  createFixtureVisibilityProviders,
  expandVisibilityPrompts,
  loadAiVisibilityEngine,
  prepareProviderObservationRuns,
  runAiVisibilityCanary,
} from '../lib/dashboard-backend/ai-visibility.mjs';
import {
  assertAiVisibilityScheduleCanRun,
  evaluateAiVisibilityScheduleActivation,
  findAiVisibilityProject,
  loadAiVisibilityPortfolio,
  resolveAiVisibilityPortfolio,
} from '../lib/dashboard-backend/ai-visibility-registry.mjs';
import { loadDashboardProjects } from '../lib/dashboard-backend/registry.mjs';
import { buildAiVisibilityProjection } from '../lib/dashboard-backend/service.mjs';
import { DashboardStore } from '../lib/dashboard-backend/store.mjs';

const engine = await loadAiVisibilityEngine();
const fixture = JSON.parse(
  readFileSync(new URL('./fixtures/ai-visibility/providers-v1.json', import.meta.url), 'utf8'),
);
const aiVisibilityConfig = JSON.parse(
  readFileSync(new URL('../config/ai-visibility.json', import.meta.url), 'utf8'),
);

function providerObservationRun(project, {
  runId = `provider-observation-${project.slug}`,
  observedAt = '2026-07-31T10:00:00.000Z',
  responseText = `${project.name} is one option. Source: ${project.domain}`,
  observedCostUsd = 0,
} = {}) {
  const expanded = expandVisibilityPrompts(project, project.promptSets[0].id);
  const prompt = expanded.prompts[0];
  return {
    projectId: project.slug,
    runId,
    observedAt,
    promptSetId: expanded.promptSetId,
    providers: [{
      id: 'provider-export',
      model: 'provider-model',
      grounded: true,
      observations: {
        [prompt.id]: {
          status: 'completed',
          capturedAt: observedAt,
          providerRequestId: `request-${project.slug}`,
          responseText,
          observedCostUsd,
        },
      },
    }],
  };
}

test('ignored projects are excluded unless the caller explicitly reactivates them', () => {
  const configured = structuredClone(aiVisibilityConfig);
  configured.projects.push({
    ...structuredClone(configured.projects.find((project) => project.slug === 'pace')),
    slug: 'aliveville',
    name: 'AliveVille',
    aliases: ['Alive Ville'],
    attention: 'ignored',
  });

  const inert = resolveAiVisibilityPortfolio({
    config: configured,
  });
  assert.equal(inert.eligible.some((project) => project.slug === 'aliveville'), false);
  assert.deepEqual(
    inert.excluded.find((project) => project.projectId === 'aliveville'),
    { projectId: 'aliveville', reason: 'ignored' },
  );
  assert.throws(() => findAiVisibilityProject(inert, 'aliveville'), /explicit reactivation/);

  const reactivated = resolveAiVisibilityPortfolio({
    config: configured,
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

test('every maintained public Fleet identity has product-specific fixture coverage', () => {
  const catalog = JSON.parse(
    readFileSync(new URL('../config/projects.json', import.meta.url), 'utf8'),
  );
  const expected = catalog.projects
    .filter((project) =>
      (project.public?.listing === 'maintained' || project.metrics?.publicSite === true)
      && !['past', 'non-product'].includes(project.lifecycle)
      && project.tier !== 'non-product'
      && project.domains.length > 0)
    .map((project) => project.id)
    .sort();
  const portfolio = loadAiVisibilityPortfolio();
  assert.equal(portfolio.excluded.length, 0);
  assert.deepEqual(portfolio.eligible.map((project) => project.slug).sort(), expected);
  assert.equal(portfolio.eligible.length, 36);
  for (const project of portfolio.eligible) {
    // Every identity keeps its own two-prompt buyer-discovery fixture set.
    const buyerDiscovery = project.promptSets.filter((set) => set.id === 'buyer-discovery');
    assert.equal(buyerDiscovery.length, 1);
    assert.equal(buyerDiscovery[0].prompts.length, 2);
    assert.equal(project.providerPolicy.liveProvidersAllowed, false);
  }
});

test('the frozen baseline AI-visibility panel stays intact and append-only', () => {
  const config = JSON.parse(
    readFileSync(new URL('../config/ai-visibility.json', import.meta.url), 'utf8'),
  );
  const panel = config.baselinePanel;
  assert.equal(panel.id, 'baseline-panel-v1');
  assert.equal(panel.promptCount, 46);

  // The panel froze at 40 prompts across six surfaces (SAR-2). It may only grow,
  // and every count above the original 40 must carry a recorded amendment saying
  // what was appended and why — otherwise the baseline can drift unexplained.
  if (panel.promptCount !== 40) {
    assert.ok(
      Array.isArray(panel.amendments) && panel.amendments.length > 0,
      'a panel larger than the original 40 prompts must record an amendment',
    );
  }

  const portfolio = loadAiVisibilityPortfolio();
  const promptIds = [];
  for (const slug of panel.surfaces) {
    const project = portfolio.eligible.find((candidate) => candidate.slug === slug);
    assert.ok(project, `panel surface ${slug} must stay an eligible identity`);
    const frozen = project.promptSets.find((set) => set.id === panel.id);
    assert.ok(frozen, `panel surface ${slug} must carry ${panel.id}`);
    assert.equal(frozen.frozen, true);
    for (const prompt of frozen.prompts) promptIds.push(prompt.id);
  }
  assert.equal(promptIds.length, panel.promptCount);
  assert.equal(new Set(promptIds).size, panel.promptCount);
});

test('the frozen engine set stays declared, budgeted, and honestly attributed', () => {
  const config = JSON.parse(
    readFileSync(new URL('../config/ai-visibility.json', import.meta.url), 'utf8'),
  );
  const panel = config.baselinePanel;
  const engines = panel.engines;
  assert.ok(Array.isArray(engines) && engines.length > 0, 'the panel must declare its engine set');

  const engineIds = engines.map((candidate) => candidate.id);
  assert.equal(new Set(engineIds).size, engineIds.length, 'engine ids must be unique');
  for (const candidate of engines) {
    for (const field of ['id', 'label', 'surface', 'capture']) {
      assert.ok(candidate[field], `engine ${candidate.id} must declare ${field}`);
    }
  }

  // A capture is only ingestible if the surface's call budget covers every
  // expanded prompt on every declared engine — prepareProviderObservationRuns
  // throws otherwise. Adding an engine without raising the budget silently
  // breaks the first ingest that uses it, which is how the five-engine freeze
  // shipped a budget sized for one.
  const portfolio = loadAiVisibilityPortfolio();
  for (const slug of panel.surfaces) {
    const project = portfolio.eligible.find((candidate) => candidate.slug === slug);
    const expanded = expandVisibilityPrompts(project, panel.id).prompts.length;
    assert.ok(
      project.runBudget.maxCalls >= expanded * engines.length,
      `${slug} budgets ${project.runBudget.maxCalls} calls but a full sweep needs ${expanded * engines.length}`,
    );
  }

  // Every executed baseline must name the columns it actually covered. A rate
  // captured on one column is not a panel-wide rate, and the record is what
  // stops a later reader from averaging incomparable columns together.
  for (const run of panel.baselineRuns ?? []) {
    assert.ok(Array.isArray(run.engines) && run.engines.length > 0, `${run.runIdPrefix} must name its engines`);
    for (const id of run.engines) {
      assert.ok(engineIds.includes(id), `${run.runIdPrefix} cites undeclared engine ${id}`);
    }
  }
});

test('fixture canary records bounded normalized receipts, history, and cache use only', async () => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'foundry-ai-visibility-'));
  const cachePath = join(temporaryDirectory, 'cache.json');
  const store = new DashboardStore({
    databasePath: join(temporaryDirectory, 'foundry.sqlite'),
    projects: loadDashboardProjects(),
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
    assert.equal(first.evidenceMode, 'fixture');
    assert.equal(first.event.payload.evidenceMode, 'fixture');
    assert.equal(first.cost.providerCalls, 8);
    assert.equal(first.cost.cacheHits, 0);
    assert.equal(first.cost.observedUsd, 0.004);
    assert.equal(first.cost.receipts.length, 8);
    assert.equal(first.metrics.coverageRate, 0.5);
    assert.equal(first.metrics.averagePosition, 1);
    assert.ok(first.metrics.visibilityScore > 0);

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
    assert.equal(events.every((event) => event.type === 'visibility.run-recorded'), true);
    assert.doesNotMatch(JSON.stringify(events), /HeyPace is the first recommendation/);
    assert.doesNotMatch(JSON.stringify(events), /responseText/);

    const projection = store.rebuildProjections({ now: '2026-07-25T09:00:00.000Z' });
    const pace = projection.aiVisibility.projects.find((entry) => entry.projectId === 'pace');
    assert.equal(pace.history.length, 2);
    assert.equal(pace.latest.runId, 'fixture-run-2');
    assert.equal(pace.comparison.previousRunId, 'fixture-run-1');
    const dashboardView = buildAiVisibilityProjection(
      projection,
      loadAiVisibilityPortfolio(),
    );
    const visiblePace = dashboardView.aiVisibility.projects.find(
      (entry) => entry.projectId === 'pace',
    );
    assert.equal(visiblePace.latest.metrics.visibilityScore, first.metrics.visibilityScore);
    assert.equal(visiblePace.questions.length, 2);
    assert.match(visiblePace.questions[0].text, /Mac voice assistants/i);
    assert.equal(dashboardView.aiVisibility.scheduleIntent.activation.allowed, false);

    const persistedCache = readFileSync(cachePath, 'utf8');
    assert.doesNotMatch(persistedCache, /HeyPace is the first recommendation/);
    assert.match(persistedCache, /"responseText": null/);
  } finally {
    store.close();
  }
});

test('provider observation ingestion records normalized evidence without retaining raw answers or request ids', async () => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'foundry-ai-visibility-provider-'));
  const store = new DashboardStore({
    databasePath: join(temporaryDirectory, 'foundry.sqlite'),
    projects: loadDashboardProjects(),
  });
  const portfolio = loadAiVisibilityPortfolio();
  const project = findAiVisibilityProject(portfolio, 'pace');
  const secretMarker = 'RAW_PROVIDER_ANSWER_MUST_NOT_PERSIST';
  const requestMarker = 'request-pace';
  const citationUrls = [
    'https://heypace.app',
    ...Array.from({ length: 55 }, (_, index) => `https://source${index}.example/item`),
  ];
  const [prepared] = prepareProviderObservationRuns({
    bundle: {
      schema: 'fleet.ai-visibility-provider-observations.v1',
      runs: [providerObservationRun(project, {
        responseText: `${secretMarker} HeyPace is recommended. Sources: ${citationUrls.join(' ')}`,
        observedCostUsd: 0.002,
      })],
    },
    portfolio,
    engine,
  });

  try {
    await runAiVisibilityCanary({
      project,
      providers: createFixtureVisibilityProviders(fixture, engine),
      store,
      engine,
      runId: 'fixture-before-provider-observation',
      now: () => '2026-07-31T09:00:00.000Z',
    });
    const receipt = await runAiVisibilityCanary({
      project: prepared.project,
      providers: prepared.providers,
      store,
      engine,
      providerKind: 'provider-observation',
      promptSetId: prepared.promptSetId,
      provenance: prepared.provenance,
      runId: prepared.runId,
      now: () => prepared.observedAt,
    });
    assert.equal(receipt.evidenceMode, 'provider-observation');
    assert.equal(receipt.coverage.configured, 4);
    assert.equal(receipt.coverage.completed, 1);
    assert.equal(receipt.coverage.unavailable, 3);
    assert.equal(receipt.cost.observedUsd, 0.002);
    assert.equal(receipt.cost.providerCalls, 1);
    assert.equal(receipt.cost.receipts.length, 1);
    assert.equal(receipt.comparison, null);
    assert.equal(receipt.event.payload.citations.total, 56);
    assert.equal(receipt.event.payload.citations.urls.length, 50);
    assert.equal(receipt.event.payload.citations.urls[0], 'https://heypace.app/');
    assert.equal(receipt.event.payload.citations.hosts.includes('heypace.app'), true);
    assert.deepEqual(receipt.event.payload.provenance, {
      source: 'operator-supplied-provider-export',
      providerIds: ['provider-export'],
      models: ['provider-model'],
      observationCount: 1,
      completedObservationCount: 1,
      capturedAtRange: {
        first: '2026-07-31T10:00:00.000Z',
        last: '2026-07-31T10:00:00.000Z',
      },
      providerRequestIdCount: 1,
    });
    const persisted = JSON.stringify(store.listEvents());
    assert.doesNotMatch(persisted, new RegExp(secretMarker));
    assert.doesNotMatch(persisted, new RegExp(requestMarker));
    assert.doesNotMatch(persisted, /responseText/);
  } finally {
    store.close();
  }
});

test('provider observation ingestion rejects incomplete provenance and unknown prompts', () => {
  const portfolio = loadAiVisibilityPortfolio();
  const project = findAiVisibilityProject(portfolio, 'pace');
  const run = providerObservationRun(project);
  const promptId = Object.keys(run.providers[0].observations)[0];
  delete run.providers[0].observations[promptId].observedCostUsd;
  assert.throws(
    () => prepareProviderObservationRuns({
      bundle: { schema: 'fleet.ai-visibility-provider-observations.v1', runs: [run] },
      portfolio,
      engine,
    }),
    /explicit non-negative number/,
  );

  const unknownPrompt = providerObservationRun(project);
  const observation = Object.values(unknownPrompt.providers[0].observations)[0];
  unknownPrompt.providers[0].observations = { 'unknown/prompt': observation };
  assert.throws(
    () => prepareProviderObservationRuns({
      bundle: {
        schema: 'fleet.ai-visibility-provider-observations.v1',
        runs: [unknownPrompt],
      },
      portfolio,
      engine,
    }),
    /unknown prompt/,
  );
});

test('provider observation all-project gate requires the exact canonical 36', () => {
  const portfolio = loadAiVisibilityPortfolio();
  assert.equal(portfolio.eligible.length, 36);
  assert.throws(
    () => prepareProviderObservationRuns({
      bundle: {
        schema: 'fleet.ai-visibility-provider-observations.v1',
        runs: [providerObservationRun(portfolio.eligible[0])],
      },
      portfolio,
      engine,
      requireAll: true,
    }),
    /do not cover the canonical 36/,
  );

  const prepared = prepareProviderObservationRuns({
    bundle: {
      schema: 'fleet.ai-visibility-provider-observations.v1',
      runs: portfolio.eligible.map((project) => providerObservationRun(project)),
    },
    portfolio,
    engine,
    requireAll: true,
  });
  assert.equal(prepared.length, 36);
});

test('offline observations do not enable direct live provider execution', async () => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'foundry-ai-visibility-live-policy-'));
  const store = new DashboardStore({
    databasePath: join(temporaryDirectory, 'foundry.sqlite'),
    projects: loadDashboardProjects(),
  });
  const project = findAiVisibilityProject(loadAiVisibilityPortfolio(), 'pace');
  try {
    await assert.rejects(
      () => runAiVisibilityCanary({
        project,
        providers: [{
          id: 'provider-export',
          model: 'provider-model',
          execute: async () => ({ text: 'This must not execute.' }),
        }],
        store,
        engine,
        providerKind: 'live',
      }),
      /Live providers are disabled/,
    );
  } finally {
    store.close();
  }
});
