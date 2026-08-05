## Purpose

Defines a bounded private-production lane for mature fictional-adult imagery and video while keeping age, consent, likeness, model capability, and distribution state explicit.

## ADDED Requirements

### Requirement: Mature fictional-adult scope
Mature-enabled workflows SHALL support fictional adults, including nudity and consensual adult erotic concepts, only when every depicted person is explicitly asserted to be at least 25 years old and consenting. They SHALL reject minors, youthful or uncertain age, coercion, incest, bestiality, and sexualized real-person likenesses.

#### Scenario: Eligible mature concept is prepared
- **WHEN** every cast member is fictional, asserted to be at least 25 years old, consenting, and free of real-person likeness
- **THEN** the system may compile the mature local-generation requests and records those assertions in the workflow manifest

#### Scenario: Age is ambiguous
- **WHEN** a prompt, character record, or reference makes a depicted person's adult age uncertain
- **THEN** the system blocks mature generation and requires the cast or concept to be corrected

#### Scenario: Disallowed likeness or consent is requested
- **WHEN** a request sexualizes a real person, implies coercion, or conflicts with a cast consent assertion
- **THEN** the system rejects the request before any model executes

### Requirement: Truthful mature-capable model selection
The model picker SHALL identify whether a profile is mature-capable, installed, locally runnable, license-known, and backed by a registered executor. Selecting a model SHALL be a hard execution constraint; the system SHALL NOT substitute a different model or continuation owner silently.

#### Scenario: Mature-capable model is ready
- **WHEN** the operator selects an installed mature-capable profile with a runnable executor
- **THEN** execution uses that exact profile and records its model identity and hash

#### Scenario: Selected model cannot execute
- **WHEN** the selected model has no runnable local executor
- **THEN** the workflow fails before generation with a specific readiness error and retains the selection for diagnosis

### Requirement: Private proof and distribution remain separate
A private mature experiment SHALL NOT require Fleet branding or publication rights to generate, but its result SHALL remain non-distributable until normal source, likeness, license, creative review, and destination evidence passes.

#### Scenario: Private mature proof completes
- **WHEN** an eligible mature workflow generates and passes local technical quality checks
- **THEN** the result appears in Productions as a private review artifact with prompt, model, cast, and file evidence and no distribution action

#### Scenario: Distribution is attempted without rights
- **WHEN** a private mature artifact lacks the normal distribution evidence
- **THEN** the system blocks handoff before any network call
