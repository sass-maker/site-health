# Fleet OpenSpec store

This is the only cross-project OpenSpec store for Fleet.

Ownership rules:

- A change affecting one independent product belongs in that product
  repository's `openspec/` directory.
- A change affecting Fleet itself, a Foundry component, or more than one
  repository belongs here.
- Ignored/inactive projects do not retain OpenSpec trees. Preserve shipped
  outcomes in their root `PROJECT_STATUS.md`; discard cancelled planning work.
- Do not create standalone stores under `~/Desktop/openspec-stores`.
- `foundry/ops/docs/openspec-inventory.md` is the generated catalog across this
  store and every canonical project checkout; it is not a second source of
  specification content.

The workspace-root `openspec` symlink points here so OpenSpec commands run from
`/Users/sarthak/Desktop/fleet` resolve this tracked store.

Refresh the catalog after adding, archiving, or migrating specifications:

```bash
npm run generate:openspec-inventory
```
