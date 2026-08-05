## Why

The reel maker already exposes a broad set of production recipes, but its
generative-film path still collapses the runtime to one LTX-labelled option and
its creative choices mostly stop at visual treatment. The operator wants more
optionality without turning the maker into a model dashboard or multiplying
every style by every backend.

The missing abstraction is two independent, versioned choices:

- a **theme pack** that controls cast, world, wardrobe, props, and prompt rules;
- a **model profile** that controls where and how eligible generated shots run.

This also lets a reusable format such as "Night Out" keep one hook and bouncy
carousel edit while swapping between original nightlife, anime, fantasy,
superhero, or other rights-cleared worlds.

## What Changes

- Add a secret-free Studio theme-pack registry with stable ids, prompt
  fragments, source posture, content scope, and commercial-rights requirements.
- Add a Forge-owned local model-profile registry covering Auto, the verified
  WAI Illustrious v17 image-to-reel path, the installed LTX-2.3 Q4 path, and
  inspectable Wan Remix and MiniMax H3 candidate paths.
- Expose both registries through the existing read-only Studio arsenal without
  expanding the current recipe-variant Cartesian product.
- Persist optional `themePackId` and `modelProfileId` selections on the existing
  versioned video brief and Forge handoff.
- Keep Auto as the default. Auto selects only among ready profiles compatible
  with the requested generation mode and reveals the concrete choice before a
  render starts.
- Show compact Theme and Model controls only for recipes that support them.
  Missing runtimes remain inspectable with their exact blocker and explicit
  setup action.
- Require a separate confirmation before any model download or setup. Selecting
  a profile, saving a brief, or starting another render never installs weights.
- Add the "Night Out" bouncy-carousel concept as the first reusable theme-aware
  proof: a short spoken/captioned hook, rapid themed party cards, and an original
  funk bed.
- Treat named entertainment IP as a rights-sensitive theme source. Private
  concepting remains selectable; commercial preparation and distribution stay
  blocked until operator-supplied rights evidence exists.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `local-video-forge`: Support a versioned model-profile registry, explicit or
  automatic compatible profile selection, profile-specific readiness, and a
  no-implicit-install boundary.
- `marketing-video-studio`: Support theme packs as creative production state
  independent of recipe and execution model.
- `studio-web-ui`: Expose compact theme/model choices, their tradeoffs, and
  truthful blockers in the existing maker.

## Impact

- Affected configuration: new secret-free theme and model registries plus the
  current Studio arsenal join.
- Affected code: Studio catalog/brief normalization, Forge handoff and worker
  capability routing, Fleet Console Marketing maker, and focused tests.
- Local storage: the exact WAI checkpoint and direct `stable-diffusion.cpp`
  runtime were installed only after a real source-checkout canary passed. Wan
  and H3 weights are not added. Any later candidate setup remains a separately
  confirmed action with disk and memory requirements disclosed first.
- Dependencies: no new Node production dependency is planned. External model
  runtimes remain pinned under the ignored `.reel-pipeline/` boundary.
- Publishing: unchanged. Postiz remains the only social review/scheduling
  boundary, and named-IP or mature-content productions require applicable
  rights evidence before preparation.
- Deployment: no deploy, release, or production configuration change is part of
  this proposal.
