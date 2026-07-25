## ADDED Requirements

### Requirement: SaaS Maker ceases to be a standalone product

Fleet and the standalone repository MUST stop presenting SaaS Maker as a public
directory, spotlight product, package catalogue, or marketing target.

#### Scenario: Fleet product metadata is generated

- **WHEN** Fleet validates its registry and public product metadata
- **THEN** SaaS Maker is absent as a product and Feedback is represented only as
  shared private infrastructure where operationally necessary

### Requirement: Static public surfaces are retired

The `saas-maker-home` and `saas-maker-packages` Pages projects SHALL become
retirement targets after their source, links, and required redirects are
removed or replaced.

#### Scenario: Retirement readiness is evaluated

- **WHEN** the package README is complete and no maintained Fleet surface
  requires either Pages origin
- **THEN** both Pages projects are reported safe for explicit deletion

### Requirement: Active feedback remains available during retirement

The source cleanup MUST NOT interrupt the existing API, inbox, project keys,
screenshots, authentication, or stored feedback.

#### Scenario: Static sites are removed from source

- **WHEN** the directory and documentation applications are deleted from the
  standalone repository
- **THEN** the existing API and inbox production smoke checks continue to pass

### Requirement: Irreversible actions have explicit gates

Cloudflare deletion, DNS mutation, npm publication or deprecation, data
deletion, and repository archival MUST occur only after source migration,
validation, and deployment parity, with explicit authorization for the named
action.

#### Scenario: Source migration completes

- **WHEN** local Fleet and feedback checks pass
- **THEN** no production resource is automatically deleted, renamed, deployed,
  or archived

### Requirement: Shared sassmaker.com zone consumers are preserved

Retirement MUST distinguish the SaaS Maker product from other Fleet products
that use subdomains under the `sassmaker.com` DNS zone.

#### Scenario: Product references are removed

- **WHEN** Fleet configuration is cleaned of SaaS Maker product identity
- **THEN** unrelated subdomains such as existing Fleet tools remain unchanged

### Requirement: Standalone repository has a rollback phase

The public SaaS Maker repository MUST remain available as a rollback source
until the migrated Workers are deployed from Fleet and production smoke checks
pass.

#### Scenario: Fleet deployment fails parity

- **WHEN** a migrated Worker fails its production verification
- **THEN** maintainers can redeploy the last known-good standalone revision
  without reconstructing deleted source
