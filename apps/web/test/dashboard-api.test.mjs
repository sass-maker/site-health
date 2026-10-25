import assert from 'node:assert/strict';
import test from 'node:test';
import { dashboardApi } from '../src/lib/dashboard-api.mjs';

test('client displays server validation errors and keeps outages generic', async (t) => {
  const responses = [
    new Response(JSON.stringify({ error: 'Enter a public HTTPS website URL' }), { status: 422 }),
    new Response(JSON.stringify({ error: 'Internal provider details' }), { status: 500 }),
    new Response('Bad gateway', { status: 400 }),
  ];
  t.mock.method(globalThis, 'fetch', async () => responses.shift());
  await assert.rejects(dashboardApi('/api/dashboard', '/brief'), { message: 'Enter a public HTTPS website URL' });
  for (let i = 0; i < 2; i++) await assert.rejects(dashboardApi('/api/dashboard', '/brief'), { message: 'Site Health backend is unavailable.' });
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('socket internals'); });
  await assert.rejects(dashboardApi('/api/dashboard', '/brief'), { message: 'Site Health backend is unavailable.' });
});

test('client sends dashboard JSON mutation and returns successful payload', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    assert.equal(url, '/api/dashboard/v1/profile');
    assert.equal(init.headers['content-type'], 'application/json');
    assert.equal(init.body, '{}');
    return new Response('{"saved":true}');
  });
  assert.deepEqual(await dashboardApi('/api/dashboard', '/v1/profile', { method: 'POST', body: '{}' }), { saved: true });
});
