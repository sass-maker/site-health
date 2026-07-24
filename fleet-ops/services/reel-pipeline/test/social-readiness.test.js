import assert from 'node:assert/strict';
import test from 'node:test';

import postizFixture from './fixtures/postiz-integrations.json' with { type: 'json' };
import { checkSocialReadiness } from '../src/social-readiness.js';

const EXPECTED_ACCOUNTS = 12;

test('missing Postiz integration map fails closed for every pre-routed account', () => {
  const report = checkSocialReadiness({ configPath: '/definitely/missing.json', templatePath: 'config/postiz-integrations.example.json', env: {}, ffmpegReady: true });
  assert.equal(report.summary.totalAccounts, EXPECTED_ACCOUNTS);
  assert.equal(report.summary.routedAccounts, 0);
  assert.equal(report.summary.connectedAccounts, 0);
  assert.equal(report.summary.readyForLivePosting, false);
  assert.equal(report.accounts.every((entry) => !entry.accountDeclared && entry.routeConfigured), true);
});

test('readiness becomes true when all declared env and infrastructure inputs exist', () => {
  const env = {
    POSTIZ_API_KEY: 'present', REEL_ARTIFACT_R2_BUCKET: 'bucket', REEL_ARTIFACT_BASE_URL: 'https://assets.example.test', PATH: '',
  };
  assert.equal(Object.keys(postizFixture.integrations).length, EXPECTED_ACCOUNTS);
  const report = checkSocialReadiness({ configPath: '/definitely/missing.json', templatePath: 'test/fixtures/postiz-integrations.json', env, ffmpegReady: true, kokoroReady: true });
  assert.equal(report.summary.connectedAccounts, EXPECTED_ACCOUNTS);
  assert.equal(report.summary.readyForLivePosting, true);
});
