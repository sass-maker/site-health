#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const checks = [
  ['reel-pipeline', 'fleet-ops/services/reel-pipeline', 'npm', ['test']],
  [
    'content-factory',
    'fleet-ops/services/content-factory',
    'node',
    ['--check', 'scripts/render-content-package.js'],
  ],
  ['drank', 'fleet-ops/services/drank', 'pnpm', ['check']],
  ['feedback', 'fleet-ops/packages/feedback', 'pnpm', ['check']],
  ['mobile-cockpit', 'fleet-ops/apps/mobile-cockpit', 'pnpm', ['check']],
  ['psi-swarm-cli', 'fleet-ops/psi-swarm', 'pnpm', ['build:cli']],
  ['psi-swarm-web', 'fleet-ops/psi-swarm', 'pnpm', ['build:web']],
];

for (const [id, relativeRoot, command, args] of checks) {
  console.log(`\n== ${id}: ${command} ${args.join(' ')} ==`);
  const result = spawnSync(command, args, {
    cwd: path.join(root, relativeRoot),
    env: process.env,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
