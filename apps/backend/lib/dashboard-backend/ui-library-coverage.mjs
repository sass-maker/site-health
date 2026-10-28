import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const defaultUiCoveragePath = () => join(process.env.HOME ?? '', 'Library', 'Application Support', 'Fleet Ops', 'ui-library-coverage', 'latest.json');
let cache;
const percent = (shared, eligible) => eligible ? Math.round(1000 * shared / eligible) / 10 : null;
const validCounts = row => Number.isSafeInteger(row?.shared) && Number.isSafeInteger(row?.eligible) && row.shared >= 0 && row.eligible >= row.shared;
const count = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;

// Observation only: adoption never mutates checklist assessments or Results.
export function uiLibraryCoverage(snapshot, projectId, now = Date.now()) {
  const row = snapshot?.records?.[projectId];
  if (snapshot?.schemaVersion !== 'ui-library-source-coverage.v1' || !row || !validCounts(row) || !['source-estimate', 'no-eligible-controls', 'not-measured', 'unavailable', 'scan-failed'].includes(row.status) || !Number.isFinite(Date.parse(snapshot.observedAt)) || Date.parse(snapshot.observedAt) > now + 60_000) return null;
  if (row.status === 'source-estimate' && (row.eligible === 0 || !/^[a-f0-9]{40}$/.test(row.revision ?? ''))) return null;
  if (row.status === 'no-eligible-controls' && (row.eligible !== 0 || !/^[a-f0-9]{40}$/.test(row.revision ?? '') || (!Array.isArray(row.surfaces) || !row.surfaces.some(s => Array.isArray(s?.files) && s.files.some(f => Number.isSafeInteger(f?.documents) && f.documents > 0))))) return null;
  if (!Array.isArray(row.surfaces)) return null;
  const surfaces = row.surfaces.filter(s => ['web', 'landing', 'native'].includes(s?.kind) && validCounts(s)).map(s => ({ kind: s.kind, shared: s.shared, eligible: s.eligible, percent: percent(s.shared, s.eligible), files: Array.isArray(s.files) ? s.files.length : 0, tokenFiles: count(s.tokenFiles), sharedBlocks: count(s.sharedBlocks) }));
  if (surfaces.reduce((n, s) => n + s.shared, 0) !== row.shared || surfaces.reduce((n, s) => n + s.eligible, 0) !== row.eligible) return null;
  return { status: row.status, percent: row.status === 'source-estimate' ? percent(row.shared, row.eligible) : null, shared: row.shared, eligible: row.eligible, observedAt: snapshot.observedAt, stale: now - Date.parse(snapshot.observedAt) > 7 * 24 * 60 * 60_000, revision: typeof row.revision === 'string' ? row.revision : null, dirty: row.dirty === true, surfaces, gap: String(row.gap ?? '').slice(0, 1200), evidencePath: typeof snapshot.evidencePath === 'string' ? snapshot.evidencePath : defaultUiCoveragePath() };
}
export function readUiLibraryCoverage(path = defaultUiCoveragePath()) {
  try {
    const stat = statSync(path); if (stat.size > 12 * 1024 * 1024) return null;
    const key = `${path}:${stat.mtimeMs}:${stat.size}`;
    if (cache?.key === key) return cache.value;
    const value = JSON.parse(readFileSync(path, 'utf8')); cache = { key, value }; return value;
  } catch { return null; }
}
