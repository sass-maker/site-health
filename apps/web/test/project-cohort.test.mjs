import assert from 'node:assert/strict';
import test from 'node:test';
import { scopeOutcomeRows } from '../src/lib/project-directory.mjs';
const projects = [
  { id: 'one', lifecycle: { status: 'primary' } },
  { id: 'two', lifecycle: { status: 'active' } },
  { id: 'old', lifecycle: { status: 'inactive' } },
];
test('current evidence scope derives rows and shared owner counts from lifecycle', () => {
  const rows = [{ projectId: 'one', value: 0 }, { projectId: 'old', value: 90 },
    { domain: 'shared.example', projects: [{ projectId: 'two' }, { projectId: 'old' }] },
    { domain: 'retired.example', projects: [{ projectId: 'old' }] }];
  assert.deepEqual(scopeOutcomeRows(rows, projects), [rows[0], { domain: 'shared.example', projects: [{ projectId: 'two' }] }]);
  assert.equal(rows[2].projects.length, 2);
  assert.equal(scopeOutcomeRows(rows, projects, true), rows);
});
