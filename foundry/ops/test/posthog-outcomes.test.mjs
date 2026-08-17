import assert from 'node:assert/strict';
import test from 'node:test';

import {
  collectPosthogOutcomes,
  posthogProjectIdValues,
} from '../lib/posthog-outcomes.mjs';

function fixtureProjects() {
  return [
    {
      id: 'rolepatch',
      domains: ['rolepatch.com'],
      posthogProjectId: 'rolepatch',
    },
    {
      id: 'karte',
      domains: ['karte.app'],
      posthogProjectId: 'karte',
    },
  ];
}

function mockFetch(responses) {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    const key = options?.headers?.Authorization ?? '';
    if (key.includes('invalid')) {
      return { ok: false, status: 401, json: async () => ({ error: 'unauthorized' }) };
    }
    if (key.includes('ratelimited')) {
      return { ok: false, status: 429, json: async () => ({ error: 'rate limited' }) };
    }
    return {
      ok: true,
      status: 200,
      json: async () => responses.shift() ?? { results: [] },
    };
  };
  fetchImpl.calls = calls;
  return fetchImpl;
}

function trendResult(values) {
  return { results: [{ data: values }] };
}

test('collects PostHog user-metrics observations for projects with events', async () => {
  const responses = [
    trendResult([320]), // rolepatch page_view visitors
    trendResult([45]), // rolepatch identified users
    trendResult([12]), // rolepatch signups
    trendResult([8]), // rolepatch activated
    trendResult([88]), // rolepatch core actions
    trendResult([5]), // rolepatch returned
    trendResult([0]), // karte page_view visitors (no events)
    trendResult([0]), // karte identified users
    trendResult([0]), // karte signups
    trendResult([0]), // karte activated
    trendResult([0]), // karte core actions
    trendResult([0]), // karte returned
  ];
  const fetchImpl = mockFetch(responses);

  const result = await collectPosthogOutcomes({
    projects: fixtureProjects(),
    personalApiKey: 'test-key',
    fetchImpl,
    now: new Date('2026-08-15T12:00:00.000Z'),
    reportingWindowDays: 7,
  });

  assert.equal(result.observationCount, 1);
  assert.equal(result.bundle.observations.length, 1);
  const obs = result.bundle.observations[0];
  assert.equal(obs.projectId, 'rolepatch');
  assert.equal(obs.family, 'user-metrics');
  assert.equal(obs.provider, 'posthog-insights');
  assert.equal(obs.scope, 'rolepatch.com');

  const labels = obs.metrics.map((m) => m.label);
  assert.ok(labels.includes('Visitors'));
  assert.ok(labels.includes('Identified users'));
  assert.ok(labels.includes('Accounts'));
  assert.ok(labels.includes('Activation rate'));
  assert.ok(labels.includes('Core actions'));
  assert.ok(labels.includes('D7 retention'));

  const activationRate = obs.metrics.find((m) => m.label === 'Activation rate');
  assert.equal(activationRate.value, 66.7); // 8/12 * 100

  const d7Retention = obs.metrics.find((m) => m.label === 'D7 retention');
  assert.equal(d7Retention.value, 41.7); // 5/12 * 100

  assert.equal(result.unavailable.length, 1);
  assert.equal(result.unavailable[0].projectId, 'karte');
  assert.equal(result.unavailable[0].reason, 'no-events');
});

test('records unavailable for API errors', async () => {
  const fetchImpl = mockFetch([]);
  // Override to always error
  const errorFetch = async () => ({ ok: false, status: 500, json: async () => ({ error: 'server error' }) });

  const result = await collectPosthogOutcomes({
    projects: [{ id: 'rolepatch', domains: ['rolepatch.com'] }],
    personalApiKey: 'test-key',
    fetchImpl: errorFetch,
    now: new Date('2026-08-15T12:00:00.000Z'),
  });

  assert.equal(result.observationCount, 0);
  assert.equal(result.unavailable.length, 1);
  assert.equal(result.unavailable[0].reason, 'api-error');
});

test('throws when personal API key is missing', async () => {
  await assert.rejects(
    () => collectPosthogOutcomes({
      projects: fixtureProjects(),
      personalApiKey: '',
    }),
    /personal API key is required/,
  );
});

test('rejects reporting window outside 1-90 days', async () => {
  await assert.rejects(
    () => collectPosthogOutcomes({
      projects: fixtureProjects(),
      personalApiKey: 'test-key',
      reportingWindowDays: 0,
    }),
    /1-90 days/,
  );
  await assert.rejects(
    () => collectPosthogOutcomes({
      projects: fixtureProjects(),
      personalApiKey: 'test-key',
      reportingWindowDays: 91,
    }),
    /1-90 days/,
  );
});

test('queries the Query API and includes historical project_id aliases', async () => {
  const responses = Array.from({ length: 12 }, () => trendResult([0]));
  const fetchImpl = mockFetch(responses);

  await collectPosthogOutcomes({
    projects: fixtureProjects(),
    personalApiKey: 'test-key',
    fetchImpl,
    now: new Date('2026-08-15T12:00:00.000Z'),
  });

  assert.ok(fetchImpl.calls.length > 0);
  for (const call of fetchImpl.calls) {
    assert.match(call.url, /\/api\/projects\/396508\/query\/$/);
    assert.doesNotMatch(call.url, /insights/);
    const body = JSON.parse(call.options.body);
    assert.equal(body.query.kind, 'TrendsQuery');
    const projectFilter = body.query.properties.find((property) => property.key === 'project_id');
    assert.ok(projectFilter);
    if (projectFilter.value.includes('rolepatch')) {
      assert.deepEqual(projectFilter.value, ['rolepatch', 'resume-tailor']);
    } else {
      assert.deepEqual(projectFilter.value, ['karte', 'linkchat']);
    }
  }
});

test('maps catalog ids to the project_id values products already emit', () => {
  assert.deepEqual(posthogProjectIdValues({ id: 'rolepatch' }), ['rolepatch', 'resume-tailor']);
  assert.deepEqual(posthogProjectIdValues({ id: 'karte' }), ['karte', 'linkchat']);
  assert.deepEqual(posthogProjectIdValues({ id: 'drank' }), ['drank']);
});

test('handles rate limit responses gracefully', async () => {
  const rateLimitFetch = async () => ({ ok: false, status: 429, json: async () => ({ error: 'rate limited' }) });

  const result = await collectPosthogOutcomes({
    projects: [{ id: 'rolepatch', domains: ['rolepatch.com'] }],
    personalApiKey: 'test-key',
    fetchImpl: rateLimitFetch,
    now: new Date('2026-08-15T12:00:00.000Z'),
  });

  assert.equal(result.observationCount, 0);
  assert.equal(result.unavailable[0].reason, 'api-error');
  assert.match(result.unavailable[0].detail, /rate limit/i);
});
