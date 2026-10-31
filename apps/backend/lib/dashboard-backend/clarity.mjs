import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as core from './clarity-core.mjs';
export * from './clarity-core.mjs';
const { clarityFailure: fail, clarityTokenEnvironmentKey } = core;
const REGISTRY_SCHEMA = 'fleet.clarity-registry.v2';
const CAPABILITIES_SCHEMA = 'fleet.clarity-capabilities.v1';
const JOURNEYS_SCHEMA = 'fleet.clarity-journeys.v1';
const KEYCHAIN_SERVICE = 'com.sassmaker.site-health.clarity';
const INFISICAL_ENVIRONMENT = 'dev';

const clarityFleetRoot = process.env.SITE_HEALTH_OWNER_REPOSITORY
  ? resolve(process.env.SITE_HEALTH_OWNER_REPOSITORY, '..')
  : resolve(import.meta.dirname, '../../../../../');
export const defaultClarityRegistryPath = resolve(clarityFleetRoot, 'saas-maker/tooling/config/clarity-projects.json');
export const defaultClarityCapabilitiesPath = resolve(
  clarityFleetRoot,
  'saas-maker/tooling/config/clarity-capabilities.json',
);
export const defaultClarityJourneysPath = resolve(
  clarityFleetRoot,
  'saas-maker/tooling/config/clarity-journeys.json',
);
export const defaultClarityInfisicalRoot = clarityFleetRoot;

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
  return core.createClarityRegistry(registry, capabilityPolicy, journeys);
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


export function clarityProviderAuditBindings(projectId, registry = loadClarityRegistry()) { return core.clarityProviderAuditBindings(projectId,registry); }
export function normalizeClarityProviderAudit(input,projectId,registry = loadClarityRegistry()) { return core.normalizeClarityProviderAudit(input,projectId,registry); }
export function recordClarityProviderAudit(store,projectId,input,registry = loadClarityRegistry()) { return core.recordClarityProviderAudit(store,projectId,input,registry); }
export function clarityCapabilityProjection(projectId,registry = loadClarityRegistry(),options) { return core.clarityCapabilityProjection(projectId,registry,options); }
export function clarityEligibility(projectId,registry = loadClarityRegistry()) { return core.clarityEligibility(projectId,registry); }
export function readClarityProjection(store,projectId,registry = loadClarityRegistry(),options) { return core.readClarityProjection(store,projectId,registry,options); }
