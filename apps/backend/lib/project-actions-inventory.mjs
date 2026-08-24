function cell(value) {
  return String(value ?? '—')
    .replaceAll('|', '\\|')
    .replaceAll('\n', ' ');
}

function linkedWorkflow(workflow) {
  const url = workflow.live?.lastRun?.url;
  return url ? `[${cell(workflow.name)}](${url})` : cell(workflow.name);
}

function compactRunState(state) {
  if (!state) return 'unverified';
  const date = state.lastRun?.createdAt?.slice(0, 10);
  return date ? `${state.health} (${date})` : state.health;
}

function workflowRows(operations) {
  return Object.entries(operations.projects)
    .flatMap(([projectId, operation]) =>
      (operation.githubActions ?? []).map((workflow) => ({ projectId, operation, workflow })),
    )
    .sort(
      (left, right) =>
        left.projectId.localeCompare(right.projectId) ||
        left.workflow.file.localeCompare(right.workflow.file),
    );
}

function countBy(rows, getKey) {
  return rows.reduce((summary, row) => {
    const key = getKey(row);
    summary[key] = (summary[key] ?? 0) + 1;
    return summary;
  }, {});
}

export function renderProjectActionsInventory(operations) {
  const rows = workflowRows(operations);
  const scheduled = rows.filter(({ workflow }) => workflow.triggers.includes('schedule'));
  const attention = countBy(rows, ({ workflow }) => workflow.attention ?? 'unclassified');
  const inventory = countBy(rows, ({ workflow }) => workflow.inventory?.source ?? 'unknown');
  const lines = [
    '# Fleet GitHub Actions inventory',
    '',
    `Observed through the GitHub API at \`${operations.githubObservedAt ?? 'not refreshed'}\`. ` +
      'This is the agent-visible index for every locally tracked, GitHub-generated, and remote-only workflow. ' +
      'The per-project YAML files remain canonical for project context and evidence.',
    '',
    'Dossier contract: [`schema.json`](./schema.json). Verification means evidence was collected and attributed; workflow health is reported separately.',
    '',
    `- Workflows: ${rows.length}`,
    `- Cron/scheduled workflows: ${scheduled.length}`,
    `- Attention: ${Object.entries(attention)
      .sort()
      .map(([key, count]) => `${key} ${count}`)
      .join(', ')}`,
    `- Inventory sources: ${Object.entries(inventory)
      .sort()
      .map(([key, count]) => `${key} ${count}`)
      .join(', ')}`,
    '',
    '“Latest” is the latest run of any trigger. “Default branch” checks the latest push run against the exact current default-branch SHA. “Schedule” queries scheduled runs separately so a manual dispatch cannot hide a stopped cron.',
    '',
    '## All workflows',
    '',
    '| Project | Workflow | File | Inventory | API | Triggers | Cron | Latest | Default branch | Schedule | Disposition | Attention |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ];

  for (const { projectId, workflow } of rows) {
    lines.push(
      `| [${projectId}](./${projectId}.yaml) | ${linkedWorkflow(workflow)} | \`${cell(workflow.file)}\` | ${cell(workflow.inventory?.source)} | ${cell(workflow.live?.apiState)} | ${cell(workflow.triggers.join(', ') || 'unknown')} | ${cell(workflow.schedules.join('<br>') || '—')} | ${cell(compactRunState(workflow.live))} | ${cell(compactRunState(workflow.currentDefaultBranch))} | ${cell(compactRunState(workflow.schedule))} | ${cell(workflow.ownerDisposition?.status)} | ${cell(workflow.attention)} |`,
    );
  }

  lines.push(
    '',
    '## Cron and schedule view',
    '',
    '| Project | Workflow | Cron | Latest scheduled run | Schedule health | Owner disposition |',
    '| --- | --- | --- | --- | --- | --- |',
  );
  for (const { projectId, workflow } of scheduled) {
    const run = workflow.schedule?.lastRun;
    const runCell = run?.url
      ? `[${run.createdAt?.slice(0, 10) ?? 'run'}](${run.url})`
      : run?.createdAt?.slice(0, 10) ?? '—';
    lines.push(
      `| [${projectId}](./${projectId}.yaml) | ${cell(workflow.name)} | ${cell(workflow.schedules.join('<br>') || 'unknown')} | ${runCell} | ${cell(workflow.schedule?.health)} | ${cell(workflow.ownerDisposition?.status)} |`,
    );
  }

  lines.push(
    '',
    '## Interpretation',
    '',
    '- `action-required`: current default-branch evidence is failing/missing, a schedule is failing/missed, or the workflow cannot be verified.',
    '- `review-history`: the latest manual-only run failed, but it is not evidence that current `main` is broken.',
    '- `missing-data`: no exact push run exists at the current default-branch SHA; this remains visible without being mislabeled as a failure.',
    '- `reconcile`: GitHub exposes a workflow that is absent from the local working tree.',
    '- `ignored`: explicit owner disposition; retained as evidence rather than hidden.',
    '- `managed`: GitHub-generated automation such as Dependabot or Pages build workflows.',
    '',
  );
  return `${lines.join('\n').trimEnd()}\n`;
}
