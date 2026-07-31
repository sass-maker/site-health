## 1. Production Catalog and Contracts

- [x] 1.1 Add a server-owned recipe catalog with normalized owners, engines, spend classes, readiness, defaults, and requirements
- [x] 1.2 Add optional project, idea, recipe, and recipe-options persistence while preserving legacy records
- [x] 1.3 Add focused contract tests for every recipe mapping and backward-compatible normalization

## 2. Planner APIs and Actions

- [x] 2.1 Expose projects, project-scoped ideas, and the production catalog through Studio API endpoints
- [x] 2.2 Validate and save a selected production plan as a versioned Marketing Studio brief
- [x] 2.3 Derive truthful edit, build or continuation, preview, and Postiz preparation actions from brief state
- [x] 2.4 Add focused API tests for ordered planning, invalid selections, and terminal action gates

## 3. Ordered Dashboard Flow

- [x] 3.1 Build the project, idea, recipe, and bounded-options planner using the existing Studio visual language
- [x] 3.2 Group and compare recipes by outcome, spend posture, runtime, owner, and readiness without invented prices
- [x] 3.3 Wire saved plans into the existing detailed editor, build or continuation path, production preview, and Postiz preparation flow
- [x] 3.4 Add accessible loading, empty, validation, blocked, and responsive states while retaining the advanced brief editor

## 4. Verification and Design Review

- [x] 4.1 Run the smallest focused contract and API tests, then the relevant Studio test suite
- [x] 4.2 Validate the OpenSpec change strictly and run repository diff checks
- [x] 4.3 Capture browser evidence at required widths and complete the preserve-mode design review receipt

## 5. Agent Arsenal Consolidation

- [x] 5.1 Add one versioned, secret-free arsenal manifest for workflow, recipe, and Studio-tool decision metadata
- [x] 5.2 Make the existing capability evaluator, production planner, and Tools UI consume the canonical manifest without changing stable ids or behavior
- [x] 5.3 Add a read-only arsenal assembler that joins projects, render modes, runtime readiness, automation policies, guardrails, and next actions with source provenance
- [x] 5.4 Expose the same filterable arsenal schema through `GET /studio/arsenal` and `npm run factory -- arsenal`

## 6. Agent Contract Verification

- [x] 6.1 Add manifest integrity, drift, filter, read-only API, and CLI contract tests
- [x] 6.2 Document the single discovery surface and the explicit plan, execute, review, and Postiz boundaries for AI operators
- [x] 6.3 Run focused agent-arsenal tests, the relevant Studio suite, strict OpenSpec validation, docs validation, and diff checks
