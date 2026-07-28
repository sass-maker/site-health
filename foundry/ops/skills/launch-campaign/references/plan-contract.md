# Campaign plan contract

The preview is the operator interface. It must contain:

- campaign objective, product revision, launch scope, readiness verdict, and
  source evidence;
- ordered steps and timing;
- every item with tier, destination, exact account, cost, authentication state,
  policy check time, execution mode, and expected receipt;
- full canonical article, email, announcement, Product Hunt copy, launch-page
  copy, and flagship social posts;
- destination-specific secondary titles, descriptions, categories, tags,
  URLs, assets, and form fields;
- explicit exclusions and blockers;
- every repository path, command, commit/push action, and deploy action;
- attribution, launch-day metrics, and 7-day/30-day checkpoints.

## Lanes

`flagship` is small and high effort: canonical first-party article, launch page,
email, mapped flagship social accounts, and a genuinely suitable launch
community or press asset.

`secondary` is broad but relevant: eligible directories, profiles, catalogs,
content syndication, and low-risk social variants. Reuse factual source
material, but adapt required fields and copy to each destination.

`manual_or_blocked` includes press outreach, moderation-sensitive communities,
paid placement, missing authentication, unsupported accounts, CAPTCHA,
anti-bot challenges, ambiguous policies, fake-review requests, and irrelevant
destinations.

One approval applies to the complete canonical JSON hash. Any material field
change invalidates it.
