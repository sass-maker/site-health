## ADDED Requirements

### Requirement: Runtime-specific telemetry contract
Every in-scope entry MUST satisfy the minimum telemetry contract for each
runtime it operates, or record a justified accepted exception or
not-applicable result.

#### Scenario: Static landing surface
- **WHEN** a project is only a public static surface
- **THEN** it requires build evidence, a canonical live probe, indexing
  evidence, and only the minimum meaningful acquisition/CTA signal

#### Scenario: Mixed product runtime
- **WHEN** a product has a public surface, API, and scheduled job
- **THEN** the coverage audit evaluates all three runtime contracts separately

### Requirement: Minimum product signals
My Work products SHALL expose acquisition, primary intent, activation,
conversion where applicable, and meaningful return/retention signals. Toolbox
projects SHALL expose only the minimum visit, CTA, or activation evidence needed
to evaluate usability and bounded experiments.

#### Scenario: Toolbox product has no conversion
- **WHEN** a Toolbox product has no signup, purchase, or download flow
- **THEN** conversion may be not-applicable and the audit SHALL NOT require a
  fabricated event

### Requirement: Structured API and Worker evidence
In-scope APIs and Workers MUST expose bounded health evidence plus structured
request/error logs or provider-native equivalents sufficient to identify the
surface, time, outcome, latency class, and correlation identifier without
recording secrets or private payloads.

#### Scenario: Worker request fails
- **WHEN** a Worker returns an unexpected server error
- **THEN** the operational evidence can correlate the failure to a surface and
  time window without exposing request credentials or body content

### Requirement: Background-job lifecycle evidence
Every in-scope scheduled, queued, workflow, or batch path MUST expose start,
success, failure, retry, and freshness evidence plus bounded input/runtime,
concurrency control, idempotency or deduplication, and durable unresolved
failure state.

#### Scenario: Scheduled job stops running
- **WHEN** no successful completion occurs within the declared freshness window
- **THEN** the job is reported stale even if its public homepage remains healthy

#### Scenario: Retry could duplicate work
- **WHEN** a retrying job has no stable idempotency or deduplication evidence
- **THEN** the coverage audit reports a blocking data-integrity risk

### Requirement: Desktop and mobile evidence
In-scope desktop and mobile apps MUST expose build/release evidence and a
privacy-safe crash or failure signal; activation telemetry is required only
when it materially informs My Work or a declared Toolbox experiment.

#### Scenario: Local-first application
- **WHEN** an app processes private data only on device
- **THEN** telemetry MUST avoid transmitting private content and may use
  aggregate build, crash, and opt-in activation evidence

### Requirement: Data durability evidence
Any in-scope runtime owning non-reconstructable user or operational state MUST
record its storage owner, backup or export path, migration guard, and restore
verification status.

#### Scenario: Reconstructable cache
- **WHEN** stored data can be rebuilt from an authoritative upstream source
- **THEN** backup may be not-applicable if the reconstruction path and cost are
  documented

### Requirement: Sanitized evidence handling
Telemetry adapters MUST NOT persist secrets, authorization headers, private
user content, email bodies, prompts, unpublished marketing content, or raw
credential-bearing logs in fleet reports or dashboard snapshots.

#### Scenario: Source log contains a token-like value
- **WHEN** evidence collection encounters credential-shaped output
- **THEN** the adapter redacts or omits it before writing any durable report
