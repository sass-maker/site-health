#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const retiredPaths = [
  'fleet-ops/scripts/agent-bin/fnd',
  'fleet-ops/scripts/agent-bin/marketing-control-loop',
  'fleet-ops/scripts/agent-bin/marketing-control-service',
  'fleet-ops/services/reel-pipeline/src/saas-maker-client.js',
  'fleet-ops/services/reel-pipeline/src/autopilot.js',
  'fleet-ops/services/reel-pipeline/src/posting.js',
  'fleet-ops/services/reel-pipeline/reel/src/saas_maker.rs',
  'fleet-ops/services/reel-pipeline/reel/src/autopilot.rs',
  'fleet-ops/services/reel-pipeline/reel/src/marketing_posting.rs',
];
const runtimeRoots = [
  'fleet-ops/apps/ops-console/src',
  'fleet-ops/scripts/agent-bin',
  'fleet-ops/services/reel-pipeline/src',
  'fleet-ops/services/reel-pipeline/scripts',
  'fleet-ops/services/reel-pipeline/reel/src',
];
const forbidden = [
  'SAASMAKER_SESSION_TOKEN',
  'SaaSMakerClient',
  '/api/marketing/posts',
  'marketing-control-service',
  'npm run post:ready',
  'npm run render:accepted',
];
const failures = [];

for (const path of retiredPaths) {
  if (existsSync(resolve(root, path))) failures.push(`retired path exists: ${path}`);
}
for (const directory of runtimeRoots) {
  for (const file of files(resolve(root, directory))) {
    const text = readFileSync(file, 'utf8');
    for (const token of forbidden) {
      if (text.includes(token)) failures.push(`retired token ${JSON.stringify(token)} in ${relative(root, file)}`);
    }
  }
}

if (failures.length) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}
console.log('retired marketing boundaries: clean');

function files(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return files(path);
    if (!statSync(path).isFile() || !/\.(?:js|mjs|ts|tsx|astro|rs|sh)$/u.test(entry.name)) return [];
    return [path];
  });
}
