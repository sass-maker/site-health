# Open Historia qualification — September 8, 2026

The owner-held game remains inactive and unqualified for sharing. This pass repairs campaign failures; it does not establish a coherent historical simulation.

## Reproduced on the live site

- Guest WWII campaign as United Kingdom, default Free AI provider, no API key or login.
- Humanitarian shipping order failed with Workers AI error 5028 for a retired model. The failure emptied the order queue.
- Starting the campaign changed the URL to a root-level UUID; fetching that URL returned HTTP 404. The actual route is `/play/<id>`.
- The map names United Kingdom, Red Empire, Green Republic and Golden Horde despite the WWII scenario.

## Source repair and tests

Source `61092630e2ae0576fc9acc25ee4f7850271a43e5` repairs start/save/load URLs and preserves queued orders and year on failed turns. Successful turns consume the submitted queue; a synchronous in-flight guard rejects overlapping submissions. Clear is disabled during a pending turn.

The built-app Playwright regression verifies failed provider response, retained queue/year, successful retry, local save and reload with restored result/year. It passes on the fixed source and fails against the original turn handler at the retained-orders assertion. All 72 unit tests, TypeScript checks, lint, deployment prerequisite check and Vite/Astro build passed locally. The browser test uses a local static server with mocked API replies and blocks external browser requests; it does not exercise Cloudflare AI.

The old Playwright setup pointed to port 3000 while the development scripts used different ports. It now uses an isolated built-asset server on 127.0.0.1:43187 with no Worker bindings, and the regression is included in CI. No new production dependencies, database migration, provider setting changes or credentials were introduced.

## Outstanding

[Issue 27](https://github.com/sarthakagrawal927/open-historia/issues/27) tracks the release and live turn acceptance, historical faction/map coherence, timeline snapshot correctness, diplomacy persistence and authenticated saves. Desktop campaign checks do not qualify mobile controls or cloud save behavior. The free-provider model selector also needs alignment with the actual Workers AI backend.

## First release and follow-up

[CI 34231910424](https://github.com/sarthakagrawal927/open-historia/actions/runs/34231910424) passed at source 6109263. All six deployment gates passed. Worker version `67b11548-4082-440a-89c5-64441ec98eaf`, deployment `9f06a3a9-7d04-4eda-80ef-0263fb898694`, exact source tag, 100% traffic. Previous version `115796c9-cd79-4214-a4dd-de668bdf11fc` retained. `pnpm run deploy` is required because bare `pnpm deploy` selects pnpm's workspace deployment command.

Hosted canonical `/play/<id>` loaded the existing local campaign. The next real inference returned HTTP 502 for unreadable JSON; the order remained queued and the year remained 1939, confirming the failure-state repair live. No completed live turn was established by that release.

Follow-up source `9a03cec` explicitly requests JSON with 2048 output tokens through the existing Workers AI adapter. Tests cover JSON request settings, string/structured model outputs, retained story memory, and malformed output remaining a safe 502. [Cloudflare JSON-mode documentation](https://developers.cloudflare.com/workers-ai/features/json-mode/) supports this request format; it does not guarantee model reliability. No automatic inference retries or extra provider was added.

## Mobile observation

The live 390px screenshot has no document-level horizontal overflow, but the guided-story panel overlaps the map/diplomacy area and crowds the command log and controls. That is not a usable mobile-layout pass. The browser's viewport emulation reloaded the page; the campaign/logs restored, but pending orders are not persisted across reload. Failure retention currently applies within the active page session. These are remaining acceptance gaps, not evidence of full readiness.

## Schema adapter correction

The next exact-source release (`9a03cecd475322fe03b4c26ec85d0a63933a6b30`, CI 34232522364 success, version `a8aaabc1-e510-48e4-a03c-afc189fc63c7`, deployment `695c5013-eba3-4007-b6fa-272f4877f1cc`, 100%) exposed a further runtime adapter mismatch: `Output.json()` emitted `json_schema` mode without a schema and Cloudflare rejected it. This was not a successful game turn.

Source `655c552977f8f907435d2b0a26f8af9a46b15633` provides explicit object schemas for turn, chat and advisor outputs. Six focused adapter tests pass, including required schema fields and string/structured output. Provider failures are now reported with bounded generic messages; raw diagnostics containing campaign prompts are not returned or logged by the route. A regression asserts a synthetic private sentinel is absent from both response and console output. The earlier API returned provider diagnostics to the requesting player's game log, exposing the campaign prompt there; no claim of cross-user exposure was established.

## Final release and live acceptance

[CI 34233038420](https://github.com/sarthakagrawal927/open-historia/actions/runs/34233038420) passed at `655c552977f8f907435d2b0a26f8af9a46b15633`, including typecheck, lint, unit tests, built-page campaign regression and Vite/Astro build. All six deployment gates passed again. Final Worker version `cb069b72-25f8-4fbd-b92f-f826af6f83fc`, deployment `b1344088-7280-49b7-8eb6-8f85450c4862`, exact source tag and 100% traffic were verified through Wrangler metadata.

A fresh logged-out WWII campaign as United Kingdom completed a real humanitarian shipping order: HTTP 200 in 3452ms, a narrative naming the requested agreement, one diplomacy event, two friendly relations (France and Poland), and compressed story memory. This is a simulated game outcome, not a verified historical claim. No paid provider key was supplied; existing Workers AI binding was used.

Saving and reloading the canonical campaign URL restored the narrative and event. Before reload the UI had two relations and a timeline snapshot; afterward the relations panel was absent and the timeline said no snapshots. The stored local game snapshot has no relations/timeline fields. This is a reproduced persistence defect, not merely untested functionality. Pending orders also remain page-session-only. Desktop screenshot was inspected; 390px overlap remains a failure.

The experiment stays inactive/shareable=false. Issue 27 remains open for actual campaign-state persistence, historical map/faction coherence, usable mobile controls and authenticated saves. No production database or account data was modified; guest saves used an isolated browser context.

## Campaign persistence repair and live verification

Source `d7a9ecdf6c81ca6613f896a2c3744b8f623b833a` adds backward-compatible save format 3.2.0 with relations, chat threads, timeline, advisor history, queued orders and completed story steps. Timeline snapshots now capture post-turn territory ownership. Failed saves keep the campaign open; unreadable stored save lists cannot be overwritten by save/delete operations.

All 79 unit tests, typecheck, lint and two built-browser regressions passed locally and in [CI 34235188140](https://github.com/sarthakagrawal927/open-historia/actions/runs/34235188140). All six deployment gates passed. Worker version `12af469a-2861-4486-8d3f-47ac6db823ad`, deployment `f3419707-b120-4fa5-9c96-dea8bd4da837`, serves 100% traffic with the exact source tag.

A fresh isolated guest WWII campaign completed a real AI turn, HTTP 200 in 4266ms. The save contained three diplomatic relations, one timeline snapshot, story memory and a queued follow-up shipment order. Reload restored the relations control, timeline and queued order. Saving the restored UI again retained all these fields. This supersedes the earlier reproduced local persistence failures. Synthetic saves were removed and the owned browser tab closed.

Historical faction/map coherence, overlapping mobile controls, complete rewind/branch memory and authenticated cloud-save journeys remain unqualified. Chat/advisor persistence has unit coverage but was not exercised through live provider conversations in this pass. No database migration or provider configuration change was made. The owner-held experiment remains inactive and shareable=false.


## Responsive campaign release

Source `a79b6e2598cdf965e3cee0fc7e23ca32cf4f0021` reflows campaign controls below 1100px, moves desktop diplomacy below the toolbar, keeps terminal scrolling local, restores the empty timeline show/hide control, and fixes the invalid ocean-label zoom expression. Tests now wait for renderer idle and permit same-origin blob workers in WebKit while blocking external requests. The previous blank WebKit map was traced to that test filter, not declared a product pass.

Typecheck, lint and all 79 unit tests passed. Local browser coverage found a tablet hover overflow; its fix passed the focused recheck. [CI 34238119844](https://github.com/sarthakagrawal927/open-historia/actions/runs/34238119844) then passed the full Chromium/WebKit campaign suite and Vite/Astro build at the exact source. The preserve-lane design receipt passed, with manual scoped scores 33/40 and 16/20. Checked-in before/after screenshots and scope limits are in the owning repo `artifacts/design/README.md`; these are not whole-product quality grades.

All six deploy gates passed. Worker version `d420bcf2-f9e9-46af-9703-c1aa78b38731`, deployment `e52bc48d-da5a-4ec2-9ee4-d5fded78c575`, has the exact source tag and 100% traffic. Live 390x844 Chromium guest WWII campaign: the map reached ready state; toolbar, map, terminal, story, diplomacy, advisor and timeline occupied separate bounded positions. A real humanitarian-shipping turn returned HTTP 200 in 4117ms, with narrative, one friendly relation and a timeline snapshot. Save retained those fields. The lower-page screenshot confirmed reachable separate diplomacy/relations/advisor/timeline controls. Synthetic storage was removed and the isolated test tab closed.

The previously reproduced mobile overlap is repaired for the checked browser flows. Physical devices, full rewind/branch memory, historically coherent factions/geography and authenticated cloud saves remain unqualified; shareable=false and held lifecycle are preserved. No production dependency, migration or provider configuration change was introduced.
