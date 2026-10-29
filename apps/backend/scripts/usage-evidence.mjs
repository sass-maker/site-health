#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { loadDashboardProjects } from '../lib/dashboard-backend/registry.mjs';
import { appHealthCredential, collectUsageEvidence, importUsageExport, usageObservations, writeUsageEvidence } from '../lib/dashboard-backend/usage-evidence.mjs';

const projects = loadDashboardProjects();
const [command, path] = process.argv.slice(2);
if (!['collect', 'import'].includes(command) || (command === 'import' && !path)) {
  console.error('Usage: usage-evidence.mjs collect | import <portfolio-usage.json>');
  process.exitCode = 1;
} else {
  try {
    const snapshot = command === 'import'
      ? importUsageExport(JSON.parse(readFileSync(path, 'utf8')), projects)
      : await collectUsageEvidence({ projects, credential: await appHealthCredential() });
    writeUsageEvidence(snapshot);
    const observations = usageObservations(projects, snapshot);
    console.log(JSON.stringify({ observedAt: snapshot.observedAt, records: Object.keys(snapshot.records).length,
      numericAudienceProxies: observations.filter(row => ['monthly-browser-proxy', 'monthly-local-proxy'].includes(row.id) && row.value !== null).length }));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
