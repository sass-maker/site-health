# FleetWorkspace

FleetWorkspace is a multiplayer, self-improving execution runtime.

## North-star demo

Learn → compile → break → repair → retain.

## Initial environment

GitHub.

## Initial workflow

Create and verify an issue with explicit preconditions, postconditions, and
duplicate protection.

## Success today

A complete immutable event timeline and one detected mismatch.

## Current slice

This prototype contains one actor and one workflow-specific GitHub adapter. It
persists the expected transition before acting, observes GitHub afterward, and
records either externally grounded goal evidence or the exact mismatch. It does
not yet implement multiplayer execution, repair, skill compilation, deployment,
or post-training.

