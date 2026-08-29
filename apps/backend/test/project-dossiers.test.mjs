import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
  auditRetainedGitHistory,
  githubRepositorySlug,
  observeTrackedRepository,
  parsePortfolioIntents,
  parseWorkflow,
  refreshRetainedGitHistory,
  scanFleetRepositories,
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
  assert.match(
    ownerSources.narratives['on-record'].whyVerbatim,
    /a lot of people want to take insights from podcasts/,
  );
  assert.equal(ownerSources.narratives['on-record'].capturedAt, '2026-08-25');
  assert.equal(ownerSources.narratives['on-record'].restoredFromCommit, null);
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
  assert.equal(parsed.product.purposeContract.purpose.length > 0, true);
  assert.equal(parsed.product.purposeContract.nextAction.length > 0, true);
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

const GIT_ENVIRONMENT = {
  ...process.env,
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_CONFIG_SYSTEM: '/dev/null',
  GIT_AUTHOR_NAME: 'Fixture',
  GIT_AUTHOR_EMAIL: 'fixture@example.test',
  GIT_COMMITTER_NAME: 'Fixture',
  GIT_COMMITTER_EMAIL: 'fixture@example.test',
};

function git(cwd, args, commitDate = null) {
  return execFileSync('git', ['-C', cwd, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: commitDate
      ? { ...GIT_ENVIRONMENT, GIT_AUTHOR_DATE: commitDate, GIT_COMMITTER_DATE: commitDate }
      : GIT_ENVIRONMENT,
  });
}

function createHistoryFixtures() {
  const fleetRoot = mkdtempSync(join(tmpdir(), 'site-health-history-'));
  const completePath = join(fleetRoot, 'complete-app');
  mkdirSync(completePath, { recursive: true });
  git(completePath, ['init', '-b', 'main']);
  git(completePath, ['remote', 'add', 'origin', 'https://github.com/owner/complete-app.git']);
  for (const [index, date] of ['2026-01-05', '2026-02-10', '2026-03-15'].entries()) {
    writeFileSync(join(completePath, 'README.md'), `commit ${index}\n`);
    git(completePath, ['add', 'README.md']);
    git(completePath, ['commit', '-m', `commit ${index}`], `${date}T12:00:00+00:00`);
  }
  git(fleetRoot, [
    'clone',
    '--quiet',
    '--depth',
    '1',
    `file://${completePath}`,
    join(fleetRoot, 'shallow-app'),
  ]);
  return { fleetRoot, cleanup: () => rmSync(fleetRoot, { recursive: true, force: true }) };
}

test('retained Git history separates complete, shallow, and missing repositories', () => {
  const { fleetRoot, cleanup } = createHistoryFixtures();
  try {
    const snapshot = scanFleetRepositories(
      [
        { id: 'complete', repo: 'complete-app' },
        { id: 'shallow', repo: 'shallow-app' },
        { id: 'missing', repo: 'missing-app' },
      ],
      { fleetRoot, observedAt: '2026-03-20' },
    );

    assert.equal(snapshot.historyObservedAt, '2026-03-20');
    assert.match(snapshot.observationSemantics, /commit messages, and commit authorship are not retained/);

    assert.equal(snapshot.projects.complete.source.state, 'available');
    assert.deepEqual(snapshot.projects.complete.history, {
      firstCommitAt: '2026-01-05',
      latestCommitAt: '2026-03-15',
      retainedCommitCount: 3,
      historyCompleteness: 'complete',
      reason: null,
    });

    const shallow = snapshot.projects.shallow.history;
    assert.equal(shallow.historyCompleteness, 'incomplete');
    assert.equal(shallow.retainedCommitCount, 1);
    assert.equal(shallow.firstCommitAt, '2026-03-15');
    assert.equal(shallow.latestCommitAt, '2026-03-15');
    assert.match(shallow.reason, /Shallow checkout/);

    assert.equal(snapshot.projects.missing.source.state, 'unavailable');
    assert.deepEqual(snapshot.projects.missing.history, {
      firstCommitAt: null,
      latestCommitAt: null,
      retainedCommitCount: null,
      historyCompleteness: null,
      reason:
        'The repository checkout is not present in the Fleet workspace, so no Git history could be read.',
    });
  } finally {
    cleanup();
  }
});

test('history-only refresh leaves every other observed field untouched', () => {
  const { fleetRoot, cleanup } = createHistoryFixtures();
  try {
    const projects = [
      { id: 'complete', repo: 'complete-app' },
      { id: 'missing', repo: 'missing-app' },
    ];
    const stale = {
      schemaVersion: 1,
      observedAt: '2026-03-01',
      projects: {
        complete: {
          source: { state: 'available', path: 'complete-app', revision: 'stale-revision' },
          githubActions: [{ name: 'CI' }],
          toolingSignals: [{ name: 'pnpm', evidence: ['pnpm-lock.yaml'] }],
        },
        missing: { source: { state: 'unavailable', path: 'missing-app', revision: null } },
      },
    };

    const refreshed = refreshRetainedGitHistory(stale, {
      projects,
      fleetRoot,
      observedAt: '2026-03-20',
    });

    assert.equal(refreshed.historyObservedAt, '2026-03-20');
    assert.equal(refreshed.projects.complete.source.revision, 'stale-revision');
    assert.deepEqual(refreshed.projects.complete.githubActions, [{ name: 'CI' }]);
    assert.equal(refreshed.projects.complete.history.retainedCommitCount, 3);
    assert.equal(refreshed.projects.missing.history.historyCompleteness, null);
  } finally {
    cleanup();
  }
});

test('retained Git history audit lists catalog drift and unavailable repositories by project id', () => {
  const auditCatalog = {
    projects: [{ id: 'kept' }, { id: 'drifted' }, { id: 'gone' }, { id: 'truncated' }],
    publicDirectory: {
      projects: {
        kept: { firstCommitAt: '2026-01-05', latestCommitAt: '2026-03-15' },
        drifted: { firstCommitAt: '2026-01-05', latestCommitAt: '2026-03-15' },
        gone: { firstCommitAt: '2026-01-05', latestCommitAt: '2026-03-15' },
        truncated: { firstCommitAt: '2026-03-15', latestCommitAt: '2026-03-15' },
      },
    },
  };
  const findings = auditRetainedGitHistory({
    catalog: auditCatalog,
    operations: {
      projects: {
        kept: {
          history: {
            firstCommitAt: '2026-01-05',
            latestCommitAt: '2026-03-15',
            retainedCommitCount: 3,
            historyCompleteness: 'complete',
            reason: null,
          },
        },
        drifted: {
          history: {
            firstCommitAt: '2026-01-05',
            latestCommitAt: '2026-04-01',
            retainedCommitCount: 4,
            historyCompleteness: 'complete',
            reason: null,
          },
        },
        gone: {
          history: {
            firstCommitAt: null,
            latestCommitAt: null,
            retainedCommitCount: null,
            historyCompleteness: null,
            reason: 'checkout missing',
          },
        },
        truncated: {
          history: {
            firstCommitAt: '2026-03-15',
            latestCommitAt: '2026-03-15',
            retainedCommitCount: 1,
            historyCompleteness: 'incomplete',
            reason: 'shallow',
          },
        },
      },
    },
  });

  assert.deepEqual(
    findings.map((finding) => [finding.projectId, finding.status]),
    [
      ['drifted', 'catalog-drift'],
      ['gone', 'unavailable'],
      ['truncated', 'incomplete'],
    ],
  );
  assert.deepEqual(findings[0].mismatches, [
    { field: 'latestCommitAt', catalog: '2026-03-15', observed: '2026-04-01' },
  ]);
  assert.equal(
    auditRetainedGitHistory({
      catalog: auditCatalog,
      operations: { projects: { kept: {}, drifted: {}, gone: {}, truncated: {} } },
    }).every((finding) => finding.status === 'not-observed'),
    true,
  );
});

test('dossiers publish retained Git history with reproducible provenance', () => {
  const { intents } = parsePortfolioIntents(intentMarkdown, catalog.projects);
  const ownerSources = parseOwnerNarratives(ownerNarrativesMarkdown, catalog.projects);
  const project = catalog.projects.find((entry) => entry.id === 'anchor');
  const metadata = catalog.publicDirectory.projects.anchor;
  const build = (history) => {
    const withHistory = structuredClone(operations);
    withHistory.projects.anchor.history = history;
    const rendered = serializeProjectDossier(
      buildProjectDossier({
        catalog,
        operations: withHistory,
        project,
        operation: withHistory.projects.anchor,
        intent: intents.anchor,
        ownerNarrative: ownerSources.narratives.anchor,
        relatedNarratives: ownerSources.related.anchor,
        sourceFingerprints: {
          catalog: sha256(catalogSource),
          ownerNarratives: sha256(ownerNarrativesMarkdown),
          portfolioIntent: sha256(intentMarkdown),
        },
      }),
    );
    return validateProjectDossierYaml(rendered, 'anchor');
  };

  const matching = build({
    firstCommitAt: metadata.firstCommitAt,
    latestCommitAt: metadata.latestCommitAt,
    retainedCommitCount: 67,
    historyCompleteness: 'complete',
    reason: null,
  });
  assert.equal(matching.verification.checks.retainedGitHistory, 'passed');
  assert.equal(matching.product.retainedGitHistory.retainedCommitCount, 67);
  assert.equal(matching.product.retainedGitHistory.historyCompleteness, 'complete');
  assert.equal(matching.product.retainedGitHistory.firstCommitAt, metadata.firstCommitAt);
  assert.deepEqual(matching.verification.evidence.retainedGitHistory.catalogDrift, []);
  assert.match(
    matching.verification.evidence.retainedGitHistory.method,
    /git rev-list --count HEAD/,
  );
  assert.equal(
    matching.verification.evidence.retainedGitHistory.checkout,
    operations.projects.anchor.source.path,
  );
  assert.equal(
    matching.verification.evidence.retainedGitHistory.revision,
    operations.projects.anchor.source.revision,
  );

  const drifted = build({
    firstCommitAt: metadata.firstCommitAt,
    latestCommitAt: '2026-08-29',
    retainedCommitCount: 67,
    historyCompleteness: 'complete',
    reason: null,
  });
  assert.equal(drifted.verification.checks.retainedGitHistory, 'catalog-drift');
  assert.deepEqual(drifted.verification.evidence.retainedGitHistory.catalogDrift, [
    'latestCommitAt',
  ]);
  assert.equal(drifted.verification.evidence.retainedGitHistory.catalogLatestCommitAt, metadata.latestCommitAt);
  assert.equal(drifted.product.retainedGitHistory.latestCommitAt, '2026-08-29');

  const shallow = build({
    firstCommitAt: metadata.firstCommitAt,
    latestCommitAt: metadata.latestCommitAt,
    retainedCommitCount: 1,
    historyCompleteness: 'incomplete',
    reason: 'Shallow checkout: retained history is truncated.',
  });
  assert.equal(shallow.verification.checks.retainedGitHistory, 'incomplete');
  assert.match(shallow.verification.evidence.retainedGitHistory.reason, /Shallow checkout/);

  const unavailable = build({
    firstCommitAt: null,
    latestCommitAt: null,
    retainedCommitCount: null,
    historyCompleteness: null,
    reason: 'The repository checkout is not present in the Fleet workspace.',
  });
  assert.equal(unavailable.verification.checks.retainedGitHistory, 'unavailable');
  assert.equal(unavailable.product.retainedGitHistory.firstCommitAt, null);
  assert.equal(unavailable.product.retainedGitHistory.retainedCommitCount, null);
  assert.equal(unavailable.product.retainedGitHistory.historyCompleteness, null);
  assert.match(
    unavailable.verification.evidence.retainedGitHistory.reason,
    /not present in the Fleet workspace/,
  );
});

test('dossier validation rejects invented history for an unobserved repository', () => {
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
  dossier.product.retainedGitHistory.historyCompleteness = null;

  assert.throws(
    () => validateProjectDossierYaml(serializeProjectDossier(dossier), 'anchor'),
    /unobserved Git history must stay null/,
  );
});
