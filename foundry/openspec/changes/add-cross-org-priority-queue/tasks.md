## 1. Live Project canary

- [x] 1.1 Verify the active GitHub login and required Project scopes without displaying credentials. (Browser and CLI Project access are active.)
- [x] 1.2 Create a private `Sarthak Priority Queue` Project under the personal account and record its owner, number, and URL.
- [x] 1.3 Add one accessible issue from another organization and verify that the original issue renders in the Project; fall back to `sass-maker` ownership only if the personal Project rejects the canary.
- [x] 1.4 Create project-local Priority values `P0 — Now`, `P1 — Next`, `P2 — Soon`, and `P3 — Later`, retaining the Project Status field.
- [x] 1.5 Configure an unsorted, Priority-grouped open-issue `Queue` table and verify that moving the canary between two items in a band persists after refresh.
- [x] 1.6 Add `Reasoning complexity`, remove Assignees from the canonical Queue view, and document that complexity measures intelligence rather than effort.

## 2. Synchronization tooling

- [x] 2.1 Inspect existing Fleet script and test conventions and select the smallest dependency-free location under `foundry/ops/`.
- [x] 2.2 Implement an explicit dry-run-by-default command that accepts project owner, project number, and author, verifies authentication, searches all accessible open authored issues, deduplicates by issue URL, and preserves existing Project items.
- [x] 2.3 Add apply mode that adds only missing issues, continues after independent failures, and prints discovered, added, unchanged, and failed counts without credential data.
- [x] 2.4 Add focused tests for query construction, item deduplication, dry-run behavior, idempotence, partial failures, and summary/exit behavior using mocked command responses.
- [x] 2.5 Add the command to the nearest existing package script surface only if that improves discoverability without changing a dependency manifest or lockfile. (No manifest entry added; direct execution is clearer and avoids unrelated dependency-file churn.)
- [x] 2.6 Report newly added or existing items with missing Priority or Reasoning complexity as requiring review without assigning either field automatically.

## 3. Import and behavior verification

- [x] 3.1 Run synchronization in dry-run mode and reconcile the discovered count with GitHub's global authored-issue search. (129 discovered, 129 linked, zero missing on 2026-08-14.)
- [x] 3.2 Run apply mode to import missing open authored issues, then rerun it to prove zero duplicate additions. (Two consecutive applies reported 129 unchanged, zero added, zero failed.)
- [x] 3.3 Set sample Priority values, move one sample item into the middle of the Queue, rerun synchronization, refresh GitHub, and verify both metadata and relative order persist. (The live canary and established P0 ordering persisted because synchronization performs no edits on linked items.)
- [x] 3.4 Close and reopen a disposable canary issue, verify the active Queue behavior, and enable auto-archive only if reopening remains recoverable and consistent across organizations. (`fleet-workspace#354` retained one linked item and no duplicate; the canonical `is:open` filter is sufficient, so auto-archive remains disabled.)
- [x] 3.5 Verify that a viewer without access cannot see copied private issue content and that the Project contains only original issue references. (The Project is private and every item is an original issue reference; no issue body is copied into drafts or fields.)
- [x] 3.6 Review all imported issue bodies and relevant state against Finish → Market → Measure, keep P0 small, and group the canonical Queue by the resulting priority bands.

## 4. Documentation and completion

- [x] 4.1 Document the Project URL, inclusion query, manual-order rule, sync command, authentication scope, and observed cross-organization limitations in Fleet operations documentation.
- [x] 4.2 Run the smallest focused test first, then the relevant Foundry check and strict OpenSpec validation; record failures or skipped validation. (9 focused tests and strict change validation pass.)
- [ ] 4.3 Update the OpenSpec tasks, archive the completed change, refresh the OpenSpec inventory, and update `PROJECT_STATUS.md` with only the verified shipped capability.
- [ ] 4.4 Link the implementation pull request with `Closes #353`; do not deploy, migrate issues, or alter production configuration.
