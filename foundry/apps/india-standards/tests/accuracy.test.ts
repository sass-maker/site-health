import assert from "node:assert/strict";
import test from "node:test";
import { assertSourceManifestCanServe } from "../lib/accuracy.ts";

test("allows a synthetic fixture only as demo mode", () => {
  assert.doesNotThrow(() =>
    assertSourceManifestCanServe({
      dataMode: "demo",
      validationStatus: "synthetic_fixture",
      authoritative: false,
    }),
  );
});

test("fails closed when official mode is not authoritative and passed", () => {
  assert.throws(
    () =>
      assertSourceManifestCanServe({
        dataMode: "official",
        validationStatus: "pending",
        authoritative: false,
      }),
    /Official-data mode is blocked/,
  );
});

test("allows official mode only after validation passes", () => {
  assert.doesNotThrow(() =>
    assertSourceManifestCanServe({
      dataMode: "official",
      validationStatus: "passed",
      authoritative: true,
    }),
  );
});
