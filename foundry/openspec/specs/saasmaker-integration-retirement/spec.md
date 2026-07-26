# SaaS Maker Integration Retirement

## Purpose

Eliminate cross-project SaaS Maker runtime coupling while preserving the
backend-free feedback component as an optional Fleet-owned package.

## Requirements

### Requirement: Product runtimes do not depend on SaaS Maker
A fleet product MAY use the Fleet-owned `@saas-maker/feedback` package only
with a consumer-owned `onSubmit` callback. Product runtimes MUST NOT depend on
a SaaS Maker API, project key, authentication service, media store, analytics,
tasks, jobs, workflows, marketing queue, testimonials, waitlists, changelog
widgets, AI, observability, App Health, or generic SDK/CLI behavior.

#### Scenario: Product has SaaS Maker integration
- **WHEN** tracked runtime source references SaaS Maker after migration
- **THEN** every runtime reference is a package import whose submission
  destination is owned by the consuming product

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

### Requirement: Retired integrations fail closed
Removing a SaaS Maker integration MUST NOT break the product's primary user
flow. Optional retired widgets SHALL disappear cleanly, and any retained
feedback widget SHALL delegate submission to its consumer.

#### Scenario: SaaS Maker is unavailable
- **WHEN** the SaaS Maker API is unavailable
- **THEN** a product's primary flow remains usable because no maintained
  runtime calls that API

### Requirement: Registration metadata does not imply runtime coupling
Fleet SHALL keep canonical project identity centrally. Product repositories
MUST NOT retain stale SaaS Maker task/control-plane linkage solely because a
legacy `foundry.json`, old slug, public key, or CSP allowance exists.

#### Scenario: Repository has legacy registration only
- **WHEN** a repository has no maintained feedback integration but retains only legacy SaaS Maker metadata or allowlists
- **THEN** that stale metadata is removed or replaced by canonical Fleet-owned identity
