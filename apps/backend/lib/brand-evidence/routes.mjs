import { createBrandEvidenceRoutes as createCoreRoutes } from './routes-core.mjs';
import { refreshBrandEvidence } from './scheduler.mjs';
import { prepareCommunityBrief } from './community-brief.mjs';
export function createBrandEvidenceRoutes(options) {
  return createCoreRoutes({ refreshBrandEvidence, prepareCommunityBrief, ...options });
}
