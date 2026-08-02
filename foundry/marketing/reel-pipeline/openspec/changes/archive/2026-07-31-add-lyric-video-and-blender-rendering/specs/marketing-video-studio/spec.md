## MODIFIED Requirements

### Requirement: Complete workflow catalog
Marketing Studio SHALL show faceless/lesson, brand reel, guided app demo,
coherent film, podcast short, and lyric video as explicit video workflows with
truthful readiness, required inputs, runtime owner, and action.

#### Scenario: Workflow is ready in another surface
- **WHEN** a guided app demo brief has the inputs required by Forge
- **THEN** Marketing Studio identifies Forge as the runtime owner and provides a continuation action that preserves the brief instead of claiming a local render

#### Scenario: Workflow prerequisites are missing
- **WHEN** a workflow requires an approved capture, source, host capability, timed lyric, or rights record that is absent
- **THEN** its action is disabled and the exact missing input or readiness blocker is shown

#### Scenario: Lyric video is selected
- **WHEN** the operator selects lyric video
- **THEN** Marketing Studio identifies the local lyric compositor as owner, shows optional Blender visual generation, and presents the separate music, timed-lyric, attribution, and rights requirements

## ADDED Requirements

### Requirement: Direct lyric-video production
Marketing Studio SHALL run a confirmed, rights-ready lyric-video brief through
the local lyric workflow and SHALL associate its audio evidence, timed lyrics,
literal scene plan, visual assets, video, captions, rights manifest, quality
evidence, and artifact directory with the saved brief.

#### Scenario: Rights-safe local production succeeds
- **WHEN** the operator confirms a valid lyric brief with a compatible local renderer
- **THEN** the system produces the lyric artifacts, records the result on the brief, and exposes playback and evidence in Productions

#### Scenario: Rights evidence is incomplete
- **WHEN** composition/lyrics rights, master-recording rights, evidence, or attribution are missing
- **THEN** execution fails before audio processing or asset generation and no distribution action becomes available

#### Scenario: Blender visuals are requested but unavailable
- **WHEN** a valid lyric brief explicitly requires Blender and its runtime is not ready
- **THEN** execution fails with the exact Blender readiness error instead of silently substituting another visual engine

### Requirement: Conversational lyric-video boundaries
Marketing Studio SHALL help classify and edit operator-supplied lyric-video
inputs but SHALL NOT retrieve song lyrics, infer missing copyrighted text, or
represent an operator rights assertion as independently verified.

#### Scenario: Operator requests a popular-song lyric video without inputs
- **WHEN** the operator names a current commercial song but supplies no timed lyrics, cleared audio, or rights evidence
- **THEN** the saved brief identifies the missing operator-supplied inputs and remains blocked without searching for the song or lyrics

#### Scenario: Operator supplies cleared inputs
- **WHEN** the operator supplies timed lyrics, audio, attribution, and complete separate rights postures
- **THEN** the conversation normalizes those inputs, identifies the assertions as operator-provided, and calculates production readiness
