## MODIFIED Requirements

### Requirement: Portfolio navigation follows owner questions

Fleet Console SHALL expose Domains, Google Search, AI Awareness, Performance,
and Product Analytics under a visible Metrics group. It SHALL expose Growth and
Marketing under a separate visible Growth group, with Projects and Feedback
remaining standalone owner views. System topology, crawlability, agent
readiness, design critique, skill history, and other detailed evidence SHALL
remain secondary diagnostics. Project scope SHALL persist only on views whose
contracts support it.

#### Scenario: Operator uses primary navigation

- **WHEN** the operator opens the Fleet Console navigation
- **THEN** Domains, Google Search, AI Awareness, Performance, and Product
  Analytics appear under Metrics
- **AND** Growth and Marketing appear under Growth
- **AND** Projects and Feedback remain directly available outside those groups

#### Scenario: Operator follows an old Metrics link

- **WHEN** the operator opens `/metrics`
- **THEN** the Console redirects to Domains without losing a valid project scope
