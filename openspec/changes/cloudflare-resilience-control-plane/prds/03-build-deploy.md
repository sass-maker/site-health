---
title: Build, Deploy, Preview, and Rollback Safety
owner: Devin 3
status: implemented
---

# Build, Deploy, Preview, and Rollback Safety

## Objective

Make every in-scope Pages/Worker deployment path fail closed before a broken
build becomes the live surface, while preventing hung jobs, stale lockfiles,
orphan preview resources, and unclear rollback decisions.

## Repository scope

Own only CI/workflow/deploy documentation and release evidence for the in-scope
fleet surfaces not being changed for runtime behavior by Devin 1 or Devin 2.
This includes, at minimum, the Pages-heavy surfaces (`codevetter`, `pace`,
`posttrainllm`, `drank`, `chess`, `saas-ideas`, `research-papers`, `materia`,
`anime-list`, `looptv`, `swe-interview-prep`, `ai-game`, and
`web-playables`) plus remaining Worker/Pages workflow files after confirming
ownership boundaries.

If a repository appears in another PRD, do not edit its runtime files. You may
make a workflow change only when it does not collide with the other agent’s
declared files; record the coordination clearly.

## In scope

For each deploy path:

1. Identify the source SHA, branch/event, build command, package manager,
   lockfile mode, Cloudflare project/Worker name, and canonical smoke URL.
2. Add a bounded job timeout appropriate to the build/deploy path.
3. Enforce the repository’s intended frozen lockfile/build contract without
   changing dependency selections.
4. Add a post-deploy smoke check that fails on an unexpected status and has its
   own bounded curl/request timeout. Record intentional API-root or
   artifact-only exceptions.
5. Add concurrency protection for scheduled/manual jobs where overlap could
   duplicate deployment or data work.
6. Detect and prevent persistent PR/preview Worker creation, or document an
   explicit close-event teardown path.
7. Add a concise rollback target/runbook reference for Worker-backed surfaces
   and identify the last-good evidence source for Pages.
8. Make failures visible in the workflow summary; never use `|| true` to hide a
   build, deploy, or smoke failure unless the step is explicitly non-gating and
   says why.

## Out of scope

- Deploying, merging, pushing, deleting Workers, DNS, WAF, rate limits, or
  Cloudflare account settings.
- Runtime code, data migrations, secret changes, or new dependencies.
- Rewriting the shared resilience audit or changing its severity policy.
- Treating a historical failure as fixed without a local check and a future
  CI rerun plan.

## Acceptance criteria

- [x] Every owned deployment path has source-SHA/build evidence, timeout,
      canonical smoke or documented artifact exception, and rollback target.
- [x] No owned workflow creates a persistent preview/PR Worker without
      teardown or a same-Worker version strategy.
- [x] Scheduled/manual workflows cannot overlap when overlap is unsafe.
- [x] Frozen-lockfile failures are repaired by synchronizing the intended
      lockfile, not by disabling frozen mode.
- [x] Smoke checks use bounded requests and fail the job on unexpected status.
- [x] YAML parses, repository checks pass, and no unrelated dirty work is
      modified.

## Validation and handoff

Run workflow YAML parsing plus each repository’s smallest build/deploy-contract
check. From the fleet root run:

```bash
node fleet-ops/scripts/cloudflare-resilience-audit.mjs --no-live --json
git diff --check
```

Return a deployment matrix: repository, workflow, trigger, source SHA,
timeout, build command, smoke URL/exception, preview policy, rollback target,
validation result, and residual risk. Do not trigger a deploy.
