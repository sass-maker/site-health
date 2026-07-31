import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isVisibilityProject,
  visibilityProjects,
} from '../lib/visibility-projects.mjs';

function project(overrides = {}) {
  return {
    id: 'example',
    lifecycle: 'maintained',
    tier: 'active',
    domains: ['example.com'],
    public: { listing: 'maintained' },
    ...overrides,
  };
}

test('visibility inventory includes maintained public and explicit metric sites', () => {
  assert.equal(isVisibilityProject(project()), true);
  assert.equal(
    isVisibilityProject(
      project({
        public: { listing: 'hidden' },
        metrics: { publicSite: true },
      }),
    ),
    true,
  );
});

test('visibility inventory excludes non-products, past projects, and domainless records', () => {
  assert.equal(isVisibilityProject(project({ tier: 'non-product' })), false);
  assert.equal(isVisibilityProject(project({ lifecycle: 'past' })), false);
  assert.equal(isVisibilityProject(project({ domains: [] })), false);
  assert.equal(
    isVisibilityProject(
      project({
        public: { listing: 'hidden' },
        metrics: { publicSite: false },
      }),
    ),
    false,
  );
});

test('visibilityProjects preserves catalog order', () => {
  const catalog = {
    projects: [
      project({ id: 'first' }),
      project({ id: 'excluded', lifecycle: 'past' }),
      project({ id: 'second' }),
    ],
  };
  assert.deepEqual(
    visibilityProjects(catalog).map((entry) => entry.id),
    ['first', 'second'],
  );
});
