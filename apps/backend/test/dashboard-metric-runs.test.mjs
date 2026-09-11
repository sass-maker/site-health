import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { PassThrough } from 'node:stream';
import { join } from 'node:path';
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
    lifecycle: { status: 'active', shareable: true, resumeCondition: null },
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

test('executes a symlinked Drank script through its canonical path', async () => {
  const root = mkdtempSync(join(tmpdir(), 'site-health-drank-link-'));
  const marker = join(root, 'executed.txt');
  const archiveScript = join(root, 'archive', 'drank', 'scripts', 'update-global-dr.mjs');
  const linkedScript = join(root, 'drank', 'scripts', 'update-global-dr.mjs');
  mkdirSync(join(root, 'archive', 'drank', 'scripts'), { recursive: true });
  mkdirSync(join(root, 'drank', 'scripts'), { recursive: true });
  mkdirSync(join(root, 'pace'), { recursive: true });
  writeFileSync(archiveScript, [
    "import { resolve } from 'node:path';",
    "import { fileURLToPath } from 'node:url';",
    "import { writeFileSync } from 'node:fs';",
    `if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) writeFileSync(${JSON.stringify(marker)}, 'executed');`,
  ].join('\n'));
  symlinkSync(archiveScript, linkedScript);

  const terminal = new Promise((resolve) => {
    const controller = createMetricRunController({
      projects: [project()],
      workspaceRoot: root,
      repositoryRoot: join(root, 'site-health'),
      onRunChange: (run) => {
        if (run.state !== 'running') resolve(run);
      },
    });
    controller.start({ family: 'drank', projectId: 'pace' });
  });
  try {
    const run = await terminal;
    assert.equal(run.state, 'succeeded');
    assert.equal(readFileSync(marker, 'utf8'), 'executed');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
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

test('portfolio and project refreshes exclude inactive identities', () => {
  const invocations = [];
  // Portfolio priority and status live under project.portfolio in the catalog
  // (SAR-23); the flat project.priority / project.portfolioStatus fields this
  // fixture used to set do not exist on any of the 56 recorded identities, so
  // it was asserting exclusion through a field path nothing reads.
  const inactive = {
    ...project(),
    id: 'archived-product',
    name: 'Archived product',
    domains: ['archived.example'],
    portfolio: { priority: 'P4', status: 'archived' },
    lifecycle: { status: 'inactive', shareable: false, resumeCondition: null },
  };
  const controller = createMetricRunController({
    projects: [project(), inactive],
    spawnProcess: (command, args, options) => {
      invocations.push({ command, args, options });
      return fakeProcess();
    },
  });

  controller.start({ family: 'drank', scope: 'portfolio' });
  controller.start({ family: 'psi', scope: 'portfolio' });

  assert.equal(invocations[0].args.includes('archived.example'), false);
  assert.equal(invocations[1].args.some((value) => value.includes('archived-product=')), false);
  assert.throws(
    () => controller.start({ family: 'drank', projectId: 'archived-product' }),
    { code: 'METRIC_PROJECT_INACTIVE' },
  );
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

test('refreshes the project inventory before planning a metric run', () => {
  let currentProjects = [];
  const controller = createMetricRunController({
    projectsProvider: () => currentProjects,
    spawnProcess: () => fakeProcess(),
  });

  assert.throws(
    () => controller.start({ family: 'drank', projectId: 'pace' }),
    { code: 'METRIC_PROJECT_INVALID' },
  );
  currentProjects = [project()];
  assert.equal(
    controller.start({ family: 'drank', projectId: 'pace' }).label,
    'D-Rank',
  );
});
