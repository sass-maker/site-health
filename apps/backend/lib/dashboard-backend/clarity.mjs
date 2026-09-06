import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const API_URL = 'https://www.clarity.ms/export-data/api/v1/project-live-insights';
const REGISTRY_SCHEMA = 'fleet.clarity-registry.v2';
const CAPABILITIES_SCHEMA = 'fleet.clarity-capabilities.v1';
const JOURNEYS_SCHEMA = 'fleet.clarity-journeys.v1';
const SNAPSHOT_SCHEMA = 'site-health.clarity-snapshot.v1';
const PROVIDER_AUDIT_SCHEMA = 'site-health.clarity-provider-audit.v2';
const KEYCHAIN_SERVICE = 'com.sassmaker.site-health.clarity';
const INFISICAL_ENVIRONMENT = 'dev';
const DAY_MS = 24 * 60 * 60 * 1000;
const PROVIDER_AUDIT_STATES = new Set([
  'blocked',
  'conditional',
  'not-applicable',
  'verified',
  'unverified',
]);
const PROVIDER_AUDIT_METHODS = new Set([
  'data-export-probe',
  'infrastructure-audit',
  'mcp-probe',
  'provider-reread',
  'source-audit',
]);
const PROVIDER_ASSERTIONS = new Set([
  'available',
  'configured',
  'enabled',
  'installed',
  'stored',
  'implemented',
  'linked',
  'validated',
]);
const PROVIDER_EXCEPTION_CODES = new Set([
  'automatic-feature-unavailable',
  'infrastructure-authorization-required',
  'no-consent-flow',
  'no-ga4-property',
  'no-stable-internal-ip',
  'not-reviewed',
  'not-supported',
  'provider-unavailable',
  'rendered-evidence-required',
]);

export const defaultClarityRegistryPath = resolve(
  import.meta.dirname,
  '../../../../../saas-maker/tooling/config/clarity-projects.json',
);
export const defaultClarityCapabilitiesPath = resolve(
  import.meta.dirname,
  '../../../../../saas-maker/tooling/config/clarity-capabilities.json',
);
export const defaultClarityJourneysPath = resolve(
  import.meta.dirname,
  '../../../../../saas-maker/tooling/config/clarity-journeys.json',
);
export const defaultClarityInfisicalRoot = resolve(import.meta.dirname, '../../../../../');

function fail(code, message, statusCode = 422) {
  throw Object.assign(new Error(message), { code, statusCode });
}

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function isIsoTimestamp(value) {
  return typeof value === 'string'
    && value.includes('T')
    && Number.isFinite(Date.parse(value));
}

function metric(raw, name) {
  return Array.isArray(raw)
    ? raw.find((item) => String(item?.metricName ?? '').toLowerCase() === name.toLowerCase())
    : null;
}

function trafficMetrics(raw) {
  const rows = metric(raw, 'Traffic')?.information;
  if (!Array.isArray(rows) || rows.length === 0) {
    return { sessions: null, botSessions: null, uniqueBrowsers: null, pagesPerSession: null };
  }
  const sessions = rows.reduce((sum, row) => sum + (finiteNumber(row?.totalSessionCount) ?? 0), 0);
  const botSessions = rows.reduce((sum, row) => sum + (finiteNumber(row?.totalBotSessionCount) ?? 0), 0);
  const uniqueBrowsers = rows.reduce(
    (sum, row) => sum + (finiteNumber(row?.distinctUserCount ?? row?.distantUserCount) ?? 0),
    0,
  );
  const weightedPages = rows.reduce((sum, row) => {
    const count = finiteNumber(row?.totalSessionCount) ?? 0;
    const pages = finiteNumber(row?.PagesPerSessionPercentage ?? row?.pagesPerSessionPercentage);
    return pages === null ? sum : sum + (pages * count);
  }, 0);
  return {
    sessions,
    botSessions,
    uniqueBrowsers,
    pagesPerSession: sessions > 0 ? Number((weightedPages / sessions).toFixed(2)) : null,
  };
}

export function claritySnapshotKey(projectId) {
  return `clarity-snapshot:${projectId}`;
}

export function clarityProviderAuditKey(projectId) {
  return `clarity-provider-audit:${projectId}`;
}

function providerJourneyDigest(journey) {
  return createHash('sha256').update(JSON.stringify(journey ?? null)).digest('hex').slice(0, 24);
}

function expectedAuditMethod(capability) {
  if (['automatic', 'provider'].includes(capability.mode)) return 'provider-reread';
  if (capability.mode === 'source') return 'source-audit';
  if (capability.mode === 'infrastructure') return 'infrastructure-audit';
  return capability.id === 'data-export' ? 'data-export-probe' : 'mcp-probe';
}

export function clarityProviderAuditBindings(projectId, registry = loadClarityRegistry()) {
  const entry = registry.get(projectId);
  if (!entry?.wired) {
    fail('CLARITY_PROVIDER_AUDIT_INELIGIBLE', 'Only wired Clarity projects can record provider evidence');
  }
  return {
    schemaVersion: PROVIDER_AUDIT_SCHEMA,
    projectId,
    providerProjectId: entry.clarityId,
    policyUpdatedAt: entry.capabilities.policyUpdatedAt,
    journeyDigest: providerJourneyDigest(entry.journey),
  };
}

export function loadClarityCapabilityPolicy(
  capabilitiesPath = defaultClarityCapabilitiesPath,
) {
  const policy = JSON.parse(readFileSync(capabilitiesPath, 'utf8'));
  if (policy?.schema !== CAPABILITIES_SCHEMA || !Array.isArray(policy.capabilities)) {
    fail('CLARITY_CAPABILITIES_INVALID', 'The canonical Clarity capability policy is invalid');
  }
  return policy;
}

export function loadClarityJourneys(journeysPath = defaultClarityJourneysPath) {
  const journeys = JSON.parse(readFileSync(journeysPath, 'utf8'));
  if (journeys?.schema !== JOURNEYS_SCHEMA || !Array.isArray(journeys.projects)) {
    fail('CLARITY_JOURNEYS_INVALID', 'The canonical Clarity journey registry is invalid');
  }
  return new Map(journeys.projects.map((project) => [project.id, project]));
}

function capabilitiesForProject(project, policy) {
  const wired = Boolean(project.clarityId && project.browserSurfaces?.length);
  return {
    schemaVersion: 'site-health.clarity-capabilities.v1',
    policyUpdatedAt: policy.updatedAt,
    state: wired ? 'desired' : 'not-applicable',
    providerState: wired ? 'unverified' : 'not-applicable',
    capabilities: policy.capabilities.map((capability) => ({
      id: capability.id,
      label: capability.label,
      mode: capability.mode,
      state: wired ? capability.defaultState : 'not-applicable',
      providerState: wired ? 'unverified' : 'not-applicable',
      ...(capability.reason ? { reason: capability.reason } : {}),
    })),
  };
}

export function loadClarityRegistry(
  registryPath = defaultClarityRegistryPath,
  capabilitiesPath = defaultClarityCapabilitiesPath,
  journeysPath = defaultClarityJourneysPath,
) {
  const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
  if (registry?.schema !== REGISTRY_SCHEMA || !Array.isArray(registry.projects)) {
    fail('CLARITY_REGISTRY_INVALID', 'The canonical Clarity registry is invalid');
  }
  const capabilityPolicy = loadClarityCapabilityPolicy(capabilitiesPath);
  const journeys = loadClarityJourneys(journeysPath);
  return new Map(registry.projects.map((project) => [project.id, {
    projectId: project.id,
    name: project.name,
    hostname: project.hostname ?? null,
    clarityId: project.clarityId ?? null,
    wired: Boolean(project.clarityId && project.browserSurfaces?.length),
    reason: project.reason ?? null,
    capabilities: capabilitiesForProject(project, capabilityPolicy),
    journey: journeys.get(project.id) ?? null,
  }]));
}

export function normalizeClarityProviderAudit(
  input,
  projectId,
  registry = loadClarityRegistry(),
) {
  const entry = registry.get(projectId);
  if (!entry?.wired) {
    fail('CLARITY_PROVIDER_AUDIT_INELIGIBLE', 'Only wired Clarity projects can record provider evidence');
  }
  if (input?.schemaVersion !== PROVIDER_AUDIT_SCHEMA) {
    fail('CLARITY_PROVIDER_AUDIT_INVALID', 'The Clarity provider audit schema is invalid');
  }
  const allowedAuditFields = new Set([
    'schemaVersion',
    'projectId',
    'providerProjectId',
    'policyUpdatedAt',
    'journeyDigest',
    'observedAt',
    'capabilities',
  ]);
  if (Object.keys(input).some((key) => !allowedAuditFields.has(key))) {
    fail('CLARITY_PROVIDER_AUDIT_INVALID', 'The Clarity provider audit contains forbidden fields');
  }
  if (input.projectId !== projectId || !isIsoTimestamp(input.observedAt)) {
    fail('CLARITY_PROVIDER_AUDIT_INVALID', 'The Clarity provider audit identity or timestamp is invalid');
  }
  const bindings = clarityProviderAuditBindings(projectId, registry);
  if (input.providerProjectId !== bindings.providerProjectId
    || input.policyUpdatedAt !== bindings.policyUpdatedAt
    || input.journeyDigest !== bindings.journeyDigest) {
    fail('CLARITY_PROVIDER_AUDIT_INVALID', 'The Clarity provider audit is stale or bound to another project');
  }
  if (!Array.isArray(input.capabilities)) {
    fail('CLARITY_PROVIDER_AUDIT_INVALID', 'The Clarity provider audit must list every capability');
  }
  const expected = entry.capabilities?.capabilities ?? [];
  const expectedIds = new Set(expected.map((capability) => capability.id));
  const seen = new Set();
  const capabilities = input.capabilities.map((capability) => {
    const allowedCapabilityFields = new Set([
      'id',
      'state',
      'method',
      'assertion',
      'rereadAt',
      'reasonCode',
    ]);
    if (!capability || Object.keys(capability).some((key) => !allowedCapabilityFields.has(key))) {
      fail('CLARITY_PROVIDER_AUDIT_INVALID', 'A Clarity capability contains forbidden fields');
    }
    if (!expectedIds.has(capability?.id) || seen.has(capability?.id)) {
      fail('CLARITY_PROVIDER_AUDIT_INVALID', 'The Clarity provider audit contains an unknown or duplicate capability');
    }
    seen.add(capability.id);
    if (!PROVIDER_AUDIT_STATES.has(capability.state)) {
      fail('CLARITY_PROVIDER_AUDIT_INVALID', 'The Clarity provider audit contains an unsupported state');
    }
    const definition = expected.find((item) => item.id === capability.id);
    if (!PROVIDER_AUDIT_METHODS.has(capability.method)
      || capability.method !== expectedAuditMethod(definition)) {
      fail('CLARITY_PROVIDER_AUDIT_INVALID', 'The Clarity provider audit uses an invalid evidence method');
    }
    if (capability.state === 'verified'
      && (!PROVIDER_ASSERTIONS.has(capability.assertion)
        || (capability.method === 'provider-reread' && !isIsoTimestamp(capability.rereadAt)))) {
      fail(
        'CLARITY_PROVIDER_AUDIT_INVALID',
        'Verified capabilities require a bounded assertion and provider rereads require a timestamp',
      );
    }
    if (capability.rereadAt
      && Date.parse(capability.rereadAt) > Date.parse(input.observedAt)) {
      fail('CLARITY_PROVIDER_AUDIT_INVALID', 'A setting cannot be reread after the audit timestamp');
    }
    if (capability.state !== 'verified' && !PROVIDER_EXCEPTION_CODES.has(capability.reasonCode)) {
      fail('CLARITY_PROVIDER_AUDIT_INVALID', 'Provider exceptions require an allowlisted reason code');
    }
    return {
      id: capability.id,
      state: capability.state,
      method: capability.method,
      ...(capability.assertion ? { assertion: capability.assertion } : {}),
      ...(capability.rereadAt ? { rereadAt: capability.rereadAt } : {}),
      ...(capability.reasonCode ? { reasonCode: capability.reasonCode } : {}),
    };
  });
  if (seen.size !== expectedIds.size) {
    fail('CLARITY_PROVIDER_AUDIT_INVALID', 'The Clarity provider audit is incomplete');
  }
  return {
    ...bindings,
    observedAt: input.observedAt,
    capabilities,
  };
}

export function recordClarityProviderAudit(
  store,
  projectId,
  input,
  registry = loadClarityRegistry(),
) {
  const audit = normalizeClarityProviderAudit(input, projectId, registry);
  store.setMetadata(clarityProviderAuditKey(projectId), audit, { now: audit.observedAt });
  return audit;
}

export function readClarityProviderAudit(store, projectId) {
  return store.getMetadata(clarityProviderAuditKey(projectId))?.value ?? null;
}

export function clarityCapabilityProjection(
  projectId,
  registry = loadClarityRegistry(),
  { providerAudit = null } = {},
) {
  const entry = registry.get(projectId);
  if (!entry) {
    return {
      schemaVersion: 'site-health.clarity-capabilities.v1',
      state: 'unavailable',
      providerState: 'unverified',
      capabilities: [],
      journey: null,
      summary: { desired: 0, conditional: 0, blocked: 0, notApplicable: 0, providerVerified: 0 },
    };
  }
  const capabilities = entry.capabilities ?? {
    schemaVersion: 'site-health.clarity-capabilities.v1',
    state: entry.wired ? 'desired' : 'not-applicable',
    providerState: entry.wired ? 'unverified' : 'not-applicable',
    capabilities: [],
  };
  const observed = new Map(
    (providerAudit?.projectId === projectId ? providerAudit.capabilities : [])
      ?.map((capability) => [capability.id, capability]) ?? [],
  );
  const projectedCapabilities = capabilities.capabilities.map((capability) => {
    const audit = observed.get(capability.id);
    const providerState = audit?.state === 'verified' && audit.method === 'provider-reread'
      ? 'provider-verified'
      : audit?.state ?? capability.providerState;
    return {
      ...capability,
      providerState,
      ...(audit?.method ? { verificationMethod: audit.method } : {}),
      ...(audit?.assertion ? { assertion: audit.assertion } : {}),
      ...(audit?.rereadAt ? { rereadAt: audit.rereadAt } : {}),
      ...(audit?.reasonCode ? { providerReasonCode: audit.reasonCode } : {}),
    };
  });
  const providerAccounted = providerAudit
    ? projectedCapabilities.filter((item) => item.providerState !== 'unverified').length
    : 0;
  const providerVerified = projectedCapabilities.filter(
    (item) => item.providerState === 'provider-verified',
  ).length;
  const providerSettings = projectedCapabilities.filter(
    (item) => ['automatic', 'provider'].includes(item.mode),
  );
  const providerSettingsVerified = providerSettings.length > 0
    && providerSettings.every((item) => item.providerState === 'provider-verified');
  return {
    ...capabilities,
    providerState: providerAudit && providerSettingsVerified
      ? 'provider-verified'
      : providerAudit && providerAccounted === projectedCapabilities.length
        ? 'provider-audited'
        : providerAudit && providerVerified > 0
          ? 'partially-verified'
        : capabilities.providerState,
    ...(providerAudit?.observedAt ? { providerObservedAt: providerAudit.observedAt } : {}),
    capabilities: projectedCapabilities,
    journey: entry.journey ?? null,
    journeyState: entry.wired ? entry.journey?.state ?? 'not-configured' : 'not-applicable',
    summary: {
      desired: capabilities.capabilities.filter((item) => item.state === 'desired').length,
      conditional: capabilities.capabilities.filter((item) => item.state === 'conditional').length,
      blocked: capabilities.capabilities.filter((item) => item.state === 'blocked').length,
      notApplicable: capabilities.capabilities.filter((item) => item.state === 'not-applicable').length,
      providerVerified,
      providerAccounted,
      accountingState: providerAudit && providerAccounted === projectedCapabilities.length
        ? 'complete'
        : 'partial',
    },
  };
}

export function clarityEligibility(projectId, registry = loadClarityRegistry()) {
  const entry = registry.get(projectId);
  if (!entry) {
    return {
      eligible: false,
      hostname: null,
      reason: 'No canonical Clarity project receipt exists for this product.',
    };
  }
  return {
    eligible: entry.wired,
    hostname: entry.hostname,
    reason: entry.wired
      ? 'The canonical receipt verifies a Clarity-instrumented public surface.'
      : entry.reason ?? 'A Clarity project exists, but its public surface is not wired.',
  };
}

export function clarityTokenEnvironmentKey(projectId) {
  return `CLARITY_API_TOKEN_${String(projectId)
    .replace(/[^a-z0-9]/gi, '_')
    .toUpperCase()}`;
}

export function resolveClarityToken(projectId, {
  env = process.env,
  platform = process.platform,
  readInfisical = execFileSync,
  readKeychain = execFileSync,
  infisicalRoot = defaultClarityInfisicalRoot,
} = {}) {
  const projectEnvironmentKey = clarityTokenEnvironmentKey(projectId);
  const environmentToken = env[projectEnvironmentKey];
  if (environmentToken) return String(environmentToken).trim();
  try {
    const infisicalToken = String(readInfisical('infisical', [
      'secrets', 'get', projectEnvironmentKey,
      '--plain',
      '--env', INFISICAL_ENVIRONMENT,
      '--path', '/',
      '--silent',
    ], {
      cwd: infisicalRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })).trim();
    if (infisicalToken) return infisicalToken;
  } catch {
    // Existing Keychain storage remains a private offline fallback.
  }
  if (platform !== 'darwin') return null;
  try {
    return String(readKeychain('/usr/bin/security', [
      'find-generic-password',
      '-s', KEYCHAIN_SERVICE,
      '-a', String(projectId),
      '-w',
    ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })).trim() || null;
  } catch {
    return null;
  }
}

export function storeClarityTokenInInfisical(projectId, token, {
  writeInfisical = execFileSync,
  infisicalRoot = defaultClarityInfisicalRoot,
} = {}) {
  const normalizedProjectId = String(projectId ?? '').trim();
  const normalizedToken = String(token ?? '').trim();
  if (!normalizedProjectId || !normalizedToken) {
    fail('CLARITY_TOKEN_INVALID', 'A project ID and non-empty Clarity token are required');
  }
  const secretName = clarityTokenEnvironmentKey(normalizedProjectId);
  writeInfisical('infisical', [
    'secrets', 'set',
    '--file', '/dev/stdin',
    '--env', INFISICAL_ENVIRONMENT,
    '--path', '/',
    '--silent',
  ], {
    cwd: infisicalRoot,
    encoding: 'utf8',
    input: `${secretName}=${normalizedToken}\n`,
    stdio: ['pipe', 'ignore', 'ignore'],
  });
  return {
    projectId: normalizedProjectId,
    stored: true,
    provider: 'infisical',
    environment: INFISICAL_ENVIRONMENT,
  };
}

export function storeClarityToken(projectId, token, {
  platform = process.platform,
  writeKeychain = execFileSync,
} = {}) {
  const normalizedProjectId = String(projectId ?? '').trim();
  const normalizedToken = String(token ?? '').trim();
  if (!normalizedProjectId || !normalizedToken) {
    fail('CLARITY_TOKEN_INVALID', 'A project ID and non-empty Clarity token are required');
  }
  if (platform !== 'darwin') {
    fail('CLARITY_KEYCHAIN_UNAVAILABLE', 'Clarity token storage requires macOS Keychain', 503);
  }
  writeKeychain('/usr/bin/security', [
    'add-generic-password',
    '-U',
    '-s', KEYCHAIN_SERVICE,
    '-a', normalizedProjectId,
    '-w',
  ], {
    encoding: 'utf8',
    input: `${normalizedToken}\n`,
    stdio: ['pipe', 'ignore', 'ignore'],
  });
  return {
    projectId: normalizedProjectId,
    stored: true,
    service: KEYCHAIN_SERVICE,
  };
}

export function promptAndStoreClarityToken(projectId, {
  interactive = Boolean(process.stdin.isTTY),
  platform = process.platform,
  writeKeychain = execFileSync,
} = {}) {
  const normalizedProjectId = String(projectId ?? '').trim();
  if (!normalizedProjectId) {
    fail('CLARITY_TOKEN_INVALID', 'A project ID is required');
  }
  if (platform !== 'darwin') {
    fail('CLARITY_KEYCHAIN_UNAVAILABLE', 'Clarity token storage requires macOS Keychain', 503);
  }
  if (!interactive) {
    fail('CLARITY_KEYCHAIN_TTY_REQUIRED', 'Clarity token storage requires an interactive hidden prompt');
  }
  writeKeychain('/usr/bin/security', [
    'add-generic-password',
    '-U',
    '-s', KEYCHAIN_SERVICE,
    '-a', normalizedProjectId,
    '-w',
  ], { stdio: ['inherit', 'ignore', 'inherit'] });
  return {
    projectId: normalizedProjectId,
    stored: true,
    service: KEYCHAIN_SERVICE,
  };
}

export function normalizeClarityExport(raw, {
  projectId,
  days = 1,
  observedAt = new Date().toISOString(),
} = {}) {
  if (!Array.isArray(raw)) fail('CLARITY_RESPONSE_INVALID', 'Clarity returned an invalid export');
  return {
    schemaVersion: SNAPSHOT_SCHEMA,
    projectId: String(projectId),
    state: 'verified',
    observedAt,
    period: { days },
    metrics: trafficMetrics(raw),
    provenance: 'provider',
  };
}

export async function fetchClaritySnapshot({
  token,
  projectId,
  days = 1,
  fetchImpl = fetch,
  now = () => new Date().toISOString(),
  timeoutMs = 20_000,
} = {}) {
  const normalizedDays = Number(days);
  if (![1, 2, 3].includes(normalizedDays)) {
    fail('CLARITY_RANGE_INVALID', 'Clarity exports are limited to the previous 1, 2, or 3 days');
  }
  if (!token) fail('CLARITY_TOKEN_REQUIRED', 'No Clarity Data Export token is configured');
  const url = new URL(API_URL);
  url.searchParams.set('numOfDays', String(normalizedDays));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let response;
  try {
    response = await fetchImpl(url, {
      headers: { accept: 'application/json', authorization: `Bearer ${token}` },
      signal: controller.signal,
    });
  } catch {
    if (controller.signal.aborted) {
      fail('CLARITY_PROVIDER_TIMEOUT', 'Clarity did not respond before the bounded timeout', 504);
    }
    fail('CLARITY_PROVIDER_UNAVAILABLE', 'Clarity could not be reached', 503);
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok) {
    if ([401, 403].includes(response.status)) {
      fail('CLARITY_UNAUTHORIZED', 'Clarity rejected the configured Data Export token', 502);
    }
    if (response.status === 429) {
      fail('CLARITY_RATE_LIMITED', 'Clarity has reached its project export limit', 429);
    }
    fail('CLARITY_PROVIDER_ERROR', 'Clarity could not provide project traffic evidence', 502);
  }
  let raw;
  try {
    raw = await response.json();
  } catch {
    fail('CLARITY_RESPONSE_INVALID', 'Clarity returned an invalid export', 502);
  }
  return normalizeClarityExport(raw, {
    projectId,
    days: normalizedDays,
    observedAt: now(),
  });
}

export function readClarityProjection(
  store,
  projectId,
  registry = loadClarityRegistry(),
  { now = new Date().toISOString() } = {},
) {
  const eligibility = clarityEligibility(projectId, registry);
  const snapshot = store.getMetadata(claritySnapshotKey(projectId))?.value ?? null;
  const receipt = store.getMetadata(`evidence-refresh:clarity:${projectId}`)?.value ?? null;
  const providerAudit = readClarityProviderAudit(store, projectId);
  const snapshotExpired = snapshot?.observedAt
    ? Date.parse(now) > Date.parse(snapshot.observedAt) + DAY_MS
    : true;
  let state = snapshot
    ? snapshotExpired ? 'stale' : 'fresh'
    : eligibility.eligible ? 'not-measured' : 'unavailable';
  const receiptIsLatest = !snapshot?.observedAt
    || !receipt?.lastAttemptAt
    || Date.parse(receipt.lastAttemptAt) >= Date.parse(snapshot.observedAt);
  if (receipt?.state === 'running' && receiptIsLatest) state = 'refreshing';
  if (['failed', 'unavailable'].includes(receipt?.state) && receiptIsLatest) state = receipt.state;
  return {
    schemaVersion: 'site-health.clarity-projection.v1',
    projectId,
    state,
    eligibility,
    capabilities: clarityCapabilityProjection(projectId, registry, { providerAudit }),
    snapshot,
    lastAttemptAt: receipt?.lastAttemptAt ?? null,
    lastSuccessAt: receipt?.lastSuccessAt ?? snapshot?.observedAt ?? null,
    failure: ['failed', 'unavailable'].includes(state) ? receipt?.failure ?? null : null,
  };
}
