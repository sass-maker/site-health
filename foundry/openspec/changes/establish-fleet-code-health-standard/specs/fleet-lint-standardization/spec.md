## MODIFIED Requirements

### Requirement: Wider rollout is governed by code-health adoption
Fleet MUST expose lint alignment as one capability in the Fleet Code Health
Standard for every maintained applicable project. Wider adoption MUST preserve
repository ownership, use repository-scoped GitHub issues and pull requests for
independent checkouts, and MUST NOT silently weaken the shared baseline or
erase approved ecosystem-native divergences merely to increase alignment
counts.

#### Scenario: Maintained JavaScript project lacks lint configuration
- **WHEN** code-health inventory finds a maintained applicable JavaScript project with no recognized lint path
- **THEN** lint coverage is unavailable and the owning repository receives bounded follow-up rather than being counted as aligned

#### Scenario: Native project uses an approved equivalent
- **WHEN** a maintained non-JavaScript project uses a documented ecosystem-native lint or compiler boundary
- **THEN** the lint capability reports the approved equivalent and does not require the shared JavaScript preset

#### Scenario: Independent project needs migration
- **WHEN** an independent repository requires more than a small behavior-preserving lint alignment change
- **THEN** Fleet records repository-scoped work and preserves the current configuration until that work is reviewed

