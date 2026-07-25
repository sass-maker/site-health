export type Ownership = "owned" | "competitor" | "third_party" | "unknown";

export interface BrandIdentity {
  brandUrl: string | null;
  competitorUrls?: Array<{ id: string; url: string }>;
}

export interface MentionRow {
  brandMentioned: boolean;
  brandRecommended?: boolean;
  competitorsMentioned: string[];
  citations: string[];
  brandCited?: boolean;
  platform?: string;
  persona?: string | null;
  createdAt: string;
}

export interface ShareOfVoice {
  windowDays: number;
  runs: number;
  brandMentionRate: number;
  brandRecommendationRate: number;
  brandCitationRate: number;
  competitorShare: Record<string, number>;
  citationShare: Record<string, number>;
}

export interface VisibilityScore {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  components: {
    mention: number;
    recommendation: number;
    citation: number;
    consistency: number;
  };
  platformsCovered: number;
  platformsTotal: number;
}

export interface PersonaVisibility {
  persona: string;
  runs: number;
  mentionRate: number;
  recommendationRate: number;
  citationRate: number;
}

export interface CitationGap {
  host: string;
  ownership: Ownership;
  citations: number;
  competitorId?: string;
}

export interface MatrixRow {
  prompt: string;
  promptKey?: string;
  platform: string;
  brandMentioned: boolean;
  brandRecommended: boolean;
  competitorsMentioned: string[];
  citations: string[];
  runAt: string;
}

export interface MatrixCell {
  prompt: string;
  platform: string;
  brandMentioned: boolean;
  brandRecommended: boolean;
  competitors: string[];
  citationsCount: number;
  runAt: string;
}

export interface TrendPoint {
  date: string;
  runs: number;
  mentionRate: number;
  recommendationRate: number;
  citedHosts: number;
}

export interface VisibilityRecommendation {
  priority: "high" | "medium" | "low";
  area: "presence" | "endorsement" | "citations" | "consistency" | "persona";
  title: string;
  detail: string;
}

export interface AiVisibilityReport {
  brandName: string;
  windowDays: number;
  generatedForRuns: number;
  score: VisibilityScore;
  platforms: string[];
  shareOfVoice: ShareOfVoice;
  perPersona: PersonaVisibility[];
  citationGaps: CitationGap[];
  matrix: MatrixCell[];
  trend: { direction: "up" | "down" | "flat"; deltaMentionRate: number };
  recommendations: VisibilityRecommendation[];
}

export function hostOf(url: string): string | null {
  try {
    return new URL(url).host.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function classifyOwnership(
  url: string,
  brand: BrandIdentity,
): { ownership: Ownership; competitorId?: string } {
  const host = hostOf(url);
  if (!host) return { ownership: "unknown" };
  const brandHost = brand.brandUrl ? hostOf(brand.brandUrl) : null;
  if (brandHost && host === brandHost) return { ownership: "owned" };
  for (const competitor of brand.competitorUrls ?? []) {
    if (hostOf(competitor.url) === host) {
      return { ownership: "competitor", competitorId: competitor.id };
    }
  }
  return { ownership: "third_party" };
}

export function computeShareOfVoice(rows: MentionRow[], windowDays: number): ShareOfVoice {
  const total = rows.length || 1;
  let mentions = 0;
  let recommendations = 0;
  let citations = 0;
  const competitorCounts: Record<string, number> = {};
  const citationCounts: Record<string, number> = {};
  for (const row of rows) {
    if (row.brandMentioned) mentions++;
    if (row.brandRecommended) recommendations++;
    if (row.brandCited) citations++;
    for (const competitor of row.competitorsMentioned) {
      competitorCounts[competitor] = (competitorCounts[competitor] ?? 0) + 1;
    }
    for (const url of row.citations) {
      const host = hostOf(url);
      if (host) citationCounts[host] = (citationCounts[host] ?? 0) + 1;
    }
  }
  const competitorShare = Object.fromEntries(
    Object.entries(competitorCounts).map(([name, count]) => [name, count / total]),
  );
  const totalCitations = Object.values(citationCounts).reduce((sum, count) => sum + count, 0) || 1;
  const citationShare = Object.fromEntries(
    Object.entries(citationCounts).map(([host, count]) => [host, count / totalCitations]),
  );
  return {
    windowDays,
    runs: rows.length,
    brandMentionRate: mentions / total,
    brandRecommendationRate: recommendations / total,
    brandCitationRate: citations / total,
    competitorShare,
    citationShare,
  };
}

export function perPlatformMentionRate(rows: MentionRow[]): Record<string, number> {
  const byPlatform = new Map<string, { total: number; mentioned: number }>();
  for (const row of rows) {
    const platform = row.platform ?? "custom";
    const current = byPlatform.get(platform) ?? { total: 0, mentioned: 0 };
    current.total++;
    if (row.brandMentioned) current.mentioned++;
    byPlatform.set(platform, current);
  }
  return Object.fromEntries(
    Array.from(byPlatform, ([platform, value]) => [
      platform,
      value.total ? value.mentioned / value.total : 0,
    ]),
  );
}

export function computeVisibilityScore(
  shareOfVoice: ShareOfVoice,
  rows: MentionRow[],
): VisibilityScore {
  const perPlatform = perPlatformMentionRate(rows);
  const platforms = Object.keys(perPlatform);
  const covered = platforms.filter((platform) => (perPlatform[platform] ?? 0) > 0).length;
  const consistency = platforms.length ? covered / platforms.length : 0;
  const components = {
    mention: shareOfVoice.brandMentionRate,
    recommendation: shareOfVoice.brandRecommendationRate,
    citation: shareOfVoice.brandCitationRate,
    consistency,
  };
  const score = Math.round(
    100 *
      (components.mention * 0.35 +
        components.recommendation * 0.3 +
        components.citation * 0.15 +
        components.consistency * 0.2),
  );
  const grade =
    score >= 80 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : score >= 20 ? "D" : "F";
  return {
    score,
    grade,
    components,
    platformsCovered: covered,
    platformsTotal: platforms.length,
  };
}

export function computePersonaVisibility(rows: MentionRow[]): PersonaVisibility[] {
  const byPersona = new Map<string, MentionRow[]>();
  for (const row of rows) {
    const persona = row.persona?.trim() || "general";
    const list = byPersona.get(persona) ?? [];
    list.push(row);
    byPersona.set(persona, list);
  }
  return Array.from(byPersona, ([persona, list]) => ({
    persona,
    runs: list.length,
    mentionRate: list.filter((row) => row.brandMentioned).length / list.length,
    recommendationRate: list.filter((row) => row.brandRecommended).length / list.length,
    citationRate: list.filter((row) => row.brandCited).length / list.length,
  })).sort((left, right) => left.mentionRate - right.mentionRate);
}

export function computeCitationGaps(
  rows: MentionRow[],
  brand: BrandIdentity,
  limit = 15,
): CitationGap[] {
  const counts = new Map<
    string,
    { count: number; ownership: Ownership; competitorId?: string }
  >();
  for (const row of rows) {
    for (const url of row.citations) {
      const host = hostOf(url);
      if (!host) continue;
      const classification = classifyOwnership(url, brand);
      if (classification.ownership === "owned") continue;
      const current = counts.get(host) ?? {
        count: 0,
        ownership: classification.ownership,
        ...(classification.competitorId
          ? { competitorId: classification.competitorId }
          : {}),
      };
      current.count++;
      counts.set(host, current);
    }
  }
  return Array.from(counts, ([host, value]) => ({
    host,
    ownership: value.ownership,
    citations: value.count,
    ...(value.competitorId ? { competitorId: value.competitorId } : {}),
  }))
    .sort((left, right) => right.citations - left.citations)
    .slice(0, limit);
}

export function buildVisibilityMatrix(rows: MatrixRow[]): MatrixCell[] {
  const byKey = new Map<string, MatrixCell>();
  for (const row of rows) {
    const key = `${row.promptKey ?? row.prompt}::${row.platform}`;
    const existing = byKey.get(key);
    if (!existing || Date.parse(row.runAt) > Date.parse(existing.runAt)) {
      byKey.set(key, {
        prompt: row.prompt,
        platform: row.platform,
        brandMentioned: row.brandMentioned,
        brandRecommended: row.brandRecommended,
        competitors: row.competitorsMentioned,
        citationsCount: row.citations.length,
        runAt: row.runAt,
      });
    }
  }
  return Array.from(byKey.values());
}

export function computeTrends(
  rows: MentionRow[],
  windowDays: number,
  nowMs: number,
): TrendPoint[] {
  const cutoff = nowMs - windowDays * 24 * 60 * 60 * 1000;
  const byDay = new Map<string, MentionRow[]>();
  for (const row of rows) {
    const timestamp = Date.parse(row.createdAt);
    if (!Number.isFinite(timestamp) || timestamp < cutoff) continue;
    const day = new Date(timestamp).toISOString().slice(0, 10);
    const list = byDay.get(day) ?? [];
    list.push(row);
    byDay.set(day, list);
  }
  return Array.from(byDay.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, list]) => {
      const hosts = new Set(
        list.flatMap((row) => row.citations.map(hostOf).filter((host): host is string => !!host)),
      );
      return {
        date,
        runs: list.length,
        mentionRate: list.filter((row) => row.brandMentioned).length / list.length,
        recommendationRate: list.filter((row) => row.brandRecommended).length / list.length,
        citedHosts: hosts.size,
      };
    });
}

function percentage(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export function buildVisibilityRecommendations(input: {
  score: VisibilityScore;
  shareOfVoice: ShareOfVoice;
  perPersona: PersonaVisibility[];
  citationGaps: CitationGap[];
}): VisibilityRecommendation[] {
  const recommendations: VisibilityRecommendation[] = [];
  const { components } = input.score;
  if (components.mention < 0.5) {
    recommendations.push({
      priority: "high",
      area: "presence",
      title: "AI rarely names you",
      detail: `Brand appears in only ${percentage(components.mention)} of answers. Buyers researching your category mostly do not see you.`,
    });
  }
  if (components.recommendation < 0.3 && components.mention >= 0.5) {
    recommendations.push({
      priority: "high",
      area: "endorsement",
      title: "Mentioned but not recommended",
      detail: `You are named ${percentage(components.mention)} of the time but actively recommended only ${percentage(components.recommendation)}.`,
    });
  }
  const topCompetitor = Object.entries(input.shareOfVoice.competitorShare).sort(
    (left, right) => right[1] - left[1],
  )[0];
  if (topCompetitor && topCompetitor[1] > input.shareOfVoice.brandMentionRate) {
    recommendations.push({
      priority: "high",
      area: "presence",
      title: "A competitor out-appears you",
      detail: `"${topCompetitor[0]}" shows up in ${percentage(topCompetitor[1])} of answers vs your ${percentage(input.shareOfVoice.brandMentionRate)}.`,
    });
  }
  const topGaps = input.citationGaps.slice(0, 3).map((gap) => gap.host);
  if (topGaps.length) {
    recommendations.push({
      priority: components.citation < 0.2 ? "high" : "medium",
      area: "citations",
      title: "Get represented on the sources AI trusts",
      detail: `AI most often cites ${topGaps.join(", ")} rather than your site.`,
    });
  }
  if (input.score.platformsTotal > 1 && components.consistency < 1) {
    const missing = input.score.platformsTotal - input.score.platformsCovered;
    recommendations.push({
      priority: "medium",
      area: "consistency",
      title: "Invisible on some engines",
      detail: `You are absent from ${missing} of ${input.score.platformsTotal} AI engines checked.`,
    });
  }
  const weakPersona = input.perPersona.find(
    (persona) => persona.persona !== "general" && persona.mentionRate < 0.4,
  );
  if (weakPersona) {
    recommendations.push({
      priority: "medium",
      area: "persona",
      title: `Weak with the "${weakPersona.persona}" persona`,
      detail: `For "${weakPersona.persona}" questions the brand surfaces only ${percentage(weakPersona.mentionRate)} of the time.`,
    });
  }
  if (!recommendations.length) {
    recommendations.push({
      priority: "low",
      area: "presence",
      title: "Strong AI visibility — hold the line",
      detail:
        "Presence, endorsement, and citation rates are healthy across engines. Keep source coverage fresh.",
    });
  }
  const priority = { high: 0, medium: 1, low: 2 };
  return recommendations.sort(
    (left, right) => priority[left.priority] - priority[right.priority],
  );
}

export function composeVisibilityReport(input: {
  brandName: string;
  windowDays: number;
  score: VisibilityScore;
  shareOfVoice: ShareOfVoice;
  perPersona: PersonaVisibility[];
  citationGaps: CitationGap[];
  matrix: MatrixCell[];
  trend: TrendPoint[];
  platforms: string[];
}): AiVisibilityReport {
  const first = input.trend[0]?.mentionRate;
  const last = input.trend.at(-1)?.mentionRate;
  const delta = first === undefined || last === undefined ? 0 : last - first;
  return {
    brandName: input.brandName,
    windowDays: input.windowDays,
    generatedForRuns: input.shareOfVoice.runs,
    score: input.score,
    platforms: input.platforms,
    shareOfVoice: input.shareOfVoice,
    perPersona: input.perPersona,
    citationGaps: input.citationGaps,
    matrix: input.matrix,
    trend: {
      direction: delta > 0.05 ? "up" : delta < -0.05 ? "down" : "flat",
      deltaMentionRate: delta,
    },
    recommendations: buildVisibilityRecommendations(input),
  };
}
