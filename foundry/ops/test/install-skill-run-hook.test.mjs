import assert from 'node:assert/strict';
import { test } from 'node:test';

import { mergeSkillRunHook } from '../scripts/install-skill-run-hook.mjs';

test('installs one Fleet Stop hook while preserving unrelated hooks', () => {
  const existing = {
    description: 'keep me',
    hooks: {
      PreToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: 'existing-pre' }] }],
      Stop: [
        { hooks: [{ type: 'command', command: 'existing-stop' }] },
        {
          hooks: [
            {
              type: 'command',
              command: '/usr/bin/env node /old/record-codex-skill-run.mjs',
            },
          ],
        },
      ],
    },
  };

  const merged = mergeSkillRunHook(existing, {
    commandPath: '/repo/foundry/ops/scripts/agent-bin/record-codex-skill-run.mjs',
  });

  assert.equal(merged.description, 'keep me');
  assert.deepEqual(merged.hooks.PreToolUse, existing.hooks.PreToolUse);
  assert.equal(merged.hooks.Stop.length, 2);
  assert.equal(merged.hooks.Stop[0].hooks[0].command, 'existing-stop');
  assert.match(merged.hooks.Stop[1].hooks[0].command, /\/repo\/foundry\/ops\/scripts\/agent-bin\/record-codex-skill-run\.mjs/);
  assert.equal(existing.hooks.Stop.length, 2, 'input is not mutated');
});
