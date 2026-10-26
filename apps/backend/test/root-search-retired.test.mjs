import assert from 'node:assert/strict';
import test from 'node:test';
import { validateRootSearchQueryContract } from '../lib/root-search-query-contract.mjs';
import { searchConsoleProjects } from '../lib/visibility-projects.mjs';

const project = { id: 'retired', domains: [], lifecycle: { status: 'inactive' } };
const brands = new Map([['retired.example', {}]]);
const contract = { version: 1, cadence: 'weekly', roots: [{
  rootDomain: 'retired.example', projectId: 'retired',
  collision: { state: 'clear', note: 'Historical identity with no current domain ownership.' },
  queries: ['brand', 'exact-domain', 'category', 'problem'].map((kind) => ({
    id: `retired-${kind}`, kind, text: `retired ${kind}`, status: 'active',
  })),
}] };

test('retired root remains inspectable without blocking current collection', () => {
  const roots = validateRootSearchQueryContract(contract, brands, [project]);
  assert.equal(roots.get('retired.example').activeQueries.length, 4);
  assert.deepEqual(searchConsoleProjects({ projects: [project] }, roots), []);
});
test('active, unknown and malformed ownership contracts still fail closed', () => {
  for (const lifecycle of [{ status: 'active' }, { status: 'primary' }, undefined]) {
    assert.throws(() => validateRootSearchQueryContract(contract, brands, [{ ...project, lifecycle }]), /domain mismatch/);
  }
  assert.throws(() => validateRootSearchQueryContract(contract, brands, [{ id: 'different' }]), /unknown root search project/);
  const malformed = structuredClone(contract);
  malformed.roots[0].queries[0].kind = 'invalid';
  assert.throws(() => validateRootSearchQueryContract(malformed, brands, [project]), /invalid root search query/);
});
