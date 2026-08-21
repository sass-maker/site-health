# Dashboard

Private portfolio dashboard for answering five owner questions:

1. Which projects exist and what state are they in?
2. How strong are their domains?
3. How fast are their public sites?
4. How are they performing in Google Search?
5. Are they visible in AI answers?

This repository contains one product and its backend:

- `foundry/apps/dashboard/web/` — Astro dashboard UI.
- `foundry/apps/dashboard/backend/` — catalog, evidence adapters, API, storage,
  metric runners, and the internal AI Visibility engine.

Drank and PSI Swarm remain independent repositories. The backend reads or
invokes them through explicit adapters. Reusable GitHub Actions remain in the
independent `sass-maker/workflows` repository.

## Commands

```bash
pnpm run build
pnpm run test
pnpm run check
pnpm run backend
```

The current GitHub remote retains the historical `fleet-workspace` name until
the repository itself is renamed or archived. That historical name is not a
second product.
