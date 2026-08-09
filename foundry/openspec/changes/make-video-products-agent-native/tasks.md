## 1. Contract and baseline

- [x] 1.1 Inventory every registered Studio effect/action, Reel recipe/adapter/mode, and Mashup agent-safe command/stage
- [x] 1.2 Define canonical request, result, manifest, event, error, artifact, and side-effect JSON schemas with golden fixtures
- [x] 1.3 Add dependency-free cross-product conformance validation for strict decoding, stdout purity, stable errors, idempotency, and arbitrary-execution rejection

## 2. Reel Pipeline agent surface

- [ ] 2.1 Add one `reel-agent` JSON command with manifest, validate, execute, inspect, readiness, package, draft, schedule, publish, and remote-result operations over existing registries
- [x] 2.2 Map every registered recipe, variant, adapter, required input, execution mode, blocker, owner, and artifact evidence into the capability manifest
- [x] 2.3 Add stable errors, dry-run validation, operation IDs, idempotency handling, and fixture-versus-real fail-closed behavior
- [x] 2.4 Add configured-channel manifests and enforce `draft_only`, `approval_required`, or `autonomous` policy before packaging and provider writes
- [x] 2.5 Add registry completeness, protocol conformance, negative safety, representative execution, and publication-policy tests

## 3. Mashup agent surface

- [x] 3.1 Add one non-interactive `mashup agent` JSON command without removing existing human Typer commands
- [ ] 3.2 Publish a complete manifest for safe source, ingestion, discovery, transcription, enrichment, planning, scoring, approval, export, render-validation, render, and receipt operations
- [ ] 3.3 Return structured stage progress, reuse evidence, blockers, stable errors, operation IDs, and terminal results while preserving SQLite resumability
- [x] 3.4 Link agent-produced media receipts to normalized operation identities and reject mismatches
- [x] 3.5 Add manifest completeness, protocol conformance, resumability, approval, receipt-linkage, and arbitrary-execution rejection tests without rendering media

## 4. Studio shared domain service

- [ ] 4.1 Extract import/analyze, planning, validation, graph editing, estimation, persistence, rendering, cancellation, selection, and export orchestration from `StudioViewModel` into a headless service
- [ ] 4.2 Adapt SwiftUI to the shared service without changing the approved interface or project compatibility
- [ ] 4.3 Add service tests proving graph hashes, stale previews, manifests, fallbacks, cancellation, and export validity remain consistent

## 5. Studio agent executable

- [x] 5.1 Add a `studio-agent` executable with manifest, inspect, analyze, plan, catalog, validate, edit, estimate, render, cancel, select, and export operations
- [x] 5.2 Strictly decode JSON requests, keep stdout protocol-only, return stable errors and provenance, and reject commands, code, plugins, and unknown fields
- [ ] 5.3 Add manifest-to-effect/action completeness, golden protocol, persisted-project parity, and negative safety tests without broad video rendering

## 6. Agent navigation and product truth

- [x] 6.1 Update all three AGENTS.md files with canonical commands, safety boundaries, capability discovery, result interpretation, and smallest checks
- [x] 6.2 Update READMEs and project recommendation context with agent entrypoints, schemas, lifecycle guarantees, and honest unsupported capabilities
- [x] 6.3 Update PROJECT_STATUS.md files only after checks pass with the shipped agent-native surfaces and issue queues

## 7. Acceptance and publication

- [x] 7.1 Run each product's smallest tests, builds, manifest completeness check, and shared conformance suite
- [ ] 7.2 Run one bounded source-backed Studio operation and one fixture-only Reel/Mashup end-to-end operation through package validation; do not create a real external post during acceptance
- [ ] 7.3 Validate the cross-repo OpenSpec change strictly, sync main specs, archive the change, and record completed skill runs
- [ ] 7.4 Commit and push separate Fleet and Studio branches with draft PRs that close Fleet #279 and Studio #1
