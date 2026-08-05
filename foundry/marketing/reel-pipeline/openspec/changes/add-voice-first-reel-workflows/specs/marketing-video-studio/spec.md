## ADDED Requirements

### Requirement: Briefs compile into editable workflows
Marketing Studio SHALL compile each accepted conversational brief into a saved editable reel workflow and SHALL expose that workflow as the authoritative source for execution. Brief creation alone SHALL continue not to start a render.

#### Scenario: Operator accepts a normalized brief
- **WHEN** the operator accepts a typed or spoken normalized brief
- **THEN** Marketing Studio creates the corresponding staged workflow and opens it for review without executing generation

### Requirement: Selected execution model is binding
Marketing Studio SHALL treat an explicitly selected generation model as a binding workflow input and SHALL validate its registered executor before beginning a generation stage.

#### Scenario: Executor is unavailable
- **WHEN** a brief selects a model that is installed but has no compatible registered executor for the requested workflow
- **THEN** Marketing Studio blocks execution with the model-specific reason and does not redirect the operator to Forge or another model

### Requirement: Experiment and distribution readiness are distinct
Marketing Studio SHALL calculate private-experiment readiness separately from distribution readiness. Missing brand or source-rights evidence SHALL NOT block an otherwise eligible private experiment, but SHALL continue to block all distribution actions.

#### Scenario: Experimental concept lacks brand evidence
- **WHEN** an eligible local workflow is marked private and lacks Fleet branding or publish rights
- **THEN** local execution remains available and distribution remains blocked with its separate reasons
