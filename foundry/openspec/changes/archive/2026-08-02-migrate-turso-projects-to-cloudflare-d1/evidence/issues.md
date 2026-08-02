# Migration issue map

- Fleet coordination: https://github.com/sass-maker/fleet-workspace/issues/112
- Karte: https://github.com/Significant-Hobbies/karte/issues/48
  - Draft PR: https://github.com/Significant-Hobbies/karte/pull/49
- Significant Hobbies: https://github.com/Significant-Hobbies/significanthobbies/issues/50
- Reader: https://github.com/Significant-Hobbies/reader/issues/30
- SWE Interview Prep: https://github.com/Significant-Hobbies/swe-interview-prep/issues/39
  - Migration PR: https://github.com/Significant-Hobbies/swe-interview-prep/pull/40
  - Status PR: https://github.com/Significant-Hobbies/swe-interview-prep/pull/41
- Starboard: https://github.com/Codevetter/starboard/issues/49
- Anime List: https://github.com/Significant-Hobbies/anime-list/issues/32
  - Draft PR: https://github.com/Significant-Hobbies/anime-list/pull/33
- Open Historia: https://github.com/sarthakagrawal927/open-historia/issues/19
  - Migration PR: https://github.com/sarthakagrawal927/open-historia/pull/20
  - Deploy workflow hardening: https://github.com/sarthakagrawal927/open-historia/pull/22
- TrueHire: https://github.com/sarthakagrawal927/truehire/issues/10
  - Migration PR: https://github.com/sarthakagrawal927/truehire/pull/11
  - Deploy workflow hardening: https://github.com/sarthakagrawal927/truehire/pull/13

Retirement status updates:

- Significant Hobbies: https://github.com/Significant-Hobbies/significanthobbies/pull/57
- Reader: https://github.com/Significant-Hobbies/reader/pull/33
- SWE Interview Prep: https://github.com/Significant-Hobbies/swe-interview-prep/pull/44
- Starboard: https://github.com/Codevetter/starboard/pull/57
- Anime List: https://github.com/Significant-Hobbies/anime-list/pull/37

Each project has a clean local `codex/migrate-turso-to-d1` branch from the
current `origin/main`. Karte is checked out for the canary; the other projects
remain on their prior checked-out branches until their slice begins.

Every migration issue records the same mutation boundary: local preparation and
rehearsal first; explicit approval before remote D1 creation, production data
operations, binding or production configuration mutation, or deployment. Turso
retirement was separately approved and completed on 2026-08-02.
