## 1. Feasibility and fixtures

- [ ] 1.1 Spike manual Mac pointer sampling against a browser-composed full-screen capture and record the exact permission and timing behavior
- [ ] 1.2 Build a short local fixture with known move, click, drag, idle, and off-screen states plus expected hotspot coordinates
- [ ] 1.3 Define the supported capture-source matrix, calibration tolerance, cursor-cover bounds, and fail-safe fallback criteria from the spike

## 2. Pointer-trace contract

- [ ] 2.1 Add the versioned pointer-trace schema, normalization, monotonic-time, coordinate, duration, and prohibited-field validation
- [ ] 2.2 Bind immutable trace and source hashes in capture/job metadata while preserving existing capture-record compatibility
- [ ] 2.3 Add focused contract tests for valid traces, malformed coordinates, time drift, hash mismatch, unknown fields, and prohibited input data

## 3. Capture workflow

- [ ] 3.1 Add an explicit start/stop local pointer helper for supported manual Mac captures without collecting keys, text, selectors, titles, or app content
- [ ] 3.2 Emit the same normalized pointer sidecar from deterministic scripted browser demos
- [ ] 3.3 Add the opt-in treatment, hand-style choice, capability status, trace approval, and named fallback reason to the Forge capture workflow
- [ ] 3.4 Add UI and coordinator tests proving unsupported sources remain renderable with the standard cursor

## 4. Film skill and renderer

- [ ] 4.1 Register immutable `guided-app-demo@2` requirements and keep `guided-app-demo@1` behavior unchanged
- [ ] 4.2 Add a versioned rights-cleared hand-style manifest with explicit color, outline, handedness, pose, checksum, and license metadata
- [ ] 4.3 Implement deterministic presenter anchoring, arm routing, fingertip coverage, hotspot, pose transitions, idle retraction, and safe-area handling
- [ ] 4.4 Bind proof preview and final render to identical source, trace, style, skill, and settings hashes
- [ ] 4.5 Add the reduced-motion treatment and operator-controlled standard-cursor render from the same approved take

## 5. Review and verification

- [ ] 5.1 Add frame-level tests for hotspot alignment, captured-cursor coverage, click/drag poses, caption and presenter collisions, and all fallback paths
- [ ] 5.2 Run the Fleet design workflow in preserve mode and produce the required direction probes, browser evidence, critique, audit, and design-review receipt
- [ ] 5.3 Render and review one complete local full-screen app demo with representative move, click, drag, idle, reduced-motion, and fallback evidence
- [ ] 5.4 Run focused tests first, then `npm test`, `npm run smoke:render-modes`, `npm run docs:validate`, strict OpenSpec validation, and `git diff --check`

## 6. Documentation and lifecycle

- [ ] 6.1 Document supported sources, permissions, trace privacy, hand-style rights, review gates, and standard-cursor fallback in the existing operator and design docs
- [ ] 6.2 After the feature ships, update `PROJECT_STATUS.md`, archive the OpenSpec change, and keep publishing and deployment as separate explicitly approved actions
