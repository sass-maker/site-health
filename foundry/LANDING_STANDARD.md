# Fleet Landing & Marketing Standard

This is the fleet standard for landing pages, hero sections, marketing copy,
and OG/share surfaces. It is the marketing/positioning counterpart to
[`AGENTS.md`](./AGENTS.md) (engineering ownership) and the Fleet UI standard
inside it.

Filtered from a 32-rule "viral product" list down to the rules that hold
**regardless of business model** (free, paid, subscription, one-time, B2B,
indie). Rules that depend on monetization style live at the bottom under
*Opinionated defaults* — apply when they fit, ignore when they don't.

## Hero

- **Sell from the hero alone.** 80% of visitors do not scroll. The hero must
  state who it's for, what it does, and the single next action without
  needing a scroll. [#20]
- **Fifth-grader headline.** No jargon. If a non-technical friend can't
  repeat it back, rewrite it. [#7]
- **Emotional or specific, not generic.** Make the reader feel something or
  picture a concrete outcome. "Save 4 hours every week" beats "fast". [#17, #18]
- **Sell the outcome, not the feature.** Money, time, health, status, less
  pain — features are vehicles. [#24]
- **Describe under 10 words.** If you can't, users won't either. [#30]

## Copy

- **Numbers over adjectives.** "3× faster", "$12/month", "97% accuracy"
  beats "fast", "affordable", "accurate". [#3]
- **No weak words.** Cut "most", "many", "often", "usually", "powerful",
  "seamless", "robust". Make claims that can be pictured and challenged. [#26]
- **Copy only you could write.** If a competitor could paste your hero on
  their site unchanged, it's generic. Write from your own experience and the
  way your actual users talk. [#9, #14]
- **Empathy before solution.** Describe the user's problem better than they
  can before pitching the fix. [#21]

## iOS apps

The five Significant Hobbies iOS-first apps (Kith, Setline, Anchor,
Motion, Indulge) are built from [`ios-landings`](../ios-landings): one
Astro codebase, five `PRODUCT=` sites. Add or edit `products/<id>/`
there. Do not invent a second page set.

For a new standalone iOS app, copy
[`foundry/ops/templates/ios-landing`](ops/templates/ios-landing) into
that product as `site/` until it joins the factory.

Leave web-primary products (Calorie, Significant Hobbies, Pace) on their
own marketing surfaces. Apple’s official App Store badge and Smart App
Banner are allowed only with a live `apps.apple.com` URL.

## Structure

- **One idea per screen.** Each scroll-fold communicates exactly one thing.
  Don't stack three pitches into one section. [#6]
- **Do one thing.** Lead with the single sharpest job your product does. The
  rest can be discovered, but should not compete for the headline. [#11]
- **Show before tell.** A 5-second demo, screen recording, or live widget
  beats three paragraphs of copy. Put it above the fold when possible. [#10]
- **Let people play before they pay.** Interactive preview, sample input,
  or a free try-it widget on the landing page itself. [#25]

## Decision and discovery content

Every product with a marketing surface should cover the questions people ask
while deciding, comparing, adopting, and using it:

- **Who we're best for.** State the ideal customer, use case, and the cases
  where the product is not the best fit. Make self-qualification easy.
- **Competitor comparison pages.** Build dedicated, substantive pages for the
  competitors prospects actually evaluate. Cover many relevant competitors,
  not just one generic comparison table, and keep every claim defensible.
- **Alternative pages.** Publish useful "alternatives to X" and "best tools
  for Y" pages that help readers choose, even when another option may suit
  them better.
- **Detailed pricing.** The pricing page should explain far more than the
  headline price: tiers, limits, included features, usage rules, add-ons,
  billing terms, overages, refunds, and concrete examples where applicable.
- **Migration and product documentation.** Provide migration guides, user
  docs, and agent-facing docs when the product supports those workflows.
  Cover the real path from the incumbent or old workflow to the product.
- **Agent indexing (GEO).** Ship `llms.txt`, public markdown (or
  `Accept: text/markdown`), and `/api/ai` so ChatGPT/Claude/Gemini can read
  the product without JS. Spec:
  [`foundry/ops/docs/agent-indexing-standard.md`](./foundry/ops/docs/agent-indexing-standard.md).
- **Industry-specific pages.** Create pages for the industries and roles with
  meaningfully different problems, language, workflows, or proof points.
- **Real customer FAQs.** Answer questions customers actually ask in sales,
  support, onboarding, and cancellation conversations. Avoid invented SEO
  questions and vague answers.

## CTA

- **One primary CTA.** Multiple buttons in the hero create hesitation. Pick
  the single most valuable next step. [#22]
- **CTAs say what happens next.** "Analyze my website" / "Generate my plan"
  beats "Get started" / "Submit". Remove uncertainty about what clicking
  does. [#28]
- **Pricing in the header.** Visitors use the pricing page to *understand*
  the product, not just check the cost. Make it one click away if pricing
  exists. [#16]

## Trust

- **Testimonials before traffic.** Don't launch a paid landing page without
  at least 3 pieces of social proof — quotes from users, beta testers, or
  friends who used it. [#29]
- **Show the founder.** A short founder video, a face in the footer, or a
  signed paragraph beats anonymous corporate copy. People buy from people. [#15]
- **Comparison when it helps the decision.** If a user is choosing between
  you and known alternatives, a simple "us vs them" table makes the choice
  obvious. Only do this when you're genuinely better on something the user
  cares about. [#31]

## Visual

- **Intentional palette.** Existing `DESIGN.md` wins. For a new identity, choose
  a color strategy from named references and the approved direction; do not
  default every product to neutral background plus one accent. Reserve visual
  emphasis for the primary CTA regardless of strategy. [#2]
- **OG image is the thumbnail.** Treat it like a YouTube thumbnail — it is
  often seen more than the site itself. Bold, readable at small sizes,
  visually distinct from generic gradient + logo defaults. [#5]
- **Memorable footer.** 97% of visitors won't buy but might share. End the
  page on something — a punchline, a stat, a CTA worth screenshotting. [#4]

### Fleet design workflow

Use `$design-workflow` for meaningful Fleet marketing work. It wraps
[Impeccable](https://impeccable.style/) without turning it into a component
library or house style.

1. Classify `preserve` or `overhaul`. Preserve follows the tracked identity;
   overhaul requires named references, distinct direction probes, and owner
   approval or explicit delegation before code.
2. Keep audience and voice in `PRODUCT.md`, visual rules in `DESIGN.md`, and
   roadmap/scope in `PROJECT_STATUS.md`.
3. Shape with real context, copy, assets, references, and anti-references.
4. Before completion, run `critique`, `polish`, and `audit`; capture the three
   required viewport screenshots and pass the Fleet design-review receipt.
5. Close with owner `keep`, `close`, `wrong-lane`, or `delegated` feedback.
   Aesthetic detector warnings remain advisory.

Apply this workflow to existing products only when their visual surface is
already being changed. Do not create fleet-wide redesign churn solely for
conformance.

## Naming

- **A name people remember.** Use real words. Avoid invented words, internal
  wordplay, or names that need a paragraph of explanation. If the name
  needs a footnote, change the name. [#23]

## Audit checklist

Use this as a quick scorecard for any fleet product with a landing page:

- [ ] Hero communicates audience + outcome in under 10 words
- [ ] Headline understandable by a non-technical reader
- [ ] At least one specific number in the hero (not adjectives)
- [ ] One primary CTA, label describes the action
- [ ] Demo / preview / screen recording above the fold
- [ ] Pricing link in header (if product is paid)
- [ ] At least 3 testimonials or social proof items
- [ ] Founder face or signed copy somewhere on the page
- [ ] Palette follows tracked or owner-approved direction; primary CTA is clear
- [ ] Impeccable design context captured in `PRODUCT.md` and `DESIGN.md`
- [ ] Fleet design-review receipt passes with owner acceptance
- [ ] OG image custom, readable at thumbnail size
- [ ] No weak words ("powerful", "seamless", "robust", "amazing")
- [ ] No generic copy that could be lifted to a competitor's site
- [ ] Footer ends on something worth sharing/screenshotting
- [ ] Product name is real words, not invented or wordplay
- [ ] "Who we're best for" names the ideal customer and poor-fit cases
- [ ] Dedicated comparison and alternatives pages cover relevant competitors
- [ ] Pricing page explains tiers, limits, terms, and realistic examples
- [ ] Migration guides and user/agent docs exist where applicable
- [ ] Industry-specific pages exist for meaningfully different audiences
- [ ] FAQ reflects real customer questions from sales, support, and onboarding

## Opinionated defaults (apply when business model fits)

These are *not* universal — they're correct defaults for indie / one-time-
purchase / B2C-impulse products and wrong for retention-driven SaaS, dev
tools, or free utilities. Treat as guidance, not law.

- **No free plan.** Free users rarely convert (<3%). Default for new
  one-time-purchase products is no free tier. Free utilities, dev tools,
  and acquisition-funnel products are excluded. [#1]
- **One-time payment > subscription.** Much easier to sell. Default for
  digital products that don't have a recurring cost to serve. Excludes
  anything with real per-user infra cost or ongoing value delivery. [#27]
- **Hard paywall.** Ask for payment before account/data. Applies to
  one-time-purchase products only. [#8]
- **Three pricing tiers: Good / Better / Best.** When pricing exists, keep
  it to three. More tiers cause decision paralysis. [#12]
- **Charge more than competitors.** Nobody talks about the second cheapest
  option. Only valid when you can defend the premium. [#32]
- **Ride a wave.** Build around trends people are already discussing — the
  wave does half the marketing. Situational, not always available. [#13]
- **Do something never seen before.** Clones don't get shared. Bias toward
  one surprising element per product. [#19]

## How to use this doc

- When building or revising a fleet product's landing surface, walk the
  *Audit checklist* before shipping.
- When a product has a marketing/landing surface, link to this doc from the
  project's `docs/PROJECT_RECOMMENDATION_CONTEXT.md` if positioning
  guidance matters for Starboard recommendations.
- Repeated drift across products (e.g. multiple products using "powerful"
  in the hero) is fleet-standards work — update this doc, then sweep.

Source: condensed from a 32-rule indie-product checklist, filtered to the
rules that hold across business models. Rule numbers in brackets reference
the original list for traceability.
