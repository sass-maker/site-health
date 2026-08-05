## ADDED Requirements

### Requirement: The maker exposes Night Out through existing controls

The Fleet Console Marketing maker SHALL list Night Out in the existing grouped
recipe selector and SHALL use the current progressive input and summary regions
for its asset manifest and rights evidence.

#### Scenario: Operator inspects Night Out
- **WHEN** Night Out is selected
- **THEN** the maker describes its bouncy themed-image output, local runtime, no-API-spend posture, required asset manifest, and current readiness without introducing a parallel editor

#### Scenario: Inputs are complete
- **WHEN** the operator supplies the required manifest path and rights evidence
- **THEN** Make video becomes available through the existing explicit-confirmation flow

### Requirement: Night Out has an exact fixture preview

The maker and Explore Gallery SHALL expose one deterministic Night Out fixture
mapped to the recipe's stable variant id.

#### Scenario: Operator chooses the fixture
- **WHEN** the operator selects the Night Out fixture or opens its gallery item
- **THEN** the app plays the registered fixture and can hand the exact recipe variant back to the maker
