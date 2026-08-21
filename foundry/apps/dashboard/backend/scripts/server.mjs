#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { loadDashboardProjects } from '../lib/dashboard-backend/registry.mjs';
import { startDashboardService } from '../lib/dashboard-backend/service.mjs';
import {
  DashboardStore,
  defaultDatabasePath,
  verifyBackup,
} from '../lib/dashboard-backend/store.mjs';

function usage() {
  console.log(`Dashboard backend

Usage:
  server.mjs status
  server.mjs snapshot [output.json]
  server.mjs backup <output.json>
  server.mjs verify <backup.json>
  server.mjs restore <backup.json>
  server.mjs serve [port]

The database defaults to:
  ${defaultDatabasePath()}

Override it for local testing with DASHBOARD_DB.`);
}

const [command, ...args] = process.argv.slice(2);
if (!command || ['help', '--help', '-h'].includes(command)) {
  usage();
  process.exit(0);
}

const projects = loadDashboardProjects();
const store = new DashboardStore({
  databasePath: process.env.DASHBOARD_DB || process.env.FOUNDER_CONTROL_DB || defaultDatabasePath(),
  projects,
});

if (command === 'status') {
  const projections = store.rebuildProjections();
  console.log(
    JSON.stringify(
      {
        database: store.databasePath,
        events: store.listEvents().length,
        projects: projections.projects.length,
        visibilityProjects: projections.aiVisibility.projects.length,
      },
      null,
      2,
    ),
  );
  store.close();
} else if (command === 'snapshot') {
  const output = resolve(args[0] ?? 'dashboard-backend-snapshot.json');
  writeFileSync(output, `${JSON.stringify(store.rebuildProjections(), null, 2)}\n`, { mode: 0o600 });
  console.log(output);
  store.close();
} else if (command === 'backup') {
  if (!args[0]) throw new Error('backup requires an output path');
  const output = resolve(args[0]);
  writeFileSync(output, `${JSON.stringify(store.createBackup(), null, 2)}\n`, { mode: 0o600 });
  console.log(output);
  store.close();
} else if (command === 'verify') {
  if (!args[0]) throw new Error('verify requires a backup path');
  console.log(JSON.stringify(verifyBackup(JSON.parse(readFileSync(resolve(args[0]), 'utf8'))), null, 2));
  store.close();
} else if (command === 'restore') {
  if (!args[0]) throw new Error('restore requires a backup path');
  console.log(JSON.stringify(store.restoreBackup(JSON.parse(readFileSync(resolve(args[0]), 'utf8'))), null, 2));
  store.close();
} else if (command === 'serve') {
  const port = Number(args[0] ?? 4187);
  const server = await startDashboardService({
    store,
    port,
    prewarmProjection: true,
    ownerToken: process.env.DASHBOARD_OWNER_TOKEN ?? process.env.FOUNDER_CONTROL_OWNER_TOKEN,
    trustAccessHeaders: (process.env.DASHBOARD_TRUST_ACCESS ?? process.env.FOUNDER_CONTROL_TRUST_ACCESS) === '1',
    trustLoopback: (process.env.DASHBOARD_TRUST_LOOPBACK ?? process.env.FOUNDER_CONTROL_TRUST_LOOPBACK) !== '0',
    ownerEmail: process.env.DASHBOARD_OWNER_EMAIL ?? process.env.FOUNDER_CONTROL_OWNER_EMAIL,
  });
  console.log(`Dashboard backend listening on http://127.0.0.1:${port}`);
  const shutdown = () => server.close(() => store.close());
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
} else {
  store.close();
  usage();
  process.exitCode = 1;
}
