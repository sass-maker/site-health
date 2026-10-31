import { snapshotDigest } from '../lib/store-snapshot.mjs';
const FAMILIES = new Set(['catalog','dashboard','ui-library','capabilities','spend','clarity','usage','provider-revenue','policy','artifact']);
const MAX_BYTES = 16 * 1024 * 1024;
const fail = message => { throw Object.assign(new Error(message), { statusCode: 503 }); };
export function evidenceReference(document) {
  if (!FAMILIES.has(document?.family) || document.schema !== 'site-health.cloud-evidence.v1'
    || typeof document.source !== 'string' || !document.source || !Number.isFinite(Date.parse(document.observedAt))
    || !['provider','public-probe','authenticated-native-feed','source-observation'].includes(document.provenance)
    || document.payload === undefined) fail('Invalid evidence document');
  const digest = snapshotDigest(document);
  return { family: document.family, digest, observedAt: document.observedAt, provenance: document.provenance };
}
export async function writeEvidence(bucket, document) {
  const reference = evidenceReference(document), body = JSON.stringify(document);
  if (new TextEncoder().encode(body).length > MAX_BYTES) fail('Evidence exceeds its bound');
  await bucket.put(`evidence/${reference.family}/${reference.digest}.json`, body,
    { httpMetadata: { contentType: 'application/json' }, onlyIf: { etagDoesNotMatch: '*' } });
  // A conditional put alone does not prove that an existing object is intact.
  await readEvidence(bucket,reference,reference.family);
  return reference;
}
export async function readEvidence(bucket, reference, family) {
  if (!bucket || reference?.family !== family || !FAMILIES.has(family) || !/^[a-f0-9]{64}$/.test(reference?.digest ?? '')) fail('Evidence source unavailable');
  const object = await bucket.get(`evidence/${family}/${reference.digest}.json`);
  if (!object || object.size > MAX_BYTES) fail('Evidence source unavailable');
  const document = await object.json();
  const verified = evidenceReference(document);
  if (verified.digest !== reference.digest || verified.family !== family) fail('Evidence integrity failed');
  return document;
}
