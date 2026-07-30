## 1. Confirm Boundaries

- [x] 1.1 Confirm the physical `foundry/helpers/` layout and multipart Feedback ingestion contract with the owner
- [x] 1.2 Inventory active path consumers and classify archived or immutable historical references before moving source

## 2. Separate Helpers And Console Clients

- [x] 2.1 Move Drank, PSI Swarm, and AI Visibility to their canonical `foundry/helpers/` roots with history-preserving moves
- [x] 2.2 Move Mobile Cockpit to `foundry/apps/dashboard/mobile-cockpit` without changing its runtime behavior
- [x] 2.3 Repair the PSI Swarm skill link and helper-owned invocation documentation so no duplicate skill implementation exists
- [x] 2.4 Update each moved component's active README, agent instructions, package metadata, changelog source links, and local path examples

## 3. Migrate Fleet Integrations

- [x] 3.1 Update active Fleet registries, component-root checks, native check runners, deploy helpers, and operational scripts to the new roots
- [x] 3.2 Update Fleet Console data readers, connection tests, and operator documentation to consume the new roots
- [x] 3.3 Update Foundry's product overview and generated catalog inputs to show Helpers, Skills, Public Apps, Marketing, Feedback, and Fleet Console accurately
- [x] 3.4 Add or extend active-path validation so retired helper and Mobile Cockpit roots are reported while archived historical evidence remains untouched

## 4. Add Feedback URL Ingestion

- [x] 4.1 Define callback-mode and URL-mode `FeedbackWidgetProps` with exactly one submission destination
- [x] 4.2 Implement credential-free HTTP(S) multipart submission with stable `feedback` and optional `screenshot` fields
- [x] 4.3 Preserve form state and surface actionable errors for invalid configuration, network failures, and non-2xx responses without automatic retries
- [x] 4.4 Document the endpoint contract, CORS and privacy responsibilities, callback escape hatch, and examples for same-origin and cross-origin consumers
- [x] 4.5 Add dependency-free compatibility and transport tests and include them in the package's native check

## 5. Validate The Migration

- [x] 5.1 Run Feedback's native check and AI Visibility's build, test, pack-consumer, and dry-run package checks
- [x] 5.2 Run Drank, PSI Swarm CLI/web, and Mobile Cockpit's smallest native checks
- [x] 5.3 Run targeted Fleet registry, component-root, connection, generated-view, and stale-active-path checks
- [x] 5.4 Run strict OpenSpec validation and `git diff --check`, then report skipped checks and residual risks without publishing or deploying
