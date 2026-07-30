## 1. Safety and Tracking

- [x] 1.1 Create the Fleet Workspace GitHub issue for the public automation extraction and link this OpenSpec change.
- [x] 1.2 Complete redacted full-history, tracked-path, issue, pull-request, workflow artifact, and visibility audits for the six repositories approved for public access.
- [x] 1.3 Resolve false positives, third-party notice gaps, and stale private-visibility documentation for every repository that passed the audit.

## 2. Public Automation Repository

- [x] 2.1 Create public `sass-maker/workflows` with Fleet-standard `AGENTS.md`, `PROJECT_STATUS.md`, README, ignore rules, and no implied project-wide open-source license.
- [x] 2.2 Add a strict allowlisted public-site manifest schema plus deterministic privacy and drift validation.
- [x] 2.3 Implement and test bounded public URL availability, redirect, latency, and sanitized-report generation.
- [x] 2.4 Implement and test the bounded public performance sweep without private Fleet source or credentials.
- [x] 2.5 Add SHA-pinned, least-privilege CI and weekly/manual audit workflows with explicit timeouts and concurrency.
- [x] 2.6 Push the public repository and verify CI plus one manual execution of each standalone audit. The manual audit mechanism passed; its product gate correctly reported the current `karte.cc` DNS failure.

## 3. Fleet Submodule Integration

- [x] 3.1 Add `sass-maker/workflows` as the pinned `foundry/ops/workflows` git submodule.
- [x] 3.2 Generate the module's site manifest from Fleet's privacy-checked public projection and add a parent-side privacy/drift check.
- [x] 3.3 Update clone/setup, workflow policy, capability discovery, README, and `PROJECT_STATUS.md` documentation for the public module boundary.
- [x] 3.4 Remove or disable only the superseded private scheduled jobs after the matching public runs pass; retain private provider and source checks.
- [x] 3.5 Run Fleet's smallest relevant policy, generation, OpenSpec, and git-diff validations.

## 4. Approved Repository Visibility

- [x] 4.1 Update durable status wording and required third-party notices in Setline, Protein Index, Motion, India Standards, and Mashup.
- [x] 4.2 Commit and push those five repositories' public-readiness documentation without including unrelated local changes.
- [x] 4.3 Change those five repositories to public and verify default branch, issues, pull requests, Actions, secret scanning, and push protection.
- [ ] 4.4 Decide the clean-history publication path for SaaS Ideas. Its current git history can restore a deleted Starter Story scrape that the repository itself records as a licensing and terms-of-service risk, so the existing repository must remain private until the owner chooses a clean public replacement.

## 5. Completion

- [x] 5.1 Confirm `fleet-workspace` remains private and no public workflow can read private Fleet source.
- [ ] 5.2 Archive the completed OpenSpec change, update only durable shipped Fleet status, and close the linked GitHub issue.
