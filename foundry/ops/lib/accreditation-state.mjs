import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import {
  ARTICLE_SYNDICATION,
  DIRECTORY_SUBMISSIONS_DIR,
  loadCuratedDirectories,
  loadLongTailSeeds,
  PROTECTED_CHANNELS,
} from './channel-registry.mjs';

export const ACCREDITATION_STATE_SCHEMA = 'fleet.platform-accreditation-state.v1';
export const ACCREDITATION_EVIDENCE_SCHEMA = 'fleet.platform-accreditation-evidence.v1';

export const ACCREDITATION_STATES = [
  'seed',
  'verified',
  'accredited',
  'rejected',
  'queued',
  'live',
  'detected',
  'indexable',
  'blocked',
];

const OUTCOMES = ['confirmed', 'indeterminate'];
const DEFAULT_STALENESS_DAYS = 30;
export const TRANSITION_HISTORY_LIMIT = 10;
const EVIDENCE_REQUIRED_STATES = new Set(['live', 'detected', 'indexable']);
const PROTECTED_PLATFORM_IDS = PROTECTED_CHANNELS.map((channel) => channel.id);
export const ACCREDITATION_STATE_PATH = resolve(
  DIRECTORY_SUBMISSIONS_DIR,
  'accreditation-state.json',
);

// Monotonic forward transitions plus the documented resolution paths:
// blocked -> accredited (enablement resolved), rejected -> verified (owner
// override), and the post-submission chain live -> detected -> indexable.
// `accredited -> accredited` is the re-verification refresh for stale entries.
const ALLOWED_TRANSITIONS = new Map([
  ['seed', ['verified', 'rejected', 'blocked']],
  ['verified', ['accredited', 'rejected', 'blocked']],
  ['accredited', ['accredited', 'queued', 'blocked']],
  ['queued', ['live', 'blocked']],
  ['live', ['detected', 'indexable', 'blocked']],
  ['detected', ['indexable', 'blocked']],
  ['indexable', []],
  ['rejected', ['verified']],
  ['blocked', ['accredited', 'rejected']],
]);

const CRAWLABLE_REDIRECTS = new Set([301, 308]);
const STATE_SET = new Set(ACCREDITATION_STATES);
const OUTCOME_SET = new Set(OUTCOMES);
const DAY_MS = 86_400_000;

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeEvidence(input = {}) {
  const evidence = isRecord(input) ? input : {};
  return {
    liveUrl: typeof evidence.liveUrl === 'string' && evidence.liveUrl ? evidence.liveUrl : null,
    httpStatus: Number.isInteger(evidence.httpStatus) ? evidence.httpStatus : null,
    finalStatus: Number.isInteger(evidence.finalStatus) ? evidence.finalStatus : null,
    formDetected: evidence.formDetected ?? null,
    captchaDetected: evidence.captchaDetected ?? null,
    signinRequired: evidence.signinRequired ?? null,
    paymentRequired: evidence.paymentRequired ?? null,
    screenshotPath: evidence.screenshotPath ?? null,
  };
}

function crawlable(evidence) {
  if (evidence.httpStatus === 200) return true;
  return CRAWLABLE_REDIRECTS.has(evidence.httpStatus) && evidence.finalStatus === 200;
}

export function validateEvidence(evidence, toState) {
  const issues = [];
  const normalized = normalizeEvidence(evidence);
  if (EVIDENCE_REQUIRED_STATES.has(toState)) {
    if (!normalized.liveUrl) issues.push(`${toState} requires evidence.liveUrl`);
    if (normalized.httpStatus === null) issues.push(`${toState} requires evidence.httpStatus`);
  }
  if (toState === 'indexable' && normalized.liveUrl && !crawlable(normalized)) {
    issues.push('indexable requires a crawlable status (200, or 301/308 with finalStatus 200)');
  }
  return { ok: issues.length === 0, issues, evidence: normalized };
}

function canTransition(fromState, toState) {
  if (!STATE_SET.has(fromState)) return { ok: false, reason: `unknown current state: ${fromState}` };
  if (!STATE_SET.has(toState)) return { ok: false, reason: `unknown target state: ${toState}` };
  const allowed = ALLOWED_TRANSITIONS.get(fromState) ?? [];
  if (!allowed.includes(toState)) {
    return {
      ok: false,
      reason: `invalid transition ${fromState} -> ${toState}; allowed: ${allowed.join(', ') || 'none'}`,
    };
  }
  return { ok: true, reason: null };
}

function validatePlatform(platform, index, issues) {
  if (!isRecord(platform)) {
    issues.push(`platforms[${index}] must be an object`);
    return;
  }
  const label = platform.id ?? `platforms[${index}]`;
  if (typeof platform.id !== 'string' || !platform.id) issues.push(`${label}: id is required`);
  if (typeof platform.name !== 'string' || !platform.name) issues.push(`${label}: name is required`);
  if (typeof platform.source !== 'string' || !platform.source) {
    issues.push(`${label}: source is required`);
  }
  if (!STATE_SET.has(platform.currentState)) {
    issues.push(`${label}: currentState must be one of ${ACCREDITATION_STATES.join(', ')}`);
  }
  if (!Array.isArray(platform.artifactFit) || platform.artifactFit.length === 0) {
    issues.push(`${label}: artifactFit must be a non-empty array`);
  }
  if (!Array.isArray(platform.transitions)) issues.push(`${label}: transitions must be an array`);
  if (!Array.isArray(platform.transitionsArchive)) {
    issues.push(`${label}: transitionsArchive must be an array`);
  }
  for (const transition of platform.transitions ?? []) {
    if (!OUTCOME_SET.has(transition?.outcome)) {
      issues.push(`${label}: transition outcome must be confirmed or indeterminate`);
    }
    if (transition?.$schema !== ACCREDITATION_EVIDENCE_SCHEMA) {
      issues.push(`${label}: transition $schema must be ${ACCREDITATION_EVIDENCE_SCHEMA}`);
    }
  }
}

export function validateAccreditationState(input) {
  const issues = [];
  if (!isRecord(input)) return { ok: false, issues: ['state must be an object'] };
  if (input.$schema !== ACCREDITATION_STATE_SCHEMA || input.version !== 1) {
    issues.push(`$schema must be ${ACCREDITATION_STATE_SCHEMA} and version must be 1`);
  }
  if (!Array.isArray(input.ownerExclusions)) issues.push('ownerExclusions must be an array');
  if (!Number.isInteger(input.stalenessDays) || input.stalenessDays <= 0) {
    issues.push('stalenessDays must be a positive integer');
  }
  if (!Array.isArray(input.platforms)) {
    issues.push('platforms must be an array');
    return { ok: false, issues };
  }

  const seen = new Set();
  input.platforms.forEach((platform, index) => {
    validatePlatform(platform, index, issues);
    if (platform?.id) {
      if (seen.has(platform.id)) issues.push(`duplicate platform id: ${platform.id}`);
      seen.add(platform.id);
    }
  });
  for (const excluded of input.ownerExclusions ?? []) {
    if (!seen.has(excluded)) issues.push(`ownerExclusions references unknown platform: ${excluded}`);
  }
  return { ok: issues.length === 0, issues };
}

function seedPlatform({ id, name, source, artifactFit, submitUrl = null, home = null, qualityGate }) {
  return {
    id,
    name,
    source,
    artifactFit,
    submitUrl,
    home,
    currentState: 'seed',
    verifiedAt: null,
    qualityGate,
    blocker: null,
    rejectionReason: null,
    transitions: [],
    transitionsArchive: [],
  };
}

export function seedAccreditationState({ configDir = DIRECTORY_SUBMISSIONS_DIR, updated } = {}) {
  const platforms = [];
  const seen = new Set();
  const add = (platform) => {
    if (seen.has(platform.id)) return;
    seen.add(platform.id);
    platforms.push(platform);
  };

  for (const channel of PROTECTED_CHANNELS) {
    add(seedPlatform({
      id: channel.id,
      name: channel.name,
      source: 'protected-channel',
      artifactFit: ['product', 'major-feature', 'article'],
      home: channel.home,
      qualityGate: 'protected',
    }));
  }
  for (const channel of ARTICLE_SYNDICATION) {
    add(seedPlatform({
      id: channel.id,
      name: channel.name,
      source: 'article-syndication',
      artifactFit: ['article'],
      home: channel.home,
      qualityGate: 'standard',
    }));
  }
  for (const directory of loadCuratedDirectories(configDir)) {
    add(seedPlatform({
      id: directory.id,
      name: directory.name,
      source: 'curated-directory-registry',
      artifactFit: ['product', 'major-feature'],
      submitUrl: directory.submitUrl ?? null,
      home: directory.home ?? null,
      qualityGate: 'standard',
    }));
  }
  for (const seed of loadLongTailSeeds(configDir)) {
    add(seedPlatform({
      id: seed.id,
      name: seed.name,
      source: 'research-probe',
      artifactFit: ['product', 'major-feature'],
      submitUrl: seed.submitUrl ?? null,
      qualityGate: 'standard',
    }));
  }

  return {
    $schema: ACCREDITATION_STATE_SCHEMA,
    version: 1,
    updated: updated ?? new Date().toISOString().slice(0, 10),
    ownerExclusions: [...PROTECTED_PLATFORM_IDS],
    stalenessDays: DEFAULT_STALENESS_DAYS,
    platforms,
  };
}

export function readAccreditationState(path = ACCREDITATION_STATE_PATH) {
  if (!existsSync(path)) {
    throw new Error(
      `accreditation state not found at ${path}. Initialize it with: node foundry/ops/scripts/accreditation/update-state.mjs init`,
    );
  }
  const state = JSON.parse(readFileSync(path, 'utf8'));
  const validation = validateAccreditationState(state);
  if (!validation.ok) {
    throw new Error(`invalid accreditation state at ${path}:\n- ${validation.issues.join('\n- ')}`);
  }
  return state;
}

export function writeAccreditationState(path, state) {
  const validation = validateAccreditationState(state);
  if (!validation.ok) {
    throw new Error(`refusing to write invalid state:\n- ${validation.issues.join('\n- ')}`);
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(state, null, 2)}\n`);
  return path;
}

export function isStale(platform, { stalenessDays = DEFAULT_STALENESS_DAYS, now = new Date() } = {}) {
  if (platform.currentState !== 'accredited') return false;
  if (!platform.verifiedAt) return true;
  const verifiedAt = Date.parse(platform.verifiedAt);
  if (Number.isNaN(verifiedAt)) return true;
  return now.getTime() - verifiedAt > stalenessDays * DAY_MS;
}

function capHistory(platform) {
  while (platform.transitions.length > TRANSITION_HISTORY_LIMIT) {
    platform.transitionsArchive.push(platform.transitions.shift());
  }
}

function guardTransition(platform, toState) {
  const check = canTransition(platform.currentState, toState);
  if (!check.ok) throw new Error(`${platform.id}: ${check.reason}`);
  if (toState === 'accredited' && platform.qualityGate === 'protected') {
    throw new Error(
      `${platform.id}: protected channels are individually planned and never broad-accredited`,
    );
  }
}

/**
 * Records one state transition against a copy of `state` and returns the new
 * state plus the updated platform. Indeterminate outcomes record evidence
 * without advancing `currentState`.
 */
export function applyTransition(state, request) {
  const {
    platformId,
    toState,
    outcome = 'confirmed',
    evidence = {},
    observedAt = new Date().toISOString(),
    blocker = null,
    reason = null,
    note = null,
  } = request;

  if (!OUTCOME_SET.has(outcome)) {
    throw new Error(`outcome must be one of ${OUTCOMES.join(', ')}`);
  }
  const next = structuredClone(state);
  const platform = next.platforms.find((entry) => entry.id === platformId);
  if (!platform) throw new Error(`unknown platform: ${platformId}`);

  guardTransition(platform, toState);
  const evidenceCheck = validateEvidence(evidence, toState);
  if (!evidenceCheck.ok) {
    throw new Error(`${platformId}: ${evidenceCheck.issues.join('; ')}`);
  }

  const applied = outcome === 'confirmed';
  platform.transitions.push({
    $schema: ACCREDITATION_EVIDENCE_SCHEMA,
    fromState: platform.currentState,
    toState,
    applied,
    observedAt,
    evidence: evidenceCheck.evidence,
    outcome,
    note,
  });
  capHistory(platform);

  if (applied) {
    platform.currentState = toState;
    if (toState === 'verified' || toState === 'accredited') platform.verifiedAt = observedAt;
    platform.blocker = toState === 'blocked' ? blocker : null;
    platform.rejectionReason = toState === 'rejected' ? reason : null;
  }
  next.updated = observedAt.slice(0, 10);
  return { state: next, platform };
}

export function stateCounts(state) {
  const counts = Object.fromEntries(ACCREDITATION_STATES.map((name) => [name, 0]));
  for (const platform of state.platforms) counts[platform.currentState] += 1;
  return counts;
}

export function summarizeAccreditationState(state, { now = new Date() } = {}) {
  const stalenessDays = state.stalenessDays ?? DEFAULT_STALENESS_DAYS;
  const platforms = state.platforms.map((platform) => {
    const last = platform.transitions.at(-1) ?? null;
    return {
      id: platform.id,
      name: platform.name,
      source: platform.source,
      currentState: platform.currentState,
      qualityGate: platform.qualityGate,
      verifiedAt: platform.verifiedAt,
      stale: isStale(platform, { stalenessDays, now }),
      blocker: platform.blocker,
      rejectionReason: platform.rejectionReason,
      lastEvidence: last
        ? {
            observedAt: last.observedAt,
            fromState: last.fromState,
            toState: last.toState,
            applied: last.applied,
            outcome: last.outcome,
            liveUrl: last.evidence?.liveUrl ?? null,
            httpStatus: last.evidence?.httpStatus ?? null,
          }
        : null,
    };
  });

  return {
    updated: state.updated,
    stalenessDays,
    counts: stateCounts(state),
    protectedCount: platforms.filter((platform) => platform.qualityGate === 'protected').length,
    staleCount: platforms.filter((platform) => platform.stale).length,
    platforms,
  };
}
