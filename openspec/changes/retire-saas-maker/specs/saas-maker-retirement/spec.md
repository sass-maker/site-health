## ADDED Requirements

### Requirement: SaaS Maker ceases to exist as a maintained repository

SaaS Maker MUST NOT remain the source owner for a product, package, site, API,
inbox, or Fleet service after the package is secured in Fleet.

#### Scenario: Source ownership is inspected

- **WHEN** maintainers search active Fleet metadata and source
- **THEN** only the backend-free package remains and its owner is Fleet

### Requirement: Hosted feedback is retired without replacement

The API, inbox, project keys, auth, D1, R2 upload path, and their deployment
configuration SHALL have no retained source implementation.

#### Scenario: Package source is built

- **WHEN** the package is typechecked and packed
- **THEN** it contains no hosted feedback URL, Worker configuration, database
  binding, authentication code, or upload implementation

### Requirement: Shared sassmaker.com consumers are preserved

Cleanup MUST distinguish SaaS Maker resources from unrelated products using
other subdomains in the `sassmaker.com` DNS zone.

#### Scenario: Active Fleet configuration is cleaned

- **WHEN** SaaS Maker and feedback-service entries are removed
- **THEN** unrelated Fleet product subdomains remain unchanged

### Requirement: Fleet owns the public directory projection

Fleet MUST generate the public `sassmaker.com` directory from canonical Fleet
project metadata, and that output MUST remain static and non-operational.

#### Scenario: Public directory is deployed

- **WHEN** `sassmaker.com` is built and published
- **THEN** it exposes public project links, changelog entries, and public
  roadmap information without tasks, controls, observability, authentication,
  or private project state

### Requirement: Operational Fleet remains machine-hosted

The operational Fleet Console MUST remain at `fleet.sassmaker.com` through the
existing Cloudflare Tunnel and MUST NOT be required for the public directory to
serve.

#### Scenario: Designated host is unavailable

- **WHEN** the local Fleet host or Tunnel replica is offline
- **THEN** `fleet.sassmaker.com` may be unavailable but `sassmaker.com`
  continues serving its last successfully deployed static projection

### Requirement: External deletion is explicit and exact

GitHub repository deletion, Cloudflare resource/data deletion, DNS mutation,
and npm publication or unpublication MUST target the named SaaS Maker resources
and MUST NOT be inferred from source deletion alone.

#### Scenario: Local source cleanup completes

- **WHEN** Fleet validation passes
- **THEN** the handoff identifies which external resources were deleted and
  which still exist
