#!/usr/bin/env node

import { mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { refreshGithubActionsHealth } from '../apps/backend/lib/github-actions-health.mjs';
import { renderProjectActionsInventory } from '../apps/backend/lib/project-actions-inventory.mjs';
import {
  buildProjectDossier,
  parseOwnerNarratives,
  serializeProjectDossier,
  sha256,
  validateProjectDossierYaml,
} from '../apps/backend/lib/project-dossier-yaml.mjs';
import {
  parsePortfolioIntents,
  scanFleetRepositories,
  validateDossierInputs,
} from '../apps/backend/lib/project-dossiers.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = resolve(repositoryRoot, 'apps/backend/config/projects.json');
const operationsPath = resolve(repositoryRoot, 'apps/backend/config/project-operations.json');
const actionsPolicyPath = resolve(
  repositoryRoot,
  'apps/backend/config/project-actions-policy.json',
);
const intentPath = resolve(repositoryRoot, 'docs/portfolio-condensed-2026-08-23.md');
const ownerNarrativesPath = resolve(
  repositoryRoot,
  'docs/portfolio-owner-narratives-2026-08-22.md',
);
const outputDirectory = resolve(repositoryRoot, 'docs/project-dossiers');
const actionsInventoryPath = resolve(outputDirectory, 'README.md');
const args = new Set(process.argv.slice(2));
const fleetRootArgument = process.argv.find((argument) => argument.startsWith('--fleet-root='));
const fleetRoot = fleetRootArgument
  ? resolve(fleetRootArgument.slice('--fleet-root='.length))
  : resolve(repositoryRoot, '..');
const observedAtArgument = process.argv.find((argument) => argument.startsWith('--observed-at='));
const observedAt =
  observedAtArgument?.slice('--observed-at='.length) ?? new Date().toISOString().slice(0, 10);
const githubObservedAt = new Date().toISOString();
const staleDaysArgument = process.argv.find((argument) => argument.startsWith('--stale-days='));
const staleDays = Number(staleDaysArgument?.slice('--stale-days='.length) ?? 30);
const catalogSource = readFileSync(catalogPath, 'utf8');
const intentMarkdown = readFileSync(intentPath, 'utf8');
const ownerNarrativesMarkdown = readFileSync(ownerNarrativesPath, 'utf8');
const catalog = JSON.parse(catalogSource);
const actionsPolicies = JSON.parse(readFileSync(actionsPolicyPath, 'utf8'));
if (actionsPolicies.schemaVersion !== 1) throw new Error('unsupported Actions policy schema');
const canonicalProjectIds = new Set(catalog.projects.map((project) => project.id));
for (const [projectId, policy] of Object.entries(actionsPolicies.projects ?? {})) {
  if (!canonicalProjectIds.has(projectId)) {
    throw new Error(`Actions policy references non-canonical project: ${projectId}`);
  }
  if (!['active', 'ignored'].includes(policy.disposition)) {
    throw new Error(`invalid Actions disposition for ${projectId}`);
  }
}
const { intents, extras } = parsePortfolioIntents(intentMarkdown, catalog.projects);
const ownerSources = parseOwnerNarratives(ownerNarrativesMarkdown, catalog.projects);

let operations;
if (args.has('--refresh')) {
  operations = scanFleetRepositories(catalog.projects, { fleetRoot, observedAt });
} else {
  operations = JSON.parse(readFileSync(operationsPath, 'utf8'));
}
if (args.has('--refresh-github')) {
  operations = await refreshGithubActionsHealth(operations, {
    observedAt: githubObservedAt,
    staleDays,
    policies: actionsPolicies,
  });
}
if (args.has('--refresh') || args.has('--refresh-github')) {
  writeFileSync(operationsPath, `${JSON.stringify(operations, null, 2)}\n`);
}

validateDossierInputs({ catalog, operations, intents, extras });
const projectIds = catalog.projects.map((project) => project.id).sort();
const ownerIds = Object.keys(ownerSources.narratives).sort();
if (JSON.stringify(ownerIds) !== JSON.stringify(projectIds)) {
  const missing = projectIds.filter((projectId) => !ownerSources.narratives[projectId]);
  throw new Error(`verbatim owner narratives must cover every project; missing: ${missing.join(', ')}`);
}
if (ownerSources.unmapped.length > 0) {
  throw new Error(`unmapped owner narratives: ${ownerSources.unmapped.join(', ')}`);
}

const sourceFingerprints = {
  catalog: sha256(catalogSource),
  ownerNarratives: sha256(ownerNarrativesMarkdown),
  portfolioIntent: sha256(intentMarkdown),
};
const renderedById = new Map();
for (const project of catalog.projects) {
  const dossier = buildProjectDossier({
    catalog,
    operations,
    project,
    operation: operations.projects[project.id],
    intent: intents[project.id],
    ownerNarrative: ownerSources.narratives[project.id],
    relatedNarratives: ownerSources.related[project.id] ?? [],
    sourceFingerprints,
  });
  const rendered = serializeProjectDossier(dossier);
  validateProjectDossierYaml(rendered, project.id);
  renderedById.set(project.id, rendered);
}

mkdirSync(outputDirectory, { recursive: true });
const expectedFilenames = new Set(projectIds.map((projectId) => `${projectId}.yaml`));
const currentYamlFiles = readdirSync(outputDirectory).filter((file) => file.endsWith('.yaml'));
const actionsInventory = renderProjectActionsInventory(operations);

if (args.has('--check')) {
  const problems = [];
  for (const filename of currentYamlFiles) {
    if (!expectedFilenames.has(filename)) problems.push(`unexpected ${filename}`);
  }
  for (const [projectId, rendered] of renderedById) {
    const path = resolve(outputDirectory, `${projectId}.yaml`);
    let current = null;
    try {
      current = readFileSync(path, 'utf8');
      validateProjectDossierYaml(current, projectId);
    } catch (error) {
      problems.push(error instanceof Error ? error.message : `${projectId}: unreadable YAML`);
      continue;
    }
    if (current !== rendered) problems.push(`${projectId}.yaml is stale`);
  }
  try {
    if (readFileSync(actionsInventoryPath, 'utf8') !== actionsInventory) {
      problems.push('project-dossiers/README.md Actions inventory is stale');
    }
  } catch {
    problems.push('project-dossiers/README.md Actions inventory is missing');
  }
  if (problems.length > 0) {
    console.error(`Project dossier check failed:\n- ${problems.join('\n- ')}`);
    process.exitCode = 1;
  } else {
    console.log(`Verified ${renderedById.size} project YAML dossiers`);
  }
} else {
  for (const filename of currentYamlFiles) {
    if (expectedFilenames.has(filename)) continue;
    unlinkSync(resolve(outputDirectory, filename));
  }
  for (const [projectId, rendered] of renderedById) {
    writeFileSync(resolve(outputDirectory, `${projectId}.yaml`), rendered);
  }
  writeFileSync(actionsInventoryPath, actionsInventory);
  console.log(
    `Generated ${renderedById.size} verified project YAML dossiers; ` +
      `${ownerSources.retired.length} retired owner narratives remain in the verbatim archive`,
  );
}
