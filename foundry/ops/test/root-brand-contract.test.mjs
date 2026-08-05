import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  rootBrandForUrl,
  validateRootBrandContract,
} from '../lib/root-brand-contract.mjs';
import { loadFounderProjects } from '../lib/founder-control/registry.mjs';

const contract = JSON.parse(
  readFileSync(new URL('../config/root-brands.json', import.meta.url), 'utf8'),
);

test('root brand contract covers the ten Domains roots exactly', () => {
  const brands = validateRootBrandContract(contract, loadFounderProjects());

  assert.equal(brands.size, 10);
  assert.deepEqual(brands.get('heypace.app'), {
    rootDomain: 'heypace.app',
    canonicalName: 'Pace',
    alternateNames: ['HeyPace', 'heypace.app'],
  });
  assert.deepEqual(brands.get('highsignal.app')?.alternateNames, [
    'HighSignal',
    'highsignal.app',
  ]);
  assert.deepEqual(brands.get('sassmaker.com')?.alternateNames, [
    'SassMaker',
    'sassmaker.com',
  ]);
});

test('root brand lookup consolidates subdomains without optional project ids', () => {
  const brands = validateRootBrandContract(contract, loadFounderProjects());

  assert.equal(rootBrandForUrl('https://docs.heypace.app/start', brands)?.canonicalName, 'Pace');
  assert.equal(rootBrandForUrl('https://papers.highsignal.app', brands)?.canonicalName, 'High Signal');
  assert.equal(rootBrandForUrl('https://sarthakagrawal.dev', brands)?.canonicalName, 'Sarthak Agrawal');
});

test('root brand contract rejects missing roots and duplicate aliases', () => {
  const missing = structuredClone(contract);
  missing.brands.pop();
  assert.throws(
    () => validateRootBrandContract(missing, loadFounderProjects()),
    /root brand coverage mismatch/,
  );

  const duplicate = structuredClone(contract);
  duplicate.brands[0].alternateNames.push('Aliveville');
  assert.throws(
    () => validateRootBrandContract(duplicate, loadFounderProjects()),
    /duplicate brand name/,
  );
});
