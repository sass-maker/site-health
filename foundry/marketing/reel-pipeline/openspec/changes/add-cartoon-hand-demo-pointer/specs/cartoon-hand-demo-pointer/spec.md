## ADDED Requirements

### Requirement: Cartoon-hand pointer is an opt-in versioned film treatment
The system SHALL register the cartoon-hand pointer through
`guided-app-demo@2` without changing the behavior or reproducibility of
`guided-app-demo@1`. The treatment SHALL be available only when the approved
capture includes a presenter frame that can anchor the arm.

#### Scenario: Operator selects the new treatment
- **WHEN** an operator records a guided demo with a presenter and selects the
  cartoon-hand pointer
- **THEN** the job records `guided-app-demo@2`, the treatment selection, and
  the presenter anchor used by the render

#### Scenario: Existing version-one job is rendered again
- **WHEN** a job pinned to `guided-app-demo@1` is previewed or finalized
- **THEN** the system renders the ordinary guided demo without adding a
  cartoon-hand treatment

### Requirement: Pointer trace is privacy-bounded and source-bound
The system SHALL represent pointer movement and button transitions in an
immutable sidecar with a monotonic timebase, normalized coordinates, capture
dimensions, acquisition method, and calibration evidence. The sidecar SHALL be
bound to the approved source-video hash and SHALL NOT contain keystrokes,
entered text, DOM selectors, window titles, or application content.

#### Scenario: Valid trace is approved with a capture
- **WHEN** an eligible pointer trace and screen recording have matching
  timebases, dimensions, duration bounds, and source binding
- **THEN** the capture record stores the trace hash, source hash, acquisition
  method, and calibration evidence for later rendering

#### Scenario: Trace contains prohibited input data
- **WHEN** a pointer sidecar contains a key event, entered text, selector,
  window title, or unrecognized payload field
- **THEN** validation rejects the sidecar before it can be approved or uploaded

### Requirement: Fingertip preserves the exact interaction hotspot
The renderer SHALL place the cartoon fingertip at the validated pointer
coordinate and SHALL retain a high-contrast hotspot marker that identifies the
exact target. It SHALL render distinct pointing, click/tap, drag/grab, release,
idle, and off-screen states from the trace.

#### Scenario: Operator clicks a small control
- **WHEN** the trace contains a button-down and button-up transition over a
  small interface control
- **THEN** the rendered fingertip remains centered on the recorded coordinate,
  shows an unambiguous tap state, and leaves the exact hotspot visible

#### Scenario: Operator drags an object
- **WHEN** the pointer moves while a primary button remains pressed
- **THEN** the renderer uses the grab state for the drag, preserves continuous
  hotspot alignment, and shows release at the recorded button-up time

#### Scenario: Pointer is idle or outside the capture
- **WHEN** the trace is idle beyond the film-skill threshold or marks the
  pointer outside the capture bounds
- **THEN** the arm retracts or fades without inventing an on-screen target

### Requirement: Arm originates from the presenter without obscuring the action
The renderer SHALL anchor the arm to the presenter frame, orient the hand body
away from the active target, and respect presenter, caption, title, and
interaction safe areas. The app SHALL remain the dominant subject.

#### Scenario: Target is near the presenter corner
- **WHEN** the traced target would cause the arm or hand body to cover the
  presenter, captions, or the demonstrated control
- **THEN** the renderer chooses an alternate bend or hand orientation, and
  falls back to the standard cursor if no legible placement exists

#### Scenario: Pointer travels across the screen
- **WHEN** the pointer moves between distant controls
- **THEN** the arm may stretch cartoonishly while preserving a single
  principal gesture and keeping the fingertip aligned to the trace

### Requirement: Captured cursor is covered without altering product evidence
The system SHALL cover the captured cursor only with verified opaque hand
geometry at the traced hotspot. It SHALL NOT use unreviewed pixel
reconstruction or inpainting to remove interface content.

#### Scenario: Hand geometry fully covers the captured cursor
- **WHEN** representative preview frames prove that the cursor remains inside
  the fingertip cover throughout the eligible interaction
- **THEN** the review may approve the cartoon-hand treatment for final render

#### Scenario: Captured cursor cannot be covered reliably
- **WHEN** the source cursor is offset from the trace, changes to an uncovered
  shape, or remains visible outside the fingertip cover
- **THEN** the system disables the cartoon hand and preserves the standard
  cursor and original product evidence

### Requirement: Unsupported or untrusted traces fall back safely
The system SHALL use the standard cursor when a source type lacks a validated
coordinate mapping, when trace synchronization or integrity fails, when the
treatment is disabled, or when precision and legibility gates do not pass. It
SHALL record the fallback reason and SHALL NOT label that output as using the
cartoon-hand treatment.

#### Scenario: Window capture has no proven coordinate mapping
- **WHEN** an operator records a window or browser tab whose pointer
  coordinates cannot be calibrated to the encoded capture
- **THEN** the job remains renderable with the standard cursor and records the
  unsupported mapping as the fallback reason

#### Scenario: Trace hash does not match the approved job
- **WHEN** preview or final rendering receives a trace whose hash or source
  binding differs from the approved capture record
- **THEN** the system rejects the treatment, preserves the standard-cursor
  path, and reports the integrity failure

### Requirement: Preview and final share identical treatment inputs
The system SHALL bind accepted preview and final output to the same source
capture, pointer trace, hand-style asset, film-skill version, and render
settings. The operator SHALL be able to disable the treatment after preview
without recording a new take.

#### Scenario: Accepted preview proceeds to final
- **WHEN** the operator accepts a preview using the cartoon-hand pointer
- **THEN** the final-render record contains the identical source, trace, style,
  and skill hashes used by that preview

#### Scenario: Operator dislikes the treatment
- **WHEN** the operator disables the cartoon hand after reviewing the preview
- **THEN** the system can render the same approved source with its standard
  cursor and records that choice

### Requirement: Hand appearance is explicit, rights-cleared, and accessible
The system SHALL require an operator-selected, versioned, rights-cleared hand
style and SHALL NOT infer skin tone or other appearance traits from presenter
imagery. A reduced-motion render SHALL preserve pointing meaning without long
arm travel or rapid tap animation.

#### Scenario: Operator chooses a hand style
- **WHEN** the operator selects a style with valid license, provenance, and
  checksum metadata
- **THEN** the job records the exact style ID and version without analyzing the
  presenter image for appearance matching

#### Scenario: Reduced-motion output is requested
- **WHEN** the job requests the reduced-motion review or delivery variant
- **THEN** the renderer uses restrained pose changes or a static pointing hand
  at interaction moments while keeping the hotspot clear

#### Scenario: Hand asset lacks usable rights metadata
- **WHEN** the selected style has missing, expired, or non-production-safe
  rights evidence
- **THEN** the publishable final falls back to the standard cursor and reports
  the asset-rights failure
