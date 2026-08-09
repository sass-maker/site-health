## ADDED Requirements

### Requirement: Focused helpers own their domain runtimes
Foundry SHALL place focused supporting products under the helpers boundary when they own a complete operator workflow but are neither shared packages nor primary operator-facing buckets. Mashup SHALL be classified as a helper that owns podcast/archive editorial intelligence and rendering.

#### Scenario: Inspect Mashup ownership
- **WHEN** an operator inspects the Foundry product map
- **THEN** Mashup is identified under helpers with its own entrypoint, status, dependencies, and outputs rather than as part of Reel Pipeline

#### Scenario: A Marketing product consumes helper output
- **WHEN** Reel Pipeline consumes an artifact produced by Mashup
- **THEN** the documented connection identifies Mashup as provider, Reel Pipeline as consumer, and the versioned receipt as transport

