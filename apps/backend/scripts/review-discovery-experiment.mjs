#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { reviewDiscoveryExperiment } from '../lib/discovery-experiment.mjs';

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
  ...(report.limitations ?? []).map((limitation) => `- ${limitation}`), '',
].join('\n');
if (args.includes('--write')) {
  writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(markdownOutput, text);
}
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (refreshError) process.exitCode = 1;
