# Change: Cloudflare fleet resilience control plane

## Why

The fleet has 18 Pages projects, 25 live Workers, scheduled GitHub jobs, Worker
cron handlers, Durable Objects, a Queue, a Workflow, AI fan-out, and multiple
deployment paths. Recent real incidents already exposed the failure modes this
change targets: CPU overage from abusive traffic, stale/manual build artifacts,
orphan preview resources, failed scheduled imports, and a misleading green
surface when a deeper workflow is red.

A healthy homepage is not enough. We need one repeatable, evidence-backed gate
that tells us whether a change can safely reach Cloudflare and whether the
background work can fail without duplicating, looping, silently dropping data,
or creating uncontrolled cost.

## What changes

- Add a read-only fleet resilience audit driven by
  `fleet-ops/config/projects.json`.
- Reconcile live Pages projects, canonical domains, Worker mappings, queues,
  workflows, and deployment metadata against the manifest.
- Scan deploy workflows and Wrangler configs for preview-resource creation,
  missing smoke/timeout/concurrency controls, stale lockfile/build assumptions,
  missing observability, and unsafe background-job patterns.
- Verify every canonical public domain and required health endpoint with an
  explicit expected-status contract.
- Produce machine-readable and human-readable evidence with severity,
  remediation, and known-exception fields.
- Add a scheduled/manual GitHub Actions entry point that reports failures
  without deploying, deleting, migrating, or changing credentials.
- Add a small, documented resilience contract for new scheduled, queued,
  workflow, Durable Object, and AI-heavy paths: bounded work, explicit timeout,
  retry policy, idempotency/deduplication, observable failure, and rollback
  evidence.
- Add a predictive failure register that maps early signals to safe operator
  responses without automatically introducing fleet-wide rate limits or WAF
  rules.

## Scope boundaries

In scope: fleet-ops tooling, audit docs, manifest/schema validation, CI gates,
and targeted fixes for concrete build/deploy safety defects discovered by the
audit.

Out of scope until a separate explicit approval: WAF/rate-limit changes,
Cloudflare billing/plan changes, secret rotation, DNS changes, resource
deletion, database migrations, production deploys, and broad rewrites of product
runtime code.

## Success criteria

1. One command can audit the complete in-scope fleet and exits non-zero only
   for actionable failures, while naming intentional exceptions.
2. Every in-scope public domain has a manifest owner and a live probe result.
3. No workflow can create persistent preview/PR Workers without a visible
   teardown or same-Worker version-preview mechanism.
4. Every detected scheduled/queued/workflow path has recorded timeout,
   concurrency/retry, idempotency, observability, and failure-handling evidence
   or an explicit tracked exception.
5. Deployment evidence includes the source SHA, smoke result, and rollback
   target for Worker-backed surfaces.
6. The audit is safe to run from CI and does not print secrets.
