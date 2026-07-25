## Context

The personal website is the precise portfolio front door; RolePatch and Karte
are independent public utilities with private or identity-sensitive user flows.
All three should remain usable and quietly marketed, but none should acquire an
active autonomous roadmap.

## Goals / Non-Goals

**Goals:** canonical identity/link integrity, build/live/indexing, one meaningful
activation per product, privacy-safe errors, expiring experiments and Foundry
status.

**Non-Goals:** redesign, growth team, paid acquisition, private payload capture,
automatic portfolio promotion or production deployment.

## Decisions

- Keep each repository/runtime independent; share only Foundry evidence and
  marketing contracts.
- Treat the personal homepage's four-product list plus SaaS Maker link as a
  tested content contract.
- RolePatch activation is a successful privacy-safe tailoring flow; Karte
  activation is a published/used public profile or trust-card flow. Raw resume,
  job, private contact and chat content never enters fleet reports.
- Use canonical/UTM attribution, explicit expiry and review-controlled assets
  for quiet experiments.
- Digest routine failures; alert only security/data risk or prolonged outage.

## Risks / Trade-offs

- **Marketing drifts from portfolio policy** → Test canonical four-product
  presentation and links.
- **Activation leaks private data** → Record aggregate outcome only.
- **Quiet marketing becomes a backlog** → Require automatic expiry and no
  replacement campaign.
