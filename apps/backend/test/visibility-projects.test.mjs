import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isVisibilityProject,
  searchConsoleProjects,
  searchObservationDomain,
  visibilityProjects,
} from '../lib/visibility-projects.mjs';

function project(overrides = {}) {
  return {
    id: 'example',
    lifecycle: { status: 'active', shareable: true, resumeCondition: null },
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

test('visibility inventory excludes inactive projects and domainless records', () => {
  assert.equal(isVisibilityProject(project({ lifecycle: { status: 'inactive', shareable: false, resumeCondition: null } })), false);
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
      project({ id: 'excluded', lifecycle: { status: 'inactive', shareable: false, resumeCondition: null } }),
      project({ id: 'second' }),
    ],
  };
  assert.deepEqual(
    visibilityProjects(catalog).map((entry) => entry.id),
    ['first', 'second'],
  );
});

test('Search Console targets retain active roots and exclude inactive historical identities', () => {
  const catalog = {
    projects: [
      project({ id: 'first', domains: ['first.example'] }),
      project({ id: 'past-root', lifecycle: { status: 'inactive', shareable: false, resumeCondition: null }, domains: ['past.example'] }),
      project({ id: 'personal-root', lifecycle: { status: 'inactive', shareable: false, resumeCondition: null }, domains: ['person.dev'] }),
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
    ],
  );
  assert.deepEqual(visibilityProjects(catalog).map((entry) => entry.id), ['first']);
});

test('Search Console targets retain primary and owned root surfaces while rejecting unknown ownership', () => {
  const catalog = { projects: [project({ id: 'first', domains: ['app.example.com', 'example.com'] })] };

  assert.throws(
    () => searchConsoleProjects(catalog, new Map([
      ['other.example', { rootDomain: 'other.example', projectId: 'missing' }],
    ])),
    /Unknown Search Console root project/,
  );
  assert.deepEqual(searchConsoleProjects(catalog, new Map([
    ['example.com', { rootDomain: 'example.com', projectId: 'first' }],
    ['duplicate', { rootDomain: 'example.com', projectId: 'first' }],
  ])).map((entry) => entry.domains[0]), ['app.example.com', 'example.com']);
  assert.throws(() => searchConsoleProjects(catalog, new Map([
    ['unowned.com', { rootDomain: 'unowned.com', projectId: 'first' }],
  ])), /does not own/);
});

test('search domain identity uses inspected URL before shared property scope', () => {
  assert.equal(searchObservationDomain({ scope: 'sc-domain:example.com · page:https://app.example.com/' }), 'app.example.com');
  assert.equal(searchObservationDomain({ scope: 'sc-domain:example.com', indexInspection: { inspectedUrl: 'https://second.example.com/' } }), 'second.example.com');
  assert.equal(searchObservationDomain({ scope: 'https://example.com/' }), 'example.com');
  assert.equal(searchObservationDomain({ scope: 'sc-domain:example.com' }), 'example.com');
  assert.equal(searchObservationDomain({ scope: 'legacy unscoped' }), null);
});
