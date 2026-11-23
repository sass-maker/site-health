import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { appHealthCredential, collectUsageEvidence, importUsageExport, readUsageEvidence, summarizeUsageSnapshot, usageFailureSnapshot, usageObservations, writeUsageEvidence } from '../lib/dashboard-backend/usage-evidence.mjs';
const projects = [{ id: 'one', name: 'One', lifecycle: { status: 'active' }, status: 'active' }];

test('import filters archived/foreign records, preserves zero, never promotes events to qualified use', () => {
  const snapshot = importUsageExport({ kind: 'portfolio-usage', schemaVersion: 1, usage: { updatedAt: '2026-10-27T00:00:00Z', records: {
    one: { checkedAt: '2026-10-27T00:00:00Z', proxy: { count: 0, unit: 'browsers' }, events: [{ count: 3 }], windowStart: '2026-09-27T00:00:00Z', windowEnd: '2026-10-27T00:00:00Z' }, foreign: { proxy: { count: 99 } },
  } } }, projects);
  assert.deepEqual(Object.keys(snapshot.records), ['one']);
  const rows = usageObservations(projects, snapshot);
  assert.equal(rows[0].value, 0); assert.equal(rows[0].qualification, 'proxy');
  assert.equal(rows[1].value, 3); assert.equal(rows[1].qualification, 'proxy');
  assert.ok(rows.every((row) => row.status === 'available'));
  assert.equal(usageObservations(projects, null)[0].value, null);
});

test('collector rejects ambiguous mapping and redirects; only fixed-origin GET aggregate reads are made', async () => {
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url, options });
    const body = url.endsWith('/v1/apps') ? { apps: [{ app: { id: 'app', name: 'One' }, environments: [{ id: 'prod', name: 'production' }] }] }
      : { from: Date.now() - 30 * 86_400_000, to: Date.now(), sampled: false, source: 'analytics-engine', sessions: 3, audience: { visitors: 0 }, events: [{ count: 2 }] };
    return { ok: true, json: async () => body };
  };
  const snapshot = await collectUsageEvidence({ projects, credential: 'fixture', fetcher });
  assert.equal(snapshot.records.one.status, 'available');
  assert.equal(snapshot.reportRequestDiagnostics, undefined);
  assert.equal(snapshot.records.one.count, 0);
  assert.equal(calls.length, 2);
  for (const call of calls) {
    assert.equal(new URL(call.url).origin, 'https://health.sassmaker.com');
    assert.equal(call.options.method, 'GET'); assert.equal(call.options.redirect, 'error');
  }
  assert.ok(!JSON.stringify(snapshot).includes('fixture'));
  const ambiguous = await collectUsageEvidence({ projects, credential: 'fixture', fetcher: async () => ({ ok: true, json: async () => ({ apps: [
    { app: { name: 'One' }, environments: [{ name: 'production' }] }, { app: { name: 'One' }, environments: [{ name: 'production' }] },
  ] }) }) });
  assert.equal(ambiguous.records.one.count, null);
  assert.equal(ambiguous.records.one.status, 'unmapped');
  assert.equal(ambiguous.records.one.observedAt, null);
  const failed = await collectUsageEvidence({ projects, credential: 'fixture', fetcher: async (url) => url.endsWith('/v1/apps')
    ? { ok: true, json: async () => ({ apps: [{ app: { id: 'one', name: 'One' }, environments: [{ id: 'prod', name: 'production' }] }] }) }
    : { ok: false, status: 503, json: async () => ({}) } });
  assert.equal(failed.records.one.status, 'failed');
  assert.equal(failed.records.one.count, null);
});

test('scheduled collector measures Bearer report round trips without changing the 30-day usage contract', async () => {
  const names = ['one', 'two', 'three', 'four'];
  const projects = names.map((id) => ({ id, name: `Product ${id}`, lifecycle: { status: 'active' }, status: 'active' }));
  const delays = { one: 5, two: 15, three: 25, four: 45 };
  const now = '2026-11-23T17:45:00.000Z';
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith('/v1/apps')) {
      return new Response(JSON.stringify({ apps: names.map((id) => ({
        app: { id, name: `Product ${id}` }, environments: [{ id: `prod-${id}`, name: 'production' }],
      })) }), { headers: { 'content-type': 'application/json' } });
    }
    const appId = new URL(url).searchParams.get('app_id');
    await new Promise((resolve) => setTimeout(resolve, delays[appId]));
    const response = new Response(JSON.stringify({
        from: Date.parse(now) - 30 * 86_400_000,
        to: Date.parse(now),
        sampled: false,
        source: 'analytics-engine',
        sessions: 3,
        audience: { visitors: 0 },
        events: [{ count: 2 }],
    }), { headers: { 'content-type': 'application/json' } });
    assert.equal(response.headers.get('server-timing'), null, 'the deployed Bearer response has no stage header');
    return response;
  };

  const snapshot = await collectUsageEvidence({
    projects, credential: 'private-token-marker', fetcher, now: () => now, captureReportDiagnostics: true,
  });
  assert.equal(calls.length, 5);
  assert.equal(snapshot.records.one.status, 'available');
  assert.deepEqual(
    Object.fromEntries(['count', 'unit', 'actionEvents', 'sampled', 'providerSource'].map((key) => [key, snapshot.records.one[key]])),
    { count: 0, unit: 'browsers', actionEvents: 2, sampled: false, providerSource: 'analytics-engine' },
  );
  assert.equal(new URL(calls[1].url).searchParams.get('range'), '30d');
  assert.equal(new URL(calls[1].url).searchParams.get('app_id'), 'one');
  assert.equal(new URL(calls[1].url).searchParams.get('environment_id'), 'prod-one');
  for (const call of calls) {
    assert.equal(new URL(call.url).origin, 'https://health.sassmaker.com');
    assert.equal(call.options.method, 'GET');
    assert.equal(call.options.redirect, 'error');
    assert.equal(call.options.headers.authorization, 'Bearer private-token-marker');
  }

  const diagnostics = snapshot.reportRequestDiagnostics;
  assert.equal(diagnostics.measurement, 'client-fetch-through-json-decode');
  assert.deepEqual(
    [diagnostics.reportAttempts, diagnostics.reportResponses, diagnostics.reportHttpSuccesses,
      diagnostics.reportHttpFailures, diagnostics.reportNoResponse, diagnostics.reportBodyFailures,
      diagnostics.reportInvalidAggregates, diagnostics.timingSamplesMissing],
    [4, 4, 4, 0, 0, 0, 0, 0],
  );
  assert.equal(diagnostics.roundTripMs.sampleCount, 4);
  assert.ok(diagnostics.roundTripMs.p50Ms > 0);
  assert.ok(diagnostics.roundTripMs.p95Ms > diagnostics.roundTripMs.p50Ms);
  assert.ok(diagnostics.roundTripMs.maxMs >= diagnostics.roundTripMs.p95Ms);
  assert.equal(diagnostics.stages, undefined, 'missing stage headers are not recorded as zero-duration stages');
  assert.doesNotMatch(JSON.stringify(diagnostics), /private-token-marker|prod-one|app_id|environment_id/);

  const withoutDiagnostics = await collectUsageEvidence({
    projects,
    credential: 'private-token-marker',
    now: () => now,
    fetcher,
  });
  assert.deepEqual(snapshot.records, withoutDiagnostics.records, 'timing collection preserves project results');
  assert.equal(withoutDiagnostics.reportRequestDiagnostics, undefined, 'diagnostics stay off for non-scheduler callers');
  assert.equal(calls.length, 10, 'both paired passes make the same number of requests');
  assert.equal(snapshot.records.one.window, `${new Date(Date.parse(now) - 30 * 86_400_000).toISOString()} to ${new Date(now).toISOString()}`);
});

test('request timing and outcome aggregates cover HTTP, body, transport, invalid-data, and successful reports', async () => {
  const currentProjects = ['success', 'http-failure', 'transport-failure', 'body-failure', 'invalid-report', 'null-report'].map((id) => ({
    id, name: id, lifecycle: { status: 'active' }, status: 'active',
  }));
  const now = '2026-11-23T17:45:00.000Z';
  const fetcher = async (url) => {
      if (url.endsWith('/v1/apps')) return new Response(JSON.stringify({ apps: currentProjects.map(({ id }) => ({
        app: { id, name: id }, environments: [{ id: `prod-${id}`, name: 'production' }],
      })) }), { headers: { 'content-type': 'application/json' } });
      const appId = new URL(url).searchParams.get('app_id');
      if (appId === 'transport-failure') throw new Error('private transport detail');
      if (appId === 'http-failure') return new Response('{}', { status: 503 });
      if (appId === 'body-failure') return new Response('not json');
      if (appId === 'null-report') return new Response('null');
      const report = appId === 'invalid-report' ? {} : {
        from: Date.parse(now) - 30 * 86_400_000, to: Date.parse(now), sampled: false,
        source: 'analytics-engine', sessions: 3, audience: { visitors: 0 }, events: [{ count: 2 }],
      };
      return new Response(JSON.stringify(report), { headers: { 'content-type': 'application/json' } });
  };
  const collect = (captureReportDiagnostics) => collectUsageEvidence({
    projects: currentProjects, credential: 'private-token-marker', now: () => now, fetcher, captureReportDiagnostics,
  });
  const snapshot = await collect(true);
  const withoutDiagnostics = await collect(false);
  assert.equal(snapshot.records.success.status, 'available');
  assert.equal(snapshot.records['http-failure'].status, 'failed');
  assert.equal(snapshot.records['transport-failure'].status, 'failed');
  assert.equal(snapshot.records['body-failure'].status, 'failed');
  assert.equal(snapshot.records['invalid-report'].status, 'failed');
  assert.equal(snapshot.records['null-report'].status, 'failed');
  assert.deepEqual(snapshot.records, withoutDiagnostics.records, 'diagnostics do not change success or failure rows');
  assert.deepEqual(
    [snapshot.reportRequestDiagnostics.reportAttempts, snapshot.reportRequestDiagnostics.reportResponses,
      snapshot.reportRequestDiagnostics.reportHttpSuccesses, snapshot.reportRequestDiagnostics.reportHttpFailures,
      snapshot.reportRequestDiagnostics.reportNoResponse, snapshot.reportRequestDiagnostics.reportBodyFailures,
      snapshot.reportRequestDiagnostics.reportInvalidAggregates, snapshot.reportRequestDiagnostics.timingSamplesMissing],
    [6, 5, 4, 1, 1, 1, 2, 0],
  );
  assert.equal(snapshot.reportRequestDiagnostics.roundTripMs.sampleCount, 6);
  assert.doesNotMatch(JSON.stringify(snapshot.reportRequestDiagnostics), /private-token-marker|private transport detail|http-failure|transport-failure|body-failure|invalid-report|null-report/);
});

test('failed refresh retains the original good value and observation date', () => {
  const path = join(mkdtempSync(join(tmpdir(), 'usage-retain-')), 'usage.json');
  writeUsageEvidence({ observedAt: '2026-10-26T00:00:00Z', records: { one: { count: 7, actionEvents: 3, observedAt: '2026-10-26T00:00:00Z', unit: 'browsers' } } }, path);
  writeUsageEvidence({ observedAt: '2026-10-27T00:00:00Z', records: { one: { status: 'failed', count: null, observedAt: null, gap: 'HTTP failure' } } }, path);
  const snapshot = readUsageEvidence(path);
  assert.equal(snapshot.records.one.status, 'retained');
  assert.equal(snapshot.records.one.count, 7);
  assert.equal(snapshot.records.one.observedAt, '2026-10-26T00:00:00Z');
  assert.match(snapshot.records.one.gap, /Refresh failed; retained last-known 7 browsers observed 2026-10-26T00:00:00Z/);
  const observations = usageObservations(projects, snapshot);
  assert.ok(observations.every((observation) => observation.status === 'retained' && observation.value === null && observation.qualification === 'unknown'));
  assert.ok(observations.every((observation) => observation.observedAt === '2026-10-26T00:00:00Z'));
  assert.match(observations[1].gap, /Last-known 3 events observed 2026-10-26T00:00:00Z; retained historical value/);
  assert.doesNotMatch(observations[1].gap, /7 browsers/);
});

test('null-count imported usage preserves a prior good observation', () => {
  const path = join(mkdtempSync(join(tmpdir(), 'usage-import-retain-')), 'usage.json');
  writeUsageEvidence({ observedAt: '2026-10-26T00:00:00Z', records: { one: { count: 7, observedAt: '2026-10-26T00:00:00Z', unit: 'browsers' } } }, path);
  const imported = importUsageExport({ kind: 'portfolio-usage', schemaVersion: 1, usage: { updatedAt: '2026-10-27T00:00:00Z', records: {
    one: { checkedAt: '2026-10-27T00:00:00Z', proxy: { count: null }, limitations: 'No browser proxy available.' },
  } } }, projects);
  writeUsageEvidence(imported, path);
  const row = readUsageEvidence(path).records.one;
  assert.equal(row.status, 'retained');
  assert.equal(row.count, 7);
  assert.equal(row.observedAt, '2026-10-26T00:00:00Z');
  assert.match(row.gap, /Incoming row had no numeric count; retained last-known 7 browsers observed 2026-10-26T00:00:00Z/);
});

test('lane-wide usage failure remains unknown without falsely retaining a prior value', () => {
  const snapshot = usageFailureSnapshot(projects, () => '2026-10-27T00:00:00Z');
  assert.equal(snapshot.records.one.status, 'failed');
  assert.equal(usageObservations(projects, snapshot)[0].value, null);
  assert.doesNotMatch(snapshot.records.one.gap, /retained/);
});

test('usage receipt summary preserves partial coverage counts', () => {
  assert.equal(summarizeUsageSnapshot({ records: {
    available: { status: 'available', count: 2 }, unmapped: { status: 'unmapped', count: null }, failed: { status: 'failed', count: null },
  } }).summary, 'App Health usage refresh: 1 available, 1 unmapped, 1 failed.');
});

test('credential resolution is asynchronous and never enters aggregate evidence', async () => {
  let resolve;
  const pending = appHealthCredential({ env: {}, readSecret: () => new Promise(done => { resolve = done; }) });
  assert.ok(pending instanceof Promise);
  resolve({ stdout: 'fixture\n' }); assert.equal(await pending, 'fixture');
});


test('approved scoped Keychain token is read without command-line secrets', async () => {
  const calls = [];
  const token = await appHealthCredential({ env: { APP_HEALTH_OWNER_TOKEN: 'broad-fixture' }, readSecret: async (...args) => {
    calls.push(args); return { stdout: 'scoped-fixture\n' };
  } });
  assert.equal(token, 'scoped-fixture');
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], '/usr/bin/security');
  assert.deepEqual(calls[0][1], ['find-generic-password', '-s', 'com.sassmaker.site-health.app-health-read', '-a', 'owner', '-w']);
  assert.ok(!JSON.stringify(calls).includes('scoped-fixture'));
  const unavailable = await appHealthCredential({ env: { APP_HEALTH_OWNER_TOKEN: 'owner-fixture' }, readSecret: async () => { throw new Error('missing'); } });
  assert.equal(unavailable, null);
});


test('missing or empty scoped Keychain item stays unavailable without broad credential fallback', async () => {
  for (const missing of [true, false]) {
    const executables = [];
    const token = await appHealthCredential({ env: { SITE_HEALTH_OWNER_REPOSITORY: '/tmp/site-health', APP_HEALTH_OWNER_TOKEN: 'owner-fixture' }, readSecret: async (executable) => {
      executables.push(executable);
      if (executable === '/usr/bin/security') { if (missing) throw new Error('missing'); return { stdout: '' }; }
      return { stdout: 'unexpected-fixture\n' };
    } });
    assert.equal(token, null);
    assert.deepEqual(executables, ['/usr/bin/security']);
  }
});

test('explicit read token takes precedence over Keychain', async () => {
  const token = await appHealthCredential({ env: { APP_HEALTH_READ_TOKEN: 'read-fixture' }, readSecret: async () => { throw new Error('not needed'); } });
  assert.equal(token, 'read-fixture');
});
