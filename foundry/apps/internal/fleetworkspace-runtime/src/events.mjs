import { randomUUID } from "node:crypto";

export const EVENT_TYPES = Object.freeze([
  "WorkspaceCreated",
  "ActorJoined",
  "ObservationRecorded",
  "ActionProposed",
  "ActionStarted",
  "ActionCompleted",
  "TransitionVerified",
  "MismatchDetected",
  "InterventionApplied",
]);

function assertNonEmptyString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${field} must be a non-empty string`);
  }
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) {
      deepFreeze(child);
    }
  }
  return value;
}

export function assertEventEnvelope(event) {
  for (const field of [
    "eventId",
    "workspaceId",
    "runId",
    "actorId",
    "timestamp",
    "correlationId",
    "eventType",
  ]) {
    assertNonEmptyString(event[field], field);
  }

  if (event.causationId !== null) {
    assertNonEmptyString(event.causationId, "causationId");
  }
  if (!EVENT_TYPES.includes(event.eventType)) {
    throw new TypeError(`Unsupported eventType: ${event.eventType}`);
  }
  if (!event.payload || typeof event.payload !== "object" || Array.isArray(event.payload)) {
    throw new TypeError("payload must be an object");
  }
}

export function createEventFactory({
  idFactory = randomUUID,
  clock = () => new Date().toISOString(),
} = {}) {
  return function createEvent({
    workspaceId,
    runId,
    actorId,
    eventType,
    payload = {},
    causationId = null,
    correlationId = runId,
  }) {
    const event = {
      eventId: idFactory(),
      workspaceId,
      runId,
      actorId,
      timestamp: clock(),
      causationId,
      correlationId,
      eventType,
      payload: structuredClone(payload),
    };

    assertEventEnvelope(event);
    return deepFreeze(event);
  };
}

