# cloudflare-resilience Specification

## Purpose
TBD - created by archiving change cloudflare-resilience-control-plane. Update Purpose after archive.
## Requirements
### Requirement: complete manifest reconciliation

The audit MUST validate the canonical manifest and report duplicate domains,
unowned live surfaces, missing repositories, invalid deploy kinds, and stale
Cloudflare inventory as separate findings.

#### Scenario: duplicate domain

- **WHEN** two in-scope manifest entries claim the same canonical hostname
- **THEN** the audit exits non-zero and names both owners and the remediation

#### Scenario: intentional exception

- **WHEN** a surface is marked non-product or out-of-fleet with a reason
- **THEN** the audit reports it as an exception and does not fail the in-fleet
  result solely because of that surface

### Requirement: safe background-job evidence

The audit MUST identify cron, queue, Workflow, Durable Object alarm, and
scheduled GitHub Actions paths and require evidence of bounded work, timeout,
retry behavior, idempotency/deduplication, failure visibility, and
concurrency/single-flight control, or a named exception.

#### Scenario: unbounded scheduled work

- **WHEN** a scheduled path has no visible batch/page limit or bounded input
- **THEN** the audit reports a high-severity finding with the source file and
  the suggested bound

#### Scenario: retry without idempotency

- **WHEN** a queue or workflow path retries but has no deduplication or stable
  job key evidence
- **THEN** the audit reports a high-severity duplicate-work/data-integrity risk

### Requirement: deploy safety

Every in-scope deployment path MUST expose source-SHA evidence, bounded build
execution, a post-deploy smoke check, and a documented rollback target or
runbook. Preview deployments MUST use Pages previews or same-Worker version
previews, unless teardown is explicit.

#### Scenario: persistent preview Worker

- **WHEN** a workflow deploys a Worker named with `preview` or a PR identifier
  without a cleanup job
- **THEN** the audit fails and points to the workflow and the fleet preview
  policy

#### Scenario: smoke check catches HTTP failure

- **WHEN** a smoke step receives a non-success response
- **THEN** the workflow fails rather than treating the deploy as green

### Requirement: live surface verification

The audit MUST probe every canonical domain and declared health endpoint with a
bounded timeout and record status, redirect chain, final URL, and check time.

#### Scenario: expected API-root 404

- **WHEN** an endpoint is declared as an intentional API root 404
- **THEN** the report records the 404 as an accepted exception and still probes
  its health endpoint

### Requirement: safe evidence handling

The audit MUST never print secret values, authorization headers, credential file
contents, or unredacted environment values.

#### Scenario: credential-shaped output

- **WHEN** a command emits a token-like value
- **THEN** the audit redacts it before writing JSON, Markdown, or CI logs
