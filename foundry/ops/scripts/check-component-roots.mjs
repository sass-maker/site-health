#!/usr/bin/env node

import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const components = [
  {
    id: 'reel-pipeline',
    root: 'foundry/services/reel-pipeline',
    required: ['package.json', 'PROJECT_STATUS.md', 'reel/Cargo.toml'],
    nativeCheck: 'npm test',
  },
  {
    id: 'content-factory',
    root: 'foundry/services/content-factory',
    required: ['package.json', 'README.md', 'scripts/render-pro.js'],
    nativeCheck: 'npm run render:package -- --file <brief.json>',
  },
  {
    id: 'drank',
    root: 'foundry/services/drank',
    required: ['package.json', 'PROJECT_STATUS.md', 'pnpm-lock.yaml'],
    nativeCheck: 'pnpm check',
  },
  {
    id: 'feedback',
    root: 'foundry/packages/feedback',
    required: ['package.json', 'README.md', 'pnpm-lock.yaml'],
    nativeCheck: 'pnpm check',
  },
  {
    id: 'ai-visibility',
    root: 'foundry/packages/ai-visibility',
    required: ['package.json', 'README.md', 'pnpm-lock.yaml'],
    nativeCheck: 'pnpm check',
  },
  {
    id: 'public-directory',
    root: 'foundry/apps/public-directory',
    required: ['package.json', 'PRODUCT.md', 'DESIGN.md', 'package-lock.json'],
    nativeCheck: 'npm run check',
  },
  {
    id: 'mobile-cockpit',
    root: 'foundry/apps/mobile-cockpit',
    required: ['package.json', 'PROJECT_STATUS.md', 'pnpm-lock.yaml'],
    nativeCheck: 'pnpm check',
  },
  {
    id: 'psi-swarm',
    root: 'foundry/tools/psi-swarm',
    required: ['package.json', 'PROJECT_STATUS.md', 'pnpm-lock.yaml'],
    nativeCheck: 'pnpm build:cli && pnpm build:web',
  },
];

for (const component of components) {
  for (const requiredPath of component.required) {
    await access(path.join(root, component.root, requiredPath));
  }

  const packageJson = JSON.parse(
    await readFile(path.join(root, component.root, 'package.json'), 'utf8')
  );
  if (!packageJson.name) {
    throw new Error(`${component.id}: package.json must define a name`);
  }
}

console.log(`Component roots valid (${components.length})`);
for (const component of components) {
  console.log(`- ${component.id}: ${component.root} [${component.nativeCheck}]`);
}
