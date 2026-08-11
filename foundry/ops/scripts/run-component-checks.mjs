#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const checks = [
  ['reel-pipeline', 'foundry/marketing/reel-pipeline', 'npm', ['test']],
  [
    'content-factory',
    'foundry/marketing/content-factory',
    'node',
    ['--check', 'scripts/render-content-package.js'],
  ],
  ['drank', 'foundry/helpers/drank', 'pnpm', ['check']],
  ['chatgpt-connections', 'foundry/helpers/chatgpt-connections', 'pnpm', ['check']],
  ['feedback', 'foundry/packages/feedback', 'pnpm', ['check']],
  ['ai-visibility', 'foundry/helpers/ai-visibility', 'pnpm', ['check']],
  ['public-directory', 'foundry/apps/public/public-directory', 'npm', ['run', 'check']],
  ['mobile-cockpit', 'foundry/apps/dashboard/mobile-cockpit', 'pnpm', ['check']],
  ['psi-swarm-cli', 'foundry/helpers/psi-swarm', 'pnpm', ['build:cli']],
  ['psi-swarm-web', 'foundry/helpers/psi-swarm', 'pnpm', ['build:web']],
  ['fleet-console', 'foundry/apps/dashboard/fleet-console', 'npm', ['run', 'build']],
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
