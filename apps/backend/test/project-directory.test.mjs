import assert from 'node:assert/strict';
import test from 'node:test';

import { loadDashboardProjects } from '../lib/dashboard-backend/registry.mjs';
import {
  inactiveProjectState,
  isCurrentProject,
  matchesProjectFilters,
  partitionProjects,
  projectSharingLabel,
} from '../../web/src/lib/project-directory.mjs';

const projects = loadDashboardProjects();

test('Projects partitions the complete catalog without changing current scope', () => {
  const { current, inactive } = partitionProjects(projects);

  assert.equal(projects.length, 57);
  assert.equal(current.length, 22);
  assert.equal(inactive.length, 35);
  assert.equal(current.every(isCurrentProject), true);
  assert.equal(current.some(project => project.id === 'kith'), true);
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

test('sharing is independent of development status and fails closed for missing evidence', () => {
  const fixtures = [
    { name: 'Active tool', lifecycle: { status: 'active', shareable: false } },
    { name: 'Retained tool', lifecycle: { status: 'inactive', shareable: true } },
    { name: 'Unknown tool' },
  ];
  assert.deepEqual(fixtures.filter(p => matchesProjectFilters(p, { sharing: 'shareable' })).map(p => p.name), ['Retained tool']);
  assert.deepEqual(fixtures.filter(p => matchesProjectFilters(p, { sharing: 'not-shareable' })).map(p => p.name), ['Active tool', 'Unknown tool']);
  assert.equal(projectSharingLabel(fixtures[2]), 'Not shareable');
  assert.equal(matchesProjectFilters({ ...fixtures[1], priority: 'P4', health: 'inactive' }, { query: 'retained', priority: 'P4', health: 'inactive', sharing: 'shareable' }), true);
  assert.equal(matchesProjectFilters({ ...fixtures[1], health: 'inactive' }, { health: 'attention', sharing: 'shareable' }), false);
});

test('registry retains canonical experiment rationale without making it shareable', () => {
  for (const id of ['reel-pipeline', 'forecast-lab']) {
    const project = projects.find(p => p.id === id);
    assert.equal(project.lifecycle.shareable, false);
    assert.match(project.sharingReadiness.reason, /experiment/);
    assert.equal(project.lifecycle.resumeCondition, null);
  }
});

test('lifecycle and resume filters use their own fields, including non-null conditions', () => {
  for (const [lifecycle, count] of [['primary', 2], ['active', 20], ['inactive', 35]]) {
    assert.equal(projects.filter(p => matchesProjectFilters(p, { lifecycle })).length, count);
  }
  assert.deepEqual(projects.filter(p => matchesProjectFilters(p, { resume: 'defined' })).map(p => p.id), ['verified-bases']);
  assert.match(projects.find(p => p.id === 'verified-bases').lifecycle.resumeCondition, /buyer need/);
  assert.equal(projects.filter(p => matchesProjectFilters(p, { resume: 'not-defined' })).length, 56);
  const fixture = { priority: 'P4', lifecycle: { status: 'inactive', shareable: true, resumeCondition: 'An owner-approved recurring workflow needs this tool' } };
  assert.equal(matchesProjectFilters(fixture, { lifecycle: 'inactive', sharing: 'shareable', resume: 'defined', priority: 'P4' }), true);
  assert.equal(matchesProjectFilters(fixture, { resume: 'not-defined' }), false);
  assert.equal(matchesProjectFilters(fixture, { lifecycle: 'active' }), false);
});
