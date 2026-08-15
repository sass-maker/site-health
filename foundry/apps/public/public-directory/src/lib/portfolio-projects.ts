import projectRegistry from '../../../../../ops/config/projects.json';

interface RegistryProject {
  id: string;
  name: string;
  lifecycle: string;
  tier?: 'focus' | 'active' | 'secondary' | 'parked';
  portfolio?: {
    priority?: 'P1' | 'P2' | 'P4';
  };
  domains?: string[];
  public?: {
    listing?: string;
    name?: string;
    description?: string;
    category?: string;
    pillarId?: string;
    spotlight?: boolean;
    maturity?: string;
  };
}

export const portfolioProjects = (projectRegistry.projects as RegistryProject[])
  .filter(
    (project) =>
      project.lifecycle === 'maintained' &&
      project.public?.listing === 'maintained' &&
      project.domains?.[0]
  )
  .map(({ id, name, tier, portfolio, domains, public: publicMetadata }) => ({
    id,
    name: publicMetadata?.name ?? name,
    url: `https://${domains?.[0]}`,
    description: publicMetadata?.description,
    tier,
    priority: portfolio?.priority,
    category: publicMetadata?.category,
    maturity: publicMetadata?.maturity,
    spotlight: publicMetadata?.spotlight,
    pillarId: publicMetadata?.pillarId,
    domains,
  }));
