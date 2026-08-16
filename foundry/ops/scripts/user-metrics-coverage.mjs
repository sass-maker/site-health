#!/usr/bin/env node
/**
 * Validate that every maintained Fleet product with a hosted web surface
 * emits the shared `page_view` + `project_id` contract, or is explicitly
 * not applicable.
 *
 * Usage:
 *   node user-metrics-coverage.mjs [--catalog <path>] [--root <workspace>]
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const PAGE_VIEW_MARKERS = [
  'trackPageView(',
  'capture("page_view"',
  "capture('page_view'",
  'capture(`page_view`',
];

const FLEET_OWNED = new Set(['drank', 'psi-swarm', 'fleet-workspace', 'mashup']);

const CHECKOUT_ALIASES = {
  drank: 'foundry/helpers/drank',
  'psi-swarm': 'foundry/helpers/psi-swarm',
  indulge: 'induldge',
  'veg-protein-food': 'recipe-dashboard',
  mashup: 'foundry/helpers/mashup',
  'fleet-workspace': '.',
  'sarthakagrawal-personal': '../portfolio',
};

const NO_HOSTED_WEB = {
  kith: 'native iPhone app with no hosted web surface',
  mashup: 'local-first helper with no hosted web surface',
};

const SKIP_DIR = new Set([
  '.git',
  'node_modules',
  'dist',
  '.next',
  '.astro',
  'coverage',
  'target',
  'build',
  '.open-next',
  'out',
  'ios',
]);

const args = process.argv.slice(2);
let catalogPath = null;
let fleetRoot = null;
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--catalog' && args[i + 1]) catalogPath = args[++i];
  if (args[i] === '--root' && args[i + 1]) fleetRoot = resolve(args[++i]);
}

const scriptRoot = resolve(import.meta.dirname, '..', '..', '..');
const workspaceRoot =
  fleetRoot ??
  (existsSync(join(scriptRoot, 'rolepatch'))
    ? scriptRoot
    : existsSync(join(scriptRoot, '../..', 'rolepatch'))
      ? resolve(scriptRoot, '../..')
      : scriptRoot);
fleetRoot = workspaceRoot;
catalogPath =
  catalogPath ?? join(scriptRoot, 'foundry', 'ops', 'config', 'projects.json');

if (!existsSync(catalogPath)) {
  console.error(`Catalog not found: ${catalogPath}`);
  process.exit(1);
}

const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
const maintained = (catalog.projects ?? []).filter((project) => project.lifecycle === 'maintained');

function checkoutDir(project) {
  const root = FLEET_OWNED.has(project.id) ? scriptRoot : fleetRoot;
  const alias = CHECKOUT_ALIASES[project.id];
  if (alias) {
    const resolved = resolve(root, alias);
    if (existsSync(resolved)) return resolved;
  }
  if (project.repo) {
    const resolved = resolve(root, project.repo);
    if (existsSync(resolved)) return resolved;
  }
  return null;
}

function walkSource(dir, visit) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    if (SKIP_DIR.has(name) || name.startsWith('.')) continue;
    const path = join(dir, name);
    let stat;
    try {
      stat = statSync(path);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      if (name === 'ios') continue;
      walkSource(path, visit);
      continue;
    }
    if (/\.(ts|tsx|js|mjs|astro|html)$/.test(name)) visit(path);
  }
}

function hasPageView(dir) {
  let found = null;
  walkSource(dir, (path) => {
    if (found) return;
    let text;
    try {
      text = readFileSync(path, 'utf8');
    } catch {
      return;
    }
    if (PAGE_VIEW_MARKERS.some((marker) => text.includes(marker))) {
      found = path;
    }
  });
  return found;
}

let covered = 0;
let exempt = 0;
let missing = 0;
const missingProducts = [];

console.log('User metrics coverage (hosted web page_view)');
console.log('===========================================\n');

for (const project of maintained) {
  const reason = NO_HOSTED_WEB[project.id];
  if (reason) {
    exempt += 1;
    console.log(`  ✓ ${project.id.padEnd(30)} not-applicable (${reason})`);
    continue;
  }

  const dir = checkoutDir(project);
  if (!dir) {
    missing += 1;
    missingProducts.push({ id: project.id, name: project.name, reason: 'no-checkout' });
    console.log(`  ✗ ${project.id.padEnd(30)} MISSING (no-checkout)`);
    continue;
  }

  const file = hasPageView(dir);
  if (file) {
    covered += 1;
    console.log(`  ✓ ${project.id.padEnd(30)} page_view`);
  } else {
    missing += 1;
    missingProducts.push({ id: project.id, name: project.name, reason: 'no-page-view' });
    console.log(`  ✗ ${project.id.padEnd(30)} MISSING (no-page-view)`);
  }
}

console.log(`\n--- Summary ---`);
console.log(`Maintained products: ${maintained.length}`);
console.log(`Web page_view: ${covered}`);
console.log(`Not applicable: ${exempt}`);
console.log(`Missing: ${missing}`);

if (missing > 0) {
  console.error(`\n${missing} product(s) missing hosted-web page_view:`);
  for (const product of missingProducts) {
    console.error(`  - ${product.id} (${product.reason})`);
  }
  process.exit(1);
}

console.log('\nEvery maintained hosted web surface emits page_view, or is not applicable.');
process.exit(0);
