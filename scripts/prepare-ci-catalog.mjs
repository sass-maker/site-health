#!/usr/bin/env node

import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dossierDirectory = resolve(repositoryRoot, 'docs/project-dossiers');
const operationsPath = resolve(
  repositoryRoot,
  'catalog/generated/operations.json',
);

// A local owner checkout may link to the canonical private dataset. Fixtures
// belong only in a checkout without that data, never through a live symlink.
if (existsSync(resolve(repositoryRoot, 'catalog/projects.json')) ||
    (existsSync(operationsPath) && lstatSync(operationsPath).isSymbolicLink())) {
  throw new Error('Refusing to replace owner catalog data with a CI fixture');
}

const projects = readdirSync(dossierDirectory)
  .filter((filename) => filename.endsWith('.yaml'))
  .sort()
  .map((filename) => parse(readFileSync(resolve(dossierDirectory, filename), 'utf8')))
  .filter((dossier) => dossier?.projectId)
  .map((dossier) => {
    const identity = dossier.identity ?? {};
    return {
      id: dossier.projectId,
      name: identity.name ?? dossier.projectId,
      status: dossier.operationalStatus ?? 'unverified',
    };
  });

if (projects.length === 0) throw new Error('CI catalog fixture has no dossier projects');

mkdirSync(dirname(operationsPath), { recursive: true });
writeFileSync(operationsPath, `${JSON.stringify({ projects }, null, 2)}\n`);
console.log(`Prepared CI catalog fixture for ${projects.length} dossier projects`);
