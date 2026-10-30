import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtempSync, mkdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { PassThrough } from 'node:stream';
import { join, resolve } from 'node:path';
import test, { after } from 'node:test';

import { createMetricRunController as createController } from '../lib/dashboard-backend/metric-runs.mjs';
import { resolveFleetRoot, runPerformancePortfolio, runSwarmProcess } from '../scripts/run-performance-portfolio.mjs';

const fixtureRoot = mkdtempSync(join(tmpdir(), 'site-health-metric-runners-'));
for (const file of ['psi-swarm/cli/dist/cli.js']) {
  const path = join(fixtureRoot, file);
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, '');
}
after(() => rmSync(fixtureRoot, { recursive: true, force: true }));
function createMetricRunController(options) {
  return createController({ workspaceRoot: fixtureRoot, ...options });
}

test('keeps PSI cataloged and runs domain rating from the executing Site Health checkout', async () => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'site-health-relocated-runners-')));
  const projects = [project(),
    { id: 'drank', repo: '../archive/drank', lifecycle: { status: 'inactive' } },
    { id: 'psi-swarm', sourcePath: '../archive/psi-swarm', lifecycle: { status: 'inactive' } },
  ];
  const workspaceRoot = join(root, 'fleet');
  const invocations = [];
  try {
    for (const file of ['psi-swarm/cli/dist/cli.js']) {
      const path = join(root, 'archive', file);
      mkdirSync(join(path, '..'), { recursive: true });
      writeFileSync(path, '');
    }
    const controller = createMetricRunController({ projects, workspaceRoot, repositoryRoot: join(root, 'stale-site-health'),
      spawnProcess: (command, args, options) => {
        invocations.push({ command, args, options });
        return fakeProcess();
      },
    });
    controller.start({ family: 'drank', projectId: 'pace' });
    controller.start({ family: 'psi', projectId: 'pace' });
    controller.start({ family: 'drank', scope: 'portfolio' });
    const nativeCollector = resolve(import.meta.dirname, '../scripts/domain-rating-collect.mjs');
    assert.equal(invocations[0].args[0], nativeCollector);
    assert.equal(invocations[0].options.cwd, resolve(import.meta.dirname, '../../..'));
    assert.deepEqual(invocations[0].args.slice(1), ['--target', 'heypace.app']);
    assert.equal(invocations[1].args[4], join(root, 'archive/psi-swarm/cli/dist/cli.js'));
    assert.equal(invocations[1].options.cwd, join(root, 'archive/psi-swarm'));
    assert.equal(invocations[2].options.cwd, resolve(import.meta.dirname, '../../..'));
    let performanceInvocation;
    await runPerformancePortfolio([{ projectId: 'pace', url: 'https://heypace.app/' }], {
      projects, workspaceRoot, log() {}, verifySamples: () => true,
      run(command, args, options) { performanceInvocation = { args, options }; return { status: 0 }; },
    });
    assert.equal(performanceInvocation.args[4], invocations[1].args[4]);
    assert.equal(performanceInvocation.options.cwd, invocations[1].options.cwd);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('native domain-rating collection does not depend on a cataloged Drank checkout', () => {
  const invocations = [];
  const controller = createMetricRunController({
    projects: [project(), { id: 'drank', repo: 'missing/drank' }, { id: 'psi-swarm', repo: 'missing/psi-swarm' }],
    spawnProcess(command, args, options) { invocations.push({ command, args, options }); return fakeProcess(); },
  });
  assert.throws(() => controller.start({ family: 'psi', projectId: 'pace' }), { code: 'METRIC_RUNNER_UNAVAILABLE' });
  assert.equal(controller.start({ family: 'drank', projectId: 'pace' }).state, 'running');
  assert.equal(controller.start({ family: 'drank', scope: 'portfolio' }).state, 'running');
  assert.equal(invocations.length, 2);
  assert.ok(invocations.every(({ args }) => args[0] === resolve(import.meta.dirname, '../scripts/domain-rating-collect.mjs')));
});

function fakeProcess() {
  const child = new EventEmitter();
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  return child;
}

function project() {
  return {
    id: 'pace',
    audience: 'public',
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

test('launches portfolio PSI with the supported Node 24 runtime', async () => {
  let invocation;
  const result = await runPerformancePortfolio(
    [{ projectId: 'pace', url: 'https://heypace.app/' }],
    {
      cliPath: '/workspace/fleet/psi-swarm/cli/dist/cli.js',
      cwd: '/workspace/fleet/psi-swarm',
      verifySamples: () => true,
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
    'exec', 'node@24.20.0', '--', 'node', '/workspace/fleet/psi-swarm/cli/dist/cli.js',
  ]);
});

test('failed collector receipts show the error instead of its stack tail', () => {
  const child = fakeProcess();
  const controller = createMetricRunController({
    projects: [project()],
    spawnProcess: () => child,
  });
  const started = controller.start({ family: 'drank', projectId: 'pace' });
  child.stderr.write('Error: No successful DR observations; history unchanged\n    at async fetchRating (file:///Users/private/collector.mjs:42)\n    at async main (file:///Users/private/collector.mjs:90)\nNode.js v26.8.1\n');
  child.emit('close', 1);
  const failed = controller.get(started.runId);
  assert.equal(failed.state, 'failed');
  assert.equal(failed.summary, 'Error: No successful DR observations; history unchanged');
});

test('starts and deduplicates project Ahrefs Domain Rating runs without a shell', () => {
  let invocation;
  const child = fakeProcess();
  const controller = createMetricRunController({
    projects: [{ ...project(), domains: ['www.blog.heypace.app/path'] }],
    spawnProcess: (command, args, options) => {
      invocation = { command, args, options };
      return child;
    },
  });

  const started = controller.start({ family: 'drank', projectId: 'pace' });
  const duplicate = controller.start({ family: 'drank', projectId: 'pace' });

  assert.equal(started.label, 'Ahrefs Domain Rating');
  assert.equal(duplicate.runId, started.runId);
  assert.equal(duplicate.duplicate, true);
  assert.equal(invocation.options.shell, false);
  assert.deepEqual(invocation.args.slice(-2), ['--target', 'heypace.app']);
});

test('project Domain Rating chooses an in-scope root and returns unavailable for shared hosting only', () => {
  const invocations = [];
  const regularProject = {
    ...project(),
    domains: ['pace.github.io', 'www.blog.heypace.app/path'],
  };
  const hostedOnly = {
    ...project(),
    id: 'hosted-only',
    name: 'Hosted only',
    domains: ['pace.github.io'],
  };
  const controller = createMetricRunController({
    projects: [regularProject, hostedOnly],
    spawnProcess(command, args, options) {
      invocations.push({ command, args, options });
      return fakeProcess();
    },
  });

  const measured = controller.start({ family: 'drank', projectId: 'pace' });
  const unavailable = controller.start({ family: 'drank', projectId: 'hosted-only' });

  assert.equal(measured.state, 'running');
  assert.deepEqual(invocations[0].args.slice(-2), ['--target', 'heypace.app']);
  assert.equal(unavailable.state, 'unavailable');
  assert.equal(unavailable.code, 'METRIC_DOMAIN_INVALID');
  assert.match(unavailable.summary, /No in-scope public-provider root/);
  assert.equal(invocations.length, 1);
});

test('starts portfolio Ahrefs Domain Rating, PSI, and Search runs', () => {
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

  assert.equal(controller.start({ family: 'drank', scope: 'portfolio' }).label, 'Portfolio Ahrefs Domain Rating');
  assert.equal(controller.start({ family: 'psi', scope: 'portfolio' }).label, 'Portfolio PSI');
  assert.equal(controller.start({ family: 'search', scope: 'portfolio' }).label, 'Portfolio Search Console evidence');
  assert.equal(invocations.every(({ options }) => options.shell === false), true);
  assert.equal(invocations[0].args[0], resolve(import.meta.dirname, '../scripts/domain-rating-collect.mjs'));
  assert.equal(invocations[0].args.filter((argument) => argument === '--target').length, 1);
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

test('retains a failed partial Domain Rating code through the child-process receipt', () => {
  const child = fakeProcess();
  const receipts = [];
  const controller = createMetricRunController({
    projects: [project()],
    spawnProcess: () => child,
    onRunChange: (receipt) => receipts.push(receipt),
  });
  const started = controller.start({ family: 'drank', projectId: 'pace' });
  child.stderr.write('AHREFS_PARTIAL_RESPONSE: Valid ratings saved; missing targets retained.\n');
  child.emit('close', 1);
  const completed = controller.get(started.runId);
  assert.equal(completed.state, 'failed');
  assert.equal(completed.code, 'AHREFS_PARTIAL_RESPONSE');
  assert.equal(receipts.at(-1).code, 'AHREFS_PARTIAL_RESPONSE');
  assert.match(completed.summary, /missing targets retained/);
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
    'Ahrefs Domain Rating',
  );
});

test('portfolio performance measures external identities including hidden listings and preserves section URLs', () => {
  const invocations = [];
  const controller = createMetricRunController({
    projects: [project(), { ...project(), id: 'hidden', publicListing: 'hidden', websiteUrl: 'https://family.example/product/', domains: ['old.example'] },
      { ...project(), id: 'internal', audience: 'internal' },
      { ...project(), id: 'retired', lifecycle: { status: 'inactive' } }],
    spawnProcess: (command, args) => { invocations.push(args); return fakeProcess(); },
  });
  controller.start({ family: 'psi', scope: 'portfolio' });
  assert.deepEqual(invocations[0].filter(arg => arg.includes('=https://')), ['hidden=https://family.example/product/', 'pace=https://heypace.app/']);
});

test('portfolio progress reaches callers and duplicate clicks attach to the existing run', () => {
  const child = fakeProcess();
  const receipts = [];
  let spawns = 0;
  const controller = createMetricRunController({ projects: [project()], onRunChange: run => receipts.push(run), spawnProcess: () => { spawns++; return child; } });
  const run = controller.start({ family: 'psi', scope: 'portfolio' });
  child.stdout.emit('data', 'Measuring pace\n');
  assert.equal(controller.get(run.runId).progress, null);
  child.stdout.emit('data', 'Checked 1/1 pa');
  child.stdout.emit('data', 'ce ok\n');
  const progress = controller.get(run.runId);
  assert.deepEqual(progress.progress, { completed: 1, total: 1, projectId: 'pace', outcome: 'ok' });
  assert.match(progress.summary, /Checked 1\/1/);
  assert.equal(controller.start({ family: 'psi', scope: 'portfolio' }).duplicate, true);
  assert.equal(spawns, 1);
  assert.equal(receipts.at(-1).progress.projectId, 'pace');
  child.emit('close', 0);
  assert.equal(controller.get(run.runId).state, 'succeeded');
});

test('an incomplete swarm is failed without skipping the remaining external products', async () => {
  let attempts = 0;
  const result = await runPerformancePortfolio([{ projectId: 'alpha', url: 'https://alpha.example' }, { projectId: 'beta', url: 'https://beta.example' }], {
    cwd: fixtureRoot, cliPath: 'unused', log() {}, run() { attempts++; return { status: 0 }; }, verifySamples: () => false,
  });
  assert.equal(attempts, 2);
  assert.deepEqual(result, { completed: 0, failed: ['alpha', 'beta'] });
});

test('Lighthouse runs one target and device preset at a time', async () => {
  const releases = [];
  let active = 0, peak = 0;
  const result = runPerformancePortfolio(['alpha', 'beta', 'gamma'].map(projectId => ({ projectId, url: `https://${projectId}.example` })), {
    cwd: fixtureRoot, cliPath: 'unused', log() {}, verifySamples: () => true,
    run(command, args) {
      assert.equal(args[args.indexOf('--parallel') + 1], '1');
      assert.equal(args[args.indexOf('--runs') + 1], '5');
      active++; peak = Math.max(peak, active);
      return new Promise(resolve => releases.push(() => { active--; resolve({ status: 0 }); }));
    },
  });
  assert.equal(releases.length, 1);
  releases.shift()();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(releases.length, 1);
  releases.shift()();
  await new Promise(resolve => setImmediate(resolve));
  releases.shift()();
  assert.equal((await result).completed, 3);
  assert.equal(peak, 1);
});

test('different performance scopes cannot overlap a running portfolio swarm', () => {
  const controller = createMetricRunController({ projects: [project()], spawnProcess: () => fakeProcess() });
  controller.start({ family: 'psi', scope: 'portfolio' });
  assert.throws(() => controller.start({ family: 'psi', projectId: 'pace' }), { code: 'PERFORMANCE_BUSY' });
});

test('timed-out process receives the CLI cancellation signal and settles as failed', { skip: process.platform === 'win32' }, async () => {
  const result = await runSwarmProcess(process.execPath, ['-e', `process.on('SIGINT', () => { console.log('cancelled'); process.exit(130); }); setInterval(() => {}, 1000);`], { timeout: 500, shell: false });
  assert.equal(result.status, 130);
  assert.match(result.stdout, /cancelled/);
  assert.match(result.stderr, /timed out/);
});

test('shutdown signals owned metric children and retires their receipts', () => {
  const child = fakeProcess();
  const signals = [];
  child.kill = signal => signals.push(signal);
  const controller = createMetricRunController({ projects: [project()], spawnProcess: () => child });
  const run = controller.start({ family: 'psi', scope: 'portfolio' });
  controller.abandonActiveRuns();
  assert.deepEqual(signals, ['SIGINT']);
  assert.equal(controller.get(run.runId).state, 'failed');
  child.emit('close', 130);
  controller.abandonActiveRuns();
  assert.deepEqual(signals, ['SIGINT']);
});

test('an aborted runner cancels its swarm instead of starting another target', { skip: process.platform === 'win32' }, async () => {
  const abort = new AbortController();
  let attempts = 0;
  const run = runPerformancePortfolio(['alpha', 'beta'].map(projectId => ({ projectId, url: `https://${projectId}.example` })), {
    cwd: fixtureRoot, cliPath: 'unused', signal: abort.signal, log() {}, verifySamples: () => true,
    run(command, args, options) {
      attempts++;
      const child = runSwarmProcess(process.execPath, ['-e', `process.on('SIGINT', () => process.exit(130)); setInterval(() => {}, 1000);`], options);
      setTimeout(() => abort.abort(), 300);
      return child;
    },
  });
  await assert.rejects(run, /interrupted/);
  assert.equal(attempts, 1);
});
