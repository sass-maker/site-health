import assert from 'node:assert/strict';
import test from 'node:test';

import { collectD1Outcomes, PRODUCT_QUERIES } from '../lib/d1-outcomes.mjs';

function fixtureProjects() {
  return [
    { id: 'significanthobbies', domains: ['significanthobbies.com'] },
    { id: 'karte', domains: ['karte.app'] },
    { id: 'pace', domains: ['heypace.app'] }, // no D1 mapping
  ];
}

function mockExec(results) {
  const calls = [];
  const execImpl = (args) => {
    calls.push(args);
    const result = results.shift();
    if (result instanceof Error) throw result;
    return result;
  };
  execImpl.calls = calls;
  return execImpl;
}

function d1JsonResult(value) {
  return JSON.stringify([{ results: [{ value }] }]);
}

test('collects D1 aggregate observations for mapped products', async () => {
  const execImpl = mockExec([
    d1JsonResult(120), // significanthobbies total accounts
    d1JsonResult(8),   // significanthobbies new accounts
    d1JsonResult(45),  // karte total accounts
    d1JsonResult(3),   // karte new accounts
  ]);

  const result = await collectD1Outcomes({
    projects: fixtureProjects(),
    execImpl,
    now: new Date('2026-08-15T12:00:00.000Z'),
    reportingWindowDays: 7,
  });

  assert.equal(result.observationCount, 2);
  assert.equal(result.bundle.observations.length, 2);

  const sigObs = result.bundle.observations.find((o) => o.projectId === 'significanthobbies');
  assert.equal(sigObs.family, 'user-metrics');
  assert.equal(sigObs.provider, 'd1-aggregate');
  assert.equal(sigObs.scope, 'significanthobbies.com');
  const sigLabels = sigObs.metrics.map((m) => m.label);
  assert.ok(sigLabels.includes('Accounts'));
  assert.ok(sigLabels.includes('New accounts'));
  assert.equal(sigObs.metrics.find((m) => m.label === 'Accounts').value, 120);
  assert.equal(sigObs.metrics.find((m) => m.label === 'New accounts').value, 8);

  const karteObs = result.bundle.observations.find((o) => o.projectId === 'karte');
  assert.equal(karteObs.metrics.find((m) => m.label === 'Accounts').value, 45);

  // pace has no D1 mapping
  assert.equal(result.unavailable.length, 1);
  assert.equal(result.unavailable[0].projectId, 'pace');
  assert.equal(result.unavailable[0].reason, 'no-d1-mapping');
});

test('records unavailable for query errors', async () => {
  const execImpl = mockExec([new Error('wrangler: database not found')]);

  const result = await collectD1Outcomes({
    projects: [{ id: 'significanthobbies', domains: ['significanthobbies.com'] }],
    execImpl,
    now: new Date('2026-08-15T12:00:00.000Z'),
  });

  assert.equal(result.observationCount, 0);
  assert.equal(result.unavailable.length, 1);
  assert.equal(result.unavailable[0].reason, 'query-error');
});

test('records no-data when queries return zero', async () => {
  const execImpl = mockExec([
    d1JsonResult(0), // significanthobbies total accounts = 0
    d1JsonResult(0), // significanthobbies new accounts = 0
  ]);

  const result = await collectD1Outcomes({
    projects: [{ id: 'significanthobbies', domains: ['significanthobbies.com'] }],
    execImpl,
    now: new Date('2026-08-15T12:00:00.000Z'),
  });

  assert.equal(result.observationCount, 0);
  assert.equal(result.unavailable.length, 1);
  assert.equal(result.unavailable[0].reason, 'no-data');
});

test('rejects reporting window outside 1-90 days', async () => {
  await assert.rejects(
    () => collectD1Outcomes({
      projects: fixtureProjects(),
      reportingWindowDays: 0,
    }),
    /1-90 days/,
  );
});

test('PRODUCT_QUERIES covers the 6 D1-backed products', () => {
  const expected = ['significanthobbies', 'anime-list', 'reader', 'swe-interview-prep', 'karte', 'starboard'];
  for (const id of expected) {
    assert.ok(PRODUCT_QUERIES[id], `missing D1 query mapping for ${id}`);
    assert.ok(PRODUCT_QUERIES[id].database, `missing database name for ${id}`);
    assert.ok(PRODUCT_QUERIES[id].userTable, `missing user table for ${id}`);
  }
});
