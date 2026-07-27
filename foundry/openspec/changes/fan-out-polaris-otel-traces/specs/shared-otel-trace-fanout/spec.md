## ADDED Requirements

### Requirement: Polaris emits one vendor-neutral trace stream
Polaris SHALL emit privacy-bounded HTTP server spans through OTLP to one
configured OpenTelemetry Collector and SHALL NOT contain GCP or App Health
exporter credentials.

#### Scenario: A matched Polaris route completes
- **WHEN** Polaris handles a request whose Echo route template is known
- **THEN** it emits one server span containing the HTTP method, normalized route template, status code, duration, service name, and deployment environment
- **AND** it does not attach request or response bodies, headers, cookies, query values, identities, or concrete route parameter values

#### Scenario: The Collector is unavailable
- **WHEN** Polaris cannot export a span to the configured Collector
- **THEN** request handling remains unaffected and export work stays bounded

### Requirement: One Collector pipeline fans out the same spans
The Collector SHALL process the Polaris trace stream once and SHALL export the
resulting spans to Google Cloud Trace and App Health.

#### Scenario: A valid Polaris span is accepted
- **WHEN** the Collector accepts a valid Polaris span
- **THEN** each enabled consumer receives an export derived from that same post-processor span with the same trace ID, span ID, route, status, service, and environment

#### Scenario: One consumer fails
- **WHEN** one exporter is unavailable or rejects a batch
- **THEN** the other exporters continue independently and the failed export is retried or dropped within configured bounds

### Requirement: Environment attribution is consistent
Polaris SHALL set the standard `deployment.environment.name` resource
attribute from its deployment environment, and the Collector SHALL preserve
that value for every consumer.

#### Scenario: Staging traffic is exported
- **WHEN** staging Polaris emits a span
- **THEN** GCP and App Health receive that span as environment `staging`

### Requirement: Exporter access is least privilege
The Collector SHALL obtain consumer credentials through managed secret
references and platform identity, while Polaris SHALL know only the Collector
endpoint.

#### Scenario: Collector configuration is rendered
- **WHEN** the Collector deployment is rendered for an environment
- **THEN** source-controlled output contains no App Health key, Google credential, or Polaris application secret

#### Scenario: Cloud Trace export authenticates
- **WHEN** the Collector exports to Google Cloud Trace in GKE
- **THEN** it authenticates through Workload Identity with only the required trace-writing role

### Requirement: Existing observability remains intact
The fan-out pipeline SHALL NOT replace Polaris's existing Sentry error capture
or Prometheus metrics path.

#### Scenario: Existing Sentry behavior remains separate
- **WHEN** the fan-out pipeline is enabled
- **THEN** the existing Sentry SDK and Prometheus metrics continue unchanged
- **AND** the Collector does not export traces to Sentry

### Requirement: Fan-out is proven before production
The integration SHALL have a local proof using real Polaris routes and a
staging canary before any production rollout.

#### Scenario: Local fan-out proof runs
- **WHEN** the local proof sends real requests through Polaris
- **THEN** two recording consumers receive matching trace identities and normalized route attributes
- **AND** failure injection against one consumer does not prevent the other consumer from receiving spans

#### Scenario: Staging canary completes
- **WHEN** staging is configured with valid consumer credentials
- **THEN** operators can identify the same canary trace in Google Cloud Trace and the App Health staging environment before production is enabled
