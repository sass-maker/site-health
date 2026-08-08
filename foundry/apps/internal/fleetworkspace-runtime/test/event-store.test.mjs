import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { EventStore } from "../src/event-store.mjs";
import { createEventFactory } from "../src/events.mjs";
import { formatTimeline } from "../src/timeline.mjs";

function deterministicFactory() {
  let id = 0;
  let second = 0;
  return createEventFactory({
    idFactory: () => `event-${++id}`,
    clock: () => `2026-08-08T10:42:${String(second++).padStart(2, "0")}.000Z`,
  });
}

test("EventStore preserves immutable attributed events in append order", async () => {
  const directory = await mkdtemp(join(tmpdir(), "fleetworkspace-events-"));
  const store = new EventStore(join(directory, "timeline.jsonl"));
  const createEvent = deterministicFactory();
  const sourcePayload = { objective: "one issue", nested: { count: 0 } };
  const workspace = createEvent({
    workspaceId: "workspace-1",
    runId: "run-1",
    actorId: "human:sarthak",
    eventType: "WorkspaceCreated",
    payload: sourcePayload,
  });
  sourcePayload.nested.count = 99;
  const actor = createEvent({
    workspaceId: "workspace-1",
    runId: "run-1",
    actorId: "agent:github-runner",
    eventType: "ActorJoined",
    causationId: workspace.eventId,
    payload: { capabilities: ["observe"] },
  });

  await Promise.all([store.append(workspace), store.append(actor)]);
  const events = await store.list({ workspaceId: "workspace-1", runId: "run-1" });

  assert.deepEqual(events.map((event) => event.eventId), ["event-1", "event-2"]);
  assert.equal(events[0].payload.nested.count, 0);
  assert.equal(events[1].causationId, "event-1");
  for (const event of events) {
    for (const field of [
      "eventId",
      "workspaceId",
      "runId",
      "actorId",
      "timestamp",
      "causationId",
      "correlationId",
      "eventType",
      "payload",
    ]) {
      assert.ok(Object.hasOwn(event, field));
    }
  }

  const readable = formatTimeline(events);
  assert.match(readable, /human:sarthak workspace created: one issue/);
  assert.match(readable, /agent:github-runner joined with observe/);
});

