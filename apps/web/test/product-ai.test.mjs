import { test } from 'node:test';
import assert from 'node:assert/strict';
import { productAiLabel, productAiEvidenceLabel } from '../src/lib/product-ai.mjs';
import { matchesProjectFilters } from '../src/lib/project-directory.mjs';

test('multiple roles remain independent from qualification', () => {
  const profile = { roles: ['agent-operable', 'ai-enabling'], evidence: [{ path: 'README.md' }] };
  assert.equal(productAiLabel(profile), 'Agent-operable · AI-enabling');
  assert.equal(productAiEvidenceLabel(profile), 'Source reviewed · runtime unverified');
  assert.equal(productAiEvidenceLabel({ ...profile, runtimeQualification: 'verified' }), 'Source reviewed · runtime unverified');
  assert.equal(productAiEvidenceLabel({ ...profile, runtimeQualification: 'verified', runtimeEvidence: ['dated proof'] }), 'Runtime verified');
});

test('AI filters include overlapping roles and distinguish reviewed absence from missing data', () => {
  const connected = { name: 'Reader', aiProduct: { roles: ['agent-operable', 'ai-enabling'], workflow: 'Retrieve saved links via MCP' } };
  assert.equal(matchesProjectFilters(connected, { aiRole: 'agent-operable' }), true);
  assert.equal(matchesProjectFilters(connected, { aiRole: 'ai-enabling' }), true);
  assert.equal(matchesProjectFilters(connected, { aiRole: 'ai-powered' }), false);
  assert.equal(matchesProjectFilters(connected, { query: 'MCP' }), true);
  assert.equal(matchesProjectFilters({ aiProduct: { roles: [] } }, { aiRole: 'none' }), true);
  assert.equal(matchesProjectFilters({}, { aiRole: 'none' }), false);
});

test('an intentional absence of AI differs from a missing review', () => {
  assert.equal(productAiLabel({ roles: [], evidence: [{ path: 'PRODUCT.md' }] }), 'No active AI workflow');
  assert.equal(productAiLabel(null), 'AI role not reviewed');
  assert.equal(productAiLabel({ roles: ['agent-operable', 'unknown', 'agent-operable'] }), 'Agent-operable');
});
