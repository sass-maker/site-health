# Execution

Use the most semantic verified integration available:

1. purpose-built connector, API, or official CLI;
2. Postiz for social accounts that are mapped and pass its readiness gates;
3. the connected in-app Browser or Chrome skill for normal visible UI work;
4. manual/blocked receipt when safe automation is unavailable.

Before every item:

```bash
node foundry/ops/scripts/campaign-manifest.mjs gate --manifest <path> --item <key>
```

Execute only when the result is `authorized`. Then record confirmed provider
IDs, repository revisions, live URLs, or visible success evidence. `queued`
means a provider accepted a scheduled/draft item; it is not a live post.
Ambiguous navigation or form text is `indeterminate` and must be reconciled
before retry.

Browser work uses the user's connected session and ordinary visible
interaction. Stop on unexpected payment, changed fields/content, CAPTCHA,
anti-bot controls, missing authentication, or unclear success. Never use hidden
standalone browser automation, force-submit, automation-evasion, or blind retry.
