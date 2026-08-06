import assert from 'node:assert/strict';
import test from 'node:test';

import { buildPromptOwnershipReport } from '../lib/prompt-ownership.mjs';

function fixture(ownedPage) {
  return {
    marketingProgram: {
      aiVisibility: {
        projects: [{
          slug: 'pace',
          competitors: [{ name: 'Raycast', url: 'https://raycast.com' }],
          promptSets: [{
            id: 'buyer-discovery',
            prompts: [{
              id: 'category',
              text: 'Which private Mac voice assistant should I use?',
              ...(ownedPage ? { ownedPage } : {}),
            }],
          }],
        }],
      },
    },
    identities: [{ id: 'pace', name: 'HeyPace', origin: 'https://heypace.app' }],
    agentRegistry: {
      products: [{
        id: 'pace',
        productLinks: [
          { title: 'Home', url: 'https://heypace.app/' },
          { title: 'Guide', url: 'https://heypace.app/private-mac-voice-assistant' },
        ],
      }],
    },
  };
}

test('marks an undeclared prompt owner missing without guessing from page titles', () => {
  const report = buildPromptOwnershipReport(fixture());
  assert.equal(report.promptCount, 1);
  assert.equal(report.counts.missing, 1);
  assert.equal(report.rows[0].url, null);
  assert.equal(report.rows[0].declaredPageCount, 2);
});

test('maps category prompts to the canonical origin only under the explicit portfolio policy', () => {
  const input = fixture();
  input.marketingProgram.aiVisibility.ownershipPolicy = {
    categoryOwner: 'canonical-origin',
  };
  const report = buildPromptOwnershipReport(input);
  assert.equal(report.counts.published, 1);
  assert.equal(report.rows[0].url, 'https://heypace.app/');
  assert.equal(report.rows[0].evidence, 'policy:canonical-category-owner');
});

test('accepts a published owned page only when the exact canonical URL is declared', () => {
  const report = buildPromptOwnershipReport(fixture({
    state: 'published',
    url: 'https://heypace.app/private-mac-voice-assistant',
  }));
  assert.equal(report.counts.published, 1);
  assert.equal(report.rows[0].evidence, 'https://heypace.app/private-mac-voice-assistant');
});

test('rejects inferred, off-origin, and unlisted published ownership', () => {
  assert.throws(
    () => buildPromptOwnershipReport(fixture({
      state: 'published',
      url: 'https://competitor.example/private-mac-voice-assistant',
    })),
    /canonical origin/u,
  );
  assert.throws(
    () => buildPromptOwnershipReport(fixture({
      state: 'published',
      url: 'https://heypace.app/unlisted',
    })),
    /absent from the declared surface inventory/u,
  );
});

test('requires an exact manifest hash for approval-pending ownership', () => {
  assert.throws(
    () => buildPromptOwnershipReport(fixture({ state: 'approval-pending', manifestHash: 'nope' })),
    /requires manifestHash/u,
  );
  const report = buildPromptOwnershipReport(fixture({
    state: 'approval-pending',
    manifestHash: 'a'.repeat(64),
  }));
  assert.equal(report.counts['approval-pending'], 1);
});
