## Context

Fleet has three partial dependency controls: the root agent policy requires
approval for production dependencies, Knip is being adopted to find unused
JS/TS dependencies after they exist, and external services such as
Bundlephobia can estimate isolated frontend bundle cost. None provides a
single pre-install workflow or a deterministic report of manifest and lockfile
changes across local Fleet repositories.

The workspace contains independent repositories and a Foundry monorepo, uses
multiple package ecosystems, and preserves unrelated dirty work. The guard must
therefore be read-only, work without installing a package, and avoid pretending
that every manifest format can be parsed safely by one Node script.

## Goals / Non-Goals

**Goals:**

- Trigger a necessity review before any dependency mutation.
- Detect changed dependency manifests and lockfiles in one repository or the
  active local Fleet.
- Produce exact added, removed, and version-changed direct dependency records
  for `package.json`.
- Flag other recognized ecosystems for manual review rather than silently
  ignoring them.
- Query exact npm versions from Bundlephobia when browser bundle evidence is
  relevant, while failing open when the remote service is unavailable.
- Reuse Knip for post-change unused dependency detection.

**Non-Goals:**

- Install, remove, upgrade, approve, or rewrite dependencies.
- Parse every ecosystem's dependency grammar in the first version.
- Treat Bundlephobia as security, maintenance, necessity, install-size, or
  actual application-bundle authority.
- Add a global hook, mutate independent repository CI, or establish an
  arbitrary fleet-wide kilobyte threshold.
- Audit every already-installed transitive dependency.

## Decisions

### Expose a standalone skill

`guard-dependencies` will be a standalone Fleet skill because dependency work
can begin inside any child repository without first triggering a fleet-wide
operations request. It will be added to the existing exposed-skill list and
linked through `agent-stack.sh install-skills`.

Routing it only through `fleet-ops` was rejected because that parent is not
guaranteed to load during ordinary project implementation.

### Separate procedural judgment from deterministic detection

The skill will own the necessity rubric: search existing capabilities first,
classify runtime scope, obtain approval, use ecosystem-appropriate evidence,
and run the smallest post-change check. A standard-library Node CLI will own
git comparison, manifest detection, npm delta parsing, Fleet repository
discovery, output formatting, and exit status.

A prose-only skill was rejected because it cannot reliably detect lockfile-only
or version-only changes. A third-party CLI was rejected because the guard must
not add a package to police package growth.

### Compare git snapshots without touching the worktree

Repository checks will default to `HEAD` versus the current worktree and may
accept explicit `--base` and `--head` revisions for CI or review use. The CLI
will read base content with `git show`, head content from either `git show` or
the filesystem, and include untracked recognized manifests. It will never
checkout, stage, install, or rewrite a file.

The optional `--strict` flag will return a non-zero status whenever a direct npm
dependency, opaque manifest, or lockfile changed, or comparison failed.
Parseable `package.json` script and metadata-only changes remain clean. Default
mode will report findings and exit zero so audits and agent review can continue.

### Parse npm precisely and flag other ecosystems conservatively

For `package.json`, compare `dependencies`, `devDependencies`,
`peerDependencies`, and `optionalDependencies` as sorted maps. Report added,
removed, and changed direct entries with scope and versions. Recognize common
Node, Python, Rust, Go, Ruby, CocoaPods, and Swift manifests and lockfiles; for
non-JSON formats, report the changed path and require ecosystem-native review.

Heuristic TOML or source-code parsing was rejected because false negatives
would undermine the guard. Later versions can add a standard-library parser
only when tests cover the ecosystem's real manifest shapes.

### Discover Fleet repositories from the canonical registry

Fleet mode will read `foundry/ops/config/projects.json`, include `focus`,
`active`, and `secondary` entries, resolve `repo` or `sourcePath`, and dedupe
paths by actual git top level. The Foundry repository will be included
explicitly. Missing or non-git registry paths will be reported as skipped, not
fatal.

Filesystem-wide recursion was rejected because it would include parked,
out-of-fleet, generated, and historical checkouts.

### Keep Bundlephobia optional and advisory

`lookup <exact-package-specifier>` will call Bundlephobia with a short timeout
and emit package/version, minified bytes, gzip bytes, dependency count,
ES-module signals, side-effects signal, description, and repository. The skill
will invoke it only for browser-shipped npm candidates and will still require
actual project bundle evidence when size is consequential.

The remote request will not be part of `check`, `fleet`, or strict exit status.
Installing a Bundlephobia wrapper and making its availability a gate were
rejected.

## Risks / Trade-offs

- **A changed opaque manifest does not identify the exact dependency** →
  Require manual ecosystem-native review and never report it as clean.
- **Lockfiles contain harmless metadata churn** → Report lockfile-only changes
  distinctly; let the reviewer correlate them with the manifest and package
  manager.
- **Bundlephobia may fail or differ from the real app bundle** → Keep lookup
  optional, time-bounded, and advisory; prefer the app's build output.
- **Registry entries can share one git repository** → Resolve and deduplicate
  actual git top levels.
- **A skill is not an unbypassable CI policy** → Provide `--strict` and
  base/head support so repositories can adopt it as a required check without
  redesigning the tool.
- **Dirty working trees contain unrelated work** → Read only recognized files,
  never modify them, and report repository-relative paths.

## Migration Plan

1. Add and validate the OpenSpec artifacts.
2. Initialize the skill with UI metadata.
3. Implement the CLI and focused fixture-based tests.
4. Add standalone exposure and compact documentation/policy references.
5. Run skill validation, tests, catalog doctor, OpenSpec validation, and the
   Fleet read-only scan.
6. Run `agent-stack.sh install-skills` to refresh local links.

Removal consists of deleting the skill, script, test, exposure entry, and
documentation references. No package, data, deployment, or production
migration is involved.

## Open Questions

None for the first version. Per-repository required CI adoption and precise
parsers for non-npm ecosystems should follow only after the read-only guard is
proven on real Fleet changes.
