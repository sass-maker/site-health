## Context

The first retirement pass moved SaaS Maker's widget, API, and inbox into Fleet.
A workspace-wide consumer search then found no package imports or API calls
outside that component. Retaining two Workers and their data/auth stack would
therefore preserve infrastructure without a demonstrated consumer.

## Goals / Non-Goals

**Goals:**

- Keep the useful feedback UI and Pinpoint behavior as one npm package.
- Make submission transport the integrating product's responsibility.
- Remove all hosted feedback runtime source and operational registry entries.
- Leave no standalone SaaS Maker checkout once Fleet contains the package.
- Generate a public, non-operational directory from Fleet's canonical project
  metadata while keeping the live control plane machine-hosted.

**Non-Goals:**

- Providing storage, uploads, authentication, voting, project keys, or an inbox.
- Creating another Worker or Fleet-hosted feedback service.
- Exposing Fleet controls, tasks, observability, or private project state on the
  public directory.
- Publishing npm, deleting Cloudflare resources/data, changing DNS, or deleting
  a GitHub repository without performing the named external action explicitly.

## Decisions

### Package-only Fleet boundary

The package lives at `foundry/packages/feedback/` as an independently
checkable pnpm package. Fleet does not treat it as a deployed product.

### Consumer-owned submission

`FeedbackWidget` requires:

```tsx
<FeedbackWidget onSubmit={async (feedback) => { /* product-owned transport */ }} />
```

The callback receives type, title, description, optional identity fields,
structured Pinpoint context, optional screenshot `File`, and page URL/title.
The package has no default network endpoint and performs no network request.

### Keep useful capture, remove hosted features

Pinpoint remains because it is local DOM behavior and the distinctive value of
the widget. Screenshot selection remains local and returns the `File`. Public
boards, voting, uploads, project keys, authenticated administration, and the
private inbox are removed because each requires the retired backend.

### Treat runtime resources as deletion candidates

The four SaaS Maker Cloudflare surfaces and feedback D1/R2 resources have no
source owner after this change. Removing source does not itself mutate live
infrastructure; the exact external resources must be deleted separately and
verified.

### Split the public projection from the private control plane

Fleet is the only source of project metadata. A static site generated from that
metadata is the public `sassmaker.com` directory and contains only product
summaries, public links, changelog entries, and public roadmap items. It has no
runtime API, authentication, controls, or private operational state.

The operational Fleet Console remains machine-hosted behind the existing
Cloudflare Tunnel at `fleet.sassmaker.com`. A machine or Tunnel outage may make
the private console unavailable, but cannot take down the public directory.

## Risks / Trade-offs

- **Breaking existing npm consumers** → Consumer search found none in the Fleet
  workspace; release as the next pre-1.0 minor and document the callback change.
- **No central inbox** → Intentional. Consumers choose email, an issue tracker,
  their own API, or another destination.
- **Screenshot lifetime** → The callback receives the original browser `File`;
  the consumer must upload or discard it during callback execution.
- **Loss of historical feedback data** → Do not delete D1/R2 until the owner
  explicitly accepts that data deletion.
- **Public projection drift** → Build it directly from Fleet-owned metadata and
  validate the generated output in Fleet CI before deployment.
- **Single Tunnel replica** → Acceptable for the private console because public
  availability is no longer coupled to the designated host.

## Migration Plan

1. Revise this OpenSpec from service-preserving to package-only.
2. Move the widget into `foundry/packages/feedback/`.
3. Replace API submission/upload code with callback-driven submission.
4. Remove the inbox, API, migrations, auth, smoke scripts, and service workspace.
5. Remove deployed Feedback from Fleet registries, probes, and status docs.
6. Validate typecheck, build, package contents, Fleet tests, and absence of
   backend URLs/source.
7. Secure the Fleet change, then remove the standalone local checkout.
8. Build and deploy a static Fleet-owned public directory at `sassmaker.com`;
   keep the operational Fleet Console at `fleet.sassmaker.com` on the existing
   Tunnel and do not create a package-documentation site.
9. Separately delete or retire GitHub, npm, Cloudflare, DNS, and stored data as
   explicitly authorized external actions.
