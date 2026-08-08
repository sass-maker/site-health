import { WorldProgram } from "./contracts.mjs";

export class GithubIssueWorldProgram extends WorldProgram {
  ground(observation) {
    return {
      matchingIssueCount: observation.matchingCount,
      matchingIssues: structuredClone(observation.matchingIssues),
    };
  }

  predict(state, action) {
    if (action.type !== "create_issue") {
      throw new TypeError(`Unsupported world action: ${action.type}`);
    }

    if (action.assumeIdempotent) {
      return {
        expectedState: { matchingIssueCount: state.matchingIssueCount },
        failedIfContradicted: "retry_was_treated_as_idempotent",
        rationale: "The retry is assumed to preserve exactly one matching issue.",
      };
    }

    return {
      expectedState: { matchingIssueCount: state.matchingIssueCount + 1 },
      failedIfContradicted: "create_issue_was_expected_to_add_exactly_one_issue",
      rationale: "A successful create_issue action should add exactly one matching issue.",
    };
  }

  isGoal(state, objective) {
    return state.matchingIssueCount === objective.expectedMatchingIssueCount;
  }

  classifyMismatch(prediction, observedState) {
    const expected = prediction.expectedState.matchingIssueCount;
    const observed = observedState.matchingIssueCount;

    if (observed > expected) return "duplicate_side_effect";
    if (observed < expected) return "missing_side_effect";
    return "unexpected_state";
  }
}

