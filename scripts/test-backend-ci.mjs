#!/usr/bin/env node

import { readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const testDirectory = resolve(repositoryRoot, 'apps/backend/test');
const catalogDependentTests = new Set([
  'catalog-boundary.test.mjs',
  'dashboard-ai-visibility.test.mjs',
  'dashboard-connections.test.mjs',
  'domain-scope.test.mjs',
  'project-directory.test.mjs',
  'project-dossiers.test.mjs',
  'root-brand-contract.test.mjs',
  'root-search-query-contract.test.mjs',
]);
const tests = readdirSync(testDirectory)
  .filter((filename) => filename.endsWith('.test.mjs'))
  .filter((filename) => !catalogDependentTests.has(filename))
  .map((filename) => resolve(testDirectory, filename));

const result = spawnSync(
  process.execPath,
  ['--disable-warning=ExperimentalWarning', '--test', ...tests],
  { stdio: 'inherit' },
);
if (result.error) throw result.error;
process.exit(result.status ?? 1);
