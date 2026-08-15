import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

import {
  AUDIENCE_FIT_PATH,
  AUDIENCE_FIT_SCHEMA,
  audienceFitFor,
  validateAudienceFit,
} from '../lib/audience-fit.mjs';

const opsRoot = resolve(import.meta.dirname, '..');

const fixture = {
  $schema: AUDIENCE_FIT_SCHEMA,
  version: 1,
  audiences: ['ai', 'developer'],
  products: { codevetter: ['ai', 'developer'] },
  platforms: { dev: ['developer'] },
};

test('validates known product/platform IDs and taxonomy tags', () => {
  assert.deepEqual(validateAudienceFit(fixture, {
    projectIds: new Set(['codevetter']),
    platformIds: new Set(['dev']),
  }), { ok: true, issues: [] });
});

test('rejects duplicate, unknown, and malformed audience mappings', () => {
  const invalid = {
    ...fixture,
    audiences: ['ai', 'ai'],
    products: { missing: ['unknown'], codevetter: [] },
  };
  const result = validateAudienceFit(invalid, { projectIds: new Set(['codevetter']) });
  assert.equal(result.ok, false);
  assert.equal(result.issues.some((issue) => issue.includes('duplicates')), true);
  assert.equal(result.issues.some((issue) => issue.includes('not a known ID')), true);
  assert.equal(result.issues.some((issue) => issue.includes('unknown audience tag')), true);
  assert.equal(result.issues.some((issue) => issue.includes('non-empty tag array')), true);
});

test('returns transparent overlap evidence and honest missing reasons', () => {
  assert.deepEqual(audienceFitFor(fixture, 'codevetter', 'dev'), {
    productAudienceTags: ['ai', 'developer'],
    platformAudienceTags: ['developer'],
    matchedAudienceTags: ['developer'],
    fitScore: 1,
    fitReason: null,
  });
  assert.equal(audienceFitFor(fixture, 'missing', 'dev').fitReason, 'product-audience-missing');
  assert.equal(
    audienceFitFor(fixture, 'codevetter', 'missing').fitReason,
    'platform-audience-missing',
  );
});

test('tracked overlay covers every platform and every share-ready product', () => {
  const audienceFit = JSON.parse(readFileSync(AUDIENCE_FIT_PATH, 'utf8'));
  const state = JSON.parse(readFileSync(resolve(opsRoot, 'config/directory-submissions/accreditation-state.json'), 'utf8'));
  const { projects } = JSON.parse(readFileSync(resolve(opsRoot, 'config/projects.json'), 'utf8'));
  const result = validateAudienceFit(audienceFit, {
    projectIds: new Set(projects.map((project) => project.id)),
    platformIds: new Set(state.platforms.map((platform) => platform.id)),
  });
  assert.deepEqual(result, { ok: true, issues: [] });
  assert.deepEqual(
    state.platforms.filter((platform) => !audienceFit.platforms[platform.id]),
    [],
  );
  assert.deepEqual(
    projects.filter(
      (project) => project.portfolio?.readyToBeShared && !audienceFit.products[project.id],
    ),
    [],
  );
});
