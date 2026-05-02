<claude-mem-context>
# Memory Context

# [Fleet] recent context, 2026-05-02 2:58pm GMT+5:30

No previous sessions found.
</claude-mem-context>

# Fleet Work Conventions

Read this file before making durable workflow, documentation, planning, or
task-tracking decisions in any project under this Fleet directory.

This file applies to every project under `/Users/sarthakagrawal/Desktop/Fleet`
unless a project has a deeper `AGENTS.md` with more specific instructions.
Project-level instructions add project context; they do not replace this Fleet
policy unless they explicitly conflict.

## Tasks vs Plan Docs

Default to creating a Symphony task instead of writing a new plan document.
A task is the normal unit for:

- bug fixes, CI/deploy failures, and broken production behavior
- cleanup/refactor work
- small or medium feature implementation
- research that should produce an actionable next step
- follow-ups, TODOs, and deferred work

Do not create `docs/plans/*.md` just to remember work. Put the goal, context,
acceptance criteria, and completion evidence in the task.

Create or keep a plan/design doc only when the artifact has durable value after
the task is done:

- architecture or product decisions that future agents must understand
- multi-project migrations with ordering and rollback constraints
- irreversible or risky changes that need design reasoning
- user-facing product specs or runbooks
- research/reference material that is not itself an action item

When a plan doc results in execution work, split that execution into Symphony
tasks and link back to the plan. When a task is complete, mark the task done and
record evidence there instead of creating another plan doc.

## Documentation Boundaries

- `README.md`: current human entrypoint for the project.
- `docs/`: durable reference, architecture, runbooks, research, and product docs.
- `docs/plans/`: rare design artifacts, not the default task queue.
- Symphony tasks: operational source of truth for active and deferred work.
- Symphony memory: standing preferences for how agents should behave.

## Project Awareness

Projects should reference this Fleet policy rather than copying it. If a project
needs local clarification, add only the project-specific exception in that
project's `AGENTS.md` or `docs/README.md` and keep this file as the default
source of truth.

When starting work inside a project, read both:

1. `/Users/sarthakagrawal/Desktop/Fleet/AGENTS.md`
2. the project's nearest `AGENTS.md`, when present
