#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { loadDashboardProjects, loadProjectCollections } from '../lib/dashboard-backend/registry.mjs';
import { startDashboardService } from '../lib/dashboard-backend/service.mjs';
import { hostedConfiguration, hostedListenPort, startHostedDashboardService } from '../lib/dashboard-backend/hosted.mjs';
import { createMetricRunController } from '../lib/dashboard-backend/metric-runs.mjs';
import {
  recordRefreshReceipt,
  readRefreshReceipt,
  reconcileAbandonedRefreshReceipts,
} from '../lib/dashboard-backend/evidence-freshness.mjs';
import { refreshStaleEvidence } from '../lib/dashboard-backend/refresh-coordinator.mjs';
import { buildDashboardProjection } from '../lib/dashboard-projection.mjs';
import { reconcileCampaignEvidence } from '../lib/dashboard-backend/campaign-reconciliation.mjs';
import {
  DashboardStore,
  defaultDatabasePath,
  verifyBackup,
} from '../lib/dashboard-backend/store.mjs';
import { AppStoreStore } from '../lib/app-store/store.mjs';
import { BrandEvidenceStore, defaultBrandEvidencePath } from '../lib/brand-evidence/store.mjs';
import { startBrandEvidenceScheduler } from '../lib/brand-evidence/scheduler.mjs';
import { gatewayEnvironment } from '../lib/brand-evidence/gateway-environment.mjs';
import { startEvidenceScheduler } from '../lib/dashboard-backend/evidence-scheduler.mjs';
import { appHealthCredential, collectUsageEvidence, readUsageEvidence, summarizeUsageSnapshot, usageFailureSnapshot, usageObservations, writeUsageEvidence } from '../lib/dashboard-backend/usage-evidence.mjs';
import { createWeeklyReview } from '../lib/dashboard-backend/weekly-review.mjs';
import { readinessObservations } from '../lib/dashboard-backend/readiness.mjs';
import { withRefreshReceipt } from '../lib/dashboard-backend/evidence-freshness.mjs';
import { apiModelObservations } from '../lib/dashboard-backend/api-model-evidence.mjs';
import { collectProviderRevenueEvidence, providerRevenueFailureSnapshot, providerRevenueObservations, readProviderRevenueEvidence, summarizeProviderRevenueSnapshot, writeProviderRevenueEvidence } from '../lib/dashboard-backend/provider-revenue-evidence.mjs';

function usage() {
  console.log(`Site Health backend

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

const hostedConfig = hostedConfiguration();
const hostedPort = hostedConfig && command === 'serve' ? hostedListenPort(args[0] ?? process.env.PORT) : null;
const projectsProvider = () => loadDashboardProjects();
const projectCollectionsProvider = () => loadProjectCollections();
const projects = projectsProvider();
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
  const port = hostedConfig ? hostedPort : Number(args[0] ?? 4187);
  const metricRunController = createMetricRunController({
    projectsProvider,
    onRunChange: (run) => recordRefreshReceipt(store, run),
  });
  // A receipt left `running` by an earlier boot belongs to a process that is
  // gone; retire it before the dashboard reads it as a refresh in flight.
  const abandoned = reconcileAbandonedRefreshReceipts(store);
  if (abandoned.length > 0) {
    console.log(`Retired ${abandoned.length} abandoned refresh receipt(s): ${abandoned.map((item) => item.key).join(', ')}`);
  }
  let campaignRefresh = null;
  const prefillEvidence = ({ force = true } = {}) => {
    store.projects = projectsProvider();
    const sources = refreshStaleEvidence({
      store,
      projection: buildDashboardProjection(),
      metricRunController,
      force,
    });
    if (process.env.SITE_HEALTH_RECONCILE_CAMPAIGNS !== '0' && !campaignRefresh) {
      campaignRefresh = reconcileCampaignEvidence({ store, projects: store.projects })
        .then((result) => console.log(`Campaign evidence: ${result.counts.verified} verified, ${result.counts.notVerified} pending`))
        .catch((error) => console.error(`Campaign evidence unavailable: ${error.message}`))
        .finally(() => { campaignRefresh = null; });
    }
    return {
      schemaVersion: 'site-health.prefill.v1',
      startedAt: new Date().toISOString(),
      sources,
      campaigns: process.env.SITE_HEALTH_RECONCILE_CAMPAIGNS === '0' ? 'disabled' : 'refreshing',
      capabilities: 'local',
    };
  };
  const brandEvidenceStore = new BrandEvidenceStore({
    databasePath: process.env.SITE_HEALTH_BRAND_EVIDENCE_DB || defaultBrandEvidencePath(),
  });
  const appStoreStore = new AppStoreStore({ ...(process.env.SITE_HEALTH_APP_STORE_DB ? { databasePath: process.env.SITE_HEALTH_APP_STORE_DB } : {}) });
  const brandEvidenceEnv = gatewayEnvironment();
  const startService = hostedConfig ? startHostedDashboardService : startDashboardService;
  const server = await startService({
    ...(hostedConfig ? { config: hostedConfig, distDirectory: resolve(import.meta.dirname, '../../web/dist') } : {}),
    store,
    brandEvidenceStore,
    appStoreStore,
    brandEvidenceEnv,
    port,
    prewarmProjection: true,
    ownerToken: process.env.DASHBOARD_OWNER_TOKEN ?? process.env.FOUNDER_CONTROL_OWNER_TOKEN,
    trustLoopback: (process.env.DASHBOARD_TRUST_LOOPBACK ?? process.env.FOUNDER_CONTROL_TRUST_LOOPBACK) !== '0',
    metricRunController,
    prefillEvidence,
    projectsProvider,
    projectCollectionsProvider,
    readinessObservationProvider: (currentProjects) => [
      ...usageObservations(currentProjects, readUsageEvidence()),
      ...providerRevenueObservations(currentProjects, readProviderRevenueEvidence()),
      ...apiModelObservations(currentProjects, brandEvidenceStore),
    ],
  });
  const brandScheduler = startBrandEvidenceScheduler({ store: brandEvidenceStore, projectsProvider, env: brandEvidenceEnv });
  console.log(hostedConfig
    ? `Site Health hosted dashboard listening on port ${port} for ${hostedConfig.origin}`
    : `Site Health backend listening on http://127.0.0.1:${port}`);
  const evidenceScheduler = startEvidenceScheduler({
    lanes: process.env.SITE_HEALTH_SCHEDULED_REFRESH === '0' ? [] : [
      { id: 'provider-refresh', intervalMs: 10 * 60_000, run: () => prefillEvidence({ force: false }) },
      { id: 'usage', intervalMs: 24 * 60 * 60_000, run: async () => {
        const receipt = readRefreshReceipt(store, 'usage');
        const attemptedAt = Date.parse(receipt?.lastAttemptAt ?? '');
        if (receipt?.state === 'succeeded' && Number.isFinite(attemptedAt) && Date.now() - attemptedAt < 24 * 60 * 60_000) return;
        return withRefreshReceipt(store, {
        family: 'usage', scope: 'portfolio', label: 'App Health aggregate usage', runId: `usage_${Date.now()}`,
      }, async () => {
        const currentProjects = projectsProvider();
        let snapshot;
        try {
          snapshot = await collectUsageEvidence({ projects: currentProjects, credential: await appHealthCredential() });
        } catch (error) {
          writeUsageEvidence(usageFailureSnapshot(currentProjects));
          throw error;
        }
        writeUsageEvidence(snapshot);
        const failures = Object.values(snapshot.records).filter((row) => row.status === 'failed').length;
        const summary = summarizeUsageSnapshot(snapshot);
        if (failures > 0) throw Object.assign(new Error(`${summary.summary} Prior good observations were retained where available.`), { code: 'APP_HEALTH_USAGE_REFRESH_FAILED' });
        return snapshot;
      }, { signals: [], summarize: summarizeUsageSnapshot }); } },
      { id: 'provider-revenue', intervalMs: 24 * 60 * 60_000, run: async () => {
        const receipt = readRefreshReceipt(store, 'provider-revenue');
        const attemptedAt = Date.parse(receipt?.lastAttemptAt ?? '');
        if (receipt?.state === 'succeeded' && Number.isFinite(attemptedAt) && Date.now() - attemptedAt < 24 * 60 * 60_000) return;
        return withRefreshReceipt(store, {
          family: 'provider-revenue', scope: 'portfolio', label: 'App Health provider revenue aggregates', runId: `provider_revenue_${Date.now()}`,
        }, async () => {
          const currentProjects = projectsProvider();
          let snapshot;
          try {
            snapshot = await collectProviderRevenueEvidence({ projects: currentProjects, credential: await appHealthCredential() });
          } catch (error) {
            writeProviderRevenueEvidence(providerRevenueFailureSnapshot(currentProjects));
            throw error;
          }
          writeProviderRevenueEvidence(snapshot);
          const failures = Object.values(snapshot.records).filter((row) => row.status === 'failed').length;
          const summary = summarizeProviderRevenueSnapshot(snapshot);
          if (failures > 0) throw Object.assign(new Error(`${summary.summary} Prior good observations were retained where available.`), { code: 'PROVIDER_REVENUE_REFRESH_FAILED' });
          return snapshot;
        }, { signals: [], summarize: summarizeProviderRevenueSnapshot });
      } },
      { id: 'weekly-review', intervalMs: 60 * 60_000, run: () => {
        store.projects = projectsProvider();
        createWeeklyReview({ store, observations: [
          ...readinessObservations(store.projects, buildDashboardProjection()),
          ...usageObservations(store.projects, readUsageEvidence()),
          ...providerRevenueObservations(store.projects, readProviderRevenueEvidence()),
          ...apiModelObservations(store.projects, brandEvidenceStore),
        ] });
      } },
    ],
    onError: (id, error) => console.error(`Evidence ${id}: ${error.code ?? 'REFRESH_FAILED'}`),
  });
  try {
    const startupPrefill = process.env.SITE_HEALTH_STARTUP_PREFILL === '0'
      ? { sources: [] } : prefillEvidence({ force: process.env.SITE_HEALTH_OWNER_HOST !== '1' });
    console.log(`Evidence startup: ${startupPrefill.sources.map((item) => `${item.family}=${item.action}`).join(', ')}`);
  } catch (error) {
    // An unavailable portfolio snapshot must not kill independent owner features.
    // A failed initial refresh is logged; projection health tracks snapshot rebuilds.
    console.error(`Evidence startup unavailable: ${error.message}`);
  }
  // Idempotent, and never allowed to throw: it also runs on `exit`, by which
  // point the store may already be closed.
  const abandonInFlightRuns = () => {
    try {
      metricRunController.abandonActiveRuns();
    } catch (error) {
      console.error(`Could not retire in-flight refreshes: ${error.message}`);
    }
  };
  let stopping = false;
  const shutdown = () => {
    if (stopping) return;
    stopping = true;
    try { brandEvidenceStore.stopOwnedWork(); }
    catch (error) { console.error(`Could not interrupt owned brand evidence: ${error.message}`); }
    const brandsStopped = brandScheduler.stop();
    const evidenceStopped = evidenceScheduler.stop();
    abandonInFlightRuns();
    server.close(async () => {
      await brandsStopped;
      await evidenceStopped;
      store.close();
      brandEvidenceStore.close();
      appStoreStore.close();
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('exit', abandonInFlightRuns);
} else {
  store.close();
  usage();
  process.exitCode = 1;
}
