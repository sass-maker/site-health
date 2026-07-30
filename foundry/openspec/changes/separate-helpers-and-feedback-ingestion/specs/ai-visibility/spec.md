## MODIFIED Requirements

### Requirement: Framework-independent AI visibility package

The AI Visibility Helper SHALL expose
`@saas-maker/ai-visibility` as a typed, framework-independent execution and
analysis library without owning HTTP routes, persistence, credentials, auth,
schedules, or UI. Its installable library contract does not classify it as a
shared public package in the Foundry product model.

#### Scenario: High Signal executes a mention check

- **WHEN** High Signal supplies brand configuration, prompts, provider adapters,
  persistence callbacks, and execution policy
- **THEN** the helper returns normalized results and aggregates without
  importing High Signal's D1 or API implementation

#### Scenario: Foundry executes a portfolio check

- **WHEN** Foundry supplies registry identity, prompts, provider adapters,
  ledger callbacks, and execution policy
- **THEN** the same helper produces contract-equivalent normalized results
