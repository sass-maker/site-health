## MODIFIED Requirements

### Requirement: Repository coverage is reconciled
Fleet MUST reconcile bounded active and inactive repository roots against the
internal catalog. Independent product repositories MUST resolve through
immediate Git checkouts or explicit historical source paths and MUST NOT be
satisfied by duplicate product trees embedded under Fleet-owned app roots.

#### Scenario: Active checkout is unregistered
- **WHEN** an immediate Git repository exists under the Fleet root without a matching catalog repository path
- **THEN** check mode fails and names the checkout

#### Scenario: Historical checkout is unregistered
- **WHEN** an immediate Git repository exists under the inactive-history root without a matching catalog source path
- **THEN** check mode fails and names the checkout

#### Scenario: Optional history is absent
- **WHEN** a historical catalog entry has no local checkout on a fresh machine
- **THEN** validation preserves the entry without failing repository coverage

#### Scenario: Independent product uses an embedded path
- **WHEN** Setline or India Standards resolves to a path under `foundry/apps/`
- **THEN** repository coverage fails until the catalog resolves its standalone repository checkout
