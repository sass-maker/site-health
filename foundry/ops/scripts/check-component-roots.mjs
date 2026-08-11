#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { access, lstat, readFile, readlink } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const retiredRoots = [
  ['foundry/apps/internal', 'drank'].join('/'),
  ['foundry/apps/internal', 'psi-swarm'].join('/'),
  ['foundry/packages', 'ai-visibility'].join('/'),
  ['foundry/apps/public', 'mobile-cockpit'].join('/'),
];
const historicalReferencePrefixes = [
  'foundry/openspec/',
  'foundry/ops/docs/fleet-perf-scoreboard-',
];
const historicalReferenceFiles = new Set([
  'foundry/ops/docs/public-product-smoke-latest.json',
]);
const components = [
  {
    id: 'reel-pipeline',
    root: 'foundry/marketing/reel-pipeline',
    required: ['package.json', 'PROJECT_STATUS.md', 'reel/Cargo.toml'],
    nativeCheck: 'npm test',
  },
  {
    id: 'content-factory',
    root: 'foundry/marketing/content-factory',
    required: ['package.json', 'README.md', 'scripts/render-pro.js'],
    nativeCheck: 'npm run render:package -- --file <brief.json>',
  },
  {
    id: 'drank',
    root: 'foundry/helpers/drank',
    required: ['package.json', 'PROJECT_STATUS.md', 'pnpm-lock.yaml'],
    nativeCheck: 'pnpm check',
  },
  {
    id: 'chatgpt-connections',
    root: 'foundry/helpers/chatgpt-connections',
    required: ['package.json', 'PROJECT_STATUS.md', 'pnpm-lock.yaml', 'wrangler.jsonc'],
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
    root: 'foundry/helpers/ai-visibility',
    required: ['package.json', 'README.md', 'pnpm-lock.yaml'],
    nativeCheck: 'pnpm check',
  },
  {
    id: 'public-directory',
    root: 'foundry/apps/public/public-directory',
    required: ['package.json', 'PRODUCT.md', 'DESIGN.md', 'pnpm-lock.yaml'],
    nativeCheck: 'pnpm run check',
  },
  {
    id: 'mobile-cockpit',
    root: 'foundry/apps/dashboard/mobile-cockpit',
    required: ['package.json', 'PROJECT_STATUS.md', 'pnpm-lock.yaml'],
    nativeCheck: 'pnpm check',
  },
  {
    id: 'psi-swarm',
    root: 'foundry/helpers/psi-swarm',
    required: ['package.json', 'PROJECT_STATUS.md', 'pnpm-lock.yaml'],
    nativeCheck: 'pnpm build:cli && pnpm build:web',
  },
  {
    id: 'fleet-console',
    root: 'foundry/apps/dashboard/fleet-console',
    required: ['package.json', 'PRODUCT.md', 'DESIGN.md', 'pnpm-lock.yaml'],
    nativeCheck: 'pnpm run build',
  },
  {
    id: 'fleetworkspace-runtime',
    root: 'foundry/apps/internal/fleetworkspace-runtime',
    required: ['package.json', 'PROJECT.md', 'pnpm-lock.yaml'],
    nativeCheck: 'pnpm check',
  },
];

for (const retiredRoot of retiredRoots) {
  try {
    await access(path.join(root, retiredRoot));
    throw new Error(`Retired component root still exists: ${retiredRoot}`);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') continue;
    throw error;
  }
}

const trackedFiles = execFileSync('git', ['ls-files', '-z'], {
  cwd: root,
  encoding: 'utf8',
}).split('\0').filter(Boolean);
const staleReferences = [];

for (const relativePath of trackedFiles) {
  if (
    historicalReferenceFiles.has(relativePath) ||
    historicalReferencePrefixes.some((prefix) => relativePath.startsWith(prefix))
  ) {
    continue;
  }

  const absolutePath = path.join(root, relativePath);
  const stats = await lstat(absolutePath);
  if (!stats.isFile() && !stats.isSymbolicLink()) continue;
  const content = stats.isSymbolicLink()
    ? await readlink(absolutePath)
    : await readFile(absolutePath, 'utf8');

  for (const retiredRoot of retiredRoots) {
    if (content.includes(retiredRoot)) {
      staleReferences.push(`${relativePath}: ${retiredRoot}`);
    }
  }
}

if (staleReferences.length > 0) {
  throw new Error(`Stale active component paths:\n- ${staleReferences.join('\n- ')}`);
}

const psiSkillLink = path.join(root, 'foundry/ops/skills/psi-swarm/SKILL.md');
const psiSkillTarget = await readlink(psiSkillLink);
if (psiSkillTarget !== '../../../helpers/psi-swarm/SKILL.md') {
  throw new Error(`PSI Swarm skill must point to its helper-owned contract; got ${psiSkillTarget}`);
}

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
