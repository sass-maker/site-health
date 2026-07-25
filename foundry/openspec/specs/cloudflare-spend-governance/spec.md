# cloudflare-spend-governance Specification

## Purpose
Define the read-only Fleet contract for detecting Cloudflare spend, separating
confirmed charges from exposure, judging project necessity, and recommending
safe optimizations from current provider and repository evidence.
## Requirements
### Requirement: Current Cloudflare billing authority
The skill MUST retrieve current Cloudflare pricing, limits, usage-billing
documentation, relevant billing changelog entries, and API schemas before it
quotes a threshold, projected charge, or savings amount.

#### Scenario: Pricing is available
- **WHEN** a metered Cloudflare product is present in the audit scope
- **THEN** the report cites current provider pricing and records when it was retrieved

#### Scenario: Pricing retrieval fails
- **WHEN** current provider pricing or billing rules cannot be retrieved
- **THEN** the skill inventories exposure but does not quote prices, thresholds, projected charges, or savings

#### Scenario: Announced billing change
- **WHEN** Cloudflare has announced a future billing start date or pricing change for a product in scope
- **THEN** the report separates current-cycle status from the future effective-date risk

### Requirement: Fixed and usage-based spend separation
The skill MUST assess fixed recurring subscriptions separately from
usage-based charges and MUST NOT treat the usage dashboard as a complete invoice.

#### Scenario: Usage overage is zero but a paid plan exists
- **WHEN** invoice-aligned usage data shows no overage and subscription evidence shows a fixed recurring plan
- **THEN** the report states that the account is paying now and itemizes the fixed fee separately

#### Scenario: Cost-bearing usage record
- **WHEN** provider billing evidence contains a positive billed or effective cost
- **THEN** the report classifies the corresponding account or product as `paying-now`

### Requirement: Layered evidence and uncertainty
The skill MUST distinguish money evidence, runtime usage evidence, and static
configuration exposure, and MUST preserve missing or stale evidence explicitly.

#### Scenario: Configured binding without runtime evidence
- **WHEN** tracked configuration declares a billable resource but no current usage or billing evidence is available
- **THEN** the skill reports spend exposure and does not claim current charges or zero usage

#### Scenario: Billing permission is unavailable
- **WHEN** a billing API returns an authentication, permission, or restricted-access error
- **THEN** the skill stops retrying that surface, marks monetary status `unknown`, and provides an exact Billable Usage dashboard handoff

#### Scenario: Cost fields are absent
- **WHEN** a usage API returns consumption records without populated cost fields
- **THEN** the skill reports metered consumption separately and does not coerce the missing values to zero

### Requirement: Evidence-based spend state
The skill SHALL classify each auditable account, product, or project as
`paying-now`, `likely-this-cycle`, `watch`, `unlikely-on-current-evidence`, or
`unknown`, with a separate `low`, `watch`, or `high` exposure risk, confidence
level, and evidence age.

#### Scenario: Current charge is confirmed
- **WHEN** a fixed subscription or positive usage charge is confirmed
- **THEN** the spend state is `paying-now` with high-confidence monetary evidence

#### Scenario: Usage approaches a current allowance
- **WHEN** current billing-cycle usage and current pricing establish a credible path to overage
- **THEN** the spend state is `likely-this-cycle` and the calculation inputs are shown

#### Scenario: Usage is comfortably within a known fail-closed free limit
- **WHEN** the plan, current usage, reset period, and provider rules are all known and remain comfortably within the current free allowance
- **THEN** the spend state may be `unlikely-on-current-evidence` without implying a permanent guarantee

#### Scenario: Billing is unknown but exposure exists
- **WHEN** consequential billing or plan evidence is unavailable and configured or runtime evidence shows a metered surface
- **THEN** monetary spend state remains `unknown` while exposure risk is reported separately

### Requirement: Project attribution and necessity
The skill MUST use the canonical Fleet registry and current project lifecycle
context to attribute provider evidence and judge whether usage serves an active
need.

#### Scenario: Provider resource maps to one project
- **WHEN** a script, zone, bucket, database, namespace, queue, workflow, or domain uniquely matches a Fleet project
- **THEN** the report attributes that evidence to the project and cites the mapping

#### Scenario: Provider usage is shared or unattributed
- **WHEN** provider evidence lacks a unique project-level resource key
- **THEN** the report keeps the cost account-level rather than allocating it proportionally

#### Scenario: Active product uses a paid resource
- **WHEN** a cost-bearing resource supports a shipped or planned capability in an active project
- **THEN** the necessity decision is not `pause-candidate` solely because the resource has low traffic or non-zero cost

#### Scenario: Inactive resource lacks a current purpose
- **WHEN** a cost-bearing or materially exposed resource maps to an ignored, retired, or unowned surface with no current product requirement
- **THEN** the report marks it `pause-candidate` and lists the verification needed before any separate cleanup action

### Requirement: Safe optimization recommendations
The skill MUST provide specific optimization recommendations without mutating
Cloudflare or production configuration.

#### Scenario: Optimization is supported by evidence
- **WHEN** current usage, billing dimensions, and project behavior identify avoidable work or storage
- **THEN** the report names the exact resource, cost driver, expected trade-off, verification step, and evidence-backed savings range when calculable

#### Scenario: Savings are negligible or unquantified
- **WHEN** an optimization would add complexity without a material supported saving
- **THEN** the report recommends keeping the simpler implementation or gathering more evidence

#### Scenario: User requests an audit
- **WHEN** the skill completes a spend audit
- **THEN** it performs no deploy, delete, pause, subscription, alert, credential, migration, or production-config mutation

### Requirement: Credential-free deterministic helpers
Fleet helper scripts SHALL use only tracked project metadata or explicit
sanitized input and SHALL not retrieve or expose Cloudflare credentials.

#### Scenario: Scan Fleet configuration
- **WHEN** the cost-surface scanner runs from a Fleet checkout
- **THEN** it emits deterministic project/resource exposure records from tracked configuration and labels them as non-usage evidence

#### Scenario: Normalize billable usage
- **WHEN** the normalizer receives valid FOCUS-style Cloudflare usage JSON
- **THEN** it groups compatible product and metric records, preserves units and missing cost fields, and emits stable JSON

#### Scenario: Credentials are absent
- **WHEN** either helper runs without Cloudflare environment variables or token files
- **THEN** it still completes because it makes no provider request and reads no credential source

### Requirement: Decision-first report
The skill SHALL lead with the owner's financial outcome and provide a compact
evidence table before detailed optimization notes.

#### Scenario: Audit has complete evidence
- **WHEN** billing, usage, pricing, and project mappings are available
- **THEN** the report shows overall spend state, fixed fees, usage charges, likely next charge, and project decisions with confidence

#### Scenario: Audit has evidence gaps
- **WHEN** one or more required evidence layers are unavailable
- **THEN** the report lists what is known, what remains unknown, and the smallest exact step needed to resolve each consequential gap
