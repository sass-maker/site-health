import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import test from 'node:test';

import { createMetricRunController } from '../lib/dashboard-backend/metric-runs.mjs';

function fakeProcess() {
  const child = new EventEmitter();
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  return child;
}

function project() {
  return {
    id: 'pace',
    name: 'Pace',
    repo: 'pace',
    domains: ['heypace.app'],
    publicListing: 'maintained',
    lifecycle: 'maintained',
  };
}

test('starts and deduplicates project D-Rank runs without a shell', () => {
  let invocation;
  const child = fakeProcess();
  const controller = createMetricRunController({
    projects: [project()],
    spawnProcess: (command, args, options) => {
      invocation = { command, args, options };
      return child;
    },
  });

  const started = controller.start({ family: 'drank', projectId: 'pace' });
  const duplicate = controller.start({ family: 'drank', projectId: 'pace' });

  assert.equal(started.label, 'D-Rank');
  assert.equal(duplicate.runId, started.runId);
  assert.equal(duplicate.duplicate, true);
  assert.equal(invocation.options.shell, false);
  assert.deepEqual(invocation.args.slice(-2), ['--only', 'heypace.app']);
});

test('starts portfolio D-Rank, PSI, and Search runs', () => {
  const invocations = [];
  const children = [];
  const controller = createMetricRunController({
    projects: [project()],
    spawnProcess: (command, args, options) => {
      invocations.push({ command, args, options });
      const child = fakeProcess();
      children.push(child);
      return child;
    },
  });

  assert.equal(controller.start({ family: 'drank', scope: 'portfolio' }).label, 'Portfolio D-Rank');
  assert.equal(controller.start({ family: 'psi', scope: 'portfolio' }).label, 'Portfolio PSI');
  assert.equal(controller.start({ family: 'search', scope: 'portfolio' }).label, 'Portfolio search discovery');
  assert.equal(invocations.every(({ options }) => options.shell === false), true);
  assert.equal(invocations[0].args.includes('--only'), false);
  assert.equal(invocations[1].args[0].endsWith('run-performance-portfolio.mjs'), true);
  assert.equal(invocations[2].args[0].endsWith('search-console-collect.mjs'), true);
});

test('starts the bounded AI-awareness canary for one project', () => {
  let invocation;
  const controller = createMetricRunController({
    projects: [project()],
    spawnProcess: (command, args, options) => {
      invocation = { command, args, options };
      return fakeProcess();
    },
  });

  const started = controller.start({ family: 'ai', projectId: 'pace' });
  assert.equal(started.label, 'AI Visibility fixture canary');
  assert.equal(invocation.options.shell, false);
  assert.deepEqual(invocation.args.slice(1, 3), ['--project', 'pace']);
  assert.equal(invocation.args.at(-1).endsWith('providers-v1.json'), true);
});

test('rejects removed metric families and unsupported scopes', () => {
  const controller = createMetricRunController({
    projects: [project()],
    spawnProcess: () => fakeProcess(),
  });

  for (const family of ['agent', 'crawl', 'cloudflare', 'design', 'coverage']) {
    assert.throws(
      () => controller.start({ family, projectId: 'pace' }),
      { code: 'METRIC_FAMILY_INVALID' },
    );
  }
  assert.throws(
    () => controller.start({ family: 'search', projectId: 'pace' }),
    { code: 'METRIC_SCOPE_INVALID' },
  );
  assert.throws(
    () => controller.start({ family: 'psi', projectId: 'unknown' }),
    { code: 'METRIC_PROJECT_INVALID' },
  );
});
