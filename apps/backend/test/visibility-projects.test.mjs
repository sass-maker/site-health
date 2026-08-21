import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isVisibilityProject,
  searchConsoleProjects,
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

test('Search Console targets add contracted roots without changing visibility eligibility', () => {
  const catalog = {
    projects: [
      project({ id: 'first', domains: ['first.example'] }),
      project({ id: 'past-root', lifecycle: 'past', domains: ['past.example'] }),
      project({ id: 'personal-root', tier: 'non-product', lifecycle: 'non-product', domains: ['person.dev'] }),
    ],
  };
  const roots = new Map([
    ['first.example', { rootDomain: 'first.example', projectId: 'first' }],
    ['past.example', { rootDomain: 'past.example', projectId: 'past-root' }],
    ['person.dev', { rootDomain: 'person.dev', projectId: 'personal-root' }],
  ]);

  assert.deepEqual(visibilityProjects(catalog).map((entry) => entry.id), ['first']);
  assert.deepEqual(
    searchConsoleProjects(catalog, roots).map((entry) => [entry.id, entry.domains]),
    [
      ['first', ['first.example']],
      ['past-root', ['past.example']],
      ['personal-root', ['person.dev']],
    ],
  );
  assert.deepEqual(visibilityProjects(catalog).map((entry) => entry.id), ['first']);
});

test('Search Console targets reject unknown ownership and conflicting public scope', () => {
  const catalog = { projects: [project({ id: 'first', domains: ['app.example.com', 'example.com'] })] };

  assert.throws(
    () => searchConsoleProjects(catalog, new Map([
      ['other.example', { rootDomain: 'other.example', projectId: 'missing' }],
    ])),
    /Unknown Search Console root project/,
  );
  assert.throws(
    () => searchConsoleProjects(catalog, new Map([
      ['example.com', { rootDomain: 'example.com', projectId: 'first' }],
    ])),
    /conflicts with the public metric target/,
  );
});
