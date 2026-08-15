## Why

Platform matching currently filters only by artifact type, so every product is
offered the same directories and syndication destinations even when their
audiences are unrelated. Explicit audience-fit signals are needed now to keep
campaign queues relevant, auditable, and worth the accreditation effort.

## What Changes

- Add a validated audience taxonomy and explicit audience tags for Fleet
  products and external platforms.
- Keep `artifactFit` as the outer routing filter, then intersect product and
  platform audience tags before a destination can be matched.
- Return a deterministic fit score and the matching audience tags as evidence
  for every matched destination.
- Classify artifact-compatible destinations with missing or non-overlapping fit
  signals as `unclassified` instead of including them in campaign queues.
- Order matched and verification destinations by audience fit, with stable
  platform-ID ordering for ties.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `product-platform-matching`: require explicit, evidence-bearing audience fit
  after artifact routing and expose unclassified destinations separately.

## Impact

This changes the Fleet Ops platform matcher, its configuration and validation,
queue output, tests, and operator documentation. It does not add dependencies,
deploy production code, or perform external writes.
