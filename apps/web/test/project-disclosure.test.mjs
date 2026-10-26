import assert from 'node:assert/strict';
import test from 'node:test';
import { bindProjectDisclosureCount } from '../src/lib/project-disclosure.mjs';

const disclosure = () => Object.assign(new EventTarget(), { open: true, dataset: {} });
test('collapse updates only the count and replacement disclosures receive their own listener', () => {
  let details = disclosure();
  const result = { textContent: '' };
  const rows = [
    { hidden: false, dataset: { projectSection: 'current' } },
    { hidden: false, dataset: { projectSection: 'inactive' } },
    { hidden: true, dataset: { projectSection: 'inactive' } },
  ];
  const document = {
    querySelector: (selector) => selector === '[data-project-result-count]' ? result : details,
    querySelectorAll: () => rows,
  };
  bindProjectDisclosureCount(document);
  details.open = false;
  details.dispatchEvent(new Event('toggle'));
  assert.equal(details.open, false);
  assert.equal(result.textContent, '1 current products');
  details = disclosure(); // Refresh all replaces the directory and details.
  bindProjectDisclosureCount(document);
  details.dispatchEvent(new Event('toggle'));
  assert.equal(result.textContent, '1 current products · 1 inactive identities');
  details.open = false;
  details.dispatchEvent(new Event('toggle'));
  assert.equal(result.textContent, '1 current products');
});
