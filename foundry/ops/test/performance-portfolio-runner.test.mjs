import assert from 'node:assert/strict';
import test from 'node:test';

import {
  parseTargets,
  runPerformancePortfolio,
} from '../scripts/run-performance-portfolio.mjs';

test('parses unique canonical HTTPS performance targets', () => {
  assert.deepEqual(parseTargets([
    '--target', 'fleet-workspace=https://sassmaker.com',
    '--target', 'pace=https://heypace.app',
  ]), [
    { projectId: 'fleet-workspace', url: 'https://sassmaker.com/' },
    { projectId: 'pace', url: 'https://heypace.app/' },
  ]);
  assert.throws(
    () => parseTargets(['--target', 'pace=http://heypace.app']),
    /HTTPS URL/,
  );
});

test('runs every performance target sequentially and reports partial failure', () => {
  const calls = [];
  const messages = [];
  const result = runPerformancePortfolio([
    { projectId: 'fleet-workspace', url: 'https://sassmaker.com/' },
    { projectId: 'pace', url: 'https://heypace.app/' },
  ], {
    cliPath: '/fixture/psi-cli.js',
    cwd: '/fixture',
    log: (message) => messages.push(message),
    run: (command, args, options) => {
      calls.push({ command, args, options });
      return { status: calls.length === 1 ? 1 : 0, stderr: 'fixture failure\n', stdout: '' };
    },
  });

  assert.deepEqual(result, { completed: 1, failed: ['fleet-workspace'] });
  assert.equal(calls.length, 2);
  assert.equal(calls.every((call) => call.options.shell === false), true);
  assert.deepEqual(calls.map((call) => call.args[2]), [
    'https://sassmaker.com/',
    'https://heypace.app/',
  ]);
  assert.equal(messages.at(-1), '[2/2] pace');
});
