## 1. Baseline and ownership inventory

- [x] 1.1 Record git state and the smallest current Mashup, Reel Pipeline, and Local AI Video Studio checks without rendering media
- [x] 1.2 Inventory every Reel Pipeline script, import, subprocess, recipe, adapter, test, and document that references `editorial`, `mashup`, or `fleet.podcast-edit.v1`
- [x] 1.3 Inventory Mashup persisted paths and verify a non-destructive compatibility strategy for existing SQLite state, caches, models, and output files

## 2. Extract the Mashup helper

- [x] 2.1 Establish `foundry/helpers/mashup` with focused project instructions, status, documentation, Python project metadata, and operator entrypoints
- [x] 2.2 Relocate the editorial planner, schemas, persistence, scoring, approval, loopback editor, and multi-clip renderer while preserving behavior and fixtures
- [x] 2.3 Add the versioned finished-media receipt with artifact hashes, source provenance, rights evidence, recipe/model revisions, approval, captions, and validation evidence
- [x] 2.4 Add independent Mashup tests for CLI startup, resumable state compatibility, `fleet.podcast-edit.v1`, approved rendering boundaries, and receipt validation without producing a real video

## 3. Decouple Reel Pipeline

- [x] 3.1 Remove Reel-owned package scripts, Python imports, relative subprocess calls, recipes, and registry entries that directly execute Mashup
- [x] 3.2 Replace the voice-intake dependency with a Reel-owned boundary or explicitly remove the unsupported transcription path without copying Mashup's editorial runtime
- [x] 3.3 Add optional validation and ingestion of finished Mashup media receipts as ordinary external source media
- [x] 3.4 Add negative dependency tests proving Reel Pipeline has no runtime path into Mashup and still passes its scoped checks when Mashup is absent

## 4. Add the native studio capability catalog

- [x] 4.1 Extend the native effect registry with catalog metadata for category, parameters, readiness, cost, constraints, and fallback behavior without duplicating stable effect IDs
- [x] 4.2 Add completeness and validation tests covering every registered effect, parameter bounds, incompatible combinations, and unavailable capability messaging
- [x] 4.3 Add selected-variant and explicit all-variant graph mutation APIs that preserve unrelated nodes, canonical hashing, validation, persistence, and stale-preview state
- [x] 4.4 Prove prompt-generated and directly edited graphs serialize, validate, explain, and estimate through the same pipeline

## 5. Build direct effect controls

- [x] 5.1 Create the Local AI Video Studio preserve-mode design receipt and capture the existing interface as before evidence
- [x] 5.2 Add an adaptive effect browser/inspector using the existing black optical-printer visual system with categorized effects, readiness/cost labels, and selected/all targeting
- [x] 5.3 Add schema-derived add, remove, and parameter controls with accessible labels, keyboard focus, validation feedback, and stale-preview disclosure
- [x] 5.4 Verify wide, medium, narrow, dark, large-text, empty, planned, unavailable, invalid, and stale-preview UI states without rendering video

## 6. Documentation and validation

- [x] 6.1 Update Mashup, Reel Pipeline, Local AI Video Studio, Foundry helper, and connection documentation to reflect independent ownership and the receipt transport
- [x] 6.2 Update affected `PROJECT_STATUS.md` files only with shipped product truth after implementation checks pass
- [x] 6.3 Run the smallest relevant Mashup, Reel Pipeline, and Swift test/build commands, then run strict OpenSpec validation
- [x] 6.4 Complete Impeccable critique, polish, and native audit; resolve all P0/P1 findings and satisfy the Fleet design-review floors
- [x] 6.5 Conduct final source-backed media testing with the owner, record the owner `keep` or `delegated` design decision, and validate the completed design receipt
