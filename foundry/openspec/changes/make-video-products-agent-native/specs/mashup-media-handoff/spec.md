## ADDED Requirements

### Requirement: Mashup receipts link to agent operations
Each agent-produced Mashup media receipt SHALL include the originating operation
identity, operation schema version, normalized request identity, and terminal
result state in addition to existing artifact and provenance evidence.

#### Scenario: Consumer traces an agent-produced artifact
- **WHEN** a consumer validates a Mashup receipt created through the agent interface
- **THEN** it can link the artifact to the exact successful operation and normalized request without reading Mashup's internal database

#### Scenario: Operation and receipt disagree
- **WHEN** a receipt references a non-successful operation or mismatched request identity
- **THEN** validation rejects the handoff with a stable operation-linkage error
