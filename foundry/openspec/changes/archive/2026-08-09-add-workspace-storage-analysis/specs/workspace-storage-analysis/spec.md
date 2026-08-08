## Purpose

Provide a safe, repeatable view of local storage pressure while retaining all
generated evidence inside Fleet Workspace and preventing destructive actions.

## ADDED Requirements

### Requirement: Storage inspection is read-only
The system SHALL inspect disk capacity, directory metadata, and directory sizes
without deleting, moving, renaming, truncating, changing permissions, or
modifying system configuration.

#### Scenario: Normal analysis run
- **WHEN** an operator runs storage analysis for an accessible scan root
- **THEN** the system reads storage metadata and produces evidence without modifying any scanned path

#### Scenario: Cleanup is requested from the report
- **WHEN** an operator reviews a generated report
- **THEN** the report provides no delete, Trash, uninstall, permission, or cleanup-execution endpoint

### Requirement: Artifacts remain inside Fleet Workspace
The system SHALL write scan data, classified findings, and the HTML report only
under `.fleet-local/reports/storage/<run-id>/` within the resolved Fleet
Workspace root.

#### Scenario: Default output
- **WHEN** storage analysis runs without an output override
- **THEN** every generated artifact is contained by the ignored workspace-local storage reports directory

#### Scenario: Invalid run identifier
- **WHEN** a run identifier could escape or traverse the workspace-local reports directory
- **THEN** the system rejects the run before writing an artifact

### Requirement: Findings communicate cleanup risk honestly
The system SHALL classify inspected entries as safe cache, review required, or
protected using explicit path and content evidence, and SHALL describe unknown
or unreadable entries without presenting them as safe cleanup.

#### Scenario: Known reproducible cache
- **WHEN** an inspected path is a recognized cache or reproducible developer cache
- **THEN** the report classifies it as safe cache and identifies the evidence used for that classification

#### Scenario: User or application data
- **WHEN** an inspected path may contain downloads, source code, media, application state, or other user data
- **THEN** the report classifies it as review required or protected rather than safe cache

#### Scenario: Unreadable path
- **WHEN** storage metadata cannot be read for a path
- **THEN** the report records the limitation and excludes the unknown size from releasable-space estimates

### Requirement: Reports are static and locally reviewable
The system SHALL generate a self-contained static HTML report and machine-readable
JSON evidence that can be reviewed without starting a local mutation server.

#### Scenario: Report generation completes
- **WHEN** a scan completes with one or more readable entries
- **THEN** the run directory contains scan JSON, classified report JSON, and a static HTML report with matching totals

#### Scenario: Repeated fixture generation
- **WHEN** the same scan evidence and run identifier are rendered twice
- **THEN** the classified findings and report content remain deterministic apart from explicitly timestamped scan metadata

