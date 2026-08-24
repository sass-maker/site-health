Method: Fleet audit skill + rendered public-product smoke checks + dual-agent
Impeccable critique (A: design quality; B: rendered evidence and scope)

# Fleet landing-page and footer audit

Generated: 2026-08-24

## Scope and method

- Reconciled scope: 55 current Fleet records. The `ios-landings` template
  factory is excluded from product landing-page categorization.
- Public review: the primary public origin for each of the 45 identities with a
  catalog domain, at 1440 x 1000 and 390 x 844.
- Local-source review: all 10 records without a public origin were inspected
  for a landing route or default application surface. Seven independent
  product pages and the shared iOS landing factory were rendered locally at the
  same widths. Public availability is reported separately from page existence.
- Landing baseline: the live shared iOS landing factory used by Calorie,
  Setline, Journal, Kith, Motion, Habits, and Anchor.
- Footer evidence: rendered DOM, not package manifests. The AI footer check
  looked for the `@saas-maker/ai-chat-footer` root or its provider links. The
  project-strip check looked for the package/custom-element root or the
  checked-in `project-strip.js` loader.
- Categories are mutually exclusive. An application's default page counts as
  its landing page even when there is no separate marketing route. `No landing
  page` means source inspection found neither a landing page nor a default
  visual application surface; it does **not** mean merely undeployed.

### Outside the landing-page buckets — 1 catalog record

- [iOS Landing factory](/Users/sarthak/Desktop/fleet/ios-landings/src/pages/index.astro)
  — shared infrastructure that produces the Calorie, Setline, Journal, Kith,
  Motion, Habits, and Anchor pages. It is the template, not a product using the
  template and not an independent landing page.

## Result

### Source-ready follow-through — 2026-08-24

The owner-approved web-template batch is now source-ready for GitStat,
Knowledge Base, Reader, Email Manager / Kinetic, PSI Swarm, and Anime List.
The reusable starting point is the content-first
`saas-maker/tooling/templates/web-landing` variant; it does not require phone
frames or product screenshots. Each implementation preserves its existing app
routes and behavior, and uses a real or explicitly labelled illustrative
product artifact rather than replacing the application with a marketing shell.

These six source builds were checked at 390, 768, and 1440 px with no
horizontal overflow. The product strip and Ask AI widgets also rendered once
inside one compact `fleet-footer-extension`; authored product footers remained
separate above it. This is **source-ready, live-pending** evidence. No product,
shared loader, or landing page was deployed in this pass, so the public links
and category descriptions below continue to describe the currently deployed
pages until release and public verification.

### Beautiful landing page — 17

- [CodeVetter](https://codevetter.com/) — a highly resolved verification-tool
  world with a strong thesis, disciplined typographic scale, executable-proof
  framing, and a genuinely authored mobile composition. It comfortably beats
  the shared template even though its dark dev-tool vocabulary is familiar.
- [PostTrainLLM](https://posttrainllm.com/) — the one-machine research-lab
  identity, training-curve composition, concrete specialist/eval narrative,
  and clean mobile reflow are substantially more specific and convincing than
  the template baseline.

- [HeyPace](https://heypace.app/) — unmistakable technical-editorial world,
  exceptional typography, and concrete local-mode, model, and latency evidence.
- [SaaS Maker](https://sassmaker.com/) — the living-index composition turns the
  portfolio itself into the visual artifact and adapts coherently to mobile.
- [Recipe Index](https://veg-protein-food.significanthobbies.com/) — a highly
  authored research-ledger aesthetic with real metrics, filters, and responsive
  re-composition.
- [What It Takes to Win](https://paths.significanthobbies.com/) — a singular
  narrative experience built from its chapter rail, reading contract, custom
  3D figure, and evidence framing.
- [Office OS](https://office-os.sassmaker.com/) — a warm, product-specific
  “little company” world with a substantial in-product workplace artifact.
- [Local AI Video Studio](https://local-ai-video-studio.sassmaker.com/) — an
  editing-workflow-specific optical-printer bench, asymmetric composition, and
  visible comparison proof that survives mobile cleanly.
- [Protein Index](https://protein.significanthobbies.com/) — a distinctive
  editorial “living index” backed by real dataset proof, with its dense table
  deliberately recomposed into usable mobile cards. Its former unresolved
  loading placeholders have been removed from the released page.
- [TrueHire local source](/Users/sarthak/Desktop/fleet/truehire/apps/web/landing-astro/src/pages/index.astro)
  — **archived; no catalog public URL.** Its confrontational resume thesis,
  scored-candidate artifact, signal-stack diagrams, and disciplined monochrome
  system form a distinctive product narrative that remains coherent on mobile.
- [Field Track](https://field-track.sassmaker.com/admin) ·
  [source](/Users/sarthak/Desktop/fleet/field-track/src/pages/admin/index.astro)
  — the map, freshness metrics, employee roster,
  route-gap evidence, and detail panel create a specific field-operations world;
  mobile thoughtfully recomposes the same proof into a legible single column.
  The released dashboard is clearly labelled as a synthetic demo and marks
  production access as coming soon.
- [Drank](https://domains.sassmaker.com/) — the live domain-rating dashboard is
  the product artifact: real metrics, tracked-domain cards, useful controls,
  dense but legible hierarchy, and a strong mobile re-composition.
- [RolePatch](https://rolepatch.com/) — a distinctive receipt-first thesis,
  seven-section narrative, real before/after resume output, explicit automation
  safeguards, and polished mobile execution clear the template bar.
- [Live](https://live.significanthobbies.com/) — the cinematic hero is backed
  by a full life-phase artifact, hobby imagery, journey examples, community
  profiles, and excellent mobile execution. The earlier first-viewport-only
  judgment underrated the complete page.
- [Karte](https://karte.cc/) — the six-card Onyx deck is exceptionally authored,
  responsive, and product-specific, with inbound surfaces, assistant behavior,
  sample cards, and an embedded live interaction path.
- [AliveVille](https://aliveville.com/) — its distinctive world-building,
  atmospheric video, playable 3D surface, agent-memory explanation, and
  coherent mobile treatment comfortably exceed the shared baseline.
- [Reddit Insights](https://reddit-insights.highsignal.app/) — it opens on a
  substantial source-shaped research artifact with real corpus counts, topic
  shifts, historical coverage, and an excellent mobile hierarchy.

These clear a deliberately high bar: the page is memorable without its logo,
the composition and visual system are product-specific, the first viewport has
real proof or a meaningful product artifact, and the desktop/mobile treatments
feel authored rather than merely competent. Polished, clean, or fashionable is
not sufficient for this bucket.

### Landing page using our template — 7

- [Calorie](https://calorie.significanthobbies.com/)
- [Setline](https://setline.significanthobbies.com/)
- [Journal](https://journal.significanthobbies.com/)
- [Kith](https://kith.significanthobbies.com/)
- [Motion](https://motion.significanthobbies.com/)
- [Habits](https://habits.significanthobbies.com/) (catalog identity `indulge`)
- [Anchor](https://anchor.significanthobbies.com/)

These seven entries are current outputs of the iOS landing factory, including
Calorie's synced Worker snapshot. Habits had a small 390 px horizontal-overflow
regression (405 px document width); the shared source now collapses chapter
layouts below 520 px and verifies at exact viewport width locally, pending a
template deployment.

### No landing page — 2

- [ChatGPT Connections source](/Users/sarthak/Desktop/fleet/chatgpt-connections/README.md)
  — Worker/MCP/OAuth API only; `/` is a protocol error response, not HTML.
- [Companion Robot source](/Users/sarthak/Desktop/fleet/companion-robot/README.md)
  — planning and protocol documents only; no implemented visual application.

### Landing page worse than our template — 28

- [GitStat](https://git.significanthobbies.com/)
- [Email Manager / Kinetic](https://mail.significanthobbies.com/) — polished desktop direction, but the 390 px page
  overflows to 557 px and the navigation does not collapse. The owner approved
  the shared template structure, adapted locally around its browser artifact.
  That replacement is source-ready and verified locally, but the linked public
  page is still the old below-par version.
- [Memory Map](https://chatgpt.significanthobbies.com/) — clear and usable, but visually generic and light on product
  proof compared with the factory.
- [Free AI](https://ai-gateway.sassmaker.com/)
- [PSI Swarm](https://performance.sassmaker.com/)
- [High Signal](https://highsignal.app/)
- [EverythingRated](https://ratings.highsignal.app/) — understandable hybrid landing/tool, but the first viewport
  is text-heavy and category-interchangeable.
- [Research Papers](https://papers.highsignal.app/)
- [Materia](https://materia.significanthobbies.com/)
- [Knowledge Base](https://knowledgebase.sassmaker.com/)
- [Significant Hobbies](https://significanthobbies.com/)
- [India Standards](https://india-standards.significanthobbies.com/)
- [Anime List](https://anime.significanthobbies.com/)
- [Chess](https://chess.significanthobbies.com/)
- [LoopTV](https://tv.significanthobbies.com/) — sparse generic composition; its
  390 px overflow came from the footer navigation, which now wraps and verifies
  locally at exact viewport width pending deployment.
- [Reader](https://read.significanthobbies.com/)
- [SWE Interview Prep](https://learn.significanthobbies.com/)
- [Starboard](https://starboard.codevetter.com/) — solid structure, but the generic dark SaaS treatment and weak
  first-viewport proof do not clear the factory bar.
- [App Health](https://health.sassmaker.com/)
- [Open Historia](https://historia.aliveville.com/)
- [Web Playables](https://idle.aliveville.com/) — functional collection page, but too thin and under-authored
  to match the template.
- [Sarthak Agrawal](https://sarthakagrawal.dev/)
- [Site Health local app](/Users/sarthak/Desktop/fleet/site-health/apps/web/src/pages/projects/index.astro)
  — **local-only; no public URL.** A competent operations shell, but the audited
  render is dominated by duplicated backend-unavailable panels and generic
  controls instead of meaningful product proof.
- [Reel Pipeline protected Worker](https://reels.sassmaker.com/) ·
  [local page source](/Users/sarthak/Desktop/fleet/reel-pipeline/src/anonymous-video/ui.js)
  — **live hostname, but `/` returns 401 JSON and does not expose this landing.**
  The local page has strong headline scale and clean mobile adaptation, but it
  stops at a URL field and shows no generated reel, frame, before/after, or
  process proof. The owner chose to keep it internal-only, so it has no public
  landing or release priority.
- [Mobile Dev Cockpit local app](/Users/sarthak/Desktop/fleet/mobile-dev-cockpit/apps/mobile/src/app/index.tsx)
  — **retired; no public URL.** The Tailscale pairing surface is specific and
  polished, but it is an onboarding form rather than a convincing build-loop
  artifact and overflows both audited widths by 80 px.
- [Mashup local app](/Users/sarthak/Desktop/fleet/mashup/web/src/pages/index.astro)
  — **undeployed; no public URL.** Without its backend the default page renders
  only a `Could not load the EDL / 404` panel in an otherwise empty viewport.
- [Forecast Lab local app](/Users/sarthak/Desktop/fleet/forecast-lab/web/src/App.tsx)
  — **undeployed; no public URL.** Clear and responsive, but it is a generic
  explainer plus CSV drop zone with no chart, forecast, or authored product
  artifact in the first viewport.
- [Verified Bases local page](/Users/sarthak/Desktop/fleet/verified-bases/web/src/pages/index.astro)
  — **retained resources; no live public route.** Strong opening typography and
  verification language are undermined by enormous empty gaps before the only
  product card and later sections.

This bucket uses a conservative tie-breaker: a custom page must clearly beat
the shared factory to leave it. Twelve entries are confidently below because
of a broken/loading/error state, missing product proof, thin composition, or a
material responsive failure: GitStat, PSI Swarm, India Standards, LoopTV, App
Health, Web Playables, Site Health, Reel Pipeline, Mobile Dev Cockpit, Mashup,
Forecast Lab, and Verified Bases. The other sixteen are borderline rather than
proven failures; they remain here because the requested four-category taxonomy
has no separate `comparable to template` bucket. The earlier flat claim that
all 35 were equally below-standard was not supportable.

The four landing-page buckets total 54 Fleet product identities. Together with
the iOS template factory, this reconciles to all 55 current Fleet records without
pretending the factory is an independent landing-page product.

## Template disposition by priority and lifecycle

The visual score alone should not decide where to spend bespoke design time.
Based on the canonical portfolio priority, lifecycle, sharing readiness, and the
current page evidence, these are the products where the shared template is the
right product decision.

### Use the template now

- [GitStat](https://git.significanthobbies.com/)
- [Email Manager / Kinetic](https://mail.significanthobbies.com/)
- [Memory Map](https://chatgpt.significanthobbies.com/)
- [Free AI](https://ai-gateway.sassmaker.com/)
- [PSI Swarm](https://performance.sassmaker.com/)
- [Research Papers](https://papers.highsignal.app/)
- [Knowledge Base](https://knowledgebase.sassmaker.com/)
- [India Standards](https://india-standards.significanthobbies.com/)
- [Anime List](https://anime.significanthobbies.com/)
- [Reader](https://read.significanthobbies.com/)
- [App Health](https://health.sassmaker.com/)

These are active but secondary, utility-led, or low-priority products whose
current marketing surface is not an important differentiator. A consistent,
well-maintained baseline is a better use of Fleet effort than eleven separate
visual systems.

### Template is the ceiling while they remain archived

- [EverythingRated](https://ratings.highsignal.app/)
- [Materia](https://materia.significanthobbies.com/)
- [Chess](https://chess.significanthobbies.com/)

Do not fund bespoke redesigns for these archived products. If their public
pages stay online, the template is enough; if they are intentionally retired,
leave them alone or remove them through the normal lifecycle process.

### Start from the template only if reactivated

- Forecast Lab
- Verified Bases

Both are archived and lack a current public release surface, so there is no
reason to build a bespoke landing page now.

The template should not replace CodeVetter, PostTrainLLM, High Signal,
Significant Hobbies, SWE Interview Prep, Starboard, LoopTV, Open Historia, Web
Playables, or any page already in the beautiful bucket. The two AliveVille
surfaces can wait for their previously agreed authored directions rather than
receiving generic work now. Site Health and Reel Pipeline are internal tools;
their product surfaces should be improved as applications, not converted into
marketing templates. Mashup needs a working product artifact before a
landing-page decision.

### Inspection links for pages without a public URL

These are the exact local renders used for the visual decision. They are
session-local evidence, while the source links in the buckets above are durable.

- Site Health: [desktop](/tmp/fleet-landing-audit/local-site-health-desktop.png) · [mobile](/tmp/fleet-landing-audit/local-site-health-mobile.png)
- Reel Pipeline: [desktop](/tmp/fleet-landing-audit/local-reel-pipeline-desktop.png) · [mobile](/tmp/fleet-landing-audit/local-reel-pipeline-mobile.png)
- Mobile Dev Cockpit: [desktop](/tmp/fleet-landing-audit/local-mobile-dev-cockpit-desktop.png) · [mobile](/tmp/fleet-landing-audit/local-mobile-dev-cockpit-mobile.png)
- Mashup: [desktop](/tmp/fleet-landing-audit/local-mashup-desktop.png) · [mobile](/tmp/fleet-landing-audit/local-mashup-mobile.png)
- TrueHire: [desktop](/tmp/fleet-landing-audit/local-truehire-desktop.png) · [mobile](/tmp/fleet-landing-audit/local-truehire-mobile.png)
- Forecast Lab: [desktop](/tmp/fleet-landing-audit/local-forecast-lab-desktop.png) · [mobile](/tmp/fleet-landing-audit/local-forecast-lab-mobile.png)
- Verified Bases: [desktop](/tmp/fleet-landing-audit/local-verified-bases-desktop.png) · [mobile](/tmp/fleet-landing-audit/local-verified-bases-mobile.png)

## Footer package compliance

### Current result

- **Source-ready: 45 / 45 public origins.** Every public product source now
  loads both the portfolio project strip and the backend-free AI chat footer.
- **Source-ready: 6 / 6 additional browser surfaces without a public landing:**
  Site Health, Reel Pipeline, Mashup, TrueHire, Forecast Lab, and Verified
  Bases.
- The shared [iOS landing factory](/Users/sarthak/Desktop/fleet/ios-landings/src/layouts/SiteLayout.astro)
  was integrated once and covers Calorie, Setline, Journal, Kith, Motion,
  Habits, and Anchor. Its full eight-output source check passes.
- **Not applicable: 3 products.** ChatGPT Connections and Companion Robot have
  no visual application surface. Mobile Dev Cockpit is a retired native app,
  not a browser page that can load footer scripts.
- **Composition verified locally:** representative light, dark, React, Astro,
  local-strip, hosted-strip, and authored-footer pages rendered exactly one AI
  surface and one project strip inside one `fleet-footer-extension` at 390,
  768, and 1440 px. No audited composition overflowed horizontally. Kinetic's
  duplicate consumer-specific AI block was removed.
- **Production remains unchanged until deployment.** At the audit baseline,
  the AI footer was live on **0 / 45** public origins and the project strip was
  live on **24 / 45**. Source integration is not counted as live compliance.

The hosted AI loader is owned by SaaS Maker at `/ai-chat-footer.js`. It is
credential-free and opens a product-aware prompt in Claude, ChatGPT, Gemini,
Perplexity, or Grok. Consumer pages also load `/project-strip.js`, using their
catalog identity so the current product can be excluded from the strip.

### Release gate

1. Release SaaS Maker first so `https://sassmaker.com/ai-chat-footer.js` exists.
2. Deploy each consumer from its current main/release path.
3. Re-run the 45-origin rendered audit at desktop and mobile widths; verify one
   project strip, one AI footer, valid provider links, no horizontal overflow,
   and no duplicate mounts.
4. Track the cross-repo release evidence in
   [saas-maker#76](https://github.com/sass-maker/saas-maker/issues/76). Do not
   call the rollout live before those checks pass.

## Additional live issue

The audited mobile overflows in Habits and LoopTV are fixed and verified in
local source, pending deployment. Email Manager's replacement is also fixed in
local source but is not live yet. Protein Index's loading/performance pass and
Field Track's synthetic-demo dashboard are now released. In the local-only set,
Mobile Dev Cockpit overflowed by 80 px.
