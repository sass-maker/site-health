## ADDED Requirements

### Requirement: The portfolio ledger can update its evidence

The Google Search page SHALL expose one Update control that starts the existing
read-only Search Console collector for the complete canonical public metric
portfolio, reports progress, prevents duplicate active runs, and redraws the
ledger after successful completion.

#### Scenario: Operator updates Google Search evidence

- **WHEN** the operator activates Update and local mutation authentication is
  available
- **THEN** one portfolio Search collection starts for all canonical targets
- **AND** the control is disabled and reports progress until completion
- **AND** the Search ledger redraws from the rebuilt bounded projection

#### Scenario: Search update cannot complete

- **WHEN** local Google credentials or another collector prerequisite is
  unavailable
- **THEN** the control returns to its idle state
- **AND** the page reports the bounded failure without replacing existing
  evidence or exposing credentials
