#!/usr/bin/env node
/**
 * Validate that every maintained Fleet product with a hosted web surface
 * emits the shared `page_view` contract, or is explicitly not applicable.
 *
 * Usage:
 *   node user-metrics-coverage.mjs [--catalog <path>] [--root <workspace>]
 */

import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

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

const args = process.argv.slice(2);
let catalogPath = null;
let fleetRoot = null;
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--catalog' && args[i + 1]) catalogPath = args[++i];
  if (args[i] === '--root' && args[i + 1]) fleetRoot = resolve(args[++i]);
}

const scriptRoot = resolve(import.meta.dirname, '..', '..', '..');
if (!fleetRoot) {
  fleetRoot = existsSync(join(scriptRoot, 'rolepatch'))
    ? scriptRoot
    : resolve(scriptRoot, '../..');
}
catalogPath = catalogPath ?? join(scriptRoot, 'foundry', 'ops', 'config', 'projects.json');

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

function hasPageView(dir) {
  try {
    const output = execFileSync(
      'grep',
      [
        '-rl',
        '--exclude-dir=node_modules',
        '--exclude-dir=dist',
        '--exclude-dir=.next',
        '--exclude-dir=.git',
        '--exclude-dir=ios',
        '--include=*.ts',
        '--include=*.tsx',
        '--include=*.js',
        '--include=*.mjs',
        '--include=*.astro',
        '--include=*.html',
        '-E',
        'trackPageView\\(|capture\\([\'"]page_view|event: [\'"]page_view',
        dir,
      ],
      { encoding: 'utf8', timeout: 10_000 },
    );
    return output
      .split('\n')
      .find((line) => line && !line.includes('node_modules') && !line.includes('/dist/') && !line.includes('/ios/'));
  } catch {
    return null;
  }
}

let covered = 0;
let exempt = 0;
let missing = 0;
const missingProducts = [];

console.log('User metrics coverage (hosted web page_view)\n');

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
    missingProducts.push(project.id);
    console.log(`  ✗ ${project.id.padEnd(30)} MISSING (no-checkout)`);
    continue;
  }

  if (hasPageView(dir)) {
    covered += 1;
    console.log(`  ✓ ${project.id.padEnd(30)} page_view`);
  } else {
    missing += 1;
    missingProducts.push(project.id);
    console.log(`  ✗ ${project.id.padEnd(30)} MISSING (no-page-view)`);
  }
}

console.log(`\nMaintained ${maintained.length} · page_view ${covered} · n/a ${exempt} · missing ${missing}`);
if (missing > 0) {
  console.error(`Missing: ${missingProducts.join(', ')}`);
  process.exit(1);
}
process.exit(0);
