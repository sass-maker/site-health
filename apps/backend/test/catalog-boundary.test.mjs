import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const catalog = JSON.parse(
  readFileSync(new URL('../config/projects.json', import.meta.url), 'utf8'),
);

test('catalog records every project and infrastructure owner exactly once', () => {
  const projectIds = catalog.projects.map((project) => project.id).sort();
  const infrastructureIds = Object.keys(catalog.infrastructure.projects).sort();

  assert.equal(new Set(projectIds).size, projectIds.length);
  assert.deepEqual(infrastructureIds, projectIds);
});

test('standalone workspace boundaries remain explicit', () => {
  const projectById = new Map(catalog.projects.map((project) => [project.id, project]));
  const workflows = projectById.get('workflows-and-skills');
  const siteHealth = projectById.get('site-health');

  assert.equal(workflows?.repo, 'workflows-and-skills');
  assert.equal(workflows?.repositoryUrl, 'https://github.com/sass-maker/workflows-and-skills');
  assert.equal(workflows?.public?.listing, 'hidden');
  assert.deepEqual(siteHealth?.domains, []);
  assert.equal(siteHealth?.status, 'local-only');
  assert.deepEqual(catalog.infrastructure.projects['site-health'].deployments, []);
  assert.equal(
    catalog.infrastructure.projects['workflows-and-skills'].deployments[0]?.name,
    'sass-maker/workflows-and-skills',
  );
  assert.equal(catalog.projects.some((project) => project.family === 'fleet-workspace'), false);
});

test('live Cloudflare ownership stays reconciled', () => {
  const projectById = new Map(catalog.projects.map((project) => [project.id, project]));
  const gitstat = projectById.get('gitstat');
  const saasMaker = projectById.get('saas-maker');
  const sweResources = catalog.infrastructure.projects['swe-interview-prep'].resources;

  assert.equal(gitstat?.cfProject, 'gitstat');
  assert.deepEqual(gitstat?.domains, ['git.significanthobbies.com']);
  assert.equal(catalog.infrastructure.projects.gitstat.deployments[0]?.state, 'live-out-of-fleet');
  assert.deepEqual(saasMaker?.domains, ['sassmaker.com']);
  assert.equal(
    catalog.infrastructure.projects['saas-maker'].deployments.some(
      (deployment) => deployment.name === 'saasmaker-api' && deployment.state === 'live',
    ),
    false,
  );
  assert.deepEqual(
    sweResources
      .filter((resource) => resource.kind === 'queue')
      .map((resource) => resource.name)
      .sort(),
    ['swe-interview-prep-war-jobs', 'swe-interview-prep-war-jobs-dlq'],
  );
});
