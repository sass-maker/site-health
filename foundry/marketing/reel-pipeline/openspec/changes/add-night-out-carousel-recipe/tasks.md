## 1. Recipe contract

- [x] 1.1 Register the single Night Out recipe and stable default variant in the Studio arsenal
- [x] 1.2 Register the required approved asset-manifest and rights-evidence execution inputs
- [x] 1.3 Add one deterministic fixture and gallery entry for the exact variant
- [x] 1.4 Update catalog, execution-registry, gallery, and completeness tests for the additive recipe

## 2. Local renderer

- [x] 2.1 Add the approved Night Out asset-manifest validator with bounded local path checks
- [x] 2.2 Implement the reveal hook, bouncy card carousel, theme labels, and end prompt behind the existing renderer interface
- [x] 2.3 Add deterministic original funk audio generation and MP4 muxing
- [x] 2.4 Write source, rights, frame, audio, and renderer evidence into the render receipt
- [x] 2.5 Add focused manifest, HTML, renderer, and failure-path tests

## 3. Maker execution

- [x] 3.1 Pass normalized execution inputs into local recipe render options and validate required inputs before runtime launch
- [x] 3.2 Confirm the existing Fleet Console maker exposes Night Out without a custom layout or parallel editor
- [x] 3.3 Render a real canary through the recipe using the approved local proof manifest
- [x] 3.4 Probe the final MP4 and visually inspect representative frames

## 4. Documentation and validation

- [x] 4.1 Document the Night Out manifest and local execution boundary
- [x] 4.2 Run focused tests, the smallest relevant project checks, OpenSpec validation, and `git diff --check`
- [ ] 4.3 Update `PROJECT_STATUS.md` with shipped recipe truth after owner acceptance
- [ ] 4.4 Archive the change only after the real recipe canary and owner review pass
