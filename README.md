# Fleet

This directory is the local workspace for the personal project fleet.

This root is its own lightweight repository for Fleet-wide policy and docs. Each
child project remains its own separate repository.

## Work Tracking

Use Symphony tasks as the default place to capture work. A task can be an
investigation, a bug fix, a deploy check, cleanup, a code change, or a deferred
follow-up. It does not need to imply that code must change.

Create a task for:

- failing CI, broken deploys, and production bugs
- small or medium features
- cleanup and migration work
- TODOs and follow-ups
- research that should lead to a decision or implementation

Use a docs plan only when the document should remain useful after the work is
done. Good examples are architecture decisions, product specs, migration
strategies, runbooks, and research/reference notes.

## Docs Boundary

- Project `README.md`: current human entrypoint.
- Project `docs/`: durable reference, architecture, runbooks, research, and
  product docs.
- Project `docs/plans/`: rare design artifacts, not the task queue.
- Symphony tasks: operational source of truth for active and deferred work.
- Symphony memory: standing instructions for how agents should behave.

When a plan creates execution work, split that work into Symphony tasks. When
work is done, mark the task done and record evidence on the task instead of
creating another plan doc.

Agent-facing instructions live in the fleet-level `AGENTS.md`. Claude uses
`CLAUDE.md` as a bridge into the same policy. Child projects can opt into
Fleet-owned skills and references with `scripts/link-project-agent-assets.sh`.

## Repository Boundary

The Fleet root repo tracks only workspace-level control files and shared agent
assets:

- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `.gitignore`
- `docs/`
- `scripts/`
- `.agents/skills/`
- `.claude/skills/`

Child project directories are intentionally ignored here because they are
independent repositories with their own histories, branches, and deploy flows.

## Agent Layering

Fleet uses three layers:

- machine level: personal config in `~/.claude`, `~/.codex`, and
  `~/.agents/skills`
- Fleet level: shared policy and shared skill source in this repository
- project level: explicit opt-in references and symlinks inside child projects

Use a dry run before linking:

```bash
./scripts/link-project-agent-assets.sh --dry-run
```

Then link all immediate child Git repositories:

```bash
./scripts/link-project-agent-assets.sh
```

Details live in `docs/agent-layering.md`.
