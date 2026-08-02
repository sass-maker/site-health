## ADDED Requirements

### Requirement: Performance expansions interpret compatible lab and field evidence

Fleet Console SHALL provide one deterministic interpretation when a project has both desktop lab LCP and Cloudflare real-user p75 LCP, without combining the values into a score.

#### Scenario: Both LCP sources are measured

- **WHEN** the operator expands a Performance project with lab and field LCP evidence
- **THEN** the expansion states whether both pass, both need work, only lab needs work, or only field needs work against the shared 2.5 second threshold
- **AND** it preserves the canonical-page lab scope and host-wide field scope

#### Scenario: One LCP source is unavailable

- **WHEN** either lab or field LCP is not measured
- **THEN** the expansion names the available evidence and does not infer a comparison
