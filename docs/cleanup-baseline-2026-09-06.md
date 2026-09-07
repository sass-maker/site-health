> Historical migration baseline, superseded by [the current cleanup report](cleanup-report.md). Its counts and inherited sharing flags are not current verification. An ignored dashboard policy is not proof that a workflow cannot execute.

# Portfolio Cleanup Report

**Date:** 2026-09-06
**PRD:** `/Users/sarthak/Downloads/PORTFOLIO_CLEANUP_PRD_FINAL.md`
**Tracking issue:** https://github.com/sass-maker/site-health/issues/491

## Summary

Migrated the 56-project portfolio from the legacy lifecycle model
(`lifecycle: "maintained"|"past"`, `tier`, `attention`, `portfolio.status`,
`portfolio.priority`, `portfolio.readyToShare`) to the PRD's three-field model:

```ts
type ProjectLifecycle = {
  status: 'primary' | 'active' | 'inactive';
  shareable: boolean;
  resumeCondition: string | null;
};
```

## Allocation

- **Primary:** 2 (codevetter, posttrainllm)
- **Active:** 18
- **Inactive:** 36
- **Total:** 56

## Shareability assignment

`shareable` was derived from the existing `portfolio.readyToShare`/
`readyToBeShared` + `sharingReadiness.verifiedAt` evidence. Projects
with `readyToShare: true` and a non-empty `verifiedAt` date were set to
`shareable: true`. All others fail closed to `false`.

- **shareable=true:** 32
- **shareable=false:** 24

No new verification was performed. The PRD requires fresh verification
before promoting any project; existing evidence was preserved as the
starting baseline.

## Resume conditions

All `resumeCondition` values are `null`. No resume conditions were
fabricated. The PRD allows null for inactive projects and requires null
for primary/active.

## Per-project allocation

| ID | Display name | Status | Shareable | Old lifecycle | Old tier | Old p.status |
|---|---|---|---|---|---|---|
| codevetter | CodeVetter | primary | true | maintained | focus | active |
| posttrainllm | PostTrainLLM | primary | true | maintained | focus | active |
| starboard | Starboard | active | true | maintained | secondary | active |
| swe-interview-prep | SWE Interview Prep | active | true | maintained | secondary | active |
| high-signal | High Signal | active | true | maintained | active | active |
| setline | Setline | active | false | maintained | secondary | active |
| anchor | Anchor | active | false | maintained | active | active |
| anime-list | Anime List | active | true | maintained | secondary | active |
| what-it-takes-to-win | Look Sideways / Paths | active | true | maintained | secondary | active |
| calorie | Calorie | active | true | maintained | secondary | active |
| live | Live | active | true | maintained | active | active |
| pace | HeyPace / Pace | active | true | maintained | focus | active |
| site-health | Site Health | active | false | maintained | active | active |
| app-health | App Health | active | true | maintained | active | active |
| knowledge-base | Knowledge Base | active | true | maintained | active | active |
| chatgpt-connections | ChatGPT Connections | active | false | maintained | active | active |
| free-ai | Free AI | active | true | maintained | active | active |
| saas-maker | SaaS Maker | active | true | maintained | active | active |
| significanthobbies | Significant Hobbies Hub | active | true | maintained | secondary | active |
| ios-landings | iOS Landings | active | false | maintained | secondary | active |
| on-record | High Signal Podcasts | inactive | true | maintained | active | active |
| research-papers | Research Papers | inactive | true | maintained | secondary | active |
| chatgpt-memory-insights | Memory Map | inactive | true | maintained | secondary | active |
| reader | Reader | inactive | true | maintained | secondary | active |
| looptv | LoopTV | inactive | true | maintained | secondary | active |
| veg-protein-food | Recipe Index | inactive | false | maintained | active | active |
| india-standards | India Standards | inactive | true | maintained | secondary | active |
| drank | DRank | inactive | true | maintained | active | active |
| psi-swarm | PSI Swarm | inactive | true | maintained | active | active |
| gitstat | GitStat | inactive | false | maintained | secondary | active |
| sarthakagrawal-personal | Personal website | inactive | true | maintained | secondary | active |
| issue-pages | IssuePages | inactive | false | maintained | active | active |
| email-manager | Kinetic | inactive | true | maintained | active | active |
| rolepatch | RolePatch | inactive | true | maintained | secondary | active |
| karte | Karte | inactive | true | maintained | secondary | active |
| reel-pipeline | Reel Pipeline | inactive | false | maintained | active | active |
| mashup | Mashup | inactive | true | maintained | active | active |
| field-track | Field Track | inactive | true | maintained | active | active |
| ai-game | AliveVille | inactive | false | past | parked | archived |
| kith | Kith | inactive | false | maintained | secondary | active |
| motion | Motion | inactive | true | maintained | active | active |
| web-playables | Web Playables | inactive | false | past | out-of-fleet | archived |
| agent-office | Office OS | inactive | true | maintained | active | active |
| mobile-dev-cockpit | Mobile Dev Cockpit | inactive | false | past | parked | archived |
| journal | Journal | inactive | false | maintained | secondary | active |
| chess | Chess Coach | inactive | false | past | secondary | archived |
| protein-index | Protein Index | inactive | false | past | parked | archived |
| materia | Materia | inactive | false | past | active | archived |
| reddit-insights | Reddit Insights | inactive | false | maintained | active | active |
| everythingrated | EverythingRated | inactive | false | past | secondary | archived |
| verified-bases | Verified Bases | inactive | false | past | out-of-fleet | archived |
| truehire | TrueHire | inactive | false | past | out-of-fleet | archived |
| local-ai-video-studio | Local AI Video Studio | inactive | true | maintained | active | active |
| open-historia | Open Historia | inactive | false | past | parked | archived |
| companion-robot | Companion Robot | inactive | false | past | out-of-fleet | archived |
| forecast-lab | Forecast Lab | inactive | false | past | out-of-fleet | archived |

## Changes made

### site-health

1. **`apps/backend/config/projects.json`** — Replaced string `lifecycle`
   field with three-field object on all 56 projects.
2. **`apps/backend/lib/dashboard-backend/registry.mjs`** — Updated
   lifecycle default to object shape.
3. **`apps/backend/lib/dashboard-backend/domain-scope.mjs`** — Updated
   `isCurrentPortfolioProject`, `isPublicMetricProject`, and
   `isDomainStrengthProject` to use `lifecycle.status` instead of
   string lifecycle, tier, attention, and priority checks. Added
   `lifecycleStatus()` helper.
4. **`apps/backend/lib/visibility-projects.mjs`** — Updated
   `isVisibilityProject` to use `lifecycle.status`.
5. **`apps/web/src/scripts/dashboard-client.ts`** — Added
   `lifecycleLabel()` helper to extract status string from object.
6. **`apps/backend/config/root-brands.json`** — Removed 4 inactive
   project roots (aliveville.com, karte.cc, rolepatch.com,
   sarthakagrawal.dev). Reduced from 10 to 6 roots.
7. **`apps/backend/config/root-search-queries.json`** — Removed same 4
   inactive project roots. Reduced from 10 to 6 roots.
8. **`docs/project-dossiers/*.yaml`** — Regenerated all 56 dossiers
   with new lifecycle object.
9. **Test updates** — Updated 7 test files with new lifecycle object
   fixtures, new portfolio scope counts (20 current, 17 public metric
   targets, 6 domain strength roots), and new visibility project count
   (17).

### saas-maker

1. **`scripts/public-products.mjs`** — Added `lifecycleStatus()` and
   `lifecycleShareable()` helpers. Updated `directoryGroup()` to use
   `lifecycle.status === 'inactive'` instead of `portfolio.status ===
   'archived'` / `lifecycle === 'past'`. Updated past listing check and
   directory lifecycle field.
2. **`catalog/generated/public.json`** — Regenerated via
   `pnpm catalog:sync-public`. Directory now has lifecycle values
   `primary`/`active`/`inactive` instead of `maintained`/`past`.
3. **`tests/showcase/directory.test.ts`** — Updated group counts:
   current=17, supporting=3, past=36.

## Portfolio scope changes

| Metric | Old | New |
|---|---|---|
| Current projects | 32 | 20 |
| Public metric targets | 26 | 17 |
| Domain strength roots | 8 | 6 |
| Visibility projects | 36 | 17 |
| Root brand roots | 10 | 6 |
| Root search query roots | 10 | 6 |

The old scope included P2-priority "maintained" projects that are now
inactive. The new scope follows the PRD allocation: primary + active
only.

## Legacy fields preserved

The following legacy fields remain in `projects.json` for compatibility:
- `tier` (focus/active/secondary/parked/out-of-fleet)
- `attention` (foundry/ignored/my-work/toolbox)
- `portfolio.status` (active/archived)
- `portfolio.priority` (P1-P4)
- `portfolio.readyToShare` / `portfolio.sharingReadiness`

These are superseded by the three-field lifecycle model but have not
been removed. Consumers have been updated to read from the new
`lifecycle` object. A future cleanup can remove the legacy fields once
all downstream consumers are verified.

## Automation gating

### GitHub Actions policy

All 36 inactive projects are now marked `disposition: ignored` in
`apps/backend/config/project-actions-policy.json`. This stops their
workflows from appearing as active owner attention on the dashboard
while preserving the workflows themselves for preservation and security.

- **Primary (9 workflows):** codevetter (7), posttrainllm (2) — all active
- **Active (79 workflows):** 18 projects — all active
- **Inactive (82 workflows):** 36 projects — all marked ignored

### Local cron jobs

Seven fleet-level cron jobs run on the operator's machine:

1. `daily-fleet-health-sentinel` — fleet health monitoring
2. `weekly-fleet-ops-audit` — operational audit
3. `biweekly-fleet-audit` — portfolio audit
4. `weekly-geo-observatory` — geo/SEO observatory
5. `weekly-spend-guard` — spend monitoring
6. `nightly-learning-sync` — learning session sync
7. `daily-learning-session` — daily learning session

These are fleet-level operational routines, not per-project feature or
expansion work. They are retained as necessary operations per the PRD.

### Cloudflare triggers

No per-project Cloudflare cron triggers were added or removed. Existing
deploy hooks and Workers schedules remain as-is. The PRD excludes
deployment changes without explicit approval.

### Summary

- 82 workflows across 36 inactive projects are now gated via the
  actions policy.
- No workflows were deleted; they remain for preservation and security.
- Fleet-level operational cron jobs are retained.
- No deployment, DNS, or infrastructure changes were made.

## Verification

- site-health backend tests: 133/133 pass
- saas-maker catalog check: passes (56 identities, matches Site Health)
- saas-maker catalog validation: passes
- Dossier check: passes (56 verified YAML dossiers)

## Unresolved

- No fresh shareability verification was performed (PRD requires it
  before promoting any project)
- No resume conditions were assigned (all null — no evidence to
  fabricate from)
- The fleet-root `AGENTS.md` still references "54-project intent" for
  the portfolio-condensed doc; updating that rules file requires owner
  approval
