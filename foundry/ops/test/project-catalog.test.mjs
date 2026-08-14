import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  buildAutomationProjection,
  buildMarketingProjection,
  renderInternalCatalog,
  renderReadmePortfolio,
  validateGeoIdentityContract,
  validateProjectCatalog,
} from '../lib/project-catalog.mjs';

const [catalog, automation, marketing, sites, toolbox, agentRegistry] = await Promise.all([
  readJson(new URL('../config/projects.json', import.meta.url)),
  readJson(new URL('../config/automation-registry.json', import.meta.url)),
  readJson(new URL('../config/marketing-program.json', import.meta.url)),
  readJson(new URL('../config/project-sites.json', import.meta.url)),
  readJson(new URL('../config/significant-hobbies-toolbox.json', import.meta.url)),
  readJson(new URL('../config/agent-surfaces-registry.json', import.meta.url)),
]);

test('real catalog validates with every authored overlay reference', () => {
  assert.deepEqual(
    validateProjectCatalog(catalog, {
      automationRegistry: automation,
      marketingProgram: marketing,
      siteRegistry: sites,
      toolboxRegistry: toolbox,
      agentRegistry,
      reconcile: false,
    }),
    { projectCount: 47 },
  );
});

test('Fleet Workflows remains covered as a Fleet Workspace extension', () => {
  const workspace = catalog.projects.find((project) => project.id === 'fleet-workspace');
  assert.equal(catalog.projects.some((project) => project.id === 'fleet-workflows'), false);
  assert.ok(workspace.aliases.includes('fleet-workflows'));
  assert.ok(workspace.aliases.includes('workflows-repo'));
  assert.ok(
    catalog.infrastructure.projects['fleet-workspace'].deployments.some(
      (deployment) => deployment.provider === 'github'
        && deployment.kind === 'actions'
         && deployment.name === 'sass-maker/workflows',
    ),
  );
});

test('GEO identity contract covers every maintained visibility product', () => {
  assert.deepEqual(validateGeoIdentityContract(catalog, agentRegistry), { projectCount: 28 });
});

test('GEO identity contract rejects missing, conflicting, and inaccessible source declarations', () => {
  const missing = structuredClone(catalog);
  missing.geoIdentities = missing.geoIdentities.filter((identity) => identity.id !== 'pace');
  assert.throws(
    () => validateGeoIdentityContract(missing, agentRegistry),
    /geo identities missing: pace/,
  );

  const conflictingName = structuredClone(catalog);
  conflictingName.geoIdentities.find((identity) => identity.id === 'anime-list').name = 'Shelf';
  assert.throws(
    () => validateGeoIdentityContract(conflictingName, agentRegistry),
    /anime-list: geo name Shelf != Anime List/,
  );

  const publicPrivateSource = structuredClone(catalog);
  const fleetIdentity = publicPrivateSource.geoIdentities.find(
    (identity) => identity.id === 'fleet-workspace',
  );
  fleetIdentity.source = {
    state: 'public',
    url: 'https://github.com/sass-maker/fleet-workspace',
  };
  assert.throws(
    () => validateGeoIdentityContract(publicPrivateSource, agentRegistry),
    /fleet-workspace: public geo source requires repositoryVisibility public/,
  );
});

test('GEO identity contract rejects agent identity and profile drift', () => {
  const driftedAgentRegistry = structuredClone(agentRegistry);
  const pace = driftedAgentRegistry.products.find((product) => product.id === 'pace');
  pace.name = 'Pace';
  assert.throws(
    () => validateGeoIdentityContract(catalog, driftedAgentRegistry),
    /pace: agent name Pace != canonical HeyPace/,
  );

  pace.name = 'HeyPace';
  pace.sameAs = ['https://example.com/pace'];
  assert.throws(
    () => validateGeoIdentityContract(catalog, driftedAgentRegistry),
    /pace: agent sameAs does not match canonical officialProfiles/,
  );
});

test('generated projections add Calorie and remain deterministic', () => {
  const automationProjection = buildAutomationProjection(catalog, automation);
  const marketingProjection = buildMarketingProjection(catalog, marketing);

  assert.equal(automationProjection.entries.some((entry) => entry.id === 'calorie'), true);
  assert.equal(
    automationProjection.entries.find((entry) => entry.id === 'sarthakagrawal-personal')
      ?.repository,
    '../portfolio',
  );
  assert.equal(marketingProjection.projects.some((entry) => entry.slug === 'calorie'), true);
  assert.equal(renderInternalCatalog(catalog), renderInternalCatalog(catalog));
  assert.equal(renderReadmePortfolio(catalog), renderReadmePortfolio(catalog));
});

test('generated catalog separates P4 status and exposes dated readiness evidence', () => {
  const rendered = renderInternalCatalog(catalog);
  assert.match(rendered, /GitHub Issues remains the only operational queue/);
  assert.match(rendered, /at most five P2 projects/);
  assert.match(rendered, /do not prove that no unknown provider object exists/);
  assert.match(rendered, /## P4 — 24/);
  assert.match(rendered, /### Finished \(active\) — 11/);
  assert.match(rendered, /### Archived — 13/);
  assert.match(rendered, /\| Readiness evidence \|/);
  assert.match(rendered, /Runtime posture is not verified live\. \(verified 2026-08-11\)/);
});

test('checkout reconciliation fails closed until active and inactive repos are cataloged', () => {
  const parent = mkdtempSync(path.join(tmpdir(), 'fleet-catalog-'));
  const fleetRoot = path.join(parent, 'fleet');
  const inactiveRoot = path.join(parent, 'fleet-inactive-projects');
  try {
    mkdirSync(path.join(fleetRoot, 'new-project', '.git'), { recursive: true });
    mkdirSync(path.join(inactiveRoot, 'old-project', '.git'), { recursive: true });

    const fixture = {
      _meta: {},
      projects: [],
      infrastructure: {
        _meta: infrastructureMetaFixture(),
        projects: {},
        unownedResources: [],
      },
    };
    assert.throws(
      () => validateProjectCatalog(fixture, { fleetRoot, enforceOwnerPriorityPolicy: false }),
      /active checkout new-project: missing from project catalog[\s\S]*inactive checkout old-project/,
    );

    fixture.projects = [
      projectFixture({
        id: 'new-project',
        repo: 'new-project',
        lifecycle: 'maintained',
      }),
      projectFixture({
        id: 'old-project',
        sourcePath: '../fleet-inactive-projects/old-project',
        lifecycle: 'past',
      }),
    ];
    fixture.infrastructure.projects = {
      'new-project': infrastructureFixture(),
      'old-project': infrastructureFixture(),
    };
    assert.doesNotThrow(() => validateProjectCatalog(fixture, {
      fleetRoot,
      enforceOwnerPriorityPolicy: false,
    }));
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});

test('checkout reconciliation accepts explicit absorbed checkout identities', () => {
  const fleetRoot = mkdtempSync(path.join(tmpdir(), 'fleet-catalog-absorbed-'));
  try {
    mkdirSync(path.join(fleetRoot, 'legacy-helper', '.git'), { recursive: true });
    const fixture = {
      _meta: {
        absorbedCheckouts: { 'legacy-helper': 'helper' },
      },
      projects: [
        projectFixture({
          id: 'helper',
          repo: 'foundry/services/helper',
          lifecycle: 'maintained',
        }),
      ],
      infrastructure: {
        _meta: infrastructureMetaFixture(),
        projects: { helper: infrastructureFixture() },
        unownedResources: [],
      },
    };
    assert.doesNotThrow(() => validateProjectCatalog(fixture, {
      fleetRoot,
      enforceOwnerPriorityPolicy: false,
    }));

    fixture._meta.absorbedCheckouts['unknown-helper'] = 'missing-project';
    assert.throws(
      () => validateProjectCatalog(fixture, { fleetRoot }),
      /absorbed checkout unknown-helper: unknown catalog identity missing-project/,
    );
  } finally {
    rmSync(fleetRoot, { recursive: true, force: true });
  }
});

test('checkout reconciliation ignores linked worktrees represented by .git files', () => {
  const fleetRoot = mkdtempSync(path.join(tmpdir(), 'fleet-catalog-worktree-'));
  try {
    const linkedWorktree = path.join(fleetRoot, 'temporary-worktree');
    mkdirSync(linkedWorktree, { recursive: true });
    writeFileSync(
      path.join(linkedWorktree, '.git'),
      'gitdir: /tmp/example/.git/worktrees/temporary-worktree\n',
    );
    const fixture = {
      _meta: {},
      projects: [],
      infrastructure: {
        _meta: infrastructureMetaFixture(),
        projects: {},
        unownedResources: [],
      },
    };
    assert.doesNotThrow(() => validateProjectCatalog(fixture, {
      fleetRoot,
      enforceOwnerPriorityPolicy: false,
    }));
  } finally {
    rmSync(fleetRoot, { recursive: true, force: true });
  }
});

test('privacy and overlay identity drift fail validation', () => {
  const privatePublic = structuredClone(catalog);
  privatePublic.projects.find((project) => project.id === 'elves-hq').public = {
    listing: 'past',
    repositoryUrl: 'https://github.com/example/private',
  };
  assert.throws(
    () => validateProjectCatalog(privatePublic, { reconcile: false }),
    /past public listing requires a public repository/,
  );

  const privateMaintained = structuredClone(catalog);
  privateMaintained.projects.find((project) => project.id === 'setline').repositoryVisibility =
    'private';
  privateMaintained.projects.find((project) => project.id === 'setline').public.repositoryUrl =
    'https://github.com/example/private';
  assert.throws(
    () => validateProjectCatalog(privateMaintained, { reconcile: false }),
    /public repositoryUrl requires repositoryVisibility public/,
  );

  const personalMaintained = structuredClone(catalog);
  personalMaintained.projects.find((project) => project.id === 'calorie').public.repositoryUrl =
    'https://github.com/sarthakagrawal927/calorie';
  assert.throws(
    () => validateProjectCatalog(personalMaintained, { reconcile: false }),
    /maintained repository must use an organization owner/,
  );

  assert.throws(
    () => validateProjectCatalog(catalog, {
      automationRegistry: { entries: [{ id: 'not-a-project' }] },
      reconcile: false,
    }),
    /automation-registry: unknown project not-a-project/,
  );

  const embeddedIndependentProduct = structuredClone(catalog);
  embeddedIndependentProduct.projects.find((project) => project.id === 'setline').repo =
    'foundry/apps/setline';
  assert.throws(
    () => validateProjectCatalog(embeddedIndependentProduct, { reconcile: false }),
    /setline: independent product repository must be setline/,
  );
});

test('portfolio classification and infrastructure coverage fail closed for every project identity', () => {
  const missingPriority = structuredClone(catalog);
  delete missingPriority.projects.find((project) => project.id === 'rolepatch').portfolio.priority;
  assert.throws(
    () => validateProjectCatalog(missingPriority, { reconcile: false }),
    /rolepatch: invalid portfolio priority undefined/,
  );

  const unexpectedP1 = structuredClone(catalog);
  unexpectedP1.projects.find((project) => project.id === 'rolepatch').portfolio.priority = 'P1';
  assert.throws(
    () => validateProjectCatalog(unexpectedP1, { reconcile: false }),
    /P1 must contain exactly agent-office, codevetter, pace, posttrainllm/,
  );

  const archivedOutsideP4 = structuredClone(catalog);
  archivedOutsideP4.projects.find((project) => project.id === 'everythingrated')
    .portfolio.priority = 'P2';
  assert.throws(
    () => validateProjectCatalog(archivedOutsideP4, { reconcile: false }),
    /everythingrated: archived projects must use priority P4/,
  );

  const invalidKind = structuredClone(catalog);
  invalidKind.projects.find((project) => project.id === 'rolepatch').portfolio.kind = 'utility';
  assert.throws(
    () => validateProjectCatalog(invalidKind, { reconcile: false }),
    /rolepatch: invalid portfolio kind utility/,
  );

  const contradictoryReadiness = structuredClone(catalog);
  const agentOffice = contradictoryReadiness.projects.find(
    (project) => project.id === 'agent-office',
  );
  agentOffice.portfolio.readyToBeShared = true;
  assert.throws(
    () => validateProjectCatalog(contradictoryReadiness, { reconcile: false }),
    /agent-office: readyToBeShared requires a verified maintained public surface/,
  );

  const missingReadinessDate = structuredClone(catalog);
  delete missingReadinessDate.projects.find(
    (project) => project.id === 'rolepatch',
  ).portfolio.sharingReadiness.verifiedAt;
  assert.throws(
    () => validateProjectCatalog(missingReadinessDate, { reconcile: false }),
    /rolepatch: sharingReadiness verifiedAt must be YYYY-MM-DD/,
  );

  const missingReadinessReason = structuredClone(catalog);
  missingReadinessReason.projects.find(
    (project) => project.id === 'rolepatch',
  ).portfolio.sharingReadiness.reason = '';
  assert.throws(
    () => validateProjectCatalog(missingReadinessReason, { reconcile: false }),
    /rolepatch: sharingReadiness reason must be non-empty/,
  );

  const missingInfrastructure = structuredClone(catalog);
  delete missingInfrastructure.infrastructure.projects.rolepatch;
  assert.throws(
    () => validateProjectCatalog(missingInfrastructure, { reconcile: false }),
    /rolepatch: missing infrastructure inventory/,
  );
});

function projectFixture({ id, repo, sourcePath, lifecycle }) {
  return {
    id,
    portfolio: {
      kind: 'product',
      priority: 'P4',
      status: lifecycle === 'past' ? 'archived' : 'active',
      deployed: false,
      readyToBeShared: false,
      sharingReadiness: {
        verifiedAt: '2026-08-11',
        reason: 'Fixture is not ready to share.',
      },
    },
    name: id,
    attention: lifecycle === 'past' ? 'ignored' : 'toolbox',
    lifecycle,
    repositoryVisibility: 'unknown',
    public: { listing: 'hidden' },
    ...(repo ? { repo } : {}),
    ...(sourcePath ? { sourcePath } : {}),
  };
}

function infrastructureFixture() {
  return {
    updatedAt: '2026-08-11',
    deployments: [],
    resources: [],
  };
}

function infrastructureMetaFixture() {
  return {
    cloudflareCoverage: catalog.infrastructure._meta.cloudflareCoverage.map((row) => ({
      ...row,
      ...(typeof row.tracked === 'number' ? { tracked: 0 } : {}),
    })),
  };
}

async function readJson(url) {
  return JSON.parse(await readFile(url, 'utf8'));
}
