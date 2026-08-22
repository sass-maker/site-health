import assert from 'node:assert/strict';
import test from 'node:test';

import { loadDashboardProjects } from '../lib/dashboard-backend/registry.mjs';
import {
  inactiveProjectState,
  isCurrentProject,
  matchesProjectFilters,
  partitionProjects,
} from '../../web/src/lib/project-directory.mjs';

const projects = loadDashboardProjects();

test('Projects partitions the complete catalog without changing current scope', () => {
  const { current, inactive } = partitionProjects(projects);

  assert.equal(projects.length, 59);
  assert.equal(current.length, 32);
  assert.equal(inactive.length, 27);
  assert.equal(current.every(isCurrentProject), true);
  assert.equal(inactive.every((project) => !isCurrentProject(project)), true);
  assert.equal(current.findIndex((project) => project.priority === 'P2') > 0, true);
  assert.equal(
    current.slice(0, current.findIndex((project) => project.priority === 'P2'))
      .every((project) => project.priority === 'P1'),
    true,
  );
});

test('shared project search finds retained identities without reclassifying them', () => {
  const { current, inactive } = partitionProjects(projects);
  const criteria = { query: 'protein', priority: '', health: '' };
  const currentMatches = current.filter((project) => matchesProjectFilters({ ...project, health: 'measured' }, criteria));
  const inactiveMatches = inactive.filter((project) => matchesProjectFilters({ ...project, health: 'inactive' }, criteria));

  assert.deepEqual(currentMatches, []);
  assert.deepEqual(inactiveMatches.map((project) => project.id), ['protein-index', 'veg-protein-food']);
  assert.deepEqual(inactiveMatches.map(inactiveProjectState), ['archived', 'inactive']);
});

test('current evidence filters exclude inactive identities explicitly', () => {
  const { current, inactive } = partitionProjects(projects);
  const criteria = { query: '', priority: '', health: 'attention' };

  assert.equal(
    current.filter((project) => matchesProjectFilters({ ...project, health: 'attention' }, criteria)).length,
    current.length,
  );
  assert.equal(
    inactive.filter((project) => matchesProjectFilters({ ...project, health: 'inactive' }, criteria)).length,
    0,
  );
});
