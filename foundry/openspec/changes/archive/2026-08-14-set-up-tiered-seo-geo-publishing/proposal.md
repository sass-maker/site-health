## Why

Fleet now has a verified priority and sharing-readiness catalog, but its external SEO/GEO guidance is fragmented across dated shortlists and submission notes. The next step is a maintained, eligibility-aware publishing matrix that covers every P1 and P2 project plus every eligible finished P4 product without encouraging generic directory spam.

## What Changes

- Add one canonical external-publishing program keyed to Fleet project IDs.
- Require complete coverage of all P1 and P2 identities and every active, deployed, share-ready P4 product.
- Record project-specific narratives, assets, placements, execution mode, and content ownership instead of applying every venue to every product.
- Reconcile broad channel families with a concrete destination inventory that preserves maintained and research-only submission targets separately.
- Preserve non-shareable projects as preparation-only entries with their verified blockers.
- Generate a readable tiered document from the canonical program and validate it against `projects.json` so priority and readiness drift is caught.
- Document current venue eligibility and anti-spam rules, including cases where a product must not be submitted.

## Capabilities

### New Capabilities

- `tiered-external-publishing`: Defines coverage, channel eligibility, project-specific publication plans, execution ownership, and generated documentation for Fleet SEO/GEO distribution.

### Modified Capabilities

- None.

## Impact

- A new configuration file under `ops/config/` becomes the canonical strategy source.
- Project-catalog validation and documentation generation gain external-publishing and concrete-destination coverage checks plus generated human-readable guides.
- Existing growth outcome ledgers and submission receipts remain authoritative for executed placements; this change does not publish, deploy, or submit anything externally.
- No production dependencies or runtime product behavior change.
