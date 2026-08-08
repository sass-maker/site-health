# growth-operating-ledger Specification

## Purpose
Connects existing portfolio focus, intervention, distribution, search, traffic,
and attribution evidence into one honest change-wait-measure operating view.
## Requirements
### Requirement: Growth allocation is explicit and complete

The system SHALL map every maintained public project to exactly one growth mode:
`focus`, `maintain`, or `observe`. The mode SHALL derive from an explicit
validated program rather than a metric score, and the current focus set SHALL
remain bounded to the program's named products.

#### Scenario: Operator scans allocation

- **WHEN** the Growth ledger loads
- **THEN** every maintained public project appears exactly once with its growth mode
- **AND** the view distinguishes active focus work from maintenance and observation

#### Scenario: Program and catalog drift

- **WHEN** a program project is missing, duplicated, retired, or references an unknown catalog identity
- **THEN** validation fails before the projection can mark that project allocated

### Requirement: Focus targets reference canonical evidence

Each focus project SHALL name one active canonical Search query and one public
owned destination. Target query text SHALL resolve from the existing query
contract, and the destination SHALL remain on the project's canonical origin.

#### Scenario: Focus target resolves

- **WHEN** a focus project references an active query and owned page
- **THEN** its Growth row exposes the exact query text and destination URL

#### Scenario: Target ownership is invalid

- **WHEN** a focus target references a historical query, another project, or an off-origin destination
- **THEN** validation fails instead of inferring an alternative target

### Requirement: Growth rows join evidence without inventing causality

Each Growth row SHALL expose the latest available shipped Search change,
Search Console outcome, Cloudflare traffic outcome, marketing publication
evidence, and deterministic next Search action. Missing families SHALL remain
explicit, and the row SHALL NOT claim that one observation caused another.

#### Scenario: Change awaits a measurement window

- **WHEN** a retained Search change is newer than the latest comparable Search outcome
- **THEN** the row shows the shipped change and its bounded next measurement time
- **AND** it does not label the change successful or unsuccessful

#### Scenario: Project has incomplete evidence

- **WHEN** one or more outcome families are absent
- **THEN** available native values remain visible
- **AND** every absent family is labeled not measured or not connected

### Requirement: Link work distinguishes attempts from earned evidence

The ledger SHALL distinguish recorded directory submission attempts from
verified earned links. A submission, filled form, queue acknowledgement, or
directory count SHALL NOT be presented as a backlink unless an exact public
source URL is retained.

#### Scenario: Only submission evidence exists

- **WHEN** a project appears in a retained directory submission status but has no exact public listing URL
- **THEN** the row reports submission attempts separately
- **AND** verified earned links remain not measured

#### Scenario: Verified link is available

- **WHEN** an exact public source URL and destination are retained for a project
- **THEN** the expanded row can expose that link as verified evidence

### Requirement: Commercial attribution remains product-owned

The system SHALL show provider-authoritative traffic values when available, but
SHALL label conversions and revenue not connected until an authoritative
product receipt supplies them. It SHALL NOT derive commercial outcomes from
traffic, Search clicks, publications, or link attempts.

#### Scenario: Traffic exists without conversion receipts

- **WHEN** Cloudflare reports visits but no product-owned conversion outcome exists
- **THEN** the row shows the visits
- **AND** conversions and revenue remain not connected

### Requirement: Growth view is sortable and progressively disclosed

Fleet Console SHALL expose one portfolio-wide Growth page that sorts by growth
mode, project, Search outcome, and next measurement. The compact row SHALL show
allocation, target, outcome, and next step; expanded detail SHALL show evidence
sources, change information, link boundary, marketing proof, and attribution gaps.

#### Scenario: Operator opens Growth

- **WHEN** the Growth page receives a valid projection
- **THEN** it renders one sortable row per maintained public project
- **AND** focus projects sort before maintain and observe by default

#### Scenario: Operator uses a narrow viewport

- **WHEN** Growth is opened at 390 CSS pixels
- **THEN** each row remains structurally readable with text status and keyboard-operable disclosure

