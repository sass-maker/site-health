import assert from 'node:assert/strict';
import {
  chmodSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  METRIC_SCHEMA_VERSION,
  RUN_SCHEMA_VERSION,
  SkillRunStore,
  defaultSkillRunsRoot,
  doctorSkillRunStore,
  listSkillRuns,
  querySkillMetrics,
  readSkillRunOutput,
  rebuildSkillRunIndexes,
  recordSkillRun,
  sanitizeOutput,
  skillRunStatus,
  validateMetricObservation,
  validateRunEnvelope,
} from '../lib/skill-run-store.mjs';

const firstTime = '2026-07-28T09:00:00.000Z';
const secondTime = '2026-07-29T09:00:00.000Z';

function temporaryRoot() {
  return join(mkdtempSync(join(tmpdir(), 'fleet-skill-run-store-')), 'skill-runs');
}

function runInput(overrides = {}) {
  return {
    idempotencyKey: 'test/domain-rank/2026-07-28',
    skillId: 'name-domains',
    skillVersion: '1',
    projectId: 'pace',
    projectRoot: '/workspace/pace',
    actor: 'codex',
    host: 'test-host',
    source: 'wrapped',
    captureCompleteness: 'exact-streams',
    status: 'succeeded',
    exitCode: 0,
    startedAt: firstTime,
    finishedAt: firstTime,
    observedAt: firstTime,
    durationMs: 0,
    correlationId: 'turn/test',
    sourceReference: 'fixture',
    metadata: { taskType: 'domain-ranking' },
    ...overrides,
  };
}

function metricInput(overrides = {}) {
  return {
    metricName: 'domain-rank',
    value: 4,
    unit: 'rank',
    direction: 'lower-is-better',
    entityKind: 'domain',
    entityId: 'pace.dev',
    observedAt: firstTime,
    provenance: 'explicit-fixture',
    dimensions: { market: 'global' },
    ...overrides,
  };
}

test('resolves the private runtime root from defaults and overrides', () => {
  assert.equal(
    defaultSkillRunsRoot({ env: {}, home: '/Users/tester' }),
    '/Users/tester/Library/Application Support/Fleet Ops/skill-runs',
  );
  assert.equal(
    defaultSkillRunsRoot({
      env: { FLEET_SKILL_RUNS_DIR: '/tmp/fleet-custom-skill-runs' },
      home: '/ignored',
    }),
    '/tmp/fleet-custom-skill-runs',
  );

  const root = temporaryRoot();
  const store = new SkillRunStore({ root });
  assert.equal(store.root, root);
  assert.equal(statSync(root).mode & 0o077, 0);
  assert.equal(statSync(join(root, 'runs')).mode & 0o077, 0);
});

test('validates versioned run and finite numeric metric contracts', () => {
  const metric = {
    ...metricInput(),
    schemaVersion: METRIC_SCHEMA_VERSION,
    runId: 'run_contract',
    projectId: 'pace',
    skillId: 'name-domains',
  };
  assert.equal(validateMetricObservation(metric), metric);
  assert.throws(
    () => validateMetricObservation({ ...metric, value: Number.NaN }),
    (error) => error.code === 'INVALID_METRIC_VALUE',
  );
  assert.throws(
    () => validateMetricObservation({ ...metric, direction: 'up' }),
    (error) => error.code === 'INVALID_METRIC_DIRECTION',
  );
  assert.throws(
    () => validateMetricObservation({ ...metric, dimensions: { api_key: 'must-not-store' } }),
    (error) => error.code === 'SENSITIVE_METRIC_DIMENSION',
  );

  const run = {
    ...runInput({ runId: 'run_contract', schemaVersion: RUN_SCHEMA_VERSION }),
    outputs: {},
    metrics: [metric],
  };
  assert.equal(validateRunEnvelope(run), run);
  assert.throws(
    () => validateRunEnvelope({ ...run, source: 'guessed' }),
    (error) => error.code === 'INVALID_SOURCE',
  );
  assert.throws(
    () => validateRunEnvelope({ ...run, runId: '../escape' }),
    (error) => error.code === 'INVALID_RUN_ID',
  );
});

test('stores sanitized bounded output atomically with owner-only permissions and idempotency', () => {
  const root = temporaryRoot();
  const store = new SkillRunStore({ root, maxOutputBytes: 80 });
  const secret = 'github_pat_abcdefghijklmnopqrstuvwxyz123456';
  const first = store.record({
    run: runInput(),
    stdout: `begin Authorization: Bearer ${secret}\n${'x'.repeat(200)}\nend`,
    stderr: `API_KEY=${secret}\nwarning`,
    output: `curated note password=${secret}`,
    metrics: [metricInput()],
  });

  assert.equal(first.duplicate, false);
  assert.equal(first.run.schemaVersion, RUN_SCHEMA_VERSION);
  assert.equal(first.metrics[0].schemaVersion, METRIC_SCHEMA_VERSION);
  assert.equal(first.run.outputs.stdout.truncated, true);
  assert.ok(first.run.outputs.stdout.redactionCount > 0);
  assert.ok(first.run.outputs.stderr.redactionCount > 0);
  assert.ok(first.run.outputs.output.redactionCount > 0);
  assert.ok(first.run.outputs.stdout.storedBytes <= 80);

  const runDirectory = join(root, 'runs', '2026', '07', first.run.runId);
  assert.equal(existsSync(join(runDirectory, 'run.json')), true);
  assert.equal(statSync(runDirectory).mode & 0o077, 0);
  for (const filename of ['run.json', 'stdout.log', 'stderr.log', 'output.txt']) {
    assert.equal(statSync(join(runDirectory, filename)).mode & 0o077, 0);
    assert.equal(readFileSync(join(runDirectory, filename), 'utf8').includes(secret), false);
  }
  assert.equal(readFileSync(join(root, 'index.jsonl'), 'utf8').includes(secret), false);
  assert.equal(readFileSync(join(root, 'metrics.jsonl'), 'utf8').includes(secret), false);

  const repeated = store.record({
    run: runInput({ runId: 'different-request-run-id' }),
    stdout: 'different output must not replace the immutable run',
    metrics: [],
  });
  assert.equal(repeated.duplicate, true);
  assert.equal(repeated.run.runId, first.run.runId);
  assert.equal(store.scanCanonicalRuns().length, 1);
  assert.match(store.output(first.run.runId, 'stderr'), /\[REDACTED\]/);
});

test('lists runs and returns chronological unit-safe metric observations', () => {
  const root = temporaryRoot();
  const store = new SkillRunStore({ root });
  const second = store.record({
    run: runInput({
      idempotencyKey: 'test/domain-rank/2026-07-29',
      startedAt: secondTime,
      finishedAt: secondTime,
      observedAt: secondTime,
    }),
    output: 'second',
    metrics: [metricInput({ value: 2, observedAt: secondTime })],
  });
  const first = recordSkillRun(store, {
    run: runInput(),
    output: 'first',
    metrics: [
      metricInput(),
      metricInput({
        metricName: 'agent-score',
        value: 92,
        unit: 'percent',
        direction: 'higher-is-better',
        entityKind: 'agent',
        entityId: 'codex',
      }),
    ],
  });

  assert.deepEqual(
    listSkillRuns(store, { projectId: 'pace', skillId: 'name-domains' }).map(
      (run) => run.runId,
    ),
    [second.run.runId, first.run.runId],
  );
  assert.equal(readSkillRunOutput(store, first.run.runId), 'first');
  assert.deepEqual(
    querySkillMetrics(store, {
      projectId: 'pace',
      skillId: 'name-domains',
      metricName: 'domain-rank',
    }).map(({ value, unit, direction, observedAt }) => ({ value, unit, direction, observedAt })),
    [
      { value: 4, unit: 'rank', direction: 'lower-is-better', observedAt: firstTime },
      { value: 2, unit: 'rank', direction: 'lower-is-better', observedAt: secondTime },
    ],
  );
  assert.equal(store.metrics({ unit: 'percent' }).length, 1);

  const status = skillRunStatus(store);
  assert.equal(status.runCount, 2);
  assert.equal(status.metricCount, 3);
  assert.equal(status.oldestRunAt, firstTime);
  assert.equal(status.newestRunAt, secondTime);
  assert.ok(status.outputBytes > 0);
  assert.ok(status.totalBytes >= status.outputBytes);
});

test('doctor detects index and output corruption and rebuild repairs indexes from canonical runs', () => {
  const root = temporaryRoot();
  const store = new SkillRunStore({ root });
  const stored = store.record({
    run: runInput(),
    stdout: 'good output',
    metrics: [metricInput()],
  });
  assert.equal(store.doctor().healthy, true);

  writeFileSync(join(root, 'index.jsonl'), '{broken json\n', { mode: 0o600 });
  writeFileSync(join(root, 'metrics.jsonl'), '', { mode: 0o600 });
  const damagedIndexes = doctorSkillRunStore(store);
  assert.equal(damagedIndexes.healthy, false);
  assert.ok(damagedIndexes.errors.some((error) => error.includes('index.jsonl')));
  assert.ok(damagedIndexes.errors.some((error) => error.includes('metric missing')));

  assert.deepEqual(rebuildSkillRunIndexes(store), {
    schemaVersion: 'fleet.skill-run-rebuild.v1',
    runCount: 1,
    metricCount: 1,
  });
  assert.equal(store.doctor().healthy, true);
  assert.equal(store.list().length, 1);
  assert.equal(store.metrics().length, 1);

  const stdoutPath = join(root, stored.run.outputs.stdout.path);
  writeFileSync(stdoutPath, 'tampered', { mode: 0o600 });
  const damagedOutput = store.doctor();
  assert.equal(damagedOutput.healthy, false);
  assert.ok(damagedOutput.errors.some((error) => error.includes('SHA-256')));

  chmodSync(stdoutPath, 0o644);
  const exposedOutput = store.doctor();
  assert.equal(exposedOutput.healthy, false);
  assert.ok(exposedOutput.errors.some((error) => error.includes('not owner-only')));
});

test('sanitization reports hashes, redactions, byte counts, and truncation without leaking matches', () => {
  const genericSecret = 'synthetic-verification-token-value';
  const generic = sanitizeOutput(`API_KEY=${genericSecret}`);
  assert.equal(generic.content, 'API_KEY=[REDACTED]');
  assert.equal(generic.content.includes(genericSecret), false);
  assert.equal(generic.metadata.redactionCount, 1);

  const secret = 'sk-123456789012345678901234567890';
  const sanitized = sanitizeOutput(`token=${secret}\n${'tail'.repeat(20)}`, {
    limitBytes: 48,
  });
  assert.equal(sanitized.content.includes(secret), false);
  assert.match(sanitized.content, /\[REDACTED\]|\[TRUNCATED\]/);
  assert.ok(sanitized.metadata.redactionCount >= 1);
  assert.equal(sanitized.metadata.truncated, true);
  assert.ok(sanitized.metadata.originalBytes > sanitized.metadata.storedBytes);
  assert.match(sanitized.metadata.sha256, /^[a-f0-9]{64}$/);

  const unicode = sanitizeOutput('🙂'.repeat(40), { limitBytes: 31 });
  assert.ok(Buffer.byteLength(unicode.content) <= 31);
  assert.equal(Buffer.byteLength(unicode.content), unicode.metadata.storedBytes);
});
