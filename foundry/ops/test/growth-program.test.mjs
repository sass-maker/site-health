import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  directoryAttemptEvidence,
  validateGrowthProgram,
} from '../lib/growth-program.mjs';
import { visibilityProjects } from '../lib/visibility-projects.mjs';

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const projectCatalog = readJson('../config/projects.json');
const marketingProgram = readJson('../config/marketing-program.json');
const rootSearchQueries = readJson('../config/root-search-queries.json');
const program = readJson('../config/growth-program.json');
const directoryStatus = readJson('../config/directory-submissions/status.json');

test('real growth program allocates every maintained project with four explicit focus targets', () => {
  const result = validateGrowthProgram({
    program,
    projectCatalog,
    marketingProgram,
    rootSearchQueries,
    directoryStatus,
  });
  assert.equal(result.allocations.length, visibilityProjects(projectCatalog).length);
  assert.equal(result.allocations.filter((row) => row.mode === 'focus').length, 4);
  assert.deepEqual(
    result.allocations.filter((row) => row.mode === 'focus').map((row) => row.projectId).sort(),
    [...marketingProgram.focusSet].sort(),
  );
  for (const row of result.allocations.filter((allocation) => allocation.mode === 'focus')) {
    assert.ok(row.target.query);
    assert.ok(row.target.destination.startsWith('https://'));
  }
});

test('focus target fails closed on off-origin and historical query references', () => {
  const offOrigin = structuredClone(program);
  offOrigin.focusProjects[0].destination = 'https://example.com/borrowed';
  assert.throws(() => validateGrowthProgram({
    program: offOrigin,
    projectCatalog,
    marketingProgram,
    rootSearchQueries,
    directoryStatus,
  }), /destination is off-origin/);

  const historical = structuredClone(program);
  historical.focusProjects[0].targetQueryId = 'codevetter-category';
  assert.throws(() => validateGrowthProgram({
    program: historical,
    projectCatalog,
    marketingProgram,
    rootSearchQueries,
    directoryStatus,
  }), /target query codevetter-category is not active/);
});

test('focus allocation must match the existing Marketing focus set exactly', () => {
  const drifted = structuredClone(program);
  drifted.focusProjects.pop();
  assert.throws(() => validateGrowthProgram({
    program: drifted,
    projectCatalog,
    marketingProgram,
    rootSearchQueries,
    directoryStatus,
  }), /must exactly match the Marketing focusSet/);
});

test('directory evidence reports acknowledgements without claiming backlinks', () => {
  const evidence = directoryAttemptEvidence({
    date: '2026-08-01',
    confirmed_full_set: {
      first: ['codevetter', 'retired-project'],
      second: ['codevetter'],
    },
    filled_no_toast_counts: { unknown: 27 },
  }, ['codevetter', 'pace']);
  assert.deepEqual(evidence.get('codevetter'), {
    acknowledgedSubmissions: 2,
    directoryIds: ['first', 'second'],
    observedAt: '2026-08-01T00:00:00.000Z',
    evidenceClass: 'submission-acknowledgement',
  });
  assert.equal(evidence.get('pace').acknowledgedSubmissions, 0);
  assert.equal(evidence.has('retired-project'), false);
});

test('verified links require an exact external source and owned destination', () => {
  const withLink = structuredClone(program);
  withLink.verifiedLinks.push({
    projectId: 'codevetter',
    sourceUrl: 'https://example.org/reviews/codevetter',
    destinationUrl: 'https://codevetter.com/',
    observedAt: '2026-08-01T12:00:00.000Z',
    kind: 'editorial',
  });
  const result = validateGrowthProgram({
    program: withLink,
    projectCatalog,
    marketingProgram,
    rootSearchQueries,
    directoryStatus,
  });
  assert.equal(result.allocations.find((row) => row.projectId === 'codevetter').verifiedLinks.length, 1);

  withLink.verifiedLinks[0].sourceUrl = 'https://codevetter.com/about';
  assert.throws(() => validateGrowthProgram({
    program: withLink,
    projectCatalog,
    marketingProgram,
    rootSearchQueries,
    directoryStatus,
  }), /must be external/);
});
