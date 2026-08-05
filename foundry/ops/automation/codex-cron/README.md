# Codex Cron

Versioned replacement for the Codex app automation schedules.

`jobs.tsv` contains conversational Codex jobs. `system-jobs.tsv` contains
deterministic jobs that do not need a model, including the nightly learning
source sync.

The weekly GEO Observatory is a bounded conversational job because comparable
SERP classification requires live web search and coarse judgment. Its workload
comes only from the active canonical ten-root search contract: ten roots ×
brand, exact-domain, category, and problem intent. The recorder accepts the
complete same-date 40-observation batch or writes nothing. It preserves the
legacy all-project ledger history, writes only the validated ledger/report
pair, and uses no paid search API.

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
foundry/ops/scripts/agent-bin/run-clean-main-codex-cron weekly-geo-observatory --dry-run
foundry/ops/scripts/agent-bin/render-codex-cron-ui
```

`install-codex-cron` writes a managed `# BEGIN FLEET OPS CODEX CRON` block to the
user crontab. It preserves any unrelated crontab lines.

Install the managed block from a scheduler-owned clone on clean `main`, not
from an active development checkout. Each conversational row declares an
`execution_checkout`: read-only workspace audits use `workspace`, while the
mutating weekly GEO Observatory uses `clean-main`. The installer requires an
explicit workspace root, so `@fleet` can never be silently rebound to the
scheduler clone. Conversational runners and their versioned inputs come from
the managed clone; workspace jobs execute with the real Fleet workspace as
their working directory. Deterministic system jobs retain their runner and
`@fleet` command paths under that explicit workspace root.

`run-clean-main-codex-cron` refuses dirty, non-`main`, ahead, or diverged
scheduler state. A clean checkout behind `origin/main` is fetched and
fast-forwarded to the exact remote revision before the runner loads the job
registry, prompt, skill, configuration, recorder, or ledger. It also overrides
the workspace root back to the verified scheduler clone. Preflight failures
keep the normal machine-local warning log and notification path; successful
jobs retain the existing per-job lock, log, notification, and dry-run behavior.

A suitable machine-local checkout path has no spaces and is not used for
development, for example:

```sh
git clone https://github.com/sass-maker/fleet-workspace.git \
  "$HOME/.local/share/fleet-ops/fleet-workspace"
"$HOME/.local/share/fleet-ops/fleet-workspace/foundry/ops/scripts/agent-bin/install-codex-cron" --check
"$HOME/.local/share/fleet-ops/fleet-workspace/foundry/ops/scripts/agent-bin/install-codex-cron" \
  --workspace-root "$HOME/Desktop/fleet" --print
"$HOME/.local/share/fleet-ops/fleet-workspace/foundry/ops/scripts/agent-bin/install-codex-cron" \
  --workspace-root "$HOME/Desktop/fleet"
```

The checked-in registries use `@fleet` instead of a user-specific checkout
path. The installer resolves it to the checkout containing the installer,
validates every prompt/command and job policy, and writes that resolved root
only into the machine-local crontab. A second host therefore clones the repo
and runs the installer; no source edit is required.

Runtime logs and locks stay local under this directory and are intentionally not
committed.
