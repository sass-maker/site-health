#!/usr/bin/env node
import { emptyReadinessState } from '../lib/dashboard-backend/readiness-model.mjs';
import { loadDashboardProjects } from '../lib/dashboard-backend/registry.mjs';
const origin = 'http://127.0.0.1:4187';
const response = await fetch(`${origin}/v1/readiness`);
if (!response.ok) throw new Error('Owner readiness service is unavailable');
const current = await response.json();
const registry = new Map(loadDashboardProjects().map(project => [project.id, project]));
let initialized = 0;
for (const product of current.projects) {
  if (product.revision !== 0) continue;
  const project = registry.get(product.id);
  const state = emptyReadinessState();
  state.applicability.product = { state: 'applicable', reason: 'Every current product needs a verified core loop, understandable behavior and dependable delivery.' };
  state.applicability.growth = project?.audience === 'internal'
    ? { state: 'exempt', reason: 'Canonical catalog classifies this as internal. External acquisition and market competition are not required.' }
    : { state: 'applicable', reason: 'External product: search and AI discovery need intent-specific evidence.' };
  const usage = product.evidence.find(row => row.id === 'monthly-browser-proxy');
  state.nextLevers.product = usage?.value == null
    ? 'Connect a content-free production activity counter to this product’s completed core workflow; verify its receipt, actor unit and QA exclusion.'
    : 'Qualify the completed core-workflow event and actor unit. Current traffic is a browser/session proxy; validate completion and exclude QA before using it as active use.';
  const failingSEO = product.evidence.find(row => row.id.startsWith('seoAudit:fail') && row.value > 0);
  state.nextLevers.growth = project?.audience === 'internal'
    ? 'Internal scope: focus on reliable owner use and core workflow completion.'
    : failingSEO ? 'Repair the failed technical SEO checks, rerun the same audit, then map category/problem/comparison intents to useful pages.'
      : 'Map category, problem, use-case and competitor queries to useful landing pages; measure these separately from direct brand lookup.';
  const result = await fetch(`${origin}/v1/readiness/${encodeURIComponent(product.id)}`, {
    method: 'PUT', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ expectedRevision: 0, idempotencyKey: `readiness-initialize-v1:${product.id}`, state }),
  });
  if (!result.ok) throw new Error(`Initialization stopped for ${product.id}: HTTP ${result.status}`);
  initialized++;
}
console.log(JSON.stringify({ currentProducts: current.projects.length, initialized, retainedExisting: current.projects.length - initialized }));
