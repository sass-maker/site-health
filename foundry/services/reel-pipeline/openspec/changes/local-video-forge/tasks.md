## 1. Phase 0 host proof

- [x] 1.1 Pin and install the default `ltx-2-mlx` and benchmark MLX-Video tool environments on the Mac
- [ ] 1.2 Install/launch LTX Desktop and complete one manual smoke generation (installed and launched; manual generation remains)
- [x] 1.3 Record real T2V, I2V, and two-stage-HQ proof receipts outside git

## 2. First vertical slice

- [x] 2.1 Add JSON manifest validation and explicit keyframe approval gate
- [x] 2.2 Add LTX-2.3 preset/command construction and Mac memory/readiness guard
- [x] 2.3 Add sequential, resumable three-seed generation with durable metadata
- [x] 2.4 Add the direct `forge:variants` command and example project
- [x] 2.5 Add focused tests and dry-run verification

## 3. Shared cross-machine queue

- [x] 3.1 Add authenticated Worker/R2 task and keyframe storage
- [x] 3.2 Add conditional lease claim, retry, progress, and completion transitions
- [x] 3.3 Add CLI submission usable from either machine
- [x] 3.4 Add pull-based Mac worker execution and artifact upload
- [x] 3.5 Add Worker/CLI contract tests

## 4. Documentation and release boundary

- [x] 4.1 Document setup, direct mode, hosted coordinator mode, and both-machine submission
- [x] 4.2 Update render-mode/readiness docs and `PROJECT_STATUS.md`
- [x] 4.3 Run focused tests, full project tests, docs validation, and `git diff --check`
- [ ] 4.4 Archive the OpenSpec only after real Phase 0 and the first three MP4s pass
