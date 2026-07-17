# Spec: jsonld-emission

## ADDED Requirements

### Requirement: Registry-driven JSON-LD generation

Every product in `agent-surfaces-registry.json` SHALL have a JSON-LD
`@graph` derivable from registry fields alone (Organization + product node),
using the shared origin-preference chain for all URLs.

#### Scenario: product with defaults

- GIVEN a registry product with `name`, `url`, `summary` and no schema fields
- WHEN JSON-LD is generated
- THEN the graph contains an Organization node for the fleet publisher and a
  SoftwareApplication node with the product's canonical origin, name, and
  summary, and the whole document parses as JSON

### Requirement: Idempotent head injection

Injection into a product's `headFile` SHALL be idempotent: re-running apply
produces zero diff, and an updated registry updates the block in place
without duplicating it.

#### Scenario: re-run produces no diff

- GIVEN a head file already containing the fleet-jsonld marked block
- WHEN apply runs again with an unchanged registry
- THEN the file content is unchanged

#### Scenario: failed parse aborts safely

- GIVEN an injection whose extracted block fails JSON.parse or breaks head
  structure
- WHEN the post-write check runs
- THEN the original file content is restored and the product is reported as
  failed, without aborting other products

### Requirement: No duplicate entity blocks

A product page SHALL NOT ship two competing product-entity JSON-LD blocks.

#### Scenario: pre-existing hand-written block

- GIVEN a product whose head already contains a hand-written
  SoftwareApplication block
- WHEN apply targets that product
- THEN apply reports the conflict and does not inject until the legacy block
  is removed or marked as intentional page-level schema

### Requirement: Audit visibility

The agent-index audit SHALL report homepage JSON-LD presence and parseability
per product (non-required check in v1).

#### Scenario: audit reports jsonld

- GIVEN a product homepage with one parseable product JSON-LD block
- WHEN `agent-index-audit.mjs` runs
- THEN the `jsonld` check reports pass with the detected @type
