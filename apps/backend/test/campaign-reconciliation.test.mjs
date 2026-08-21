import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  campaignCandidates,
  reconcileCampaignEvidence,
} from '../lib/dashboard-backend/campaign-reconciliation.mjs';
import { DashboardStore } from '../lib/dashboard-backend/store.mjs';

function fixture(context) {
  const root = mkdtempSync(join(tmpdir(), 'campaign-reconciliation-'));
  context.after(() => rmSync(root, { recursive: true, force: true }));
  const campaign = join(root, 'already-authorized');
  const receipts = join(campaign, 'receipts');
  mkdirSync(receipts, { recursive: true });
  writeFileSync(join(campaign, 'manifest.json'), JSON.stringify({ campaign: { projectId: 'pace' } }));
  const receipt = {
    $schema: 'fleet.campaign-item-receipt.v1',
    campaignId: 'already-authorized',
    itemKey: 'public-post',
    outcome: 'queued',
    provider: 'dev.to',
    resultUrl: 'https://dev.to/owner/already-public',
    message: 'Scheduled for 2026-08-20T04:30:00.000Z',
    recordedAt: '2026-08-19T00:00:00.000Z',
  };
  const receiptPath = join(receipts, 'receipt.json');
  writeFileSync(receiptPath, JSON.stringify(receipt));
  writeFileSync(join(receipts, 'future.json'), JSON.stringify({
    ...receipt, itemKey: 'future', resultUrl: 'https://dev.to/owner/future',
    message: 'Scheduled for 2026-09-20T04:30:00.000Z',
  }));
  writeFileSync(join(receipts, 'editor.json'), JSON.stringify({
    ...receipt, itemKey: 'editor', resultUrl: 'https://medium.com/p/abc/edit', message: '',
  }));
  writeFileSync(join(receipts, 'submission-page.json'), JSON.stringify({
    ...receipt, itemKey: 'submission-page', resultUrl: 'https://vibeindex.dev/submit/', message: '',
  }));
  writeFileSync(join(receipts, 'tracker.json'), JSON.stringify({
    ...receipt, itemKey: 'tracker', resultUrl: 'https://github.com/HeyPace/pace/issues/156', message: '',
  }));
  writeFileSync(join(receipts, 'profile.json'), JSON.stringify({
    ...receipt, itemKey: 'profile', resultUrl: 'https://substack.com/@owner', message: '',
  }));
  writeFileSync(join(receipts, 'probe-only.json'), JSON.stringify({
    ...receipt, itemKey: 'probe-only', provider: 'live-http', resultUrl: 'https://heypace.app/compared', message: '',
  }));
  writeFileSync(join(receipts, 'duplicate.json'), JSON.stringify({
    ...receipt, recordedAt: '2026-08-18T00:00:00.000Z', message: '',
  }));
  return { root, receiptPath };
}

test('selects only due public-looking receipts without changing the source', async (context) => {
  const { root, receiptPath } = fixture(context);
  const original = readFileSync(receiptPath, 'utf8');
  const projects = [{ id: 'pace', domains: ['heypace.app'] }];
  assert.deepEqual(campaignCandidates({ root, projects: [], now: '2026-08-21T00:00:00.000Z' }), []);
  assert.deepEqual(
    campaignCandidates({ root, projects, now: '2026-08-21T00:00:00.000Z' }).map((item) => item.itemKey),
    ['public-post'],
  );
  const store = new DashboardStore({ databasePath: join(root, 'dashboard.sqlite'), projects });
  try {
    const result = await reconcileCampaignEvidence({
      store,
      root,
      projects,
      now: '2026-08-21T00:00:00.000Z',
      fetchImpl: async () => new Response(`<!doctype html><html><head>
        <link rel="canonical" href="https://dev.to/owner/already-public">
        <meta name="robots" content="index,follow"></head>
        <body><a href="https://heypace.app" rel="nofollow">Pace</a></body></html>`, {
        status: 200,
        headers: { 'content-type': 'text/html' },
      }),
    });
    assert.equal(result.counts.verified, 1);
    assert.equal(result.items[0].indexable, true);
    assert.equal(result.items[0].followState, 'nofollow');
    assert.equal(result.items[0].canonical, 'https://dev.to/owner/already-public');
    assert.equal(readFileSync(receiptPath, 'utf8'), original);
  } finally {
    store.close();
  }
});
