## Purpose

Provides reusable fictional character records and per-workflow cast instances so appearance, identity, safety assertions, and creative continuity survive across scenes and reels.

## ADDED Requirements

### Requirement: Reusable character records
The character directory SHALL store a stable identifier, display name, role, fictional-adult status and age, appearance, wardrobe, palette, prompt tokens, negative constraints, continuity notes, visual references, and source/likeness posture for each character. A character SHALL remain editable without rewriting prior production receipts.

#### Scenario: Operator creates an original character
- **WHEN** the operator saves a fictional character with an asserted age of 25 or older and no real-person likeness
- **THEN** the directory assigns a stable identifier and makes the character available to future workflows

#### Scenario: Required identity evidence is missing
- **WHEN** a character is selected for a mature workflow without an explicit adult-age assertion or with unresolved likeness posture
- **THEN** mature generation remains blocked and names the missing field

### Requirement: Workflow cast instances
A workflow SHALL reference directory characters through cast instances that can override scene-specific wardrobe, role, expression, and continuity notes without mutating the directory source record.

#### Scenario: Character has a scene-specific outfit
- **WHEN** the operator changes a cast member's wardrobe for one workflow
- **THEN** the override applies to that workflow while the reusable directory character remains unchanged

### Requirement: Deterministic cast prompt compilation
The system SHALL compile the selected cast, continuity constraints, and approved visual references into every applicable scene-generation request and SHALL record which character revision and reference hashes were used.

#### Scenario: Multi-scene generation is prepared
- **WHEN** three scenes use the same cast member
- **THEN** each compiled scene request includes that cast member's required identity and continuity tokens and records the same source revision

### Requirement: Source and likeness boundaries
Every character SHALL declare one source posture: original, operator-owned, licensed, or named-IP private concept. Real-person likenesses SHALL require separate evidence and SHALL be ineligible for mature sexual generation.

#### Scenario: Named fictional character is used privately
- **WHEN** the operator marks a named-IP character as a private concept
- **THEN** the system may plan and locally experiment with the character but marks distribution rights unresolved

#### Scenario: Real-person sexual likeness is requested
- **WHEN** a mature workflow includes a character identified as or intended to resemble a real person
- **THEN** the system rejects that cast assignment before generation
