# Fleet Ops

`fleet-ops/` is the operational layer of the Fleet monorepo. It owns policy,
registries, automation intent, host setup, scripts, skills, agent workspaces,
shared operational libraries, evidence, and operational documentation.

Deployable interfaces live in root `apps/`, helper runtimes in `services/`,
reusable code in `packages/`, and operator tools in `tools/`. Independent
products such as CodeVetter and App Health do not live in this repository.

## Structure

```
fleet-ops/
├── config/              # Canonical registries and checked-in policy
├── automation/          # Inert schedule intent; machine activation stays local
├── host/                # Designated-host setup and readiness checks
├── scripts/             # Operator commands and generators
├── skills/              # Fleet-owned agent workflows
├── agents/              # Isolated OpenClaw agent workspaces
├── teammates/           # Delegation routing and outcome records
├── lib/                 # Shared implementation used by scripts and apps
├── templates/           # Reusable source templates
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
| `fleet-ops` | parent | fleet-audit, fleet-init, fleet-deploy-guard, fleet-workspace |
| `call-teammate` | parent | Codex, Grok, Hermes, and optional approved teammates |
| `name-domains` | standalone | — |
| `spec-driven` | standalone | — |
| `psi-swarm` | standalone | — |
| `agent-ready` | standalone | — |
| `seo-audit` | standalone | — |
| `token-budget` | standalone | — |
| `mobile-task-control` | standalone | — |
| `daily-learning` | standalone | fresh private 30-minute learning sessions |
| `impeccable` | external standalone | design context, critique, polish, and audit workflow |

Fleet-owned skills are wired from `fleet-ops/`. Impeccable is installed
project-locally by `fleet-ops/scripts/agent-stack.sh install-skills`, remains
machine-local, and is then linked into child Fleet projects with the other
skills.

## Adding a new skill

1. Create `skills/<name>/SKILL.md` (or `teammates/skills/<name>/SKILL.md` for delegation).
2. If it belongs under an existing parent, add a row to the parent's routing table — no new symlink needed.
3. If standalone, symlink it into each agent skill dir:
   ```bash
   for dir in ~/.codex/skills ~/.openclaw/skills; do
     ln -s ~/Desktop/fleet/fleet-ops/skills/<name> "$dir/<name>"
   done
   ```
4. Commit and push.

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
