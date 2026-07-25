#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const checks = [
  ['reel-pipeline', 'foundry/services/reel-pipeline', 'npm', ['test']],
  [
    'content-factory',
    'foundry/services/content-factory',
    'node',
    ['--check', 'scripts/render-content-package.js'],
  ],
  ['drank', 'foundry/services/drank', 'pnpm', ['check']],
  ['feedback', 'foundry/packages/feedback', 'pnpm', ['check']],
  ['public-directory', 'foundry/apps/public-directory', 'npm', ['run', 'check']],
  ['mobile-cockpit', 'foundry/apps/mobile-cockpit', 'pnpm', ['check']],
  ['psi-swarm-cli', 'foundry/tools/psi-swarm', 'pnpm', ['build:cli']],
  ['psi-swarm-web', 'foundry/tools/psi-swarm', 'pnpm', ['build:web']],
  ['ops-console', 'foundry/apps/ops-console', 'npm', ['run', 'build']],
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
