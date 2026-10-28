import assert from 'node:assert/strict';
import {mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import test from 'node:test';
import {loadDashboardProjects} from '../lib/dashboard-backend/registry.mjs';
import {buildReadinessProjection} from '../lib/dashboard-backend/readiness.mjs';
import {projectGrowthFocusLabel, projectAudiencePriorityLabel, matchesProjectFilters} from '../../web/src/lib/project-directory.mjs';

// Growth focus belongs to root-domain roles; it does not promote every subdomain or set investment ranks.
test('root-domain SEO/GEO roles come from the shared catalog and remain separate from priority', () => {
  const path = join(mkdtempSync(join(tmpdir(), 'portfolio-roles-')), 'catalog.json');
  const project = (id, domains) => ({id, name: id, family: id, domains, audience: 'internal', lifecycle: {status: 'active'}, portfolio: {priority: null, status: 'active'}});
  const catalog = {systems: {rootBrands: {brands: [{rootDomain: 'product.example'}], growthPriority: {level: 'high'}}},
    projects: [project('primary', ['product.example']), project('child', ['app.product.example']), project('connections', ['one.example', 'two.example'])],
    publicDirectory: {projects: {connections: {publicDestinationUrl: null, description: 'Shared MCP gateway'}}}};
  writeFileSync(path, JSON.stringify(catalog));
  const [primary, child, connections] = loadDashboardProjects(path);
  assert.deepEqual(primary.growthFocus, {level: 'high', domains: ['product.example']});
  assert.equal(primary.priority, null);
  assert.equal(projectAudiencePriorityLabel(primary), 'Internal · Awaiting review · SEO/GEO focus');
  assert.equal(projectGrowthFocusLabel(child), null);
  assert.equal(matchesProjectFilters(primary, {query: 'SEO/GEO focus'}), true);
  assert.equal(matchesProjectFilters(child, {query: 'SEO/GEO focus'}), false);
  assert.equal(connections.websiteUrl, null);
  assert.equal(connections.changelogUrl, null);
  assert.equal(connections.domainLabel, '2 configured endpoint hosts');
  assert.deepEqual(connections.domains, ['one.example', 'two.example']);
  assert.equal(connections.description, 'Shared MCP gateway');
  const readiness = buildReadinessProjection({projects: [primary, child, connections]});
  assert.deepEqual(readiness.projects.find(p => p.id === primary.id).growthFocus, primary.growthFocus);
  catalog.systems.rootBrands.growthPriority.level = 'normal';
  writeFileSync(path, JSON.stringify(catalog));
  assert.equal(loadDashboardProjects(path)[0].growthFocus, null);
});
