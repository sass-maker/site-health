import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { mergeUsageSnapshots, usageTimestamp as iso } from './usage-evidence-core.mjs';
export * from './usage-evidence-core.mjs';
const execFileAsync = promisify(execFile);

export const defaultUsageEvidencePath = () => join(process.env.HOME, 'Library/Application Support/Fleet Ops/founder-control/app-health-usage.json');

export function readUsageEvidence(path = defaultUsageEvidencePath()) {
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return null; }
}

// Persist aggregates only. No provider response, token, actor ID or URL query
// is written to disk. Daily history makes comparisons reproducible.
export function writeUsageEvidence(snapshot, path = defaultUsageEvidencePath()) {
  snapshot = mergeUsageSnapshots(snapshot, readUsageEvidence(path));
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const temporary = `${path}.${randomUUID()}.tmp`;
  const data = `${JSON.stringify(snapshot, null, 2)}\n`;
  writeFileSync(temporary, data, { mode: 0o600, flag: 'wx' });
  renameSync(temporary, path);
  const day = iso(snapshot.observedAt)?.slice(0, 10);
  if (day) {
    const history = join(dirname(path), 'usage-history');
    mkdirSync(history, { recursive: true, mode: 0o700 });
    const historic = join(history, `${day}.json`);
    const tempHistory = `${historic}.${randomUUID()}.tmp`;
    writeFileSync(tempHistory, data, { mode: 0o600, flag: 'wx' });
    renameSync(tempHistory, historic);
  }
}

export async function appHealthCredential({ env = process.env, readSecret = execFileAsync } = {}) {
  if (env.APP_HEALTH_READ_TOKEN) return env.APP_HEALTH_READ_TOKEN;
  try {
    const result = await readSecret('/usr/bin/security', ['find-generic-password', '-s', 'com.sassmaker.site-health.app-health-read', '-a', 'owner', '-w'], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 15_000,
    });
    const token = String(result.stdout ?? '').trim();
    if (token) return token;
  } catch { /* The scoped connection is optional; unavailable stays unknown. */ }
  return null;
}
