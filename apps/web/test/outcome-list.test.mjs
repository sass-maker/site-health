import test from 'node:test';
import assert from 'node:assert/strict';
import { filterOutcomeRows, outcomeTitle } from '../src/lib/outcome-list.mjs';
const rows = [
  { name: 'Unknown', domain: 'unknown.example', psi: null, lcp: { value: '' } },
  { name: 'Zero', domain: 'zero.example', psi: { value: 0 }, lcp: { value: 100 } },
  { name: 'High', domain: 'high.example', psi: { value: 90 }, lcp: { value: 3000 } },
  { name: 'Mid', domain: 'mid.example', psi: { value: 50 }, lcp: { value: 500 } },
];
test('orders raw metrics in both directions, keeping real zero and unknown last', () => {
  assert.deepEqual(filterOutcomeRows(rows, '', 'psi-low').map(x => x.name), ['Zero', 'Mid', 'High', 'Unknown']);
  assert.deepEqual(filterOutcomeRows(rows, '', 'psi-high').map(x => x.name), ['High', 'Mid', 'Zero', 'Unknown']);
  assert.deepEqual(filterOutcomeRows(rows, '', 'lcp-slow').map(x => x.name), ['High', 'Mid', 'Zero', 'Unknown']);
  assert.equal(rows[0].name, 'Unknown');
});
test('finds names, domains and shared-domain products case-insensitively', () => {
  assert.deepEqual(filterOutcomeRows(rows, ' HIGH.EXAMPLE ').map(x => x.name), ['High']);
  const domain = { domain: 'shared.example', projects: [{ name: 'Useful Product' }] };
  assert.equal(outcomeTitle(domain), 'shared.example');
  assert.equal(filterOutcomeRows([domain], 'useful').length, 1);
  assert.equal(filterOutcomeRows(rows, 'absent').length, 0);
});
