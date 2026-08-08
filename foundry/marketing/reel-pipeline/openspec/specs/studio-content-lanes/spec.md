# studio-content-lanes Specification

## Purpose
Defines attributable content origins so automated project work, direct operator requests, and personal automations remain distinct while sharing one production pipeline.
## Requirements
### Requirement: Three content lanes
Every Studio idea, brief, production, and distribution handoff SHALL identify exactly one content lane: project automation, operator request, or personal automation.

#### Scenario: Project automation creates content
- **WHEN** an enabled project policy discovers a new eligible source item
- **THEN** the resulting records are labeled project automation and retain the project identity and automation policy id

#### Scenario: Operator asks an agent for content
- **WHEN** the operator directly requests content through an agent or conversational Studio intake
- **THEN** the resulting records are labeled operator request whether their scope is project or personal

#### Scenario: Personal automation creates content
- **WHEN** an operator-owned automation creates content without a Fleet project
- **THEN** the resulting records are labeled personal automation and do not invent a project identity

### Requirement: Orthogonal scope and trigger
The Studio SHALL represent content scope separately from its trigger. Scope SHALL be `project` or `personal`; trigger SHALL be `scheduled`, `event`, or `operator-request`; and the visible lane SHALL be derived deterministically from those fields.

#### Scenario: Project request is conversational
- **WHEN** the operator asks for content about High Signal directly
- **THEN** the item retains High Signal project scope but appears in the operator-request lane

#### Scenario: Invalid lane combination is supplied
- **WHEN** a personal-scoped item claims project automation or a scheduled item omits its automation policy id
- **THEN** normalization rejects the item before it enters the production queue

### Requirement: Immutable origin provenance
Content origin SHALL retain the source adapter, source id, source revision or fingerprint, canonical evidence URL, creation actor, and automation policy id where applicable. A production update SHALL NOT silently replace those fields.

#### Scenario: Source content is revised
- **WHEN** the same source id arrives with changed attributable content
- **THEN** the Studio creates a new idempotent revision rather than mutating the completed source record

#### Scenario: Legacy item is loaded
- **WHEN** an existing idea or brief has no origin metadata
- **THEN** it remains readable as a legacy operator request without fabricated automation provenance

