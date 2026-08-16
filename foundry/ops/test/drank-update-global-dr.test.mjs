import assert from 'node:assert/strict';
import test from 'node:test';

import { configuredTargets } from '../../helpers/drank/scripts/update-global-dr.mjs';
import {
  domainStrengthRoots,
  publicMetricTargets,
} from '../lib/founder-control/domain-scope.mjs';
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

test('derives all 32 Performance targets from the same canonical registry', () => {
  const targets = publicMetricTargets(loadFounderProjects());
  assert.equal(targets.length, 32);
  assert.equal(targets.some((target) => target.projectId === 'ai-game'), false);
  assert.equal(targets.some((target) => target.projectId === 'fleet-workspace'), true);
  assert.equal(targets.every((target) => target.domain.length > 0), true);
});
