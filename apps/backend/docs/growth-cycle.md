# Search and AI growth cycle

MentionPilot's brand evidence lives in Site Health's **AI Awareness** area.
Growth cycle adds the execution loop inspired by [FirstIndex](https://firstindex.com/):
research → page mapping → draft/fix → independent QA → publication receipt →
measurement → evidence-led refresh. It does not install, buy or call FirstIndex.

The private brand-evidence SQLite database holds plans and artifacts. Delivery
issues, code, builds and publishing remain in the owning product's repository.
Shared operating guidance is SaaS Maker's `agentic-seo` skill. No new paid
provider, CMS or outbound messaging connection is required by this feature.

## Run a cycle

From the Site Health checkout:

```sh
node apps/backend/scripts/brand-evidence.mjs profile <project> --input /private/profile.json
node apps/backend/scripts/growth-cycle.mjs view <project>
node apps/backend/scripts/growth-cycle.mjs apply <project> --input /private/change.json
```

Use a current checkout containing the CLI. If the primary checkout is behind
with other agents' dirty work, preserve it and inspect `git worktree list --porcelain`
for a verified current checkout. Its relative catalog link may be unavailable;
pass `--registry ~/Desktop/fleet/saas-maker/catalog/generated/operations.json`
to growth commands to read the canonical generated project registry. This flag
does not copy or edit catalog policy. Do not use a synthetic registry for real work.

`view` returns schema `site-health.growth.v1`, revision, readiness gaps, cycles
and tasks. Every change must include that exact `revision` and a `command`.
On conflict, reload and inspect the result before retrying. `plan` records the
current UTC Monday week and five bounded reviews: research, keyword mapping,
index access, brand facts/conversion paths and the weekly outcome report.
Repeated plans do not duplicate the week or unresolved work. Completed negative
AI observations retain their API/consumer channel; failed calls do not become
missing mentions. No provider calls occur during planning.

The dashboard's **Plan this week** button uses the same operation. The agent
uses the CLI for artifacts and reviews; the dashboard displays their current
state. A schedule is not installed implicitly. Use an already authorized weekly
runner only for the named project and execution scope.

## Change contract

All commands below also require `revision`. Times are ISO timestamps. Evidence
objects have `{url, observedAt, note}` with a credential-free HTTP(S) URL and a
specific observation note. Source data, drafts and analytics belong outside Git.

| Command | Additional input |
| --- | --- |
| `plan` | None. Creates local review tasks only. |
| `add` | Strings `kind`, `title`, `intent`, `targetUrl`, `brief`, `baseline`; array `evidence` (1–20 evidence objects). Optional strings `keyword`, `issueUrl`, `refreshOf`. |
| `draft` | `taskId`, `content`, `author`. Returns the content SHA-256 `draft.digest`; changing content clears its review. |
| `brief` | `taskId`, string `brief`. Optional string `baseline`, evidence array `evidence`, and URL string/null `issueUrl`. Updates existing unpublished work without changing its intent/URL; invalidates QA. |
| `review` | `taskId`, current `digest`, different `reviewer`, `checks` below. All pass → ready; any fail → changes-requested. |
| `publish` | `taskId`, current `digest`, object `receipt: {url, observedAt, note, revision}`. `receipt.revision` is the published source revision string; top-level `revision` is the store revision integer. Ready work only; receipt time must follow review and cannot be future. |
| `measure` | `taskId`, `measurement` below. Requires a publication receipt. |
| `complete` | `taskId`, one object `evidence: {url, observedAt, note}`. Completes only research, mapping, index/fact checks and reports. Records work done, without claiming growth. |
| `park` | `taskId`, specific `reason`. Retains prior evidence. |

Kinds: `research`, `keyword-map`, `article`, `comparison`, `free-tool`,
`page-fix`, `index-check`, `fact-check`, `listicle-outreach`, `directory`,
`social`, `report`. A researched intent maps to one page. Reuse existing work;
after publication, a refresh must cite its task id with `refreshOf` and keep the
same URL. A sourced urgent fact/technical fix need not wait for traffic metrics;
retain unavailable baselines and the earlier task's pending measurements. Reuse
any open refresh instead of duplicating it. Park obsolete mappings before replacing them.

Briefs should name the audience, intent, existing/new/refresh rationale, sources,
outline or exact fix, claim ledger, internal links, image plan, CTA/event and next
observation window. `baseline` must state real evidence or its unavailability.
Unknown traffic, search volume and conversions are never synthesized.

`checks` must contain all six keys, each with `{passed: boolean, note: string}`:
`readability`, `originality`, `seo`, `claims`, `images`, `cta`. These are explicit
reviewer attestations, not an automated claim that prose is correct. Inspect the
actual draft and rendered preview; fix failed checks before publication. Use
bounded rewrites, then park unresolved evidence/access gaps.

`publish` **records a supplied receipt** after the agent has published through
the existing authorized path and read the live result. It performs no CMS write,
deployment, indexing submission, directory submission or outreach send. A URL
and receipt do not establish indexing, ranking, editorial placement or AI uptake.
Independent live verification is the agent's responsibility, not performed by
this store. Published drafts are immutable here; make a sourced refresh task.

`measurement` is an object with evidence fields plus strings `windowStart`, `windowEnd`, `attribution`
(property, page/filter scope, source and conversion event), and `conclusion`
(observed result and comparison limits). Optional nonnegative counts are
`impressions`, `clicks`, `visits`, `conversions`, `aiMentions`, `aiAnswers`.
At least one observed count is required; omitted/null means unavailable, not
zero. AI mentions require an answer denominator and `aiChannel` of `api-model`
or `consumer-assistant`. Keep sources/channels and comparable windows separate.
The measurement window must be complete and follow publication. This records
an observation; it does not establish causal improvement or revenue.

## API and operational boundaries

`GET /v1/projects/:id/brand-evidence/growth` reads one project.
`POST` to that same path applies a change. Both require a catalog project id;
mutations use Site Health's existing owner-token/trusted-loopback gate. Revision
conflicts return 409 and cross-project task ids return 404. API bodies retain
the existing 32 KiB bound; use the local CLI for longer drafts.

The existing brand database's private permissions, backup and recovery boundary
apply. This adds one namespaced table without changing imported MentionPilot
rows. It does not replace Site Health's collectors or the product issue tracker.
Search Console, SERPs, crawl screenshots and useful-conversion analytics are
inputs collected through their existing routes. Missing access remains a gap.

For editorial listicles use `ai-listicle-outreach`: observed AI competitors →
authorized backlink evidence → relevant publishers → reviewed pitch. Finding a
link or emailing a publisher never guarantees an AI recommendation. Sending
messages requires the owner's explicit instruction.
