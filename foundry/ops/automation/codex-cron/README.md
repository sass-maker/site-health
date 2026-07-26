# Codex Cron

Versioned replacement for the Codex app automation schedules.

`jobs.tsv` contains conversational Codex jobs. `system-jobs.tsv` contains
deterministic jobs that do not need a model, including the nightly learning
source sync.

The weekly GEO Observatory is a bounded conversational job because comparable
SERP classification requires live web search and coarse judgment. It writes
only its validated ledger/report pair and uses no paid search API.

The weekly Spend Guard is checked in as `enabled=no`. It remains inert even
when the managed cron block is installed. Its read-only prompt and deterministic
recorder can be tested manually; activation is a separate operator decision.
Snapshots stay private under the ignored `state/spend-guard/` directory, and
only warning or critical results are eligible for owner delivery.

## Commands

```sh
foundry/ops/scripts/agent-bin/install-codex-cron
foundry/ops/scripts/agent-bin/install-codex-cron --check
foundry/ops/scripts/agent-bin/run-codex-cron daily-fleet-health-sentinel --dry-run
foundry/ops/scripts/agent-bin/render-codex-cron-ui
```

`install-codex-cron` writes a managed `# BEGIN FLEET OPS CODEX CRON` block to the
user crontab. It preserves any unrelated crontab lines.

The checked-in registries use `@fleet` instead of a user-specific checkout
path. The installer resolves it to the checkout containing the installer,
validates every prompt/command and job policy, and writes that resolved root
only into the machine-local crontab. A second host therefore clones the repo
and runs the installer; no source edit is required.

Runtime logs and locks stay local under this directory and are intentionally not
committed.
