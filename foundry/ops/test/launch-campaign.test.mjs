import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';

import {
  createCampaignApproval,
  createCampaignReceipt,
  evaluateCampaignItem,
  persistCampaignApproval,
  persistCampaignReceipt,
} from '../lib/campaign-manifest.mjs';

const manifest = JSON.parse(readFileSync(
  new URL('./fixtures/campaigns/launch-campaign-v1.json', import.meta.url),
  'utf8',
));

test('fixture launch approves one hash, executes eligible adapters, and resumes safely', () => {
  const runtimeRoot = mkdtempSync(resolve(tmpdir(), 'fleet-launch-fixture-'));
  const approval = createCampaignApproval(manifest, {
    decidedBy: 'fixture-owner',
    decisionReference: 'fixture-launch-approval',
    decidedAt: '2026-07-28T11:00:00.000Z',
  });
  persistCampaignApproval(manifest, approval, { runtimeRoot });

  const receipts = [];
  for (const [itemKey, result] of [
    ['canonical-article', {
      outcome: 'published',
      provider: 'fixture-repository',
      externalId: 'fixture-revision-2',
      resultUrl: 'https://example.invalid/blog/fixture-product-launch',
    }],
    ['linkedin-post', {
      outcome: 'queued',
      provider: 'postiz-fixture',
      externalId: 'fixture-post-1',
    }],
    ['fixture-directory', {
      outcome: 'confirmed',
      provider: 'browser-fixture',
      externalId: 'fixture-listing-1',
      resultUrl: 'https://directory.example.invalid/fixture-product',
    }],
  ]) {
    assert.equal(evaluateCampaignItem(manifest, approval, itemKey, receipts).authorized, true);
    const receipt = createCampaignReceipt(manifest, itemKey, result, {
      recordedAt: '2026-07-28T12:00:00.000Z',
    });
    persistCampaignReceipt(manifest, receipt, { runtimeRoot });
    receipts.push(receipt);
  }

  assert.equal(evaluateCampaignItem(manifest, approval, 'captcha-directory', receipts).status, 'blocked');
  assert.equal(evaluateCampaignItem(manifest, approval, 'linkedin-post', receipts).status, 'already_completed');
  assert.equal(readdirSync(resolve(runtimeRoot, manifest.campaign.id, 'receipts')).length, 3);
});

test('unexpected cost or timing change invalidates fixture approval', () => {
  const approval = createCampaignApproval(manifest, {
    decidedBy: 'fixture-owner',
    decisionReference: 'fixture-launch-approval-2',
  });
  const changed = structuredClone(manifest);
  changed.items[2].destination.cost = 'unexpected paid placement';
  assert.equal(evaluateCampaignItem(changed, approval, 'fixture-directory', []).status, 'blocked');
});

test('campaign CLI previews, approves, executes fixture adapters, and suppresses retry', () => {
  const runtimeRoot = mkdtempSync(resolve(tmpdir(), 'fleet-launch-cli-'));
  const cli = resolve(import.meta.dirname, '../scripts/campaign-manifest.mjs');
  const manifestPath = resolve(
    import.meta.dirname,
    'fixtures/campaigns/launch-campaign-v1.json',
  );
  const run = (...args) => spawnSync(process.execPath, [
    cli,
    ...args,
    '--manifest',
    manifestPath,
    '--runtime-root',
    runtimeRoot,
  ], { encoding: 'utf8' });

  const preview = run('preview');
  assert.equal(preview.status, 0, preview.stderr);
  assert.match(preview.stdout, /## Execution steps/u);
  assert.match(preview.stdout, /Fixture Product now demonstrates/u);

  const approve = run(
    'approve',
    '--decided-by',
    'fixture-owner',
    '--decision-reference',
    'fixture-cli-approval',
  );
  assert.equal(approve.status, 0, approve.stderr);

  const gate = run('gate', '--item', 'linkedin-post');
  assert.equal(gate.status, 0, gate.stderr);
  assert.equal(JSON.parse(gate.stdout).status, 'authorized');

  const record = run(
    'record',
    '--item',
    'linkedin-post',
    '--outcome',
    'queued',
    '--provider',
    'postiz-fixture',
    '--external-id',
    'fixture-cli-post-1',
  );
  assert.equal(record.status, 0, record.stderr);

  const repeat = run('gate', '--item', 'linkedin-post');
  assert.equal(repeat.status, 3);
  assert.equal(JSON.parse(repeat.stdout).status, 'already_completed');

  const blocked = run('gate', '--item', 'captcha-directory');
  assert.equal(blocked.status, 3);
  assert.equal(JSON.parse(blocked.stdout).status, 'blocked');
});
