## Purpose

Define trustworthy public product sites and gated direct-download channels for
Fleet-owned native Mac applications that are prepared locally but not yet safe
for public binary distribution.

## ADDED Requirements

### Requirement: Each product has one truthful public product surface
Office OS and Local AI Video Studio SHALL each expose one responsive public
site that identifies the native Mac product, explains its real shipped workflow,
states its system requirements and local-data posture, and uses evidence from
the corresponding application rather than invented future capability.

#### Scenario: Visitor evaluates a product before a binary is available
- **WHEN** a visitor opens either product site before a trusted DMG has passed
  the release gate
- **THEN** the site explains the current product and distribution status without
  presenting an active download or implying that a public release already exists

#### Scenario: Product claims drift from the native repository
- **WHEN** a site claim cannot be supported by the product status, source, or
  verified native evidence
- **THEN** the public-surface check fails until the claim is removed or grounded

### Requirement: Public design preserves each native product identity
The Office OS site MUST preserve the established Editorial Office language and
the Local AI Video Studio site MUST preserve the approved Optical Printer Bench
language. Each surface SHALL pass the Fleet design-review contract at 390, 768,
and 1440 pixel widths with zero unresolved P0 or P1 findings.

#### Scenario: New video-studio landing page is reviewed
- **WHEN** the Local AI Video Studio site is considered ready to publish
- **THEN** its receipt records the delegated preserve direction, native-product
  evidence, required viewport captures, passing critique and audit scores, and a
  passing site check

#### Scenario: Office landing page is prepared for deployment
- **WHEN** the existing Office OS site is prepared as the canonical public page
- **THEN** its receipt proves the deployed build still follows the Editorial
  Office direction and remains usable at every required width

### Requirement: Direct downloads fail closed on Apple trust verification
A product site MUST NOT expose a DMG download until the exact artifact has a
valid Developer ID Application signature, successful Apple notarization, a
valid stapled ticket, a passing Gatekeeper assessment, and a published SHA-256
checksum.

#### Scenario: Only an ad-hoc signed DMG exists
- **WHEN** the latest local artifact has no Developer ID team identity or valid
  notarization ticket
- **THEN** the site renders a non-interactive distribution-preparation state and
  emits no binary URL

#### Scenario: Trusted release artifact passes every gate
- **WHEN** the exact DMG passes signature, notarization, stapling, Gatekeeper,
  architecture, version, and checksum verification
- **THEN** the product site may expose that versioned artifact and its checksum

### Requirement: Release trust information is visible and complete
Before a product is classified ready to share, its site SHALL expose a privacy
statement, system requirements, version/build identity, support contact, release
status, and the checksum for any downloadable artifact.

#### Scenario: Support contact is absent
- **WHEN** no owner-approved public support contact is configured
- **THEN** the product remains not ready to share even if its informational site
  is live

#### Scenario: Download metadata does not match the artifact
- **WHEN** the displayed version, architecture, filename, or checksum differs
  from the verified DMG
- **THEN** release verification fails and the download remains unavailable

### Requirement: Cloudflare Pages ownership is deterministic
Office OS and Local AI Video Studio SHALL each use one repository-owned static
site and one manually deployed Cloudflare Pages project. Deployment commands
MUST be pinned, must identify the intended project explicitly, and MUST NOT
publish app binaries as a side effect of building the informational site.

#### Scenario: Informational site is deployed before Apple credentials exist
- **WHEN** an operator deploys the verified static site while the trusted DMG
  gate remains closed
- **THEN** Cloudflare serves only the informational site and no unsigned binary

#### Scenario: Deployment targets the wrong project
- **WHEN** the configured Pages project does not match the product's canonical
  release metadata
- **THEN** the deployment check fails before upload

### Requirement: Fleet state follows verified live evidence
Fleet catalog and automation state MUST remain local-only until the canonical
site responds successfully and MUST remain not ready to share until the support
and trusted-download gates pass.

#### Scenario: Site is live without a trusted DMG
- **WHEN** the canonical product URL passes public smoke but no trusted artifact
  is available
- **THEN** Fleet records the product as deployed with a live informational site
  while retaining `readyToBeShared: false`

#### Scenario: Full release channel passes
- **WHEN** the canonical site, support information, trusted DMG, checksum, and
  public smoke checks all pass
- **THEN** Fleet may mark the product ready to share and include the verified
  download journey in ongoing public-product smoke coverage
