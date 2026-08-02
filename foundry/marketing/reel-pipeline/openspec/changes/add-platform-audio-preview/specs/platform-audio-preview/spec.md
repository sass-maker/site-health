## Purpose

Allow operators to review a generated silent reel in sync with an official platform-licensed song while ensuring the exported upload master never contains or stores that copyrighted audio.

## ADDED Requirements

### Requirement: Bounded platform-audio reference
The system SHALL accept a review-only audio reference containing the provider, official embeddable source identifier, artist, track title, excerpt start, preview duration, and platform-use note. It SHALL reject arbitrary media URLs, local copies presented as platform references, negative offsets, and previews longer than 60 seconds.

#### Scenario: Official YouTube reference is accepted
- **WHEN** an operator supplies a YouTube video identifier, artist, title, non-negative excerpt start, and duration no greater than 60 seconds
- **THEN** the system records a review-only reference without downloading or copying the referenced audio

#### Scenario: Arbitrary audio URL is rejected
- **WHEN** an operator supplies a direct MP3 URL or an unsupported provider
- **THEN** the system rejects the reference before creating a preview

### Requirement: Synchronized local preview
The system SHALL provide a local review surface that keeps an official platform player visible, plays the generated silent video alongside it, and synchronizes play, pause, restart, and excerpt position without routing platform audio through the export pipeline. When an official YouTube upload blocks embedding, the reference MAY include an official Spotify track identifier as the local review player while preserving YouTube as the final attachment target.

#### Scenario: Operator starts the preview
- **WHEN** the operator activates the official platform player for a valid reference
- **THEN** the silent visual starts at its beginning while the platform player starts at the configured excerpt offset

#### Scenario: Operator pauses or seeks
- **WHEN** the official platform player pauses or moves outside the configured excerpt window
- **THEN** the silent visual pauses or resynchronizes without creating a local audio asset

#### Scenario: YouTube upload blocks embedding
- **WHEN** the final YouTube sound reference cannot be embedded and the operator supplies the matching Spotify track identifier
- **THEN** local review streams through the visible official Spotify embed while handoff metadata continues to identify the YouTube Shorts sound target

### Requirement: Fail-closed silent master
The system SHALL export a separate upload master with no audio stream and SHALL record probe evidence proving the absence of audio. A file containing any audio stream MUST NOT be presented as the platform-audio upload master.

#### Scenario: Silent export passes
- **WHEN** the generated upload master contains video and no audio stream
- **THEN** the system records a passing silent-export receipt with duration, dimensions, codec, and artifact hash

#### Scenario: Audio remains in the candidate
- **WHEN** media inspection finds an audio stream in the candidate upload master
- **THEN** the system fails the silent-export gate and does not expose that file as ready for platform audio attachment

### Requirement: Platform handoff metadata
The system SHALL preserve the intended provider, artist, track title, review offset, preview duration, and an instruction to attach the official sound inside the target platform. It SHALL identify cross-platform timing as a starting point and require final offset confirmation in the target platform. It SHALL NOT claim that a preview reference licenses a downloaded or cross-platform audio master.

#### Scenario: Silent master is ready
- **WHEN** a silent master passes verification
- **THEN** its handoff metadata identifies the official sound, review starting point, duration, and requirement to confirm exact timing in the platform editor

### Requirement: Local and non-publishing boundary
The preview capability SHALL remain local and review-only, SHALL NOT add provider credentials or direct publishing, and SHALL NOT call download tools for the referenced song.

#### Scenario: Preview is created
- **WHEN** an operator creates or opens a synchronized preview
- **THEN** the only song playback occurs through the official embedded platform player and no social post is created
