export function startLocalUsageTracking(input: {
  document: Document;
  window: Window & typeof globalThis;
}): () => void;

export function downloadLocalUsageBundle(
  document: Document,
  window: Window & typeof globalThis,
  now?: Date,
): void;

export function recordLocalInteraction(storage: Storage, now?: Date): boolean;

export function buildLocalUsageBundle(storage: Storage, now?: Date): {
  kind: "portfolio-usage";
  schemaVersion: 1;
  usage: {
    schemaVersion: 1;
    updatedAt: string;
    records: Record<string, unknown>;
  };
};
