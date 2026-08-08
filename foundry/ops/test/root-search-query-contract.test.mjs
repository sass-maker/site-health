import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { validateRootBrandContract } from '../lib/root-brand-contract.mjs';
import {
  activeObservatoryQueries,
  mergeRootSearchQueriesIntoObservatory,
  ROOT_SEARCH_QUERY_KINDS,
  validateRootSearchQueryContract,
} from '../lib/root-search-query-contract.mjs';
import { searchConsoleProjects, visibilityProjects } from '../lib/visibility-projects.mjs';

const projects = JSON.parse(readFileSync(new URL('../config/projects.json', import.meta.url))).projects;
const brands = validateRootBrandContract(
  JSON.parse(readFileSync(new URL('../config/root-brands.json', import.meta.url))),
  projects,
);
const contract = JSON.parse(readFileSync(new URL('../config/root-search-queries.json', import.meta.url)));

test('covers the exact ten roots with one active query per required intent', () => {
  const roots = validateRootSearchQueryContract(contract, brands, projects);

  assert.equal(roots.size, 10);
  for (const root of roots.values()) {
    assert.deepEqual(root.activeQueries.map((query) => query.kind), ROOT_SEARCH_QUERY_KINDS);
    assert.equal(root.activeQueries.length, 4);
  }
});

test('Search Console covers every contracted root without expanding the public metric portfolio', () => {
  const catalog = { projects };
  const roots = validateRootSearchQueryContract(contract, brands, projects);
  const publicProjects = visibilityProjects(catalog);
  const searchProjects = searchConsoleProjects(catalog, roots);

  assert.equal(publicProjects.length, 28);
  assert.equal(searchProjects.length, 29);
  assert.equal(publicProjects.some((project) => project.id === 'ai-game'), false);
  for (const root of roots.values()) {
    const target = searchProjects.find((project) => project.id === root.projectId);
    assert.ok(target, `missing Search Console target for ${root.rootDomain}`);
    assert.equal(target.domains[0], root.rootDomain);
  }
});

test('rejects incomplete roots, duplicate active kinds, and broken history links', () => {
  const withoutOneRoot = structuredClone(contract);
  withoutOneRoot.roots.pop();
  assert.throws(
    () => validateRootSearchQueryContract(withoutOneRoot, brands, projects),
    /coverage mismatch/,
  );

  const duplicateKind = structuredClone(contract);
  duplicateKind.roots[0].queries[1].kind = 'brand';
  assert.throws(
    () => validateRootSearchQueryContract(duplicateKind, brands, projects),
    /duplicate active brand/,
  );

  const brokenHistory = structuredClone(contract);
  brokenHistory.roots[1].queries.at(-1).supersededBy = 'missing-query';
  assert.throws(
    () => validateRootSearchQueryContract(brokenHistory, brands, projects),
    /requires an active replacement/,
  );
});

test('merges active and historical root queries without rewriting existing text', () => {
  const roots = validateRootSearchQueryContract(contract, brands, projects);
  const merged = mergeRootSearchQueriesIntoObservatory({
    products: [{
      id: 'codevetter',
      origin: 'https://codevetter.com',
      queries: [{
        qid: 'codevetter-brand',
        kind: 'brand',
        q: 'CodeVetter',
      }],
    }],
  }, roots);
  const codevetter = merged.products.find((product) => product.id === 'codevetter');

  assert.equal(activeObservatoryQueries(codevetter).length, 4);
  assert.equal(codevetter.queries.find((query) => query.qid === 'codevetter-category').status, 'historical');
  assert.throws(
    () => mergeRootSearchQueriesIntoObservatory({
      products: [{
        id: 'codevetter',
        origin: 'https://codevetter.com',
        queries: [{ qid: 'codevetter-brand', kind: 'brand', q: 'Rewritten' }],
      }],
    }, roots),
    /text conflicts/,
  );
});
