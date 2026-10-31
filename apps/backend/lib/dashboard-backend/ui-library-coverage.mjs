import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const defaultUiCoveragePath = () => join(process.env.HOME ?? '', 'Library', 'Application Support', 'Fleet Ops', 'ui-library-coverage', 'latest.json');
let cache;
import { uiLibraryCoverage as portableCoverage } from './ui-library-coverage-core.mjs';
export function uiLibraryCoverage(snapshot, projectId, now = Date.now()) {
  const result = portableCoverage(snapshot, projectId, now);
  return result ? { ...result, evidencePath: result.evidencePath ?? defaultUiCoveragePath() } : null;
}
export function readUiLibraryCoverage(path = defaultUiCoveragePath()) {
  try {
    const stat = statSync(path); if (stat.size > 12 * 1024 * 1024) return null;
    const key = `${path}:${stat.mtimeMs}:${stat.size}`;
    if (cache?.key === key) return cache.value;
    const value = JSON.parse(readFileSync(path, 'utf8')); cache = { key, value }; return value;
  } catch { return null; }
}
