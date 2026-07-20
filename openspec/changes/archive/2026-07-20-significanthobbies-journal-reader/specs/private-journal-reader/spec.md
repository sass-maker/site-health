## ADDED Requirements

### Requirement: Recent private journal context
The system SHALL load only the authenticated user's journal entries for a bounded recent calendar window on the Daily ritual.

#### Scenario: Signed-in user opens Daily
- **WHEN** an authenticated user opens `/daily`
- **THEN** the system provides that user's journal entries for the current day and preceding 20 calendar days

#### Scenario: Another user's entries exist
- **WHEN** journal entries belonging to another user fall inside the same date window
- **THEN** the system does not include those entries in the Daily journal reader

### Requirement: Focused date navigation
The Daily journal SHALL let the user select and move between dates in the loaded window without navigating away from the page.

#### Scenario: User selects an earlier date
- **WHEN** the user activates an earlier date marker
- **THEN** the reader displays that date and its private journal content in place

#### Scenario: User reaches a window boundary
- **WHEN** the selected date is today or the earliest loaded date
- **THEN** the unavailable forward or backward navigation control is disabled

### Requirement: Today remains writable
The journal reader SHALL preserve the existing active AM or PM editor and save behavior when today is selected.

#### Scenario: User saves today's active reflection
- **WHEN** the user writes a non-empty active reflection and activates save
- **THEN** the system saves the AM/PM entry and corresponding Daily check-in as before

### Requirement: Earlier dates are read-only
The journal reader SHALL render dates before today as private read-only reflections.

#### Scenario: Historical entry has AM and PM writing
- **WHEN** the user selects a prior date containing AM and PM writing
- **THEN** the reader displays both reflections without editable controls

#### Scenario: Historical date has no writing
- **WHEN** the user selects a prior date with no journal content
- **THEN** the reader shows neutral non-judgmental empty-state copy

### Requirement: Timeline does not score practice
The recent-date rail MUST communicate journal presence without totals, percentages, streaks, entry-length encoding, or performance language.

#### Scenario: Window contains written and unwritten days
- **WHEN** the date rail renders a mix of days
- **THEN** each day has equal visual weight and differs only by presence and selected state

#### Scenario: Assistive technology reads a date marker
- **WHEN** a screen reader focuses a date marker
- **THEN** its accessible label identifies the date and whether writing exists without describing a score

