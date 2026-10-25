import assert from 'node:assert/strict';
import test from 'node:test';
import { gatewayEnvironment } from '../lib/brand-evidence/gateway-environment.mjs';

test('gateway environment reuses runtime credentials and resolves one named Infisical secret without persistence', () => {
  const existing = { AI_GATEWAY_API_KEY: 'fixture' };
  assert.equal(gatewayEnvironment({ env: existing, readSecret: () => assert.fail('unneeded secret lookup') }), existing);
  let call;
  const resolved = gatewayEnvironment({
    env: {}, ownerRepository: '/workspace/site-health',
    readSecret: (...args) => { call = args; return '  fixture-gateway  \n'; },
  });
  assert.equal(resolved.AI_GATEWAY_API_KEY, 'fixture-gateway');
  assert.deepEqual(call[1], ['secrets', 'get', 'Free_ai', '--plain', '--env', 'dev', '--path', '/', '--silent']);
  assert.equal(call[2].cwd, '/workspace');
  assert.deepEqual(call[2].stdio, ['ignore', 'pipe', 'ignore']);
  assert.equal(call[2].timeout, 15000);
  assert.ok(!call[1].includes('fixture-gateway'));
});

test('a missing Infisical connection leaves unrelated environment untouched', () => {
  const env = { KEEP: 'unchanged' };
  assert.equal(gatewayEnvironment({ env, readSecret: () => { throw new Error('private error'); } }), env);
});
