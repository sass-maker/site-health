## 1. Contract and component boundary

- [x] 1.1 Create the FleetWorkspace `PROJECT.md` contract and dependency-free internal component shell.
- [x] 1.2 Link the implementation to one GitHub issue in `sass-maker/fleet-workspace`.

## 2. Attributable event timeline

- [x] 2.1 Implement the shared event envelope, required event types, and injectable event factory.
- [x] 2.2 Implement append-only JSONL `EventStore.append` and ordered workspace/run listing.
- [x] 2.3 Implement a readable timeline formatter without mutating stored events.

## 3. Verified GitHub transition

- [x] 3.1 Implement the minimum environment, world-program, and verifier interfaces.
- [x] 3.2 Implement the hard-coded GitHub adapter for exact-marker observation and issue creation.
- [x] 3.3 Implement the issue workflow runner with durable pre-action predictions, post-action observations, goal evidence, and duplicate-side-effect localization.
- [x] 3.4 Add CLI commands for running the bounded experiment and printing a stored timeline.

## 4. Deterministic verification

- [x] 4.1 Test event immutability, ordering, attribution, and readable replay.
- [x] 4.2 Test one verified transition and one successful tool call that produces a duplicate mismatch through an in-memory adapter.
- [x] 4.3 Run the component test and check commands plus strict OpenSpec validation.

## 5. Real GitHub evidence

- [x] 5.1 Run one exact-marker transition against `sass-maker/fleet-workspace`, then deliberately retry it without duplicate protection.
- [x] 5.2 Preserve the JSONL evidence and readable timeline, verify the mismatch classification, and close both experiment issues so only tracker `#245` remains open.
- [x] 5.3 Record the completed Fleet-owned skill runs and report external side effects, validation, and remaining scope without deploying or releasing.
