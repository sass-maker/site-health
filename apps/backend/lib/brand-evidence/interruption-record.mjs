const MAX_BYTES = 32_768;
const MAX_IDS = 100;
const idsValid = (ids) => Array.isArray(ids) && ids.every((id) => typeof id === 'string' && id.length > 0)
  && new Set(ids).size === ids.length;

export function interruptionRecord(collections, checks, interruptedAt = new Date().toISOString()) {
  if (!idsValid(collections) || !idsValid(checks) || collections.length + checks.length > MAX_IDS
    || typeof interruptedAt !== 'string' || !Number.isFinite(Date.parse(interruptedAt))
    || new Date(interruptedAt).toISOString() !== interruptedAt) throw new Error('Invalid interruption journal');
  const record = { version: 1, interruptedAt, collections, checks };
  if (Buffer.byteLength(JSON.stringify(record)) > MAX_BYTES) throw new Error('Interruption journal exceeds its bound');
  return record;
}

