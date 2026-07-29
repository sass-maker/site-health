# Channel inventory

Load the seed inventory only when a campaign needs it:

```bash
node foundry/ops/skills/launch-campaign/scripts/channel-inventory.mjs \
  --artifact <article|product|major-feature>
```

The JSON output keeps large, drift-prone registries out of normal skill
context. It is discovery input, not an executable plan. Every retained channel
still needs live audience, policy, cost, authentication, submission-flow, and
account verification before it enters the immutable manifest.

## Route the inventory

- `protected`: Hacker News, LinkedIn, and X. Create original native plans and
  preserve the quality gate regardless of artifact type.
- `articleSyndication`: full-canonical platforms, editorial platforms,
  discovery communities, and optional owned publication hosts. Require the
  complete body and canonical URL for any full duplicate.
- `curatedDirectories`: the smaller maintained product/listing seed set.
- `longTailSeeds`: the wider historical probe. Treat every entry as unverified
  until the current form and audience fit have been checked.

For a product or major feature, retain relevant profiles, catalogs, comparison
pages, package registries, marketplaces, launch boards, and directories. For
an article, prioritize canonical syndication and genuine discovery surfaces;
do not manufacture unrelated directory submissions.

Map selected destinations to the user's chosen connected account at planning
time. Keep account slugs in private campaign state. During execution, isolate
sign-in, account setup, CAPTCHA/anti-bot, payment, and moderation blockers into
one resumable enablement queue while unrelated authorized items continue.
