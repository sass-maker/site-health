# Entity disambiguation — the High Signal cluster

Triage of the SAR-11 finding that High Signal reads 33% mentioned / **0% cited**
and High Signal Podcasts reads **0 / 0** across all 12 of its capture units.
Source: [`ai-visibility-baseline-latest.md`](./ai-visibility-baseline-latest.md).

This is evidence, not applied work. SAR-9 remains blocked on SAR-2; nothing here
has been written to a product repo.

## What the panel evidence changes

SAR-9's deliverable table has six fields — name, one-line description, canonical
URL, docs URL, repo URL, pricing — each required to be identical across four
places. **None of them is a disambiguation field.** Making all six agree would
not have fixed High Signal, because the collision is with an *external* entity
(`highsignal.io`, `high-signal.delphina.ai`). Internal consistency is necessary
for resolvability and not sufficient for it.

The gap the panel exposes is the outbound identity edges: `sameAs`,
`parentOrganization` / `isPartOf`. Those are what a consumer follows to decide
that two mentions are the same thing, and they are the fields we never wrote
down. Proposed amendment in [Scope amendment](#scope-amendment) below.

## Finding 1 — the "High Signal" Organization contradicts itself

The same real-world organization is declared at two IRIs with two different
`sameAs` GitHub orgs, on two of our own properties.

| Property | Node | `sameAs` |
| --- | --- | --- |
| `podcasts.highsignal.app` | `Organization @id=https://podcasts.highsignal.app/#organization`, `name: "High Signal"`, `url: "https://highsignal.app"` | `https://github.com/Significant-Hobbies` |
| `highsignal.app` | `Organization @id=https://highsignal.app/#organization` — **built but never mounted** | `https://github.com/High-Signal-App/high-signal` |

- `on-record/apps/web/src/layouts/Base.astro:22-34` ships the first.
- `high-signal/apps/web/src/components/seo/json-ld-builders.ts:81-92` builds the
  second; `structured-data.tsx:50` wraps it as `SiteOrganizationJsonLd()`. The
  only references to that component in the repo are its own definition and
  `scripts/seo-json-ld.test.ts:52`. It is never rendered.

So the only `Organization` that actually ships for "High Signal" lives under the
**subdomain's** namespace and points at the **wrong** GitHub org — the one that
belongs to the Significant Hobbies family. `highsignal.app` itself ships no
Organization node at all, while `layout.tsx:121` inlines a `WebSite @id=#app`
whose `publisher` is `sarthakagrawal.dev/#person`.

`sameAs` is the primary entity-reconciliation edge in schema.org. Ours
disagrees with itself across two properties of the same product family. This is
a concrete, mechanical reason the entity fails to resolve, and it is fixable
without touching a word of brand copy.

## Finding 2 — no anchor to the directories that own the answers

High Signal Podcasts' answers go to `podchaser.com`, `podcasts.apple.com`,
`rephonic.com`, `listennotes.com`. Its complete external identity surface in
structured data is **one GitHub org link**. There is:

- no `sameAs` to any podcast directory,
- no `PodcastSeries` or `PodcastEpisode` type anywhere in the app,
- no `Organization.sameAs` that a directory could match against.

The aggregators do not own the answer because they outrank us. They own it
because they are the only resolvable identity for the show.

## Finding 3 — one product, six names

| Where | Name |
| --- | --- |
| `projects.json` `name` / `public.name`, `og:site_name`, `WebSite.name` | High Signal Podcasts |
| `WebSite.alternateName` (`Base.astro:40`) | On the Record |
| project id, repo name | `on-record` |
| Cloudflare Worker (`deployTargets[].name`) | `high-signal-podcasts` |
| GitHub org holding the repo | `Significant-Hobbies` |
| host | `podcasts.highsignal.app` |

The repo lives in a **sibling family's** GitHub org while the domain sits under
the High Signal apex. That single mismatch is what produces the contradictory
`sameAs` in Finding 1 — the schema author linked the org the repo is actually
in.

## Finding 4 — What It Takes to Win calls itself something else

The panel noted WITTW's answers cite `significanthobbies.com` while its own host
is `paths.significanthobbies.com`, so it scores 0. The cause is in its own
graph (`what-it-takes-to-win/src/pages/index.astro:40-68`):

- `WebSite @id=https://paths.significanthobbies.com/#website`,
  `name: "Look Sideways"` — not "What It Takes to Win", which is the name in
  `projects.json`, in `geoIdentities`, and in the SaaS Maker directory.
- `Dataset.name: "Look Sideways documented paths"`. Page title
  "Look Sideways — The Path You Remember Is One of Many".
- **No `Organization` node at all**, and **no edge of any kind** to
  `significanthobbies.com` — no `isPartOf`, no `parentOrganization`, no
  `sameAs`.

Sibling-property citations cannot accrue because we never declared the sibling
relation. Adding the edge is structural, not a rebrand; whether the public brand
is "Look Sideways" or "What It Takes to Win" is a substance disagreement between
two sources and goes to escalation under the issue's work-order step 2, not to
a guess.

Cloudflare project name for this surface is `success-by-26`, a seventh string.

## Finding 5 — registry coverage and flag disagreement

- `on-record` is **absent from `geoIdentities`** (31 entries) although it is one
  of SAR-9's six named surfaces and a declared AI-visibility surface. Of the four
  places the deliverable requires to match, High Signal Podcasts is present in
  the registry in zero of them.
- `projects.json` marks it `inRegistry: false`, yet it **is** present in
  `publicDirectory.projects` (56 entries). Those two flags disagree; one of them
  is wrong and the directory projection is generated from this file.
- `geoIdentities.high-signal.aliases` is `[]`, on the one surface with a proven
  external name collision. The `aliases` field exists and is unused where it
  matters most.

## Finding 6 — stale counts, same class as the WITTW open item

| Source | Claims | Recommendations | Episodes |
| --- | ---: | ---: | ---: |
| SAR-9 issue description | 166 | 183 | 139 |
| `projects.json` `sharingReadiness` (verified 2026-08-28) | 11,624 | 294 in 281 groups | 1,190 |

Two orders of magnitude apart. `on-record` belongs in the stale public dataset
count reconciliation alongside `what-it-takes-to-win`, which the issue already
names as a known open item.

## Scope amendment

Proposed for the SAR-9 deliverable table — two rows, same "identical across four
places" rule:

| Field | Why |
| --- | --- |
| `sameAs` — external identity anchors | The reconciliation edge. Must agree across properties, and must point at the org that actually holds the repo. For directory-owned categories (podcasts), must include the directory profiles. |
| `parentOrganization` / `isPartOf` — family relation | Makes sibling citations accrue. `on-record` → High Signal; `what-it-takes-to-win` → Significant Hobbies. Both families are already declared in `projects.json` as `family`; neither is expressed in structured data. |

`geoIdentities` has no field for either today. The registry schema needs both
before the values have anywhere to live.

## What is not established here

- **No causal claim from the panel numbers.** n = 7 surfaces, one column, one
  capture date. The four cited surfaces do not share a single structural
  property the three uncited ones lack — PostTrainLLM was cited twice and ships
  no `Organization` node either. These findings stand on the graph being
  internally contradictory, which is independently wrong, not on correlation
  with citation counts.
- **Which brand name is canonical** for `what-it-takes-to-win` and for the
  `on-record` / "On the Record" pair. Two sources disagree on substance;
  escalation, not a pick.
- **Nothing has been applied.** No product repo touched, no `projects.json`
  edit, no directory projection regenerated.

## On unblock

1. Escalate the two name questions in Finding 4 and Finding 3.
2. Amend the `geoIdentities` schema with `sameAs` and `parentOrganization`.
3. Reconcile the contradictory `sameAs` in Finding 1 — this also requires
   resolving the duplicate `WebSite` node (`@id=#app` inlined in `layout.tsx:121`
   vs `@id=#website` from the builder) before `SiteOrganizationJsonLd` can be
   mounted, per the SAR-18 handoff.
4. Add `on-record` to `geoIdentities`; reconcile `inRegistry` against
   `publicDirectory`.
5. Re-run `agent-ready` and `seo-audit` on `highsignal.app`,
   `podcasts.highsignal.app`, `paths.significanthobbies.com`.
