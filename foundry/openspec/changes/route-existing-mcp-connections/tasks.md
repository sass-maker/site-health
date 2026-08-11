## 1. Confirm the phase-one inventory and gates

- [x] 1.1 Create the Fleet Workspace tracking issue and preserve the completed `expose-fleet-apps-to-chatgpt` change as historical implementation evidence.
- [x] 1.2 Classify existing sources: CodeVetter local; Reader, Calorie, Anime List, and Setline hosted personal; Starboard, High Signal, Significant Hobbies public, and Research Papers public exports hosted public.
- [x] 1.3 Record explicit deferrals for Indulge/device-only data, Significant Hobbies private records, Research Papers full local-corpus hosting, OAuth, mutations, and blanket Secure MCP tunnels.
- [ ] 1.4 Run `code-cleanup` against the shared helper before any dependency or lockfile edit and record the Cloudflare/MCP runtime compatibility decision.
- [ ] 1.5 Run the Cloudflare Workers architecture and production-practice review before writing or configuring the hosted transport.

## 2. Activate the existing CodeVetter local MCP

- [ ] 2.1 Verify the installed `codevetter-mcp` binary, local database, currently indexed repositories, and current enabled-scope count without reading unrestricted record bodies.
- [ ] 2.2 Require CodeVetter's existing in-app **Settings → Agent MCP** enable action for each selected repository; do not create or enable repository scopes directly in SQLite.
- [ ] 2.3 Add each enabled generated STDIO configuration to the shared ChatGPT/Codex MCP configuration with a unique stable connection name.
- [ ] 2.4 Run MCP initialize, tool/resource discovery, one bounded graph/history call, revocation behavior, and secret/path-redaction checks against every enabled repository.

## 3. Activate Anime List's existing hosted MCP

- [ ] 3.1 Re-verify production initialize and tool discovery on Anime List's native `/api/mcp` endpoint without retaining private response bodies.
- [ ] 3.2 Add the native Streamable HTTP connection to the local ChatGPT/Codex MCP configuration using the dedicated PAT through a non-committed credential source.
- [ ] 3.3 Test anonymous catalog calls, owner watchlist isolation, invalid/revoked authentication, mutation absence, and connection disablement.

## 4. Add the shared Cloudflare Streamable HTTP transport

- [ ] 4.1 Refactor shared tool registration and handlers so the existing STDIO entrypoints and a web-standard request-scoped transport reuse one implementation.
- [ ] 4.2 Add a fixed product-route registry for Reader, Calorie, Setline, Starboard, High Signal, Significant Hobbies public, and Research Papers public-export modes.
- [ ] 4.3 Ensure initialization on one route advertises only that product's identity, instructions, resources, prompts if any, and read-only tool catalog.
- [ ] 4.4 Implement request-scoped bearer extraction and prefix validation for personal routes without global state, credential persistence, logging, caching, or cross-request reuse.
- [ ] 4.5 Keep public routes credential-free and restrict Research Papers hosting to approved export-backed tools with explicit retrieval mode and freshness.
- [ ] 4.6 Add bounded protocol errors, CORS/origin behavior required by supported clients, conservative public caching, no-store personal responses, and secret-safe observability.

## 5. Prove protocol, privacy, and isolation

- [ ] 5.1 Add Worker-runtime tests for initialize, tools/list, tool calls, invalid protocol input, unsupported routes, timeouts, and bounded responses.
- [ ] 5.2 Add concurrency tests proving two owner credentials and two products cannot leak authorization or results across requests.
- [ ] 5.3 Re-run mutation-absence, arbitrary-transport rejection, annotations, output-schema, pagination, redaction, degraded-mode, and upstream-validation tests across every hosted route.
- [ ] 5.4 Run the shared helper check, strict OpenSpec validation, Cloudflare local-worker smoke tests, and MCP Inspector against the local CodeVetter, native Anime List, and shared hosted routes.

## 6. Deploy and connect eligible Cloudflare routes

- [ ] 6.1 Run the Fleet deployment guard and verify the exact reviewed commit, required bindings, no embedded owner credentials, rollback path, and Cloudflare project ownership.
- [ ] 6.2 Deploy the shared Worker through the manual path with the exact 40-character Git SHA tag and verify 100% production traffic on that tagged version.
- [ ] 6.3 Run anonymous status-only production MCP probes for Starboard, High Signal, Significant Hobbies public, and Research Papers public exports.
- [ ] 6.4 Run credential-injected status-only production MCP probes for Reader and Calorie without retaining record bodies; keep Setline pending until a real owner sign-in permits safe token issuance.
- [ ] 6.5 Add each ready Streamable HTTP route to ChatGPT desktop/Codex one at a time, preserving independent names, enablement, and revocation.

## 7. Evaluate and record acceptance

- [ ] 7.1 Run retained direct, indirect, follow-up, empty, invalid, degraded, cross-app, privacy-boundary, and mutation prompts for every activated connection.
- [ ] 7.2 Verify disabling or revoking one connection leaves all other connections operational.
- [ ] 7.3 Record readiness separately for source, protocol, authentication, deployment, local-client registration, and ChatGPT developer-mode web registration.
- [ ] 7.4 Update the operator matrix and production validation receipt, including CodeVetter consent-pending repositories, Setline's owner-account gate, Research Papers' hosted subset, and all deferred products.
- [ ] 7.5 Update affected `PROJECT_STATUS.md` files only with shipped product truth, merge reviewed pull requests using `Closes #289`, archive the OpenSpec change, and retain the Fleet skill-run receipt.
