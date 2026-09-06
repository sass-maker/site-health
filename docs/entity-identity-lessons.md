# Entity identity: what the audits were missing

Lessons from the SAR-9 consolidation pass. The decisions themselves live in
`saas-maker/tooling/config/entity-identity-canonical.json`; this page is only the
reusable part — the failure shapes that produced them.

## 1. Presence is not identity

`agent-ready` scores a surface on whether `/llms.txt`, `/api/ai` and JSON-LD
**exist**. It never asks whether they **agree**. Every fleet surface scored S-tier
while eight of them published a different product name to agents than they
published in markup.

`entity-identity-live.mjs` exists to close that gap: it fetches those channels and
compares them to `geoIdentities[].name`. Current state: 24/32 surfaces declare one
consistent name.

### 1a. Auditing only the agent endpoints undercounts

The first version of the prober read the three channels above and stopped. All
three exist to talk to agents — which quietly assumed the entity-resolution
problem lives in agent-facing endpoints. It doesn't. `heypace.app` publishes the
retired name in its `<title>` too, and a title is the first name-bearing thing a
search crawler reads.

Adding `<title>` as a fourth channel changed no surface's verdict — the three
surfaces it caught (`pace`, `psi-swarm`, `drank`) were already drifting elsewhere.
That is worth stating plainly rather than dressing up as a save: the miss was real
but it was a *reporting* gap, not a hidden defect. A per-surface count hides how
wrong a surface is, and "fix the title too" is a different work item from "fix
llms.txt".

The channel is tested differently from the others, and the difference is the
reusable part. `/llms.txt` and `/api/ai` assert *name = X*; a `<title>` is prose
that merely contains the name. So it is checked by **containment, not
extraction** — asking which recorded form of the name is present, never guessing
where the name ends in `Pace — private Mac voice agent that sees your screen`.
Word boundaries are letter/number aware rather than `\b`, so `Pace` does not match
inside `HeyPace`; without that, the one surface that gets the name right would be
scored as publishing the retired one.

## 2. Agreement with yourself is not agreement

The sharper version of the same mistake, and the one that cost the most.

`entity-identity-diff.mjs` compares six fields across four sources. For `pricing`,
only one source was ever populated — the registry. The other three columns were
structurally always empty. So the verdict column printed:

```
| pricing | `not-declared` | — | — | — | agrees, missing in directory/github/docs |
```

on all 32 surfaces, forever. It read like a clean row. It was the registry being
compared against itself and, unsurprisingly, matching.

Two products were live with published pricing behind that "agrees":

- **High Signal Podcasts** — `/pricing` shipped with a full access declaration.
  Caught by hand, by another agent, not by the audit.
- **RolePatch** — `/pricing` publishes three token packs at $5 / $12 / $30.
  A product that charges real money, recorded as `not-declared`. A model asked
  what it costs had nothing authoritative to read.

Two fixes landed:

- The diff tool no longer prints `agrees` when `declaredCount === 1`. It now says
  *"only registry declares it — nothing to compare"*, which is what was true.
- The live prober now probes `/pricing` on every registry surface, so the field
  has a real second source. It reports only whether a declaration **exists** — it
  does not try to read "free" or "paid" out of prose, because a probe that guesses
  is worse than one that asks.

**The generalisable rule:** a verdict computed from one populated source is not a
pass, it is an untested field. Any audit row that cannot possibly fail should be
treated as absent, not as green.

## 3. Soft 404s will fake a pass

Static hosts and SPAs answer unknown paths with a 200 and the same fallback
document. A naive `GET /pricing` check would have reported a pricing page on every
surface in the fleet.

The prober fetches a path that cannot exist
(`/entity-identity-live-control-a7f3c9`) and compares `<title>`. If `/pricing` is
indistinguishable from a made-up path, it is the fallback, not a declaration.

Any future live probe for a *specific page* needs this control. Reuse it.

## 4. `published` is not a weaker `free`

`podcasts.highsignal.app/pricing` says: no account or charge today, and explicitly
*"does not promise a permanent pricing model"*.

Flattening that to `pricing.state: free` would launder a careful non-promise into a
permanent commitment the product never made — and it would be quoted back at it
later. `published` asserts only that the answer is declared and reachable, which is
both true and what an entity-resolving model actually needs.

This looked like a schema gap ("there's no value for *no charge today, no model
promised*"). It wasn't. See `pricingStates` in the canonical decisions file for
what each state asserts.

## 5. The deployed surface wins

When internal records and a live surface disagree on a name, and the rename is
evidenced in the owning repo, that is not a two-source conflict to escalate. It is
internal records failing to follow the product. Escalate only when the live surface
is itself ambiguous.

Applying that rule surfaced a seventh renamed product nobody had listed
(`paths.significanthobbies.com` had been live as **Look Sideways** for two commits
while both the registry and the directory still said *What It Takes to Win*).

Full tiebreak order: `authorityOrder` in the canonical decisions file.

## 6. A component that is written, tested, and never mounted

Not a rule, but the shape recurs and it is worth recognising.

`highsignal.app/#organization` is referenced as `publisher` / `author` / `creator`
by 14 call sites in `high-signal/apps/web/src/components/seo/json-ld-builders.ts`
and is declared nowhere in the live graph — the apex resolves to `Person`,
`WebSite#app` and an anonymous `WebApplication` only.

The cause is not a missing node. `buildOrganizationJsonLd()` is fully written,
covered by `scripts/seo-json-ld.test.ts`, and wrapped in a `SiteOrganizationJsonLd`
component whose own docstring says *"Ship in the root layout so every page carries
it."* That component is exported and imported by nothing.

Before writing the thing that is missing, grep for it. It may already exist and
simply never have been mounted.

## 7. Description is not an identity field, and the issue's own boundary proves it

SAR-9's deliverable table asks for six fields identical in four places. Five of
them are identity values — a URL is the same URL or it is a different one.
`description` is not. A GitHub repo description describes a *repository*, a meta
description is written for snippet length and search intent, and the directory
one-liner is brand positioning. Forcing byte-equality would degrade three of the
four surfaces, and the same issue's boundary says **do not rewrite positioning
copy**. So `identical` could not be the bar without the standard contradicting
the boundary that constrains it.

The bar is `non-contradiction`: each surface keeps copy fit for its purpose, but
none may publish a retired name, name a different registered product as its
subject, or drop the product's category entirely. Three mechanical checks in
`entity-identity-diff.mjs`, config-driven per surface, `--standard=identical`
still available.

Effect: **7 description conflicts across 7 surfaces became 2 contradictions.**
The other five were the same product described at different lengths for
different audiences — noise that would have cost five rewrites to silence.

The general lesson: when a spec asks for equality on a field, check whether the
field is an *identifier* or a *description of the thing identified*. Only the
first kind can be made equal without losing information.

## 8. Repo source is a proxy for the public surface — until it isn't

`entity-identity-diff` reads the `docs` channel out of repo source rather than
fetching, which is fast, offline, and correct for six of the seven surfaces.

For `significanthobbies` it is not, and it produced a wrong finding I published
before catching it. `origin/main`'s `layout.tsx` declares a `WebSite` node at
`@id …/#app` carrying **Live's** one-liner; the deployed apex declares
`@id …/#website` with the correct hub description, and neither the title nor the
meta description match between them. The repo is in sync with its own origin —
it simply is not what is deployed.

Two rules out of it:

1. **A finding about repo source is a finding about the repo.** The canonical
   record's `authorityOrder` already puts the deployed surface first; the tool
   reading second-place evidence has to say so, and now does
   (`$comment` on that surface in `entity-identity-sources.json`).
2. **Probe the live host before publishing an entity claim about it.** One
   `curl` would have caught this before the GitHub issue went out. It cost a
   correction on a public repo.

## 9. `seo-audit` cannot see an entity handover

`significanthobbies.com` passes `seo-audit` **15/15**, `json-ld` included, while
its `/api/ai` 308-redirects to Live's catalog and its `/llms.txt` opens
`# Live by Significant Hobbies`.

`seo-audit` checks that structured data is present, parses, and is
well-formed. It has no opinion on whether the entity described is the one that
owns the host. `agent-index-audit` caught it (A / 70%, the only surface below
S-tier) because it validates the machine catalogs against the canonical
project list.

Two audits, two questions. A green `seo-audit` is not evidence that a model can
resolve who you are.
