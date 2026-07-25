# ai-visibility Specification

## Purpose

Define the framework-independent AI visibility engine, bounded execution,
analysis, product parity, and portfolio measurement contracts.

## Requirements

### Requirement: Framework-independent AI visibility package

`@saas-maker/ai-visibility` SHALL expose typed, framework-independent execution
and analysis contracts without owning HTTP routes, persistence, credentials,
auth, schedules, or UI.

#### Scenario: High Signal executes a mention check

- **WHEN** High Signal supplies brand configuration, prompts, provider adapters,
  persistence callbacks, and execution policy
- **THEN** the package returns normalized results and aggregates without
  importing High Signal's D1 or API implementation

#### Scenario: Foundry executes a portfolio check

- **WHEN** Foundry supplies registry identity, prompts, provider adapters,
  ledger callbacks, and execution policy
- **THEN** the same package produces contract-equivalent normalized results

### Requirement: Mention and recommendation analysis

The package SHALL distinguish brand mention, citation, recommendation, rank,
sentiment, competitor mention, and judge confidence.

#### Scenario: Brand is named but explicitly rejected

- **WHEN** a response mentions the brand in a negated or non-recommended context
- **THEN** mention status remains distinct from recommendation and sentiment

#### Scenario: AI judge is unavailable

- **WHEN** the optional judge adapter is absent or fails
- **THEN** the deterministic analyzer returns a labeled fallback result rather
  than silently representing it as an AI-judged result

### Requirement: Citation and competitor aggregation

The package SHALL normalize citations and compute per-provider, per-persona,
competitor share-of-voice, visibility, recommendation, and ranking aggregates
from completed results.

#### Scenario: Some configured providers are unavailable

- **WHEN** one or more providers are not configured, time out, or fail
- **THEN** aggregates disclose coverage and exclude unavailable attempts from
  completed-result denominators

### Requirement: Bounded execution and cost receipts

Every execution SHALL enforce declared prompt, persona, provider, call,
concurrency, timeout, retry, cache, and cost limits.

#### Scenario: Run would exceed its call ceiling

- **WHEN** the expanded prompt-provider-persona matrix exceeds the configured
  maximum calls
- **THEN** execution fails closed before provider requests begin

#### Scenario: Cached result is reusable

- **WHEN** the brand, prompt, provider, model, persona, and analyzer fingerprint
  match an unexpired cached result
- **THEN** the package reuses it and records zero new provider calls

### Requirement: High Signal behavior parity

High Signal SHALL pass frozen Mention contract fixtures through the extracted
package before its duplicated engine is removed.

#### Scenario: Extracted package changes a fixture result

- **WHEN** package output differs from an approved current result
- **THEN** migration stops until the difference is accepted as a deliberate
  contract change or corrected

### Requirement: Foundry portfolio AI visibility

Foundry SHALL configure AI visibility by canonical project and retain normalized
history sufficient to compare visibility, citations, recommendation, rank, and
competitor share over time.

#### Scenario: Manual project canary completes

- **WHEN** the owner runs an approved bounded check for one project
- **THEN** Foundry records coverage, normalized aggregates, evidence links,
  observed cost, and recommended actions in Marketing without activating a
  recurring schedule

#### Scenario: Project is ignored

- **WHEN** an ignored registry entry is considered for a Fleet run
- **THEN** no check is scheduled or executed without explicit reactivation
