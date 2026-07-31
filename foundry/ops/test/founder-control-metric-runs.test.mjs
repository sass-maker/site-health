import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PassThrough } from 'node:stream';
import test from 'node:test';

import { createMetricRunController } from '../lib/founder-control/metric-runs.mjs';

function fakeProcess() {
  const child = new EventEmitter();
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  return child;
}

test('starts one allowlisted project metric command without a shell and deduplicates it', async () => {
  let invocation;
  const child = fakeProcess();
  const controller = createMetricRunController({
    projects: [{ id: 'pace', name: 'Pace', domains: ['heypace.app'], repo: 'pace' }],
    spawnProcess: (command, args, options) => {
      invocation = { command, args, options };
      return child;
    },
    now: (() => {
      let tick = 0;
      return () => `2026-07-30T10:00:0${tick++}.000Z`;
    })(),
  });

  const started = controller.start({ family: 'drank', projectId: 'pace' });
  const duplicate = controller.start({ family: 'drank', projectId: 'pace' });
  assert.equal(started.state, 'running');
  assert.equal(duplicate.runId, started.runId);
  assert.equal(duplicate.duplicate, true);
  assert.equal(invocation.options.shell, false);
  assert.deepEqual(invocation.args.slice(-2), ['--only', 'heypace.app']);

  child.stdout.write('DR=12\n');
  child.emit('close', 0);
  assert.equal(controller.get(started.runId).state, 'succeeded');
  assert.equal(controller.get(started.runId).summary, 'D-Rank completed.');
});

test('starts one portfolio D-Rank command without per-domain concurrent writers', () => {
  let invocation;
  const child = fakeProcess();
  const controller = createMetricRunController({
    projects: [
      {
        id: 'fleet-workspace',
        publicListing: 'maintained',
        lifecycle: 'maintained',
        domains: ['fleet.sassmaker.com'],
      },
      {
        id: 'drank',
        publicListing: 'maintained',
        lifecycle: 'maintained',
        domains: ['domains.sassmaker.com'],
      },
    ],
    spawnProcess: (command, args, options) => {
      invocation = { command, args, options };
      return child;
    },
  });

  const started = controller.start({ family: 'drank', scope: 'portfolio' });
  const duplicate = controller.start({ family: 'drank', scope: 'portfolio' });

  assert.equal(started.scope, 'portfolio');
  assert.equal(started.projectId, null);
  assert.equal(started.label, 'Portfolio D-Rank');
  assert.equal(duplicate.runId, started.runId);
  assert.equal(duplicate.duplicate, true);
  assert.equal(invocation.options.shell, false);
  assert.equal(invocation.args.includes('--only'), false);
  assert.deepEqual(invocation.args.slice(-2), ['--target', 'sassmaker.com']);
  assert.throws(
    () => controller.start({ family: 'psi', scope: 'portfolio' }),
    { code: 'METRIC_SCOPE_INVALID' },
  );
});

test('rejects unknown projects and validates existing design receipts', () => {
  const fleetRoot = mkdtempSync(join(tmpdir(), 'metric-runs-'));
  mkdirSync(join(fleetRoot, 'product', '.fleet'), { recursive: true });
  writeFileSync(
    join(fleetRoot, 'product', '.fleet', 'design-review.json'),
    '{"$schema":"fleet.design-review.v1"}\n',
  );
  const child = fakeProcess();
  let invocation;
  const controller = createMetricRunController({
    fleetRoot,
    projects: [{ id: 'product', name: 'Product', repo: 'product', domains: [] }],
    spawnProcess: (command, args, options) => {
      invocation = { command, args, options };
      return child;
    },
  });

  assert.throws(
    () => controller.start({ family: 'psi', projectId: 'unknown' }),
    { code: 'METRIC_PROJECT_INVALID' },
  );
  const started = controller.start({ family: 'design', projectId: 'product' });
  assert.equal(started.label, 'Design review validation');
  assert.equal(invocation.args.some((argument) => argument.endsWith('design-workflow.mjs')), true);
  assert.equal(invocation.options.shell, false);
});

test('routes readiness audits through the normalized visibility runner', () => {
  const child = fakeProcess();
  const invocations = [];
  const controller = createMetricRunController({
    projects: [{ id: 'pace', name: 'Pace', domains: ['heypace.app'], repo: 'pace' }],
    spawnProcess: (command, args, options) => {
      invocations.push({ command, args, options });
      return child;
    },
  });

  const started = controller.start({ family: 'agent', projectId: 'pace' });
  assert.equal(started.label, 'AI Agent Readiness');
  assert.equal(invocations[0].options.shell, false);
  assert.equal(
    invocations[0].args.some((argument) => argument.endsWith('run-visibility-metric.mjs')),
    true,
  );
  assert.deepEqual(invocations[0].args.slice(-4), [
    '--family',
    'agent',
    '--project',
    'pace',
  ]);
  const crawl = controller.start({ family: 'crawl', projectId: 'pace' });
  assert.equal(crawl.label, 'AI Crawlability');
  assert.deepEqual(invocations[1].args.slice(-4), [
    '--family',
    'crawl',
    '--project',
    'pace',
  ]);
});
