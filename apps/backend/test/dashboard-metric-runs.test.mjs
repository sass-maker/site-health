import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import test from 'node:test';

import { createMetricRunController } from '../lib/dashboard-backend/metric-runs.mjs';
import { resolveFleetRoot, runPerformancePortfolio } from '../scripts/run-performance-portfolio.mjs';

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

test('resolves PSI Swarm from the Fleet root beside Site Health', () => {
  assert.equal(
    resolveFleetRoot('/workspace/fleet/site-health/apps/backend/scripts'),
    '/workspace/fleet',
  );
});

test('runs PSI with the Node ABI used by its installed native module', () => {
  let invocation;
  const result = runPerformancePortfolio(
    [{ projectId: 'pace', url: 'https://heypace.app/' }],
    {
      cliPath: '/workspace/fleet/psi-swarm/cli/dist/cli.js',
      cwd: '/workspace/fleet/psi-swarm',
      run(command, args, options) {
        invocation = { command, args, options };
        return { status: 0 };
      },
      log() {},
    },
  );
  assert.equal(result.completed, 1);
  assert.equal(invocation.command, 'mise');
  assert.deepEqual(invocation.args.slice(0, 5), [
    'exec', 'node@22.23.1', '--', 'node', '/workspace/fleet/psi-swarm/cli/dist/cli.js',
  ]);
});

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
  assert.equal(controller.start({ family: 'search', scope: 'portfolio' }).label, 'Portfolio Search Console evidence');
  assert.equal(invocations.every(({ options }) => options.shell === false), true);
  assert.equal(invocations[0].args.includes('--only'), false);
  assert.equal(invocations[1].args[0].endsWith('run-performance-portfolio.mjs'), true);
  assert.equal(invocations[2].args[0].endsWith('search-console-collect.mjs'), true);
});

test('reports AI-awareness unavailable instead of projecting a fixture', () => {
  let invoked = false;
  const controller = createMetricRunController({
    projects: [project()],
    spawnProcess: () => {
      invoked = true;
      return fakeProcess();
    },
  });

  const started = controller.start({ family: 'ai', projectId: 'pace' });
  assert.equal(started.label, 'AI Awareness');
  assert.equal(started.state, 'unavailable');
  assert.equal(started.code, 'AI_PROVIDER_CONNECTION_REQUIRED');
  assert.equal(invoked, false);
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
