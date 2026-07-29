## 1. Repository Authority

- [x] 1.1 Verify Fleet, Setline source, and standalone India Standards working
  trees, remotes, and domain records.
- [x] 1.2 Extract `foundry/apps/setline` with history into a private
  `Significant-Hobbies/setline` repository on `main`.
- [x] 1.3 Confirm the existing standalone India Standards repository is newer
  and preserve it as the sole authority.

## 2. Product-Owned Planning

- [x] 2.1 Update Setline repository instructions, status, README, and repository
  links for standalone ownership.
- [x] 2.2 Move relevant Setline OpenSpec history into the product repository and
  remove the active Fleet-owned feature change.
- [x] 2.3 Recreate Setline's open Fleet issues in the product repository and
  close the originals with migration links.

## 3. Fleet Boundary

- [x] 3.1 Point Setline and India Standards catalog and automation entries at
  immediate standalone checkouts while preserving domains and deployment IDs.
- [x] 3.2 Remove both embedded product trees under `foundry/apps`.
- [x] 3.3 Regenerate Fleet project, automation, and sanitized public-product
  views and update durable Fleet status.

## 4. Validation and Shipping

- [x] 4.1 Run Setline's smallest native tests and build from the standalone
  repository.
- [x] 4.2 Run India Standards' native tests/check from the standalone
  repository without reading or changing local data or secrets.
- [x] 4.3 Run strict OpenSpec validation and Fleet project/catalog/component
  checks.
- [ ] 4.4 Commit and push the standalone repositories and Fleet `main` without
  deploying or changing DNS.
