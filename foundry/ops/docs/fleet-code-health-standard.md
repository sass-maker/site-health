# Fleet Code Health Standard

Fleet judges code by observable properties and executable evidence, not by who
or what authored it. This standard applies one quality contract to every
maintained code project while preserving ecosystem-native tools and explicit
applicability.

## Scope

Enforcement includes catalog projects with lifecycle `maintained` and tier
`focus`, `active`, or `secondary`. Past, parked, out-of-fleet, and non-product
identities remain visible as `excluded`; they are never inspected or counted as
healthy during a Fleet-wide quality pass.

Each maintained identity has one explicit profile in
`foundry/ops/config/code-health.json`:

- `javascript-typescript`
- `python`
- `rust`
- `go`
- `swift-native`
- `mixed`
- `content-config`

Profiles declare required and advisory capabilities. They do not prescribe one
tool. A repository remains responsible for its local commands, configurations,
generated-source boundaries, and accepted native equivalents.

## Evidence model

Code health has three separate layers:

1. **Policy** — whether a capability is required, advisory, or not applicable.
2. **Coverage** — whether an inspectable repository-native evidence path is
   configured.
3. **Execution** — whether current evidence passed, failed, warned, is stale,
   or is unavailable.

A configured command is coverage evidence, not proof that the command passed.
Reports and handoffs must not blur those layers.

Every capability and project uses one state:

| State | Meaning |
| --- | --- |
| `pass` | Applicable evidence satisfies the evaluated contract |
| `fail` | Applicable evidence contradicts the contract |
| `warning` | Accepted debt, advisory evidence, or a time-bounded exception needs attention |
| `unavailable` | Required evidence cannot be produced or discovered |
| `not-applicable` | The profile deliberately excludes the capability |
| `excluded` | The catalog lifecycle or tier is outside maintained enforcement |

`unavailable` is never equivalent to `pass`. Strict health enforcement is
non-green when required evidence is unavailable.

## Blocking capabilities

Applicable maintained code profiles require:

1. **Format** — a check-only formatter path; write-mode formatting is never an
   inspection command.
2. **Lint** — the shared Fleet preset or a documented ecosystem-native
   equivalent.
3. **Types/compiler** — TypeScript, compiler, static type, or native build
   validation appropriate to the source.
4. **Tests** — repository-native automated tests for meaningful behavior.
5. **Unused code** — unused file, export, type, dependency, or native dead-code
   evidence. Knip is authoritative for JavaScript/TypeScript.
6. **Complexity** — cognitive-complexity evidence for production logic.
7. **Duplication** — production clone/duplication evidence, excluding generated,
   vendored, fixture, snapshot, and intentionally repeated protocol material.
8. **Coverage** — changed-code and project coverage evidence where executable
   production logic exists.
9. **Dependency risk** — explicit dependency review plus ecosystem-native
   vulnerability evidence.
10. **Cycles** — import or dependency-cycle evidence.
11. **Suppressions** — lint, type, test, or coverage suppressions remain
    justified and inspectable.
12. **Repository hygiene** — conflict markers, whitespace errors, accidental
    generated artifacts, and unexplained bulk output are absent.

Content/config-only profiles require only the capabilities that can provide
meaningful evidence. They must use `not-applicable` for executable-code
capabilities rather than manufacturing passes.

## Targets

The standard target for new and changed code is:

| Signal | Target |
| --- | --- |
| Cognitive complexity | At most 20 per changed production function |
| Changed-line coverage | At least 80% where measurable |
| New-project line/function/statement coverage | At least 80% |
| New-project branch coverage | At least 70% |
| New dependency cycles | Zero |
| Unapproved production dependencies | Zero |
| Critical/high dependency vulnerabilities | Zero |
| Production duplication | No increase; new projects start at or below the configured target |
| Unjustified new suppressions | Zero |
| Durable untracked `TODO`/`FIXME` markers | Zero; reference a GitHub issue |

Passing tests or builds do not cancel a failure in another blocking capability.
Raw line count, file count, dependency count, and commit count are context, not
quality verdicts.

## Baselines and ratchets

Existing measured debt may be accepted temporarily so adoption does not demand
a risky rewrite. Every baseline or exception must include:

- project id;
- capability;
- accepted value or finding;
- concrete reason;
- owner;
- repository-owned GitHub issue;
- ISO review date.

The project must not regress beyond the accepted baseline. The reporter never
refreshes a value automatically. Expired, malformed, unknown-project, or
orphaned exceptions are invalid and prevent a green result.

An exception is not permission to add more debt. Work that would worsen an
accepted baseline fails until the underlying debt or exception is reviewed.

## Review rubric (“slop” without authorship claims)

Fleet does not use AI-authorship detectors or publish an “AI slop” score.
Meaningful behavior changes are reviewed for these observable properties:

- Does the change duplicate an existing capability or introduce a parallel
  abstraction?
- Does each new layer, wrapper, configuration knob, or dependency earn its
  ongoing cost?
- Are names and module boundaries specific to the product domain?
- Are placeholder behavior, swallowed errors, silent fallbacks, and impossible
  states absent or explicit?
- Do tests cover success, failure, and important boundary behavior rather than
  merely exercising lines?
- Are generated files, fixtures, caches, reports, and vendored sources correctly
  scoped and excluded?
- Do docs, commands, architecture, dependencies, and `PROJECT_STATUS.md` remain
  truthful after the change?

Static checks are necessary but cannot prove cohesion, product fit, or the
absence of speculative abstraction. A review may reject code on those grounds
without claiming how it was authored.

## Scheduled trend evidence

Weekly or explicitly requested full evidence may include:

- maximum, p95, and violation count for cognitive complexity;
- production duplication percentage and movement;
- unused files, exports, types, dependencies, and assets;
- total and changed-code coverage movement;
- dependency freshness, vulnerabilities, browser bundle movement, and direct
  dependency changes;
- dependency cycles and high-coupling modules;
- lint/type/test/coverage suppression movement;
- test duration and demonstrated flakiness;
- source, generated, vendored, fixture, and snapshot composition;
- high-churn/high-complexity hotspots.

Observations retain tool/version provenance, scope, unit, direction, and
observation time. Incompatible units or ecosystems remain separate series.
Fleet never averages them into an opaque score.

## Commands and adoption

The default Fleet inventory is deterministic and read-only. It discovers
coverage but does not execute arbitrary repository commands or claim configured
checks passed. Explicit execution uses repository-native commands through the
cleanup boundary and must not install tools, run write-mode formatters, delete
findings, deploy, migrate, or read credentials.

Adoption order:

1. profile every maintained project;
2. expose missing evidence truthfully;
3. fix small behavior-preserving gaps;
4. baseline measured legacy debt with an issue and review date;
5. enable no-regression enforcement;
6. raise projects toward the new-project targets without weakening the
   standard.

Independent repository changes use repository-owned issues, branches, checks,
and pull requests. A Fleet-wide report does not authorize automatic cleanup or
mass rewrites.
