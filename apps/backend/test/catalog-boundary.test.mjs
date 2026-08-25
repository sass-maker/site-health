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

test('consolidated workspace boundaries remain explicit', () => {
  const projectById = new Map(catalog.projects.map((project) => [project.id, project]));
  const saasMaker = projectById.get('saas-maker');
  const live = projectById.get('live');
  const hub = projectById.get('significanthobbies');
  const journal = projectById.get('journal');
  const siteHealth = projectById.get('site-health');

  assert.equal(saasMaker?.repo, 'saas-maker');
  assert.equal(live?.repositoryUrl, 'https://github.com/Significant-Hobbies/live');
  assert.equal(hub?.cfProject, 'personal-platform');
  assert.equal(journal?.repositoryUrl, 'https://github.com/Significant-Hobbies/journal');
  assert.deepEqual(siteHealth?.domains, []);
  assert.equal(siteHealth?.status, 'local-only');
  assert.deepEqual(catalog.infrastructure.projects['site-health'].deployments, []);
  assert.equal(catalog.infrastructure.projects.live.deployments[0]?.name, 'significanthobbies');
  assert.equal(catalog.infrastructure.projects.significanthobbies.deployments[0]?.name, 'personal-platform');
  assert.equal(catalog.infrastructure.projects.journal.deployments[0]?.name, 'journal');
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
    true,
  );
  assert.deepEqual(
    sweResources
      .filter((resource) => resource.kind === 'queue')
      .map((resource) => resource.name)
      .sort(),
    ['swe-interview-prep-war-jobs', 'swe-interview-prep-war-jobs-dlq'],
  );
});

test('deployment summaries stay internally consistent', () => {
  const coverageByKind = new Map(
    catalog.infrastructure._meta.cloudflareCoverage.map((entry) => [entry.kind, entry]),
  );
  const cloudflareDeployments = Object.values(catalog.infrastructure.projects).flatMap(
    (project) => project.deployments.filter((deployment) => deployment.provider === 'cloudflare'),
  );
  const cloudflareResources = [
    ...Object.values(catalog.infrastructure.projects).flatMap((project) => project.resources),
    ...catalog.infrastructure.unownedResources,
  ].filter((resource) => resource.provider === 'cloudflare');

  assert.equal(
    coverageByKind.get('pages')?.tracked,
    cloudflareDeployments.filter((deployment) => deployment.kind === 'pages').length,
  );
  assert.equal(
    coverageByKind.get('worker')?.tracked,
    cloudflareDeployments.filter((deployment) =>
      deployment.kind === 'worker' || deployment.kind === 'email-worker').length,
  );
  for (const kind of ['r2', 'service-binding']) {
    assert.equal(
      coverageByKind.get(kind)?.tracked,
      cloudflareResources.filter((resource) => resource.kind === kind).length,
    );
  }

  for (const project of catalog.projects) {
    const deployments = catalog.infrastructure.projects[project.id].deployments;
    const liveCloudflareKinds = new Set(
      deployments
        .filter((deployment) =>
          deployment.provider === 'cloudflare' && deployment.state.startsWith('live'))
        .map((deployment) => deployment.kind === 'email-worker' ? 'worker' : deployment.kind),
    );
    const expectedDeployKind = liveCloudflareKinds.size === 0
      ? 'none'
      : liveCloudflareKinds.size === 2
        ? 'worker+pages'
        : [...liveCloudflareKinds][0];

    assert.equal(project.portfolio.deployed, liveCloudflareKinds.size > 0, project.id);
    assert.equal(project.deployKind, expectedDeployKind, project.id);
    assert.notEqual(project.repositoryVisibility, 'unknown', project.id);
  }
});

test('every account-level Cloudflare resource has an explicit operational owner', () => {
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
    [1, 1],
  );
  // The Droid worker, its container and all 49 sandbox image versions were
  // deleted from Cloudflare on 2026-08-23. Mobile Dev Cockpit never owned it —
  // the code was saas-maker/workers/droid, removed from the repo in 25c460a0.
  assert.deepEqual(catalog.infrastructure.projects['mobile-dev-cockpit'].resources, []);
  assert.deepEqual(catalog.infrastructure.projects['mobile-dev-cockpit'].deployments, []);
  assert.deepEqual(catalog.infrastructure.unownedResources, []);
  assert.equal(
    catalog.infrastructure.projects['saas-maker'].resources.some(
      (resource) => resource.kind === 'container-image-repository'
        && resource.name === 'box'
        && resource.observedVersions === 1
        && resource.scope === 'shared-fleet-account',
    ),
    true,
  );
  assert.equal(
    catalog.infrastructure.projects['saas-maker'].resources.filter(
      (resource) => resource.kind === 'email-routing-destination',
    ).length,
    2,
  );
  for (const resource of catalog.infrastructure.projects['saas-maker'].resources.filter(
    (entry) => entry.scope === 'shared-fleet-account',
  )) {
    assert.equal(typeof resource.attributionReason, 'string');
    assert.equal(resource.attributionReason.length > 0, true);
  }
});

test('non-Vault organization repositories reconcile without duplicate products', () => {
  const projectById = new Map(catalog.projects.map((project) => [project.id, project]));
  const expectedProfiles = new Map([
    ['live', 'Significant-Hobbies/.github'],
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
  assert.equal(projectById.has('saas-ideas'), false);
  assert.equal(
    projectById.get('verified-bases')?.repositoryUrl,
    'https://github.com/sass-maker/verified-bases',
  );
});

test('public directory metadata covers every retained identity with bounded public fields', () => {
  const projectIds = catalog.projects.map((project) => project.id).sort();
  const directoryIds = Object.keys(catalog.publicDirectory.projects).sort();
  const allowedFields = new Set([
    'description',
    'firstCommitAt',
    'form',
    'latestCommitAt',
    'makerNote',
    'platforms',
    'technologies',
  ]);

  assert.equal(catalog.publicDirectory.schemaVersion, 2);
  assert.deepEqual(directoryIds, projectIds);

  for (const [projectId, metadata] of Object.entries(catalog.publicDirectory.projects)) {
    assert.deepEqual(
      Object.keys(metadata).filter((field) => !allowedFields.has(field)),
      [],
      `${projectId} has an unsupported public directory field`,
    );
    assert.equal(typeof metadata.form, 'string', `${projectId} needs a public form`);
    assert.equal(metadata.form.length > 0, true, `${projectId} needs a public form`);
    assert.equal(typeof metadata.makerNote, 'string', `${projectId} needs a public maker note`);
    assert.equal(metadata.makerNote.length >= 40, true, `${projectId} maker note is too thin`);
    assert.match(
      metadata.makerNote,
      /\b(?:I|me|my)\b/,
      `${projectId} maker note must preserve first-person voice`,
    );
    assert.equal(Array.isArray(metadata.platforms) && metadata.platforms.length > 0, true);
    assert.equal(Array.isArray(metadata.technologies) && metadata.technologies.length > 0, true);
    assert.equal(metadata.technologies.length <= 4, true, `${projectId} technology list is too long`);

    for (const date of [metadata.firstCommitAt, metadata.latestCommitAt]) {
      assert.equal(date === null || /^\d{4}-\d{2}-\d{2}$/.test(date), true);
    }
    if (metadata.firstCommitAt && metadata.latestCommitAt) {
      assert.equal(metadata.firstCommitAt <= metadata.latestCommitAt, true);
    }
  }
});

test('current product scope stays smaller than the complete retained inventory', () => {
  const current = catalog.projects.filter((project) =>
    project.status !== 'orphan'
    && !['past', 'non-product'].includes(project.lifecycle)
    && project.attention !== 'ignored'
    && project.tier !== 'out-of-fleet'
    && project.portfolio?.priority !== 'P4'
    && project.portfolio?.status !== 'archived');

  assert.equal(catalog.projects.length, 56);
  assert.equal(current.length, 32);
  assert.equal(current.some((project) => project.id === 'gitstat'), true);
});
