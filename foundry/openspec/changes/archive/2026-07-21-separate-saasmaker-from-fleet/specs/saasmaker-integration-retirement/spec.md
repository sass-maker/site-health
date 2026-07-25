## ADDED Requirements

### Requirement: Product runtimes use SaaS Maker only for feedback
A fleet product MAY use `@saas-maker/feedback` and the feedback API. Product
runtimes MUST NOT depend on SaaS Maker for analytics, tasks, jobs, workflows,
marketing queues, testimonials, waitlists, changelog widgets, AI, observability,
App Health, or generic SDK/CLI behavior.

#### Scenario: Product has SaaS Maker integration
- **WHEN** tracked runtime source references SaaS Maker after migration
- **THEN** every reference is required for feedback submission or feedback presentation

### Requirement: Canonical owners replace SaaS Maker wrappers
Analytics SHALL report directly to the selected analytics provider; marketing
scheduling SHALL be owned by Fleet/Postiz/Reel Pipeline; code and task workflows
SHALL remain in CodeVetter or repository-native tools; performance and health
SHALL remain in App Health and provider-native systems.

#### Scenario: Chess records analytics
- **WHEN** Chess records a product event
- **THEN** it uses its direct analytics integration without a SaaS Maker SDK or PostHog wrapper

#### Scenario: Marketing content is scheduled
- **WHEN** an approved marketing asset is scheduled or published
- **THEN** Fleet's marketing pipeline and Postiz/Reel Pipeline own the action without a SaaS Maker marketing queue

### Requirement: Retired integrations fail closed during migration
Removing a non-feedback SaaS Maker integration MUST NOT break the product's
primary user flow. Optional retired widgets SHALL disappear cleanly, and
operational callers SHALL be migrated before the corresponding API is removed.

#### Scenario: SaaS Maker is unavailable
- **WHEN** the SaaS Maker API is unavailable
- **THEN** a product's primary flow remains usable and only optional feedback is unavailable

### Requirement: Registration metadata does not imply runtime coupling
Fleet SHALL keep canonical project identity centrally. Product repositories
MUST NOT retain stale SaaS Maker task/control-plane linkage solely because a
legacy `foundry.json`, old slug, public key, or CSP allowance exists.

#### Scenario: Repository has legacy registration only
- **WHEN** a repository has no maintained feedback integration but retains only legacy SaaS Maker metadata or allowlists
- **THEN** that stale metadata is removed or replaced by canonical Fleet-owned identity
