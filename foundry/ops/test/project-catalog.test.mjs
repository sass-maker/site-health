import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  buildAutomationProjection,
  buildMarketingProjection,
  renderInternalCatalog,
  renderReadmePortfolio,
  validateProjectCatalog,
} from '../lib/project-catalog.mjs';

const [catalog, automation, marketing, sites, toolbox] = await Promise.all([
  readJson(new URL('../config/projects.json', import.meta.url)),
  readJson(new URL('../config/automation-registry.json', import.meta.url)),
  readJson(new URL('../config/marketing-program.json', import.meta.url)),
  readJson(new URL('../config/project-sites.json', import.meta.url)),
  readJson(new URL('../config/significant-hobbies-toolbox.json', import.meta.url)),
]);

test('real catalog validates with every authored overlay reference', () => {
  assert.deepEqual(
    validateProjectCatalog(catalog, {
      automationRegistry: automation,
      marketingProgram: marketing,
      siteRegistry: sites,
      toolboxRegistry: toolbox,
      reconcile: false,
    }),
    { projectCount: 43 },
  );
});

test('generated projections add Calorie and remain deterministic', () => {
  const automationProjection = buildAutomationProjection(catalog, automation);
  const marketingProjection = buildMarketingProjection(catalog, marketing);

  assert.equal(automationProjection.entries.some((entry) => entry.id === 'calorie'), true);
  assert.equal(marketingProjection.projects.some((entry) => entry.slug === 'calorie'), true);
  assert.equal(renderInternalCatalog(catalog), renderInternalCatalog(catalog));
  assert.equal(renderReadmePortfolio(catalog), renderReadmePortfolio(catalog));
});

test('checkout reconciliation fails closed until active and inactive repos are cataloged', () => {
  const parent = mkdtempSync(path.join(tmpdir(), 'fleet-catalog-'));
  const fleetRoot = path.join(parent, 'fleet');
  const inactiveRoot = path.join(parent, 'fleet-inactive-projects');
  try {
    mkdirSync(path.join(fleetRoot, 'new-project', '.git'), { recursive: true });
    mkdirSync(path.join(inactiveRoot, 'old-project', '.git'), { recursive: true });

    const fixture = { projects: [] };
    assert.throws(
      () => validateProjectCatalog(fixture, { fleetRoot }),
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
    assert.doesNotThrow(() => validateProjectCatalog(fixture, { fleetRoot }));
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});

test('checkout reconciliation accepts explicit absorbed checkout identities', () => {
  const fleetRoot = mkdtempSync(path.join(tmpdir(), 'fleet-catalog-absorbed-'));
  try {
    mkdirSync(path.join(fleetRoot, 'legacy-helper', '.git'), { recursive: true });
    const fixture = {
      _meta: { absorbedCheckouts: { 'legacy-helper': 'helper' } },
      projects: [
        projectFixture({
          id: 'helper',
          repo: 'foundry/services/helper',
          lifecycle: 'maintained',
        }),
      ],
    };
    assert.doesNotThrow(() => validateProjectCatalog(fixture, { fleetRoot }));

    fixture._meta.absorbedCheckouts['unknown-helper'] = 'missing-project';
    assert.throws(
      () => validateProjectCatalog(fixture, { fleetRoot }),
      /absorbed checkout unknown-helper: unknown catalog identity missing-project/,
    );
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

function projectFixture({ id, repo, sourcePath, lifecycle }) {
  return {
    id,
    name: id,
    attention: lifecycle === 'past' ? 'ignored' : 'toolbox',
    lifecycle,
    repositoryVisibility: 'unknown',
    public: { listing: 'hidden' },
    ...(repo ? { repo } : {}),
    ...(sourcePath ? { sourcePath } : {}),
  };
}

async function readJson(url) {
  return JSON.parse(await readFile(url, 'utf8'));
}
