import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';

import {
  collectCodexSkillRunRequests,
  handleCodexStopHook,
} from '../lib/skill-run-codex-hook.mjs';

const hookScript = resolve(
  import.meta.dirname,
  '../scripts/agent-bin/record-codex-skill-run.mjs',
);

function transcriptFixture(t, entries) {
  const root = mkdtempSync(resolve(tmpdir(), 'fleet-codex-hook-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const path = resolve(root, 'transcript.jsonl');
  writeFileSync(path, `${entries.map((entry) => (
    typeof entry === 'string' ? entry : JSON.stringify(entry)
  )).join('\n')}\n`);
  return path;
}

function turnContext(turnId, overrides = {}) {
  return {
    timestamp: '2026-07-29T10:00:00.000Z',
    type: 'turn_context',
    payload: {
      turn_id: turnId,
      cwd: '/workspace/codevetter',
      model: 'gpt-5.6-sol',
      ...overrides,
    },
  };
}

function customCall(turnId, input) {
  return {
    timestamp: '2026-07-29T10:00:01.000Z',
    type: 'response_item',
    payload: {
      type: 'custom_tool_call',
      name: 'exec',
      input,
      internal_chat_message_metadata_passthrough: { turn_id: turnId },
    },
  };
}

test('Stop hook records deduplicated Fleet skill reads from only the current turn', async (t) => {
  const path = transcriptFixture(t, [
    {
      type: 'session_meta',
      payload: { id: 'session-123' },
    },
    turnContext('old-turn'),
    customCall(
      'old-turn',
      'const r = await tools.exec_command({"cmd":"sed -n 1,80p foundry/ops/skills/old-skill/SKILL.md"});',
    ),
    turnContext('current-turn'),
    {
      timestamp: '2026-07-29T10:00:00.000Z',
      type: 'event_msg',
      payload: {
        type: 'task_started',
        turn_id: 'current-turn',
        started_at: '2026-07-29T10:00:00.000Z',
      },
    },
    customCall(
      'current-turn',
      'const r = await tools.exec_command({"cmd":"sed -n 1,240p /workspace/foundry/ops/skills/site-health/SKILL.md"});',
    ),
    customCall(
      'current-turn',
      'const r = await tools.exec_command({"cmd":"cat ops/skills/site-health/SKILL.md"});',
    ),
    customCall(
      'different-explicit-turn',
      'cat foundry/ops/skills/token-budget/SKILL.md',
    ),
    {
      timestamp: '2026-07-29T10:00:02.000Z',
      type: 'response_item',
      payload: {
        type: 'function_call',
        name: 'read_file',
        arguments: {
          path: '/workspace/foundry/ops/teammates/skills/call-codex/SKILL.md',
        },
        internal_chat_message_metadata_passthrough: { turn_id: 'current-turn' },
      },
    },
    {
      timestamp: '2026-07-29T10:00:03.000Z',
      type: 'event_msg',
      payload: {
        type: 'task_complete',
        turn_id: 'current-turn',
        completed_at: '2026-07-29T10:00:03.000Z',
      },
    },
  ]);

  const result = await collectCodexSkillRunRequests({
    hook_event_name: 'Stop',
    transcript_path: path,
    last_assistant_message: '\nFinished the requested checks.\n',
    cwd: '/workspace/codevetter',
  });

  assert.equal(result.reason, 'ready');
  assert.deepEqual(
    result.requests.map((request) => request.run.skillId),
    ['call-codex', 'site-health'],
  );
  for (const request of result.requests) {
    assert.equal(request.output, '\nFinished the requested checks.\n');
    assert.deepEqual(request.metrics, []);
    assert.equal(request.run.projectId, 'codevetter');
    assert.equal(request.run.actor, 'codex');
    assert.equal(request.run.source, 'codex-hook');
    assert.equal(request.run.captureCompleteness, 'final-response');
    assert.equal(request.run.startedAt, '2026-07-29T10:00:00.000Z');
    assert.equal(request.run.finishedAt, '2026-07-29T10:00:03.000Z');
    assert.equal(request.run.metadata.sessionId, 'session-123');
    assert.equal(request.run.metadata.turnId, 'current-turn');
    assert.equal(request.run.metadata.model, 'gpt-5.6-sol');
  }
});

test('hook requests retain no transcript content or transcript path', async (t) => {
  const path = transcriptFixture(t, [
    turnContext('turn-private'),
    customCall(
      'turn-private',
      'const privateTranscriptText = "RAW-TRANSCRIPT-SECRET"; '
      + 'const r = await tools.exec_command({"cmd":"cat foundry/ops/skills/fleet-ops/SKILL.md"});',
    ),
  ]);

  const result = await collectCodexSkillRunRequests({
    hook_event_name: 'Stop',
    session_id: 'session-private',
    turn_id: 'turn-private',
    transcript_path: path,
    last_assistant_message: 'Safe final response.',
    cwd: '/workspace/fleet',
  });
  const serialized = JSON.stringify(result.requests);

  assert.equal(result.requests.length, 1);
  assert.doesNotMatch(serialized, /RAW-TRANSCRIPT-SECRET/);
  assert.doesNotMatch(serialized, new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.equal(result.requests[0].output, 'Safe final response.');
});

test('mutating mentions, other turns, malformed lines, and non-Stop events emit nothing', async (t) => {
  const path = transcriptFixture(t, [
    '{not-json',
    turnContext('turn-write'),
    {
      type: 'response_item',
      payload: {
        type: 'custom_tool_call',
        name: 'apply_patch',
        input: '*** Update File: foundry/ops/skills/fleet-ops/SKILL.md',
        internal_chat_message_metadata_passthrough: { turn_id: 'turn-write' },
      },
    },
  ]);
  const payload = {
    session_id: 'session-write',
    turn_id: 'turn-write',
    transcript_path: path,
    last_assistant_message: 'Done.',
    cwd: '/workspace/fleet',
  };

  assert.equal(
    (await collectCodexSkillRunRequests({
      ...payload,
      hook_event_name: 'PreToolUse',
    })).reason,
    'ignored-event',
  );
  assert.equal(
    (await collectCodexSkillRunRequests({
      ...payload,
      hook_event_name: 'Stop',
    })).reason,
    'no-skill-read',
  );
});

test('ambiguous skill identity and recorder failures fail open', async (t) => {
  const path = transcriptFixture(t, [
    turnContext('turn-ambiguous'),
    customCall(
      'turn-ambiguous',
      'cat foundry/ops/skills/review/SKILL.md '
      + 'foundry/ops/teammates/skills/review/SKILL.md',
    ),
  ]);
  const payload = {
    hook_event_name: 'Stop',
    session_id: 'session-ambiguous',
    turn_id: 'turn-ambiguous',
    transcript_path: path,
    last_assistant_message: 'Done.',
    cwd: '/workspace/fleet',
  };

  assert.equal(
    (await collectCodexSkillRunRequests(payload)).reason,
    'ambiguous-skills',
  );

  const validPath = transcriptFixture(t, [
    turnContext('turn-failure'),
    customCall(
      'turn-failure',
      'cat foundry/ops/skills/fleet-ops/SKILL.md',
    ),
  ]);
  const outcome = await handleCodexStopHook({
    ...payload,
    turn_id: 'turn-failure',
    transcript_path: validPath,
  }, {
    record: async () => {
      throw new Error('fixture recorder failed');
    },
  });

  assert.deepEqual(outcome, {
    reason: 'recording-failed',
    attempted: 1,
    recorded: 0,
  });
});

test('hook executable exits silently on invalid and irrelevant input', () => {
  for (const input of [
    'not-json',
    JSON.stringify({ hook_event_name: 'PreToolUse' }),
  ]) {
    const result = spawnSync(process.execPath, [hookScript], {
      input,
      encoding: 'utf8',
      timeout: 5_000,
    });
    assert.equal(result.status, 0);
    assert.equal(result.stdout, '');
    assert.equal(result.stderr, '');
  }
});
