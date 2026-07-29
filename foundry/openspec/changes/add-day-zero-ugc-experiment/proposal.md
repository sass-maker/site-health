## Why

The Sprout UGC Playbook Part 1 describes a Day 0 operating model: a
founder-led, 90-day experiment with 3–5 creators, tight scripts, high-touch
review, and one goal—find a structural format that repeatedly breaks out
across creators.

Fleet already owns much of the downstream media plumbing in Reel Pipeline:
hook and format variants, product-proof capture, authentic app/presenter
capture, 9:16 composition, captions, approval gates, artifact receipts,
Postiz draft handoff, and performance receipts. What is missing is the
experiment spine that connects a format hypothesis to creator executions,
revisions, posts, metrics, replication, and a stop-or-scale decision.

Adding another broad creator platform would recreate capabilities Fleet does
not need at Day 0. The useful change is a small, stage-specific control layer
that reuses current systems and keeps creator sourcing, contracts, payments,
brand-account credentials, and on-device posting outside Reel Pipeline.

## Coverage Audit

| Playbook capability | Current Fleet coverage | Status |
| --- | --- | --- |
| Multiple hook and format variants | `growth-formats.js`, Signal draft bundles, reel templates | Covered |
| Product shown as real proof | Product-proof capture and `guided-app-demo@1` | Covered |
| Vertical composition and captions | Multiple 9:16 renderers and quality checks | Covered |
| Creator/app capture rights and approval | Forge capture and presenter provenance gates | Covered |
| Human review before distribution | Reel review gates and Postiz draft-only handoff | Covered |
| Post-level metrics and attributable receipts | Postiz analytics plus Significant Content performance receipts | Covered |
| No automatic social publishing | Native publishing fails closed; Postiz owns publication | Covered |
| Repeatable-format experiment | Generic 35-post growth profile exists, but does not model Day 0 cadence or graduation | Partial |
| Hook iteration | Variants exist, but no hook-only clone lineage or 24-hour response action | Partial |
| Creator footage intake | Same-session capture exists, but no external creator-cut submission contract | Partial |
| Time-coded revision loop | Review gates exist, but creator notes and revision SLA are not structured | Partial |
| Brand visibility | Watermarks/product proof exist, but no visible-product identity review check | Partial |
| Product/channel fit scorecard | No explicit UGC qualification gate | Missing |
| 90-day, 3–5 creator experiment state | No Day 0 experiment contract or roster references | Missing |
| Five-to-eight executions per format | No per-format repetition budget or evaluation hold | Missing |
| Replication across two or more creators | No format-level cross-creator graduation rule | Missing |
| 5K/10K/50K/100K signal thresholds | Metrics exist, but Day 0 thresholds and actions do not | Missing |
| Native-editor production packet | Reel Pipeline assumes render or draft artifacts; no creator-facing native edit packet | Missing |
| Format scouting and skeleton provenance | No structure-only reference record with anti-copy boundaries | Missing |
| Creator sourcing, DMs, contracts, payouts, account credentials | Intentionally outside Reel Pipeline | Deliberately out of scope |

## What Changes

- Add a versioned Day 0 UGC experiment contract with product-fit evidence,
  canonical project, 90-day window, 3–5 opaque creator references, weekly
  cadence, budget acknowledgement, positioning freeze, and stop/graduate
  rules.
- Add a format-hypothesis contract that separates structural skeleton from
  topic and creative skin, records source inspiration without copying lines or
  assets, and requires 5–8 executions before evaluation.
- Add creator execution records that retain creator reference, format,
  hook/angle/character variables, product reveal, disclosure text, source
  footage rights, revision, and approval.
- Add a native-edit production packet as the Day 0 default: full script,
  time-coded beats, product-proof asset, captions, disclosures, and posting
  notes. Reel Pipeline rendering remains optional rather than replacing
  on-device TikTok editing.
- Add external creator-cut intake with hashes, rights evidence, visible-brand
  review, time-coded revision notes, and final approval.
- Normalize Postiz or manual metric receipts into Day 0 signals: 5K emerging,
  10K strong, 50K breakout, and 100K continuation proof.
- Recommend a hook clone within 24 hours after a breakout and graduate only
  when one format produces 2–3 outsized results across at least two creators.
- Keep sourcing, outreach, contracts, payouts, tax paperwork, credentials, and
  native social posting outside Reel Pipeline.

## Capabilities

### New Capabilities

- `day-zero-ugc-experiment`: Stage-specific UGC format discovery from product
  qualification through repeatable-format or stop decision.

### Modified Capabilities

- `marketing-control-plane`: Foundry can show an active UGC experiment and its
  bounded next action without storing creator credentials or private contract
  terms.
- `reel-content-handoff`: Reel Pipeline can accept approved creator cuts or
  native-edit packets while preserving experiment, format, hook, creator, and
  rights attribution.

## Impact

- Canonical experiment and status ownership: Foundry marketing control plane.
- Media packet, creator-cut validation, quality review, and receipts: Reel
  Pipeline.
- Scheduling, publication, integrations, and provider metrics: Postiz.
- Human operations: creator scouting, DMs, contracts, payments, tax forms,
  credential custody, and creator-device TikTok posting.
- No deployment, social account connection, creator outreach, payment, or
  production mutation is part of this planning change.
