## ADDED Requirements

### Requirement: Ambient discoverability baseline
Every public Toolbox project SHALL retain a canonical destination, functional
landing or entry surface, directory attribution, search/AI indexing entrypoints
appropriate to the surface, and basic acquisition/CTA evidence.

#### Scenario: Toolbox project remains quietly available
- **WHEN** no experiment is active
- **THEN** its canonical page and directory links remain discoverable without
  creating new campaign work

### Requirement: Bounded experiment definition
Every Toolbox marketing experiment MUST declare a hypothesis, project,
canonical destination, approved source/asset, channel, attribution key, start
time, expiry, budget, success metric, and automatic stop rule before launch.

#### Scenario: Experiment has no expiry
- **WHEN** a proposed experiment lacks an expiry or stop rule
- **THEN** validation rejects it before distribution

### Requirement: Existing approval remains authoritative
Experiment automation SHALL respect the existing marketing review queue and
publisher approvals and MUST NOT auto-accept drafts, invent unsupported claims,
or publish through an unmapped brand account.

#### Scenario: Draft is generated
- **WHEN** Foundry prepares a Toolbox marketing asset
- **THEN** it remains reviewable and cannot become approved solely because a
  schedule elapsed

### Requirement: Attributed outcome measurement
An experiment SHALL record comparable acquisition, CTA/activation, cost, and
time-window evidence against the exact project, asset revision, channel, and
attribution key.

#### Scenario: Traffic cannot be attributed
- **WHEN** a channel result cannot be tied to the declared experiment
- **THEN** the result is marked inconclusive rather than credited as success

### Requirement: Quiet stop and review-debt control
Expired, failed, or inconclusive experiments SHALL stop automatically, and new
generation SHALL pause when review debt or unresolved publication failures
exceed configured limits.

#### Scenario: Experiment expires without traction
- **WHEN** the expiry is reached without meeting the success threshold
- **THEN** distribution stops, the result is recorded, and no replacement
  campaign is automatically created

### Requirement: Explicit promotion decision
Toolbox traction MAY produce a recommendation but MUST NOT automatically move a
project into My Work or create an active feature roadmap.

#### Scenario: Toolbox project exceeds its success threshold
- **WHEN** a bounded experiment shows meaningful activation or conversion
- **THEN** Foundry creates a concise evidence-backed promotion recommendation
  for Sarthak's decision
