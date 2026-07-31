#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { draftMission } from '../lib/founder-control/intake.mjs';
import {
  appendCurrentEvidenceBatch,
  appendMarketingReceipt,
} from '../lib/founder-control/evidence-ingestion.mjs';
import { buildOwnerNotifications } from '../lib/founder-control/learning.mjs';
import { deliverOwnerNotifications } from '../lib/founder-control/notification-delivery.mjs';
import { buildDailyBrief } from '../lib/founder-control/projections.mjs';
import { loadFounderProjects } from '../lib/founder-control/registry.mjs';
import { startFounderControlService } from '../lib/founder-control/service.mjs';
import {
  FounderControlStore,
  defaultDatabasePath,
  verifyBackup,
} from '../lib/founder-control/store.mjs';

function usage() {
  console.log(`Founder control

Usage:
  founder-control.mjs status
  founder-control.mjs draft <title> [project-id]
  founder-control.mjs snapshot [output.json]
  founder-control.mjs brief
  founder-control.mjs notifications
  founder-control.mjs notify [--no-drain]
  founder-control.mjs backfill-current <receipts.json>
  founder-control.mjs marketing-receipt <receipt.json>
  founder-control.mjs backup <output.json>
  founder-control.mjs verify <backup.json>
  founder-control.mjs restore <backup.json>
  founder-control.mjs serve [port]

The database defaults to:
  ${defaultDatabasePath()}

Override it for local testing with FOUNDER_CONTROL_DB.`);
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const fleetNotify = resolve(scriptDir, 'agent-bin', 'fleet-notify');
const [command, ...args] = process.argv.slice(2);
if (!command || ['help', '--help', '-h'].includes(command)) {
  usage();
  process.exit(0);
}

const projects = loadFounderProjects();
const store = new FounderControlStore({
  databasePath: process.env.FOUNDER_CONTROL_DB || defaultDatabasePath(),
  projects,
});

if (command === 'status') {
  const projections = store.rebuildProjections();
  console.log(
    JSON.stringify(
      {
        database: store.databasePath,
        events: store.listEvents().length,
        missions: projections.missions.length,
        decisions: projections.home.needsMe.length,
        projects: projections.projects.length,
      },
      null,
      2,
    ),
  );
  store.close();
} else if (command === 'draft') {
  const [title, projectId] = args;
  if (!title) throw new Error('draft requires a title');
  const drafted = draftMission({ title, ...(projectId ? { projectId } : {}) }, { projects });
  const result = store.append(drafted.event);
  if (drafted.decision) store.append(drafted.decision);
  console.log(JSON.stringify(result.event, null, 2));
  store.close();
} else if (command === 'snapshot') {
  const output = resolve(args[0] ?? 'founder-control-snapshot.json');
  writeFileSync(output, `${JSON.stringify(store.rebuildProjections(), null, 2)}\n`, { mode: 0o600 });
  console.log(output);
  store.close();
} else if (command === 'brief') {
  console.log(JSON.stringify(buildDailyBrief(store.rebuildProjections()), null, 2));
  store.close();
} else if (command === 'notifications') {
  console.log(JSON.stringify(buildOwnerNotifications(store.rebuildProjections()), null, 2));
  store.close();
} else if (command === 'notify') {
  const noDrain = args.includes('--no-drain');
  const summary = await deliverOwnerNotifications(store.rebuildProjections(), {
    consoleBaseUrl: process.env.FOUNDER_CONTROL_CONSOLE_URL || 'https://fleet.sassmaker.com',
    emit: async (notification) => {
      const notifyArgs = [
        fleetNotify,
        'emit',
        '--severity',
        notification.severity,
        '--source',
        notification.source,
        '--title',
        notification.title,
        '--body',
        notification.body,
        '--url',
        notification.url,
        '--dedupe-key',
        notification.dedupeKey,
        '--json',
      ];
      if (notification.project) notifyArgs.push('--project', notification.project);
      if (notification.forceOwnerChannel) notifyArgs.push('--channel', 'openclaw-telegram');
      if (noDrain) notifyArgs.push('--no-drain');
      const result = spawnSync(process.execPath, notifyArgs, {
        encoding: 'utf8',
        env: process.env,
      });
      if (result.status !== 0) {
        throw new Error((result.stderr || result.stdout || 'fleet-notify failed').trim());
      }
      return JSON.parse(result.stdout);
    },
  });
  console.log(JSON.stringify(summary, null, 2));
  store.close();
} else if (command === 'backfill-current') {
  if (!args[0]) throw new Error('backfill-current requires a receipts JSON path');
  const summary = appendCurrentEvidenceBatch(
    store,
    JSON.parse(readFileSync(resolve(args[0]), 'utf8')),
  );
  console.log(JSON.stringify(summary, null, 2));
  store.close();
} else if (command === 'marketing-receipt') {
  if (!args[0]) throw new Error('marketing-receipt requires a receipt JSON path');
  const result = appendMarketingReceipt(
    store,
    JSON.parse(readFileSync(resolve(args[0]), 'utf8')),
  );
  console.log(JSON.stringify({ appended: !result.duplicate, duplicate: result.duplicate }, null, 2));
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
  const server = await startFounderControlService({
    store,
    port,
    prewarmConnections: true,
    ownerToken: process.env.FOUNDER_CONTROL_OWNER_TOKEN,
    trustAccessHeaders: process.env.FOUNDER_CONTROL_TRUST_ACCESS === '1',
    trustLoopback: process.env.FOUNDER_CONTROL_TRUST_LOOPBACK !== '0',
    ownerEmail: process.env.FOUNDER_CONTROL_OWNER_EMAIL,
  });
  console.log(`Founder control listening on http://127.0.0.1:${port}`);
  const shutdown = () => server.close(() => store.close());
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
} else {
  store.close();
  usage();
  process.exitCode = 1;
}
