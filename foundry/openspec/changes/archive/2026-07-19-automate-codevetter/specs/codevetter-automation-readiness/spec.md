## ADDED Requirements

### Requirement: Privacy-safe product evidence
CodeVetter MUST NOT transmit reviewed code, repository content or identity,
prompts, findings, file paths, user API keys, or local database contents as
fleet analytics or logs.

#### Scenario: Review completes
- **WHEN** activation evidence is recorded for a completed review
- **THEN** it contains only a sanitized event/time/version outcome and no review
  payload or repository identifier

### Requirement: Landing and download funnel
The public surface SHALL expose build/live/indexing plus acquisition and primary
download-intent evidence tied to the canonical domain and deployed revision.

#### Scenario: Landing deploy is stale
- **WHEN** the live revision differs from the expected source evidence
- **THEN** Foundry reports stale deployment rather than healthy automation

### Requirement: Desktop release contract
Every release candidate MUST pass TypeScript, Rust, unit/e2e, Tauri build,
artifact, updater-manifest, signing/notarization evidence where applicable, and
rollback/version evidence before release approval.

#### Scenario: Updater manifest references missing artifact
- **WHEN** a release artifact cannot be resolved from the updater manifest
- **THEN** release readiness fails even if CI compilation passed

### Requirement: Scheduled canary freshness
The weekly canary MUST expose last run, success/failure, bounds, timeout, source
revision, and unresolved failure evidence.

#### Scenario: Canary misses its freshness window
- **WHEN** no successful canary occurs within the declared interval
- **THEN** Foundry reports it stale and does not infer desktop health

### Requirement: Foundry handoff
Automation SHALL produce sanitized release/health receipts and MAY prepare a
corrective PR, but MUST NOT publish a release or alter product direction without
explicit approval.

#### Scenario: Corrective patch is green
- **WHEN** automated checks verify a narrow fix
- **THEN** the receipt reports the PR and pending release approval without
  deploying or publishing
