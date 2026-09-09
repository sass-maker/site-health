# Public directory history reconciliation — 9 September 2026

Canonical source208ff071 corrects23 latestCommitAt values from actual retained
Git history;56/57 identities now match, with excluded Nomad unavailable.
No lifecycle, shareability, first-commit or product identity changed.

SaaS Maker PR107 changes only four dates in the24-entry public projection.
Merged source e391a869a0fd26d7d9be4156deef32716ac9c792 passed CI34340021306 and
Tooling34340021346. Existing deploy:directory passed all six gates, built33
pages and passed four directory smoke checks. Production Pages deployment is
e3d262d1-7b28-4903-8956-1042e050de4f. Previous production10e4f636-d875-4ee9-b3ee-965fd6415bb8
(source494e2f9) is the observed rollback reference.

[Public parity](public-parity.json), [provider receipt](deployments.json), and
[deployment log](deploy.log) retain the results. Root independently fetched
both public and immutable projects.json and compared all24 entries with the
exact merged catalog. Both match. A prior Python urllib probe received403;
Node fetch succeeded, so no universal-client access claim is made.

Only the Pages directory was deployed. The API/inbox were untouched. Temporary
clones, worktree and merged task branch were removed normally; the owner's four
modified files and three untracked skill directories remain unchanged.
