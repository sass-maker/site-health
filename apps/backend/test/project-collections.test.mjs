import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { validateRootBrandContract, validateRootBrandCollections } from '../lib/root-brand-contract.mjs';
import { loadDashboardProjects, loadProjectCollections } from '../lib/dashboard-backend/registry.mjs';
import { buildReadinessProjection } from '../lib/dashboard-backend/readiness.mjs';
import { groupProjectCollections } from '../../web/src/lib/project-directory.mjs';

const collection = { id: 'daddyrad', description: 'Native Mac utilities.', websiteUrl: 'https://daddyrad.com/', projectIds: ['storage', 'performance'] };
const brand = { rootDomain: 'daddyrad.com', canonicalName: 'DaddyRad', alternateNames: [], priority: 'P1', priorityDecision: { reason: 'Private owner decision.' }, collection };
const project = (id, priority = null) => ({ id, name: id, family: id, priority, domains: [`${id}.daddyrad.com`], public: { listing: 'maintained' }, lifecycle: { status: 'active', shareable: true }, portfolio: { status: 'active', priority } });
const projects = [project('storage'), project('performance', 'P2'), { ...project('other'), domains: [] }];
const contract = { version: 1, brands: [brand], growthPriority: { level: 'high' } };

test('root collections retain shared website priority without promoting or scoring another product', () => {
  const path = join(mkdtempSync(join(tmpdir(), 'project-collections-')), 'catalog.json');
  const retired = { id: 'daddyrad', name: 'DaddyRad', family: 'daddyrad', lifecycle: { status: 'inactive' }, portfolio: { status: 'archived', priority: 'P4' } };
  const input = { projects: structuredClone([...projects, retired]), systems: { rootBrands: structuredClone(contract) },
    publicDirectory: { projects: {
      storage: { publicDestinationUrl: 'https://daddyrad.com/storage/' },
      performance: { publicDestinationUrl: 'https://daddyrad.com/performance/' },
    } } };
  input.projects[0].public.hasChangelog = false;
  writeFileSync(path, JSON.stringify(input));
  const loaded = loadDashboardProjects(path);
  const collections = loadProjectCollections(path);
  assert.deepEqual(collections, [{ ...collection, name: 'DaddyRad', rootDomain: 'daddyrad.com', priority: 'P1', growthFocus: { level: 'high', domains: ['daddyrad.com'] } }]);
  assert.doesNotMatch(JSON.stringify(collections), /priorityDecision|Private owner/);
  assert.deepEqual(loaded.map(p => p.priority), [null, 'P2', null, 'P4']);
  assert.equal(loaded[0].growthFocus, null);
  assert.equal(loaded[0].websiteUrl, 'https://daddyrad.com/storage/');
  assert.equal(loaded[0].changelogUrl, null);
  assert.deepEqual(loaded[0].domains, ['storage.daddyrad.com']);
  assert.equal(loaded[1].changelogUrl, 'https://daddyrad.com/performance/changelog');
  const saved = Object.fromEntries(buildReadinessProjection({ projects: loaded }).projects.map(p => [p.id, {
    revision: 7, updatedAt: '2026-10-28T00:00:00.000Z', state: p.state,
  }]));
  saved.storage.state.nextLevers.product = 'Preserve the existing native acceptance evidence.';
  const before = buildReadinessProjection({ projects: loaded, readiness: saved });
  assert.deepEqual(before.projects.map(p => p.id), ['other', 'performance', 'storage']);
  assert.equal(before.projects.some(p => p.id === 'daddyrad'), false);
  input.systems.rootBrands.brands[0].priority = 'P0';
  writeFileSync(path, JSON.stringify(input));
  assert.deepEqual(buildReadinessProjection({ projects: loadDashboardProjects(path), readiness: saved, generatedAt: before.generatedAt }), before);
});

test('root collections reject unsafe websites, missing, archived and repeated members', () => {
  assert.deepEqual(validateRootBrandCollections(contract, projects).get('daddyrad.com').collection, collection);
  for (const invalid of [
    { websiteUrl: 'http://daddyrad.com/' }, { websiteUrl: 'https://other.example/' },
    { websiteUrl: 'https://user:pass@daddyrad.com/' }, { websiteUrl: 'https://daddyrad.com/?key=value' },
    { projectIds: ['storage'] }, { projectIds: ['storage', 'storage'] }, { projectIds: ['storage', 'missing'] },
    { projectIds: ['storage', 'retired'] }, { notes: 'Private data.' }, { id: '../daddyrad' },
  ]) {
    const input = structuredClone(contract);
    Object.assign(input.brands[0].collection, invalid);
    assert.throws(() => validateRootBrandCollections(input, [...projects, { id: 'retired', lifecycle: { status: 'inactive' } }]));
  }
  const invalidPriority = structuredClone(contract);
  invalidPriority.brands[0].priority = 'first';
  assert.throws(() => validateRootBrandCollections(invalidPriority, projects), /invalid root brand priority/);
  const overlapping = structuredClone(contract);
  overlapping.brands.push({ rootDomain: 'other.example', canonicalName: 'Other', alternateNames: [], collection: {
    ...collection, id: 'other', websiteUrl: 'https://other.example/', projectIds: ['storage', 'other'],
  } });
  assert.throws(() => validateRootBrandCollections(overlapping, projects.map(project => project.id === 'other' ? { ...project, domains: ['other.example'] } : project)), /duplicate root brand collection or member/);
});

test('family filtering counts each child once and keeps app priority independent of shared P1', () => {
  const family = { ...collection, name: 'DaddyRad', rootDomain: 'daddyrad.com', priority: 'P1' };
  const before = structuredClone(projects);
  const result = groupProjectCollections([...projects, projects[0]], [family]);
  assert.equal(result.total, 3);
  assert.equal(result.visible.length, 3);
  assert.deepEqual(result.collections[0].projects.map(p => p.id), collection.projectIds);
  assert.deepEqual(result.ungrouped.map(p => p.id), ['other']);
  assert.deepEqual(groupProjectCollections(projects, [family], { query: 'DaddyRad' }).visible.map(p => p.id), collection.projectIds);
  assert.deepEqual(groupProjectCollections(projects, [family], { query: 'performance' }).collections[0].projects.map(p => p.id), ['performance']);
  assert.equal(groupProjectCollections(projects, [family], { query: 'missing' }).collections.length, 0);
  assert.equal(groupProjectCollections(projects, [family], { priority: 'P1' }).visible.length, 0);
  assert.deepEqual(groupProjectCollections(projects, [family], { priority: 'P2' }).visible.map(p => p.id), ['performance']);
  assert.deepEqual(projects, before);
});

test('stale collection membership cannot disable the independent root-brand metric contract', () => {
  const paused = structuredClone(projects);
  paused[1].lifecycle.status = 'inactive';
  const brands = validateRootBrandContract(contract, paused);
  assert.equal(brands.get('daddyrad.com').canonicalName, 'DaddyRad');
  assert.equal(brands.get('daddyrad.com').collection, undefined);
  assert.throws(() => validateRootBrandCollections(contract, paused), /unique current project ids/);
  const malformed = structuredClone(contract);
  malformed.brands[0].priority = 'invalid';
  malformed.brands[0].collection.websiteUrl = 'invalid';
  assert.equal(validateRootBrandContract(malformed, projects).get('daddyrad.com').canonicalName, 'DaddyRad');
  assert.throws(() => validateRootBrandCollections(malformed, projects), /invalid root brand priority/);
});
