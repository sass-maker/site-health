## MODIFIED Requirements

### Requirement: live surface verification
The audit MUST probe every canonical public domain and declared public health
endpoint with a bounded timeout and record status, redirect chain, final URL,
and check time. Credential-free public probes SHALL run from the public
automation repository using its privacy-allowlisted manifest. Provider
inventory, repository scanning, and authenticated Cloudflare evidence MUST
remain in private Fleet execution.

#### Scenario: expected API-root 404
- **WHEN** an endpoint is declared as an intentional API root 404
- **THEN** the report records the 404 as an accepted exception and still probes its health endpoint

#### Scenario: public scheduled probe
- **WHEN** the public repository runs its scheduled resilience audit
- **THEN** it checks only allowlisted public URLs and persists only sanitized public evidence

#### Scenario: provider inventory is requested
- **WHEN** an audit needs Cloudflare account inventory or repository-level deployment evidence
- **THEN** it runs through the private Fleet boundary and is not delegated to public automation
