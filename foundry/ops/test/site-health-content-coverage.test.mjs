import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

test('site-health routes content sufficiency and renders latest coverage artifacts', () => {
  const skill = readFileSync(
    resolve(import.meta.dirname, '../skills/site-health/SKILL.md'),
    'utf8',
  );
  const scorecard = readFileSync(
    resolve(import.meta.dirname, '../scripts/site-health-scorecard.mjs'),
    'utf8',
  );
  assert.match(skill, /SEO content sufficiency:[\s\S]*content-coverage\/SKILL\.md/u);
  assert.match(scorecard, /data\/seo-audit\/latest\.json/u);
  assert.match(scorecard, /data\/content-coverage\/latest\.json/u);
  assert.match(scorecard, /\| product \| GEO \| seo \| content \| perf p75 \| trend \|/u);
  assert.match(scorecard, /blocked coverage action/u);
});
