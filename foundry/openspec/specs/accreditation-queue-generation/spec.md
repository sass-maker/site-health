# accreditation-queue-generation Specification

## Purpose
Define a script that reads accreditation state and emits a dated, human-
readable markdown queue file grouped by platform state and ordered by Fleet
product priority.
## Requirements
### Requirement: Queue file generation from accreditation state

The system SHALL provide a script that reads `accreditation-state.json` and
`config/projects.json` and emits
`campaign-manifests/out/platform-accreditation-queue-<YYYY-MM-DD>.md`.

#### Scenario: Queue is generated for the current date

- **WHEN** the owner runs the queue generator
- **THEN** a markdown file is written to
  `campaign-manifests/out/platform-accreditation-queue-<today>.md` with the
  current date in the filename and header

#### Scenario: No state file exists

- **WHEN** the queue generator is run before any accreditation state file
  exists
- **THEN** it exits with a clear error directing the owner to initialize the
  state file first

### Requirement: Product priority ordering

The queue SHALL group platforms by Fleet product priority — P1 first, then P2,
then P4 — and within each product shall sub-group by platform state:
`accredited`, `seed`, `blocked`, `rejected`.

#### Scenario: P1 products appear before P2

- **WHEN** the queue is generated
- **THEN** codevetter, pace, posttrainllm, and agent-office sections appear
  before any P2 product section

#### Scenario: P4 products appear last

- **WHEN** the queue is generated
- **THEN** archived P4 products appear after all P1 and P2 sections

### Requirement: Protected channels section

The queue SHALL include a protected-channels section listing Hacker News,
LinkedIn, and X with a note that they are always individually planned and
never enter broad accreditation.

#### Scenario: Protected channels are listed separately

- **WHEN** the queue is generated
- **THEN** a "Protected channels" section lists Hacker News, LinkedIn, and X
  and does not include them under any product's platform list

### Requirement: Honest seed-versus-accredited distinction

The queue header SHALL state that `seed` entries are unverified evidence from
registries and `accredited` entries have been probed with recorded evidence.
The queue SHALL NOT imply that seed entries are ready for submission.

#### Scenario: Queue header distinguishes evidence levels

- **WHEN** the queue is generated
- **THEN** the header explicitly states that seed platforms require live
  verification before any submission and that accredited platforms have
  recorded verification evidence

### Requirement: Summary counts

The queue SHALL include a summary section with total platform counts by state
across the full inventory.

#### Scenario: Summary reflects full inventory

- **WHEN** the queue is generated with 113 seed, 20 accredited, and 5 blocked
  platforms
- **THEN** the summary section reports those counts by state

