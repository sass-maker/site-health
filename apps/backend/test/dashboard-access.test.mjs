import assert from 'node:assert/strict';
import test from 'node:test';

import {
  cloudflareAccessAuthorized,
  consoleRequestAuthorized,
} from '../lib/dashboard-backend/access.mjs';

function request(headers = {}) {
  return { headers };
}

test('console access remains local when the Access trust boundary is disabled', () => {
  assert.equal(consoleRequestAuthorized(request()), true);
});

test('console access fails closed without both Cloudflare Access identity headers', () => {
  assert.equal(
    consoleRequestAuthorized(request(), { trustAccessHeaders: true }),
    false,
  );
  assert.equal(
    cloudflareAccessAuthorized(
      request({ 'cf-access-authenticated-user-email': 'owner@example.com' }),
    ),
    false,
  );
});

test('console access accepts an authenticated owner and rejects another identity', () => {
  const authenticated = request({
    'cf-access-authenticated-user-email': 'owner@example.com',
    'cf-access-jwt-assertion': 'signed-access-assertion-placeholder',
  });
  assert.equal(
    consoleRequestAuthorized(authenticated, {
      trustAccessHeaders: true,
      ownerEmail: 'OWNER@example.com',
    }),
    true,
  );
  assert.equal(
    consoleRequestAuthorized(authenticated, {
      trustAccessHeaders: true,
      ownerEmail: 'someone-else@example.com',
    }),
    false,
  );
});
