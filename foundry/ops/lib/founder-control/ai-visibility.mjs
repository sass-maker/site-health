import { randomUUID } from 'node:crypto';
import { accessSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { recommendationEvent } from './recommendations.mjs';

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
const defaultPackageEntry = join(
  moduleDirectory,
  '..',
  '..',
  '..',
  'packages',
  'ai-visibility',
  'dist',
  'index.js',
);
const defaultPackageSourceDirectory = join(
  moduleDirectory,
  '..',
  '..',
  '..',
  'packages',
  'ai-visibility',
  'src',
);

function round(value, digits = 6) {
  const scale = 10 ** digits;
  return Math.round((Number(value) + Number.EPSILON) * scale) / scale;
}

function temporaryPackageRuntime(sourceDirectory) {
  const outputDirectory = mkdtempSync(join(tmpdir(), 'foundry-ai-visibility-runtime-'));
  for (const file of readdirSync(sourceDirectory).filter((name) => name.endsWith('.ts'))) {
    const source = readFileSync(join(sourceDirectory, file), 'utf8');
    const transformed = stripTypeScriptTypes(source, {
      mode: 'transform',
      sourceMap: false,
    }).replaceAll(/from "(\.\/[^"]+)\.js"/g, 'from "$1.mjs"');
    writeFileSync(join(outputDirectory, file.replace(/\.ts$/, '.mjs')), transformed, { mode: 0o600 });
  }
  return join(outputDirectory, 'index.mjs');
}

export async function loadAiVisibilityEngine({
  packageEntry = defaultPackageEntry,
  packageSourceDirectory = defaultPackageSourceDirectory,
} = {}) {
  try {
    accessSync(packageEntry);
    return import(pathToFileURL(packageEntry).href);
  } catch {}
  try {
    accessSync(packageSourceDirectory);
  } catch {
    throw new Error('The local @saas-maker/ai-visibility package source is unavailable');
  }
  return import(pathToFileURL(temporaryPackageRuntime(packageSourceDirectory)).href);
}

export function expandVisibilityPrompts(project, promptSetId) {
  const promptSet = project.promptSets.find((set) => set.id === (promptSetId ?? project.promptSets[0]?.id));
  if (!promptSet) throw new Error(`Unknown AI visibility prompt set: ${promptSetId}`);
  return {
    promptSetId: promptSet.id,
    prompts: promptSet.prompts.flatMap((prompt) =>
      project.personas.map((persona) => ({
        id: `${promptSet.id}/${prompt.id}/${persona.id}`,
        text: `${prompt.text}\nAnswer for ${persona.label}.`,
        persona: persona.id,
      })),
    ),
  };
}

function waitForFixture(delayMs, signal) {
  if (!delayMs) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, delayMs);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(Object.assign(new Error('fixture request aborted'), { name: 'AbortError' }));
      },
      { once: true },
    );
  });
}

export function createFixtureVisibilityProviders(fixture, engine) {
  if (fixture?.schema !== 'fleet.ai-visibility-fixture.v1' || !Array.isArray(fixture.providers)) {
    throw new Error('AI visibility fixture must use fleet.ai-visibility-fixture.v1');
  }
  return fixture.providers.map((provider) => {
    if (!provider?.id || !provider.model || !provider.responses || typeof provider.responses !== 'object') {
      throw new Error('AI visibility fixture provider is invalid');
    }
    return {
      id: provider.id,
      model: provider.model,
      grounded: Boolean(provider.grounded),
      fixture: true,
      estimateCostUsd: () => Number(provider.estimatedCostUsd ?? 0),
      execute: async ({ prompt, signal }) => {
        const response = provider.responses[prompt.id] ?? provider.responses.default;
        if (!response) throw new engine.ProviderUnavailableError(`No fixture response for ${prompt.id}`);
        await waitForFixture(Number(response.delayMs ?? 0), signal);
        if (response.status === 'unavailable') {
          throw new engine.ProviderUnavailableError('Fixture provider unavailable');
        }
        if (response.status === 'retryable') {
          throw new engine.RetryableProviderError('Fixture provider retryable failure');
        }
        if (response.status === 'failed') throw new Error('Fixture provider failure');
        return {
          text: String(response.text ?? ''),
          model: String(response.model ?? provider.model),
          observedCostUsd: Number(response.observedCostUsd ?? 0),
        };
      },
    };
  });
}

function assertProvidersAllowed(project, providers, providerKind) {
  if (providers.length === 0) throw new Error('At least one fixture provider is required');
  if (providerKind !== 'fixture' && project.providerPolicy.liveProvidersAllowed !== true) {
    throw new Error(`Live providers are disabled for ${project.slug}`);
  }
  const allowed = new Set(project.providerPolicy.allowedProviderIds);
  for (const provider of providers) {
    if (!allowed.has(provider.id)) throw new Error(`Provider ${provider.id} is not allowed for ${project.slug}`);
    if (providerKind === 'fixture' && provider.fixture !== true) {
      throw new Error(`Provider ${provider.id} is not marked as a fixture provider`);
    }
  }
}

function normalizedRows(run, observedAt) {
  return run.attempts
    .filter((attempt) => ['completed', 'cached'].includes(attempt.status) && attempt.analysis)
    .map((attempt) => ({
      brandMentioned: attempt.analysis.brandMentioned,
      brandRecommended: attempt.analysis.brandRecommended,
      competitorsMentioned: attempt.analysis.competitorsMentioned
        .filter((competitor) => competitor.mentioned)
        .map((competitor) => competitor.name),
      citations: attempt.analysis.citations,
      brandCited: attempt.analysis.brandCited,
      platform: attempt.providerId,
      persona: attempt.persona,
      createdAt: observedAt,
    }));
}

function numericDeltas(current, previous) {
  if (!previous) return null;
  return Object.fromEntries(
    ['visibilityScore', 'mentionRate', 'recommendationRate', 'citationRate', 'coverageRate']
      .map((field) => [field, round(current[field] - Number(previous[field] ?? 0))]),
  );
}

function comparisonFor(current, citations, previousEvent) {
  if (!previousEvent) return null;
  const previousMetrics = previousEvent.payload.metrics ?? {};
  const previousCitations = previousEvent.payload.citations ?? {};
  const previousHosts = new Set(previousCitations.hosts ?? []);
  const currentHosts = new Set(citations.hosts);
  return {
    previousRunId: previousEvent.payload.runId,
    deltas: numericDeltas(current, previousMetrics),
    citationHostsAdded: [...currentHosts].filter((host) => !previousHosts.has(host)).sort(),
    citationHostsRemoved: [...previousHosts].filter((host) => !currentHosts.has(host)).sort(),
  };
}

function rankMetrics(run) {
  const positions = run.attempts
    .map((attempt) => attempt.analysis?.brandPosition)
    .filter((position) => Number.isFinite(position));
  return {
    rankedAnswers: positions.length,
    averagePosition: positions.length
      ? round(positions.reduce((sum, position) => sum + position, 0) / positions.length, 2)
      : null,
  };
}

function citationSummary(rows, engine) {
  const urls = rows.flatMap((row) => row.citations);
  return {
    total: urls.length,
    hosts: [...new Set(urls.map(engine.hostOf).filter(Boolean))].sort(),
  };
}

function buildReport({ engine, project, rows, observedAt }) {
  const shareOfVoice = engine.computeShareOfVoice(rows, 30);
  const score = engine.computeVisibilityScore(shareOfVoice, rows);
  const perPersona = engine.computePersonaVisibility(rows);
  const identity = {
    brandUrl: project.domain,
    brandAliases: project.aliases,
    competitorUrls: project.competitors.map((competitor) => ({
      id: competitor.name,
      url: competitor.url,
    })),
  };
  const citationGaps = engine.computeCitationGaps(rows, identity);
  const trend = engine.computeTrends(rows, 30, Date.parse(observedAt));
  return engine.composeVisibilityReport({
    brandName: project.name,
    windowDays: 30,
    score,
    shareOfVoice,
    perPersona,
    citationGaps,
    matrix: [],
    trend,
    platforms: [...new Set(rows.map((row) => row.platform))].sort(),
  });
}

function recommendationInputs({ report, comparison, project, evidence, runId, observedAt, coverageRate }) {
  const priorityValue = { high: 0.85, medium: 0.65, low: 0.35 };
  const inputs = report.recommendations.slice(0, 3).map((recommendation, index) => ({
    title: recommendation.title,
    rationale: `${recommendation.detail} This is a recommendation for owner review; no marketing work was started.`,
    impact: priorityValue[recommendation.priority],
    confidence: Math.max(0.25, Math.min(0.9, coverageRate)),
    effort: recommendation.area === 'citations' ? 0.6 : 0.45,
    reversibility: 1,
    attention: project.attention,
    projectId: project.slug,
    idempotencyKey: `ai-visibility-recommendation/${runId}/${index}`,
    observedAt,
    actor: { type: 'automation', id: 'ai-visibility-canary', label: 'AI visibility canary' },
    evidence,
  }));
  if (
    comparison?.deltas &&
    (comparison.deltas.visibilityScore <= -5 || comparison.deltas.citationRate <= -0.1)
  ) {
    inputs.unshift({
      title: 'Review the AI visibility decline',
      rationale: `Visibility changed by ${comparison.deltas.visibilityScore} points and citation rate changed by ${round(comparison.deltas.citationRate * 100, 2)} percentage points since the previous comparable run. Investigate the linked evidence before choosing any marketing response.`,
      impact: 0.8,
      confidence: Math.max(0.25, Math.min(0.9, coverageRate)),
      effort: 0.4,
      reversibility: 1,
      attention: project.attention,
      projectId: project.slug,
      idempotencyKey: `ai-visibility-recommendation/${runId}/comparison`,
      observedAt,
      actor: { type: 'automation', id: 'ai-visibility-canary', label: 'AI visibility canary' },
      evidence,
    });
  }
  return inputs;
}

export async function runAiVisibilityCanary({
  project,
  providers,
  store,
  cache,
  engine,
  promptSetId,
  providerKind = 'fixture',
  now = () => new Date().toISOString(),
  runId = randomUUID(),
}) {
  assertProvidersAllowed(project, providers, providerKind);
  const observedAt = now();
  const { promptSetId: selectedPromptSet, prompts } = expandVisibilityPrompts(project, promptSetId);
  const costReceipts = [];
  const run = await engine.executeVisibilityRun({
    subject: {
      brandName: project.name,
      brandAliases: project.aliases,
      brandUrl: project.domain,
      competitors: project.competitors,
    },
    prompts,
    providers,
    policy: {
      ...project.runBudget,
      cacheTtlMs: project.cacheWindowHours * 60 * 60 * 1000,
    },
    cache: cache ? { adapter: cache, now: () => Date.parse(observedAt) } : undefined,
    hooks: {
      onCostReceipt: (receipt) => costReceipts.push(receipt),
    },
  });

  const rows = normalizedRows(run, observedAt);
  const report = buildReport({ engine, project, rows, observedAt });
  const coverageDenominator = run.coverage.configured || 1;
  const completedAnswers = run.coverage.completed + run.coverage.cached;
  const metrics = {
    visibilityScore: report.score.score,
    mentionRate: round(report.shareOfVoice.brandMentionRate),
    recommendationRate: round(report.shareOfVoice.brandRecommendationRate),
    citationRate: round(report.shareOfVoice.brandCitationRate),
    coverageRate: round(completedAnswers / coverageDenominator),
    ...rankMetrics(run),
    competitorShare: Object.fromEntries(
      Object.entries(report.shareOfVoice.competitorShare).map(([name, value]) => [name, round(value)]),
    ),
  };
  const citations = citationSummary(rows, engine);
  const previousEvent = store
    .listEvents()
    .filter((event) => event.type === 'visibility.run-recorded' && event.projectId === project.slug)
    .at(-1);
  const comparison = comparisonFor(metrics, citations, previousEvent);
  const freshUntil = new Date(
    Date.parse(observedAt) + project.cacheWindowHours * 60 * 60 * 1000,
  ).toISOString();
  const evidence = [{
    provider: 'ai-visibility',
    kind: 'run',
    id: runId,
    state: completedAnswers > 0 ? 'verified' : 'unavailable',
    observedAt,
    freshUntil,
    summary: {
      projectId: project.slug,
      completedAnswers,
      configuredCalls: run.coverage.configured,
      visibilityScore: metrics.visibilityScore,
      observedCostUsd: round(run.cost.observedUsd),
    },
    confidence: metrics.coverageRate,
  }];
  const payload = {
    runId,
    promptSetId: selectedPromptSet,
    analyzerFingerprint: run.analyzerFingerprint,
    coverage: structuredClone(run.coverage),
    cost: {
      estimatedUsd: round(run.cost.estimatedUsd),
      observedUsd: round(run.cost.observedUsd),
      providerCalls: run.cost.providerCalls,
      cacheHits: run.cost.cacheHits,
      receipts: costReceipts.map((receipt) => ({
        promptId: receipt.promptId,
        providerId: receipt.providerId,
        model: receipt.model,
        estimatedCostUsd: round(receipt.estimatedCostUsd),
        observedCostUsd: round(receipt.observedCostUsd),
        cached: receipt.cached,
      })),
    },
    cache: {
      windowHours: project.cacheWindowHours,
      hits: run.coverage.cached,
    },
    metrics,
    citations,
    attempts: run.attempts.map((attempt) => ({
      promptId: attempt.promptId,
      persona: attempt.persona,
      providerId: attempt.providerId,
      model: attempt.model,
      status: attempt.status,
      cached: attempt.cached,
      observedCostUsd: round(attempt.observedCostUsd),
      retryable: attempt.retryable,
    })),
    ...(comparison ? { comparison } : {}),
  };
  const recorded = store.append({
    type: 'visibility.run-recorded',
    actor: { type: 'automation', id: 'ai-visibility-canary', label: 'AI visibility canary' },
    projectId: project.slug,
    idempotencyKey: `ai-visibility-run/${runId}`,
    occurredAt: observedAt,
    payload,
    evidence,
  });

  const recommendations = [];
  if (completedAnswers > 0) {
    for (const input of recommendationInputs({
      report,
      comparison,
      project,
      evidence,
      runId,
      observedAt,
      coverageRate: metrics.coverageRate,
    })) {
      const event = recommendationEvent(input, { now: observedAt });
      if (event) recommendations.push(store.append(event).event);
    }
  }

  return {
    event: recorded.event,
    duplicate: recorded.duplicate,
    projectId: project.slug,
    runId,
    observedAt,
    freshUntil,
    coverage: payload.coverage,
    cost: payload.cost,
    metrics,
    citations,
    comparison,
    recommendationIds: recommendations.map((event) => event.payload.recommendationId ?? event.id),
  };
}
