# Design

One codebase, five static sites.

```mermaid
flowchart LR
  Engine[shared src/] --> Build
  Kith[products/kith] --> Build
  Setline[products/setline] --> Build
  Anchor[products/anchor] --> Build
  Motion[products/motion] --> Build
  Indulge[products/indulge] --> Build
  Build --> DistK[dist/kith]
  Build --> DistS[dist/setline]
  Build --> DistA[dist/anchor]
  Build --> DistM[dist/motion]
  Build --> DistI[dist/indulge]
```

`PRODUCT` selects `products/<id>/site.config.ts` and
`products/<id>/public`. `astro.config.mjs` sets `site`, `publicDir`, and
`outDir` to `dist/<id>`.

Product domains stay on the product catalog rows. This repo does not
take ownership of `*.significanthobbies.com`.

The copyable template at `foundry/ops/templates/ios-landing` remains for
a new standalone iOS app. The five current apps use this factory.
