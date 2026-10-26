import test from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { themeBootstrap } from '../src/scripts/theme.mjs';

function browser({ saved = null, dark = false, blocked = false } = {}) {
  const listeners = new Map();
  const media = { matches: dark, addEventListener: (_, fn) => { media.change = fn; } };
  const stored = new Map(saved === null ? [] : [['site-health-appearance', saved]]);
  const root = { dataset: {}, style: {} };
  const select = { value: '' };
  const window = {
    matchMedia: () => media,
    localStorage: {
      getItem: (key) => { if (blocked) throw Error('Denied'); return stored.get(key) ?? null; },
      setItem: (key, value) => { if (blocked) throw Error('Denied'); stored.set(key, value); },
    },
    addEventListener: (name, fn) => listeners.set(name, fn),
  };
  const document = { documentElement: root, querySelectorAll: () => [select] };
  runInNewContext(themeBootstrap, { window, document });
  return { root, media, stored, select, send: (name, event) => listeners.get(name)(event) };
}

test('prepaint bootstrap restores an explicit theme across a new page, independently of OS', () => {
  const first = browser({ dark: false });
  first.send('site-health:appearance', { detail: 'dark' });
  assert.equal(first.root.dataset.mode, 'dark');
  assert.equal(first.root.style.colorScheme, 'dark');
  const next = browser({ saved: first.stored.get('site-health-appearance'), dark: false });
  assert.equal(next.root.dataset.mode, 'dark');
  assert.equal(next.select.value, 'dark');
  next.media.change();
  assert.equal(next.root.dataset.mode, 'dark');
});

test('System follows OS changes and synchronizes its visible selector', () => {
  const page = browser({ saved: 'system', dark: false });
  assert.equal(page.root.dataset.mode, 'light');
  page.media.matches = true;
  page.media.change();
  assert.equal(page.root.dataset.mode, 'dark');
  assert.equal(page.select.value, 'system');
});

test('another tab changing or clearing preference updates the current page', () => {
  const page = browser({ saved: 'dark' });
  page.send('storage', { key: 'site-health-appearance', newValue: 'light' });
  assert.equal(page.root.dataset.mode, 'light');
  page.media.matches = true;
  page.send('storage', { key: null, newValue: null });
  assert.equal(page.root.dataset.appearance, 'system');
  assert.equal(page.root.dataset.mode, 'dark');
});

test('blocked storage still permits an in-page selection and invalid values fall back to System', () => {
  const page = browser({ blocked: true, dark: true });
  assert.equal(page.root.dataset.mode, 'dark');
  page.send('site-health:appearance', { detail: 'light' });
  assert.equal(page.root.dataset.mode, 'light');
  const invalid = browser({ saved: 'unexpected', dark: false });
  assert.equal(invalid.root.dataset.appearance, 'system');
  assert.equal(invalid.root.dataset.mode, 'light');
});
