## Context

Search performance already uses Google ADC, AI Visibility already contains
complete normalized provider observations, and Drank already records dated
domain ratings. The missing layer is one explicit update cycle that performs
safe discovery notification before measuring, without projecting a task list.

## Goals / Non-Goals

**Goals:**

- Reuse existing provider clients and private ledgers.
- Keep owner surfaces limited to measured evidence and observation dates.
- Preserve exact provider identity and evidence timestamps.

**Non-Goals:**

- Claiming that Google offers general-purpose forced indexing.
- Inventing backlink causes or automatically publishing outreach.
- Enabling recurring AI-provider spend or retaining raw model answers.

## Decisions

Google URL Inspection runs beside the existing Search Analytics calls and is
stored as a bounded object on the same observation. This keeps one refresh and
one authoritative snapshot.

The explicit Search update first runs the existing changed-only IndexNow
submitter, then ensures each accessible primary sitemap through Search Console,
then collects Search Analytics and canonical URL Inspection. Missing Google
write scope is retained as a bounded run result and does not replace valid
read-only measurement with a manual row-level task.

Independent Search Analytics reads use a four-project concurrency cap. URL
Inspection is serialized with one bounded retry because concurrent inspection
produced incomplete provider evidence in the live canary.

AI Awareness projects the existing provider-observation ledger. Domains and AI
Awareness retain their explicit remeasurement boundaries. The Console does not
copy automatic changes or recommendations into outcome tables.

## Risks / Trade-offs

- [CLI providers differ from consumer chat interfaces] -> Label them Codex and
  Claude Code and do not generalize beyond those surfaces.
- [Search Console inspection quotas] -> Inspect only canonical homepages once
  per explicit portfolio update.
- [External authority moves slowly] -> Re-run D-Rank after external propagation;
  do not present a technical action as if it could manufacture authority.

## Migration Plan

Accept historical Search outcomes without inspection data. The next explicit
Update writes a new compatible observation with inspection evidence. Rollback
removes the new projection fields; historical ledger lines remain readable.
