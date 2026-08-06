## Purpose

Define evidence-backed portfolio identity and prompt-ownership contracts so
human pages, agent surfaces, directories, and outcome reports describe the
same maintained products without overstating discoverability.

## ADDED Requirements

### Requirement: Canonical public product identity

Every maintained public product SHALL declare one canonical public name,
bounded aliases, canonical origin, publisher identity, source posture,
documentation URL, availability posture, and pricing posture in the canonical
project catalog.

#### Scenario: Product uses a deliberate internal and public identity

- **WHEN** an internal project id or source workspace differs from the public product name
- **THEN** the catalog records both identities and their relationship explicitly
- **AND** generated public surfaces use the public identity without inventing another alias

#### Scenario: Product identity conflicts across surfaces

- **WHEN** the homepage, public directory, agent catalog, structured data, or repository metadata uses an undeclared product name
- **THEN** validation fails with the product, surface, and conflicting value

### Requirement: External identity links are verifiable

Configured canonical, repository, documentation, changelog, support, and
official-profile URLs SHALL have an explicit applicability state and SHALL be
checked without interpreting an inaccessible URL as valid evidence.

#### Scenario: Public source URL returns not found

- **WHEN** a product declares a public repository URL that returns 404
- **THEN** validation reports the source link as failing
- **AND** the public directory does not present it as an available source destination

#### Scenario: Distribution channel does not apply

- **WHEN** a product is not distributed through an app store
- **THEN** its availability state records that channel as not applicable
- **AND** validation does not convert absence into a missing listing

### Requirement: Prompt ownership is explicit

Every active buyer-discovery prompt SHALL map to a canonical owned page or an
explicit missing-page state, plus product proof, sources, limitations, and the
latest provider-observation state.

#### Scenario: Prompt has no approved owned page

- **WHEN** a configured prompt cannot be joined to a published canonical page
- **THEN** the projection records the page as missing
- **AND** it links to a reviewable content-coverage candidate rather than fabricating coverage

#### Scenario: Prompt page is drafted but not approved

- **WHEN** a complete content manifest exists without the exact owner-approved hash
- **THEN** prompt ownership remains approval-pending
- **AND** no repository write or publication is represented as complete

### Requirement: GEO readiness is composite evidence

A product SHALL NOT be labeled GEO-ready from technical crawler access alone.

#### Scenario: Agent surfaces pass without provider appearance

- **WHEN** a product passes llms, Markdown, robots, sitemap, and catalog checks but lacks a current provider observation
- **THEN** technical readiness is reported as passing
- **AND** provider visibility remains unobserved
- **AND** the combined GEO state is not reported as ready

