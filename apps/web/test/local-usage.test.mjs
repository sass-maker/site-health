import assert from "node:assert/strict";
import test from "node:test";
import {
  buildLocalUsageBundle,
  recordLocalInteraction,
  startLocalUsageTracking,
} from "../src/lib/local-usage.mjs";

const STORAGE_KEY = "site-health.local-usage.v1";
const now = new Date("2026-10-25T12:00:00.000Z");

function memoryStorage(initial = null) {
  let value = initial;
  return {
    getItem(key) {
      assert.equal(key, STORAGE_KEY);
      return value;
    },
    setItem(key, next) {
      assert.equal(key, STORAGE_KEY);
      value = next;
    },
    raw() {
      return value;
    },
  };
}

function usageRecord(storage) {
  return buildLocalUsageBundle(storage, now).usage.records["site-health"];
}

test("no stored observations export unknown rather than zero", () => {
  const record = usageRecord(memoryStorage());
  assert.equal(record.proxy.count, null);
  assert.equal(record.proxy.precision, "unknown");
  assert.equal(record.tracking, "missing");
  assert.equal(record.core.count, null);
  assert.equal(record.core.qualified, false);
});

test("a local interaction exports a lower-bound device proxy and no content", () => {
  const storage = memoryStorage();
  assert.equal(recordLocalInteraction(storage, new Date("2026-10-25T11:30:00.000Z")), true);
  const record = usageRecord(storage);
  assert.deepEqual(record.proxy, { count: 1, unit: "devices", precision: "lower_bound" });
  assert.equal(record.tracking, "partial");
  assert.equal(record.core.qualified, false);
  assert.match(record.evidence[0].note, /coverage began 2026-10-25/);
  const stored = storage.raw();
  assert.deepEqual(Object.keys(JSON.parse(stored).days), ["2026-10-25"]);
  assert.deepEqual(Object.keys(JSON.parse(stored).days["2026-10-25"]).sort(), ["interactions", "lastAt"]);
  assert.doesNotMatch(stored, /route|query|project|provider|content/i);
});

test("an observation older than the rolling window is unknown, not inactivity proof", () => {
  const storage = memoryStorage();
  assert.equal(recordLocalInteraction(storage, new Date("2026-09-24T11:59:59.999Z")), true);
  const record = usageRecord(storage);
  assert.equal(record.proxy.count, null);
  assert.equal(record.proxy.precision, "unknown");
  assert.equal(record.core.count, null);
  assert.equal(record.core.qualified, false);
});

test("malformed local state is preserved and never replaced by a fabricated count", () => {
  const original = "{bad json";
  const storage = memoryStorage(original);
  assert.equal(recordLocalInteraction(storage, now), false);
  assert.equal(storage.raw(), original);
  const record = usageRecord(storage);
  assert.equal(record.proxy.count, null);
  assert.equal(record.tracking, "partial");
});

test("only trusted explicit controls count, and QA query sessions are excluded", (context) => {
  context.mock.timers.enable({ apis: ["Date"], now: now.getTime() - 1000 });
  const storage = memoryStorage();
  const listeners = new Map();
  class ElementMock {
    closest() {
      return { getAttribute: () => "navigation" };
    }
  }
  const document = {
    body: { dataset: {} },
    addEventListener: (type, listener) => listeners.set(type, listener),
    removeEventListener: (type) => listeners.delete(type),
  };
  const window = {
    Element: ElementMock,
    localStorage: storage,
    location: { href: "https://site-health.test/domains" },
    navigator: { webdriver: false },
  };
  const stop = startLocalUsageTracking({ document, window });
  const click = listeners.get("click");
  const target = new ElementMock();
  click({ isTrusted: false, target, type: "click" });
  assert.equal(storage.raw(), null);
  click({ isTrusted: true, target, type: "click" });
  assert.equal(usageRecord(storage).proxy.count, 1);
  stop();
  assert.equal(listeners.size, 0);

  const qaListeners = new Map();
  startLocalUsageTracking({
    document: { ...document, addEventListener: (type, listener) => qaListeners.set(type, listener) },
    window: { ...window, location: { href: "https://site-health.test/domains?fleet_qa=1" } },
  });
  assert.equal(qaListeners.size, 0);
});
