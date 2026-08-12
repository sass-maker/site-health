## Context

See `proposal.md` for motivation. The catalog currently stores owner priority
in `_meta.priorities`, while project rows separately carry overlapping
`attention`, `tier`, `lifecycle`, and deployment-status fields. Several private
projections read the priority buckets directly, and the generated Markdown is
organized by broad attention buckets.

## Goals / Non-Goals

**Goals:**

- Put the five owner-facing classification fields together on every project.
- Make per-project priority canonical and remove hand-maintained priority
  membership arrays.
- Preserve detailed lifecycle, deployment, provider-resource, and public
  metadata used by existing operational systems.
- Fail closed on missing coverage and contradictory booleans.

**Non-Goals:**

- Inferring product completion beyond explicit archived state and the owner's
  stated finished-project decisions.
- Claiming a project is share-ready without an existing public listing, domain,
  active posture, and deployment evidence.
- Removing legacy operational fields used by automation in this change.
- Deploying, publishing, archiving repositories, or changing cloud resources.

## Decisions

### Store classification in one `portfolio` object per project

Each project receives:

```json
{
  "portfolio": {
    "kind": "product",
    "priority": "P2",
    "status": "active",
    "deployed": true,
    "readyToBeShared": true,
    "sharingReadiness": {
      "verifiedAt": "2026-08-11",
      "reason": "Verified active, deployed, live canonical public surface with a maintained listing."
    }
  }
}
```

Nesting avoids colliding with the existing technical `status` field, whose
values describe runtime posture rather than active/archive ownership. The
alternative—adding more top-level fields or immediately renaming legacy
fields—would create a wider compatibility migration without improving the
operator view.

### Preserve priority and derive conservative initial values

The catalog uses P1, P2, and P4; P0 and P3 are omitted. P1 contains exactly CodeVetter,
Pace, PostTrainLLM, and Office OS (`agent-office`). Archived projects move to
P4. P2 is the only middle tier and represents active agent focus rather than a
lifecycle or completion claim. All former P3 projects move to P2 because the
owner does not have a useful distinction between the two tiers.

The owner subsequently classifies Drank, Free AI, and PSI Swarm as finished, so
they move to P4 while remaining active and deployed. Research Papers moves to
P3. Fleet Workflows is an implementation extension of Fleet Workspace rather
than a standalone project: remove its project row, preserve `fleet-workflows`
and `workflows-repo` as Fleet Workspace aliases, and merge the GitHub Actions
deployment into Fleet Workspace infrastructure.

The next owner pass marks Email Manager, India Standards, Chess, Anime List,
LoopTV, and What It Takes to Win as finished, moving them from P3 to P4 while
preserving their active/deployed truth. It also reduces kinds to three:
Starboard, App Health, Drank, Research Papers, and Reddit Insights are products;
Knowledge Base, Free AI, and PSI Swarm are platforms; experiment remains for
non-offering prototypes and research surfaces.

The owner classifies the archived Verified Bases, Open Historia, Today Little
Log, TrueHire, Protein Index, Materia, and EverythingRated identities as
experiments rather than products. Their P4 priority, archived status,
deployment evidence, and retained cloud resources remain unchanged.

Mashup's own 2026-08-09 `PROJECT_STATUS.md` supersedes the stale historical
catalog note: it is now an independently owned, maintained, local-first Fleet
helper under `foundry/helpers/mashup`. It therefore becomes an active P2
experiment. Because it has no distributed provider-hosted surface and never
publishes media, `deployed` and `readyToBeShared` remain false.

The owner subsequently marks Reddit Insights finished. It moves from P2 to P4
while retaining its active, deployed, and non-share-ready operational truth.

`status` maps maintained and non-product identities to active and past
identities to archived. `deployed` is true when current infrastructure evidence
shows a usable live or retained distributed surface, and false for deleted,
undeployed, configured-only, or local-only posture. `readyToBeShared` starts
true only for an active deployed project with an explicitly maintained public
listing and canonical domain.

Every readiness boolean carries a required `sharingReadiness.verifiedAt` date
and a concise evidence or blocker reason; the generator exposes both so an old
judgment cannot look current by accident.

### Keep P2 broad but bound operational focus through GitHub

P2 is the pool of active non-P1 work, not a second task database and not a
claim that all 18 projects should be worked simultaneously. GitHub Issues
remains the only operational tracker. Agents select work from open issues and
name no more than five P2 project identities in a current work cycle. This
avoids recreating P3 or adding a drifting `currentFocus` field to the catalog.

### Separate P4 presentation without adding state

P4 intentionally combines owner-finished work that remains active with
archived history. The generated catalog renders those as `Finished (active)`
and `Archived`, then groups each section by kind. This derives entirely from
the existing portfolio status and introduces no duplicate completion field.

### Make the catalog an operating control plane

The readable document explains what happens after classification: P1 receives
continuous owner-led improvement; P2 supplies bounded issue-driven agent work;
share-ready active projects enter publishing and distribution planning; P4
active projects receive maintenance and evergreen promotion only; archived P4
projects receive preservation and retained-resource review. Cloudflare coverage
must state its evidence level rather than imply provider enumeration where only
known-name probes or configuration-derived bindings are available.

### Use three stable kinds

- `product`: a standalone end-user offering or public property.
- `platform`: a shared capability, infrastructure service, or orchestration
  surface used by other products.
- `experiment`: a proof, prototype, or research surface not operating as a
  maintained standalone product.

Kinds are assigned explicitly rather than inferred at generation time. This
makes the owner's later rearrangement reviewable and prevents a lifecycle or
deployment change from silently changing what a project is.

### Keep legacy attention fields as compatibility metadata

Existing automation still uses attention and lifecycle for eligibility,
privacy, and owner-routing behavior. This change stops using attention for the
human catalog but does not reinterpret those downstream policies. A later
change may retire legacy fields after every consumer has a replacement.

## Risks / Trade-offs

- **Initial kind assignments may not match owner taste** → provide complete,
  conservative defaults and make the generated grouping easy to rearrange.
- **Portfolio and legacy lifecycle fields can drift** → validate active/archive,
  deployment, and readiness invariants against durable project and
  infrastructure evidence.
- **P4 combines finished and archived work** → keep status visible beside
  priority and render separate P4 status sections so retained archived
  deployments cannot be mistaken for active finished products.
- **Readiness booleans become stale or opaque** → require a dated reason on
  every project and display it in the generated catalog.
- **P2 is too broad for immediate focus** → keep GitHub Issues authoritative
  and cap any stated agent work cycle at five P2 project identities.
- **Removing priority buckets can break consumers** → migrate every direct
  `_meta.priorities` reader in the same change and retain focused tests.

## Migration Plan

1. Add complete `portfolio` objects to all current identities.
2. Migrate validation and priority consumers to per-project priority.
3. Remove `_meta.priorities` after no reader depends on it.
4. Apply the owner-approved P1/P2/P4 semantics and reconcile Office OS plus Local
   AI Video Studio against the refreshed Cloudflare Pages inventory.
5. Apply the owner follow-up classifications and consolidate Fleet Workflows
   into Fleet Workspace without dropping its deployment evidence.
6. Remove the utility kind, apply the explicit product/platform assignments,
   and move the newly finished projects to P4.
7. Reclassify the seven owner-named archived identities as experiments without
   changing their operational evidence.
8. Merge every P3 identity into P2 and reactivate Mashup from its current
   independent-helper source of truth.
9. Move owner-finished Reddit Insights from P2 to P4.
10. Add dated sharing-readiness reasons, split P4 presentation by status, and
    document the bounded GitHub-Issues focus rule plus downstream use.
11. Regenerate the operator catalog and dependent registries.
12. Run focused catalog tests, registry checks, and the full Fleet suite.

Rollback is a source-only revert; there is no provider or production mutation.
