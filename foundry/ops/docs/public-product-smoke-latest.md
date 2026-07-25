# Public Product Smoke — Calorie

Generated: 2026-07-25T13:14:00Z

## Passing

### Calorie

- **Status:** pass
- **Origin:** `https://calorie.significanthobbies.com`
- **Authentication model:** public-persistent
- **Guest state:** guest
- **Surfaces tested:** 3

The production landing page loaded over HTTPS, clearly offered the enabled
account-free path, exposed valid PWA metadata, and produced no browser console
warnings or errors. The production health endpoint returned D1-backed success,
and the remote database contained the expected migrated tables.

The first live pass found an enabled Google sign-in action while OAuth was not
configured. The release was corrected so unavailable Google sign-in is no
longer shown, then revalidated on the public hostname.

No rate-limit or abuse-protection evidence appeared during ordinary use.
