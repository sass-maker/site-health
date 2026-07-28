## MODIFIED Requirements

### Requirement: Operator approval remains authoritative

The control plane SHALL use Foundry's private owner-decision inbox as the
acceptance/rejection system of record for Foundry-owned marketing work, SHALL
NOT auto-accept or execute unapproved content, and MAY execute all unchanged
eligible items after the owner explicitly approves their complete immutable
campaign manifest.

#### Scenario: Review is required

- **WHEN** generated work awaits a decision
- **THEN** the dashboard, owner notification, and mobile brief link to one
  authenticated Foundry Needs me item containing the complete manifest
  identity, hash, evidence, content bodies, destinations, actions, costs, and
  allowed responses

#### Scenario: Approve one complete campaign

- **WHEN** the owner explicitly approves the displayed immutable campaign
  manifest
- **THEN** every unchanged eligible item in that manifest may execute without
  another approval prompt and each result is attached to the originating
  campaign and mission

#### Scenario: Approved campaign changes

- **WHEN** an approved manifest changes content, destination, account, timing,
  cost, repository action, or publish command
- **THEN** the prior approval is invalid and no changed item executes until the
  revised complete manifest is approved

#### Scenario: A pending item ages

- **WHEN** a generated or pending item remains unreviewed past a hold window
- **THEN** no renderer, orchestrator, browser, repository workflow, or
  scheduler changes it to accepted or executes it without an explicit owner
  action
