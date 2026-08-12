## Why

Fleet's first hosted MCP release covers seven products, but the maintained
non-iOS portfolio contains additional public products whose bounded structured
data is already live. ChatGPT should be able to query those existing contracts
without creating new product APIs, copying their datasets, or turning static,
private, device-only, or mutation-oriented surfaces into misleading apps.

## What Changes

- Add independently enableable, public, read-only MCP connections for
  PostTrainLLM, SWE Interview Prep, What It Takes to Win, SaaS Maker, Drank,
  and LoopTV.
- Read each product live from its existing public JSON contract through fixed
  allowlisted HTTPS operations on the centralized Cloudflare gateway.
- Preserve product-specific identities, tool catalogs, branded hostnames,
  listing metadata, icons, mutation absence, response bounds, and hostname
  isolation.
- Record a complete maintained non-iOS eligibility inventory so every other
  product has an evidence-backed inclusion or deferral reason.
- Keep Setline's already-prepared private route separate and deferred until its
  real account boundary is usable; do not replace that requirement with an
  owner fallback.
- Do not deploy, publish, create new product storage, add private-data
  projections, or modify the six source products in this change.

## Capabilities

### New Capabilities

- `non-ios-public-mcp-connections`: Defines eligibility, fixed-source tools,
  isolation, parity, and retained evidence for additional public non-iOS MCP
  connections.

### Modified Capabilities

None.

## Impact

- Extends `foundry/helpers/chatgpt-connections/` app definitions, hosted route
  registry, monitoring/evaluation fixtures, operator documentation, and OpenAI
  listing packages.
- Reads existing public contracts at `posttrainllm.com`,
  `learn.significanthobbies.com`, `paths.significanthobbies.com`, and
  `sassmaker.com`, plus Drank's fixed public Domain Rating route and LoopTV's
  catalog summary; those products require no source, deployment, credential,
  or data-model change.
- Adds no production dependency and no secret. Deployment and ChatGPT portal
  activation remain separate explicit operations.
- Tracked by Fleet Workspace issue #333.
