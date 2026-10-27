import test from 'node:test';
import assert from 'node:assert/strict';
import { evidenceRowId, numericEvidence } from '../src/lib/evidence-table.mjs';

test('evidence columns keep real zero separate from missing or invalid measurements', () => {
  assert.equal(numericEvidence(0), 0);
  assert.equal(numericEvidence(33.333), 33.333);
  for (const absent of [null, undefined, '', '33.3%', false, NaN, Infinity]) {
    assert.equal(numericEvidence(absent), null);
  }
});

test('one product can open distinct domain and property evidence records', () => {
  const root = { projectId: 'example', domain: 'example.com', property: 'sc-domain:example.com' };
  assert.notEqual(evidenceRowId(root), evidenceRowId({ ...root, domain: 'app.example.com' }));
  assert.notEqual(evidenceRowId(root), evidenceRowId({ ...root, property: 'https://example.com/' }));
  assert.equal(evidenceRowId(root), evidenceRowId({ ...root, observedAt: '2026-10-02', status: 'fresh' }));
});
