## Why

The released portfolio strip adds a visible author label and motion control that
make a footer utility feel heavier than the project links it exists to expose.
Outbound links also lose the identity of the project that referred the visitor,
which prevents simple source attribution.

## What Changes

- Remove the visible author label and Pause/Resume control from both the React
  package and universal loader while retaining an accessible region name.
- Preserve automatic pause on hover and keyboard focus and the static
  `prefers-reduced-motion` presentation.
- Simplify the strip to one compact, host-inheriting rail of project links and
  separators.
- Append `ref=<current-project-id>` to outbound links at render time without
  mutating canonical catalog URLs or overwriting unrelated query parameters.
- Revalidate the maintained-public projection against the canonical Fleet
  catalog and regenerate the universal loader plus strict-CSP consumer copies.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `portfolio-project-strip`: Simplifies the visible surface and requires
  source-project attribution on outbound links when the current project is
  known.

## Impact

The change affects `@saas-maker/portfolio-project-strip`, the generated SaaS
Maker universal loader and public catalog assets, the package documentation and
tests, and the generated local loader copies used by strict-CSP consumers.
There are no new dependencies, analytics clients, storage, credentials,
database changes, or canonical URL changes.
