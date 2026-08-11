## 1. Confirm implementation inputs and gates

- [x] 1.1 Resolve current API base URLs and exact read routes for Reader, Starboard, High Signal, Calorie, Anime List, Significant Hobbies, Research Papers, and Setline against repo-local code and fixtures.
- [x] 1.2 Create the owning Fleet Workspace GitHub issue and link this OpenSpec change.
- [x] 1.3 Run the `code-cleanup` dependency inspection, document the official MCP SDK/schema dependency rationale, and obtain approval before manifest or lockfile edits.
- [x] 1.4 Review and approve the additive Calorie and Setline read-only token models before creating migrations or token-management surfaces.
- [x] 1.5 Record the initial privacy choices: Calorie medication data excluded, Calorie weight optionality resolved, Significant Hobbies private data excluded, Research Papers paid-answer/RAG calls excluded.

## 2. Build the shared read-only runtime

- [x] 2.1 Create `foundry/helpers/chatgpt-connections/` with the approved dependencies, shared TypeScript configuration, and seven app-specific stdio entrypoints.
- [x] 2.2 Implement validated local configuration for app base URLs, bounded timeouts, Research Papers local/static modes, and process-only credentials without printing values.
- [x] 2.3 Implement a fixed-operation client that rejects arbitrary origins, paths, methods, headers, SQL, and request bodies; shared app adapters permit GET only.
- [x] 2.4 Implement stable errors, abort timeouts, at most one safe retry, upstream validation, secret-safe diagnostics, and explicit degraded modes.
- [x] 2.5 Implement versioned result normalization for identifiers, canonical URLs, freshness, retrieval mode, pagination, evidence/provenance, and truncation.
- [x] 2.6 Add fixture tests proving operation allowlists, output bounds, validation, redaction, and mutation absence.

## 3. Preserve the existing Reader, Starboard, and High Signal scope

- [x] 3.1 Implement Reader adapters and `search_saved_reading`, `get_saved_item`, and `list_reader_collections` using only a dedicated `rdr_*` credential.
- [x] 3.2 Implement public-only Starboard adapters and `search_repositories`, `get_repository`, `preview_project`, and `inspect_tool_adoption`.
- [x] 3.3 Implement public-only High Signal adapters and `search_signals`, `get_signal`, `get_daily_brief`, and `get_track_record`.
- [x] 3.4 Add only the smallest bounded read-route parameters proven necessary, with each owning app's native tests.
- [x] 3.5 Add contract/evaluation fixtures for ownership, public scope, evidence, fallback labeling, pagination, empty results, rate limits, timeouts, and malformed responses.

## 4. Add the Calorie owner connection

- [x] 4.1 Add an app-owned, hashed, shown-once, revocable, owner-scoped read-only token boundary without granting existing write routes.
- [x] 4.2 Add narrow read projections for daily nutrition, bounded history, saved-food search, and goal cycles; omit medication routines/check-ins and unrelated profile fields at the source boundary.
- [x] 4.3 Register `get_daily_nutrition`, `get_nutrition_history`, `search_saved_foods`, and `list_goal_cycles` with typed date/timezone/unit schemas and read-only annotations.
- [x] 4.4 Test owner isolation, revocation, missing days, one-year range bounds, pagination, units, recorded/calculated provenance, medication-field absence, timeouts, and malformed responses.
- [x] 4.5 Run Calorie's smallest focused tests followed by `pnpm check`; generate but do not remotely apply any approved migration.

## 5. Harden and reuse Anime List's native MCP

- [x] 5.1 Keep one app-owned `/api/mcp` contract and its existing ten catalog/watchlist tools; do not duplicate them in the shared runtime.
- [x] 5.2 Replace permissive filter schemas and raw response forwarding with typed inputs, bounded pages, explicit output schemas, normalized `structuredContent`, canonical URLs, and stable continuation state.
- [x] 5.3 Add read-only/non-destructive annotations, fixed read-semantic operation checks, bounded timeouts/retries, upstream validation, and redacted stable errors.
- [x] 5.4 Preserve PAT-only owner auth for watchlist tools and reject browser-cookie-only MCP authentication.
- [x] 5.5 Extend existing MCP/PAT tests for annotations, schemas, oversized filters, mutation absence, revocation, cross-owner isolation, timeout, rate limiting, and malformed responses.

## 6. Add the Significant Hobbies public connection

- [x] 6.1 Implement public corpus validators/adapters for hobby facets/categories, experiences, first steps, and canonical links.
- [x] 6.2 Add the smallest bounded public timeline search/detail routes needed to query records whose visibility is exactly `PUBLIC`.
- [x] 6.3 Register `search_hobbies`, `search_experiences`, `get_experience`, `search_public_timelines`, and `get_public_timeline`.
- [x] 6.4 Test that PRIVATE/UNLISTED timelines, Daily, journal, habits, Trajectory, commitments, bucket lists, accounts, and device-local data are unaddressable and never appear in output.
- [x] 6.5 Run Significant Hobbies' focused route tests and native check without migration or deployment.

## 7. Add the Research Papers connection

- [x] 7.1 Implement bounded adapters for local FastAPI search, paper detail, similarity, hot papers, and sleepers, preserving paper IDs, source links, scores, and provenance.
- [x] 7.2 Implement curated reading-path reads and an explicit allowlist of public static fallback exports with freshness metadata.
- [x] 7.3 Register `search_research_papers`, `get_research_paper`, `find_similar_papers`, `list_hot_papers`, `list_sleepers`, and `get_reading_path`.
- [x] 7.4 Ensure no tool calls `/rag/query`, ClickHouse directly, ingest/enrichment commands, PDF download/redistribution, or operator endpoints.
- [x] 7.5 Test local-corpus mode, static fallback, unsupported-in-fallback failures, pagination, citations, timeouts, unavailable ClickHouse, and malformed exports; run focused Python and web checks.

## 8. Add the Setline owner connection

- [x] 8.1 Add an app-owned, hashed, shown-once, revocable, owner-scoped read-only token boundary without granting whole-state writes or account actions.
- [x] 8.2 Add bounded read projections over programme/templates, history/session detail, and existing recorded-history analytics instead of forwarding the whole private state.
- [x] 8.3 Register `get_training_programme`, `list_workout_templates`, `list_workout_history`, `get_workout_session`, and `get_progress_summary`.
- [x] 8.4 Test authored order, immutable history, units, partial/drop segments, recorded/calculated provenance, empty/legacy boundaries, owner isolation, revocation, pagination, and the absence of execution/coaching/write tools.
- [x] 8.5 Run Setline's focused tests followed by `pnpm run check`; generate but do not remotely apply any approved migration.

## 9. Prove all eight MCP contracts

- [x] 9.1 Test stable server identities, tool lists, descriptions, explicit schemas, read-only annotations, structured outputs, and per-app enablement.
- [x] 9.2 Add a mutation-absence test that fails if any tool can call a mutation operation or accept arbitrary transport instructions.
- [x] 9.3 Add retained direct, indirect, follow-up, empty, invalid, unauthorized, degraded, unsupported, cross-app, privacy-boundary, and mutation-request prompts for each connection.
- [x] 9.4 Add secret-redaction tests covering configuration, auth failures, upstream bodies, diagnostics, snapshots, and support output.
- [x] 9.5 Run MCP Inspector against all eight connections and retain sanitized representative discovery/call results.

## 10. Document and validate local readiness

- [x] 10.1 Add an operator matrix covering each connection's source, credential, route, doctor command, tool catalog, privacy boundary, degraded mode, and revocation path.
- [x] 10.2 Document dedicated Reader/Anime List token use and the separately gated Calorie/Setline token issuance without recording values.
- [x] 10.3 Run affected native app checks, shared helper checks, strict OpenSpec validation, and the smallest relevant Fleet root checks.
- [x] 10.4 Report local completion as implementation-ready until all explicit external actions are approved and complete.

## 11. Complete separately approved external setup

- [x] 11.1 With explicit approval, apply required Calorie/Setline migrations and deploy only the affected reviewed app changes through their manual release paths.
- [ ] 11.2 As explicit operator actions, issue dedicated Reader, Anime List, Calorie, and Setline read credentials and inject them through the existing secret boundary.
- [ ] 11.3 Configure the free Auth0 tenant with CIMD, resource-parameter compatibility, four exact API audiences/read permissions, default third-party user grants, and the verified owner allowlist; keep DCR, custom domains, and paid features disabled.
- [ ] 11.4 Deploy the shared Worker from clean, green `main` with the exact Git SHA tag, then verify OAuth metadata, anonymous routes, and fail-closed private routes without retaining private bodies.
- [ ] 11.5 Add connections one at a time in ChatGPT developer mode and run retained positive, follow-up, degraded, unsupported, privacy, cross-app, and mutation evaluations.
- [ ] 11.6 Record acceptance and residual limits; do not publish plugins, deploy unrelated apps, enable paid authentication features, or broaden private data without a separate approved change.
