# @dashboard/ai-visibility

Private calculation package for Dashboard AI Awareness. It expands bounded
prompt sets, evaluates model answers, and aggregates mention, recommendation,
rank, citation, competitor-share, coverage, and cost signals.

The package is deterministic and provider-agnostic. It does not read
credentials, contact model providers, schedule runs, persist raw responses, or
publish results. The Dashboard backend owns project identity, execution limits,
evidence storage, and privacy boundaries.

```ts
import { aggregateVisibility, analyzeResponse } from '@dashboard/ai-visibility';
```

Run its checks from this directory with `pnpm test` and `pnpm pack --dry-run`.
