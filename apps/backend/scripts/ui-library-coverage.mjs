#!/usr/bin/env node
import { readFileSync, mkdirSync, writeFileSync, renameSync, chmodSync } from 'node:fs';
import { resolve, dirname, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { defaultUiCoveragePath, uiLibraryCoverage } from '../lib/dashboard-backend/ui-library-coverage.mjs';
import { currentProjects } from '../lib/dashboard-backend/readiness-model.mjs';

const args = process.argv.slice(2); const option = key => { const i = args.indexOf(key); return i < 0 ? null : args[i + 1]; };
if (args.some((a, i) => i % 2 === 0 && !['--fleet-root', '--collector', '--catalog', '--output'].includes(a)) || args.length % 2) throw Error('Usage: ui-library-coverage.mjs [--fleet-root path] [--catalog path] [--collector path] [--output private.json]');
const fleetRoot = resolve(option('--fleet-root') ?? resolve(import.meta.dirname, '../../../..'));
const catalogPath = resolve(option('--catalog') ?? resolve(fleetRoot, 'site-health/catalog/projects.json'));
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
const current = currentProjects(catalog.projects);
const manifest = { schemaVersion: 1, projects: current.map(p => {
  const path = p.repositories?.localPath; if (typeof path !== 'string' || path.startsWith('/') || path.split('/').includes('..')) throw Error(`Invalid source path for ${p.id}`);
  const scope = p.repositories?.sourcePath;
  const nested = scope?.startsWith(`${path}/`) ? scope.slice(path.length + 1) : '';
  const excludePrefixes = current.filter(other => other.id !== p.id && other.repositories?.localPath === path && other.repositories?.sourcePath?.startsWith(`${path}/`)).map(other => other.repositories.sourcePath.slice(path.length + 1));
  return { id: p.id, root: resolve(fleetRoot, path), prefix: nested, excludePrefixes };
}) };
// Dirty primary checkouts may predate the collector. Read its committed source
// without checking out, overwriting or retaining another full build workspace.
let collectorModule;
let collectorRevision = null;
if (option('--collector')) collectorModule = pathToFileURL(resolve(option('--collector'))).href;
else {
  const repo = resolve(fleetRoot, 'saas-maker');
  const git = args => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 15_000, maxBuffer: 1024 * 1024 }).trimEnd();
  collectorRevision = git(['rev-parse', 'origin/main']);
  const source = git(['show', `${collectorRevision}:tooling/scripts/ui-library-coverage.mjs`]);
  collectorModule = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
}
const { collectCoverage } = await import(collectorModule);
const snapshot = collectCoverage(manifest);
snapshot.collectorRevision = collectorRevision;
for (const project of current) {
  const row = snapshot.records[project.id], source = project.repositories?.sourcePath, local = project.repositories?.localPath;
  if (source && source !== local && !source.startsWith(`${local}/`)) row.gap += ' A separately owned/shared landing source is outside this checkout scan; no whole-product coverage claim.';
  if (!uiLibraryCoverage(snapshot, project.id)) throw Error(`Invalid coverage output for ${project.id}`);
}
const output = resolve(option('--output') ?? defaultUiCoveragePath());
const productRoots = [...new Set(['site-health', 'saas-maker', ...current.map(p => p.repositories.localPath)])];
if (productRoots.some(path => { const rel = relative(resolve(fleetRoot, path), output); return !isAbsolute(rel) && rel !== '..' && !rel.startsWith('../'); })) throw Error('Keep private coverage outside product repositories');
snapshot.evidencePath = output; mkdirSync(dirname(output), { recursive: true, mode: 0o700 });
writeFileSync(`${output}.tmp`, JSON.stringify(snapshot, null, 2) + '\n', { mode: 0o600 }); chmodSync(`${output}.tmp`, 0o600); renameSync(`${output}.tmp`, output);
console.log(JSON.stringify({ output, projects: current.length, estimated: Object.values(snapshot.records).filter(r => r.percent !== null).length, assessed: Object.values(snapshot.records).filter(r => ['source-estimate', 'no-eligible-controls'].includes(r.status)).length, method: snapshot.method }));
