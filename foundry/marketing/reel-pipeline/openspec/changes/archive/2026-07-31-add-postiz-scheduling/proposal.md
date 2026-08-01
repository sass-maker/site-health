## Why

Marketing Studio currently stops at an unscheduled Postiz draft even though the
operator goal is to prepare videos and schedule their automatic publication to
YouTube or Instagram from the same UI. The missing schedule action forces a
second manual workflow and makes the product incomplete.

## What Changes

- Add an explicit future publish time to the Marketing Studio distribution UI.
- Submit approved Instagram Reel and YouTube Short requests to Postiz with that
  schedule while preserving exact Fleet brand, account, and channel routing.
- Keep unscheduled Postiz drafts available when the operator is not ready to
  schedule.
- Validate timestamps and all existing evidence before any Postiz network
  request.
- Record the sanitized Postiz receipt and scheduled lifecycle state on the
  production.
- Keep credentials, provider publication state, calendar lifecycle, analytics,
  and direct-provider publishing inside Postiz.
- Verify scheduled requests with fixtures and contract tests; live auto-posts
  remain explicitly outside automated verification.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `marketing-video-studio`: Replace the draft-only scheduling prohibition with
  an evidence-gated Postiz draft-or-schedule contract for YouTube Shorts and
  Instagram Reels.

## Impact

- Affects Marketing Studio distribution state, server endpoints, Postiz
  request construction, UI controls, and focused test fixtures.
- Reuses the existing Postiz client and integration mapping; no new production
  dependency or direct social-provider credential path is introduced.
- Tracks implementation in Fleet Workspace issue #88.
