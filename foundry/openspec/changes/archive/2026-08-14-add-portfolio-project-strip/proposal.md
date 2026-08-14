# Proposal: Add a portfolio project strip

## Why

Fleet products currently end independently. A small shared footer strip can
help visitors discover the author's other work while making the portfolio feel
connected. The interaction should be quiet, fast, and useful rather than a
heavy portfolio directory.

## What Changes

Create a backend-free React package, `@saas-maker/portfolio-project-strip`, that
renders a polished, continuously moving list of current public projects. It
uses `foundry/ops/config/projects.json` as the single source of truth and
ships with a generated Fleet catalog for instant first paint, then revalidates
from the cached `https://sassmaker.com/projects.json` edge endpoint for fresh
project data. Consumers can override or disable that URL.

The component excludes the current project, supports custom project data and
labels, pauses for hover/focus, and respects reduced-motion preferences.

`foundry/ops/config/projects.json` is the one canonical record for internal and
external project truth. The public endpoint is a generated safe projection of
that record; private repository, deployment, auth, and operational fields never
leave Fleet Workspace.

Out of scope: a dynamic database API, analytics, project health checks,
logos/assets, automatic publishing, and changing individual product footers in
this pass.

## Success criteria

- A consumer can install the package and render the strip with one component.
- The bundled catalog renders without a network request.
- Optional revalidation uses one cacheable GET, a short timeout, and retains
  the bundled/prop fallback on failure.
- Links are semantic, keyboard reachable, and crawlable.
- The animation is paused for interaction and disabled for reduced motion.
