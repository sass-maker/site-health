import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ACCREDITATION_STATE_SCHEMA,
  validateAccreditationState,
} from '../lib/accreditation-state.mjs';
import { matchPlatforms } from '../lib/platform-matching.mjs';

function platform(id, overrides = {}) {
  return {
    id,
    name: id,
    source: 'research-probe',
    artifactFit: ['product', 'major-feature'],
    submitUrl: `https://${id}.invalid/submit`,
    home: null,
    currentState: 'seed',
    verifiedAt: null,
    qualityGate: 'standard',
    blocker: null,
    rejectionReason: null,
    transitions: [],
    transitionsArchive: [],
    ...overrides,
  };
}

const fixture = {
  $schema: ACCREDITATION_STATE_SCHEMA,
  version: 1,
  updated: '2026-08-15',
  ownerExclusions: ['hacker-news'],
  stalenessDays: 30,
  platforms: [
    platform('hacker-news', {
      source: 'protected-channel',
      artifactFit: ['product', 'major-feature', 'article'],
      qualityGate: 'protected',
    }),
    platform('medium', { source: 'article-syndication', artifactFit: ['article'] }),
    platform('dev-community', {
      source: 'article-syndication',
      artifactFit: ['article'],
      currentState: 'accredited',
      verifiedAt: '2026-08-14T00:00:00.000Z',
    }),
    platform('smol-launch', {
      source: 'curated-directory-registry',
      currentState: 'accredited',
      verifiedAt: '2026-08-14T00:00:00.000Z',
    }),
    platform('stale-directory', {
      source: 'curated-directory-registry',
      currentState: 'accredited',
      verifiedAt: '2026-05-01T00:00:00.000Z',
    }),
    platform('insidr'),
    platform('betabound', { currentState: 'blocked', blocker: 'captcha' }),
    platform('spammy', { currentState: 'rejected', rejectionReason: 'spam-only audience' }),
  ],
};

const now = new Date('2026-08-15T12:00:00.000Z');

test('fixture state is a valid accreditation document', () => {
  assert.equal(validateAccreditationState(fixture).ok, true);
});

test('articles route to protected and article-syndication platforms only', () => {
  const match = matchPlatforms(fixture, { artifact: 'article', productId: 'codevetter', now });
  assert.deepEqual(match.matched.map((entry) => entry.id).sort(), [
    'dev-community',
    'hacker-news',
    'medium',
  ]);
  for (const id of ['smol-launch', 'insidr', 'stale-directory']) {
    assert.equal(
      match.matched.some((entry) => entry.id === id),
      false,
      `${id} must not match an article`,
    );
  }
  assert.equal(match.accredited.map((entry) => entry.id).join(), 'dev-community');
});

test('products route to protected channels, directories, and long-tail seeds', () => {
  const match = matchPlatforms(fixture, { artifact: 'product', productId: 'pace', now });
  assert.deepEqual(match.matched.map((entry) => entry.id).sort(), [
    'hacker-news',
    'insidr',
    'smol-launch',
    'stale-directory',
  ]);
  assert.equal(
    match.matched.some((entry) => entry.id === 'medium'),
    false,
  );
  assert.equal(match.counts.blocked, 1);
  assert.equal(match.blocked[0].blocker, 'captcha');
  assert.equal(
    match.matched.every((entry) => entry.productId === 'pace'),
    true,
  );
});

test('a product launch with a canonical article also matches syndication platforms', () => {
  const match = matchPlatforms(fixture, {
    artifact: 'major-feature',
    productId: 'pace',
    includeCanonicalArticle: true,
    now,
  });
  assert.deepEqual(match.articleComponent.map((entry) => entry.id).sort(), [
    'dev-community',
    'medium',
  ]);
  assert.equal(
    match.articleComponent.every((entry) => entry.component === 'article'),
    true,
  );
});

test('rejected platforms are excluded unless the owner overrides with a reason', () => {
  const match = matchPlatforms(fixture, { artifact: 'product', now });
  assert.equal(
    match.matched.some((entry) => entry.id === 'spammy'),
    false,
  );
  assert.equal(match.rejected[0].rejectionReason, 'spam-only audience');

  const overridden = matchPlatforms(fixture, {
    artifact: 'product',
    overrides: [{ platformId: 'spammy', reason: 'owner approved a one-off relevant listing' }],
    now,
  });
  assert.equal(
    overridden.matched.some((entry) => entry.id === 'spammy'),
    true,
  );
  assert.equal(overridden.overridden[0].overrideReason, 'owner approved a one-off relevant listing');
  assert.equal(overridden.counts.rejected, 0);
});

test('stale accredited platforms re-enter the verification queue', () => {
  const match = matchPlatforms(fixture, { artifact: 'product', now });
  assert.deepEqual(match.verificationQueue.map((entry) => entry.id).sort(), [
    'betabound',
    'insidr',
    'stale-directory',
  ]);
  assert.equal(match.accredited.find((entry) => entry.id === 'smol-launch').stale, false);
});

test('unknown artifact types are rejected', () => {
  assert.throws(
    () => matchPlatforms(fixture, { artifact: 'newsletter' }),
    /artifact must be one of/u,
  );
});
