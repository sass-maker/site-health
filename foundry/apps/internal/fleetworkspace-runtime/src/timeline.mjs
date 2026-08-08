function timeOf(timestamp) {
  return timestamp.slice(11, 19);
}

function describe(event) {
  const { payload } = event;
  switch (event.eventType) {
    case "WorkspaceCreated":
      return `workspace created: ${payload.objective.description ?? payload.objective}`;
    case "ActorJoined":
      return `joined with ${payload.capabilities.join(", ")}`;
    case "ObservationRecorded":
      return `${payload.phase}: observed ${payload.observation.matchingCount} matching issue(s)`;
    case "ActionProposed":
      return `proposed ${payload.action.type}; predicted ${payload.prediction.expectedState.matchingIssueCount} matching issue(s)`;
    case "ActionStarted":
      return `started ${payload.actionType}`;
    case "ActionCompleted":
      return payload.success
        ? `action returned success${payload.issue ? `: issue #${payload.issue.number}` : ""}`
        : `action failed: ${payload.error}`;
    case "TransitionVerified":
      return `verified transition: expected ${payload.expectedState.matchingIssueCount}, observed ${payload.observedState.matchingIssueCount}`;
    case "MismatchDetected":
      return `mismatch ${payload.category}: expected ${payload.expectedState?.matchingIssueCount ?? "n/a"}, observed ${payload.observedState?.matchingIssueCount ?? "n/a"}; failed assumption ${payload.failedAssumption}`;
    case "InterventionApplied":
      return `intervention applied: ${payload.summary ?? "unspecified"}`;
    default:
      return event.eventType;
  }
}

export function formatTimeline(events) {
  return events
    .map((event) => `${timeOf(event.timestamp)} ${event.actorId} ${describe(event)}`)
    .join("\n");
}
