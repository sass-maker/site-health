## MODIFIED Requirements

### Requirement: Complete family mapping
The registry MUST map Significant Hobbies, Reader, Anime List, SWE Interview
Prep, LoopTV, Chess, and Calorie to unique canonical surfaces, repositories,
runtimes, checks, activation definitions, and privacy boundaries.

#### Scenario: Child domain lacks owner
- **WHEN** a family domain cannot be mapped to exactly one project
- **THEN** family automation validation fails

#### Scenario: Calorie evidence is collected
- **WHEN** Fleet evaluates Calorie
- **THEN** it records only build, live, indexing, revision, and sanitized error evidence without food, water, weight, profile, or journal data
