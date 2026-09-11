import assert from 'node:assert/strict';
import test from 'node:test';

import { parseOwnerNarratives } from '../lib/project-dossier-yaml.mjs';

test('new owner messages retain provenance without replacing historical reviews', () => {
  const archive = '## Historical\n\n```text\nKeep my original words.\n```';
  const original = { id: 'historical', name: 'Historical' };
  const addition = {
    id: 'new-tool',
    name: 'New Tool',
    ownerNarrative: { text: '  My exact new message.\nSecond line.', capturedAt: '2026-09-12' },
  };
  const parsed = parseOwnerNarratives(archive, [original, addition]);
  assert.equal(parsed.narratives.historical.reviewVerbatim, 'Keep my original words.');
  assert.equal(parsed.narratives['new-tool'].reviewVerbatim, addition.ownerNarrative.text);
  assert.equal(parsed.narratives['new-tool'].sourcePath, 'apps/backend/config/projects.json');
  assert.equal(parsed.narratives['new-tool'].restoredFromCommit, null);
  assert.throws(
    () => parseOwnerNarratives(archive, [{ ...original, ownerNarrative: addition.ownerNarrative }]),
    /duplicate owner narrative/,
  );
  assert.throws(
    () => parseOwnerNarratives('', [{ ...addition, ownerNarrative: { text: 'Undated' } }]),
    /invalid owner narrative/,
  );
});
