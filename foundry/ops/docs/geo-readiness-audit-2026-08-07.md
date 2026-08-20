# Fleet GEO readiness audit — corrected 2026-08-07

This report supersedes the 2026-08-06 draft. It separates declared identity,
live link integrity, source-complete work, production deployment, technical
agent readability, and provider-observed AI visibility. None of those signals
is treated as a substitute for another.

## Executive result

| Check | Result | Evidence |
| --- | --- | --- |
| Maintained product identity coverage | PASS — 27/27 | [`projects.json`](../config/projects.json), `geoIdentities` |
| Cross-registry identity consistency | PASS — 27/27 | [`project-catalog.mjs`](../lib/project-catalog.mjs), [`project-catalog.test.mjs`](../test/project-catalog.test.mjs) |
| Declared live origins, public source, docs, profiles, and pricing links | PASS — 107/107 checked URLs | `npm run check:geo-links -- --json`, observed 2026-08-07 IST |
| App Store listing | NOT APPLICABLE — 27/27 | [`projects.json`](../config/projects.json), `availability.appStore` |
| Technical agent surfaces | PASS — 27/27 source contracts | [`agent-surfaces-registry.json`](../config/agent-surfaces-registry.json) |
| Provider-observed AI visibility | PARTIAL — 4/27 observed | Founder Control `ownerOutcomes.aiCoverage` |
| Provider-observed AI visibility gap | MISSING — 23/27 unobserved | Founder Control `ownerOutcomes.aiCoverage.unobserved` |
| Prompt-owned content coverage | PARTIAL — 34/54 published, 20 missing | `npm run report:prompt-ownership -- --json` |
| Fully GEO-ready | 0/27 | Provider coverage and prompt ownership remain incomplete |

Passing the agent-surface, sitemap, structured-data, or link-integrity checks
does **not** make a product GEO-ready. It proves that a declared surface exists
and is reachable, not that an AI provider understands, recommends, or cites it.

## Canonical identity checklist

The exact canonical origin, repository or internal source path, documentation,
official profiles, availability, and pricing posture for every product is the
`geoIdentities` entry in [`projects.json`](../config/projects.json). The
validator requires exactly one entry for every maintained visibility product
and fails on name, origin, repository, source-boundary, or `sameAs` drift.

Every applicable URL declared by those 27 entries was opened with an explicit
GET request. The audit checked 107 URLs and received a successful response for
all 107. Internal source paths and NOT APPLICABLE App Store entries were not
converted into public claims.

| Product | Identity and live links | Source | Docs | App Store | Provider observation | Required action |
| --- | --- | --- | --- | --- | --- | --- |
| CodeVetter | PASS — https://codevetter.com | PASS — https://github.com/Codevetter/codevetter | PASS — https://codevetter.com/docs/ | NOT APPLICABLE | PASS | Expand legitimate prompt-owned authority and remeasure. |
| HeyPace | PASS — https://heypace.app | PASS — https://github.com/HeyPace/pace | PASS — https://heypace.app/docs/ | NOT APPLICABLE | PASS | Normalize remaining Pace aliases and remeasure. |
| PostTrainLLM | PASS — https://posttrainllm.com | PASS — https://github.com/PostTrainLLM/posttrainllm | PASS — https://posttrainllm.com/docs/ | NOT APPLICABLE | PASS | Expand prompt-owned authority and remeasure. |
| SaaS Maker | PASS — https://sassmaker.com | PASS — internal `foundry/ops`; no public source claim | PASS — https://sassmaker.com/learnings | NOT APPLICABLE | MISSING | Capture approved provider observations. |
| Drank | PASS — https://domains.sassmaker.com | PASS — public `sass-maker/drank` | PARTIAL — landing only | NOT APPLICABLE | MISSING | Add a focused public methodology page, then capture provider observations. |
| Email Manager | PASS — https://mail.significanthobbies.com | PASS — https://github.com/Significant-Hobbies/email-manager | PASS — repository README | NOT APPLICABLE | MISSING | Capture approved provider observations. |
| Memory Map | PASS — https://chatgpt.significanthobbies.com | PASS — https://github.com/Significant-Hobbies/chatgpt-memory-insights | PASS — repository README | NOT APPLICABLE | MISSING | Capture approved provider observations. |
| Free AI | PASS — https://ai-gateway.sassmaker.com | PASS — https://github.com/sass-maker/free-ai | PASS — https://ai-gateway.sassmaker.com/about/ | NOT APPLICABLE | MISSING | Capture approved provider observations. |
| PSI Swarm | PASS — https://performance.sassmaker.com | PASS — public `sass-maker/psi-swarm` | PARTIAL — landing only | NOT APPLICABLE | MISSING | Add a focused public methodology page, then capture provider observations. |
| High Signal | PASS — https://highsignal.app | PASS — https://github.com/High-Signal-App/high-signal | PASS — https://highsignal.app/api-docs | NOT APPLICABLE | PASS | Align repository positioning with current product truth and remeasure. |
| Research Papers | PASS — https://papers.highsignal.app | PASS — https://github.com/High-Signal-App/research-papers | PASS — repository README | NOT APPLICABLE | MISSING | Capture approved provider observations. |
| Knowledge Base | PASS — https://knowledgebase.sassmaker.com | PASS — https://github.com/sass-maker/knowledge-base | PASS — repository README | NOT APPLICABLE | MISSING | Capture approved provider observations. |
| Significant Hobbies | PASS — https://significanthobbies.com | PASS — https://github.com/Significant-Hobbies/significanthobbies | PASS — repository README | NOT APPLICABLE | MISSING | Capture approved provider observations. |
| India Standards | PASS — https://india-standards.significanthobbies.com | PASS — https://github.com/Significant-Hobbies/india-standards | PASS — repository README | NOT APPLICABLE | MISSING | Capture approved provider observations. |
| Anime List | PARTIAL — origin resolves, but cached `/` HTML still says Shelf | PASS — https://github.com/Significant-Hobbies/anime-list | PASS — repository README | NOT APPLICABLE | MISSING | Purge the two stale root cache objects tracked in issue 44, then capture observations. |
| Chess Coach | PASS — https://chess.significanthobbies.com | PASS — https://github.com/Significant-Hobbies/chess | PASS — repository README | NOT APPLICABLE | MISSING | Capture approved provider observations. |
| LoopTV | PASS — https://tv.significanthobbies.com | PASS — https://github.com/Significant-Hobbies/looptv | PASS — repository README | NOT APPLICABLE | MISSING | Capture approved provider observations. |
| Reader | PASS — https://read.significanthobbies.com | PASS — https://github.com/Significant-Hobbies/reader | PASS — repository README | NOT APPLICABLE | MISSING | Capture approved provider observations. |
| SWE Interview Prep | PASS — https://learn.significanthobbies.com | PASS — https://github.com/Significant-Hobbies/swe-interview-prep | PASS — https://learn.significanthobbies.com | NOT APPLICABLE | MISSING | Capture approved provider observations. |
| Calorie | PASS — https://calorie.significanthobbies.com | PASS — https://github.com/Significant-Hobbies/calorie | PASS — repository README | NOT APPLICABLE | MISSING | Capture approved provider observations. |
| Setline | PASS — https://setline.significanthobbies.com | PASS — https://github.com/Significant-Hobbies/setline | PASS — repository README | NOT APPLICABLE | MISSING | Capture approved provider observations. |
| RolePatch | PASS — https://rolepatch.com | PASS — https://github.com/Significant-Hobbies/rolepatch | PASS — https://rolepatch.com/blog | NOT APPLICABLE | MISSING | Capture approved provider observations. |
| Karte | PARTIAL — origin resolves, but cached HTML is a doubly encoded gzip body | PASS — https://github.com/Significant-Hobbies/karte | PASS — repository README | NOT APPLICABLE | MISSING | Merge PR 60, deploy it, purge the poisoned root cache object, and verify decoded HTML. |
| Starboard | PASS — https://starboard.codevetter.com | PASS — https://github.com/Codevetter/starboard | PASS — repository README | NOT APPLICABLE | MISSING | Capture approved provider observations. |
| App Health | PASS — https://health.sassmaker.com | PASS — https://github.com/sass-maker/app-health | PASS — repository README | NOT APPLICABLE | MISSING | Align public positioning, then capture provider observations. |
| Motion | PASS — https://motion.significanthobbies.com | PASS — https://github.com/Significant-Hobbies/motion | PASS — repository README | NOT APPLICABLE | MISSING | Clarify internal-only availability, then capture observations. |
| What It Takes to Win | PASS — https://paths.significanthobbies.com | PASS — https://github.com/Significant-Hobbies/what-it-takes-to-win | PASS — repository README | NOT APPLICABLE | MISSING | Capture approved provider observations. |

## Provider-observation correction

The earlier draft incorrectly treated fixture canaries as the only available AI
visibility evidence. Founder Control currently contains provider-observation
history for exactly four products:

- `codevetter`
- `high-signal`
- `pace`
- `posttrainllm`

Each was last observed at `2026-08-01T19:27:18.712Z`. The remaining 23 product
IDs are emitted explicitly by `ownerOutcomes.aiCoverage.unobserved`; they are
not silently shown as zero and are not inferred from fixtures.

These observations establish that an approved external client produced a
provider-backed result. They do not prove exhaustive consumer ChatGPT, Claude,
or Perplexity coverage, so the portfolio remains PARTIAL.

## Source versus production correction

- **Anime List source and deployment are current.** The canonical identity
  source shipped in commit `ee5f872` (PR 40), and current `main`
  `02f85d68cd3dee3aaf698af79b06b48047f54fbd` is deployed by Pages deployment
  `3fc437b9`. The two root cache objects still serve pre-release Shelf HTML;
  issue 44 owns the explicit purge operation.
- **Karte's Astro homepage source is deployed, but its edge representation is
  corrupt.** `landing-astro/src/pages/index.astro`
  renders through `landing-astro/src/layouts/Layout.astro`; `worker.mjs` serves
  the overlaid Astro assets; and `package.json` includes that overlay in
  `cf:build`. Worker `linkchat` is at current `main`
  `6c0c5ab85973baa98115f34983d5b24388543ac5` with 100% traffic. The cached
  response still contains gzip bytes after Cloudflare decodes the advertised
  edge encoding. PR 60 removes manual asset precompression; deployment and
  purge remain separately gated.

Neither source-complete item authorizes a production deployment.

## Prioritized backlog

### P0

- Purge Anime List's stale `/` and `/index.html` edge objects after verifying
  issue 44's exact targets.
- Merge Karte PR 60, deploy the resulting revision, purge the poisoned `/`
  object, and verify that identity, gzip, Brotli, and Zstandard clients all
  decode to HTML.

### P1

- Capture provider-observation bundles for the 23 explicitly unobserved
  products, including provider/model provenance, prompt, answer description,
  competitors, citations, and timestamp.
- Prepare approval-gated manifests for the 20 comparison prompts with no
  published owner; the 27 canonical category owners and seven inspected
  comparison pages are already mapped explicitly.
- Add focused public methodology/docs pages for Drank and PSI Swarm.
- Align remaining public positioning drift for High Signal, App Health, and
  Motion without changing unsupported product claims.

## Source changes awaiting review or operation

- **HeyPace PR 138**, commit `91d206f`: current repository, updater, release
  generator, and documentation links use the HeyPace organization. The
  anonymous v0.3.19 asset problem remains separately tracked in issue 122.
- **Karte PR 60**, commit `02ff29c`: removes manual gzip from the Astro asset
  path and adds a regression check. It is not deployed by this audit.
- **Anime List issue 44:** source and deployment are current; only the exact
  stale cache purge and post-purge verification remain.

### P2

- Expand legitimate corroboration through relevant directories, integration
  docs, release notes, demonstrations, and cited comparisons. Do not use spam
  backlinks or fabricated testimonials.

## Reusable shared-template fixes

- Generate the public name, description, canonical origin, repository/profile
  links, pricing posture, and aliases from one identity contract.
- Emit matching homepage metadata, JSON-LD, `/api/ai`, `llms.txt`,
  `llms-full.txt`, route Markdown, sitemap, robots declaration, and changelog
  links from that contract.
- Validate every declared public URL with `npm run check:geo-links`.
- Keep source-complete, deployed, technically readable, prompt-owned, and
  provider-observed as independent states in dashboards and audits.
- Require a provider/model/timestamp receipt before showing a numerical AI
  awareness score.
