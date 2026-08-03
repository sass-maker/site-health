## MODIFIED Requirements

### Requirement: Versioned execution envelope

Every stable catalog variant SHALL resolve through one versioned execution contract accepting a saved brief, exact variant, explicit inputs, and `fixture` or `real` mode and returning normalized status, owner, artifact, provenance, quality, evidence, and blocker fields. When the exact variant is the post-ready preset, the envelope SHALL additionally preserve the normalized production plan, final audio-mix evidence, automated media review, and human review status.

#### Scenario: Adapter completes

- **WHEN** a registered adapter produces a valid MP4
- **THEN** the envelope records the stable variant ID, execution mode, owner, playable artifact, owner manifest, hashes, and validation evidence

#### Scenario: Fixture is requested

- **WHEN** execution mode is `fixture`
- **THEN** the adapter returns the exact committed rights-safe preview and marks it fixture-derived without claiming the optional production runtime ran

#### Scenario: Mixed fixture is requested

- **WHEN** execution mode is `fixture` with two or three ordered registered component variants
- **THEN** the compositor returns a playable mixed MP4 and a receipt containing the base, influences, component hashes, renderer, and `mix` posture

#### Scenario: Real runtime is unavailable

- **WHEN** execution mode is `real` and its runtime or required source is absent
- **THEN** execution fails with an actionable blocker and does not substitute or relabel a fixture as real output

#### Scenario: Post-ready preset completes technical execution

- **WHEN** the post-ready preset produces a technically valid final master
- **THEN** the envelope includes its timed plan, narration and music provenance, mix settings and measurements, full-media validation, sampled review evidence, and separate technical and human review statuses
