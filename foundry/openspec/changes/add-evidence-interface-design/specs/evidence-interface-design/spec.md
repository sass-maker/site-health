## Purpose

Define a repeatable Fleet workflow for shaping evidence-heavy interfaces without
weakening factual integrity, auditability, accessibility, or project identity.

## ADDED Requirements

### Requirement: Evidence interfaces begin with the reader decision
The workflow SHALL identify the reader, the question or decision the surface
serves, the strongest supported answer, the evidence that supports it, and the
material caveat before selecting a composition.

#### Scenario: A report is requested from unordered source material
- **WHEN** an agent is asked to design a report, benchmark, comparison, dashboard, calculator, or decision page
- **THEN** it frames the reader's job and evidence chain before translating source order into page order

#### Scenario: No supported recommendation exists
- **WHEN** the available evidence does not support a decision or recommendation
- **THEN** the workflow presents the strongest supported state, limitation, or unresolved question without inventing certainty or a call to action

### Requirement: Factual meaning survives visual transformation
The workflow MUST preserve supplied facts, formulas, units, periods, populations,
bases, qualifiers, sources, privacy constraints, and uncertainty, and SHALL
distinguish observations, derivations, projections, recommendations, and causal
claims.

#### Scenario: Derived or projected evidence is displayed
- **WHEN** a value is calculated, projected, or recommended rather than directly observed
- **THEN** the interface labels its status and keeps the relevant formula, assumption, source, and caveat available for audit

#### Scenario: Material source information is missing or contradictory
- **WHEN** units, periods, populations, formulas, or source claims cannot be reconciled safely
- **THEN** the workflow asks one bounded group of questions or labels the gap honestly instead of silently choosing a meaning

### Requirement: Evidence supports fast and detailed reading
The workflow SHALL provide a fast path through the central answer and decisive
evidence plus an audit path through exact values, assumptions, methodology,
caveats, and sources, without repeating the same claim at equal prominence.

#### Scenario: One claim appears in multiple representations
- **WHEN** a claim is summarized and also preserved in detailed evidence
- **THEN** one representation remains the primary evidence home and every secondary representation serves a distinct lookup or interpretation task

#### Scenario: The opening viewport is reviewed
- **WHEN** the surface is rendered for review
- **THEN** the central relationship, decision, or working tool is more memorable than the page title or visual mood alone

### Requirement: Visual encodings match the evidence relationship
The workflow MUST select tables, prose, charts, comparisons, diagrams, or
interactive controls according to the reader's task and the structure of the
evidence, and MUST NOT use visual geometry that misstates scale or certainty.

#### Scenario: Exact lookup is the primary task
- **WHEN** readers need precise row-by-row values
- **THEN** the interface uses a semantic table with aligned headers, units, and precision instead of a decorative chart

#### Scenario: A chart carries material evidence
- **WHEN** position, length, proportion, sequence, connection, threshold, or change is used to encode values
- **THEN** peers share a documented basis, labels remain legible, the scale is honest, and a semantic table or concise text alternative preserves access

### Requirement: Interactive evidence has one explicit state model
The workflow MUST define variables, fixed inputs, formulas, units, full-precision
state, ranges, increments, defaults, display precision, dependencies, invalid
states, and fallback behavior before implementing a calculator or interactive
model.

#### Scenario: A reader changes a calculator input
- **WHEN** one variable changes
- **THEN** all dependent outputs update atomically from full-precision state before display formatting

#### Scenario: A calculator input becomes invalid
- **WHEN** the reader enters an incomplete or invalid value
- **THEN** the interface preserves the entry, communicates the error, and retains the last valid result instead of silently clamping or substituting a default

### Requirement: Existing Fleet design authority remains intact
The evidence-interface workflow SHALL use the host project's facts, framework,
routes, components, tokens, and design authority, and SHALL finish meaningful
visual implementation through `design-workflow` and Impeccable.

#### Scenario: An external design system supplies useful guidance
- **WHEN** a third-party report or design skill contributes a transferable principle
- **THEN** the workflow adapts the principle without copying its brand assets, proprietary code, token system, or fixed house style

#### Scenario: Research ends before implementation
- **WHEN** the user requests analysis or a contract but not implementation
- **THEN** the workflow returns its evidence plan and next decision without editing product source or claiming completion
