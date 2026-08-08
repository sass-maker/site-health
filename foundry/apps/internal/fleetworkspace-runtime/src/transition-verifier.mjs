import { isDeepStrictEqual } from "node:util";

export class TransitionVerifier {
  compare(prediction, observedState) {
    const expectedState = structuredClone(prediction.expectedState);
    const actualState = structuredClone(observedState);

    return {
      matches: isDeepStrictEqual(expectedState, actualState),
      expectedState,
      actualState,
    };
  }
}

