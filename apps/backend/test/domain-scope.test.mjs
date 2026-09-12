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

// Portfolio scope follows the recorded lifecycle allocation (12 Sep 2026):
// 2 primary + 21 active = 23 current projects, including StorageDaddy and Slow SERP. Inactive projects are
// excluded from portfolio metric scope. These numbers are the current
// recorded scope; changing them requires changing the decision first.
const PORTFOLIO_SCOPE = {
  currentProjects: 23,
  publicMetricTargets: 18,
  domainStrengthRoots: 6,
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
  for (const field of ['status', 'attention', 'tier']) {
    assert.equal(
      projects.filter((project) => project[field] !== undefined).length,
      projects.length,
      `every project must define ${field}`,
    );
  }
  // lifecycle is now a three-field object per the PRD lifecycle model
  for (const project of projects) {
    assert.ok(
      project.lifecycle && typeof project.lifecycle === 'object',
      `${project.id}: lifecycle must be an object with status, shareable, resumeCondition`,
    );
    assert.ok(
      ['primary', 'active', 'inactive'].includes(project.lifecycle.status),
      `${project.id}: lifecycle.status must be primary, active, or inactive`,
    );
    assert.equal(
      typeof project.lifecycle.shareable,
      'boolean',
      `${project.id}: lifecycle.shareable must be a boolean`,
    );
    assert.deepEqual(Object.keys(project.lifecycle).sort(), ['resumeCondition', 'shareable', 'status']);
    const condition = project.lifecycle.resumeCondition;
    assert.ok(condition === null || (typeof condition === 'string' && condition.trim() === condition && condition.length > 0));
    if (project.lifecycle.status !== 'inactive') assert.equal(condition, null);
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

test('shared hosting roots stay out of owned domain strength while retaining public eligibility', () => {
  const hostedProject = {
    id: 'nomad-data-adventure',
    lifecycle: { status: 'active', shareable: true, resumeCondition: null },
    publicListing: 'maintained',
    domains: ['sarthakagrawal927.github.io'],
  };

  assert.deepEqual(domainStrengthRoots([hostedProject]), []);
  assert.deepEqual(publicMetricTargets([hostedProject]), [{
    projectId: 'nomad-data-adventure',
    domain: 'sarthakagrawal927.github.io',
  }]);
});

test('inactive projects never reach portfolio scope', () => {
  const inactive = projects.filter(
    (project) =>
      project.lifecycle?.status === 'inactive' ||
      (typeof project.lifecycle === 'string' && project.lifecycle === 'past'),
  );

  assert.ok(inactive.length === 36);
  assert.deepEqual(inactive.filter(isCurrentPortfolioProject), []);
});

test('sharing and restart conditions never reactivate inactive projects or exclude active internal tools', () => {
  for (const shareable of [false, true]) {
    for (const resumeCondition of [null, 'Three named pilot users request a supported release.']) {
      const project = { lifecycle: { status: 'inactive', shareable, resumeCondition } };
      const before = structuredClone(project);
      assert.equal(isCurrentPortfolioProject(project), false);
      assert.deepEqual(project, before);
    }
  }
  assert.equal(isCurrentPortfolioProject({
    lifecycle: { status: 'active', shareable: false, resumeCondition: null },
  }), true);
});
