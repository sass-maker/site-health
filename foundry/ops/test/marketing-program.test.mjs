import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { createProjectResolver, validateMarketingProgram } from '../lib/marketing-program.mjs';

const registry = JSON.parse(await readFile(new URL('../config/marketing-program.json', import.meta.url), 'utf8'));

test('registry covers or explicitly excludes every catalog project and has the exact focus set', async () => {
  const catalog = JSON.parse(
    await readFile(new URL('../config/projects.json', import.meta.url), 'utf8'),
  );
  const catalogSlugs = catalog.projects
    .filter((project) => project.attention !== 'ignored' && project.tier !== 'non-product')
    .map((project) => project.id);
  const result = validateMarketingProgram(registry, {
    catalogSlugs: [...catalogSlugs, 'fleet-ops', 'wifi-watch'],
  });
  assert.deepEqual(result.focusSet, ['pace', 'codevetter', 'posttrainllm', 'high-signal']);
  assert.equal(result.projects.length, 27);
  assert.deepEqual(result.projects.filter((project) => project.contentBase).map((project) => project.slug).sort(), ['high-signal', 'karte', 'rolepatch', 'significanthobbies', 'swe-interview-prep']);
  assert.equal(result.aiVisibility.scheduleIntent.enabled, false);
  assert.deepEqual(
    result.aiVisibility.projects.map((project) => project.slug).sort(),
    ['codevetter', 'high-signal', 'pace', 'posttrainllm'],
  );
  for (const project of result.aiVisibility.projects) {
    assert.ok(project.aliases.length > 0);
    assert.ok(project.competitors.length > 0);
    assert.ok(project.promptSets.length > 0);
    assert.ok(project.personas.length > 0);
    assert.ok(project.providerPolicy.allowedProviderIds.length > 0);
    assert.ok(project.cacheWindowHours > 0);
    assert.ok(project.runBudget.maxCalls > 0);
  }
});

test('canonical identities and historical aliases resolve uniquely', () => {
  const resolve = createProjectResolver(validateMarketingProgram(registry));
  assert.equal(resolve('linkchat'), 'karte');
  assert.equal(resolve('interview-coder'), 'swe-interview-prep');
  assert.equal(resolve('resume-tailor'), 'rolepatch');
  assert.equal(resolve('tinygpt'), 'posttrainllm');
  assert.equal(resolve('CodeVetter'), 'codevetter');
});

test('ambiguous aliases and focus drift fail validation', () => {
  const ambiguous = structuredClone(registry);
  ambiguous.projects.find((project) => project.slug === 'pace').aliases.push('linkchat');
  assert.throws(() => validateMarketingProgram(ambiguous), /belongs to both/);
  const focusDrift = structuredClone(registry);
  focusDrift.focusSet = ['pace'];
  assert.throws(() => validateMarketingProgram(focusDrift), /focusSet/);
});

test('channel programs require unique mappings and typed content bases', () => {
  const invalid = structuredClone(registry);
  invalid.projects.find((project) => project.slug === 'pace').channels = [{ channel: 'youtube_shorts', accountSlug: 'pace-youtube' }];
  assert.throws(() => validateMarketingProgram(invalid), /content base/);
});

test('AI visibility budgets and activation gates fail closed', () => {
  const oversized = structuredClone(registry);
  oversized.aiVisibility.projects[0].runBudget.maxCalls = 1;
  assert.throws(() => validateMarketingProgram(oversized), /matrix exceeds/);

  const ungated = structuredClone(registry);
  ungated.aiVisibility.scheduleIntent.activation.requiresHostVerification = false;
  assert.throws(() => validateMarketingProgram(ungated), /activation gates/);
});
