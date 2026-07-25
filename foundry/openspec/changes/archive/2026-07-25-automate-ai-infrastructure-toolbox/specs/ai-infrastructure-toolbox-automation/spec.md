## ADDED Requirements

### Requirement: Auth-safe health verification
Free AI and Knowledge Base MUST expose health evidence that verifies service and
authentication readiness without printing credentials, prompts, completions,
corpus text or retrieved chunks.

#### Scenario: Auth-only probe succeeds
- **WHEN** a metadata/analytics health route proves authorization
- **THEN** automation records success without invoking a paid model or private
  corpus query

### Requirement: Structured API evidence
Requests MUST expose sanitized correlation, surface, provider/operation class,
status, latency and error category while excluding private payloads and headers.

#### Scenario: Provider request fails
- **WHEN** an upstream provider returns an error
- **THEN** the service records provider/error class and bounded retry outcome
  without persisting the request body

### Requirement: Provider cost and degradation
Free AI MUST expose aggregate quota/cost or availability evidence where
available and SHALL distinguish one-provider degradation from total gateway
failure according to existing routing policy.

#### Scenario: One free provider is exhausted
- **WHEN** the provider rejects requests for quota
- **THEN** retries remain bounded and service status reflects degradation or
  fallback rather than an unbounded loop

### Requirement: Background and index lifecycle
All scheduled, queued, ingestion and indexing paths MUST expose bounds, timeout,
concurrency, idempotency/deduplication, retries, freshness and durable unresolved
failure.

#### Scenario: Knowledge index stops refreshing
- **WHEN** freshness exceeds its declared window
- **THEN** Foundry reports the index stale even if the landing page remains live

### Requirement: Storage ownership and recovery
Every D1, KV, R2, vector/index or corpus state dependency MUST identify owner,
authoritative source, backup/export or reconstruction path, migration guard and
last verification status.

#### Scenario: Derived vectors are lost
- **WHEN** vector state is reconstructable
- **THEN** the runbook identifies the source corpus and bounded reindex path

### Requirement: Maintenance-only authority
Automation MUST NOT rotate credentials, change providers, spend, rate limits,
data schemas or production deployment without approval; it may run read-only
checks, prepare PRs and retry registry-approved idempotent work.

#### Scenario: Critical patch is ready
- **WHEN** checks pass
- **THEN** Foundry records the PR and pending deployment approval
