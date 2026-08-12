## Why

Office OS and Local AI Video Studio now have verified native Mac builds and
repeatable local packaging, but both remain classified as local-only and lack a
safe public release channel. The owner has approved preparing public product
sites, while Apple distribution credentials are still unavailable, so the web
surfaces must establish product trust without exposing unsigned artifacts.

## What Changes

- Publish a responsive Office OS product site from its existing Editorial
  Office landing surface.
- Add a new Local AI Video Studio product site that preserves the approved
  Optical Printer Bench visual language and uses real native-product evidence.
- Provision one Cloudflare Pages project per product with deterministic,
  repository-owned build and manual deployment commands.
- Keep download controls explicitly unavailable until the corresponding DMG is
  Developer ID signed, notarized, stapled, and independently verified.
- Add privacy, system-requirement, support, and release-status information needed
  for a trustworthy direct-download handoff.
- Update Fleet project, marketing, automation, and generated catalog state only
  after each public surface and canonical URL are verified.

## Capabilities

### New Capabilities

- `mac-product-release-channels`: Defines trustworthy public product sites and
  gated direct-download channels for Office OS and Local AI Video Studio.

### Modified Capabilities

None.

## Impact

- Repositories: `agent-office`, `local-ai-video-studio`, and Fleet Workspace.
- Surfaces: two static marketing sites, Cloudflare Pages projects, release
  metadata, public smoke coverage, and Fleet registries.
- Distribution: no app binary becomes public until Developer ID and notarization
  verification passes; this change does not accept Apple agreements, create
  credentials, or publish an unsigned DMG.
- Dependencies: existing Apple tooling, repository-local static-site tooling,
  Cloudflare Pages, Fleet design-review evidence, and public-product smoke
  checks. No production runtime dependency is added.
