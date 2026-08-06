## ADDED Requirements

### Requirement: Visibility remediation states preserve operational boundaries

Fleet SHALL distinguish source-complete, deployment-pending,
content-approval-pending, provider-unobserved, and externally-observed states
when reporting GEO remediation.

#### Scenario: Source fix is merged but live origin is stale

- **WHEN** source validation passes and the live origin still serves the prior behavior
- **THEN** the project is reported as deployment-pending
- **AND** the source change is not described as a live visibility improvement

#### Scenario: External observation follows deployment

- **WHEN** a production deployment is independently verified and a later comparable observation records the outcome
- **THEN** Fleet may move the project into externally-observed state
- **AND** it retains the source revision, deployment evidence, and observation timestamp
