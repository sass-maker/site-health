import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const cli = resolve(here, '../scripts/agent-bin/fleet-skill-run.mjs');
const fixture = resolve(here, 'fixtures/skill-runs/fixture-skill.mjs');
const scorecard = resolve(here, '../teammates/SCORECARD.md');

function run(root, args, input) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd: resolve(here, '../../..'),
    env: { ...process.env, FLEET_SKILL_RUNS_DIR: root },
    encoding: 'utf8',
    input,
  });
}

test('exec retains separate streams and explicit project metric series', async () => {
  const root = await mkdtemp(resolve(tmpdir(), 'fleet-skill-run-cli-'));
  const outputPath = resolve(root, 'fixture-result.txt');
  const metricsPath = resolve(root, 'fixture-metrics.json');
  const executed = run(root, [
    'exec',
    '--skill', 'fixture-skill',
    '--project', 'fixture-project',
    '--output-file', outputPath,
    '--metrics-file', metricsPath,
    '--',
    process.execPath, fixture, outputPath, metricsPath,
  ]);

  assert.equal(executed.status, 0, executed.stderr);
  assert.match(executed.stdout, /fixture stdout/);
  assert.match(executed.stderr, /fixture stderr/);

  const listed = run(root, ['list', '--project', 'fixture-project', '--json']);
  assert.equal(listed.status, 0, listed.stderr);
  const runs = JSON.parse(listed.stdout);
  assert.equal(runs.length, 1);
  assert.equal(runs[0].captureCompleteness, 'exact-streams');

  const outputs = run(root, ['output', runs[0].runId, '--json']);
  assert.equal(outputs.status, 0, outputs.stderr);
  assert.deepEqual(
    {
      stdout: JSON.parse(outputs.stdout).stdout,
      stderr: JSON.parse(outputs.stdout).stderr,
      output: JSON.parse(outputs.stdout).output,
    },
    {
      stdout: 'fixture stdout\n',
      stderr: 'fixture stderr\n',
      output: 'fixture result artifact\n',
    },
  );

  const queried = run(root, [
    'metrics',
    '--project', 'fixture-project',
    '--skill', 'fixture-skill',
    '--json',
  ]);
  assert.equal(queried.status, 0, queried.stderr);
  const metrics = JSON.parse(queried.stdout);
  assert.deepEqual(metrics.map((metric) => metric.metricName).sort(), [
    'agent-score',
    'domain-rank',
  ]);
  assert.ok(metrics.every((metric) => metric.projectId === 'fixture-project'));
  assert.ok(metrics.every((metric) => metric.schemaVersion === 'fleet.skill-metric.v1'));
  assert.deepEqual(
    metrics.map((metric) => [metric.unit, metric.direction]).sort(),
    [
      ['position', 'lower-is-better'],
      ['score/10', 'higher-is-better'],
    ],
  );

  const envelope = JSON.parse(
    await readFile(
      resolve(root, dirname(runs[0].outputs.stdout.path), 'run.json'),
      'utf8',
    ),
  );
  assert.equal(envelope.outputs.stdout.redactionCount, 0);
  assert.equal(envelope.outputs.stderr.redactionCount, 0);
});

test('record does not infer metrics from prose and exec preserves a child failure', async () => {
  const root = await mkdtemp(resolve(tmpdir(), 'fleet-skill-run-record-'));
  const receipt = {
    run: {
      skillId: 'agent-evaluation',
      projectId: 'fixture-project',
      source: 'explicit-receipt',
      captureCompleteness: 'final-response',
      status: 'succeeded',
      idempotencyKey: 'fixture-prose-score',
    },
    output: 'The agent score was 9.8 and rank was 1.',
    metrics: [],
  };
  const recorded = run(root, ['record', '--json'], `${JSON.stringify(receipt)}\n`);
  assert.equal(recorded.status, 0, recorded.stderr);

  const metrics = run(root, ['metrics', '--project', 'fixture-project', '--json']);
  assert.deepEqual(JSON.parse(metrics.stdout), []);

  const failed = run(root, [
    'exec',
    '--skill', 'fixture-failure',
    '--project', 'fixture-project',
    '--',
    process.execPath, '-e', 'process.stderr.write("expected failure\\n"); process.exit(7)',
  ]);
  assert.equal(failed.status, 7);
  assert.match(failed.stderr, /expected failure/);

  const listed = JSON.parse(run(root, ['list', '--skill', 'fixture-failure', '--json']).stdout);
  assert.equal(listed[0].status, 'failed');
  assert.equal(listed[0].exitCode, 7);
});

test('teammate scorecard backfill is exactly 27 Codex and 8 Devin and idempotent', async () => {
  const root = await mkdtemp(resolve(tmpdir(), 'fleet-skill-run-backfill-'));
  const first = run(root, [
    'backfill-teammates',
    '--scorecard', scorecard,
    '--json',
  ]);
  assert.equal(first.status, 0, first.stderr);
  assert.deepEqual(JSON.parse(first.stdout), {
    source: scorecard,
    total: 35,
    created: 35,
    duplicates: 0,
    byActor: { codex: 27, devin: 8 },
    metricsCreated: 0,
  });

  const second = run(root, [
    'backfill-teammates',
    '--scorecard', scorecard,
    '--json',
  ]);
  assert.equal(second.status, 0, second.stderr);
  assert.equal(JSON.parse(second.stdout).created, 0);
  assert.equal(JSON.parse(second.stdout).duplicates, 35);

  const status = JSON.parse(run(root, ['status', '--json']).stdout);
  assert.equal(status.runCount, 35);
  assert.equal(status.metricCount, 0);

  const prune = JSON.parse(run(root, ['prune', '--before', '2030-01-01', '--json']).stdout);
  assert.equal(prune.dryRun, true);
  assert.equal(prune.candidateCount, 35);
  assert.equal(prune.deletedCount, 0);
});
