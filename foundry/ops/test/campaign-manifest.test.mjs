import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';

import {
  campaignManifestHash,
  campaignStatePaths,
  createCampaignApproval,
  createCampaignReceipt,
  evaluateCampaignItem,
  materialChange,
  persistCampaignApproval,
  persistCampaignReceipt,
  publicCampaignSummary,
  validateCampaignManifest,
} from '../lib/campaign-manifest.mjs';

const fixture = JSON.parse(
  readFileSync(
    new URL('./fixtures/campaigns/launch-campaign-v1.json', import.meta.url),
    'utf8',
  ),
);

test('validates and hashes a complete campaign deterministically', () => {
  const validation = validateCampaignManifest(fixture);
  assert.equal(validation.ok, true);
  assert.match(campaignManifestHash(fixture), /^[a-f0-9]{64}$/u);
  assert.equal(campaignManifestHash(fixture), campaignManifestHash(structuredClone(fixture)));
});

test('rejects incomplete previews and detects material changes', () => {
  const incomplete = structuredClone(fixture);
  incomplete.items[0].content.body = '';
  assert.equal(validateCampaignManifest(incomplete).ok, false);

  const changed = structuredClone(fixture);
  changed.items[0].content.body += '\nChanged after approval.';
  assert.equal(materialChange(fixture, changed).changed, true);
});

test('authorizes only the unchanged approved manifest', () => {
  const approval = createCampaignApproval(fixture, {
    decidedBy: 'fixture-owner',
    decisionReference: 'fixture-decision-1',
    decidedAt: '2026-07-28T11:00:00.000Z',
  });
  assert.equal(
    evaluateCampaignItem(fixture, approval, 'linkedin-post', []).authorized,
    true,
  );

  const changed = structuredClone(fixture);
  changed.items[1].timing.publishAt = '2026-08-02T09:00:00.000Z';
  const decision = evaluateCampaignItem(changed, approval, 'linkedin-post', []);
  assert.equal(decision.authorized, false);
  assert.equal(decision.status, 'blocked');
});

test('blocks configured destinations and suppresses confirmed duplicates', () => {
  const approval = createCampaignApproval(fixture, {
    decidedBy: 'fixture-owner',
    decisionReference: 'fixture-decision-2',
  });
  assert.equal(
    evaluateCampaignItem(fixture, approval, 'captcha-directory', []).status,
    'blocked',
  );
  const receipt = createCampaignReceipt(
    fixture,
    'linkedin-post',
    {
      outcome: 'queued',
      provider: 'postiz-fixture',
      externalId: 'fixture-post-1',
    },
    { recordedAt: '2026-07-28T12:00:00.000Z' },
  );
  const repeat = evaluateCampaignItem(fixture, approval, 'linkedin-post', [receipt]);
  assert.equal(repeat.authorized, false);
  assert.equal(repeat.status, 'already_completed');
});

test('requires reconciliation after an indeterminate create', () => {
  const approval = createCampaignApproval(fixture, {
    decidedBy: 'fixture-owner',
    decisionReference: 'fixture-decision-3',
  });
  const receipt = createCampaignReceipt(fixture, 'fixture-directory', {
    outcome: 'indeterminate',
    provider: 'browser-fixture',
    message: 'Navigation changed without a reliable confirmation.',
  });
  const decision = evaluateCampaignItem(
    fixture,
    approval,
    'fixture-directory',
    [receipt],
  );
  assert.equal(decision.authorized, false);
  assert.equal(decision.status, 'reconcile_required');
});

test('reconciliation can append a confirmed receipt without overwriting evidence', () => {
  const runtimeRoot = mkdtempSync(resolve(tmpdir(), 'fleet-campaign-reconcile-'));
  const first = createCampaignReceipt(
    fixture,
    'fixture-directory',
    {
      outcome: 'indeterminate',
      provider: 'browser-fixture',
      message: 'No reliable success confirmation.',
    },
    { recordedAt: '2026-07-28T12:30:00.000Z' },
  );
  const reconciled = createCampaignReceipt(
    fixture,
    'fixture-directory',
    {
      outcome: 'confirmed',
      provider: 'browser-fixture',
      externalId: 'fixture-listing-1',
      resultUrl: 'https://directory.example.invalid/listings/fixture-product',
    },
    { recordedAt: '2026-07-28T12:45:00.000Z' },
  );
  const firstPath = persistCampaignReceipt(fixture, first, { runtimeRoot });
  const reconciledPath = persistCampaignReceipt(fixture, reconciled, { runtimeRoot });
  assert.notEqual(firstPath, reconciledPath);
  const approval = createCampaignApproval(fixture, {
    decidedBy: 'fixture-owner',
    decisionReference: 'fixture-decision-reconcile',
  });
  assert.equal(
    evaluateCampaignItem(fixture, approval, 'fixture-directory', [first, reconciled]).status,
    'already_completed',
  );
});

test('persists private state and sanitizes public summaries', () => {
  const runtimeRoot = mkdtempSync(resolve(tmpdir(), 'fleet-campaign-test-'));
  const approval = createCampaignApproval(fixture, {
    decidedBy: 'fixture-owner',
    decisionReference: 'fixture-decision-4',
  });
  persistCampaignApproval(fixture, approval, { runtimeRoot });
  const receipt = createCampaignReceipt(fixture, 'canonical-article', {
    outcome: 'published',
    provider: 'fixture-repository',
    externalId: 'fixture-revision-2',
    resultUrl: 'https://example.invalid/blog/fixture-product-launch',
    message: 'Private unpublished details must not reach the summary.',
  });
  persistCampaignReceipt(fixture, receipt, { runtimeRoot });
  const paths = campaignStatePaths(fixture, { runtimeRoot });
  assert.ok(paths.campaignDir.startsWith(runtimeRoot));

  const summary = publicCampaignSummary(fixture, [receipt]);
  assert.equal(summary.counts.published, 1);
  assert.equal(summary.publicResults.length, 1);
  assert.equal(JSON.stringify(summary).includes('Private unpublished details'), false);
  assert.equal(JSON.stringify(summary).includes(fixture.items[0].content.body), false);
});
