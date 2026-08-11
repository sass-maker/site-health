## 1. Confirm the phase-one inventory and gates

- [x] 1.1 Create the Fleet Workspace tracking issue and preserve the completed `expose-fleet-apps-to-chatgpt` change as historical implementation evidence.
- [x] 1.2 Classify existing sources: CodeVetter local; Reader, Calorie, Anime List, and Setline hosted personal; Starboard, High Signal, Significant Hobbies public, and Research Papers public exports hosted public.
- [x] 1.3 Record explicit deferrals for Indulge/device-only data, Significant Hobbies private records, Research Papers full local-corpus hosting, general multi-user product linking, mutations, public directory submission, and blanket Secure MCP tunnels.
- [x] 1.4 Run `code-cleanup` against the shared helper before any dependency or lockfile edit and record the Cloudflare/MCP runtime compatibility decision.
- [x] 1.5 Run the Cloudflare Workers architecture and production-practice review before writing or configuring the hosted transport.
- [x] 1.6 Re-run the dependency gate for Cloudflare's maintained OAuth provider, document why the production dependency was required, and obtain explicit approval before adding it; retain this as historical evidence for the implementation WorkOS now supersedes.
- [x] 1.7 Verify WorkOS AuthKit's MCP compatibility and free-tier boundary, record the hosted-domain and paid-feature exclusions, and obtain explicit owner approval to use it only while the resulting cost is zero.

## 2. Activate the existing CodeVetter local MCP

- [x] 2.1 Verify the installed `codevetter-mcp` binary, local database, currently indexed repositories, and current enabled-scope count without reading unrestricted record bodies.
- [ ] 2.2 Require CodeVetter's existing in-app **Settings → Agent MCP** enable action for each selected repository; do not create or enable repository scopes directly in SQLite.
- [ ] 2.3 Add each enabled generated STDIO configuration to Codex with a unique stable connection name; do not register local-only MCPs in ChatGPT web.
- [ ] 2.4 Run MCP initialize, tool/resource discovery, one bounded graph/history call, revocation behavior, and secret/path-redaction checks against every enabled repository.

## 3. Activate Anime List's existing hosted MCP

- [x] 3.1 Re-verify production initialize and tool discovery on Anime List's native `/api/mcp` endpoint without retaining private response bodies.
- [x] 3.2 Put the native Streamable HTTP endpoint behind the owner-only OAuth gateway for ChatGPT web, using its PAT only from a product-specific Worker secret.
- [ ] 3.3 Test anonymous catalog calls, OAuth-protected owner watchlist isolation, invalid/revoked OAuth and upstream authentication, mutation absence, and ChatGPT app disablement.

## 4. Add the shared Cloudflare Streamable HTTP transport

- [x] 4.1 Refactor shared tool registration and handlers so the existing STDIO entrypoints and a web-standard request-scoped transport reuse one implementation.
- [x] 4.2 Add a fixed product-route registry for Reader, Calorie, Setline, Starboard, High Signal, Significant Hobbies public, and Research Papers public-export modes.
- [x] 4.3 Ensure initialization on one route advertises only that product's identity, instructions, resources, prompts if any, and read-only tool catalog.
- [x] 4.4 Replace the Cloudflare Access-backed OAuth bridge with WorkOS AuthKit as the authorization server; publish protected-resource metadata, retain a compatibility discovery proxy, and document the CIMD, DCR, permission, and exact Resource Indicator settings that activation task 6.2 must verify.
- [x] 4.5 Resolve private product credentials only from matching Worker secrets after OAuth authorization; never accept or expose a product PAT through ChatGPT.
- [x] 4.6 Keep public routes credential-free and restrict Research Papers hosting to approved export-backed tools with explicit retrieval mode and freshness.
- [x] 4.7 Add bounded protocol errors, CORS/origin behavior required by supported clients, conservative public caching, no-store private responses, and secret-safe observability.
- [x] 4.8 Add Anime List as a fixed OAuth-authorized native MCP proxy without creating arbitrary upstream URL, method, header, or body controls.
- [x] 4.9 Advertise exact `securitySchemes` and OAuth scopes per private tool while keeping public tools explicitly `noauth`.
- [x] 4.10 Validate WorkOS JWTs against its JWKS on every private request, including signature, issuer, exact route audience, expiry, allowlisted owner `sub`, and product-read permission; require `offline_access` for refresh continuity.
- [x] 4.11 Remove the superseded custom authorization endpoints, Cloudflare Access identity bridge, Worker-owned OAuth token state, OAUTH KV binding, and `@cloudflare/workers-oauth-provider` dependency after the dependency cleanup gate confirms they are unused.

## 5. Prove protocol, privacy, and isolation

- [x] 5.1 Add Worker-runtime tests for initialize, tools/list, tool calls, invalid protocol input, unsupported routes, timeouts, and bounded responses on the shared transport.
- [x] 5.2 Add concurrency tests proving OAuth contexts, product-secret selection, and results cannot leak across private requests or products.
- [x] 5.3 Re-run mutation-absence, arbitrary-transport rejection, annotations, output-schema, pagination, redaction, degraded-mode, and upstream-validation tests across every hosted route.
- [ ] 5.4 Run the credential-free WorkOS/gateway activation verifier plus live OAuth discovery, CIMD/DCR, PKCE, audience, owner-allowlist, permission, refresh, and revocation tests; then run the shared helper check, strict OpenSpec validation, Cloudflare local-worker smoke tests, and MCP Inspector against local CodeVetter and every hosted ChatGPT route.

## 6. Deploy and connect eligible Cloudflare routes

- [x] 6.1 Register the helper as one Fleet Worker surface, add path-scoped CI, and make the manual deploy command fail closed on clean/synced `main`, component-current green CI, and an exact 40-character Git SHA tag.
- [ ] 6.2 Run the Fleet deployment guard and pre-deployment activation verifier; verify the exact reviewed commit, WorkOS hosted-domain issuer, owner user ID allowlist, CIMD/DCR settings, exact Resource Indicators, free-tier cost gate, product-secret names without values, rollback path, and Cloudflare project ownership.
- [ ] 6.3 Deploy the shared Worker through the manual path with the exact 40-character Git SHA tag and verify 100% production traffic on that tagged version.
- [ ] 6.4 Run anonymous status-only production MCP probes for Starboard, High Signal, Significant Hobbies public, and Research Papers public exports.
- [ ] 6.5 Run OAuth-authenticated status-only production MCP probes for Reader, Calorie, and Anime List without retaining record bodies; keep Setline pending until a real owner sign-in permits safe token issuance.
- [ ] 6.6 Create each ready hosted route as an independent ChatGPT web developer-mode app, complete OAuth linking where required, scan tools, and preserve independent enablement and revocation.

## 7. Evaluate and record acceptance

- [ ] 7.1 Run retained direct, indirect, follow-up, empty, invalid, degraded, cross-app, privacy-boundary, and mutation prompts for every activated connection.
- [ ] 7.2 Verify disabling or revoking one connection leaves all other connections operational.
- [ ] 7.3 Record readiness separately for source, protocol, OAuth/public authentication, deployment, Codex-local registration, and ChatGPT web developer-mode registration.
- [ ] 7.4 Update the operator matrix and production validation receipt, including CodeVetter consent-pending repositories, Setline's owner-account gate, Research Papers' hosted subset, WorkOS's zero-cost activation conditions, and all deferred products.
- [ ] 7.5 Update affected `PROJECT_STATUS.md` files only with shipped product truth, merge reviewed pull requests using `Closes #289`, archive the OpenSpec change, and retain the Fleet skill-run receipt.
