import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  rootBrandForUrl,
  validateRootBrandContract,
} from '../lib/root-brand-contract.mjs';
import { domainStrengthRoots } from '../lib/dashboard-backend/domain-scope.mjs';
import { loadDashboardProjects } from '../lib/dashboard-backend/registry.mjs';

const contract = JSON.parse(
  readFileSync(new URL('../config/root-brands.json', import.meta.url), 'utf8'),
);

test('root brand contract covers the domain strength roots exactly', () => {
  const brands = validateRootBrandContract(contract, loadDashboardProjects());

  assert.deepEqual([...brands.keys()].sort(), domainStrengthRoots(loadDashboardProjects()));
  assert.deepEqual(brands.get('karte.cc'), {
    rootDomain: 'karte.cc',
    canonicalName: 'Karte',
    alternateNames: ['Karte.cc'],
  });
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
  const brands = validateRootBrandContract(contract, loadDashboardProjects());

  assert.equal(rootBrandForUrl('https://docs.heypace.app/start', brands)?.canonicalName, 'Pace');
  assert.equal(rootBrandForUrl('https://papers.highsignal.app', brands)?.canonicalName, 'High Signal');
  assert.equal(rootBrandForUrl('https://codevetter.com', brands)?.canonicalName, 'CodeVetter');
});

test('root brand contract rejects missing roots and duplicate aliases', () => {
  const missing = structuredClone(contract);
  missing.brands.pop();
  assert.throws(
    () => validateRootBrandContract(missing, loadDashboardProjects()),
    /root brand coverage mismatch/,
  );

  const duplicate = structuredClone(contract);
  duplicate.brands[0].alternateNames.push('CodeVetter');
  assert.throws(
    () => validateRootBrandContract(duplicate, loadDashboardProjects()),
    /duplicate brand name/,
  );
});
