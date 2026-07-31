import assert from 'node:assert/strict';
import test from 'node:test';

import { configuredTargets } from '../../helpers/drank/scripts/update-global-dr.mjs';
import { domainStrengthRoots } from '../lib/founder-control/domain-scope.mjs';
import { loadFounderProjects } from '../lib/founder-control/registry.mjs';

test('derives the ten Domains-page roots from the canonical project registry', () => {
  assert.deepEqual(domainStrengthRoots(loadFounderProjects()), [
    'aliveville.com',
    'codevetter.com',
    'heypace.app',
    'highsignal.app',
    'karte.cc',
    'posttrainllm.com',
    'rolepatch.com',
    'sarthakagrawal.dev',
    'sassmaker.com',
    'significanthobbies.com',
  ]);
});

test('explicit targets replace the project-host seed list and remain unique', () => {
  assert.deepEqual(
    configuredTargets(['one.example.com'], ['example.com', 'example.com']),
    ['example.com'],
  );
});
