## MODIFIED Requirements

### Requirement: SaaS Maker has a narrow public product boundary
SaaS Maker SHALL ship a public maintained-product directory, a clearly
separated list of explicitly public past repositories, package catalogue and
documentation links, and generated public product content. It MUST NOT present
itself as the fleet task, build, analytics, observability, AI, job, feedback,
or marketing control plane.

#### Scenario: Public visitor opens SaaS Maker
- **WHEN** a visitor opens the SaaS Maker public site
- **THEN** the visitor sees maintained products, public past repositories, the maintained npm package, and public changelogs or roadmaps without operational Fleet navigation

#### Scenario: Private operational data exists in Fleet
- **WHEN** Fleet has tasks, failures, machine state, unpublished plans, private repositories, or operational receipts
- **THEN** SaaS Maker does not fetch, render, or expose that private data

#### Scenario: Past repository is private
- **WHEN** an inactive catalog entry points to a private repository
- **THEN** SaaS Maker omits the repository and its project identity
