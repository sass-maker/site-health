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

### Requirement: External deletion is explicit and exact

GitHub repository deletion, Cloudflare resource/data deletion, DNS mutation,
and npm publication or unpublication MUST target the named SaaS Maker resources
and MUST NOT be inferred from source deletion alone.

#### Scenario: Local source cleanup completes

- **WHEN** Fleet validation passes
- **THEN** the handoff identifies which external resources were deleted and
  which still exist

