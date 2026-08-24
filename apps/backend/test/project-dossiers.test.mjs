import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  classifyDefaultBranchHealth,
  classifyScheduleHealth,
  classifyWorkflowHealth,
  refreshGithubActionsHealth,
  scheduleFreshnessDays,
} from '../lib/github-actions-health.mjs';
import { renderProjectActionsInventory } from '../lib/project-actions-inventory.mjs';
import {
  buildProjectDossier,
  parseOwnerNarratives,
  serializeProjectDossier,
  sha256,
  validateProjectDossierYaml,
} from '../lib/project-dossier-yaml.mjs';
import {
  githubRepositorySlug,
  observeTrackedRepository,
  parsePortfolioIntents,
  parseWorkflow,
  validateDossierInputs,
} from '../lib/project-dossiers.mjs';

const catalogSource = readFileSync(new URL('../config/projects.json', import.meta.url), 'utf8');
const catalog = JSON.parse(catalogSource);
const operations = JSON.parse(
  readFileSync(new URL('../config/project-operations.json', import.meta.url), 'utf8'),
);
const intentMarkdown = readFileSync(
  new URL('../../../docs/portfolio-condensed-2026-08-23.md', import.meta.url),
  'utf8',
);
const ownerNarrativesMarkdown = readFileSync(
  new URL('../../../docs/portfolio-owner-narratives-2026-08-22.md', import.meta.url),
  'utf8',
);

test('workflow parsing handles mapped and inline triggers', () => {
  assert.deepEqual(
    parseWorkflow('name: CI\non:\n  push:\n  pull_request:\njobs: {}\n', '.github/workflows/ci.yml'),
    {
      name: 'CI',
      file: '.github/workflows/ci.yml',
      triggers: ['pull_request', 'push'],
      schedules: [],
    },
  );
  assert.deepEqual(
    parseWorkflow("name: Deploy\n'on': [workflow_dispatch, push]\n", '.github/workflows/deploy.yaml')
      .triggers,
    ['push', 'workflow_dispatch'],
  );
  assert.deepEqual(
    parseWorkflow(
      'name: Daily\non:\n  schedule:\n    - cron: "0 7 * * *" # daily\n  workflow_dispatch:\n',
      '.github/workflows/daily.yml',
    ).schedules,
    ['0 7 * * *'],
  );
  assert.equal(githubRepositorySlug('git@github.com:sass-maker/site-health.git'), 'sass-maker/site-health');
  assert.equal(
    githubRepositorySlug('https://github.com/Significant-Hobbies/anchor.git'),
    'Significant-Hobbies/anchor',
  );
});

test('tracked repository observation reads only workflow and root package structures', () => {
  const contents = new Map([
    ['.github/workflows/ci.yml', 'name: CI\non: [push]\n'],
    [
      'package.json',
      JSON.stringify({
        packageManager: 'pnpm@10',
        scripts: { test: 'secret command is not retained', build: 'build' },
      }),
    ],
  ]);
  const reads = [];
  const observation = observeTrackedRepository({
    projectId: 'example',
    sourcePath: 'example',
    revision: 'abc123',
    repositorySlug: 'owner/example',
    trackedFiles: [
      '.env',
      '.github/workflows/ci.yml',
      'package.json',
      'pnpm-lock.yaml',
      'wrangler.jsonc',
    ],
    readText(file) {
      reads.push(file);
      return contents.get(file);
    },
  });

  assert.deepEqual(reads.sort(), ['.github/workflows/ci.yml', 'package.json']);
  assert.deepEqual(observation.rootPackageScripts, ['build', 'test']);
  assert.equal(observation.packageManager, 'pnpm@10');
  assert.equal(observation.source.repositorySlug, 'owner/example');
  assert.deepEqual(observation.githubActions[0].schedules, []);
});

test('restored verbatim owner narratives cover every canonical project', () => {
  const ownerSources = parseOwnerNarratives(ownerNarrativesMarkdown, catalog.projects);
  assert.deepEqual(ownerSources.unmapped, []);
  assert.equal(Object.keys(ownerSources.narratives).length, catalog.projects.length);
  assert.deepEqual(ownerSources.retired.sort(), ['Elves HQ', 'SaaS Ideas', 'Today Little Log']);
  assert.equal(ownerSources.related.anchor[0].sourceHeading, 'Indulge');
  assert.match(ownerSources.narratives.codevetter.whyVerbatim, /flagship product right now/);
});

test('current intent and operations snapshots cover every canonical project', () => {
  const { intents, extras } = parsePortfolioIntents(intentMarkdown, catalog.projects);
  assert.deepEqual(extras, []);
  assert.doesNotThrow(() => validateDossierInputs({ catalog, operations, intents, extras }));
});

test('project YAML starts with verification and preserves verbatim owner voice', () => {
  const { intents } = parsePortfolioIntents(intentMarkdown, catalog.projects);
  const ownerSources = parseOwnerNarratives(ownerNarrativesMarkdown, catalog.projects);
  const project = catalog.projects.find((entry) => entry.id === 'anchor');
  const dossier = buildProjectDossier({
    catalog,
    operations,
    project,
    operation: operations.projects.anchor,
    intent: intents.anchor,
    ownerNarrative: ownerSources.narratives.anchor,
    relatedNarratives: ownerSources.related.anchor,
    sourceFingerprints: {
      catalog: sha256(catalogSource),
      ownerNarratives: sha256(ownerNarrativesMarkdown),
      portfolioIntent: sha256(intentMarkdown),
    },
  });
  const rendered = serializeProjectDossier(dossier);
  const parsed = validateProjectDossierYaml(rendered, 'anchor');

  assert.match(rendered, /^schemaVersion: 1\nprojectId: anchor\nverification:\n/);
  assert.match(parsed.ownerVoice.whyVerbatim, /The purpose of anchor/);
  assert.match(parsed.product.publicMakerNote, /\b(?:I|me|my)\b/);
  assert.equal(parsed.ownerVoice.relatedHistoricalReviews[0].sourceHeading, 'Indulge');
  assert.equal(parsed.verification.evidence.ownerVoice.sourceKind, 'verbatim-owner-message');
});

test('workflow health distinguishes failures, staleness, stuck runs, and expected manual absence', () => {
  const workflow = { triggers: ['push'] };
  const apiWorkflow = { state: 'active' };
  const run = {
    id: 1,
    status: 'completed',
    conclusion: 'failure',
    event: 'push',
    head_branch: 'main',
    created_at: '2026-08-23T00:00:00Z',
    updated_at: '2026-08-23T00:01:00Z',
    html_url: 'https://github.com/example/actions/runs/1',
  };
  assert.equal(
    classifyWorkflowHealth({ workflow, apiWorkflow, latestRun: run, observedAt: '2026-08-24', staleDays: 30 }).health,
    'failing',
  );
  assert.equal(
    classifyWorkflowHealth({
      workflow,
      apiWorkflow,
      latestRun: { ...run, conclusion: 'success', created_at: '2026-06-01T00:00:00Z' },
      observedAt: '2026-08-24',
      staleDays: 30,
    }).health,
    'stale',
  );
  assert.equal(
    classifyWorkflowHealth({
      workflow,
      apiWorkflow,
      latestRun: { ...run, status: 'queued', conclusion: null, created_at: '2026-08-20T00:00:00Z' },
      observedAt: '2026-08-24',
      staleDays: 30,
    }).health,
    'stuck',
  );
  assert.equal(
    classifyWorkflowHealth({
      workflow: { triggers: ['workflow_call'] },
      apiWorkflow,
      latestRun: null,
      observedAt: '2026-08-24',
      staleDays: 30,
    }).health,
    'manual-or-reusable-never-run',
  );
});

test('schedule and current-default-branch checks detect silent missing data separately', () => {
  const workflow = { triggers: ['push', 'schedule'], schedules: ['0 7 * * 1'] };
  const apiWorkflow = { state: 'active' };
  const successfulRun = {
    id: 1,
    status: 'completed',
    conclusion: 'success',
    event: 'schedule',
    head_branch: 'main',
    head_sha: 'abc123',
    created_at: '2026-08-10T00:00:00Z',
    updated_at: '2026-08-10T00:01:00Z',
    html_url: 'https://github.com/example/actions/runs/1',
  };

  assert.equal(scheduleFreshnessDays(workflow.schedules), 9);
  assert.equal(
    classifyScheduleHealth({
      workflow,
      apiWorkflow,
      latestScheduledRun: successfulRun,
      observedAt: '2026-08-24T12:00:00Z',
      staleDays: 30,
    }).health,
    'missed',
  );
  assert.equal(
    classifyDefaultBranchHealth({
      workflow,
      apiWorkflow,
      latestPushRun: { ...successfulRun, event: 'push', head_sha: 'older' },
      defaultBranch: 'main',
      defaultBranchSha: 'abc123',
      observedAt: '2026-08-24T12:00:00Z',
    }).health,
    'missing',
  );
});

test('GitHub refresh retains remote-only workflows and renders them in the inventory', async () => {
  const run = {
    id: 10,
    workflow_id: 2,
    status: 'completed',
    conclusion: 'failure',
    event: 'schedule',
    head_branch: 'main',
    head_sha: 'abc123',
    created_at: '2026-08-24T07:00:00Z',
    updated_at: '2026-08-24T07:01:00Z',
    html_url: 'https://github.com/owner/example/actions/runs/10',
  };
  const githubApi = async (endpoint) => {
    if (endpoint.endsWith('/actions/workflows?per_page=100')) {
      return {
        workflows: [
          { id: 1, name: 'CI', path: '.github/workflows/ci.yml', state: 'active' },
          { id: 2, name: 'Old cron', path: '.github/workflows/old.yml', state: 'active' },
        ],
      };
    }
    if (endpoint.endsWith('/actions/runs?per_page=100')) return { workflow_runs: [run] };
    if (endpoint === 'repos/owner/example') return { default_branch: 'main' };
    if (endpoint.endsWith('/commits/main')) return { sha: 'abc123' };
    if (endpoint.includes('/contents/.github/workflows/old.yml')) {
      return {
        encoding: 'base64',
        content: Buffer.from('name: Old cron\non:\n  schedule:\n    - cron: "0 7 * * *"\n').toString(
          'base64',
        ),
      };
    }
    if (endpoint.includes('/actions/workflows/1/runs?branch=')) {
      return { workflow_runs: [{ ...run, id: 11, workflow_id: 1, event: 'push', conclusion: 'success' }] };
    }
    if (endpoint.includes('/actions/workflows/1/runs?per_page=1')) return { workflow_runs: [] };
    if (endpoint.includes('/actions/workflows/2/runs?event=schedule')) {
      return { workflow_runs: [run] };
    }
    throw new Error(`unexpected endpoint: ${endpoint}`);
  };
  const refreshed = await refreshGithubActionsHealth(
    {
      schemaVersion: 1,
      observedAt: '2026-08-24',
      projects: {
        example: {
          source: { repositorySlug: 'owner/example' },
          githubActions: [
            {
              name: 'CI',
              file: '.github/workflows/ci.yml',
              triggers: ['push'],
              schedules: [],
            },
          ],
        },
      },
    },
    {
      observedAt: '2026-08-24T12:00:00Z',
      githubApi,
      policies: { schemaVersion: 1, projects: {} },
      concurrency: 1,
    },
  );
  const remoteOnly = refreshed.projects.example.githubActions.find(
    (workflow) => workflow.file === '.github/workflows/old.yml',
  );
  assert.equal(remoteOnly.inventory.source, 'remote-only');
  assert.equal(remoteOnly.schedule.health, 'failing');
  assert.equal(remoteOnly.attention, 'reconcile');
  assert.match(renderProjectActionsInventory(refreshed), /Old cron/);
});

test('GitHub-generated workflow failures remain visible without entering the owner queue', async () => {
  const refreshed = await refreshGithubActionsHealth(
    {
      projects: {
        live: {
          source: { repositorySlug: 'Significant-Hobbies/live' },
          githubActions: [],
        },
      },
    },
    {
      observedAt: '2026-08-24T12:00:00Z',
      githubApi: async (endpoint) => {
        if (endpoint.endsWith('/actions/workflows?per_page=100')) {
          return {
            workflows: [
              {
                id: 1,
                name: 'Dependabot Updates',
                path: 'dynamic/dependabot/dependabot-updates',
                state: 'active',
              },
            ],
          };
        }
        if (endpoint.endsWith('/actions/runs?per_page=100')) {
          return {
            workflow_runs: [
              {
                id: 2,
                workflow_id: 1,
                status: 'completed',
                conclusion: 'failure',
                event: 'dynamic',
                head_branch: 'main',
                head_sha: 'abc123',
                created_at: '2026-08-24T11:00:00Z',
                updated_at: '2026-08-24T11:01:00Z',
                html_url: 'https://example.test/run/2',
              },
            ],
          };
        }
        if (endpoint === 'repos/Significant-Hobbies/live') {
          return { default_branch: 'main', homepage: 'https://live.significanthobbies.com' };
        }
        if (endpoint.endsWith('/commits/main')) return { sha: 'abc123' };
        throw new Error(`unexpected endpoint ${endpoint}`);
      },
    },
  );

  const [workflow] = refreshed.projects.live.githubActions;
  assert.equal(workflow.inventory.source, 'github-generated');
  assert.equal(workflow.live.health, 'failing');
  assert.equal(workflow.ownerDisposition.status, 'managed');
  assert.equal(workflow.attention, 'clear');
});

test('dossier validation rejects unattributed Cloudflare inventory', () => {
  const { intents } = parsePortfolioIntents(intentMarkdown, catalog.projects);
  const withUnattributedResource = structuredClone(catalog);
  withUnattributedResource.infrastructure.unownedResources.push({
    provider: 'cloudflare',
    kind: 'r2',
    name: 'orphan-bucket',
    state: 'active',
  });

  assert.throws(
    () =>
      validateDossierInputs({
        catalog: withUnattributedResource,
        operations,
        intents,
      }),
    /Cloudflare resources must have a project or shared operational owner/,
  );
});
