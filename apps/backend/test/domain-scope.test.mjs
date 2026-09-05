import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  domainStrengthRoots,
  isCurrentPortfolioProject,
  publicMetricTargets,
} from '../lib/dashboard-backend/domain-scope.mjs';

const catalog = JSON.parse(
  readFileSync(new URL('../config/projects.json', import.meta.url), 'utf8'),
);
const projects = catalog.projects;

// Portfolio scope is a board decision, not an implementation detail. These
// numbers are the current recorded scope; changing them requires changing the
// decision first (SAR-23). They exist so a field-path change cannot silently
// move measurement coverage again.
const PORTFOLIO_SCOPE = {
  currentProjects: 32,
  publicMetricTargets: 26,
  domainStrengthRoots: 8,
  // P4 surfaces are excluded from portfolio scope per the SAR-23 board
  // decision (exclude-p4). These are the 10 that were measured before the
  // fix and now drop from every portfolio metric family.
  excludedP4ProjectIds: [
    'anime-list',
    'drank',
    'email-manager',
    'free-ai',
    'india-standards',
    'looptv',
    'psi-swarm',
    'reddit-insights',
    'sarthakagrawal-personal',
    'what-it-takes-to-win',
  ],
};

test('portfolio priority and status live only under project.portfolio', () => {
  const nestedPriority = projects.filter((project) => project.portfolio?.priority !== undefined);
  const nestedStatus = projects.filter((project) => project.portfolio?.status !== undefined);
  const flatPriority = projects.filter((project) => project.priority !== undefined);
  const flatPortfolioStatus = projects.filter((project) => project.portfolioStatus !== undefined);

  assert.equal(nestedPriority.length, projects.length);
  assert.equal(nestedStatus.length, projects.length);
  assert.deepEqual(flatPriority, []);
  assert.deepEqual(flatPortfolioStatus, []);
});

test('the other portfolio scope clauses read fields the catalog actually stores', () => {
  for (const field of ['status', 'lifecycle', 'attention', 'tier']) {
    assert.equal(
      projects.filter((project) => project[field] !== undefined).length,
      projects.length,
      `every project must define ${field}`,
    );
  }
});

test('portfolio scope covers the recorded surface count against the real catalog', () => {
  const currentProjects = projects.filter(isCurrentPortfolioProject);

  assert.equal(currentProjects.length, PORTFOLIO_SCOPE.currentProjects);
  assert.equal(
    publicMetricTargets(currentProjects).length,
    PORTFOLIO_SCOPE.publicMetricTargets,
  );
  assert.equal(
    domainStrengthRoots(currentProjects).length,
    PORTFOLIO_SCOPE.domainStrengthRoots,
  );
});

test('P4 surfaces are excluded from portfolio scope per the board decision', () => {
  const currentProjects = projects.filter(isCurrentPortfolioProject);
  const priorityById = new Map(
    projects.map((project) => [project.id, project.portfolio?.priority]),
  );
  const measuredP4 = publicMetricTargets(currentProjects)
    .map((target) => target.projectId)
    .filter((projectId) => priorityById.get(projectId) === 'P4')
    .sort();

  // No P4 surface reaches portfolio measurement after the SAR-23 fix.
  assert.deepEqual(measuredP4, []);

  // The 10 surfaces the board decision removed are all P4 and all excluded.
  const excludedIds = [...PORTFOLIO_SCOPE.excludedP4ProjectIds].sort();
  const allP4 = excludedIds.every(
    (id) => priorityById.get(id) === 'P4',
  );
  assert.ok(allP4, 'every excluded id must be P4');
  const noneInScope = excludedIds.every(
    (id) => !currentProjects.some((project) => project.id === id),
  );
  assert.ok(noneInScope, 'no excluded id may be in portfolio scope');
});

test('archived projects never reach portfolio scope regardless of the priority clause', () => {
  const archived = projects.filter((project) => project.portfolio?.status === 'archived');

  assert.ok(archived.length > 0);
  assert.deepEqual(archived.filter(isCurrentPortfolioProject), []);
});
