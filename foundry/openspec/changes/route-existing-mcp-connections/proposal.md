## Why

Fleet's first ChatGPT connection implementation assumed that every application
would run through a local Secure MCP Tunnel. The confirmed operating model is
different: keep genuinely local data in Codex, expose already-cloud-backed
personal data to ChatGPT web through owner-authenticated Cloudflare MCP
transport, and expose already-public cloud data to ChatGPT web through bounded
public Cloudflare MCP transport.

This change activates only data boundaries that already exist. It avoids making
an always-on Mac a dependency for cloud applications and avoids inventing cloud
sync for device-only products.

## What Changes

- Connect CodeVetter's existing repository-scoped, read-only STDIO MCP directly
  to Codex on the local host. Preserve CodeVetter's explicit per-repository
  indexing, enablement, revocation, and query-only SQLite boundary.
- Keep Anime List's existing app-owned Streamable HTTP MCP as the upstream
  implementation while placing an owner-only OAuth gateway in front of it for
  ChatGPT web.
- Add a Cloudflare-hosted Streamable HTTP transport for the already-tested
  Reader, Calorie, Setline, Starboard, High Signal, Significant Hobbies public,
  and Research Papers public-export adapters.
- Authenticate private hosted ChatGPT connections with MCP OAuth 2.1 backed by
  WorkOS AuthKit. ChatGPT receives only scoped OAuth tokens; the gateway
  validates the approved WorkOS owner and uses product-specific read
  credentials from Cloudflare's secret boundary when calling existing
  application APIs.
- Keep public tools anonymous, bounded, cache-compatible, and restricted to
  their existing published APIs or approved static exports.
- Preserve one independently enableable connection and tool catalog per
  product even if multiple products share a deployment runtime.
- Replace blanket tunnel activation with direct local or direct HTTPS MCP
  connections. Secure MCP Tunnel remains an optional later transport for local
  data that must become available away from its host.
- Defer Indulge and every other device-only product without an existing cloud
  data boundary. Also defer Significant Hobbies private records, Research
  Papers full local-corpus hosting, new sync systems, general multi-user account
  linking, mutations, and public ChatGPT directory submission.

## Capabilities

### New Capabilities

- `mcp-connection-routing`: Routes existing read-only MCP/data surfaces through
  Codex-local STDIO, ChatGPT OAuth-protected Cloudflare HTTPS, or anonymous
  ChatGPT Cloudflare HTTPS based on the source's trust and storage boundary.

### Modified Capabilities

None.

## Impact

- Fleet Workspace owns the shared hosted transport, connection registry,
  deployment/runbook evidence, and cross-product tests.
- CodeVetter source should not require a feature change; its installed
  `codevetter-mcp` sidecar and in-app repository consent remain authoritative.
- Anime List retains its native `/api/mcp` implementation and PAT model behind
  the owner-only OAuth gateway; ChatGPT never receives that PAT.
- Reader, Calorie, Setline, Starboard, High Signal, Significant Hobbies, and
  Research Papers retain their existing application APIs and privacy
  projections. Product changes are allowed only when a proven protocol or
  deployment requirement cannot be satisfied by the shared transport.
- WorkOS AuthKit configuration, owner identity, per-route resource indicators,
  product read-token secrets, ChatGPT developer-mode app metadata, and the
  shared Cloudflare MCP runtime are affected. AuthKit must remain on its free
  hosted-domain tier: no custom domain, enterprise SSO, Directory Sync, or
  another paid add-on may be enabled. Any new production dependency or
  secret/config change remains subject to Fleet's dependency and deployment
  gates.
- The completed `expose-fleet-apps-to-chatgpt` change remains historical
  implementation evidence; this change supersedes only its pending external
  tunnel activation plan.
