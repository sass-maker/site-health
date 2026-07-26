## Why

Reel Pipeline has a permanently hosted Worker/R2 path, but the highest-value
video-generation hardware is an operator Mac that is not always online. The
pipeline needs one durable queue that either machine can submit to while
Apple-Silicon-capable workers pull generation jobs without exposing the Mac to
inbound traffic.

## What Changes

- Add a Local Video Forge project/shot manifest for approved-keyframe,
  image-to-video work.
- Add a coordinator contract backed by the existing Worker/R2 deployment.
  Commands issued on either machine create tasks in the same queue.
- Add leased, capability-aware task claiming so only a compatible worker runs
  MLX/LTX jobs and expired work can resume after a restart.
- Add a Mac worker command that checks host readiness and memory headroom,
  renders three seed variants sequentially, and records reproducibility
  metadata without overwriting completed output.
- Add an editor-ready local output layout and a machine-readable review
  manifest.
- Add a bounded mixed-media composition preset for locally narrated demos:
  Kokoro voiceover, timed subtitles, approved still/video evidence, ASCII,
  Canvas/SVG graphics, proof slides, and restrained transition effects. The
  preset avoids showing an apparently speaking face when no lip-synchronized
  source exists.
- A browser review gallery, general-purpose final assembly, and cloud adapters
  remain later phases.
- Pin the external Apple Silicon runtimes to tested Git revisions:
  `ltx-2-mlx` int4 for the default generation lane and MLX-Video for the PRD
  benchmark lane. Neither enters the Node production dependency graph.

## Capabilities

### New Capabilities

- `local-video-forge`: Approved-keyframe manifests, cross-machine task
  submission, durable leases, sequential MLX variant generation, memory
  guarding, and reproducible outputs.

### Modified Capabilities

- None.

## Impact

- Affected surfaces: the Reel Pipeline Worker/R2 API, a new operator CLI, local
  generation-host setup/readiness, tests, and operations documentation.
- External runtime: `ltx-2-mlx`, benchmark-only MLX-Video, and LTX-2.3 model
  weights on Apple Silicon, installed separately from the Node service.
- Deployment: code changes affect the existing Worker but this change does not
  deploy it. Production rollout remains manual.
- Local composition: the demo preset uses the existing Playwright and FFmpeg
  toolchain plus the optional ignored Kokoro environment. It adds no production
  dependency and never requires a browser GPU.
- Security: existing internal bearer authentication protects queue, asset, and
  worker routes. No new credential store is introduced.
