import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { buildReadinessProjection } from './readiness.mjs';

export function createWeeklyReview({ store, observations = [], now = new Date().toISOString(), path = join(process.env.HOME, 'Library/Application Support/Fleet Ops/founder-control/weekly-review.json') }) {
  const date = new Date(now);
  // ISO Monday, UTC: one deterministic comparison window per week.
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  const week = date.toISOString().slice(0, 10);
  let previous = null;
  try { previous = JSON.parse(readFileSync(path, 'utf8')); } catch { /* First baseline. */ }
  const projection = buildReadinessProjection({ ...store.rebuildProjections(), observations, generatedAt: now });
  const baseline = previous?.week === week ? previous.baseline : previous?.projects ?? null;
  const projects = projection.projects.map(project => ({
    id: project.id, name: project.name, revision: project.revision, scores: project.scores,
    nextLevers: project.state.nextLevers, evidence: project.evidence,
    changedSinceBaseline: baseline ? JSON.stringify(baseline.find(row => row.id === project.id)?.scores) !== JSON.stringify(project.scores) : null,
  }));
  const report = { schemaVersion: 1, week, generatedAt: now, baseline, projects,
    counts: { currentProducts: projects.length, assessedProducts: projection.projects.filter(project => Object.keys(project.state.requirements).length || Object.keys(project.state.benchmarks).length).length,
      productsWithNumericEvidence: projects.filter(project => project.evidence.some(row => typeof row.value === 'number')).length },
    policy: 'Complete one selected lever, attach dated proof, then compare the same definitions/windows. Unknown measurements are not zero; evidence collection alone is not score improvement.',
  };
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const temporary = `${path}.${randomUUID()}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600, flag: 'wx' });
  renameSync(temporary, path);
  const history = join(dirname(path), 'weekly-reviews');
  mkdirSync(history, { recursive: true, mode: 0o700 });
  const historic = join(history, `${week}.json`);
  const historyTemporary = `${historic}.${randomUUID()}.tmp`;
  writeFileSync(historyTemporary, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600, flag: 'wx' });
  renameSync(historyTemporary, historic);
  return report;
}
