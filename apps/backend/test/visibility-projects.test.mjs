import assert from 'node:assert/strict';
import test from 'node:test';

import {
  indexNowProjects,
  isVisibilityProject,
  searchConsoleProjects,
  searchConsoleTarget,
  searchObservationDomain,
  searchObservationSurface,
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

test('Search Console targets retain owned active and inactive contracted roots', () => {
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
      ['past-root', ['past.example']],
      ['personal-root', ['person.dev']],
    ],
  );
  assert.deepEqual(visibilityProjects(catalog).map((entry) => entry.id), ['first']);
});

test('explicit Search Console surfaces measure hidden active sites without changing listing', () => {
  const hidden = project({
    id: 'data', public: { listing: 'hidden' },
    systems: { searchConsole: { surfaceUrl: 'https://example.com/workbench/' } },
  });
  const catalog = { projects: [hidden, project({ id: 'ordinary-hidden', public: { listing: 'hidden' } })] };
  const before = JSON.stringify(catalog);
  assert.deepEqual(visibilityProjects(catalog), []);
  assert.deepEqual(searchConsoleProjects(catalog).map(entry => entry.id), ['data']);
  assert.equal(searchConsoleTarget(searchConsoleProjects(catalog)[0]).surfaceUrl, 'https://example.com/workbench/');
  assert.equal(JSON.stringify(catalog), before);
});

test('explicit Search Console policy does not revive inactive or domainless hidden records', () => {
  const policy = { searchConsole: { surfaceUrl: 'https://example.com/' } };
  const catalog = { projects: [
    project({ public: { listing: 'hidden' }, systems: policy, lifecycle: { status: 'inactive' } }),
    project({ id: 'domainless', public: { listing: 'hidden' }, systems: policy, domains: [] }),
  ] };
  assert.deepEqual(searchConsoleProjects(catalog), []);
});

test('invalid explicit hidden-site Search Console surfaces fail before collection', () => {
  for (const policy of [{}, { surfaceUrl: null }, { surfaceUrl: 42 }, { surfaceUrl: false }, { surfaceUrl: 'http://example.com/' }]) {
    assert.throws(() => searchConsoleProjects({ projects: [project({
      public: { listing: 'hidden' }, systems: { searchConsole: policy },
    }), project({ id: 'valid' })] }), /Invalid Search Console surface URL/);
  }
});

test('Search Console opt-ins do not activate IndexNow discovery on a catalog host', () => {
  const hidden = project({
    id: 'data', domains: ['old.example.com'], public: { listing: 'hidden' },
    systems: { searchConsole: { surfaceUrl: 'https://example.com/workbench/' } },
  });
  const catalog = { projects: [project({ id: 'ordinary' }), hidden] };
  const google = searchConsoleProjects(catalog);
  assert.deepEqual(google.map(entry => searchConsoleTarget(entry).surfaceUrl), ['https://example.com/', 'https://example.com/workbench/']);
  assert.deepEqual(indexNowProjects(catalog).map(entry => entry.id), ['ordinary']);
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

test('retired identities with released domains do not block owned targets', () => {
  const catalog = { projects: [
    project({ id: 'current' }),
    project({ id: 'retired', lifecycle: { status: 'inactive' }, domains: [] }),
  ] };
  const targets = searchConsoleProjects(catalog, new Map([
    ['released.example', { rootDomain: 'released.example', projectId: 'retired' }],
  ]));
  assert.deepEqual(targets.map((target) => target.id), ['current']);
});

test('search domain identity uses inspected URL before shared property scope', () => {
  assert.equal(searchObservationDomain({ scope: 'sc-domain:example.com · page:https://app.example.com/' }), 'app.example.com');
  assert.equal(searchObservationDomain({ scope: 'sc-domain:example.com', indexInspection: { inspectedUrl: 'https://second.example.com/' } }), 'second.example.com');
  assert.equal(searchObservationDomain({ scope: 'https://example.com/' }), 'example.com');
  assert.equal(searchObservationDomain({ scope: 'sc-domain:example.com' }), 'example.com');
  assert.equal(searchObservationDomain({ scope: 'legacy unscoped' }), null);
});

test('canonical targets preserve catalog domains and keep separately owned root contracts', () => {
  const canonical = project({ domains: ['old.example.com', 'example.com'], systems: { searchConsole: { surfaceUrl: 'https://EXAMPLE.com/browser' } } });
  const before = JSON.stringify(canonical);
  const targets = searchConsoleProjects({ projects: [canonical] }, new Map([['example.com', { rootDomain: 'example.com', projectId: canonical.id }]]));
  assert.deepEqual(targets.map(searchConsoleTarget), [
    { surfaceUrl: 'https://example.com/browser/', domain: 'example.com', explicit: true },
    { surfaceUrl: 'https://example.com/', domain: 'example.com', explicit: false },
  ]);
  assert.equal(JSON.stringify(canonical), before);
  assert.deepEqual(targets[0].domains, ['old.example.com', 'example.com']);
  assert.equal(searchObservationSurface({ scope: 'sc-domain:example.com · page:https://example.com/browser/' }), 'https://example.com/browser/');
  assert.equal(searchObservationSurface({ scope: 'sc-domain:example.com', indexInspection: { inspectedUrl: 'https://example.com/storage/' } }), 'https://example.com/storage/');
});
