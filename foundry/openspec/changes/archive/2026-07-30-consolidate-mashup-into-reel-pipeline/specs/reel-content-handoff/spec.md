## ADDED Requirements

### Requirement: Source-backed podcast edit intake
Reel Pipeline SHALL accept an approved `fleet.podcast-edit.v1` document as a
structured media-generation input without replacing its transcript, source
timing, score terms, or visual provenance.

#### Scenario: Import an approved podcast edit
- **WHEN** an approved podcast edit enters Reel Pipeline
- **THEN** its clips remain in order and retain source ids, human-readable titles, original ranges, transcript text, score terms, and visual credits

### Requirement: Podcast approval gates remain authoritative
Podcast-edit intake SHALL NOT mark an artifact publishable, create a Postiz
draft, or bypass Reel Pipeline quality and review gates solely because the
editorial document is approved.

#### Scenario: Render an editorially approved podcast edit
- **WHEN** the edit is approved for rendering
- **THEN** the resulting artifact still requires Reel Pipeline artifact review and the existing Postiz draft handoff
