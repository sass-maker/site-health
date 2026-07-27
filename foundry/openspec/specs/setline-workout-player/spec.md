# setline-workout-player Specification

## Purpose
TBD - created by archiving change add-setline-workout-player. Update Purpose after archive.
## Requirements
### Requirement: Programme overview
The system SHALL present a mobile-first dated programme overview with the
current block week, today's scheduled workout, expected duration, ordered
activity summary, and a direct start action. It SHALL also allow the user to
explicitly open another scheduled day from the programme view.

#### Scenario: User opens Setline before training
- **WHEN** the user opens the application without an active session between 27
  July and 18 October 2026
- **THEN** the system shows the matching week and local-calendar day's workout
  without requiring a network request

#### Scenario: User explicitly chooses another day
- **WHEN** the user selects a start action for a different programme day
- **THEN** the system starts that workout in its authored order without
  changing the programme schedule

### Requirement: Guided set execution
The system SHALL guide the user through the authored order of preparation,
warm-up, working, cardio, mobility, and cooldown steps while displaying one
current step as the primary action. Exercise and step positions SHALL remain
stable during execution and in the saved record.

#### Scenario: User starts today's workout
- **WHEN** the user selects the start action
- **THEN** the system shows the first incomplete step with its name, type,
  target dose, rest duration, and applicable form cues

#### Scenario: User completes a set
- **WHEN** the user records the fields applicable to the current step and
  selects Complete
- **THEN** the system saves the values and completion timestamp with one primary
  action

#### Scenario: User skips a set
- **WHEN** the user selects Skip
- **THEN** the system records the step as skipped and advances without adding
  completed volume or duration

#### Scenario: Session advances through the plan
- **WHEN** the user completes or explicitly skips the current step
- **THEN** the system advances to the next authored position without silently
  reordering or jumping over another pending step

### Requirement: Honest warm-up and working records
The system SHALL preserve warm-up sets in session history while excluding them from working-volume calculations.

#### Scenario: Summary contains both set types
- **WHEN** a session includes completed warm-up and working sets
- **THEN** the system reports warm-up volume and working volume separately

### Requirement: Timestamp-derived rest timer
The system SHALL start rest automatically after a completed non-final set and derive remaining time from a stored end timestamp.

#### Scenario: Browser execution is delayed
- **WHEN** the app regains execution after a timer tick was throttled
- **THEN** the visible remaining time reflects wall-clock time rather than the number of executed ticks

#### Scenario: User adjusts rest
- **WHEN** the user adds 15 seconds, adds 30 seconds, or skips rest
- **THEN** the system updates the end timestamp or advances to the next set accordingly

### Requirement: Device-local continuity
The system SHALL persist programme-aware active-session progress and
completed-session history on the device before any network request. In
authenticated mode it SHALL reconcile the same versioned ordered state with
the current user's private cloud record.

#### Scenario: User reloads during a workout
- **WHEN** the user reloads Setline after completing at least one activity
- **THEN** the system restores the workout identity, resolved week, completed
  results, next authored position, and any in-progress rest deadline

#### Scenario: User has a legacy sample workout in progress
- **WHEN** version 2 device or cloud state contains the prior sample session
- **THEN** the system restores that session against its original ordered
  template and does not insert new programme steps into it

### Requirement: Workout completion summary
The system SHALL summarize completed and skipped sets, duration, separate volume totals, average recorded RPE, and user-reported session quality.

#### Scenario: User completes the final set
- **WHEN** the final planned set is completed or skipped
- **THEN** the system presents the session summary and allows the user to save it to history

### Requirement: Basic progress view
The system SHALL show basic exercise progress using recorded values and clearly label calculated values.

#### Scenario: User reviews progress
- **WHEN** the user opens the progress view
- **THEN** the system shows recent recorded weight and repetition performance plus explicitly derived volume or change indicators

### Requirement: Accessible responsive operation
The system SHALL support keyboard navigation, visible focus, reduced motion, legible contrast, and layouts suitable for phone, tablet, and desktop widths.

#### Scenario: User operates Setline on a phone
- **WHEN** the viewport is approximately 390 pixels wide
- **THEN** the current set and primary completion action remain usable without horizontal scrolling

### Requirement: Authored 12-week programme
The system SHALL include Sarthak's dated 27 July–18 October 2026 strength,
cardio, and mobility programme with its seven-day weekly rhythm, written
exercise choices, preparation, cooldowns, and plan rules.

#### Scenario: User opens the programme
- **WHEN** the user reviews any week in the 12-week block
- **THEN** the system shows Monday Upper, Tuesday Lower, Wednesday Easy plus
  mobility, Thursday Upper plus hard cardio, Friday mobility, Saturday Lower,
  and Sunday Easy plus mobility

#### Scenario: Programme contains an equipment choice
- **WHEN** the written plan allows hack squat or leg press, machine or dumbbell
  shoulder press, or another explicit alternative
- **THEN** the system preserves that choice text without selecting an option for
  the user

### Requirement: Deterministic week rules
The system SHALL materialize only plan changes determined by the current block
week and SHALL leave readiness-based or optional changes under user control.

#### Scenario: User starts RDL in Week 1 or 2
- **WHEN** a Lower session resolves in Week 1 or Week 2
- **THEN** the authored sequence contains exactly two RDL working sets

#### Scenario: User starts hard cardio in Week 1 or 2
- **WHEN** Thursday hard cardio resolves in Week 1 or Week 2
- **THEN** the interval sequence contains exactly four hard rounds in their
  written order

#### Scenario: Conditional progression becomes eligible
- **WHEN** the programme reaches Week 3 or Week 5
- **THEN** the system shows the applicable RDL, pull-up-test, or lateral-raise
  condition without silently changing the executable workout

### Requirement: Multi-modality recording
The system SHALL record strength, bodyweight, duration, interval, mobility, and
completion-based steps using fields appropriate to the authored target.

#### Scenario: User completes a timed cardio segment
- **WHEN** the current step is prescribed by duration
- **THEN** the system records the completed duration and timestamp without
  requiring a fabricated weight or repetition value

#### Scenario: User completes a mobility drill
- **WHEN** the current step is prescribed by repetitions or a timed hold
- **THEN** the system shows that dose and records its completion in the ordered
  session
