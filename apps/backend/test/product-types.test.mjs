import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { loadDashboardProjects } from '../lib/dashboard-backend/registry.mjs';
import { buildReadinessProjection } from '../lib/dashboard-backend/readiness.mjs';
import { matchesProjectFilters, projectTypeLabel } from '../../web/src/lib/project-directory.mjs';

test('product types use catalog platforms rather than mistaking landing sites for the product', () => {
  const path = join(mkdtempSync(join(tmpdir(), 'product-types-')), 'catalog.json');
  const entries = [
    ['mac', 'macOS app', ['macOS', 'Web'], 'Mac app'],
    ['phone', 'iOS app', ['iOS', 'API'], 'iPhone app'],
    ['game', 'iOS game', ['iOS', 'iPadOS', 'Web'], 'iPhone & iPad app'],
    ['apple', 'Apple app', ['macOS', 'iOS', 'watchOS', 'Web'], 'Mac, iPhone & Apple Watch app'],
    ['gateway', 'API gateway', ['API', 'Web'], 'API/tool'],
    ['dashboard', 'Local dashboard', ['Web', 'Local'], 'Website'],
  ];
  writeFileSync(path, JSON.stringify({
    projects: entries.map(([id]) => ({ id, name: id, family: id, lifecycle: { status: 'active' } })),
    publicDirectory: { projects: Object.fromEntries(entries.map(([id, form, platforms]) => [id, { form, platforms }])) },
  }));
  const projects = loadDashboardProjects(path);
  const projection = buildReadinessProjection({ projects });
  for (const [id, form, platforms, label] of entries) {
    const project = projects.find(row => row.id === id);
    const readiness = projection.projects.find(row => row.id === id);
    assert.equal(project.form, form);
    assert.deepEqual(project.platforms, platforms);
    assert.equal(projectTypeLabel(project), label);
    assert.equal(projectTypeLabel(readiness), label);
    assert.equal(matchesProjectFilters(project, { query: label }), true);
  }
  assert.equal(matchesProjectFilters(projects[0], { query: 'Website' }), false);
  assert.equal(projectTypeLabel({}), 'Type not recorded');
});
