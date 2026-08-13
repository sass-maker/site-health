import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildIssueSearchArgs,
  auditProjectItems,
  extractProjectUrls,
  parseArgs,
  planQueueSync,
  sanitizeError,
  syncPriorityQueue,
} from '../scripts/github-priority-queue.mjs';

function result(status, stdout = '', stderr = '') {
  return { status, stdout, stderr };
}

function createGhMock({ discovered = [], existing = [], addFailures = new Set() } = {}) {
  const calls = [];
  const run = (_command, args) => {
    calls.push(args);
    if (args[0] === 'api') return result(0, 'sarthakagrawal927\n');
    if (args[0] === 'project' && args[1] === 'view') {
      return result(0, JSON.stringify({ number: 1, title: 'Sarthak Priority Queue' }));
    }
    if (args[0] === 'search') {
      return result(0, JSON.stringify(discovered.map((url) => ({ url }))));
    }
    if (args[0] === 'project' && args[1] === 'item-list') {
      return result(
        0,
        JSON.stringify({
          items: existing.map((url) => ({
            content: { url },
            priority: 'P2 — Soon',
            'reasoning complexity': 'R2 — Judgment',
          })),
        }),
      );
    }
    if (args[0] === 'project' && args[1] === 'item-add') {
      const url = args[args.indexOf('--url') + 1];
      return addFailures.has(url)
        ? result(1, '', `permission denied for ${url}`)
        : result(0, JSON.stringify({ id: `item-${calls.length}` }));
    }
    return result(1, '', `unexpected command: ${args.join(' ')}`);
  };
  return { calls, run };
}

const baseOptions = {
  owner: 'sarthakagrawal927',
  project: 1,
  author: 'sarthakagrawal927',
  limit: 1_000,
};

test('parses an explicit dry-run-by-default invocation', () => {
  assert.deepEqual(
    parseArgs([
      '--owner',
      'sarthakagrawal927',
      '--project',
      '1',
      '--author',
      'sarthakagrawal927',
    ]),
    { ...baseOptions, apply: false },
  );
  assert.throws(() => parseArgs(['--owner', 'x']), /--project/);
});

test('builds a global open authored-issue query', () => {
  assert.deepEqual(buildIssueSearchArgs('octocat', 75), [
    'search',
    'issues',
    '--author',
    'octocat',
    '--state',
    'open',
    '--limit',
    '75',
    '--json',
    'url',
  ]);
});

test('extracts original issue URLs and plans without duplicates', () => {
  const existing = extractProjectUrls({
    items: [{ content: { url: 'https://github.com/acme/app/issues/1' } }],
  });
  assert.deepEqual(
    planQueueSync(
      [
        'https://github.com/acme/app/issues/1',
        'https://github.com/acme/app/issues/2',
        'https://github.com/acme/app/issues/2',
      ],
      existing,
    ),
    {
      discovered: [
        'https://github.com/acme/app/issues/1',
        'https://github.com/acme/app/issues/2',
      ],
      missing: ['https://github.com/acme/app/issues/2'],
      unchanged: 1,
    },
  );
});

test('audits unreviewed metadata and blocked P0 contradictions without guessing values', () => {
  const reviewed = 'https://github.com/acme/app/issues/1';
  const unreviewed = 'https://github.com/acme/app/issues/2';
  assert.deepEqual(
    auditProjectItems({
      items: [
        {
          content: { url: reviewed },
          priority: 'P0 — Now',
          'reasoning complexity': 'R2 — Judgment',
          labels: ['blocked'],
        },
        { content: { url: unreviewed } },
      ],
    }),
    {
      missingPriority: [unreviewed],
      missingReasoningComplexity: [unreviewed],
      blockedOrDeferredP0: [reviewed],
      reviewRequired: 1,
    },
  );
});

test('dry run reports missing work without adding items', () => {
  const first = 'https://github.com/acme/app/issues/1';
  const second = 'https://github.com/other/tool/issues/2';
  const gh = createGhMock({ discovered: [first, second], existing: [first] });
  const lines = [];

  const output = syncPriorityQueue(baseOptions, { run: gh.run, write: (line) => lines.push(line) });

  assert.deepEqual(output.summary, {
    mode: 'dry-run',
    discovered: 2,
    missing: 1,
    added: 0,
    unchanged: 1,
    failed: 0,
    reviewRequired: 1,
    blockedOrDeferredP0: 0,
  });
  assert.equal(gh.calls.filter((args) => args[1] === 'item-add').length, 0);
  assert.match(lines[0], /mode=dry-run discovered=2 missing=1/);
});

test('apply mode adds only missing items and is idempotent when all exist', () => {
  const first = 'https://github.com/acme/app/issues/1';
  const second = 'https://github.com/other/tool/issues/2';
  const gh = createGhMock({ discovered: [first, second], existing: [first] });
  const applied = syncPriorityQueue({ ...baseOptions, apply: true }, { run: gh.run, write() {} });

  assert.equal(applied.summary.added, 1);
  assert.deepEqual(
    gh.calls.filter((args) => args[1] === 'item-add').map((args) => args[args.indexOf('--url') + 1]),
    [second],
  );

  const idempotentGh = createGhMock({ discovered: [first, second], existing: [first, second] });
  const idempotent = syncPriorityQueue(
    { ...baseOptions, apply: true },
    { run: idempotentGh.run, write() {} },
  );
  assert.deepEqual(idempotent.summary, {
    mode: 'apply',
    discovered: 2,
    missing: 0,
    added: 0,
    unchanged: 2,
    failed: 0,
    reviewRequired: 0,
    blockedOrDeferredP0: 0,
  });
});

test('apply mode continues after item failures and exits unsuccessfully', () => {
  const first = 'https://github.com/acme/app/issues/1';
  const second = 'https://github.com/other/tool/issues/2';
  const gh = createGhMock({
    discovered: [first, second],
    addFailures: new Set([first]),
  });
  const lines = [];

  const output = syncPriorityQueue(
    { ...baseOptions, apply: true },
    { run: gh.run, write: (line) => lines.push(line) },
  );

  assert.equal(output.exitCode, 1);
  assert.equal(output.summary.added, 1);
  assert.equal(output.summary.failed, 1);
  assert.equal(gh.calls.filter((args) => args[1] === 'item-add').length, 2);
  assert.match(lines.at(-1), new RegExp(first));
});

test('missing Project scope fails before discovery with an actionable command', () => {
  const calls = [];
  const run = (_command, args) => {
    calls.push(args);
    if (args[0] === 'api') return result(0, 'sarthakagrawal927\n');
    return result(1, '', 'missing required scopes [read:project]');
  };

  assert.throws(
    () => syncPriorityQueue(baseOptions, { run, write() {} }),
    /gh auth refresh -h github\.com -s project/,
  );
  assert.equal(calls.some((args) => args[0] === 'search'), false);
});

test('redacts common GitHub credential forms from errors', () => {
  assert.equal(
    sanitizeError('token gho_secretvalue and Bearer abc.def'),
    'token [redacted] and [redacted]',
  );
});
