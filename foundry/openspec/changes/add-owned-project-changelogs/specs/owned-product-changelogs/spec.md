## ADDED Requirements

### Requirement: Maintained public product websites own a changelog route
Every maintained product listed in the SaaS Maker public directory SHALL expose
a same-origin `/changelog` website route. The route MUST be part of the owning
product repository and MUST NOT redirect to GitHub commit history, a Fleet
control surface, or another project's website.

#### Scenario: Visitor opens a maintained product changelog
- **WHEN** a visitor opens `<product-origin>/changelog`
- **THEN** the product website renders its owned changelog without requiring a Fleet runtime

#### Scenario: Product has a private source repository
- **WHEN** a maintained public product's source repository is private
- **THEN** its public website still renders a privacy-safe changelog containing only deliberately published product changes

### Requirement: Changelog entries are editorial product history
Each changelog SHALL present verified shipped milestones newest first. Every
entry MUST contain a date, a concise title, and at least one user-visible change
or outcome. A raw commit stream, generated commit-message dump, open-task list,
or copied private project status file MUST NOT substitute for editorial
changelog content.

#### Scenario: Existing shipped history is available
- **WHEN** a project has verified milestones in `PROJECT_STATUS.md`, releases, or merged repository history
- **THEN** the initial changelog summarizes those milestones without inventing dates, claims, or unreleased work

#### Scenario: Only one public milestone is verified
- **WHEN** a product has only one verified public milestone
- **THEN** the changelog publishes that one honest entry rather than padding the page with inferred history

### Requirement: Changelogs fit their owning websites
Each changelog SHALL reuse the product's existing shell, tokens, typography,
navigation conventions, accessibility behavior, and responsive layout. The
page MUST have a unique document title, one `h1`, semantic dated entries, a
working route at 390, 768, and 1440 CSS pixels, and an internal website link
that makes the changelog discoverable.

#### Scenario: Product already has a site shell
- **WHEN** the changelog is added to a maintained website
- **THEN** it appears as a native product page rather than a SaaS Maker-branded template

#### Scenario: Visitor uses a narrow viewport
- **WHEN** the changelog renders at 390 CSS pixels
- **THEN** all entries and navigation remain readable without horizontal overflow

### Requirement: Future work and source remain repository-native
Each maintained product website SHALL link “Roadmap” to the canonical
repository's GitHub Issues page and “Source” to the canonical GitHub repository
when those links are intentionally public. Changelog content MUST describe
shipped work only and MUST NOT become another operational work queue.

#### Scenario: Visitor follows Roadmap
- **WHEN** a visitor activates a product's Roadmap link
- **THEN** the browser opens the canonical repository's GitHub Issues page

#### Scenario: Visitor follows Source
- **WHEN** a visitor activates a product's Source link
- **THEN** the browser opens the canonical GitHub repository
