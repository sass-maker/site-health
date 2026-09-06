import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  clarityCapabilityProjection,
  clarityEligibility,
  clarityProviderAuditBindings,
  fetchClaritySnapshot,
  loadClarityRegistry,
  normalizeClarityExport,
  promptAndStoreClarityToken,
  readClarityProjection,
  readClarityProviderAudit,
  recordClarityProviderAudit,
  resolveClarityToken,
  storeClarityToken,
  storeClarityTokenInInfisical,
} from '../lib/dashboard-backend/clarity.mjs';
import { runClarityCollector } from '../scripts/clarity-collect.mjs';

function registry() {
  return new Map([
    ['wired', { projectId: 'wired', wired: true, hostname: 'example.com' }],
    ['unwired', { projectId: 'unwired', wired: false, hostname: 'private.example', reason: 'Privacy boundary.' }],
  ]);
}

test('loads the canonical receipt and distinguishes wired surfaces', () => {
  const directory = mkdtempSync(join(tmpdir(), 'clarity-registry-'));
  const path = join(directory, 'clarity-projects.json');
  writeFileSync(path, JSON.stringify({
    schema: 'fleet.clarity-registry.v2',
    projects: [
      {
        id: 'wired',
        clarityId: 'public-id',
        hostname: 'example.com',
        browserSurfaces: [{ kind: 'combined', file: 'layout.tsx' }],
      },
      {
        id: 'unwired',
        clarityId: 'other-id',
        hostname: 'private.example',
        browserSurfaces: [],
        reason: 'Privacy boundary.',
      },
    ],
  }));
  const capabilitiesPath = join(directory, 'clarity-capabilities.json');
  writeFileSync(capabilitiesPath, JSON.stringify({
    schema: 'fleet.clarity-capabilities.v1',
    updatedAt: '2026-09-06',
    capabilities: [
      { id: 'recordings', label: 'Recordings', mode: 'automatic', defaultState: 'desired' },
      { id: 'ga4', label: 'GA4 link', mode: 'provider', defaultState: 'conditional', reason: 'no-ga4-property' },
      { id: 'ai-bot-activity', label: 'AI Bot Activity', mode: 'infrastructure', defaultState: 'blocked' },
    ],
  }));
  const journeysPath = join(directory, 'clarity-journeys.json');
  writeFileSync(journeysPath, JSON.stringify({
    schema: 'fleet.clarity-journeys.v1',
    projects: [],
  }));
  const loaded = loadClarityRegistry(path, capabilitiesPath, journeysPath);
  assert.equal(clarityEligibility('wired', loaded).eligible, true);
  assert.deepEqual(clarityEligibility('unwired', loaded), {
    eligible: false,
    hostname: 'private.example',
    reason: 'Privacy boundary.',
  });
  const wiredCapabilities = clarityCapabilityProjection('wired', loaded);
  assert.equal(wiredCapabilities.state, 'desired');
  assert.equal(wiredCapabilities.providerState, 'unverified');
  assert.equal(wiredCapabilities.summary.desired, 1);
  assert.equal(wiredCapabilities.summary.conditional, 1);
  assert.equal(wiredCapabilities.summary.blocked, 1);
  assert.equal(wiredCapabilities.journeyState, 'not-configured');

  const unwiredCapabilities = clarityCapabilityProjection('unwired', loaded);
  assert.equal(unwiredCapabilities.state, 'not-applicable');
  assert.equal(unwiredCapabilities.summary.notApplicable, 3);
  assert.equal(unwiredCapabilities.journeyState, 'not-applicable');
});

test('uses project-specific tokens without allowing a shared fleet fallback', () => {
  let infisicalRead = false;
  let keychainRead = false;
  assert.equal(resolveClarityToken('code-vetter', {
    env: {
      CLARITY_API_TOKEN_CODE_VETTER: 'project-token',
      CLARITY_API_TOKEN: 'shared-token',
    },
    readInfisical() {
      infisicalRead = true;
    },
    readKeychain() {
      keychainRead = true;
    },
  }), 'project-token');
  assert.equal(infisicalRead, false);
  assert.equal(keychainRead, false);

  assert.equal(resolveClarityToken('code-vetter', {
    env: { CLARITY_API_TOKEN: 'shared-token' },
    readInfisical(command, args, options) {
      infisicalRead = true;
      assert.equal(command, 'infisical');
      assert.deepEqual(args.slice(0, 3), ['secrets', 'get', 'CLARITY_API_TOKEN_CODE_VETTER']);
      assert.equal(options.stdio[1], 'pipe');
      return 'infisical-token';
    },
    readKeychain(command, args) {
      keychainRead = true;
      assert.equal(command, '/usr/bin/security');
      assert.deepEqual(args.slice(-3), ['-a', 'code-vetter', '-w']);
      return 'keychain-token';
    },
  }), 'infisical-token');
  assert.equal(infisicalRead, true);
  assert.equal(keychainRead, false);

  assert.equal(resolveClarityToken('code-vetter', {
    env: {},
    platform: 'darwin',
    readInfisical() {
      throw new Error('not signed in');
    },
    readKeychain() {
      keychainRead = true;
      return 'keychain-token';
    },
  }), 'keychain-token');
  assert.equal(keychainRead, true);

  // The Keychain fallback is macOS-only; elsewhere the resolver reports nothing
  // rather than reaching for a shared token.
  assert.equal(resolveClarityToken('code-vetter', {
    env: {},
    platform: 'linux',
    readInfisical() {
      throw new Error('not signed in');
    },
    readKeychain() {
      throw new Error('the Keychain must not be consulted off macOS');
    },
  }), null);
});

test('stores project tokens in Infisical through stdin without argv, environment, or file exposure', () => {
  let invocation;
  const result = storeClarityTokenInInfisical('code-vetter', 'private-test-token', {
    infisicalRoot: '/fleet',
    writeInfisical(command, args, options) {
      invocation = { command, args, options };
    },
  });
  assert.deepEqual(result, {
    projectId: 'code-vetter',
    stored: true,
    provider: 'infisical',
    environment: 'dev',
  });
  assert.equal(invocation.command, 'infisical');
  assert.equal(invocation.args.includes('private-test-token'), false);
  assert.deepEqual(invocation.args.slice(0, 4), ['secrets', 'set', '--file', '/dev/stdin']);
  assert.equal(invocation.options.cwd, '/fleet');
  assert.equal(invocation.options.input, 'CLARITY_API_TOKEN_CODE_VETTER=private-test-token\n');
  assert.equal('env' in invocation.options, false);
  assert.deepEqual(invocation.options.stdio, ['pipe', 'ignore', 'ignore']);
});

test('stores project tokens through Keychain stdin without argv or environment exposure', () => {
  let invocation;
  const result = storeClarityToken('code-vetter', 'private-test-token', {
    platform: 'darwin',
    writeKeychain(command, args, options) {
      invocation = { command, args, options };
    },
  });
  assert.deepEqual(result, {
    projectId: 'code-vetter',
    stored: true,
    service: 'com.sassmaker.site-health.clarity',
  });
  assert.equal(invocation.command, '/usr/bin/security');
  assert.equal(invocation.args.at(-1), '-w');
  assert.equal(invocation.args.includes('private-test-token'), false);
  assert.equal(invocation.options.input, 'private-test-token\n');
  assert.equal('env' in invocation.options, false);
});

test('offers a native hidden Keychain prompt with no token argument', () => {
  let invocation;
  promptAndStoreClarityToken('code-vetter', {
    interactive: true,
    platform: 'darwin',
    writeKeychain(command, args, options) {
      invocation = { command, args, options };
    },
  });
  assert.equal(invocation.command, '/usr/bin/security');
  assert.equal(invocation.args.at(-1), '-w');
  assert.equal(invocation.args.includes('-A'), false);
  assert.equal(invocation.args.includes('-T'), false);
  assert.deepEqual(invocation.options.stdio, ['inherit', 'ignore', 'inherit']);
});

test('records only bounded provider-reread evidence and projects verified totals', () => {
  const metadata = new Map();
  const store = {
    getMetadata(key) {
      return metadata.has(key) ? { value: metadata.get(key) } : null;
    },
    setMetadata(key, value) {
      metadata.set(key, value);
    },
  };
  const capabilities = {
    schemaVersion: 'site-health.clarity-capabilities.v1',
    state: 'desired',
    providerState: 'unverified',
    capabilities: [
      { id: 'masking', mode: 'provider', state: 'desired', providerState: 'unverified' },
      { id: 'ga4', mode: 'provider', state: 'conditional', providerState: 'unverified' },
      { id: 'data-export', mode: 'operator', state: 'desired', providerState: 'unverified' },
    ],
  };
  const providerRegistry = new Map([
    ['wired', {
      projectId: 'wired',
      clarityId: 'provider-id',
      wired: true,
      capabilities: { ...capabilities, policyUpdatedAt: '2026-09-01' },
      journey: null,
    }],
  ]);
  const observedAt = '2026-09-01T09:00:00.000Z';
  const receipt = {
    ...clarityProviderAuditBindings('wired', providerRegistry),
    observedAt,
    capabilities: [
      {
        id: 'masking',
        state: 'verified',
        method: 'provider-reread',
        assertion: 'configured',
        rereadAt: observedAt,
      },
      {
        id: 'ga4',
        state: 'not-applicable',
        method: 'provider-reread',
        reasonCode: 'no-ga4-property',
      },
      {
        id: 'data-export',
        state: 'verified',
        method: 'data-export-probe',
        assertion: 'validated',
      },
    ],
  };
  assert.throws(
    () => recordClarityProviderAudit(store, 'wired', {
      ...receipt,
      rawProviderPayload: { should: 'be rejected' },
    }, providerRegistry),
    { code: 'CLARITY_PROVIDER_AUDIT_INVALID' },
  );
  recordClarityProviderAudit(store, 'wired', receipt, providerRegistry);
  const audit = readClarityProviderAudit(store, 'wired');
  assert.equal(JSON.stringify(audit).includes('rawProviderPayload'), false);
  const projection = clarityCapabilityProjection('wired', providerRegistry, {
    providerAudit: audit,
  });
  assert.equal(projection.providerState, 'provider-audited');
  assert.equal(projection.providerObservedAt, observedAt);
  assert.equal(projection.summary.providerVerified, 1);
  assert.equal(projection.summary.providerAccounted, 3);
  assert.equal(projection.capabilities[1].providerState, 'not-applicable');
});

test('normalizes only bounded traffic fields and labels browser identities honestly', () => {
  const snapshot = normalizeClarityExport([
    {
      metricName: 'Traffic',
      information: [{
        totalSessionCount: '12',
        totalBotSessionCount: '2',
        distantUserCount: '9',
        PagesPerSessionPercentage: 1.75,
        secretRawField: 'discard me',
      }],
    },
    { metricName: 'Popular Pages', information: [{ url: '/private' }] },
  ], {
    projectId: 'wired',
    observedAt: '2026-09-01T08:00:00.000Z',
  });
  assert.deepEqual(snapshot.metrics, {
    sessions: 12,
    botSessions: 2,
    uniqueBrowsers: 9,
    pagesPerSession: 1.75,
  });
  assert.equal(JSON.stringify(snapshot).includes('secretRawField'), false);
  assert.equal(JSON.stringify(snapshot).includes('/private'), false);
  assert.equal(JSON.stringify(snapshot).includes('clarityId'), false);
});

test('fetches the documented one-day export and sanitizes provider failures', async () => {
  let request;
  const snapshot = await fetchClaritySnapshot({
    token: 'do-not-persist',
    projectId: 'wired',
    fetchImpl: async (url, options) => {
      request = { url: String(url), options };
      return new Response(JSON.stringify([{ metricName: 'Traffic', information: [] }]), { status: 200 });
    },
    now: () => '2026-09-01T08:00:00.000Z',
  });
  assert.equal(new URL(request.url).searchParams.get('numOfDays'), '1');
  assert.equal(request.options.headers.authorization, 'Bearer do-not-persist');
  assert.equal(JSON.stringify(snapshot).includes('do-not-persist'), false);

  await assert.rejects(
    fetchClaritySnapshot({
      token: 'bad-token',
      projectId: 'wired',
      fetchImpl: async () => new Response('provider detail', { status: 401 }),
    }),
    (error) => error.code === 'CLARITY_UNAUTHORIZED'
      && !error.message.includes('bad-token')
      && !error.message.includes('provider detail'),
  );

  await assert.rejects(
    fetchClaritySnapshot({
      token: 'timeout-token',
      projectId: 'wired',
      timeoutMs: 1,
      fetchImpl: async (url, options) => new Promise((resolve, reject) => {
        options.signal.addEventListener('abort', () => reject(new Error('aborted')));
      }),
    }),
    (error) => error.code === 'CLARITY_PROVIDER_TIMEOUT'
      && !error.message.includes('timeout-token'),
  );
});

test('collector refuses unwired projects and persists only the sanitized snapshot', async () => {
  const metadata = new Map();
  const store = {
    getMetadata(key) {
      return metadata.has(key) ? { value: metadata.get(key) } : null;
    },
    setMetadata(key, value) {
      metadata.set(key, value);
    },
  };
  const projects = [
    { id: 'wired', publicListing: 'maintained', lifecycle: 'maintained' },
    { id: 'unwired', publicListing: 'maintained', lifecycle: 'maintained' },
  ];
  await assert.rejects(
    runClarityCollector({ command: 'fetch', projectId: 'unwired', projects, registry: registry(), store }),
    { code: 'CLARITY_PROJECT_UNWIRED' },
  );
  const result = await runClarityCollector({
    command: 'fetch',
    projectId: 'wired',
    projects,
    registry: registry(),
    store,
    tokenResolver: () => 'transient-token',
    snapshotFetcher: async () => ({
      schemaVersion: 'site-health.clarity-snapshot.v1',
      projectId: 'wired',
      observedAt: '2026-09-01T08:00:00.000Z',
      metrics: { sessions: 4 },
    }),
  });
  assert.equal(result.metrics.sessions, 4);
  assert.equal(JSON.stringify([...metadata.values()]).includes('transient-token'), false);
  assert.equal(metadata.get('evidence-refresh:clarity:wired').state, 'succeeded');

  metadata.set('evidence-refresh:clarity:wired', {
    state: 'failed',
    lastAttemptAt: '2026-09-01T07:00:00.000Z',
    failure: { code: 'CLARITY_PROVIDER_ERROR', message: 'Older failure.' },
  });
  const projection = readClarityProjection(store, 'wired', registry(), {
    now: '2026-09-01T09:00:00.000Z',
  });
  assert.equal(projection.state, 'fresh');
  assert.equal(projection.failure, null);
});

test('fleet status accounts for every identity without resolving tokens or calling Clarity', async () => {
  const metadata = new Map();
  const store = {
    getMetadata(key) {
      return metadata.has(key) ? { value: metadata.get(key) } : null;
    },
    setMetadata(key, value) {
      metadata.set(key, value);
    },
  };
  let tokens = 0;
  let requests = 0;
  const result = await runClarityCollector({
    command: 'status-all',
    projects: [
      { id: 'wired', publicListing: 'maintained', lifecycle: 'maintained' },
      { id: 'unwired', publicListing: 'maintained', lifecycle: 'maintained' },
    ],
    registry: registry(),
    store,
    tokenResolver() {
      tokens += 1;
    },
    snapshotFetcher() {
      requests += 1;
    },
    now: () => '2026-09-01T08:00:00.000Z',
  });
  assert.equal(result.projects, 2);
  assert.equal(result.counts['not-measured'], 1);
  assert.equal(result.counts.unwired, 1);
  assert.deepEqual(result.capabilityCounts, {
    desired: 0,
    conditional: 0,
    blocked: 0,
    notApplicable: 0,
    providerVerified: 0,
    providerAccounted: 0,
  });
  assert.equal(tokens, 0);
  assert.equal(requests, 0);
});

test('fleet refresh skips exclusions, continues failures, and never emits tokens', async () => {
  const metadata = new Map();
  const store = {
    getMetadata(key) {
      return metadata.has(key) ? { value: metadata.get(key) } : null;
    },
    setMetadata(key, value) {
      metadata.set(key, value);
    },
  };
  const projects = [
    { id: 'measured', publicListing: 'maintained', lifecycle: 'maintained' },
    { id: 'missing-token', publicListing: 'maintained', lifecycle: 'maintained' },
    { id: 'provider-failure', publicListing: 'maintained', lifecycle: 'maintained' },
    { id: 'unwired', publicListing: 'maintained', lifecycle: 'maintained' },
    { id: 'inactive', publicListing: 'past', lifecycle: 'past', portfolioStatus: 'archived' },
  ];
  const fleetRegistry = new Map(projects.map((project) => [project.id, {
    projectId: project.id,
    wired: project.id !== 'unwired',
    hostname: `${project.id}.example`,
    reason: project.id === 'unwired' ? 'Intentional privacy boundary.' : null,
  }]));
  const requested = [];
  const result = await runClarityCollector({
    command: 'fetch-all',
    days: 1,
    projects,
    registry: fleetRegistry,
    store,
    tokenResolver: (projectId) => projectId === 'missing-token' ? null : `private-${projectId}`,
    snapshotFetcher: async ({ token, projectId }) => {
      requested.push(projectId);
      if (projectId === 'provider-failure') {
        throw Object.assign(new Error(`provider leaked ${token}`), { code: 'CLARITY_UNAUTHORIZED' });
      }
      return {
        schemaVersion: 'site-health.clarity-snapshot.v1',
        projectId,
        observedAt: '2026-09-01T08:00:00.000Z',
        metrics: { sessions: 6 },
      };
    },
    now: () => '2026-09-01T08:00:00.000Z',
  });
  assert.deepEqual(requested, ['measured', 'provider-failure']);
  assert.deepEqual(result.counts, {
    measured: 1,
    unavailable: 1,
    failed: 1,
    unwired: 1,
    inactive: 1,
  });
  assert.equal(JSON.stringify(result).includes('private-'), false);
  assert.equal(JSON.stringify(result).includes('provider leaked'), false);
  assert.equal(metadata.get('clarity-snapshot:measured').metrics.sessions, 6);
});

test('fleet refresh can reuse an exact-range fresh pilot without a second provider request', async () => {
  const metadata = new Map([
    ['clarity-snapshot:pilot', {
      schemaVersion: 'site-health.clarity-snapshot.v1',
      projectId: 'pilot',
      state: 'verified',
      observedAt: '2026-09-01T08:00:00.000Z',
      period: { days: 1 },
      metrics: { sessions: 2, uniqueBrowsers: 1, pagesPerSession: 2 },
      provenance: 'provider',
    }],
  ]);
  const store = {
    getMetadata(key) {
      return metadata.has(key) ? { value: metadata.get(key) } : null;
    },
    setMetadata(key, value) {
      metadata.set(key, value);
    },
  };
  const projects = [
    { id: 'pilot', publicListing: 'maintained', lifecycle: 'maintained' },
    { id: 'other', publicListing: 'maintained', lifecycle: 'maintained' },
  ];
  const fleetRegistry = new Map(projects.map((project) => [project.id, {
    projectId: project.id,
    wired: true,
    hostname: `${project.id}.example`,
  }]));
  const requested = [];
  const result = await runClarityCollector({
    command: 'fetch-all',
    days: 1,
    projects,
    registry: fleetRegistry,
    store,
    reuseProjectIds: ['pilot'],
    tokenResolver: (projectId) => `private-${projectId}`,
    snapshotFetcher: async ({ projectId }) => {
      requested.push(projectId);
      return {
        schemaVersion: 'site-health.clarity-snapshot.v1',
        projectId,
        state: 'verified',
        observedAt: '2026-09-01T08:00:00.000Z',
        period: { days: 1 },
        metrics: { sessions: 3 },
        provenance: 'provider',
      };
    },
    now: () => '2026-09-01T09:00:00.000Z',
  });
  assert.deepEqual(requested, ['other']);
  assert.deepEqual(result.counts, { measured: 2 });
  assert.equal(result.results.find((item) => item.projectId === 'pilot').reusedFreshSnapshot, true);
});
