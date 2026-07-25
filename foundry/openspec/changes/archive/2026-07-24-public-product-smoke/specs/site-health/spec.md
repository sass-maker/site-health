## ADDED Requirements

### Requirement: Public product journey routing

The `site-health` parent skill SHALL route requests about public usability,
click-through behavior, guest journeys, blank pages, broken navigation, and
primary product actions to the `public-product-smoke` subskill.

#### Scenario: Public usability request

- **WHEN** a user asks whether every Fleet website works for public users and
  requests that an agent click around
- **THEN** `site-health` loads the public product smoke protocol without loading
  unrelated SEO, performance, or agent-readiness protocols
