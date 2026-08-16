# Shared iOS landings repo

## Why

Five Significant Hobbies iOS apps now share one landing shape. Copying the
Astro template into each `site/` folder already drifted. A common repo
keeps the engine in one place and lets blogs land later without five
rewrites.

## What

- New repo `Significant-Hobbies/ios-landings`
- One Astro app, five `PRODUCT=` builds, five `dist/<id>` sites
- Each product still has its own domain, privacy URL, support URL, tokens,
  and screenshots
- Indulge becomes a fifth `site.config.ts` + screenshots
- Fleet catalog gains the new identity

## Out

- One combined homepage for all five apps
- Deploying any of the five domains
- Blogs (folder reserved, not built)
- Calorie, Significant Hobbies, Pace, Office OS
- Deleting per-product `site/` folders in this pass
