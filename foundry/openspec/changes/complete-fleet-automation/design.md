## Context

The fleet attention model names 37 entries. Twenty-five are operationally in
scope: four My Work products, fifteen Toolbox projects, and six Foundry
components. Nine Ignored and three Removed entries intentionally receive no
routine automation.

Today, useful pieces already exist: repository CI, production smoke checks,
Cloudflare resilience auditing, site-health, GEO observations, a marketing
control plane, Codex cron, durable notifications, and Foundry dashboards. The
gap is not another monitoring product. The gap is a single contract and
coverage view proving that each in-scope entry has the right evidence for its
runtime and attention class, and that automated actions are bounded and
verified.

The closure deadline is 2026-07-19. Most products should require little future
maintenance, so the design optimizes for central adapters, quiet operation,
small recurring cost, and clear human decision points rather than exhaustive
instrumentation or autonomous feature development.

## Goals / Non-Goals

**Goals:**

- Produce a complete, machine-readable coverage matrix for all 25 in-scope
  entries.
- Reuse existing GitHub, Cloudflare, product, site-health, marketing, and local
  automation signals through one normalized evidence model.
- Define minimum telemetry by runtime and attention class, with accepted
  exceptions where a signal has no value.
- Make every recurring automation bounded, idempotent, observable, portable,
  and attributable to a durable receipt.
- Let Foundry identify failures, prepare work, run explicitly safe actions, and
  verify results while preserving Sarthak's approval over consequential acts.
- Keep Toolbox projects usable and quietly discoverable without creating
  standing product obligations.
- End with one closure report that distinguishes complete coverage, accepted
  exceptions, external blockers, and deferred enhancements.

**Non-Goals:**

- Installing PostHog, Sentry, OpenTelemetry, or another vendor in every project.
- Building a centralized log warehouse when Cloudflare/GitHub/local evidence is
  sufficient.
- Autonomous product strategy, feature creation, public claims, paid
  acquisition, production deployment, migration, DNS, credentials, deletion,
  or rate-limit changes.
- Instrumenting Ignored or Removed entries.
- Rewriting healthy products or normalizing all stacks.
- Completing speculative GEO crawler telemetry or other phase-two ideas unless
  required for the minimum closure contract.

## Decisions

### 1. Separate identity, attention, runtime, and automation mode

The canonical deploy inventory remains `fleet-ops/config/projects.json`; the
human attention model remains `fleet-ops/docs/project-tiers.md`. The automation
registry references those identities and adds only automation-specific fields:
runtime type, minimum contract, evidence sources, action policy, alert policy,
and accepted exceptions.

This avoids turning one `tier` value into an overloaded source for product
priority, deployment state, and automation behavior.

**Alternative considered:** replace `projects.json` with a new registry. This
would create migration risk and immediate drift, so it is rejected.

### 2. Contract by runtime, policy by attention class

Runtime determines which evidence is technically meaningful:

- Public surface: build, canonical live probe, page/CTA/activation signal,
  indexing evidence, and client error signal where interaction warrants it.
- API/Worker: build, health probe, structured request/error logs, latency/error
  signal, deployment evidence, and cost/resource visibility where available.
- Background job: start/success/failure/retry/freshness, bounded input/runtime,
  concurrency control, idempotency, and durable unresolved failure state.
- Desktop/mobile app: build/release evidence, crash/error signal, privacy-safe
  activation signal where useful, and update/distribution status.

Attention class determines how evidence is used:

- My Work: full evidence and recommendations; Sarthak directs the product.
- Toolbox: minimum usability plus ambient discoverability and bounded
  experiments; no product roadmap automation.
- Foundry + Helpers: deepest operational evidence because automation depends on
  it; treat helpers as one factory workstream.
- Ignored/Removed: no recurring evidence collection or actions.

**Alternative considered:** one universal event schema and SDK. This would be
slow, invasive, and mostly noise across different runtimes, so it is rejected.

### 3. Central evidence adapters before repository instrumentation

Foundry adapters first consume existing GitHub Actions, Cloudflare deployment
and observability data, live smoke results, site-health reports, GEO ledger,
marketing receipts, and local cron receipts. A product repository changes only
when a critical requirement cannot be proven centrally—for example, a
background job with no success/failure lifecycle signal.

This keeps diffs small and lets the one-day baseline cover the whole fleet.

### 4. Normalize evidence, not raw private data

Every adapter produces a sanitized evidence envelope with:

- project/surface identity;
- evidence type and source;
- observation time and freshness window;
- pass, fail, stale, blocked, accepted-exception, or not-applicable status;
- severity and concise evidence reference;
- source revision/deployment when available;
- next action and whether approval is required.

Raw logs, user content, emails, prompts, credentials, unpublished marketing
content, and private analytics payloads remain in their source systems.

### 5. Use snapshots for the dashboard

The Fleet Dashboard reads last-known-good sanitized snapshots. It does not fan
out to every provider on page load. Refresh commands run separately, retain the
previous snapshot on failure, and visibly mark stale dimensions.

This reduces latency, credential exposure, provider coupling, and the chance
that a dashboard failure takes down automation.

### 6. Define explicit action levels

- **Observe:** read and normalize evidence; always allowed when credentials are
  already configured.
- **Propose:** create/update a task, recommendation, draft, or narrow patch;
  allowed within scope.
- **Execute-safe:** retry an idempotent job, refresh a snapshot, submit indexing,
  or run an approved bounded experiment; allowed only when the registry marks
  the action safe and verification is defined.
- **Approve-required:** deploy production, migrate, change DNS/credentials/rate
  limits, delete state, publish a new public claim, or expand product scope.

Every executed action creates a receipt and runs its declared verification. A
failed verification stays unresolved and cannot be reported as success.

### 7. Fail quiet for routine state and loud for actionable risk

Notifications are deduplicated and severity-aware. Routine success is history
or digest material. Immediate notification is reserved for data/security/cost
risk, Foundry control-plane failure, prolonged My Work outage, or an action that
failed after bounded retries. Toolbox regressions appear in a digest unless
they indicate security or data risk.

### 8. Toolbox marketing is an expiring experiment

Each experiment has a hypothesis, project, canonical destination, approved
asset/source, channel, attribution key, start/expiry, budget, success metric,
and stop rule. Missing attribution or expiry blocks launch. Automation may
prepare and measure; existing review/publishing approvals remain authoritative.

### 9. Automation must be portable and self-reporting

Versioned schedules and commands use repository-relative paths or an explicit
Fleet root, never a stale user-specific checkout. Installation status, last
run, next run, exit state, log/receipt location, and notification delivery are
visible from one health command.

### 10. Closure is evidence-based, not feature-count-based

The program is complete when the coverage audit is green for every required
contract or records a named accepted exception/external blocker with no false
claim of automation. Nice-to-have dashboards, vendor integrations, and richer
analytics may remain deferred.

## Risks / Trade-offs

- **False green from shallow probes** → Require runtime-specific evidence and
  background-job freshness rather than homepage-only checks.
- **One-day scope explosion** → Build central adapters and patch repositories
  only for critical unobservable paths.
- **Alert fatigue** → Deduplicate, digest routine state, and page only defined
  actionable severity.
- **Privacy leakage** → Store sanitized evidence references, never raw product
  payloads or secrets, in Foundry snapshots.
- **Local-machine scheduler dependence** → Make install/heartbeat status
  visible; record external blockers rather than pretending local cron is
  durable cloud execution.
- **Provider or credential unavailability** → Retain last-known-good evidence,
  mark it stale/blocked, and fail closed for actions.
- **Toolbox marketing creates work** → Require expiry, attribution, review-debt
  backpressure, and automatic stop rules.
- **Foundry consolidation couples unrelated runtimes** → Consolidate ownership
  and control contracts first; preserve independently deployable helpers where
  technically useful.
- **Manual approval reduces autonomy** → Accept this deliberately: automation
  prepares evidence and work, while irreversible/public decisions remain
  human-controlled.

## Migration Plan

1. Freeze the 2026-07-19 attention lists and define the 25-entry in-scope
   coverage registry.
2. Run a baseline audit using existing CI, deploy, resilience, live, site-health,
   analytics, cron, and marketing evidence.
3. Implement missing central adapters and the normalized evidence report.
4. Patch only critical project-local gaps, split into independent repository
   work packets suitable for parallel agents.
5. Correct portable schedule configuration and verify installed/runtime health
   without exposing credentials.
6. Re-run the coverage audit; classify every gap as fixed, accepted exception,
   external blocker, or deferred non-critical enhancement.
7. Produce the dated closure report and make the Fleet Dashboard consume its
   sanitized snapshot.
8. Keep production deploys as explicit follow-up actions after repository CI and
   local verification pass.

Rollback is additive: disable the new schedules/adapters, retain the previous
last-known-good snapshot, and continue using the existing source systems. No
product data migration is required by this design.

## Open Questions

- Which existing analytics source is authoritative per product where more than
  one is present? Resolve from current code during baseline rather than mandate
  a fleet-wide vendor.
- Which local schedules should move to a durable cloud runner later? Record
  machine dependence today; migration is not required for closure unless a
  critical Foundry function has no heartbeat or recovery path.
- Which Toolbox activation event is meaningful per product? Allow an explicit
  not-applicable decision for static/informational surfaces rather than invent
  vanity events.
