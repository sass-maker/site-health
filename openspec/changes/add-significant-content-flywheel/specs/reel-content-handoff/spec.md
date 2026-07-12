## ADDED Requirements

### Requirement: Versioned reel export envelope
Significant Hobbies SHALL export approved reel variants in a versioned envelope containing package identity, revision, canonical destination, and complete variant payloads.

#### Scenario: Export approved variants
- **WHEN** OpenClaw exports a ready package
- **THEN** only approved variants are included and every variant retains its hook, scenes, visuals, caption, CTA, tags, hypothesis, and provenance

### Requirement: Idempotent Reel Pipeline intake
Reel Pipeline SHALL import a content variant once per package revision and variant id and SHALL preserve its structured source payload in the Idea Store.

#### Scenario: Retry an import
- **WHEN** OpenClaw imports the same envelope more than once
- **THEN** Reel Pipeline returns the existing ideas without duplicating the backlog

### Requirement: Script preservation
Reel Pipeline SHALL convert the supplied scene plan directly into its script and VideoBrief representations without regenerating or replacing the approved hook and payoff.

#### Scenario: Produce an imported variant
- **WHEN** the factory processes a Significant Hobbies variant
- **THEN** the rendered brief begins with the exact approved hook and retains the ordered narration, visual beats, on-screen text, duration target, and CTA

### Requirement: Stable cross-repo receipts
Reel Pipeline SHALL emit versioned JSON receipts for render, platform publication, and metrics stages with package, revision, and variant attribution.

#### Scenario: Upload to YouTube
- **WHEN** a sourced variant is successfully uploaded
- **THEN** the receipt contains the provider, external id and URL, publication state/time, and source attribution required by Significant Hobbies

### Requirement: Receipt conflict safety
Significant Hobbies SHALL apply identical receipts idempotently and SHALL reject unknown attribution or conflicting external platform ids.

#### Scenario: Retry receipt application
- **WHEN** OpenClaw applies the same upload receipt twice
- **THEN** the second application succeeds as a no-op and the JSON document is unchanged

#### Scenario: Apply a conflicting upload
- **WHEN** a receipt would replace an existing YouTube id with a different id for the same package revision
- **THEN** the command fails without changing the package

### Requirement: Existing approval gates remain authoritative
Content-package intake SHALL NOT mark a SaaS Maker post accepted or bypass Reel Pipeline review and posting preflight.

#### Scenario: Import an approved creative variant
- **WHEN** a package variant enters Reel Pipeline
- **THEN** it remains subject to the existing quality, review, accepted-queue, credential, and provider preflight gates
