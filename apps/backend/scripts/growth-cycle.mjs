#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { GrowthCycleStore } from '../lib/brand-evidence/growth-cycle.mjs';
import { BrandEvidenceStore, defaultBrandEvidencePath } from '../lib/brand-evidence/store.mjs';
import { assertKnownProject } from '../lib/brand-evidence/runner.mjs';
import { loadDashboardProjects } from '../lib/dashboard-backend/registry.mjs';

const { values, positionals } = parseArgs({ allowPositionals: true, options: {
  input: { type: 'string' }, help: { type: 'boolean', short: 'h' },
} });
const [command, projectId] = positionals;
if (values.help || !command) {
  console.log(`Site Health growth cycle (private local state)
  growth-cycle.mjs view <project>
  growth-cycle.mjs apply <project> --input change.json

Read view.revision before each write. Input requires revision and command:
plan, add, draft, review, publish, measure, complete or park. No external calls occur.
Publish records a supplied receipt; it does not publish a page or send outreach.
State shares SITE_HEALTH_BRAND_EVIDENCE_DB with brand-evidence.mjs.
See apps/backend/docs/growth-cycle.md for the input contract.`);
} else {
  let store;
  try {
    assertKnownProject(projectId, loadDashboardProjects());
    if (!['view', 'apply'].includes(command)) throw new Error('Use view or apply');
    const input = command === 'apply' ? JSON.parse(readFileSync(values.input, 'utf8')) : null;
    store = new BrandEvidenceStore({ databasePath: process.env.SITE_HEALTH_BRAND_EVIDENCE_DB || defaultBrandEvidencePath() });
    const growth = new GrowthCycleStore(store);
    console.log(JSON.stringify(command === 'apply' ? growth.mutate(projectId, input) : growth.view(projectId), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally { store?.close(); }
}
