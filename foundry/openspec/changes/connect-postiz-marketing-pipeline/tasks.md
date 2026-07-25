## 1. Remove obsolete control-plane coupling

- [x] 1.1 Remove SaaS Maker task, marketing, Symphony, and `fnd` reads from Fleet runtime code and UI
- [x] 1.2 Remove or disable obsolete wrappers, cron entries, and launch-service startup paths that target the deleted queue
- [x] 1.3 Remove obsolete Reel Pipeline SaaS Maker queue clients, commands, tests, and active documentation
- [x] 1.4 Add a regression check that prevents active Fleet runtime code from reintroducing retired repository and queue boundaries

## 2. Postiz adapter

- [x] 2.1 Add a dependency-free Postiz Public API client with injected base URL, API key, fetch, timeout, and bounded error normalization
- [x] 2.2 Add explicit brand-channel-to-integration mapping validation and integration discovery checks
- [x] 2.3 Add stable HTTPS media upload and provider-specific Instagram Reel and YouTube Short draft translation
- [x] 2.4 Add deterministic request identity, ambiguous-create handling, and reconciliation without blind retries
- [x] 2.5 Add publication-state and analytics reads that produce sanitized package-attributed receipts

## 3. Fleet marketing runtime

- [x] 3.1 Keep generation packages and media receipts in Fleet-owned local storage independent of Postiz availability
- [x] 3.2 Make the machine marketing service create drafts only and require Postiz owner action for schedule or publication
- [x] 3.3 Replace social readiness checks with Postiz API and exact integration-mapping readiness
- [x] 3.4 Update the Fleet marketing page to show truthful source, render, Postiz, publication, and measurement state without task or unpublished-content leakage

## 4. Verification and machine cutover

- [x] 4.1 Add fixture tests for integrations, media upload, Instagram/YouTube payloads, draft creation, authentication, timeouts, ambiguous failures, and analytics
- [x] 4.2 Run Reel Pipeline tests, Fleet tests, console build, runtime-boundary audit, and strict OpenSpec validation
- [ ] 4.3 Install a pinned official Postiz release on the designated machine with durable storage, backup, restart, and health checks
- [ ] 4.4 Protect the Postiz hostname with Cloudflare Access, connect exact brand accounts, and keep credentials in the machine secret store
- [ ] 4.5 Run a draft-only production canary for one brand and verify no post was scheduled or published
- [ ] 4.6 After explicit canary acceptance, enable the recurring draft generator and record the final topology in PROJECT_STATUS.md
