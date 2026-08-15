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

test('audience-fit tags order matched platforms by relevance', () => {
  const state = {
    ...fixture,
    platforms: [
      ...fixture.platforms,
      platform('ai-directory', {
        source: 'curated-directory-registry',
        artifactFit: ['product', 'major-feature'],
        audienceTags: ['ai', 'developer-tools'],
      }),
      platform('fitness-directory', {
        source: 'curated-directory-registry',
        artifactFit: ['product', 'major-feature'],
        audienceTags: ['fitness', 'health'],
      }),
      platform('generic-directory', {
        source: 'curated-directory-registry',
        artifactFit: ['product', 'major-feature'],
      }),
    ],
  };

  const match = matchPlatforms(state, {
    artifact: 'product',
    productId: 'codevetter',
    productAudienceTags: ['ai', 'developer-tools', 'coding'],
    now,
  });

  // AI directory should rank first (2 matching tags), then fitness (0), then generic (unclassified)
  const seedIds = match.seed.map((e) => e.id);
  assert.ok(seedIds.includes('ai-directory'));
  assert.ok(seedIds.includes('fitness-directory'));
  assert.ok(seedIds.includes('generic-directory'));
  assert.ok(seedIds.includes('insidr'));

  // AI directory should come before fitness directory
  const aiIndex = seedIds.indexOf('ai-directory');
  const fitnessIndex = seedIds.indexOf('fitness-directory');
  assert.ok(aiIndex < fitnessIndex, 'AI directory should rank above fitness directory');

  // Verify fit scores
  const aiEntry = match.seed.find((e) => e.id === 'ai-directory');
  assert.equal(aiEntry.audienceFit, 2);
  assert.deepEqual(aiEntry.audienceMatchedTags, ['ai', 'developer-tools']);
  assert.equal(aiEntry.audienceUnclassified, false);

  const fitnessEntry = match.seed.find((e) => e.id === 'fitness-directory');
  assert.equal(fitnessEntry.audienceFit, 0);
  assert.equal(fitnessEntry.audienceMatchedTags.length, 0);
  assert.equal(fitnessEntry.audienceUnclassified, false);

  const genericEntry = match.seed.find((e) => e.id === 'generic-directory');
  assert.equal(genericEntry.audienceFit, 0);
  assert.equal(genericEntry.audienceUnclassified, true);
});

test('missing audience tags on both sides means unclassified, not no-fit', () => {
  const match = matchPlatforms(fixture, {
    artifact: 'product',
    productId: 'pace',
    productAudienceTags: [],
    now,
  });

  // All entries should be unclassified when product has no tags
  for (const entry of match.matched) {
    assert.equal(entry.audienceUnclassified, true);
    assert.equal(entry.audienceFit, 0);
  }
});

test('productAudienceTags is echoed in the result for auditability', () => {
  const tags = ['ai', 'developer-tools'];
  const match = matchPlatforms(fixture, {
    artifact: 'product',
    productId: 'codevetter',
    productAudienceTags: tags,
    now,
  });
  assert.deepEqual(match.productAudienceTags, tags);
});
