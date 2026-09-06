#!/usr/bin/env node
// Route A tooling for the frozen AI Visibility panel: emit a fillable capture
// template, fold filled captures into a provider-observation bundle, and
// validate that bundle before it touches the ledger.
//
// Route A means a human runs the frozen prompts against the frozen engines in
// their normal web UIs and pastes the answers back. This script reads no
// credential and makes no network request; it only reshapes text you supply.
//
//   # 1. emit the template (every expanded prompt x every frozen engine)
//   node scripts/ai-visibility-capture-kit.mjs template --out /private/capture.json
//
//   # 2. fill in responseText + capturedAt, then fold it into a bundle
//   node scripts/ai-visibility-capture-kit.mjs build \
//     --input /private/capture.json --out /private/bundle.json
//
//   # 3. dry-run the exact validation the ingest performs, writing nothing
//   node scripts/ai-visibility-capture-kit.mjs validate --input /private/bundle.json
//
//   # 4. ingest for real
//   node scripts/ai-visibility-provider-observations.mjs --input /private/bundle.json
//
// Keep filled captures and bundles outside Git: they contain raw provider text.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expandVisibilityPrompts, loadAiVisibilityEngine, prepareProviderObservationRuns } from '../lib/dashboard-backend/ai-visibility.mjs';
import { loadAiVisibilityPortfolio } from '../lib/dashboard-backend/ai-visibility-registry.mjs';

const CAPTURE_SCHEMA = 'fleet.ai-visibility-capture-template.v1';
const BUNDLE_SCHEMA = 'fleet.ai-visibility-provider-observations.v1';
const DEFAULT_CONFIG = resolve(import.meta.dirname, '../config/ai-visibility.json');

function usage() {
  console.log(`Route A capture kit for the frozen AI Visibility panel

Usage:
  ai-visibility-capture-kit.mjs template [--out <file>] [--panel <id>] [--config <file>]
  ai-visibility-capture-kit.mjs build    --input <capture.json> [--out <file>] [--allow-partial]
  ai-visibility-capture-kit.mjs validate --input <bundle.json> [--require-all]

Options:
  --panel <id>      Prompt set to capture (default: the configured baselinePanel)
  --config <file>   AI visibility config (default: config/ai-visibility.json)
  --run-id <id>     Bundle run id prefix (default: derived from the capture date)
  --allow-partial   Omit still-pending captures from the bundle instead of failing
  --require-all     Validate that every eligible project is covered

Reads no credential and performs no network request.`);
}

function parseArgs(argv) {
  const options = { allowPartial: false, requireAll: false, config: DEFAULT_CONFIG };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === '--allow-partial') { options.allowPartial = true; continue; }
    if (flag === '--require-all') { options.requireAll = true; continue; }
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}`);
    if (flag === '--out') options.out = value;
    else if (flag === '--input') options.input = value;
    else if (flag === '--panel') options.panel = value;
    else if (flag === '--config') options.config = resolve(value);
    else if (flag === '--run-id') options.runId = value;
    else throw new Error(`Unknown option: ${flag}`);
    index += 1;
  }
  return options;
}

function loadPanel(options) {
  const config = JSON.parse(readFileSync(options.config, 'utf8'));
  const panelId = options.panel ?? config.baselinePanel?.id;
  if (!panelId) throw new Error('No panel id given and config has no baselinePanel.id');
  const engines = config.baselinePanel?.engines;
  if (!Array.isArray(engines) || engines.length === 0) {
    throw new Error('config.baselinePanel.engines must list the frozen engine set');
  }
  const portfolio = loadAiVisibilityPortfolio({ configPath: options.config });
  const surfaces = portfolio.eligible
    .filter((project) => project.promptSets.some((set) => set.id === panelId))
    .map((project) => ({ project, ...expandVisibilityPrompts(project, panelId) }));
  if (surfaces.length === 0) throw new Error(`No configured project carries prompt set ${panelId}`);
  return { panelId, engines, surfaces, portfolio };
}

function commandTemplate(options) {
  const { panelId, engines, surfaces } = loadPanel(options);
  const captures = [];
  for (const { project, prompts } of surfaces) {
    for (const prompt of prompts) {
      for (const engine of engines) {
        captures.push({
          surface: project.slug,
          engine: engine.id,
          engineSurface: engine.surface ?? null,
          promptId: prompt.id,
          promptText: prompt.text,
          // Fill these three in. Leave status 'pending' for anything you skip.
          status: 'pending',
          capturedAt: null,
          responseText: null,
          // Optional: the share/permalink of the conversation, for provenance.
          providerRequestId: null,
        });
      }
    }
  }
  const template = {
    schema: CAPTURE_SCHEMA,
    promptSetId: panelId,
    engines,
    surfaceCount: surfaces.length,
    promptCount: surfaces.reduce((total, surface) => total + surface.prompts.length, 0),
    captureCount: captures.length,
    instructions: [
      'Run each promptText in the matching engine, in a fresh chat with no prior context.',
      "Paste the full answer into responseText, set status to 'completed', and set capturedAt to an ISO timestamp.",
      "Use status 'unavailable' if the engine refused or you skipped it, 'failed' if it errored.",
      'Do not reword promptText. The panel is frozen; rewording invalidates the month-over-month trend.',
      'Keep this file outside Git.',
    ],
    captures,
  };
  const json = `${JSON.stringify(template, null, 2)}\n`;
  if (options.out) {
    writeFileSync(resolve(options.out), json);
    console.error(`Wrote ${captures.length} capture slots (${template.promptCount} prompts x ${engines.length} engines) to ${options.out}`);
  } else {
    process.stdout.write(json);
  }
}

function commandBuild(options) {
  if (!options.input) throw new Error('build requires --input <capture.json>');
  const capture = JSON.parse(readFileSync(resolve(options.input), 'utf8'));
  if (capture.schema !== CAPTURE_SCHEMA) throw new Error(`Capture file must use ${CAPTURE_SCHEMA}`);
  const { panelId, engines, surfaces } = loadPanel({ ...options, panel: capture.promptSetId });

  const engineModels = new Map(engines.map((engine) => [engine.id, engine]));
  const bySurface = new Map();
  const pending = [];

  for (const [index, entry] of (capture.captures ?? []).entries()) {
    const label = `captures[${index}]`;
    if (!engineModels.has(entry.engine)) throw new Error(`${label} names unfrozen engine ${entry.engine}`);
    if (entry.status === 'pending') { pending.push(`${entry.surface}/${entry.engine}/${entry.promptId}`); continue; }

    const surface = bySurface.get(entry.surface) ?? new Map();
    const provider = surface.get(entry.engine) ?? {};
    if (entry.status === 'completed') {
      if (!entry.responseText || !String(entry.responseText).trim()) {
        throw new Error(`${label} is 'completed' but responseText is empty`);
      }
      if (!entry.capturedAt) throw new Error(`${label} is 'completed' but capturedAt is missing`);
      provider[entry.promptId] = {
        status: 'completed',
        capturedAt: entry.capturedAt,
        // A manual web-UI capture costs nothing metered; record that explicitly
        // rather than leaving the budget check to infer it.
        observedCostUsd: Number(entry.observedCostUsd ?? 0),
        providerRequestId: entry.providerRequestId || `manual:${entry.engine}:${entry.promptId}`,
        responseText: String(entry.responseText),
      };
    } else if (entry.status === 'unavailable' || entry.status === 'failed') {
      provider[entry.promptId] = {
        status: entry.status,
        capturedAt: entry.capturedAt ?? new Date().toISOString(),
      };
    } else {
      throw new Error(`${label} has unknown status ${entry.status}`);
    }
    surface.set(entry.engine, provider);
    bySurface.set(entry.surface, surface);
  }

  if (pending.length > 0 && !options.allowPartial) {
    // A pending capture is not an observation — the prompt was never run — so
    // --allow-partial omits it rather than asserting the engine was unavailable.
    throw new Error(`${pending.length} captures are still 'pending'. Fill them in, or pass --allow-partial to omit them from the bundle.\nFirst: ${pending.slice(0, 3).join(', ')}`);
  }

  const observedAt = capture.observedAt ?? new Date().toISOString();
  const runPrefix = options.runId ?? `route-a-${observedAt.slice(0, 10)}`;
  const runs = [...bySurface.entries()].map(([surfaceSlug, providers]) => {
    if (!surfaces.some((entry) => entry.project.slug === surfaceSlug)) {
      throw new Error(`Capture names surface ${surfaceSlug}, which does not carry prompt set ${panelId}`);
    }
    return {
      projectId: surfaceSlug,
      runId: `${runPrefix}:${surfaceSlug}`,
      observedAt,
      promptSetId: panelId,
      providers: [...providers.entries()].map(([engineId, observations]) => ({
        id: engineId,
        model: engineModels.get(engineId).model ?? engineModels.get(engineId).label ?? engineId,
        grounded: Boolean(engineModels.get(engineId).grounded),
        observations,
      })),
    };
  });

  const bundle = { schema: BUNDLE_SCHEMA, promptSetId: panelId, capturedBy: capture.capturedBy ?? null, runs };
  const json = `${JSON.stringify(bundle, null, 2)}\n`;
  if (options.out) {
    writeFileSync(resolve(options.out), json);
    console.error(`Wrote ${runs.length} runs to ${options.out}${pending.length ? ` (${pending.length} pending captures dropped)` : ''}`);
  } else {
    process.stdout.write(json);
  }
}

async function commandValidate(options) {
  if (!options.input) throw new Error('validate requires --input <bundle.json>');
  const bundle = JSON.parse(readFileSync(resolve(options.input), 'utf8'));
  const engine = await loadAiVisibilityEngine();
  const portfolio = loadAiVisibilityPortfolio({ configPath: options.config });
  // Same call the real ingest makes, minus the store write.
  const runs = prepareProviderObservationRuns({ bundle, portfolio, engine, requireAll: options.requireAll });
  console.log(JSON.stringify({
    schema: 'fleet.ai-visibility-capture-validation.v1',
    valid: true,
    runs: runs.map((run) => ({
      projectId: run.project.slug,
      promptSetId: run.promptSetId,
      providers: run.provenance.providerIds,
      observations: run.provenance.observationCount,
      completed: run.provenance.completedObservationCount,
      maxCalls: run.project.runBudget.maxCalls,
    })),
    coverage: { recorded: runs.length, canonical: portfolio.eligible.length },
  }, null, 2));
}

const [command, ...rest] = process.argv.slice(2);
if (!command || ['-h', '--help', 'help'].includes(command)) { usage(); process.exit(command ? 0 : 1); }

try {
  const options = parseArgs(rest);
  if (command === 'template') commandTemplate(options);
  else if (command === 'build') commandBuild(options);
  else if (command === 'validate') await commandValidate(options);
  else { usage(); process.exit(1); }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
