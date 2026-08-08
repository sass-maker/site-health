import { createEventFactory } from "./events.mjs";

async function record(store, createEvent, fields) {
  const event = createEvent(fields);
  await store.append(event);
  return event;
}

function verificationState(groundedState) {
  return { matchingIssueCount: groundedState.matchingIssueCount };
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function observeCreatedIssue({
  store,
  createEvent,
  environment,
  context,
  action,
  result,
  causationId,
  attempts = 5,
}) {
  let observation;
  let observedEvent;
  let nextCausationId = causationId;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    observation = await environment.observe({ marker: action.marker });
    observedEvent = await record(store, createEvent, {
      ...context,
      eventType: "ObservationRecorded",
      causationId: nextCausationId,
      payload: { phase: "after_action", attempt, observation },
    });

    const createdIssueVisible =
      !result.issue ||
      observation.matchingIssues.some((issue) => issue.number === result.issue.number);
    if (createdIssueVisible || attempt === attempts) break;
    nextCausationId = observedEvent.eventId;
    await wait(attempt * 250);
  }

  return { observation, observedEvent };
}

async function executeTransition({
  store,
  createEvent,
  environment,
  worldProgram,
  verifier,
  context,
  action,
  objective,
  beforeState,
  causationId,
}) {
  const prediction = worldProgram.predict(beforeState, action);
  const proposed = await record(store, createEvent, {
    ...context,
    eventType: "ActionProposed",
    causationId,
    payload: { action, prediction },
  });
  const started = await record(store, createEvent, {
    ...context,
    eventType: "ActionStarted",
    causationId: proposed.eventId,
    payload: { actionType: action.type },
  });

  let result;
  try {
    result = await environment.execute(action);
  } catch (error) {
    const completed = await record(store, createEvent, {
      ...context,
      eventType: "ActionCompleted",
      causationId: started.eventId,
      payload: { success: false, error: error.message },
    });
    const mismatch = await record(store, createEvent, {
      ...context,
      eventType: "MismatchDetected",
      causationId: completed.eventId,
      payload: {
        category: "external_action_failed",
        failedAssumption: prediction.failedIfContradicted,
        expectedState: prediction.expectedState,
        observedState: null,
      },
    });
    return { state: beforeState, terminalEvent: mismatch, verified: false };
  }

  const completed = await record(store, createEvent, {
    ...context,
    eventType: "ActionCompleted",
    causationId: started.eventId,
    payload: result,
  });
  const { observation, observedEvent } = await observeCreatedIssue({
    store,
    createEvent,
    environment,
    context,
    action,
    result,
    causationId: completed.eventId,
  });
  const afterState = worldProgram.ground(observation, await store.list(context));
  const comparison = verifier.compare(prediction, verificationState(afterState));

  if (comparison.matches) {
    const goalSatisfied = worldProgram.isGoal(afterState, objective);
    if (goalSatisfied) {
      const verified = await record(store, createEvent, {
        ...context,
        eventType: "TransitionVerified",
        causationId: observedEvent.eventId,
        payload: {
          expectedState: comparison.expectedState,
          observedState: comparison.actualState,
          goalEvidence: { matchingIssues: afterState.matchingIssues },
        },
      });
      return { state: afterState, terminalEvent: verified, verified: true };
    }
  }

  const mismatch = await record(store, createEvent, {
    ...context,
    eventType: "MismatchDetected",
    causationId: observedEvent.eventId,
    payload: {
      category: comparison.matches
        ? "goal_not_satisfied"
        : worldProgram.classifyMismatch(prediction, verificationState(afterState)),
      failedAssumption: comparison.matches
        ? "a_matching_transition_was_assumed_to_satisfy_the_objective"
        : prediction.failedIfContradicted,
      expectedState: comparison.expectedState,
      observedState: comparison.actualState,
      evidence: { matchingIssues: afterState.matchingIssues },
    },
  });
  return { state: afterState, terminalEvent: mismatch, verified: false };
}

export async function runGithubIssueExperiment({
  store,
  environment,
  worldProgram,
  verifier,
  workspaceId,
  runId,
  actorId,
  objective,
  action,
  unsafeRetry = false,
  eventFactory = createEventFactory(),
}) {
  const context = { workspaceId, runId, actorId, correlationId: runId };
  const workspace = await record(store, eventFactory, {
    ...context,
    eventType: "WorkspaceCreated",
    payload: { objective },
  });
  const actor = await record(store, eventFactory, {
    ...context,
    eventType: "ActorJoined",
    causationId: workspace.eventId,
    payload: { capabilities: ["observe", "execute"] },
  });
  const initialObservation = await environment.observe({ marker: action.marker });
  const observed = await record(store, eventFactory, {
    ...context,
    eventType: "ObservationRecorded",
    causationId: actor.eventId,
    payload: { phase: "before_action", observation: initialObservation },
  });
  const initialState = worldProgram.ground(
    initialObservation,
    await store.list({ workspaceId, runId }),
  );

  if (initialState.matchingIssueCount !== 0) {
    const mismatch = await record(store, eventFactory, {
      ...context,
      eventType: "MismatchDetected",
      causationId: observed.eventId,
      payload: {
        category: "precondition_failed",
        failedAssumption: "no_matching_issue_exists_before_creation",
        expectedState: { matchingIssueCount: 0 },
        observedState: verificationState(initialState),
        evidence: { matchingIssues: initialState.matchingIssues },
      },
    });
    return {
      workspaceId,
      runId,
      firstTransitionVerified: false,
      retryMismatch: false,
      mismatchCategory: mismatch.payload.category,
      events: await store.list({ workspaceId, runId }),
    };
  }

  const first = await executeTransition({
    store,
    createEvent: eventFactory,
    environment,
    worldProgram,
    verifier,
    context,
    action,
    objective,
    beforeState: initialState,
    causationId: observed.eventId,
  });

  let retry = null;
  if (unsafeRetry && first.verified) {
    retry = await executeTransition({
      store,
      createEvent: eventFactory,
      environment,
      worldProgram,
      verifier,
      context,
      action: { ...action, assumeIdempotent: true },
      objective,
      beforeState: first.state,
      causationId: first.terminalEvent.eventId,
    });
  }

  return {
    workspaceId,
    runId,
    firstTransitionVerified: first.verified,
    retryMismatch: retry?.terminalEvent.eventType === "MismatchDetected",
    mismatchCategory: retry?.terminalEvent.payload.category ?? null,
    events: await store.list({ workspaceId, runId }),
  };
}
