## ADDED Requirements

### Requirement: UGC experiment lineage survives media handoff
Reel Pipeline SHALL accept approved UGC native-edit packets and creator cuts
without replacing their experiment, positioning, format, hook, creator,
execution, revision, rights, disclosure, or product-proof attribution.

#### Scenario: Review a submitted creator cut
- **WHEN** a creator cut enters Reel Pipeline
- **THEN** the review artifact and receipt retain the complete Day 0 lineage and immutable source hash

### Requirement: Native creator production does not require Fleet rendering
Reel Pipeline SHALL allow an approved creator cut to proceed through technical
review and Postiz draft handoff without forcing it through a generated or
template renderer.

#### Scenario: Creator submits a native TikTok edit
- **WHEN** the cut passes rights, disclosure, product-proof, and technical review
- **THEN** the original creator media may become the reviewed artifact while Reel Pipeline records provenance and quality evidence
