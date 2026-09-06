import { numeric } from '../dashboard-projection.mjs';

const METADATA_KEY = 'spend-snapshot:portfolio';

// The spend collector's own rule: a cost it could not read is `unknown`, never `$0`. This reader
// preserves that distinction end to end — an absent snapshot reports `not-collected`, a stored
// snapshot keeps whatever `spendState` each provider recorded, and neither ever becomes a number.
export function readSpendSnapshot(store) {
  const snapshot = store.getMetadata(METADATA_KEY)?.value ?? null;
  if (!snapshot) {
    return {
      schemaVersion: 'site-health.spend-snapshot.v1',
      scope: 'portfolio',
      state: 'not-collected',
      observedAt: null,
      runId: null,
      alert: null,
      providers: [],
    };
  }
  return {
    schemaVersion: snapshot.schemaVersion ?? 'site-health.spend-snapshot.v1',
    scope: snapshot.scope ?? 'portfolio',
    state: snapshot.state ?? 'unknown',
    observedAt: snapshot.observedAt ?? null,
    runId: snapshot.runId ?? null,
    alert: snapshot.alert ?? null,
    providers: (snapshot.providers ?? []).map((provider) => ({
      provider: provider.provider,
      spendState: provider.spendState ?? 'unknown',
      evidenceStatus: provider.evidenceStatus ?? 'unavailable',
      confidence: provider.confidence ?? null,
      period: provider.period ?? null,
      costs: (provider.costs ?? []).map((cost) => ({
        label: cost.label ?? cost.metric ?? null,
        amountUsd: numeric(cost.amountUsd),
        basis: cost.basis ?? null,
      })),
      quotas: (provider.quotas ?? []).map((quota) => ({
        metric: quota.metric ?? null,
        used: numeric(quota.used),
        limit: numeric(quota.limit),
        unit: quota.unit ?? null,
        percent: numeric(quota.percent),
      })),
      evidenceGaps: (provider.evidenceGaps ?? []).map(String),
    })),
  };
}
