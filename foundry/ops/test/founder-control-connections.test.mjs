import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

import {
  CONNECTIONS_SCHEMA_VERSION,
  SEARCH_ACTION_SAMPLE_FLOORS,
  buildFleetConnections,
  readSkillRunOutput,
  searchAction,
} from '../lib/founder-control/connections.mjs';
import { SkillRunStore } from '../lib/skill-run-store.mjs';
import {
  appendVisibilityMetric,
  VISIBILITY_METRIC_SCHEMA,
} from '../lib/visibility-metric-store.mjs';
import {
  appendVisibilityOutcomeBundle,
  VISIBILITY_OUTCOME_BUNDLE_SCHEMA,
} from '../lib/visibility-outcome-store.mjs';

const now = '2026-07-30T10:00:00.000Z';

test('derives conservative Search actions from explicit boundaries', () => {
  const floor = SEARCH_ACTION_SAMPLE_FLOORS.query;
  assert.equal(searchAction({ observed: false, impressions: 0, clicks: 0, position: Infinity, sampleFloor: floor }).id, 'measure-search');
  assert.equal(searchAction({ observed: true, impressions: 0, clicks: 0, position: Infinity, sampleFloor: floor }).id, 'inspection-unavailable');
  assert.equal(searchAction({
    observed: true,
    impressions: 0,
    clicks: 0,
    position: Infinity,
    sampleFloor: floor,
    observedAt: '2026-08-02T00:00:00.000Z',
    inspection: { state: 'indexed' },
  }).id, 'wait-indexed');
  assert.equal(searchAction({
    observed: true,
    impressions: 0,
    clicks: 0,
    position: Infinity,
    sampleFloor: floor,
    inspection: { state: 'not-indexed', coverageState: 'Crawled - currently not indexed' },
  }).id, 'fix-indexing');
  assert.equal(searchAction({ observed: true, impressions: 9, clicks: 0, position: 1, sampleFloor: floor }).id, 'collect-more-data');
  assert.equal(searchAction({ observed: true, impressions: 10, clicks: 0, position: 8, sampleFloor: floor }).id, 'improve-snippet');
  assert.equal(searchAction({ observed: true, impressions: 10, clicks: 1, position: 8, sampleFloor: floor }).id, 'protect-and-expand');
  assert.equal(searchAction({ observed: true, impressions: 10, clicks: 0, position: 20, sampleFloor: floor }).id, 'strengthen-ranking-page');
  assert.equal(searchAction({ observed: true, impressions: 10, clicks: 0, position: 31, sampleFloor: floor }).id, 'build-search-relevance');
});

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'fleet-connections-'));
  const home = join(root, 'home');
  for (const path of [
    'foundry/ops/skills',
    'foundry/apps/dashboard/mobile-cockpit',
    'foundry/apps/public/public-directory',
    'foundry/marketing/reel-pipeline/editorial',
    'foundry/marketing/content-factory',
    'foundry/marketing/reel-pipeline',
  ]) {
    mkdirSync(join(root, path), { recursive: true });
  }
  writeJson(join(root, 'foundry/ops/config/projects.json'), {
    _meta: {
      updated: '2026-07-30',
      priorities: { P1: ['pace'], P2: [], P3: ['standards'] },
    },
    projects: [
      {
        id: 'pace',
        name: 'Pace',
        repo: 'pace',
        lifecycle: 'maintained',
        tier: 'primary',
        domains: ['heypace.app'],
        public: {
          id: 'pace',
          listing: 'maintained',
          description: 'A private Mac voice assistant.',
          repositoryUrl: 'https://github.com/HeyPace/pace',
        },
      },
      {
        id: 'past',
        name: 'Past project',
        lifecycle: 'past',
        tier: 'past',
        domains: ['past.example'],
        metrics: { domainCoverage: true },
        public: { id: 'past-project', listing: 'past' },
      },
      {
        id: 'personal',
        name: 'Personal site',
        lifecycle: 'non-product',
        tier: 'non-product',
        domains: ['personal.example'],
        metrics: { domainCoverage: true },
        public: { id: 'personal', listing: 'hidden' },
      },
      {
        id: 'standards',
        name: 'Standards',
        lifecycle: 'maintained',
        tier: 'secondary',
        domains: ['docs.heypace.app'],
        metrics: { publicSite: true },
        public: { id: 'standards', listing: 'hidden', description: 'The shared product standards.' },
      },
    ],
  });
  writeJson(join(root, 'foundry/ops/config/geo-observatory.json'), {
    products: [{
      id: 'pace',
      origin: 'https://heypace.app',
      queries: [{ qid: 'pace-brand', kind: 'brand', q: 'heypace.app' }],
    }],
  });
  writeJson(join(root, 'foundry/ops/config/design-workflow.json'), {
    $schema: 'fleet.design-workflow.v1',
    version: 1,
    impeccableVersion: '4.0.2',
    impeccablePackageVersion: '3.3.1',
    lanes: {
      preserve: { requireBeforeEvidence: true },
      overhaul: {
        minimumReferences: 2,
        maximumReferences: 3,
        minimumDirectionProbes: 2,
        maximumDirectionProbes: 3,
        acceptedDirectionDecisions: ['approved', 'delegated'],
      },
    },
    qualityGate: {
      minimumCritiqueScore: 32,
      critiqueMaximum: 40,
      minimumAuditScore: 16,
      auditMaximum: 20,
      maximumUnresolved: { p0: 0, p1: 0 },
      requiredViewportWidths: [390, 768, 1440],
      acceptedOwnerDecisions: ['keep', 'delegated'],
      detectorPosture: 'advisory',
      requirePassingProjectCheck: true,
    },
  });
  mkdirSync(join(root, 'foundry/ops/data/geo-observatory'), { recursive: true });
  writeFileSync(
    join(root, 'foundry/ops/data/geo-observatory/ledger.jsonl'),
    [
      JSON.stringify({ date: '2026-07-23', product: 'pace', qid: 'pace-brand', class: 'C' }),
      JSON.stringify({ date: '2026-07-30', product: 'pace', qid: 'pace-brand', class: 'B' }),
      '',
    ].join('\n'),
  );
  appendVisibilityMetric(
    {
      schemaVersion: VISIBILITY_METRIC_SCHEMA,
      projectId: 'pace',
      family: 'agent',
      observedAt: '2026-07-30T09:20:00.000Z',
      status: 'needs-work',
      summary: 'A-tier · 6 passed · 1 failed',
      metrics: [
        {
          label: 'Agent readiness',
          value: 86,
          unit: 'percent',
          direction: 'higher-is-better',
        },
        {
          label: 'Agent-readable coverage',
          value: 75,
          unit: 'percent',
          direction: 'higher-is-better',
        },
        {
          label: 'Agent-readable routes',
          value: 3,
          unit: 'routes',
          direction: 'higher-is-better',
        },
        {
          label: 'Agent public routes',
          value: 4,
          unit: 'routes',
          direction: 'neutral',
        },
      ],
    },
    { path: join(home, '.fleet/visibility-metrics/ledger.jsonl') },
  );
  appendVisibilityMetric(
    {
      schemaVersion: VISIBILITY_METRIC_SCHEMA,
      projectId: 'pace',
      family: 'crawl',
      observedAt: '2026-07-30T09:20:00.000Z',
      status: 'ready',
      summary: '3/3 crawler checks passed',
      metrics: [
        {
          label: 'AI crawlability',
          value: 100,
          unit: 'percent',
          direction: 'higher-is-better',
        },
      ],
    },
    { path: join(home, '.fleet/visibility-metrics/ledger.jsonl') },
  );
  for (const path of [
    'pace/PRODUCT.md',
    'pace/DESIGN.md',
    'pace/artifacts/design/before.png',
    'pace/artifacts/design/after-390.png',
    'pace/artifacts/design/after-768.png',
    'pace/artifacts/design/after-1440.png',
  ]) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), '');
  }
  writeJson(join(root, 'pace/.fleet/design-review.json'), {
    $schema: 'fleet.design-review.v1',
    version: 1,
    project: 'pace',
    target: 'Fixture surface',
    mode: 'preserve',
    register: 'product',
    context: { product: 'PRODUCT.md', design: 'DESIGN.md' },
    direction: {
      references: [],
      probes: [],
      selected: 'existing-design',
      approval: 'not-required',
      before: 'artifacts/design/before.png',
    },
    evidence: {
      screenshots: [
        { width: 390, path: 'artifacts/design/after-390.png' },
        { width: 768, path: 'artifacts/design/after-768.png' },
        { width: 1440, path: 'artifacts/design/after-1440.png' },
      ],
      projectCheck: { command: 'pnpm test', status: 'pass' },
      critique: { score: 34, maximum: 40 },
      audit: { score: 18, maximum: 20 },
      unresolved: { p0: 0, p1: 0 },
      detector: { posture: 'advisory', findings: [] },
    },
    ownerFeedback: { decision: 'keep' },
  });
  const performanceDatabasePath = join(home, '.psi-swarm/history.db');
  mkdirSync(dirname(performanceDatabasePath), { recursive: true });
  const performanceDatabase = new DatabaseSync(performanceDatabasePath);
  performanceDatabase.exec(`
    CREATE TABLE runs (
      url TEXT NOT NULL,
      started_at INTEGER NOT NULL,
      performance_score REAL,
      lcp REAL,
      cls REAL,
      error TEXT
    );
    INSERT INTO runs VALUES
      ('https://heypace.app', 1785400000000, 96, 820, 0.01, NULL),
      ('https://heypace.app', 1785500000000, NULL, NULL, NULL, NULL);
  `);
  performanceDatabase.close();
  writeJson(join(root, 'foundry/helpers/drank/data/fleet-dr.json'), {
    lastUpdated: '2026-07-29T10:00:00.000Z',
    domains: {
      'heypace.app': {
        history: [
          { ts: 1784714400000, dr: 7 },
          { ts: 1785319200000, dr: 8 },
        ],
      },
      'past.example': {
        history: [{ ts: 1785319200000, dr: 2 }],
      },
      'personal.example': {
        history: [{ ts: 1785319200000, dr: 3 }],
      },
    },
  });
  for (const mode of ['availability', 'performance']) {
    writeJson(join(root, `foundry/ops/workflows/reports/${mode}/latest.json`), {
      schemaVersion: 1,
      mode,
      generatedAt: '2026-07-30T08:00:00.000Z',
      summary: { sites: 1, passed: 1, failed: 0 },
      results: [{
        id: 'pace',
        ok: true,
        metrics: mode === 'performance'
          ? { totalP50Ms: 42, totalP90Ms: 68 }
          : {},
      }],
    });
  }

  const skillRoot = join(home, 'Library', 'Application Support', 'Fleet Ops', 'skill-runs');
  const skillStore = new SkillRunStore({ root: skillRoot, env: {} });
  const recordedSkillRun = skillStore.record({
    run: {
      idempotencyKey: 'fixture/site-health/1',
      skillId: 'site-health',
      skillVersion: '1',
      projectId: 'pace',
      projectRoot: '/workspace/pace',
      actor: 'codex',
      host: 'fixture-host',
      source: 'wrapped',
      captureCompleteness: 'exact-streams',
      status: 'succeeded',
      exitCode: 0,
      startedAt: '2026-07-30T09:00:00.000Z',
      finishedAt: '2026-07-30T09:00:01.000Z',
      observedAt: '2026-07-30T09:00:01.000Z',
      durationMs: 1000,
      correlationId: 'fixture/connections',
      sourceReference: 'fixture',
      metadata: {},
    },
    output: [
      'Completed the responsive performance audit.',
      'Saved to /Users/sarthak/Desktop/fleet/report.json',
      'private retained result must not enter the connection projection',
    ].join('\n'),
    metrics: [{
      metricName: 'performance-score',
      value: 92,
      unit: 'score-100',
      direction: 'higher-is-better',
      entityKind: 'domain',
      entityId: 'heypace.app',
      observedAt: '2026-07-30T09:00:01.000Z',
      provenance: 'fixture',
      dimensions: {},
    }],
  });
  return { root, home, skillRoot, runId: recordedSkillRun.run.runId };
}

test('reads one retained skill output with private paths removed', () => {
  const { home, runId } = fixture();
  const result = readSkillRunOutput({ home, runId });
  assert.equal(result.runId, runId);
  assert.equal(result.outputCount, 1);
  assert.match(result.streams[0].content, /\[private path\]/);
  assert.doesNotMatch(result.streams[0].content, /\/Users\/sarthak/);
});

test('projects provider-authoritative search and Cloudflare activity without conflating AI visibility', () => {
  const { root, home } = fixture();
  appendVisibilityOutcomeBundle({
    schema: VISIBILITY_OUTCOME_BUNDLE_SCHEMA,
    observations: [
      {
        id: 'search-pace-2026-07-30',
        projectId: 'pace',
        family: 'search',
        provider: 'google-search-console',
        providerUrl: 'https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3Aheypace.app',
        scope: 'sc-domain:heypace.app',
        observedAt: '2026-07-31T12:00:00.000Z',
        period: {
          start: '2026-07-01T00:00:00.000Z',
          end: '2026-07-30T23:59:59.000Z',
        },
        metrics: [
          { label: 'Search impressions', value: 120 },
          { label: 'Search clicks', value: 8 },
          { label: 'Search CTR', value: 6.67 },
          { label: 'Search average position', value: 14.2 },
        ],
        indexInspection: {
          inspectedUrl: 'https://heypace.app/',
          state: 'indexed',
          verdict: 'PASS',
          coverageState: 'Submitted and indexed',
          robotsTxtState: 'ALLOWED',
          indexingState: 'INDEXING_ALLOWED',
          pageFetchState: 'SUCCESSFUL',
        },
      },
      {
        id: 'search-pace-2026-07-31',
        projectId: 'pace',
        family: 'search',
        provider: 'google-search-console',
        scope: 'sc-domain:heypace.app',
        observedAt: '2026-07-31T13:00:00.000Z',
        period: {
          start: '2026-07-02T00:00:00.000Z',
          end: '2026-07-31T12:59:59.000Z',
        },
        metrics: [
          { label: 'Search impressions', value: 0 },
          { label: 'Search clicks', value: 0 },
          { label: 'Search CTR', value: 0 },
        ],
        indexInspection: {
          inspectedUrl: 'https://heypace.app/',
          state: 'unavailable',
          verdict: null,
          coverageState: null,
          robotsTxtState: null,
          indexingState: null,
          pageFetchState: null,
          failureReason: 'Search Console request timed out',
        },
      },
      {
        id: 'cloudflare-crawl-pace-2026-07-30',
        projectId: 'pace',
        family: 'ai-crawl',
        provider: 'cloudflare-ai-crawl-control',
        providerUrl: 'https://dash.cloudflare.com/account/zone/ai',
        scope: 'heypace.app',
        observedAt: '2026-07-31T12:00:00.000Z',
        period: {
          start: '2026-07-24T00:00:00.000Z',
          end: '2026-07-30T23:59:59.000Z',
        },
        metrics: [
          { label: 'AI crawler requests', value: 18 },
          { label: 'AI crawled URLs', value: 7 },
        ],
        breakdowns: [{
          id: 'ai-crawlers',
          label: 'AI crawlers',
          unit: 'requests',
          values: [{ label: 'GPTBot', value: 12 }],
        }],
      },
      {
        id: 'cloudflare-referral-pace-2026-07-30',
        projectId: 'pace',
        family: 'ai-referral',
        provider: 'cloudflare-web-analytics',
        providerUrl: 'https://dash.cloudflare.com/account/zone/analytics/traffic',
        scope: 'heypace.app',
        observedAt: '2026-07-31T12:00:00.000Z',
        period: {
          start: '2026-07-24T00:00:00.000Z',
          end: '2026-07-30T23:59:59.000Z',
        },
        metrics: [
          { label: 'AI referral visits', value: 3 },
          { label: 'AI referral page views', value: 5 },
        ],
      },
      {
        id: 'cloudflare-traffic-pace-2026-07-30',
        projectId: 'pace',
        family: 'web-traffic',
        provider: 'cloudflare-web-analytics',
        providerUrl: 'https://dash.cloudflare.com/account/zone/analytics/traffic',
        scope: 'heypace.app',
        observedAt: '2026-07-31T12:00:00.000Z',
        period: {
          start: '2026-07-03T00:00:00.000Z',
          end: '2026-07-30T23:59:59.000Z',
        },
        metrics: [
          { label: 'Web visits', value: 240 },
          { label: 'Web page views', value: 380 },
          { label: 'Search referral visits', value: 44 },
        ],
        breakdowns: [{
          id: 'top-pages',
          label: 'Top pages',
          unit: 'page views',
          values: [{ label: '/', value: 200 }],
        }],
      },
      {
        id: 'cloudflare-vitals-pace-2026-07-30',
        projectId: 'pace',
        family: 'web-vitals',
        provider: 'cloudflare-web-analytics',
        providerUrl: 'https://dash.cloudflare.com/account/zone/speed/observatory',
        scope: 'heypace.app',
        observedAt: '2026-07-31T12:00:00.000Z',
        period: {
          start: '2026-07-03T00:00:00.000Z',
          end: '2026-07-30T23:59:59.000Z',
        },
        metrics: [
          { label: 'Field LCP', value: 4200 },
          { label: 'Field INP', value: 140 },
          { label: 'Field CLS', value: 0.04 },
          { label: 'Field TTFB', value: 420 },
          { label: 'RUM samples', value: 88 },
        ],
      },
    ],
  }, {
    path: join(home, '.fleet/visibility-outcomes/ledger.jsonl'),
    allowedProjectIds: new Set(['pace']),
  });

  const result = buildFleetConnections({
    fleetRoot: root,
    home,
    now: '2026-07-31T14:00:00.000Z',
  });
  const pace = result.outputs.projects.find((project) => project.projectId === 'pace');

  assert.equal(pace.metricSemantics.seo.searchOutcome.status, 'measured');
  assert.equal(pace.searchVisibility.outcome.provider, 'google-search-console');
  assert.equal(
    pace.history.signals.find((signal) => signal.label === 'Search average position').value,
    14.2,
  );
  assert.equal(
    pace.searchVisibility.outcome.metrics.some((metric) => metric.label === 'Search average position'),
    false,
  );
  assert.equal(pace.aiVisibility.observations, 0);
  assert.equal(pace.metricSemantics.geo.aiVisibility.status, 'not-measured');
  assert.equal(pace.metricSemantics.geo.crawlerActivity.status, 'measured');
  assert.equal(pace.metricSemantics.geo.referralTraffic.status, 'measured');
  assert.equal(pace.aiVisibility.discovery.crawler.metrics[0].value, 18);
  assert.equal(pace.aiVisibility.discovery.referral.metrics[0].value, 3);
  assert.equal(
    pace.history.signals.find((signal) => signal.label === 'AI referral visits').source,
    'Cloudflare Web Analytics',
  );
  const searchRow = result.outputs.ownerOutcomes.search.find(
    (project) => project.projectId === 'pace',
  );
  assert.equal(searchRow.status, 'zero-impressions');
  assert.equal(searchRow.impressions.value, 0);
  assert.equal(searchRow.clicks.value, 0);
  assert.equal(searchRow.ctr.value, 0);
  assert.equal(searchRow.averagePosition.value, null);
  assert.equal(searchRow.averagePosition.series.length, 1);
  assert.equal(searchRow.observations, 2);
  assert.equal(searchRow.scope, 'sc-domain:heypace.app');
  assert.match(searchRow.providerUrl, /search\.google\.com/);
  assert.equal(searchRow.action.id, 'wait-indexed');
  assert.equal(searchRow.indexInspection.state, 'indexed');
  assert.deepEqual(searchRow.trackedQueries, [{
    id: 'pace-brand',
    kind: 'brand',
    text: 'heypace.app',
    class: 'B',
    observedAt: '2026-07-30T12:00:00.000Z',
  }]);
  const marketingRow = result.outputs.ownerOutcomes.marketing.find(
    (project) => project.projectId === 'pace',
  );
  assert.equal(marketingRow.visits.value, 240);
  assert.equal(marketingRow.pageViews.value, 380);
  assert.equal(marketingRow.traffic.breakdowns[0].values[0].label, '/');
  assert.match(marketingRow.traffic.providerUrl, /dash\.cloudflare\.com/);
  const performanceRow = result.outputs.ownerOutcomes.performance.find(
    (project) => project.projectId === 'pace',
  );
  assert.equal(performanceRow.fieldLcp.value, 4200);
  assert.equal(performanceRow.fieldInp.value, 140);
  assert.equal(performanceRow.status, 'needs-work');
  assert.match(performanceRow.field.providerUrl, /speed\/observatory/);
  assert.match(performanceRow.providerUrl, /speed\/observatory/);
  const awarenessRow = result.outputs.ownerOutcomes.coreAi.find(
    (project) => project.projectId === 'pace',
  );
  assert.equal(awarenessRow.crawlerRequests.value, 18);
  assert.equal(awarenessRow.aiReferralVisits.value, 3);
  assert.equal(awarenessRow.discovery.crawler.breakdowns[0].values[0].label, 'GPTBot');
});

test('builds one honest six-bucket projection from readable Fleet evidence', () => {
  const { root, home } = fixture();
  const result = buildFleetConnections({
    fleetRoot: root,
    home,
    now,
    marketing: {
      recommendations: [{ projectId: 'pace', title: 'Publish the comparison page.' }],
      outcomes: [{
        id: 'marketing-pace-1',
        projectId: 'pace',
        stage: 'publication',
        status: 'published',
        title: 'Pace launch note',
        observedAt: '2026-07-30T08:00:00.000Z',
      }],
      aiVisibility: {
        projects: [{
          projectId: 'pace',
          name: 'Pace',
          questions: [{
            id: 'buyer-discovery:category',
            setId: 'buyer-discovery',
            text: 'What is the best private Mac voice assistant?',
          }],
          latest: {
            observedAt: '2026-07-30T09:10:00.000Z',
            metrics: { visibilityScore: 100 },
            evidence: [{ summary: { evidenceMode: 'fixture' } }],
          },
          history: [{
            observedAt: '2026-07-30T09:10:00.000Z',
            metrics: { visibilityScore: 100 },
            citations: { total: 4 },
            evidence: [{ summary: { evidenceMode: 'fixture' } }],
          }],
        }],
      },
    },
    missions: [{
      id: 'mission-pace-improvement',
      projectId: 'pace',
      state: 'active',
      outcome: 'Create Pace AI visibility baseline',
      updatedAt: '2026-07-30T09:30:00.000Z',
    }],
    feedbackSubmissions: [
      {
        id: 'feedback-1',
        projectId: 'pace',
        category: 'Bug',
        message: 'The weekly chart is difficult to read on a phone.',
        page: '/reports/weekly',
        hasAttachment: true,
        receivedAt: '2026-07-30T09:45:00.000Z',
      },
      {
        id: 'feedback-unsafe',
        projectId: 'unknown',
        category: 'Support',
        message: 'api_key=must-not-enter-the-console',
        page: 'https://example.com/private',
        receivedAt: '2026-07-30T09:40:00.000Z',
      },
    ],
  });

  assert.equal(result.schemaVersion, CONNECTIONS_SCHEMA_VERSION);
  assert.equal(result.buckets.length, 6);
  const internalComponents = result.buckets
    .flatMap((bucket) => bucket.components)
    .filter((component) => component.audience === 'internal');
  assert.deepEqual(
    internalComponents.map((component) => component.id).sort(),
    ['mobile-cockpit', 'reel-pipeline'],
  );
  assert.equal(
    internalComponents.find((component) => component.id === 'mobile-cockpit').sourcePath,
    'foundry/apps/dashboard/mobile-cockpit',
  );
  assert.equal(
    internalComponents.find((component) => component.id === 'reel-pipeline').sourcePath,
    'foundry/marketing/reel-pipeline',
  );
  assert.equal(result.summary.bucketCount, 6);
  assert.equal(result.summary.connected > 0, true);
  assert.equal(result.summary.missing, 2);
  assert.equal(result.summary.highestPriorityGap.id, 'feedback-to-ingestion');
  assert.equal(
    result.connections.find((item) => item.id === 'skill-runs-to-console').status,
    'connected',
  );
  assert.equal(
    result.connections.find((item) => item.id === 'public-workflows-to-console').status,
    'connected',
  );
  assert.equal(result.evidence.skillRuns.runCount, 1);
  assert.equal(result.evidence.skillRuns.metricCount, 1);
  assert.equal(result.outputs.summary.skillRuns, 1);
  assert.equal(result.outputs.summary.successfulSkillRuns, 1);
  assert.equal(result.outputs.summary.failedSkillRuns, 0);
  assert.equal(result.outputs.summary.otherSkillRuns, 0);
  assert.equal(result.outputs.summary.capturedOutputs, 1);
  assert.equal(result.outputs.summary.measuredValues, 1);
  assert.equal(result.outputs.history.length, 1);
  assert.equal(result.outputs.recentRuns[0].outputCount, 1);
  assert.equal(result.outputs.recentRuns[0].outputBytes > 0, true);
  assert.equal(result.outputs.recentRuns[0].resultSummary, 'Recorded performance score.');
  assert.equal(result.outputs.recentRuns[0].resultSummaryKind, 'structured-metrics');
  assert.equal(result.outputs.recentRuns[0].captureCompleteness, 'exact-streams');
  assert.equal(result.outputs.recentRuns[0].durationMs, 1000);
  const paceOutput = result.outputs.projects.find((project) => project.projectId === 'pace');
  assert.equal(paceOutput.skill.runCount, 1);
  assert.equal(paceOutput.public.availability.ok, true);
  assert.equal(paceOutput.domainRating.rating, 8);
  assert.equal(paceOutput.domainRating.source, 'Drank · Ahrefs public endpoint');
  assert.equal(paceOutput.domainRating.rootDomain, 'heypace.app');
  assert.equal(paceOutput.domainRating.sharedRoot, true);
  assert.equal(paceOutput.performance.latest.performanceScore, 96);
  assert.equal(paceOutput.performance.latest.lcp, 820);
  assert.equal(paceOutput.designReview.critique, 34);
  assert.equal(
    paceOutput.history.signals.find((signal) => signal.label === 'Design critique').value,
    34,
  );
  assert.equal(paceOutput.domainRating.series.length, 2);
  assert.equal(
    paceOutput.history.signals.find((signal) => signal.label === 'Worst tracked query class')
      .series.length,
    2,
  );
  assert.equal(
    paceOutput.history.signals.find((signal) => signal.label === 'Agent readiness').value,
    86,
  );
  assert.equal(
    paceOutput.history.signals.find(
      (signal) => signal.label === 'Agent-readable coverage',
    ).value,
    75,
  );
  assert.equal(paceOutput.searchVisibility.configured, true);
  assert.equal(paceOutput.searchVisibility.queries[0].text, 'heypace.app');
  assert.equal(paceOutput.searchVisibility.queries[0].history.length, 2);
  assert.equal(
    paceOutput.aiVisibility.questions[0].text,
    'What is the best private Mac voice assistant?',
  );
  assert.equal(paceOutput.aiVisibility.observations, 0);
  assert.equal(paceOutput.aiVisibility.observedAt, null);
  assert.equal(paceOutput.aiVisibility.fixture.observations, 1);
  assert.equal(
    paceOutput.history.signals.some((signal) => signal.label === 'AI visibility score'),
    false,
  );
  assert.deepEqual(paceOutput.metricSemantics.seo.searchOutcome, {
    kind: 'outcome',
    status: 'not-measured',
    source: 'Google Search Console',
    observedAt: null,
    reason: 'Search Console is not connected.',
  });
  assert.equal(paceOutput.metricSemantics.seo.trackedSearch.status, 'measured');
  assert.equal(paceOutput.metricSemantics.geo.aiVisibility.status, 'not-measured');
  assert.equal(paceOutput.metricSemantics.geo.technicalReadiness.status, 'measured');
  assert.equal(paceOutput.metricSemantics.geo.fixtureCanary.status, 'recorded');
  assert.equal(paceOutput.visibilityReadiness.agent.status, 'needs-work');
  assert.equal(paceOutput.visibilityReadiness.crawl.status, 'ready');
  assert.equal(paceOutput.metricEligibility.publicSite, true);
  assert.deepEqual(paceOutput.domains, ['heypace.app']);
  assert.equal(paceOutput.priority, 'P1');
  assert.equal(result.outputs.ownerOutcomes.domains.length, 3);
  assert.equal(result.outputs.ownerOutcomes.domains[0].domain, 'heypace.app');
  assert.deepEqual(
    result.outputs.ownerOutcomes.domains[0].projects.map((project) => project.projectId),
    ['pace', 'standards'],
  );
  assert.equal(result.outputs.ownerOutcomes.domains[0].signal.value, 8);
  assert.deepEqual(
    result.outputs.ownerOutcomes.domains.find((domain) => domain.domain === 'past.example').projects,
    [],
  );
  assert.deepEqual(
    result.outputs.ownerOutcomes.domains.find((domain) => domain.domain === 'personal.example').projects,
    [],
  );
  assert.equal(result.outputs.ownerOutcomes.coreAi.length, 1);
  assert.equal(result.outputs.ownerOutcomes.coreAi[0].projectId, 'pace');
  assert.equal(result.outputs.ownerOutcomes.coreAi[0].status, 'not-measured');
  assert.equal(
    result.outputs.ownerOutcomes.marketing.find((project) => project.projectId === 'pace').status,
    'marketed',
  );
  assert.equal(
    result.outputs.ownerOutcomes.marketing.find((project) => project.projectId === 'standards').status,
    'never-marketed',
  );
  assert.equal(
    result.outputs.ownerOutcomes.performance.find((project) => project.projectId === 'pace').status,
    'fast-enough',
  );
  assert.equal(
    result.outputs.ownerOutcomes.performance.find((project) => project.projectId === 'standards').status,
    'not-measured',
  );
  assert.equal(result.outputs.ownerOutcomes.search.length, 2);
  assert.equal(
    result.outputs.ownerOutcomes.search.find((project) => project.projectId === 'pace').status,
    'not-measured',
  );
  assert.equal(
    result.outputs.projects.filter((project) => project.domainRating).length,
    3,
  );
  assert.equal(
    result.outputs.projects.filter((project) => project.metricEligibility.publicSite).length,
    2,
  );
  assert.equal(
    result.outputs.projects.find((project) => project.projectId === 'standards')
      .metricEligibility.publicSite,
    true,
  );
  assert.equal(
    result.outputs.projects.find((project) => project.projectId === 'past-project')
      .metricEligibility.publicSite,
    false,
  );
  assert.equal(
    result.outputs.projects.find((project) => project.projectId === 'past-project')
      .metricEligibility.domainCoverage,
    true,
  );
  assert.equal(
    result.outputs.projects.find((project) => project.projectId === 'personal')
      .metricEligibility.domainCoverage,
    true,
  );
  assert.equal(
    paceOutput.history.signals.find((signal) => signal.label === 'Domain rating').series.length,
    2,
  );
  assert.equal(paceOutput.history.state, 'comparable');
  assert.equal(result.outputs.skillRuns.length, 1);
  assert.equal(result.outputs.skillHistoryByProject[0].periods[0].runs, 1);
  assert.equal(result.outputs.feedback.total, 2);
  assert.deepEqual(result.outputs.feedback.submissions[0], {
    id: 'feedback-1',
    projectId: 'pace',
    category: 'Bug',
    message: 'The weekly chart is difficult to read on a phone.',
    page: '/reports/weekly',
    hasAttachment: true,
    receivedAt: '2026-07-30T09:45:00.000Z',
  });
  assert.equal(
    result.outputs.feedback.submissions[1].message,
    'Feedback content withheld by the privacy filter.',
  );
  assert.equal(result.outputs.feedback.submissions[1].projectId, null);
  assert.equal(result.outputs.feedback.submissions[1].page, null);
  assert.equal(
    result.outputs.improvements.some((action) => action.id === 'connection:feedback-to-ingestion'),
    true,
  );
  const linkedImprovement = result.outputs.improvements.find(
    (action) => action.id === 'project:pace:ai-baseline',
  );
  assert.equal(linkedImprovement.work.missionId, 'mission-pace-improvement');
  assert.equal(linkedImprovement.work.state, 'active');
  assert.equal(result.outputs.improvementWork.activeActions, 1);
  assert.equal(
    result.outputs.improvementWork.notStartedActions,
    result.outputs.improvements.length - 1,
  );
  const connectionAnchors = new Set([
    ...result.buckets.map((bucket) => `bucket-${bucket.id}`),
    ...result.connections.map((item) => item.id),
    'skill-runs',
    'public-evidence',
    'domain-intelligence',
  ]);
  for (const item of [
    ...result.buckets.flatMap((bucket) => bucket.components),
    ...result.connections,
  ]) {
    if (!item.ownerPath.startsWith('/connections#')) continue;
    assert.equal(
      connectionAnchors.has(item.ownerPath.slice('/connections#'.length)),
      true,
      `${item.id} points to a rendered Connections anchor`,
    );
  }

  const serialized = JSON.stringify(result);
  assert.doesNotMatch(serialized, /private retained result/);
  assert.doesNotMatch(serialized, /Application Support/);
  assert.doesNotMatch(serialized, /history\.db/);
  assert.doesNotMatch(serialized, /runs\/2026/);
});

test('limits core AI awareness to provider-backed P1 outcomes', () => {
  const { root, home } = fixture();
  const providerRun = {
    observedAt: '2026-07-30T09:10:00.000Z',
    evidenceMode: 'provider-observation',
    metrics: {
      visibilityScore: 82,
      mentionRate: 0.75,
      recommendationRate: 0.5,
      citationRate: 0.25,
      averagePosition: 1.7,
    },
    coverage: { configured: 4, completed: 3, unavailable: 1, timedOut: 0, failed: 0 },
    attempts: [{
      promptId: 'buyer-discovery/category/founder',
      persona: 'founder',
      providerId: 'provider-export',
      model: 'provider-model',
      status: 'completed',
    }],
    citations: {
      total: 4,
      urls: [
        'https://heypace.app/docs',
        'https://github.com/HeyPace/pace/releases',
        'https://independent.example/review',
      ],
      hosts: ['heypace.app', 'github.com', 'independent.example', 'legacy.example'],
    },
  };
  const result = buildFleetConnections({
    fleetRoot: root,
    home,
    now,
    marketing: {
      aiVisibility: {
        projects: [{
          projectId: 'pace',
          name: 'Pace',
          questions: [{ id: 'buyer-discovery:category', setId: 'buyer-discovery', text: 'Which Mac voice agent is private?' }],
          latest: providerRun,
          history: [providerRun],
        }],
      },
    },
  });

  assert.deepEqual(result.outputs.ownerOutcomes.coreAi.map((project) => project.projectId), ['pace']);
  assert.equal(result.outputs.ownerOutcomes.coreAi[0].status, 'known');
  assert.equal(result.outputs.ownerOutcomes.coreAi[0].mention.value, 75);
  assert.equal(result.outputs.ownerOutcomes.coreAi[0].recommendation.value, 50);
  assert.deepEqual(result.outputs.ownerOutcomes.coreAi[0].citationSources, {
    total: 4,
    owned: 2,
    external: 1,
    unclassified: 1,
    sources: [
      { url: 'https://heypace.app/docs', host: 'heypace.app', ownership: 'owned' },
      { url: 'https://github.com/HeyPace/pace/releases', host: 'github.com', ownership: 'owned' },
      { url: 'https://independent.example/review', host: 'independent.example', ownership: 'external' },
      { url: null, host: 'legacy.example', ownership: 'unclassified' },
    ],
  });
  assert.equal(result.outputs.ownerOutcomes.coreAi[0].questions.length, 1);
  assert.equal(result.outputs.ownerOutcomes.coreAi[0].attempts.length, 1);
});

test('isolates absent machine evidence without hiding implemented contracts', () => {
  const root = mkdtempSync(join(tmpdir(), 'fleet-connections-empty-'));
  const result = buildFleetConnections({
    fleetRoot: root,
    home: join(root, 'empty-home'),
    now,
    marketing: { aiVisibility: { projects: [] } },
  });

  assert.equal(result.buckets.length, 6);
  assert.equal(
    result.connections.find((item) => item.id === 'skill-runs-to-console').status,
    'unavailable',
  );
  assert.equal(
    result.connections.find((item) => item.id === 'feedback-to-ingestion').status,
    'missing',
  );
  assert.equal(
    result.connections.find((item) => item.id === 'console-to-mobile').status,
    'missing',
  );
  assert.equal(result.evidence.publicWorkflows.sites, 0);
  assert.equal(result.outputs.summary.capturedOutputs, 0);
  assert.equal(result.outputs.feedback.total, 0);
  assert.deepEqual(result.outputs.feedback.submissions, []);
  assert.equal(result.outputs.projects.every((project) => project.skill === null), true);
});

test('derives a bounded result summary without projecting the retained body', () => {
  const { root, home, skillRoot } = fixture();
  const skillStore = new SkillRunStore({ root: skillRoot, env: {} });
  skillStore.record({
    run: {
      idempotencyKey: 'fixture/spec-driven/2',
      skillId: 'spec-driven',
      skillVersion: '1',
      projectId: 'pace',
      projectRoot: '/workspace/pace',
      actor: 'codex',
      host: 'fixture-host',
      source: 'codex-hook',
      captureCompleteness: 'final-response',
      status: 'succeeded',
      exitCode: 0,
      startedAt: '2026-07-30T09:30:00.000Z',
      finishedAt: '2026-07-30T09:30:01.000Z',
      observedAt: '2026-07-30T09:30:01.000Z',
      durationMs: 1000,
      correlationId: 'fixture/summary',
      sourceReference: 'fixture',
      metadata: {},
    },
    output: [
      'Created the output-first Fleet Console specification.',
      '/Users/example/private/project must not enter the projection.',
    ].join('\n'),
    metrics: [],
  });

  const result = buildFleetConnections({
    fleetRoot: root,
    home,
    now,
    marketing: { aiVisibility: { projects: [] } },
  });
  const recent = result.outputs.recentRuns.find((run) => run.skillId === 'spec-driven');
  assert.equal(recent.resultSummary, 'Created the output-first Fleet Console specification.');
  assert.equal(recent.resultSummaryKind, 'sanitized-excerpt');
  assert.equal(result.outputs.skillRuns.length, 2);
  assert.equal(
    result.outputs.skillHistoryByProject.find((item) => item.projectId === 'pace').periods[0].runs,
    2,
  );
  assert.doesNotMatch(JSON.stringify(result), /Users\/example/);
});

test('surfaces stale evidence independently from an implemented transport', () => {
  const { root, home } = fixture();
  writeJson(join(root, 'foundry/helpers/drank/data/fleet-dr.json'), {
    lastUpdated: '2026-06-01T10:00:00.000Z',
    domains: { 'heypace.app': { history: [{ ts: 1748772000000, dr: 8 }] } },
  });

  const result = buildFleetConnections({
    fleetRoot: root,
    home,
    now,
    marketing: { aiVisibility: { projects: [] } },
  });

  const drank = result.connections.find((item) => item.id === 'drank-to-console');
  assert.equal(drank.status, 'connected');
  assert.equal(drank.freshness, 'stale');
  assert.equal(result.summary.stale > 0, true);
  assert.equal(
    result.buckets.find((bucket) => bucket.id === 'helpers').status,
    'partial',
  );
});
