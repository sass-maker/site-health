## Context

Foundry currently uses folders as an implicit product taxonomy:
`packages/ai-visibility`, `packages/feedback`, `apps/internal/{drank,psi-swarm}`,
`apps/public/{mobile-cockpit,public-directory}`, and
`apps/dashboard/fleet-console`. That taxonomy no longer matches the product
model. Drank, PSI Swarm, and AI Visibility are small helper products; Feedback
is the reusable public package; and Mobile Cockpit is an undecided mobile
Fleet Console client.

PSI Swarm exposes both a product runtime and a skill, but its
`foundry/ops/skills/psi-swarm/SKILL.md` entry is already a symlink to the
runtime-owned `SKILL.md`. This is an adapter relationship, not duplicated
implementation. Feedback currently requires `onSubmit` and deliberately owns no
backend.

The workspace has independent native package managers and deploy identities.
The migration must preserve those boundaries, avoid releases or deployments,
and update every tracked path consumer atomically.

## Goals / Non-Goals

**Goals:**

- Make the folder structure express the owner-facing product model.
- Keep helper implementations and Fleet skills structurally separate.
- Preserve one canonical implementation when a helper exposes a skill
  entrypoint.
- Place Mobile Cockpit beside Fleet Console without deciding whether it will
  ship.
- Let any product consume Feedback through either a callback or a compatible
  caller-owned HTTP endpoint.
- Preserve Feedback's backend-free, public, credential-free package boundary.

**Non-Goals:**

- Redesigning Fleet Console or Mobile Cockpit.
- Deciding Mobile Cockpit's product future.
- Combining helper runtimes, package managers, databases, or deploys.
- Adding a Fleet feedback service, inbox, default endpoint, auth scheme,
  project key, storage layer, or analytics.
- Publishing a new Feedback release or deploying any moved component.

## Decisions

### 1. Use explicit canonical roots

The canonical layout becomes:

```text
foundry/
  helpers/
    ai-visibility/
    drank/
    psi-swarm/
  ops/skills/
  apps/public/public-directory/
  apps/dashboard/
    fleet-console/
    mobile-cockpit/
  marketing/
  packages/feedback/
```

Moving the source, rather than only relabeling documentation, prevents folder
names from continuing to teach the wrong model. AI Visibility may retain its
typed package boundary for internal consumption, but it is classified and
operated as a helper rather than a public package.

Alternative considered: keep the current paths and change only README labels.
This has lower migration cost but preserves the ambiguity the change is meant to
remove.

### 2. Helpers own runtime behavior; skills only adapt invocation

A helper may own a `SKILL.md` beside its implementation when correct use depends
on helper-specific commands and constraints. The corresponding
`foundry/ops/skills/<name>` entry must be a link or thin adapter to that
canonical file and must not contain a copy of the runtime, scoring logic, data
model, or UI.

PSI Swarm keeps this pattern after its path changes. Drank and AI Visibility do
not gain skills unless a distinct agent invocation workflow is later needed.

Alternative considered: move PSI Swarm's `SKILL.md` entirely into `ops/skills`.
That would separate files more rigidly, but it would split the helper's
versioned usage contract from the commands and constraints it describes.

### 3. Treat Mobile Cockpit as an experimental dashboard client

Mobile Cockpit moves to `foundry/apps/dashboard/mobile-cockpit`. Registry and
documentation copy must label it local-only and experimental, not public,
shipped, or part of the committed Fleet Console roadmap. No runtime integration
is introduced by the move.

Alternative considered: place it under `apps/internal`. That removes the public
claim but loses the important fact that it is a client of the Fleet Console
domain.

### 4. Feedback accepts exactly one submission destination

`FeedbackWidgetProps` becomes a discriminated union over the existing common
presentation props:

- callback mode requires `onSubmit` and forbids `ingestionUrl`;
- URL mode requires `ingestionUrl` and forbids `onSubmit`.

Existing callback consumers remain source-compatible. The runtime also rejects
missing or conflicting destinations so untyped JavaScript use cannot silently
drop or duplicate feedback.

Alternative considered: allow both and give one precedence. That makes
misconfiguration look successful and risks surprising duplicate or skipped
submissions.

### 5. Use one predictable multipart HTTP contract

URL mode resolves a relative or absolute HTTP(S) URL and sends one `POST` with
`credentials: "omit"` and a `FormData` body:

- `feedback`: the JSON-serialized `FeedbackSubmission` without `screenshot`;
- `screenshot`: the original file when present.

The browser supplies the multipart content type and boundary. The package sends
no authorization or project headers, performs no retries, and treats only
2xx responses as success. A non-2xx response or network failure uses the
widget's existing error state. Cross-origin endpoints remain responsible for
CORS.

Alternative considered: JSON when no screenshot and multipart when present.
That makes endpoint implementations support two body contracts. Encoding the
file into JSON adds avoidable size and memory overhead.

### 6. Migrate paths as one checked change

Use version-control-aware moves, then update active code, package metadata,
registries, tests, scripts, docs, and symlink targets. Archived OpenSpec
artifacts and immutable historical evidence remain unchanged unless an active
check incorrectly treats them as live paths. A final narrow search must
distinguish intentional historical references from stale active references.

## Risks / Trade-offs

- [Path migration breaks scripts or deploy helpers] → enumerate active
  references first, update them atomically, and run component-root, registry,
  Fleet Console, and native component checks.
- [Moving AI Visibility obscures its reusable library contract] → preserve its
  package name, typed exports, and pack-consumer test while documenting that it
  is a helper library, not the shared public package surface.
- [Direct browser ingestion cannot safely hold secrets] → send no credentials
  or configurable secret headers; consumers needing authenticated or transformed
  submission keep using `onSubmit`.
- [Arbitrary endpoints expect different payloads] → document that
  `ingestionUrl` works with endpoints implementing the stable multipart
  contract; `onSubmit` remains the escape hatch for other APIs.
- [Multipart parsing adds endpoint work for screenshot-free consumers] →
  prefer one stable transport over format branching and provide a complete
  contract example.
- [Mobile Cockpit placement implies commitment] → label the surface
  experimental/local-only and explicitly leave its future undecided.

## Migration Plan

1. Add and validate the new/modified capability specs.
2. Move helper and Mobile Cockpit roots with history-preserving moves.
3. Update active path consumers, symlinks, registry entries, generated views,
   native documentation, checks, and package metadata.
4. Add Feedback URL submission behind the exclusive destination prop union,
   then add transport and compatibility tests without new dependencies.
5. Run the smallest native checks first, followed by active-path and generated
   catalog checks.
6. Do not publish, deploy, or release. If validation cannot be restored, revert
   only these path moves and API edits while preserving unrelated work.

## Open Questions

- Owner confirmation is required that the physical `foundry/helpers/` move is
  preferred over a documentation-only category.
- Owner confirmation is required that one multipart contract is preferable to
  JSON-only ingestion with screenshots supported only through `onSubmit`.
