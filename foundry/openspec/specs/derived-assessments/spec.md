# derived-assessments Specification

## Purpose

Define validated, fingerprint-bound derived assessments and learner feedback.

## Requirements

### Requirement: Fingerprint-bound assessments
Every derived MCQ or recall prompt MUST reference its learning-item ID and source fingerprint.

#### Scenario: Reuse unchanged questions
- **WHEN** an item's fingerprint matches the fingerprint used to create its assessments
- **THEN** the system reuses the existing validated assessments

#### Scenario: Source changes
- **WHEN** an item's source fingerprint changes
- **THEN** stale generated assessments are not presented as current

### Requirement: Valid MCQ shape
An MCQ MUST contain one question, at least three distinct options, exactly one correct option, an explanation, provenance, and generation metadata before it can enter a learning session.

#### Scenario: Invalid generated question
- **WHEN** generated output has duplicate choices or an invalid correct index
- **THEN** the system rejects that question and does not schedule it

### Requirement: Assessment feedback
The learner SHALL be able to flag an incorrect or unhelpful derived assessment without changing the source content.

#### Scenario: Flag a question
- **WHEN** the learner flags an MCQ
- **THEN** the system excludes it from future sessions and retains the feedback for regeneration or review
