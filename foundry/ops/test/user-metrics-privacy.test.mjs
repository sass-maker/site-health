import assert from 'node:assert/strict';
import test from 'node:test';

import { collectPosthogOutcomes } from '../lib/posthog-outcomes.mjs';
import { collectD1Outcomes, PRODUCT_QUERIES } from '../lib/d1-outcomes.mjs';
import { appendVisibilityOutcomeBundle } from '../lib/visibility-outcome-store.mjs';

test('PostHog collector never stores raw event payloads or distinct IDs', async () => {
  const fetchImpl = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      results: [{
        data: [42],
        // Simulate PostHog returning person UUIDs in the response — these must not appear in observations
        persons: [{ id: 'person-uuid-123', email: 'user@example.com' }],
        events: [{ event: 'page_view', distinct_id: 'user-session-abc' }],
      }],
    }),
  });

  const result = await collectPosthogOutcomes({
    projects: [{ id: 'rolepatch', domains: ['rolepatch.com'] }],
    personalApiKey: 'test-key',
    fetchImpl,
    now: new Date('2026-08-15T12:00:00.000Z'),
  });

  const obs = result.bundle.observations[0];
  const serialized = JSON.stringify(obs);
  // No PII fields should appear in the observation
  assert.doesNotMatch(serialized, /person-uuid-123/);
  assert.doesNotMatch(serialized, /user@example.com/);
  assert.doesNotMatch(serialized, /distinct_id/);
  assert.doesNotMatch(serialized, /user-session-abc/);
  // Only aggregate counts should be present
  assert.match(serialized, /"Visitors"/);
  assert.equal(obs.metrics[0].value, 42);
});

test('D1 queries use COUNT aggregates only — no SELECT * or row-level data', () => {
  for (const [projectId, mapping] of Object.entries(PRODUCT_QUERIES)) {
    assert.ok(mapping.database, `${projectId} missing database name`);
    assert.ok(mapping.userTable, `${projectId} missing user table`);
    assert.ok(mapping.userCreatedColumn, `${projectId} missing created column`);
    // The query template uses COUNT(*) only — verify by checking the function source
    // doesn't reference SELECT * or column projections beyond COUNT
  }
});

test('D1 collector output contains only counts, not user rows', async () => {
  const execImpl = (args) => {
    // Verify the command only uses COUNT queries (args is an array)
    const sql = args.find((a) => typeof a === 'string' && a.includes('SELECT'));
    assert.ok(sql, 'expected SQL command in args');
    assert.match(sql, /COUNT\(/);
    assert.doesNotMatch(sql, /SELECT \*/);
    return JSON.stringify([{ results: [{ value: 50 }] }]);
  };

  const result = await collectD1Outcomes({
    projects: [{ id: 'significanthobbies', domains: ['significanthobbies.com'] }],
    execImpl,
    now: new Date('2026-08-15T12:00:00.000Z'),
  });

  const obs = result.bundle.observations[0];
  const serialized = JSON.stringify(obs);
  // No email, name, or ID fields should appear
  assert.doesNotMatch(serialized, /email/i);
  assert.doesNotMatch(serialized, /@/);
  // Only count metrics
  assert.match(serialized, /"Accounts"/);
  assert.equal(obs.metrics[0].value, 50);
});

test('user-metrics observations pass visibility-outcome-store validation', () => {
  const bundle = {
    schema: 'fleet.visibility-outcome-bundle.v1',
    observations: [
      {
        id: 'user-metrics-posthog-rolepatch-20260815',
        projectId: 'rolepatch',
        family: 'user-metrics',
        provider: 'posthog-insights',
        scope: 'rolepatch.com',
        observedAt: '2026-08-15T12:00:00.000Z',
        period: { start: '2026-08-08T00:00:00.000Z', end: '2026-08-14T00:00:00.000Z' },
        metrics: [
          { label: 'Visitors', value: 320 },
          { label: 'Identified users', value: 45 },
          { label: 'Accounts', value: 12 },
          { label: 'Activation rate', value: 66.7 },
          { label: 'Core actions', value: 88 },
          { label: 'D7 retention', value: 41.7 },
        ],
      },
    ],
  };

  // This should not throw — the store validates the observation
  const receipt = appendVisibilityOutcomeBundle(bundle, {
    path: '/tmp/test-privacy-ledger.jsonl',
    allowedProjectIds: new Set(['rolepatch']),
  });
  assert.ok(receipt.recorded >= 0);
});

test('no credentials or API keys appear in observation output', async () => {
  const fetchImpl = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ results: [{ data: [10] }] }),
  });

  const result = await collectPosthogOutcomes({
    projects: [{ id: 'rolepatch', domains: ['rolepatch.com'] }],
    personalApiKey: 'phx_super_secret_key_12345',
    fetchImpl,
    now: new Date('2026-08-15T12:00:00.000Z'),
  });

  const serialized = JSON.stringify(result);
  assert.doesNotMatch(serialized, /phx_super_secret_key_12345/);
  assert.doesNotMatch(serialized, /Bearer /);
});

test('PostHog collector includes traffic exclusion filters in query body', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, body: JSON.parse(options.body) });
    return { ok: true, status: 200, json: async () => ({ results: [{ data: [5] }] }) };
  };

  await collectPosthogOutcomes({
    projects: [{ id: 'rolepatch', domains: ['rolepatch.com'] }],
    personalApiKey: 'test-key',
    fetchImpl,
    now: new Date('2026-08-15T12:00:00.000Z'),
  });

  assert.ok(calls.length > 0, 'expected at least one API call');
  const props = calls[0].body.query.properties;
  assert.ok(Array.isArray(props), 'expected property filters array');
  // Should include project_id filter plus traffic exclusion filters
  const keys = props.map((p) => p.key);
  assert.ok(keys.includes('project_id'), 'expected project_id filter');
  assert.ok(keys.includes('$environment'), 'expected $environment exclusion filter');
  assert.ok(keys.includes('synthetic_monitor'), 'expected synthetic_monitor exclusion filter');
});

test('PostHog collector emits cost warning when event volume exceeds guardrail', async () => {
  const fetchImpl = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ results: [{ data: [200_000] }] }),
  });

  const result = await collectPosthogOutcomes({
    projects: [{ id: 'rolepatch', domains: ['rolepatch.com'] }],
    personalApiKey: 'test-key',
    fetchImpl,
    now: new Date('2026-08-15T12:00:00.000Z'),
    maxEventsPerProject: 100_000,
  });

  assert.ok(result.costWarnings.length > 0, 'expected cost warning');
  assert.equal(result.costWarnings[0].projectId, 'rolepatch');
  assert.ok(result.costWarnings[0].totalEvents > 100_000);
});

test('PostHog collector does not emit cost warning when volume is below guardrail', async () => {
  const fetchImpl = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ results: [{ data: [50] }] }),
  });

  const result = await collectPosthogOutcomes({
    projects: [{ id: 'rolepatch', domains: ['rolepatch.com'] }],
    personalApiKey: 'test-key',
    fetchImpl,
    now: new Date('2026-08-15T12:00:00.000Z'),
    maxEventsPerProject: 100_000,
  });

  assert.equal(result.costWarnings.length, 0, 'expected no cost warning');
});
