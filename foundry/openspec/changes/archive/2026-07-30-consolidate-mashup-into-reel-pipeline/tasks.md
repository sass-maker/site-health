## 1. Specify the consolidated boundary

- [x] 1.1 Create the Fleet-store proposal, design, and capability deltas
- [x] 1.2 Validate the OpenSpec change strictly

## 2. Import the editorial runtime

- [x] 2.1 Copy the current Mashup Python package, tests, uv metadata, licensing scripts, and operator editor into `services/reel-pipeline/editorial`
- [x] 2.2 Exclude archives, `.mashup` state, outputs, build products, model payloads, credentials, and generated artifacts
- [x] 2.3 Add canonical-directory documentation and compatibility guidance
- [x] 2.4 Run the nested editorial unit test and formatting checks

## 3. Add the podcast edit contract

- [x] 3.1 Implement strict `fleet.podcast-edit.v1` normalization in Reel Pipeline
- [x] 3.2 Add a source-backed contract fixture covering all eight score terms and visual provenance
- [x] 3.3 Add Node tests for normalization, missing terms, invalid source ranges, filmed-asset provenance, and approval state
- [x] 3.4 Add a Python export command that wraps an existing EDL in the canonical contract
- [x] 3.5 Add Python tests proving lossless export

## 4. Connect editorial output to Reel Pipeline

- [x] 4.1 Implement approved podcast-edit rendering through the nested multi-clip renderer without replacing source speech
- [x] 4.2 Add adapter tests for approval gating, clip ordering, original audio binding, captions, source headings, watermark identity, and visual credits
- [x] 4.3 Add Reel Pipeline package commands for the nested editorial CLI and contract conversion
- [x] 4.4 Update Reel Pipeline architecture, command, recommendation, and project-status documentation

## 5. Verify parity and handoff

- [x] 5.1 Run focused Node contract and adapter tests
- [x] 5.2 Run the Reel Pipeline documentation validator and diff checks
- [x] 5.3 Export a real ZEROPOD short through the nested runtime and compare it with the standalone contract
- [x] 5.4 Render or package one approved source-backed short through the consolidated adapter
- [x] 5.5 Confirm final working-tree parity, preserve the historical snapshot, move remaining work to Fleet issue #73, link the canonical source, and archive the standalone repository without deleting local archives or caches

## 6. Harden uniqueness and retain long-form

- [x] 6.1 Specify exact duplicate-material rejection and long-form duration behavior
- [x] 6.2 Reject repeated member segment IDs and overlapping source-audio intervals in Python export and Node normalization
- [x] 6.3 Prevent boundary snapping from creating duplicate rendered source intervals
- [x] 6.4 Add planner and contract regression tests for a 420-second multi-clip edit
- [x] 6.5 Document the distinction between short mode and long-form planning
- [x] 6.6 Run focused Python and Node checks, full editorial tests, strict OpenSpec validation, docs validation, and diff checks
