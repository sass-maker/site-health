## MODIFIED Requirements

### Requirement: Exact 48-variant coverage

The maker and internal execution registry SHALL contain exactly one preset for every stable recipe and variant pair and SHALL reject unknown, duplicate, null, stale, or uncovered variant identifiers. Exact option coverage SHALL NOT require one visible gallery card per minor option.

#### Scenario: Catalog and maker agree

- **WHEN** coverage validation joins the catalog and maker presets
- **THEN** all 48 stable variant identifiers have one exact selectable preset and the validator succeeds

#### Scenario: Exact coverage drifts

- **WHEN** a variant is missing, duplicated, stale, or mapped to an incompatible preset
- **THEN** validation fails with the exact identifier without padding the visible gallery

### Requirement: Substantive representative proof coverage

Explore Gallery SHALL contain exactly one primary representative demo per proven capability and MAY contain a bounded range of secondary proofs when they demonstrate materially different motion, camera, scene, or model behavior. Every visible demo SHALL be 6–15 seconds, vertical, playable, rights-safe, evidence-backed, and rendered from a non-placeholder source. Palette, voice, presenter, continuity, layout, and similar minor settings SHALL remain maker controls rather than duplicate proof cards.

#### Scenario: Operator explores proven capabilities

- **WHEN** the operator opens Explore Gallery
- **THEN** every visible card demonstrates material motion, narrative, capture, or source progression for its claimed format, links to one compatible exact maker preset, and the strongest proof leads each capability group

#### Scenario: A capability has only a fixture

- **WHEN** the only available artifact uses fixture posture, a generic SVG/UI renderer, lacks evidence, or is shorter than six seconds
- **THEN** it is excluded from the proven gallery and reported as unproven rather than counted as coverage

#### Scenario: Minor options remain available

- **WHEN** the operator chooses a representative capability and enters the maker
- **THEN** every compatible palette and minor setting remains selectable without requiring a separate gallery video

#### Scenario: A capable engine has meaningful range

- **WHEN** image generation, local video generation, ASCII, or Three.js has multiple materially different approved proofs
- **THEN** the gallery groups those proofs under one capability, labels their motion or behavior difference, and exposes each clip individually instead of hiding the range in a montage

#### Scenario: A range candidate is only cosmetic

- **WHEN** a candidate differs from its sibling only by palette, text copy, or another minor maker option
- **THEN** validation rejects it as a visible range proof and keeps that choice in the maker

### Requirement: Local creative-engine range

The visible gallery SHALL demonstrate the meaningful local range available without Grok. Image-generation proofs SHALL use generated raster assets and include explicit push-in, pull-out, pan, or depth motion. Local-video-model proofs SHALL expose distinct reviewed model outputs individually. ASCII proofs SHALL use distinct animated spatial grammars. Three.js proofs SHALL use distinct live WebGL scenes and camera paths. Grok SHALL remain explicitly unproven until approved evidence exists and SHALL NOT block the other local proof groups.

#### Scenario: Operator evaluates local creative range

- **WHEN** the operator filters to image, local-model, ASCII, or Three.js work
- **THEN** the gallery shows multiple substantive examples with clear motion labels and no generic UI or palette-only placeholders

#### Scenario: Grok is unavailable

- **WHEN** no approved Grok artifact exists
- **THEN** the gallery reports Grok as excluded while all other proven local-engine examples remain visible and playable

### Requirement: Truthful provenance and playback

Every visible gallery item SHALL identify its actual renderer, source posture, duration, evidence, spend posture, and compatible exact preset, and SHALL be served with inline MP4 byte-range support from an approved registered path.

#### Scenario: Representative proof is served

- **WHEN** the operator plays a visible gallery card
- **THEN** the exact registered substantive artifact is streamed and its displayed provenance matches the representative proof registry

#### Scenario: Representative media drifts

- **WHEN** a visible proof is missing, unreadable, hash-mismatched, non-vertical, silent when audio is claimed, outside the approved root, or below the duration floor
- **THEN** strict validation fails and the card is not presented as proven coverage

### Requirement: Showcase quality review

Every visible representative proof SHALL be reviewed across its full duration at a minimum cadence of one frame per second. The review SHALL score visual composition, meaningful motion, temporal coherence, legibility, and usefulness as a reusable capability proof. A technically valid clip that is static, repetitive, visually broken, misleading, or too weak to help the operator choose a style SHALL be improved, demoted from primary placement, or removed from proven coverage.

#### Scenario: A proof is technically valid but visually weak

- **WHEN** the one-frame-per-second review shows negligible progression, repeated near-identical frames, broken geometry, illegible text, or a result the operator would not intentionally reuse
- **THEN** the proof is not allowed to lead its family and is improved or excluded before the gallery is presented as best-foot-forward

#### Scenario: A proof passes the showcase gate

- **WHEN** the full-duration frame review demonstrates a clear visual idea, meaningful temporal progression, stable composition, readable content, and an honest match to the claimed engine
- **THEN** the proof may remain visible with its review evidence and quality disposition recorded

### Requirement: Artifact-first responsive comparison

Explore Gallery SHALL present one page heading and bring the representative films into the opening experience without an unrelated project selector or repeated hero. Filters SHALL remain reachable without colliding with Fleet shell controls, and an active style mix SHALL keep its ordered selections and completion action visible while the operator browses lower cards.

#### Scenario: Operator arrives on Explore Gallery

- **WHEN** the route renders at desktop or mobile width
- **THEN** the page contains one primary heading, a compact proof summary, the filter rail, and the first playable proof without a second introduction or project-scope control

#### Scenario: Operator scrolls on mobile

- **WHEN** the filter rail becomes sticky below the Fleet mobile menu
- **THEN** its first filter remains unobscured and horizontal overflow remains intentionally scrollable

#### Scenario: Operator creates a style mix

- **WHEN** one or more gallery styles are selected
- **THEN** a persistent tray exposes the ordered selection, clear action, and mix completion action until the selection is cleared or used
