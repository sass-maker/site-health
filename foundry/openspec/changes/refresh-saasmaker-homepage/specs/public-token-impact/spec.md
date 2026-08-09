## MODIFIED Requirements

### Requirement: Globe communicates aggregate activity accessibly

The SaaS Maker homepage SHALL render the verified token metrics and a CSS globe
fallback in static HTML, then load the decorative Three.js runtime only when the
chapter approaches the viewport. Motion MUST pause offscreen and MUST have a
purposeful reduced-motion state that preserves the same information.

#### Scenario: Globe is below the initial viewport
- **WHEN** the page loads before the globe approaches the viewport
- **THEN** semantic metrics and the CSS fallback are available while the Three.js module has not executed

#### Scenario: Globe approaches the viewport
- **WHEN** the chapter enters a bounded preload margin and scripting is available
- **THEN** the browser imports Three.js once, initializes the scene, and preserves reserved layout space

#### Scenario: Visitor uses reduced motion or data saving
- **WHEN** reduced motion or save-data is enabled
- **THEN** the page keeps an immediate static globe state without starting a continuous render loop
