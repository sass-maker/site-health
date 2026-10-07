#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { reviewDiscoveryExperiment, reviewDiscoveryRecrawl } from '../lib/discovery-experiment.mjs';
import { inspectSearchConsoleUrl } from '../lib/search-console.mjs';

const args = process.argv.slice(2);
const configIndex = args.indexOf('--experiment');
if (configIndex < 0 || !args[configIndex + 1]) throw new Error('Required: --experiment /absolute/path/experiment.json');
const configPath = resolve(args[configIndex + 1]);
const experiment = JSON.parse(readFileSync(configPath, 'utf8'));
const output = resolve(dirname(configPath), 'next-week-review.json');
const markdownOutput = resolve(dirname(configPath), 'next-week-review.md');
// launchd calendar entries have no year field. Guard a scheduled review against
// any repeat invocation, without silently performing another provider refresh.
if (args.includes('--once') && existsSync(output)) {
  process.stdout.write('Review already recorded; no refresh performed.\n');
  process.exit(0);
}
let refreshError = null;
if (args.includes('--refresh') && experiment.publication?.status === 'live-verified') {
  try {
    for (const target of experiment.liveChecks) {
      const response = await fetch(target.url, { headers: { 'user-agent': 'FleetAnalyticsAudit/1.0' }, signal: AbortSignal.timeout(20000) });
      const html = await response.text();
      if (response.status !== 200 || !target.expected.every((text) => html.includes(text))) {
        throw new Error(`Experiment content is not live at ${target.url}`);
      }
    }
    // Reuse the existing first-party collector and its ledger, authentication,
    // final-data rules and refresh receipts. No second collection pipeline.
    const result = spawnSync(process.execPath, [experiment.collectorPath, '--project', experiment.projectId], {
      cwd: experiment.collectorCwd, encoding: 'utf8', timeout: 180000, maxBuffer: 512 * 1024,
    });
    if (result.status !== 0) throw new Error('Existing Search Console collector failed; see its refresh receipt.');
  } catch (error) {
    refreshError = error.message;
  }
}
const records = readFileSync(experiment.ledgerPath, 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line));
const observation = records.filter((record) => record.provider === 'google-search-console' && record.projectId === experiment.projectId)
  .sort((a, b) => b.observedAt.localeCompare(a.observedAt))[0];
const report = refreshError
  ? { schema: 'fleet.discovery-experiment-review.v1', experimentId: experiment.id, reviewedAt: new Date().toISOString(), status: 'unavailable', reason: refreshError }
  : reviewDiscoveryExperiment(experiment, observation);
// Supplement the existing metrics collector with bounded inspections of the
// exact changed URLs, using its canonical adapter and existing Google client.
// This does not submit URLs, change sitemaps, or create a metrics ledger.
const inspections = [];
let inspectionError = null;
if (args.includes('--refresh') && !refreshError && experiment.publication?.status === 'live-verified') {
  try {
    const urls = experiment.liveChecks.map((target) => target.url);
    const origin = new URL(experiment.publication.publicUrl).origin;
    if (!urls.length || urls.length > 5 || urls.some((url) => new URL(url).origin !== origin)) {
      throw new Error('Inspections must stay on the experiment origin and contain at most five URLs.');
    }
    const siteUrl = experiment.scope.split(' · page:')[0];
    const host = new URL(origin).hostname;
    const domain = siteUrl.startsWith('sc-domain:') ? siteUrl.slice(10) : null;
    if (domain ? host !== domain && !host.endsWith(`.${domain}`)
      : urls.some((url) => !url.startsWith(new URL(siteUrl).href))) {
      throw new Error('Inspection property does not match the experiment origin.');
    }
    const config = JSON.parse(readFileSync(resolve(experiment.collectorCwd, 'apps/backend/config/search-console.json'), 'utf8'));
    const auth = spawnSync('gcloud', ['auth', 'application-default', 'print-access-token'], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000,
    });
    if (auth.status !== 0 || !auth.stdout.trim()) throw new Error('Existing Google authorization unavailable for URL inspections.');
    for (const inspectionUrl of urls) {
      inspections.push(await inspectSearchConsoleUrl({ inspectionUrl, siteUrl,
        accessToken: auth.stdout.trim(), quotaProject: config.quotaProject }));
    }
  } catch {
    // Avoid leaking authentication or provider payloads into a report.
    inspectionError = 'Changed-route inspection unavailable; do not infer a recrawl.';
  }
}
report.recrawl = reviewDiscoveryRecrawl(experiment, inspections);
if (inspectionError) report.recrawl.reason = inspectionError;
if (inspections.length) report.recrawl.inspectedAt = new Date().toISOString();
const text = [
  '# Anime List discovery experiment review', '',
  `Status: **${report.status}**. Reviewed ${report.reviewedAt}.`, '',
  report.reason ?? report.decision ?? '', '',
  ...(report.before ? [
    '| Metric | Matched previous weekdays | Treatment |',
    '| --- | ---: | ---: |',
    `| Google clicks | ${report.before.clicks} | ${report.after.clicks} |`,
    `| Impressions | ${report.before.impressions} | ${report.after.impressions} |`, '',
    `Previous: ${report.before.start}–${report.before.end}. Treatment: ${report.after.start}–${report.after.end}. Search Console Pacific dates; ${report.days} complete days.`, '',
  ] : []),
  '## Changed-page crawl evidence', '',
  `Status: **${report.recrawl.status}**.`, '',
  '| URL | Google index state | Last recorded crawl | Crawl after publication |',
  '| --- | --- | --- | --- |',
  ...report.recrawl.routes.map((route) => `| ${route.url} | ${route.coverageState ?? route.indexState} | ${route.lastCrawlTime ?? 'Unknown'} | ${route.recrawledSincePublication === null ? 'Unknown' : route.recrawledSincePublication ? 'Yes' : 'No'} |`), '',
  report.recrawl.reason ?? report.recrawl.limitation ?? '', '',
  ...(report.limitations ?? []).map((limitation) => `- ${limitation}`), '',
].join('\n');
if (args.includes('--write')) {
  writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(markdownOutput, text);
}
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (refreshError) process.exitCode = 1;
