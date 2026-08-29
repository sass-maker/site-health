import { createHash } from 'node:crypto';

import YAML from 'yaml';

import { summarizeGithubActions } from './github-actions-health.mjs';

const OWNER_HEADING_TO_ID = new Map(
  Object.entries({
    'agent office': 'agent-office',
    'chatgpt memory insights': 'chatgpt-memory-insights',
    chess: 'chess',
    'everything rated': 'everythingrated',
    'ios landings': 'ios-landings',
    pace: 'pace',
    portfolio: 'sarthakagrawal-personal',
    'recipe dashboard': 'veg-protein-food',
  }),
);
const RELATED_OWNER_HEADINGS = new Map([['indulge', 'anchor']]);
const RETIRED_OWNER_HEADINGS = new Set(['elves hq', 'saas ideas', 'today little log']);

function normalize(value) {
  return value.trim().toLocaleLowerCase('en-US');
}

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function firstParagraph(value) {
  return value.split(/\n\s*\n/)[0].trim();
}

export function parseOwnerNarratives(markdown, projects) {
  const projectByLabel = new Map();
  for (const project of projects) {
    for (const label of [
      project.id,
      project.name,
      project.repo,
      project.public?.id,
      project.public?.name,
      ...(project.aliases ?? []),
    ].filter(Boolean)) {
      projectByLabel.set(normalize(label), project.id);
    }
  }

  const narratives = {};
  const related = {};
  const retired = [];
  const unmapped = [];
  const pattern =
    /^## (.+?)\n\n(?:<!-- owner-captured-at: (\d{4}-\d{2}-\d{2}) -->\n\n)?```text\n([\s\S]*?)\n```/gm;

  for (const match of markdown.matchAll(pattern)) {
    const heading = match[1].trim();
    const normalizedHeading = normalize(heading);
    const capturedAt = match[2] ?? '2026-08-22';
    const verbatim = match[3];
    const restoredFromArchive = match[2] == null;
    const narrative = {
      sourceHeading: heading,
      whyVerbatim: firstParagraph(verbatim),
      reviewVerbatim: verbatim,
      reviewSha256: sha256(verbatim),
      capturedAt,
      restoredFromCommit: restoredFromArchive
        ? '4964ce35daee38aa91ea9648ba09012e9ee9a5da'
        : null,
      restoredBlob: restoredFromArchive ? '161289aa88af76fc68c74a35525119fbf3fda01e' : null,
    };
    const relatedProjectId = RELATED_OWNER_HEADINGS.get(normalizedHeading);
    if (relatedProjectId) {
      related[relatedProjectId] ??= [];
      related[relatedProjectId].push(narrative);
      continue;
    }
    if (RETIRED_OWNER_HEADINGS.has(normalizedHeading)) {
      retired.push(heading);
      continue;
    }
    const projectId =
      OWNER_HEADING_TO_ID.get(normalizedHeading) ?? projectByLabel.get(normalizedHeading);
    if (!projectId) {
      unmapped.push(heading);
      continue;
    }
    if (narratives[projectId]) throw new Error(`duplicate owner narrative for ${projectId}`);
    narratives[projectId] = narrative;
  }

  return { narratives, related, retired, unmapped };
}

function repositoryUrl(project) {
  return project.public?.repositoryUrl ?? project.repositoryUrl ?? null;
}

function publicUrl(project) {
  return project.domains?.[0] ? `https://${project.domains[0]}` : null;
}

function attributedResources(projectId, resources) {
  return resources.map((resource) => ({
    ...resource,
    scope: resource.scope ?? 'project',
    operationalOwner: projectId,
    attributionReason: resource.attributionReason ?? `Canonical project owner: ${projectId}`,
  }));
}

function workflowVerification(operation, operations) {
  const summary = summarizeGithubActions(operation.githubActions);
  const attention = operation.githubActions.reduce((counts, workflow) => {
    const state = workflow.attention ?? 'unclassified';
    counts[state] = (counts[state] ?? 0) + 1;
    return counts;
  }, {});
  const unverifiable = summary.unverifiable ?? 0;
  if (operation.githubActions.length === 0) {
    return { status: 'not-applicable', summary, attention, unknowns: [] };
  }
  if (!operations.githubObservedAt) {
    return {
      status: 'unverified',
      summary,
      attention,
      unknowns: ['Live GitHub Actions state has not been refreshed.'],
    };
  }
  if (unverifiable > 0) {
    return {
      status: 'partial',
      summary,
      attention,
      unknowns: [`${unverifiable} workflow(s) could not be verified through GitHub.`],
    };
  }
  return { status: 'verified', summary, attention, unknowns: [] };
}

export function buildProjectDossier({
  catalog,
  operations,
  project,
  operation,
  intent,
  ownerNarrative,
  relatedNarratives = [],
  sourceFingerprints,
}) {
  const metadata = catalog.publicDirectory.projects[project.id];
  const infrastructure = catalog.infrastructure.projects[project.id];
  const geoIdentity = catalog.geoIdentities.find((identity) => identity.id === project.id) ?? null;
  const actionVerification = workflowVerification(operation, operations);
  const unknowns = [...actionVerification.unknowns];
  const expectedGithubHomepage = publicUrl(project);
  const observedGithubHomepage = operation.githubActionsMeta?.homepage ?? null;
  const githubHomepageStatus = !expectedGithubHomepage
    ? 'not-applicable'
    : observedGithubHomepage === expectedGithubHomepage
      ? 'passed'
      : 'mismatch';

  if (githubHomepageStatus === 'mismatch') {
    unknowns.push(
      `GitHub repository homepage does not match the canonical deployed URL ${expectedGithubHomepage}.`,
    );
  }

  if (operation.source.state !== 'available') {
    unknowns.push('The owning checkout was unavailable during repository observation.');
  }
  const verificationStatus = unknowns.length > 0 ? 'partial' : 'verified';
  const cloudflareDeployments = infrastructure.deployments.filter(
    (deployment) => deployment.provider === 'cloudflare',
  );
  const cloudflareResources = attributedResources(
    project.id,
    infrastructure.resources.filter((resource) => resource.provider === 'cloudflare'),
  );
  const otherProviderDeployments = infrastructure.deployments.filter(
    (deployment) => deployment.provider !== 'cloudflare',
  );
  const otherProviderResources = attributedResources(
    project.id,
    infrastructure.resources.filter((resource) => resource.provider !== 'cloudflare'),
  );

  return {
    schemaVersion: 1,
    projectId: project.id,
    verification: {
      status: verificationStatus,
      meaning:
        'Verification confirms that the documented evidence was collected and attributed. It does not mean the project or its workflows are healthy.',
      generatedAt: operations.observedAt,
      checks: {
        canonicalCatalogEntry: 'passed',
        infrastructureAttribution: 'passed',
        ownerVoicePresent: 'passed-verbatim',
        repositorySnapshot: operation.source.state === 'available' ? 'passed' : 'unavailable',
        githubHomepage: githubHomepageStatus,
        githubActionsLiveState: actionVerification.status,
      },
      evidence: {
        catalog: {
          path: 'apps/backend/config/projects.json',
          sha256: sourceFingerprints.catalog,
          infrastructureUpdatedAt: infrastructure.updatedAt ?? null,
        },
        ownerVoice: {
          path: 'docs/portfolio-owner-narratives-2026-08-22.md',
          sourceHeading: ownerNarrative.sourceHeading,
          sourceKind: 'verbatim-owner-message',
          capturedAt: ownerNarrative.capturedAt,
          reviewSha256: ownerNarrative.reviewSha256,
          documentSha256: sourceFingerprints.ownerNarratives,
          restoredFromCommit: ownerNarrative.restoredFromCommit,
          restoredBlob: ownerNarrative.restoredBlob,
        },
        decisionSummary: {
          path: 'docs/portfolio-condensed-2026-08-23.md',
          sha256: sourceFingerprints.portfolioIntent,
          sourceKind: 'derived-owner-intent',
        },
        repository: {
          observedAt: operations.observedAt,
          state: operation.source.state,
          checkout: operation.source.path,
          revision: operation.source.revision,
          githubRepository: operation.source.repositorySlug,
          expectedHomepage: expectedGithubHomepage,
          observedHomepage: observedGithubHomepage,
          worktree: operation.source.worktree ?? null,
        },
        githubActions: {
          observedAt: operations.githubObservedAt ?? null,
          staleAfterDays: operations.githubStaleAfterDays ?? null,
          ...actionVerification.summary,
          attention: actionVerification.attention,
        },
      },
      unknowns,
    },
    ownerVoice: {
      whyVerbatim: ownerNarrative.whyVerbatim,
      fullReviewVerbatim: ownerNarrative.reviewVerbatim,
      relatedHistoricalReviews: relatedNarratives.map((narrative) => ({
        sourceHeading: narrative.sourceHeading,
        whyVerbatim: narrative.whyVerbatim,
        fullReviewVerbatim: narrative.reviewVerbatim,
        reviewSha256: narrative.reviewSha256,
      })),
    },
    decision: {
      classification: intent.classification,
      whySummary: intent.why,
      currentState: intent.currentState,
      nextDecision: intent.nextDecision,
    },
    identity: {
      name: project.name,
      publicName: project.public?.name ?? null,
      aliases: project.aliases ?? [],
      family: project.family,
      kind: project.portfolio.kind,
      priority: project.portfolio.priority,
      tier: project.tier,
      attention: project.attention,
      lifecycle: project.lifecycle,
      operationalStatus: project.status,
      authenticationModel: project.authModel,
      inRegistry: project.inRegistry,
    },
    product: {
      description: metadata.description ?? project.public?.description ?? null,
      publicMakerNote: metadata.makerNote,
      purposeContract: metadata.purposeContract ?? null,
      form: metadata.form,
      platforms: metadata.platforms,
      prominentTools: metadata.technologies,
      retainedGitHistory: {
        firstCommitAt: metadata.firstCommitAt,
        latestCommitAt: metadata.latestCommitAt,
        semantics: catalog.publicDirectory.historySemantics,
      },
    },
    repository: {
      checkout: operation.source.path,
      observedRevision: operation.source.revision,
      githubRepository: operation.source.repositorySlug,
      githubHomepageUrl: operation.githubActionsMeta?.homepage ?? null,
      worktree: operation.source.worktree ?? null,
      visibility: project.repositoryVisibility,
      url: repositoryUrl(project),
      aliases: project.repositoryAliases ?? [],
      sourceOverride: project.sourcePath ?? null,
      tooling: {
        declaredPackageManager: operation.packageManager,
        detectedSignals: operation.toolingSignals,
        rootPackageScripts: operation.rootPackageScripts,
      },
    },
    githubActions: {
      observedAt: operations.githubObservedAt ?? null,
      staleAfterDays: operations.githubStaleAfterDays ?? null,
      summary: actionVerification.summary,
      attention: actionVerification.attention,
      remote: operation.githubActionsMeta ?? null,
      workflows: operation.githubActions,
    },
    deployment: {
      kind: project.deployKind,
      deployed: project.portfolio.deployed,
      domains: project.domains ?? [],
      primaryUrl: publicUrl(project),
      domainProbePaths: project.domainProbePaths ?? {},
      targets: project.deployTargets ?? [],
      cloudflare: {
        deployments: cloudflareDeployments,
        resources: cloudflareResources,
      },
      otherProviders: {
        deployments: otherProviderDeployments,
        resources: otherProviderResources,
      },
    },
    sharing: {
      publicListing: project.public?.listing ?? 'hidden',
      maturity: project.public?.maturity ?? null,
      ready: project.portfolio.readyToBeShared,
      verifiedAt: project.portfolio.sharingReadiness?.verifiedAt ?? null,
      reason: project.portfolio.sharingReadiness?.reason ?? null,
      changelogUrl:
        project.public?.listing === 'maintained' &&
        project.public?.hasChangelog !== false &&
        publicUrl(project)
          ? `${publicUrl(project)}/changelog`
          : null,
      roadmapUrl: repositoryUrl(project) ? `${repositoryUrl(project)}/issues` : null,
      geoIdentity,
    },
    notes: {
      catalog: project.notes || null,
      infrastructure: infrastructure.notes ?? null,
    },
  };
}

export function serializeProjectDossier(dossier) {
  return YAML.stringify(dossier, {
    lineWidth: 0,
    blockQuote: 'literal',
  });
}

export function validateProjectDossierYaml(source, expectedProjectId) {
  const parsed = YAML.parse(source);
  if (parsed.schemaVersion !== 1) throw new Error(`${expectedProjectId}: invalid schemaVersion`);
  if (parsed.projectId !== expectedProjectId) {
    throw new Error(`${expectedProjectId}: YAML projectId mismatch`);
  }
  if (!['verified', 'partial'].includes(parsed.verification?.status)) {
    throw new Error(`${expectedProjectId}: invalid verification status`);
  }
  if (!parsed.verification?.meaning?.includes('does not mean')) {
    throw new Error(`${expectedProjectId}: verification meaning is required`);
  }
  if (parsed.verification?.checks?.ownerVoicePresent !== 'passed-verbatim') {
    throw new Error(`${expectedProjectId}: owner voice is not verified as verbatim`);
  }
  if (!parsed.ownerVoice?.whyVerbatim || !parsed.ownerVoice?.fullReviewVerbatim) {
    throw new Error(`${expectedProjectId}: verbatim owner why and review are required`);
  }
  if (!Array.isArray(parsed.githubActions?.workflows)) {
    throw new Error(`${expectedProjectId}: GitHub Actions workflows must be an array`);
  }
  if (!Array.isArray(parsed.deployment?.cloudflare?.resources)) {
    throw new Error(`${expectedProjectId}: Cloudflare resources must be an array`);
  }
  for (const resource of parsed.deployment.cloudflare.resources) {
    if (!resource.operationalOwner || !resource.attributionReason) {
      throw new Error(`${expectedProjectId}: Cloudflare resource lacks attribution`);
    }
  }
  if (!source.startsWith(`schemaVersion: 1\nprojectId: ${expectedProjectId}\nverification:\n`)) {
    throw new Error(`${expectedProjectId}: verification must remain at the top of the YAML file`);
  }
  return parsed;
}
