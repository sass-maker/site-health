## ADDED Requirements

### Requirement: SaaS Maker has a narrow public product boundary
SaaS Maker SHALL ship a public product directory, package catalogue and
documentation, generated product marketing content, and shared feedback. It
MUST NOT present itself as the fleet task, build, analytics, observability, AI,
job, or marketing control plane.

#### Scenario: Public visitor opens SaaS Maker
- **WHEN** a visitor opens the SaaS Maker public site
- **THEN** the visitor sees products, maintained packages, public changelogs or roadmaps, and feedback entry points without operational fleet navigation

#### Scenario: Private operational data exists in Fleet
- **WHEN** Fleet has tasks, failures, machine state, unpublished plans, or operational receipts
- **THEN** SaaS Maker does not fetch, render, or expose that private data

### Requirement: Feedback is the only shared runtime product
SaaS Maker SHALL retain the minimum API, project identity, authentication, media
handling, private review interface, and package code required to submit and
manage feedback. Non-feedback runtime APIs and private application surfaces
MUST be absent from the shipped source graph.

#### Scenario: Product submits feedback
- **WHEN** a product submits feedback with a valid public project key
- **THEN** SaaS Maker accepts the feedback through the maintained feedback contract and makes it available in the private feedback inbox

#### Scenario: Client requests a retired API
- **WHEN** a client requests a retired task, marketing, analytics, AI, job, workflow, event, App Health, testimonial, waitlist, or operational changelog API after cutover
- **THEN** the API does not advertise or implement that capability

### Requirement: Only feedback is maintained as a cross-product package
The SaaS Maker repository SHALL mark `@saas-maker/feedback` as its maintained
cross-product runtime package. Historical packages MAY remain documented for
migration, but MUST NOT be presented as maintained or required fleet
infrastructure.

#### Scenario: Developer views package documentation
- **WHEN** a developer opens the package catalogue
- **THEN** feedback is clearly identified as maintained and historical packages are clearly identified as retired or superseded

### Requirement: Public changelogs and roadmaps are generated content
SaaS Maker SHALL render public changelogs and roadmaps from an allowlisted Fleet
public snapshot rather than owning a task workflow or private roadmap database.

#### Scenario: Fleet publishes a public product snapshot
- **WHEN** Fleet generates a valid public snapshot containing changelog or roadmap entries
- **THEN** SaaS Maker can render those entries without runtime access to Fleet private systems
