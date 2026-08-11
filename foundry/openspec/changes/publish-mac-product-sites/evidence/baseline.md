# Release-channel baseline — 2026-08-11

## Tracking

- Fleet: `sass-maker/fleet-workspace#308`
- Office OS: `sass-maker/agent-office#12`
- Local AI Video Studio: `sass-maker/local-ai-video-studio#7`

## Source state

| Product | Branch | Commit | Worktree |
| --- | --- | --- | --- |
| Office OS | `main` | `528001af71c23261a7c56ced2d22b1e1ad0c5b21` | clean, synchronized with `origin/main` |
| Local AI Video Studio | `main` | `e97c3571e12f49975dbbda8351e132ada25b3777` | clean, synchronized with `origin/main` |

## Local distribution artifacts

| Product | Bundle | Version | Team | DMG SHA-256 |
| --- | --- | --- | --- | --- |
| Office OS | `com.sassmaker.officeos` | `0.1.0 (1)` | not set (ad-hoc) | `03e6cc13e12dcce6cc93ed16eff7d444c602e9afeac7270e7f1e9cab0d7333a8` |
| Local AI Video Studio | `com.sassmaker.localaivideostudio` | `0.1.0 (1)` | not set (ad-hoc) | `c5250f39806fae395fd56915de5ed290bae1a66fd65ad519095349eadd351d66` |

Both app bundles carry hardened-runtime flags and target macOS 14, but neither
artifact has a Developer ID team identity or notarization evidence. They are
local validation artifacts and must not be published.

## Cloudflare Pages

Authenticated account inventory contained neither `office-os` nor
`local-ai-video-studio` at baseline. Both intended project names were therefore
available before implementation.

## Verified informational deployments

| Product | Canonical origin | Final `main` commit | Production deployment |
| --- | --- | --- | --- |
| Office OS | `https://office-os.pages.dev` | `35db6188c3c3d4915e83a26fddedba4270cef710` | `72281097` |
| Local AI Video Studio | `https://local-ai-video-studio.pages.dev` | `69dd33df72a2fb5ddb6e6fa9a2205ce13b6f8ddf` | `d534a282` |

Both deployments passed the six-gate Fleet deploy guard on clean synchronized
`main` with green commit-specific CI. Bounded guest smoke returned HTTP 200,
verified release-status navigation and native image loading, found no console
errors or binary links, and confirmed that public `release.json` remains
`preparing` with every Apple trust gate false.

## Final local packaging verification

- Office OS: 63 Swift tests passed; Release packaging succeeded for arm64 with
  hardened runtime. The resulting bundle is ad-hoc signed, has no team
  identifier, and is rejected by Gatekeeper as expected.
- Local AI Video Studio: 43 Swift tests passed; Release packaging succeeded for
  arm64 with hardened runtime. The resulting bundle is ad-hoc signed, has no
  team identifier, and is rejected by Gatekeeper as expected.
- The Keychain exposes one valid codesigning identity:
  `Apple Development: Sarthak Agrawal (H77425A5P9)`. No Developer ID
  Application identity is installed, and no owner-approved support contact or
  named `notarytool` profile is available. Tasks 6.1–6.5 therefore remain
  deliberately open and neither site exposes a DMG.
