## ADDED Requirements

### Requirement: Independent products are standalone-operable
An independent product repository MUST own the tracked instructions and native
commands required to install, test, build, and manually deploy that product. It
MUST NOT require a private Fleet checkout, sibling Fleet filesystem path, or
private Fleet documentation for those operations.

#### Scenario: Product is cloned without Fleet
- **WHEN** an operator clones an independent product without Fleet Workspace
- **THEN** the repository's tracked instructions and native commands remain sufficient to install, test, build, and prepare a manual deployment

#### Scenario: Product command references private Fleet source
- **WHEN** a tracked product command resolves `../foundry/ops` or another private Fleet source path
- **THEN** boundary validation fails and identifies the reverse dependency

### Requirement: Fleet orchestration is one-way
Fleet Workspace MAY catalog, monitor, validate, and invoke repo-local commands
for independent products, but independent products MUST NOT call Fleet-owned
private source as part of their native runtime or release contract.

#### Scenario: Fleet validates an independent product
- **WHEN** Fleet runs an independent product check
- **THEN** Fleet changes working directory to the product checkout and invokes a command owned by that product

#### Scenario: Fleet checkout is unavailable
- **WHEN** an independent product runs without Fleet Workspace present
- **THEN** its native product behavior and manual release preparation remain available

### Requirement: Fleet audits available product boundaries read-only
Fleet Workspace SHALL provide a read-only audit that scans available
independent child repositories for tracked reverse dependencies to private
Fleet source. Missing child checkouts SHALL be reported as skipped rather than
treated as product failures.

#### Scenario: Available checkout is independent
- **WHEN** the audit scans an available product whose tracked operational files contain no private Fleet dependency
- **THEN** the audit reports that product as independent without modifying either repository

#### Scenario: Registered checkout is missing
- **WHEN** the audit cannot find a registered independent product checkout
- **THEN** it records the checkout as skipped and continues scanning
