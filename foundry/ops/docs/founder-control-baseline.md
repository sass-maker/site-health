# Founder Control Loop baseline

Captured on 2026-07-25 before implementation at 1,440 × 1,000 and 390 × 844:

- [Desktop baseline](assets/founder-control/baseline-desktop.png)
- [Mobile baseline](assets/founder-control/baseline-mobile.png)

## MissionControl parity

| Journey | Baseline |
| --- | --- |
| Concise mission intake | Missing |
| Current work and accountable actors | Partial; cron counts and repository activity are not mission state |
| Owner request and response | Missing |
| Mission timeline and deliverables | Missing |
| Scheduled work and recent runs | Partial; configuration is visible without mission context |
| Concise daily summary | Missing |

## Data-source classification

| Current source | Classification | Owner |
| --- | --- | --- |
| `projects.json`, `automation-registry.json` | Canonical Fleet identity and attention policy | Foundry |
| Git repositories and GitHub links | Provider evidence pointers | GitHub/project repository |
| Cloudflare project/domain state | Provider evidence pointers | Cloudflare |
| Postiz draft/publication state | Provider evidence pointers | Postiz |
| Drank domain rating | Provider evidence pointer and safe aggregate | Drank |
| PSI Swarm performance runs | Provider evidence pointer and safe aggregate | PSI Swarm |
| CodeVetter review verdicts | Provider evidence pointers | CodeVetter |
| App Health findings | Provider evidence pointers and safe aggregates | App Health |
| Local Wi-Fi samples and machine heartbeat | Local private operational state | Fleet host |
| Page-specific summary counts and hosting groupings | Removable UI-only projection | Ops Console |

The baseline leads with hosting, domains, schedules, and machine telemetry. The
replacement keeps those providers authoritative but moves them behind missions,
decisions, projects, marketing outcomes, and progressive evidence links.
