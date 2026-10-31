import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { mergeProviderRevenueSnapshots, providerRevenueTimestamp as iso } from './provider-revenue-core.mjs';
export * from './provider-revenue-core.mjs';

export const defaultProviderRevenueEvidencePath = () => join(process.env.HOME, 'Library/Application Support/Fleet Ops/founder-control/app-health-provider-revenue.json');

export function readProviderRevenueEvidence(path = defaultProviderRevenueEvidencePath()) {
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return null; }
}

export function writeProviderRevenueEvidence(snapshot, path = defaultProviderRevenueEvidencePath()) {
  snapshot = mergeProviderRevenueSnapshots(snapshot, readProviderRevenueEvidence(path));
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const data = `${JSON.stringify(snapshot, null, 2)}\n`;
  const temporary = `${path}.${randomUUID()}.tmp`;
  writeFileSync(temporary, data, { mode: 0o600, flag: 'wx' });
  renameSync(temporary, path);
  const day = iso(Date.parse(snapshot.observedAt))?.slice(0, 10);
  if (day) {
    const history = join(dirname(path), 'provider-revenue-history');
    mkdirSync(history, { recursive: true, mode: 0o700 });
    const historic = join(history, `${day}.json`);
    const tempHistory = `${historic}.${randomUUID()}.tmp`;
    writeFileSync(tempHistory, data, { mode: 0o600, flag: 'wx' });
    renameSync(tempHistory, historic);
  }
}
