## ADDED Requirements

### Requirement: Product qualification precedes UGC production
The system SHALL require an explicit product-fit decision before starting a
Day 0 UGC experiment. Qualification SHALL address a visible product moment,
emotional entry point, recognizable audience identity, sufficiently broad
audience, share or comment motivation, regulatory constraints, and whether the
product is live.

#### Scenario: Product lacks a visible moment
- **WHEN** the qualification record has no visible product moment and no approved alternative proof beat
- **THEN** the experiment remains ineligible and no creator packet is issued

### Requirement: Day 0 remains a bounded experiment
The system SHALL model Day 0 as a 90-day format-discovery experiment with
3–5 opaque creator references, approximately 9–12 approved weekly posts across
the roster, a stable product positioning, and explicit budget acknowledgement.

#### Scenario: Positioning changes before enough executions
- **WHEN** an operator attempts to replace the positioning before 10–15 executions have tested it
- **THEN** the change requires an explicit experiment revision and records why the prior test ended early

### Requirement: Format hypotheses preserve structure without copying skin
Each format hypothesis SHALL record its hook shape, beat sequence, product
placement, CTA mechanic, inspiration URL, and observation date. It SHALL NOT
import or reuse the inspiration's source media, verbatim script, watermark,
likeness, or creator-specific creative assets.

#### Scenario: Adapt a scouted format
- **WHEN** an operator creates a format from a scouted reference
- **THEN** the execution uses an original product-specific script and assets while retaining only structural attribution

### Requirement: Every execution has immutable experimental lineage
Every creator execution SHALL reference one experiment, positioning revision,
format, hook hypothesis, creator reference, product reveal, CTA, source-rights
record, and execution revision.

#### Scenario: Revise a creator cut
- **WHEN** a reviewer sends time-coded changes
- **THEN** the next submission creates a new immutable revision without replacing the prior media hash or review evidence

### Requirement: Native editing is a first-class production path
The system SHALL produce a native-edit packet containing a full script, timed
performance beats, product-proof assets, visible-brand direction, captions,
disclosures, and posting notes. It SHALL NOT require Reel Pipeline rendering
before a creator can film and edit on their own device.

#### Scenario: Issue a creator packet
- **WHEN** a format execution is approved for production
- **THEN** the creator receives enough structured direction to film and edit without accessing Fleet source systems

### Requirement: Creator media fails closed on rights and disclosure
Reel Pipeline SHALL accept external creator cuts only with a media hash,
creator/brand rights evidence, commercial relationship disclosure, format
lineage, and explicit review state. It SHALL NOT store creator social-account
credentials.

#### Scenario: Creator cut lacks rights evidence
- **WHEN** a creator submits a cut without the required usage or likeness rights record
- **THEN** intake fails before product review or distribution

### Requirement: Review feedback is time-coded and actionable
The review record SHALL support time-coded notes for hook speed, product reveal,
energy, clarity, captions, disclosure, and CTA, with explicit approve, revise,
or reject outcomes.

#### Scenario: Hook begins too slowly
- **WHEN** a reviewer marks the opening as weak
- **THEN** the revision request identifies the affected time range and preserves the format and execution lineage

### Requirement: Format decisions use repetitions and cross-creator evidence
The system SHALL withhold a failure decision until a format has received 5–8
executions unless a safety or rights issue ends it earlier. A format SHALL
graduate only after 2–3 outsized results, ideally across at least two creators.

#### Scenario: One video breaks out
- **WHEN** one execution exceeds the breakout threshold
- **THEN** the system recommends a controlled hook clone and does not mark the format graduated

#### Scenario: A format replicates
- **WHEN** the same format produces 2–3 outsized results across at least two creator references
- **THEN** the experiment may graduate that format to a separately approved scaling change

### Requirement: Performance signals produce bounded next actions
The system SHALL normalize attributable metrics into experiment-defined signal
bands and recommend one of revise hook, repeat execution, clone breakout,
continue test, graduate, stop, or reposition. Missing retention or product-lift
data SHALL remain unknown.

#### Scenario: Execution crosses 50K views
- **WHEN** a metric receipt crosses the configured breakout threshold
- **THEN** the system creates a hook-clone next action due within 24 hours

#### Scenario: Experiment reaches its stop window
- **WHEN** 90 days of full-cadence evidence contains no 100K result, no improving format, and no product-lift evidence
- **THEN** the system recommends stop or reposition and does not scale the roster automatically

### Requirement: Operational systems remain outside Reel Pipeline
Creator discovery, cold outreach, contracts, payments, tax forms, password
custody, creator-device posting, and social account recovery SHALL remain
outside Reel Pipeline. Postiz SHALL remain authoritative for connected-account
drafts, scheduling, publication, and provider metrics.

#### Scenario: A creator account is onboarded
- **WHEN** an operator records the creator in an experiment
- **THEN** Fleet stores only an opaque creator reference and no login, password, phone, payment, or tax data
