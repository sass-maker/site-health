# Tasks

## Proposal and baseline

- [x] Confirm the change scope against the current live inventory and known
  exceptions.
- [x] Capture a dated baseline report without changing production state.

## Audit implementation

- [x] Add the read-only resilience audit command under `fleet-ops/scripts/`.
- [x] Validate `projects.json` and reconcile Pages/domains/queues/workflows
  where the authenticated account capability allows it; verify deployment
  history for each actual manifest Worker name because Wrangler has no
  account-wide Worker list command in this environment.
- [x] Scan tracked Wrangler configs and GitHub workflows for background-job and
  preview/deploy safety evidence.
- [x] Add bounded public probes and expected-status contracts.
- [x] Emit redacted JSON and Markdown findings with severity and next action.

## CI and documentation

- [x] Add a scheduled/manual fleet workflow that runs the manifest/live audit
  with least privilege and uploads the report as an artifact.
- [x] Document the resilience contract, exception policy, and operator
  runbook/rollback evidence requirements.
- [x] Document the forward-looking failure register, early signals, and
  product-specific response policy.
- [ ] Update the canonical project/deploy docs only where the live audit proves
  drift.

## Remediation and verification

- [x] Fix concrete deploy/control defects found by the
  audit, preserving unrelated dirty work.
- [x] Run targeted tests plus the fleet audit and live probes.
- [ ] Re-run the audit after any approved deploy and record the residual risks.
- [ ] Archive the change and update `PROJECT_STATUS.md` after the control plane
  is shipped.
