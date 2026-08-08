import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { EnvironmentAdapter } from "../src/contracts.mjs";
import { EventStore } from "../src/event-store.mjs";
import { createEventFactory } from "../src/events.mjs";
import { GithubIssueWorldProgram } from "../src/github-issue-world-program.mjs";
import { runGithubIssueExperiment } from "../src/run-issue-workflow.mjs";
import { formatTimeline } from "../src/timeline.mjs";
import { TransitionVerifier } from "../src/transition-verifier.mjs";

class InMemoryGithubAdapter extends EnvironmentAdapter {
  constructor(issues = []) {
    super();
    this.issues = structuredClone(issues);
    this.executeCount = 0;
  }

  async observe({ marker }) {
    const matchingIssues = this.issues.filter((issue) => issue.marker === marker);
    return {
      repository: "fixture/example",
      marker,
      matchingCount: matchingIssues.length,
      matchingIssues: structuredClone(matchingIssues),
    };
  }

  async execute(action) {
    this.executeCount += 1;
    const issue = {
      number: this.issues.length + 1,
      title: action.title,
      url: `https://example.test/issues/${this.issues.length + 1}`,
      state: "open",
      marker: action.marker,
    };
    this.issues.push(issue);
    return { success: true, issue: structuredClone(issue) };
  }
}

function deterministicFactory() {
  let id = 0;
  let second = 0;
  return createEventFactory({
    idFactory: () => `event-${++id}`,
    clock: () => `2026-08-08T10:42:${String(second++).padStart(2, "0")}.000Z`,
  });
}

test("a successful tool retry is rejected when it creates a duplicate side effect", async () => {
  const directory = await mkdtemp(join(tmpdir(), "fleetworkspace-run-"));
  const result = await runGithubIssueExperiment({
    store: new EventStore(join(directory, "timeline.jsonl")),
    environment: new InMemoryGithubAdapter(),
    worldProgram: new GithubIssueWorldProgram(),
    verifier: new TransitionVerifier(),
    workspaceId: "workspace-1",
    runId: "run-1",
    actorId: "agent:github-runner",
    objective: {
      description: "Exactly one marked issue exists",
      expectedMatchingIssueCount: 1,
    },
    action: {
      type: "create_issue",
      title: "Verified transition fixture",
      body: "fixture",
      marker: "marker-1",
    },
    unsafeRetry: true,
    eventFactory: deterministicFactory(),
  });

  assert.equal(result.firstTransitionVerified, true);
  assert.equal(result.retryMismatch, true);
  assert.equal(result.mismatchCategory, "duplicate_side_effect");
  assert.deepEqual(
    result.events.map((event) => event.eventType),
    [
      "WorkspaceCreated",
      "ActorJoined",
      "ObservationRecorded",
      "ActionProposed",
      "ActionStarted",
      "ActionCompleted",
      "ObservationRecorded",
      "TransitionVerified",
      "ActionProposed",
      "ActionStarted",
      "ActionCompleted",
      "ObservationRecorded",
      "MismatchDetected",
    ],
  );

  const firstProposalIndex = result.events.findIndex(
    (event) => event.eventType === "ActionProposed",
  );
  const firstStartIndex = result.events.findIndex(
    (event) => event.eventType === "ActionStarted",
  );
  assert.ok(firstProposalIndex < firstStartIndex);

  const mismatch = result.events.at(-1);
  assert.equal(mismatch.payload.expectedState.matchingIssueCount, 1);
  assert.equal(mismatch.payload.observedState.matchingIssueCount, 2);
  assert.equal(mismatch.payload.failedAssumption, "retry_was_treated_as_idempotent");
  assert.match(formatTimeline(result.events), /mismatch duplicate_side_effect/);
});

test("a failed zero-match precondition prevents duplicate creation", async () => {
  const directory = await mkdtemp(join(tmpdir(), "fleetworkspace-precondition-"));
  const environment = new InMemoryGithubAdapter([
    {
      number: 1,
      title: "Existing issue",
      url: "https://example.test/issues/1",
      state: "open",
      marker: "marker-1",
    },
  ]);
  const result = await runGithubIssueExperiment({
    store: new EventStore(join(directory, "timeline.jsonl")),
    environment,
    worldProgram: new GithubIssueWorldProgram(),
    verifier: new TransitionVerifier(),
    workspaceId: "workspace-precondition",
    runId: "run-precondition",
    actorId: "agent:github-runner",
    objective: {
      description: "Exactly one marked issue exists",
      expectedMatchingIssueCount: 1,
    },
    action: {
      type: "create_issue",
      title: "Must not be created",
      body: "fixture",
      marker: "marker-1",
    },
    eventFactory: deterministicFactory(),
  });

  assert.equal(environment.executeCount, 0);
  assert.equal(result.firstTransitionVerified, false);
  assert.equal(result.mismatchCategory, "precondition_failed");
  assert.equal(result.events.at(-1).eventType, "MismatchDetected");
});
