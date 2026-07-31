## 1. Origin and Policy Contracts

- [x] 1.1 Create the GitHub issue for the independently shippable autopilot change and link it from the implementation handoff
- [x] 1.2 Add backward-compatible scope, trigger, lane, source provenance, and automation-policy fields to Idea Store and Marketing Brief normalization
- [x] 1.3 Add a versioned secret-free automation policy registry with initial High Signal daily, Significant Hobbies weekly, and major-changelog event policies
- [x] 1.4 Add contract tests for valid lane combinations, legacy normalization, immutable source revisions, policy validation, and spend/distribution bounds

## 2. Source Discovery and Idempotency

- [x] 2.1 Reuse the High Signal and Significant Hobbies content extractors to emit stable lane-aware source records
- [x] 2.2 Add major-changelog discovery from maintained public project identity and durable shipped Timeline entries, preserving canonical `/changelog` evidence and excluding minor/internal changes
- [x] 2.3 Derive stable per-policy, source-revision, and channel idempotency keys and reuse existing ideas, briefs, artifacts, and distribution receipts on retry
- [x] 2.4 Add dry-run fixtures covering new, unchanged, revised, ineligible, unknown-project, and missing-channel sources

## 3. Autopilot Orchestration

- [x] 3.1 Rank policy-allowed recipes from the current readiness snapshot and record spend posture, rejected candidates, and blockers
- [x] 3.2 Create or resume normalized briefs and execute ready local productions without per-item Build confirmation when the matching standing policy authorizes execution
- [x] 3.3 Add bounded retry and fallback handling that preserves every attempt and terminates in an actionable exception
- [x] 3.4 Extend factory status with lane counts, policy/run outcomes, selected recipes, distribution state, and recovery actions

## 4. Artifact and Postiz Handoff

- [x] 4.1 Advance passing renders through the existing stable-media boundary and retain upload evidence without duplicating artifacts
- [x] 4.2 Prepare Postiz bundles automatically after all existing source, rights, creative-policy, quality, media, brand, channel, and mapping gates pass
- [x] 4.3 Create at most one Postiz draft or exact future schedule when the policy authorizes it, while retaining immediate-publication and direct-provider rejection
- [x] 4.4 Add focused tests for missing media, missing evidence, duplicate receipts, invalid schedules, policy mismatch, and successful draft/schedule submission with fake clients

## 5. CLI, API, and Studio Observability

- [x] 5.1 Add `factory autopilot` dry-run and execute commands with policy/all selection, bounded batch size, and structured JSON summaries
- [x] 5.2 Add Studio read APIs for policies, lane-aware status, runs, and exceptions plus one bounded local autopilot invocation endpoint
- [x] 5.3 Group or filter Studio productions by Project Autopilot, Ask Me, and Personal Automations while preserving the existing visual language and advanced controls
- [x] 5.4 Show policy revision, source, selected recipe, spend, quality, distribution state, and next recovery action without making the UI part of execution

## 6. Verification and Readiness

- [x] 6.1 Run focused origin, policy, discovery, factory, API, and Postiz tests after each touched boundary
- [x] 6.2 Run offline autopilot dry runs for all three initial project sources and prove unchanged reruns create no duplicates
- [x] 6.3 Run the relevant Studio suite, Postiz smoke, docs validation, strict OpenSpec validation, and repository diff checks
- [x] 6.4 Complete preserve-mode browser evidence for the lane observability change and record unresolved external runtime or credential blockers without claiming deployment readiness
