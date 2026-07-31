import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  buildStudioDistributionBundle,
  createStudioPostizDraft,
  studioPostizReadiness,
} from '../src/studio/distribution.js';

function approvedBrief(overrides = {}) {
  return {
    schema: 'fleet.marketing-studio-brief.v1',
    id: 'brief-proof',
    revision: 3,
    projectSlug: 'high-signal',
    channel: 'youtube_shorts',
    kind: 'faceless',
    engine: 'mock',
    durationSeconds: 45,
    title: 'Proof before automation',
    hook: 'Proof first. Automation second.',
    summary: 'Show why a verified receipt should precede an automated recommendation.',
    cta: 'Read the evidence',
    creativeDirection: 'Use one real product receipt as the dominant visual.',
    sourceEvidence: {
      canonicalUrl: 'https://highsignal.app/evidence',
      destinationUrl: 'https://highsignal.app',
      claim: 'High Signal keeps product evidence attached to recommendations.',
      rightsStatus: 'approved',
    },
    approval: { creativeStatus: 'approved', qualityAccepted: false },
    media: {
      videoPath: '/tmp/proof.mp4',
      publicUrl: 'https://assets.example.test/proof.mp4',
      provider: 'mock',
      quality: { verdict: 'pass', overall: 93 },
      reviewedAt: '2026-07-31T12:00:00Z',
    },
    ...overrides,
  };
}

test('prepare builds approved package evidence and a proposed unscheduled Postiz request', () => {
  const bundle = buildStudioDistributionBundle(approvedBrief(), {
    now: () => new Date('2026-07-31T12:00:00Z'),
  });
  assert.equal(bundle.contentPackage.approval.status, 'approved');
  assert.equal(bundle.mediaReceipt.publicUrl, 'https://assets.example.test/proof.mp4');
  assert.equal(bundle.request.provider, 'postiz');
  assert.equal(bundle.request.approval.status, 'proposed');
  assert.equal(bundle.request.scheduledFor, null);
});

test('prepare fails closed when public media or approval evidence is incomplete', () => {
  assert.throws(
    () => buildStudioDistributionBundle(approvedBrief({ media: { videoPath: '/tmp/proof.mp4', quality: { verdict: 'pass' } } })),
    /stable public HTTPS media URL/,
  );
  assert.throws(
    () => buildStudioDistributionBundle(approvedBrief({ approval: { creativeStatus: 'proposed', qualityAccepted: false } })),
    /creative approval/,
  );
});

test('draft submission requires explicit approval and never supplies a schedule', async () => {
  const calls = [];
  const postizClient = {
    post: async (post) => {
      calls.push(post);
      return { provider: 'postiz', status: 'draft', externalId: 'post-1', externalUrl: null };
    },
  };
  const result = await createStudioPostizDraft(approvedBrief(), {
    approvedBy: 'owner',
    postizClient,
    now: () => new Date('2026-07-31T12:05:00Z'),
  });
  assert.equal(result.receipt.status, 'draft');
  assert.equal(result.request.scheduledFor, null);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].scheduled_for, null);
  assert.equal('body' in result.receipt, false);
  assert.equal('accountSlug' in result.receipt, false);
});

test('Marketing Studio rejects schedule and publish inputs', async () => {
  await assert.rejects(
    () => createStudioPostizDraft(approvedBrief(), {
      approvedBy: 'owner',
      scheduledFor: '2026-08-01T12:00:00Z',
      postizClient: { post: async () => ({}) },
    }),
    /does not accept schedules/,
  );
});

test('readiness exposes only safe configuration booleans and the Postiz boundary', () => {
  const readiness = studioPostizReadiness({
    postizClient: {},
    postizAppUrl: 'https://postiz.example.test/public/v1',
  });
  assert.equal(readiness.state, 'ready-for-draft');
  assert.equal(readiness.appUrl, 'https://postiz.example.test/');
  assert.match(readiness.boundary, /unscheduled drafts only/);
  assert.equal(JSON.stringify(readiness).includes('integrationId'), false);
});

test('readiness recognizes the default-style machine-local mapping file', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'marketing-studio-postiz-'));
  const integrationsPath = path.join(dir, 'postiz-integrations.json');
  await writeFile(integrationsPath, '{"schema":"fleet.postiz-integrations.v1","integrations":{}}\n');
  const readiness = studioPostizReadiness({
    postizApiKey: 'present-but-never-returned',
    integrationsPath,
    postizAppUrl: 'https://postiz.example.test',
  });
  assert.equal(readiness.state, 'ready-for-draft');
  assert.equal(readiness.apiConfigured, true);
  assert.equal(readiness.mappingConfigured, true);
  assert.equal(JSON.stringify(readiness).includes('present-but-never-returned'), false);
});
