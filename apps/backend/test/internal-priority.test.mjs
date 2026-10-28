import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { loadDashboardProjects } from '../lib/dashboard-backend/registry.mjs';
import { buildReadinessProjection } from '../lib/dashboard-backend/readiness.mjs';
import { emptyReadinessState } from '../lib/dashboard-backend/readiness-model.mjs';
import { matchesProjectFilters, partitionProjects, projectPriorityLabel, projectAudiencePriorityLabel } from '../../web/src/lib/project-directory.mjs';

// An unset investment priority must distinguish an owner exemption from a pending review.
test('catalog priority decisions reach Projects and Portfolio without altering assessments', () => {
  const directory = mkdtempSync(join(tmpdir(), 'site-health-priority-'));
  const path = join(directory, 'catalog.json');
  const row = (id, audience, priority, decision) => ({ id, name: id, family: id, audience,
    lifecycle: {status: 'active', shareable: true},
    portfolio: {status: 'active', priority, scopeDecision: {priorityDecision: decision}} });
  writeFileSync(path, JSON.stringify({projects: [
    row('internal-decided', 'internal', 'P1', {applicable: false, reason: 'Internal tool'}),
    row('internal-pending', 'internal', null),
    row('external-pending', 'public', null),
    row('external-ranked', 'public', 'P2'),
  ]}));
  const projects = loadDashboardProjects(path);
  const decided = projects[0];
  assert.equal(decided.priority, null, 'explicit exemption overrides an obsolete rank');
  assert.equal(decided.priorityApplicable, false);
  assert.equal(projectAudiencePriorityLabel(decided), 'Internal · No priority');
  assert.equal(projectPriorityLabel(projects[1]), 'Awaiting review');
  assert.equal(projectPriorityLabel(projects[2]), 'Awaiting review');
  assert.equal(projectPriorityLabel(projects[3]), 'P2');
  assert.equal(decided.lifecycle.shareable, true, 'public availability is independent');
  assert.deepEqual(projects.filter(p => matchesProjectFilters(p, {priority: 'none'})).map(p => p.id), ['internal-decided']);
  assert.deepEqual(projects.filter(p => matchesProjectFilters(p, {priority: 'unranked'})).map(p => p.id), ['internal-pending', 'external-pending']);
  assert.deepEqual(projects.filter(p => matchesProjectFilters(p, {priority: 'P2'})).map(p => p.id), ['external-ranked']);
  assert.deepEqual(partitionProjects(projects).current.map(p => p.id), ['external-ranked', 'external-pending', 'internal-pending', 'internal-decided']);
  const state = emptyReadinessState();
  const projection = buildReadinessProjection({projects, readiness: {'internal-decided': {revision: 7, updatedAt: '2026-10-29T00:00:00.000Z', state}}});
  const product = projection.projects.find(p => p.id === decided.id);
  assert.equal(product.priorityApplicable, false);
  assert.equal(product.audience, 'internal');
  assert.deepEqual(product.state, state);
  assert.equal(product.revision, 7);
});
