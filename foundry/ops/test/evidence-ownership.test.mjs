import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const ownership = JSON.parse(
  readFileSync(new URL('../config/evidence-ownership.json', import.meta.url), 'utf8'),
);

test('every evidence authority has exactly one canonical owner', () => {
  const required = [
    'foundry',
    'github',
    'cloudflare',
    'postiz',
    'codevetter',
    'app-health',
    'drank',
    'psi-swarm',
    'high-signal',
  ];
  const ids = ownership.owners.map((owner) => owner.id);
  for (const id of required) assert.ok(ids.includes(id), `${id} needs an ownership declaration`);

  const authorityOwners = new Map();
  for (const owner of ownership.owners) {
    assert.ok(owner.authority.length > 0, `${owner.id} has no authority`);
    for (const authority of owner.authority) {
      assert.equal(authorityOwners.has(authority), false, `${authority} is duplicated`);
      authorityOwners.set(authority, owner.id);
    }
  }
});
