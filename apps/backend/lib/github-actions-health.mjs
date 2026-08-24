import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { parseWorkflow } from './project-dossiers.mjs';

const execFileAsync = promisify(execFile);
const FAILURE_CONCLUSIONS = new Set([
  'action_required',
  'failure',
  'startup_failure',
  'timed_out',
]);
const EXPECTED_DIRECT_RUN_TRIGGERS = new Set(['schedule', 'push', 'pull_request']);

async function defaultGithubApi(endpoint) {
  const { stdout } = await execFileAsync('gh', ['api', endpoint], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  return JSON.parse(stdout);
}

async function mapWithConcurrency(values, limit, mapper) {
  const results = new Array(values.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(values[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, worker));
  return results;
}

function observedTimestamp(observedAt) {
  return Date.parse(observedAt.includes('T') ? observedAt : `${observedAt}T23:59:59Z`);
}

function runAgeDays(run, observedAt) {
  if (!run?.created_at) return null;
  return Math.max(
    0,
    Math.floor((observedTimestamp(observedAt) - Date.parse(run.created_at)) / (24 * 60 * 60 * 1000)),
  );
}

function compactRun(run) {
  if (!run) return null;
  return {
    id: run.id,
    status: run.status,
    conclusion: run.conclusion,
    event: run.event,
    branch: run.head_branch,
    headSha: run.head_sha,
    createdAt: run.created_at,
    updatedAt: run.updated_at,
    url: run.html_url,
  };
}

export function classifyWorkflowHealth({ workflow, apiWorkflow, latestRun, observedAt, staleDays }) {
  if (!apiWorkflow) {
    return {
      health: 'unverifiable',
      reason: 'tracked workflow was not present in the repository Actions API',
      apiState: null,
      lastRun: null,
      ageDays: null,
    };
  }
  if (apiWorkflow.state !== 'active') {
    return {
      health: 'disabled',
      reason: `GitHub workflow state is ${apiWorkflow.state}`,
      apiState: apiWorkflow.state,
      lastRun: compactRun(latestRun),
      ageDays: null,
    };
  }
  if (!latestRun) {
    const expectsDirectRun = workflow.triggers.some((trigger) =>
      EXPECTED_DIRECT_RUN_TRIGGERS.has(trigger),
    );
    return {
      health: expectsDirectRun ? 'never-run' : 'manual-or-reusable-never-run',
      reason: expectsDirectRun
        ? 'no workflow run was returned by GitHub'
        : 'no direct run observed; workflow is manual, reusable, generated, or has no static trigger',
      apiState: apiWorkflow.state,
      lastRun: null,
      ageDays: null,
    };
  }

  const ageDays = runAgeDays(latestRun, observedAt);
  if (FAILURE_CONCLUSIONS.has(latestRun.conclusion)) {
    return {
      health: 'failing',
      reason: `latest run concluded ${latestRun.conclusion}`,
      apiState: apiWorkflow.state,
      lastRun: compactRun(latestRun),
      ageDays,
    };
  }
  if (latestRun.conclusion === 'cancelled') {
    return {
      health: 'cancelled',
      reason: 'latest run was cancelled',
      apiState: apiWorkflow.state,
      lastRun: compactRun(latestRun),
      ageDays,
    };
  }
  if (latestRun.status !== 'completed') {
    return {
      health: ageDays >= 1 ? 'stuck' : 'running',
      reason:
        ageDays >= 1
          ? `latest run has remained ${latestRun.status} for ${ageDays} day(s)`
          : `latest run is ${latestRun.status}`,
      apiState: apiWorkflow.state,
      lastRun: compactRun(latestRun),
      ageDays,
    };
  }
  if (ageDays > staleDays) {
    return {
      health: 'stale',
      reason: `latest run is ${ageDays} days old`,
      apiState: apiWorkflow.state,
      lastRun: compactRun(latestRun),
      ageDays,
    };
  }
  return {
    health: 'healthy',
    reason: `latest run concluded ${latestRun.conclusion ?? 'without a conclusion'}`,
    apiState: apiWorkflow.state,
    lastRun: compactRun(latestRun),
    ageDays,
  };
}

export function scheduleFreshnessDays(schedules, fallbackDays = 30) {
  if (!schedules?.length) return fallbackDays;
  const thresholds = schedules.map((expression) => {
    const fields = expression.trim().split(/\s+/);
    if (fields.length !== 5) return fallbackDays;
    const [minute, hour, dayOfMonth, month, dayOfWeek] = fields;
    if (month !== '*') return 100;
    if (dayOfMonth !== '*' && dayOfWeek === '*') {
      return dayOfMonth.includes(',') || dayOfMonth.includes('/') ? 20 : 35;
    }
    if (dayOfWeek !== '*' && dayOfMonth === '*') return 9;
    if (hour === '*' || minute === '*' || hour.includes(',') || hour.includes('/')) return 1;
    return 2;
  });
  return Math.min(...thresholds);
}

export function classifyScheduleHealth({
  workflow,
  apiWorkflow,
  latestRun,
  latestScheduledRun,
  observedAt,
  staleDays,
}) {
  if (!workflow.triggers.includes('schedule')) {
    return { health: 'not-applicable', reason: 'workflow has no schedule trigger', lastRun: null };
  }
  if (!apiWorkflow || apiWorkflow.state !== 'active') {
    return {
      health: 'unverifiable',
      reason: apiWorkflow ? `GitHub workflow state is ${apiWorkflow.state}` : 'workflow is absent remotely',
      lastRun: compactRun(latestScheduledRun),
    };
  }
  if (!latestScheduledRun) {
    return { health: 'never-run', reason: 'no scheduled run was returned by GitHub', lastRun: null };
  }
  const ageDays = runAgeDays(latestScheduledRun, observedAt);
  if (FAILURE_CONCLUSIONS.has(latestScheduledRun.conclusion)) {
    if (
      latestRun?.event === 'workflow_dispatch' &&
      latestRun.conclusion === 'success' &&
      Date.parse(latestRun.created_at) > Date.parse(latestScheduledRun.created_at)
    ) {
      return {
        health: 'recovered-manually',
        reason: 'a newer manual run succeeded after the failed scheduled run',
        lastRun: compactRun(latestScheduledRun),
        recoveryRun: compactRun(latestRun),
        ageDays,
      };
    }
    return {
      health: 'failing',
      reason: `latest scheduled run concluded ${latestScheduledRun.conclusion}`,
      lastRun: compactRun(latestScheduledRun),
      ageDays,
    };
  }
  if (latestScheduledRun.status !== 'completed') {
    return {
      health: ageDays >= 1 ? 'stuck' : 'running',
      reason: `latest scheduled run is ${latestScheduledRun.status}`,
      lastRun: compactRun(latestScheduledRun),
      ageDays,
    };
  }
  const freshnessDays = scheduleFreshnessDays(workflow.schedules, staleDays);
  if (ageDays > freshnessDays) {
    return {
      health: 'missed',
      reason: `last scheduled run is ${ageDays} days old; expected within ${freshnessDays} day(s)`,
      lastRun: compactRun(latestScheduledRun),
      ageDays,
      freshnessDays,
    };
  }
  return {
    health: 'healthy',
    reason: `latest scheduled run concluded ${latestScheduledRun.conclusion ?? 'without a conclusion'}`,
    lastRun: compactRun(latestScheduledRun),
    ageDays,
    freshnessDays,
  };
}

export function classifyDefaultBranchHealth({
  workflow,
  apiWorkflow,
  latestPushRun,
  defaultBranch,
  defaultBranchSha,
  observedAt,
}) {
  if (!workflow.triggers.includes('push')) {
    return { health: 'not-applicable', reason: 'workflow has no push trigger', lastRun: null };
  }
  if (!apiWorkflow || apiWorkflow.state !== 'active' || !defaultBranchSha) {
    return {
      health: 'unverifiable',
      reason: !defaultBranchSha
        ? 'default branch revision could not be resolved'
        : apiWorkflow
          ? `GitHub workflow state is ${apiWorkflow.state}`
          : 'workflow is absent remotely',
      lastRun: compactRun(latestPushRun),
    };
  }
  if (!latestPushRun || latestPushRun.head_sha !== defaultBranchSha) {
    return {
      health: 'missing',
      reason: latestPushRun
        ? `no push run at current ${defaultBranch} revision ${defaultBranchSha.slice(0, 7)}`
        : `no push run was returned for ${defaultBranch}`,
      lastRun: compactRun(latestPushRun),
    };
  }
  const ageDays = runAgeDays(latestPushRun, observedAt);
  if (FAILURE_CONCLUSIONS.has(latestPushRun.conclusion)) {
    return {
      health: 'failing',
      reason: `current ${defaultBranch} push concluded ${latestPushRun.conclusion}`,
      lastRun: compactRun(latestPushRun),
      ageDays,
    };
  }
  if (latestPushRun.status !== 'completed') {
    return {
      health: ageDays >= 1 ? 'stuck' : 'running',
      reason: `current ${defaultBranch} push is ${latestPushRun.status}`,
      lastRun: compactRun(latestPushRun),
      ageDays,
    };
  }
  return {
    health: latestPushRun.conclusion === 'success' ? 'healthy' : 'unverifiable',
    reason: `current ${defaultBranch} push concluded ${latestPushRun.conclusion}`,
    lastRun: compactRun(latestPushRun),
    ageDays,
  };
}

function ownerDisposition(policy, workflow) {
  if (policy?.disposition === 'ignored') {
    return { status: 'ignored', reason: policy.reason };
  }
  if (workflow.inventory.source === 'github-generated') {
    return { status: 'managed', reason: 'GitHub-generated workflow' };
  }
  if (workflow.inventory.source === 'remote-only') {
    return {
      status: 'needs-reconciliation',
      reason: 'workflow exists in GitHub but not in the local working tree',
    };
  }
  return { status: 'active', reason: policy?.reason ?? 'tracked workflow' };
}

function workflowAttention(workflow) {
  if (workflow.ownerDisposition.status === 'ignored') return 'ignored';
  if (workflow.ownerDisposition.status === 'managed') return 'clear';
  if (workflow.ownerDisposition.status === 'needs-reconciliation') return 'reconcile';
  if (
    ['failing', 'stuck', 'unverifiable'].includes(workflow.currentDefaultBranch?.health) ||
    ['failing', 'missed', 'stuck', 'unverifiable'].includes(
      workflow.schedule?.health,
    )
  ) {
    return 'action-required';
  }
  if (workflow.live?.health === 'failing') {
    const automatic = workflow.triggers.some((trigger) =>
      ['push', 'pull_request', 'schedule', 'workflow_run'].includes(trigger),
    );
    return automatic ? 'action-required' : 'review-history';
  }
  if (workflow.live?.health === 'stuck') return 'action-required';
  if (['disabled', 'unverifiable'].includes(workflow.live?.health)) return 'action-required';
  if (workflow.schedule?.health === 'never-run') return 'missing-data';
  if (workflow.currentDefaultBranch?.health === 'missing') return 'missing-data';
  return 'clear';
}

async function readRemoteWorkflow(repository, apiWorkflow, defaultBranch, githubApi) {
  if (!apiWorkflow.path.startsWith('.github/workflows/')) return null;
  try {
    const response = await githubApi(
      `repos/${repository}/contents/${apiWorkflow.path}?ref=${encodeURIComponent(defaultBranch)}`,
    );
    if (response.encoding !== 'base64' || !response.content) return null;
    return parseWorkflow(Buffer.from(response.content, 'base64').toString('utf8'), apiWorkflow.path);
  } catch {
    return null;
  }
}

async function repositoryWorkflowHealth(
  operation,
  { observedAt, staleDays, projectPolicy, githubApi = defaultGithubApi },
) {
  const repository = operation.source.repositorySlug;
  if (!repository) {
    return {
      workflows: operation.githubActions.map((workflow) => ({
        ...workflow,
        inventory: { source: 'tracked', local: true, remote: false },
        ownerDisposition: ownerDisposition(projectPolicy, { inventory: { source: 'tracked' } }),
        attention: 'action-required',
        live: {
          health: 'unverifiable',
          reason: 'GitHub repository slug is unavailable',
          apiState: null,
          lastRun: null,
          ageDays: null,
        },
      })),
      meta: {
        repository,
        defaultBranch: null,
        defaultBranchSha: null,
        homepage: null,
        query: 'unverifiable',
        disposition: projectPolicy ?? { disposition: 'active', reason: 'tracked project' },
      },
    };
  }

  try {
    const [workflowResponse, runResponse, repositoryResponse] = await Promise.all([
      githubApi(`repos/${repository}/actions/workflows?per_page=100`),
      githubApi(`repos/${repository}/actions/runs?per_page=100`),
      githubApi(`repos/${repository}`),
    ]);
    const defaultBranch = repositoryResponse.default_branch;
    const defaultBranchResponse = defaultBranch
      ? await githubApi(`repos/${repository}/commits/${encodeURIComponent(defaultBranch)}`)
      : null;
    const defaultBranchSha = defaultBranchResponse?.sha ?? null;
    const apiWorkflows = new Map(
      (workflowResponse.workflows ?? []).map((workflow) => [workflow.path, workflow]),
    );
    const runsByWorkflow = new Map();
    for (const run of runResponse.workflow_runs ?? []) {
      if (!runsByWorkflow.has(run.workflow_id)) runsByWorkflow.set(run.workflow_id, run);
    }

    const localFiles = new Set(operation.githubActions.map((workflow) => workflow.file));
    const workflows = operation.githubActions.map((workflow) => ({
      ...workflow,
      schedules: workflow.schedules ?? [],
      inventory: {
        source: 'tracked',
        local: true,
        remote: apiWorkflows.has(workflow.file),
      },
    }));
    for (const apiWorkflow of workflowResponse.workflows ?? []) {
      if (localFiles.has(apiWorkflow.path)) continue;
      const parsed = await readRemoteWorkflow(repository, apiWorkflow, defaultBranch, githubApi);
      workflows.push({
        name: parsed?.name ?? apiWorkflow.name,
        file: apiWorkflow.path,
        triggers: parsed?.triggers ?? [],
        schedules: parsed?.schedules ?? [],
        inventory: {
          source: apiWorkflow.path.startsWith('dynamic/') ? 'github-generated' : 'remote-only',
          local: false,
          remote: true,
        },
      });
    }

    const enriched = await mapWithConcurrency(workflows, 4, async (workflow) => {
      const apiWorkflow = apiWorkflows.get(workflow.file);
      let latestRun = apiWorkflow ? runsByWorkflow.get(apiWorkflow.id) : null;
      if (apiWorkflow && !latestRun) {
        const response = await githubApi(
          `repos/${repository}/actions/workflows/${apiWorkflow.id}/runs?per_page=1`,
        );
        latestRun = response.workflow_runs?.[0] ?? null;
      }
      let latestScheduledRun = latestRun?.event === 'schedule' ? latestRun : null;
      if (apiWorkflow && workflow.triggers.includes('schedule')) {
        if (!latestScheduledRun) {
          const response = await githubApi(
            `repos/${repository}/actions/workflows/${apiWorkflow.id}/runs?event=schedule&per_page=1`,
          );
          latestScheduledRun = response.workflow_runs?.[0] ?? null;
        }
      }
      let latestPushRun =
        latestRun?.event === 'push' && latestRun.head_branch === defaultBranch ? latestRun : null;
      if (apiWorkflow && defaultBranch && workflow.triggers.includes('push')) {
        if (!latestPushRun) {
          const response = await githubApi(
            `repos/${repository}/actions/workflows/${apiWorkflow.id}/runs?branch=${encodeURIComponent(defaultBranch)}&event=push&per_page=1`,
          );
          latestPushRun = response.workflow_runs?.[0] ?? null;
        }
      }
      const enrichedWorkflow = {
        ...workflow,
        ownerDisposition: ownerDisposition(projectPolicy, workflow),
        live: classifyWorkflowHealth({
          workflow,
          apiWorkflow,
          latestRun,
          observedAt,
          staleDays,
        }),
        schedule: classifyScheduleHealth({
          workflow,
          apiWorkflow,
          latestRun,
          latestScheduledRun,
          observedAt,
          staleDays,
        }),
        currentDefaultBranch: classifyDefaultBranchHealth({
          workflow,
          apiWorkflow,
          latestPushRun,
          defaultBranch,
          defaultBranchSha,
          observedAt,
        }),
      };
      enrichedWorkflow.attention = workflowAttention(enrichedWorkflow);
      return enrichedWorkflow;
    });

    return {
      workflows: enriched.sort((left, right) => left.file.localeCompare(right.file)),
      meta: {
        repository,
        defaultBranch,
        defaultBranchSha,
        homepage: repositoryResponse.homepage || null,
        query: 'verified',
        disposition: projectPolicy ?? { disposition: 'active', reason: 'tracked project' },
      },
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message.split('\n')[0] : 'GitHub query failed';
    return {
      workflows: operation.githubActions.map((workflow) => ({
        ...workflow,
        schedules: workflow.schedules ?? [],
        inventory: { source: 'tracked', local: true, remote: false },
        ownerDisposition: ownerDisposition(projectPolicy, { inventory: { source: 'tracked' } }),
        attention: 'action-required',
        live: {
          health: 'unverifiable',
          reason,
          apiState: null,
          lastRun: null,
          ageDays: null,
        },
      })),
      meta: {
        repository,
        defaultBranch: null,
        defaultBranchSha: null,
        homepage: null,
        query: 'unverifiable',
        reason,
        disposition: projectPolicy ?? { disposition: 'active', reason: 'tracked project' },
      },
    };
  }
}

export async function refreshGithubActionsHealth(
  operations,
  {
    observedAt,
    staleDays = 30,
    policies = { projects: {} },
    githubApi = defaultGithubApi,
    concurrency = 6,
  },
) {
  const entries = Object.entries(operations.projects);
  const refreshed = await mapWithConcurrency(entries, concurrency, async ([projectId, operation]) => {
    const result = await repositoryWorkflowHealth(operation, {
      observedAt,
      staleDays,
      projectPolicy: policies.projects?.[projectId],
      githubApi,
    });
    return [
      projectId,
      {
        ...operation,
        githubActions: result.workflows,
        githubActionsMeta: result.meta,
      },
    ];
  });

  return {
    ...operations,
    githubObservedAt: observedAt,
    githubStaleAfterDays: staleDays,
    githubPolicySchemaVersion: policies.schemaVersion ?? null,
    projects: Object.fromEntries(refreshed),
  };
}

export function summarizeGithubActions(workflows) {
  return workflows.reduce((summary, workflow) => {
    const health = workflow.live?.health ?? 'unverifiable';
    summary[health] = (summary[health] ?? 0) + 1;
    return summary;
  }, {});
}
