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

  assert.equal(projects.length, 59);
  assert.equal(current.length + inactive.length, projects.length);
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
  assert.deepEqual(inactiveMatches.map(inactiveProjectState), ['outside-fleet', 'outside-fleet']);
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
  for (const lifecycle of ['primary', 'active', 'inactive']) {
    assert.equal(
      projects.filter(p => matchesProjectFilters(p, { lifecycle })).length,
      projects.filter(p => p.lifecycle.status === lifecycle).length,
    );
  }
  assert.deepEqual(projects.filter(p => matchesProjectFilters(p, { resume: 'defined' })).map(p => p.id), ['rolepatch']);
  assert.equal(projects.find(p => p.id === 'verified-bases').lifecycle.resumeCondition, null);
  assert.equal(projects.find(p => p.id === 'open-historia').lifecycle.resumeCondition, null);
  assert.equal(
    projects.filter(p => matchesProjectFilters(p, { resume: 'not-defined' })).length,
    projects.filter(p => p.lifecycle.resumeCondition === null).length,
  );
  const fixture = { priority: 'P4', lifecycle: { status: 'inactive', shareable: true, resumeCondition: 'An owner-approved recurring workflow needs this tool' } };
  assert.equal(matchesProjectFilters(fixture, { lifecycle: 'inactive', sharing: 'shareable', resume: 'defined', priority: 'P4' }), true);
  assert.equal(matchesProjectFilters(fixture, { resume: 'not-defined' }), false);
  assert.equal(matchesProjectFilters(fixture, { lifecycle: 'active' }), false);
});
