import assert from 'node:assert/strict';
import test from 'node:test';

import { parseSeoAuditOutput } from '../skills/seo-audit/scripts/seo-audit-fleet.mjs';

test('SEO artifact parser retains bounded pass, warning, and failure evidence', () => {
  const result = parseSeoAuditOutput(`
===== https://example.test/ =====
  title              PASS   "Example"
  og:image           FAIL   missing
  word-count         WARN   ~20 words (thin content)

===== SUMMARY =====
  1 pages audited
  11 checks passed, 1 failed, 1 warnings
  Pages with failures:
    https://example.test/
`, {
    projectId: 'example',
    url: 'https://example.test/',
    auditedAt: '2026-07-31T08:00:00.000Z',
  });

  assert.deepEqual(result, {
    url: 'https://example.test/',
    pass: 11,
    fail: 1,
    warn: 1,
    reachable: true,
    failedChecks: ['og:image'],
    warningChecks: ['word-count'],
    date: '2026-07-31',
    auditedAt: '2026-07-31T08:00:00.000Z',
  });
});

test('SEO artifact parser records an unreachable homepage as a real failure', () => {
  const result = parseSeoAuditOutput(`
===== https://offline.test/ =====
  fetch              FAIL   could not retrieve https://offline.test/

===== SUMMARY =====
  1 pages audited
  0 checks passed, 1 failed, 0 warnings
  Pages with failures:
    https://offline.test/
`, {
    projectId: 'offline',
    url: 'https://offline.test/',
    auditedAt: '2026-07-31T08:00:00.000Z',
  });

  assert.equal(result.fail, 1);
  assert.equal(result.reachable, false);
  assert.deepEqual(result.failedChecks, ['fetch']);
  assert.deepEqual(result.warningChecks, []);
});
