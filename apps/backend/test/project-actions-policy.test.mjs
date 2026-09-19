import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { refreshGithubActionsHealth } from '../lib/github-actions-health.mjs';

const policies = JSON.parse(
  readFileSync(new URL('../config/project-actions-policy.json', import.meta.url), 'utf8'),
);

for (const [projectId, expectedDisposition, expectedAttention] of [
  ['nomad-data-adventure', 'ignored', 'ignored'],
  ['shoulders', 'ignored', 'ignored'],
  ['active-control', 'active', 'action-required'],
]) {
  test(`${projectId} attention follows policy without hiding workflow failures`, async () => {
    const repository = `owner/${projectId}`;
    const run = {
      id: 10,
      workflow_id: 1,
      status: 'completed',
      conclusion: 'failure',
      event: 'push',
      head_branch: 'main',
      head_sha: 'abc123',
      created_at: '2026-09-19T07:00:00Z',
      updated_at: '2026-09-19T07:01:00Z',
      html_url: `https://github.com/${repository}/actions/runs/10`,
    };
    const operations = {
      schemaVersion: 1,
      projects: {
        [projectId]: {
          source: { repositorySlug: repository },
          githubActions: [{
            name: 'CI',
            file: '.github/workflows/ci.yml',
            triggers: ['push'],
            schedules: [],
          }],
        },
      },
    };
    const responses = new Map([
      [`repos/${repository}`, { default_branch: 'main' }],
      [`repos/${repository}/commits/main`, { sha: 'abc123' }],
      [`repos/${repository}/actions/workflows?per_page=100`, {
        workflows: [{ id: 1, name: 'CI', path: '.github/workflows/ci.yml', state: 'active' }],
      }],
      [`repos/${repository}/actions/runs?per_page=100`, { workflow_runs: [run] }],
    ]);
    const refreshed = await refreshGithubActionsHealth(operations, {
      observedAt: '2026-09-19T12:00:00Z',
      policies,
      githubApi: async (endpoint) => {
        assert.ok(responses.has(endpoint), `unexpected GitHub endpoint: ${endpoint}`);
        return responses.get(endpoint);
      },
    });

    const project = refreshed.projects[projectId];
    assert.equal(project.githubActionsMeta.query, 'verified');
    assert.equal(project.githubActionsMeta.disposition.disposition, expectedDisposition);
    assert.equal(project.githubActions.length, 1);
    const [workflow] = project.githubActions;
    assert.equal(workflow.ownerDisposition.status, expectedDisposition);
    assert.equal(workflow.attention, expectedAttention);
    assert.equal(workflow.live.health, 'failing');
    assert.equal(workflow.currentDefaultBranch.health, 'failing');
    assert.equal(workflow.live.lastRun.url, run.html_url);
    assert.equal(workflow.currentDefaultBranch.lastRun.headSha, run.head_sha);
    assert.equal(workflow.live.apiState, 'active');
    assert.deepEqual(workflow.triggers, ['push']);
    if (expectedDisposition === 'ignored') {
      assert.match(workflow.ownerDisposition.reason, /inactive/);
      assert.match(workflow.ownerDisposition.reason, /CI\/deploy workflows remain/);
    }
  });
}
