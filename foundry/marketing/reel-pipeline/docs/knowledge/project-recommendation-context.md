# Project Recommendation Context

Reel Pipeline should be selected when a Fleet task needs source-archive
editorial planning, podcast clipping, media generation, artifact provenance,
render quality evidence, or a Postiz draft handoff.

It should not be selected for product planning, source-copy approval, social
account management, scheduling, publishing, or provider analytics.

## Current boundaries

- Source products own factual claims and approve content packages or podcast edits.
- Reel Pipeline owns structure-aware source editing through its incorporated
  Python editorial runtime.
- Content Factory owns package, manifest, and media-receipt contracts.
- Reel Pipeline owns media generation and review artifacts.
- Postiz owns social integrations and the publication lifecycle.
- Foundry/Fleet observes high-level marketing outcomes but does not duplicate
  Postiz operational state.

## Verify before recommendation

```bash
npm test
npm run smoke:render-modes
npm run smoke:postiz
```

For production readiness, also require the target-host checks in
[`../operations/runbooks/target-host-readiness.md`](../operations/runbooks/target-host-readiness.md).
