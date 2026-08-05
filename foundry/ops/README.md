# Fleet Ops

`foundry/ops/` is the operational layer of the Fleet monorepo. It owns policy,
registries, automation intent, host setup, scripts, skills, agent workspaces,
shared operational libraries, evidence, and operational documentation.

Public, internal, and dashboard interfaces live under `foundry/apps/`.
Marketing lives under `foundry/marketing/`, shared packages under
`foundry/packages/`, and Fleet-owned skills under `foundry/ops/skills/`.
Independent products such as CodeVetter and App Health do not live in this
repository.

## Structure

```
foundry/ops/
├── config/              # Canonical registries and checked-in policy
├── automation/          # Inert schedule intent; machine activation stays local
├── host/                # Designated-host setup and readiness checks
├── scripts/             # Operator commands and generators
├── skills/              # Fleet-owned agent workflows
├── agents/              # Isolated OpenClaw agent workspaces
├── teammates/           # Delegation routing and outcome records
├── lib/                 # Shared implementation used by scripts and apps
├── templates/           # Reusable source templates
├── workflows/           # Pinned public credential-free automation submodule
│
├── public/              # Checked-in privacy-filtered public projection
├── data/                # Durable evidence ledgers
├── out/                 # Generated snippets for manual downstream adoption
├── test/                # Fleet tests and shared fixtures
├── assets/              # Shared product and organization assets
└── docs/                # Living references; dated history belongs in docs/archive
```

Retired repositories do not belong in this tree as tarballs. Their transferred
GitHub repositories and Fleet Git history are the recovery boundary.

## Skill discovery model

Agents load a small set of parent and standalone skills, then discover
subskills on demand. The repository paths below, rather than a hard-coded skill
count, are the source of truth.

| Symlink | Type | Routes to |
|---|---|---|
| `fleet-ops` | parent | fleet-audit, fleet-init, fleet-deploy-guard, fleet-workspace, cloudflare-spend-guard |
| `call-teammate` | parent | Codex, Grok, Hermes, and optional approved teammates |
| `site-health` | parent | agent-ready, seo-audit, content-coverage, psi-swarm, geo-observatory, public-product-smoke |
| `design-engineering` | parent | design-inspiration, component-pattern-mine, web-3d-pipeline, creative-web-effects |
| `name-domains` | standalone | — |
| `spec-driven` | standalone | — |
| `psi-swarm` | standalone | — |
| `agent-ready` | standalone | — |
| `seo-audit` | standalone | — |
| `code-cleanup` | standalone | Knip/native quality orchestration, dependency health, guarded upgrades, and advisory Bundlephobia evidence |
| `token-budget` | standalone | — |
| `local-ports-cleanup` | standalone | safety-first local port cleanup through `ports` |
| `mobile-task-control` | standalone | — |
| `daily-learning` | standalone | fresh private 30-minute learning sessions |
| `cloudflare-spend-guard` | fleet-ops subskill | read-only Cloudflare/Turso spend, quota, necessity, and optimization audits |
| `impeccable` | external standalone | design context, critique, polish, and audit workflow |

Fleet-owned skills are wired from `foundry/ops/`. Impeccable is installed
project-locally by `foundry/ops/scripts/agent-stack.sh install-skills`, remains
machine-local, and is then linked into child Fleet projects with the other
skills.

## Capability discovery

The read-only capability catalog gives humans and agents one searchable view of
Fleet-owned skills, operator scripts, reusable templates, and living
documentation. It derives entries from the canonical files under
`foundry/ops/`; there is no second registry to update.

`content-coverage` and `launch-campaign` are canonical catalog capabilities but
do not add new preload links in this change. Content sufficiency routes through
the existing `site-health` parent.

Public site availability and HTTP performance evidence lives in the pinned
`sass-maker/workflows` submodule. Fleet validates and updates its allowlisted
manifest without giving the public repository access to private source:

```bash
npm run check:public-workflows
node foundry/ops/scripts/public-workflows.mjs validate
node foundry/ops/scripts/public-workflows.mjs availability
node foundry/ops/scripts/public-workflows.mjs performance --runs 3
```

```bash
# Find the right Fleet capability from intent.
node foundry/ops/scripts/fleet-capabilities.mjs search "deploy readiness"

# Retrieve the canonical path and summary for one result.
node foundry/ops/scripts/fleet-capabilities.mjs get skill:fleet-deploy-guard

# Emit context from the same catalog in a token-efficient form.
node foundry/ops/scripts/fleet-capabilities.mjs context "site health" --dense

# Validate catalog roots, identifiers, metadata, and referenced files.
node foundry/ops/scripts/fleet-capabilities.mjs doctor --json
```

Commands are `list`, `search`, `get`, `execution`, `context`, and `doctor`. Use
`--type` with `skill`, `script`, `template`, or `doc`; use `--json` for the
versioned machine envelope and `--dense` for compact output. `doctor` validates
catalog integrity only—it does not run discovered tools or replace provider,
host, git, or deploy health checks.

### Provider-neutral skill execution profiles

Every Fleet-owned skill carries `execution-profile.json` beside `SKILL.md`.
The profile declares:

- recommended and minimum `intelligence` (`economy`, `balanced`, `frontier`);
- recommended and minimum `reasoning` (`low`, `medium`, `high`, `very_high`);
- the response below minimum (`allow`, `ask`, or `deny`); and
- a short rationale.

These are capabilities, not provider names or model IDs. Each host maps them to
its available runtimes while preserving owner, administrator, availability,
and cost policy. Inspect a compatibility decision without invoking a model:

```bash
node foundry/ops/scripts/fleet-capabilities.mjs execution \
  skill:launch-campaign --runtime balanced:high
```

The result is `recommended`, `compatible`, `degraded`, `approval_required`, or
`redispatch_required`. It is metadata guidance, not a natural-language
resolver or an automatic model switch.

### Local skill run history

Fleet-owned skill executions can be recorded in a private machine-local store
with retained sanitized output and explicit numeric observations. This gives
future project dashboards a stable time series for values such as domain rank
or agent score without parsing prose or publishing private logs.

Install the command and Codex hook with:

```bash
./foundry/ops/scripts/agent-stack.sh install-skills
```

Then inspect history with
`node "$HOME/.local/bin/fleet-skill-run" list` or query project metrics with
`node "$HOME/.local/bin/fleet-skill-run" metrics --project <id> --json`.
The complete storage, privacy, capture, backfill, and query contract is in
[`docs/skill-run-observability.md`](docs/skill-run-observability.md).

## Adding a new skill

1. Create `skills/<name>/SKILL.md` (or `teammates/skills/<name>/SKILL.md` for delegation).
2. Add a valid provider-neutral `execution-profile.json`.
3. If it belongs under an existing parent, add a row to the parent's routing table — no new symlink needed.
4. If standalone, symlink it into each agent skill dir:
   ```bash
   for dir in ~/.codex/skills ~/.openclaw/skills; do
     ln -s ~/Desktop/fleet/foundry/ops/skills/<name> "$dir/<name>"
   done
   ```
5. Commit and push.

## Adding a new script

1. Add the script to `scripts/`.
2. If it needs a skill wrapper (for agent discovery), create a skill under `skills/` and add it to the parent routing table or as a standalone.
3. Commit and push.

`scripts/agent-bin/` contains machine-local convenience wrappers. Keep them
small, credential-free, and explicit about any provider environment variable
they require.

Current-month Cloudflare Worker CPU attribution is available with:

```bash
node scripts/report-workers-cpu.mjs
```

## Editing skills

Edit SKILL.md files in this repo. Never edit in `~/.claude/skills/` or other
agent dirs — those are symlinks. Changes here propagate to all 4 agent
runtimes automatically.
