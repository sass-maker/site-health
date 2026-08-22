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
  assert.equal(gitstat?.portfolio?.priority, 'P2');
  assert.equal(gitstat?.tier, 'secondary');
  assert.equal(gitstat?.attention, 'toolbox');
  assert.equal(catalog.infrastructure.projects.gitstat.deployments[0]?.state, 'live');
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

test('account-level Cloudflare resources remain explicitly owned or unowned', () => {
  const projectResources = Object.values(catalog.infrastructure.projects).flatMap(
    (project) => project.resources,
  );
  const emailRoutingZones = projectResources
    .filter((resource) => resource.provider === 'cloudflare' && resource.kind === 'email-routing')
    .map((resource) => resource.name)
    .sort();
  const coverageByKind = new Map(
    catalog.infrastructure._meta.cloudflareCoverage.map((entry) => [entry.kind, entry]),
  );

  assert.deepEqual(emailRoutingZones, [
    'aliveville.com',
    'codevetter.com',
    'heypace.app',
    'highsignal.app',
    'karte.cc',
    'posttrainllm.com',
    'rolepatch.com',
    'sarthakagrawal.dev',
    'sassmaker.com',
    'significanthobbies.com',
  ]);
  assert.deepEqual(
    [coverageByKind.get('email-routing')?.observed, coverageByKind.get('email-routing')?.tracked],
    [10, 10],
  );
  assert.deepEqual(
    [
      coverageByKind.get('container-image-repository')?.observed,
      coverageByKind.get('container-image-repository')?.tracked,
    ],
    [2, 2],
  );
  assert.equal(
    catalog.infrastructure.projects['mobile-dev-cockpit'].resources.some(
      (resource) => resource.kind === 'container-image-repository'
        && resource.name === 'saasmaker-droid-sandbox'
        && resource.observedVersions === 42,
    ),
    true,
  );
  assert.equal(
    catalog.infrastructure.unownedResources.some(
      (resource) => resource.kind === 'container-image-repository'
        && resource.name === 'box'
        && resource.observedVersions === 1,
    ),
    true,
  );
  assert.equal(
    catalog.infrastructure.unownedResources.filter(
      (resource) => resource.kind === 'email-routing-destination',
    ).length,
    2,
  );
});

test('non-Vault organization repositories reconcile without duplicate products', () => {
  const projectById = new Map(catalog.projects.map((project) => [project.id, project]));
  const expectedProfiles = new Map([
    ['significanthobbies', 'Significant-Hobbies/.github'],
    ['codevetter', 'Codevetter/.github'],
    ['high-signal', 'High-Signal-App/.github'],
    ['pace', 'HeyPace/.github'],
    ['posttrainllm', 'PostTrainLLM/.github'],
    ['saas-maker', 'sass-maker/.github'],
  ]);

  for (const [projectId, profileRepository] of expectedProfiles) {
    assert.equal(
      catalog.infrastructure.projects[projectId].resources.some(
        (resource) => resource.provider === 'github'
          && resource.kind === 'organization-profile'
          && resource.name === profileRepository,
      ),
      true,
    );
  }

  assert.equal(
    projectById.get('protein-index')?.repositoryUrl,
    'https://github.com/Significant-Hobbies/protein-index-resilience',
  );
  assert.deepEqual(projectById.get('protein-index')?.repositoryAliases, [
    'https://github.com/Significant-Hobbies/protein-index',
  ]);
  assert.equal(
    projectById.get('anchor')?.repositoryUrl,
    'https://github.com/Significant-Hobbies/anchor',
  );
  assert.equal(
    projectById.get('saas-ideas')?.repositoryUrl,
    'https://github.com/sass-maker/saas-ideas',
  );
  assert.equal(
    projectById.get('verified-bases')?.repositoryUrl,
    'https://github.com/sass-maker/verified-bases',
  );
  assert.equal(
    projectById.get('elves-hq')?.repositoryUrl,
    'https://github.com/sass-maker/elves-hq',
  );
});

test('personal-profile product sources reconcile without inflating current Fleet scope', () => {
  const projectById = new Map(catalog.projects.map((project) => [project.id, project]));
  const absorbedSources = new Map([
    ['high-signal', 'https://github.com/sarthakagrawal927/mentionpilot'],
    ['reddit-insights', 'https://github.com/sarthakagrawal927/subreddit-research'],
    ['reel-pipeline', 'https://github.com/sarthakagrawal927/reel-maker'],
    ['swe-interview-prep', 'https://github.com/sarthakagrawal927/local-ai'],
  ]);

  for (const [projectId, repositoryUrl] of absorbedSources) {
    assert.equal(projectById.get(projectId)?.repositoryAliases?.includes(repositoryUrl), true);
  }
  assert.equal(projectById.get('shiprank')?.portfolio?.status, 'archived');
  assert.equal(projectById.get('shiprank')?.repositoryUrl, 'https://github.com/sarthakagrawal927/taste');
  assert.equal(projectById.get('sarthakagrawal-personal')?.repo, 'portfolio');
  assert.equal(
    catalog.infrastructure.projects['sarthakagrawal-personal'].resources.some(
      (resource) => resource.provider === 'github'
        && resource.kind === 'profile-repository'
        && resource.name === 'sarthakagrawal927/sarthakagrawal927',
    ),
    true,
  );
});

test('current product scope stays smaller than the complete retained inventory', () => {
  const current = catalog.projects.filter((project) =>
    project.status !== 'orphan'
    && !['past', 'non-product'].includes(project.lifecycle)
    && project.attention !== 'ignored'
    && project.tier !== 'out-of-fleet'
    && project.portfolio?.priority !== 'P4'
    && project.portfolio?.status !== 'archived');

  assert.equal(catalog.projects.length, 59);
  assert.equal(current.length, 32);
  assert.equal(current.some((project) => project.id === 'gitstat'), true);
});
