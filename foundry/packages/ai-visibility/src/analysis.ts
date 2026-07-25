import type {
  BrandSubject,
  CompetitorMention,
  MentionAnalysis,
  MentionSentiment,
} from "./types.js";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function wordRegex(term: string): RegExp {
  return new RegExp(`\\b${escapeRegExp(term)}\\b`, "i");
}

function findListPosition(text: string, terms: string[]): number | null {
  const listItemRegex = /^\s*(\d+)[.)]\s*\**\s*([^\n]+)/gm;
  let match: RegExpExecArray | null;
  while ((match = listItemRegex.exec(text)) !== null) {
    if (terms.some((term) => wordRegex(term).test(match?.[2] ?? ""))) {
      return Number.parseInt(match[1] ?? "0", 10) || null;
    }
  }
  return null;
}

function detectSentiment(text: string, brandTerms: string[]): MentionSentiment {
  const positiveWords = [
    "best",
    "great",
    "excellent",
    "top",
    "leading",
    "popular",
    "powerful",
    "recommended",
    "reliable",
    "favorite",
    "preferred",
  ];
  const negativeWords = [
    "worst",
    "bad",
    "poor",
    "lacking",
    "limited",
    "expensive",
    "outdated",
    "difficult",
    "slow",
    "unreliable",
  ];
  const context = text
    .split(/[.!?]+/)
    .filter((sentence) => brandTerms.some((term) => wordRegex(term).test(sentence)))
    .join(" ")
    .toLowerCase();
  const positiveCount = positiveWords.filter((word) => context.includes(word)).length;
  const negativeCount = negativeWords.filter((word) => context.includes(word)).length;
  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  return "neutral";
}

function detectRecommended(text: string, brandTerms: string[]): boolean {
  const recommendation =
    /(recommend|best|top choice|go with|ideal|great choice|preferred|our pick|the winner)/i;
  return text
    .split(/[.!?]+/)
    .some(
      (sentence) =>
        brandTerms.some((term) => wordRegex(term).test(sentence)) &&
        recommendation.test(sentence),
    );
}

export function normalizeCitations(text: string): string[] {
  return Array.from(new Set(text.match(/https?:\/\/[^\s)>\]"',]+/g) ?? []));
}

export function analyzeMentionResponse(
  input: BrandSubject & { text: string },
): MentionAnalysis {
  const brandTerms = [input.brandName, ...(input.brandAliases ?? [])].filter(Boolean);
  const brandMentioned = brandTerms.some((term) => wordRegex(term).test(input.text));
  const competitorsMentioned: CompetitorMention[] = (input.competitors ?? []).map(
    (competitor) => ({
      name: competitor.name,
      mentioned: wordRegex(competitor.name).test(input.text),
      position: findListPosition(input.text, [competitor.name]),
    }),
  );
  const citations = normalizeCitations(input.text);
  const normalizedBrandUrl = input.brandUrl
    ?.toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  return {
    brandMentioned,
    brandRecommended: brandMentioned && detectRecommended(input.text, brandTerms),
    brandSentiment: brandMentioned ? detectSentiment(input.text, brandTerms) : null,
    brandPosition: findListPosition(input.text, brandTerms),
    competitorsMentioned,
    citations,
    brandCited: normalizedBrandUrl
      ? citations.some((url) => url.toLowerCase().includes(normalizedBrandUrl))
      : false,
    reasoning: "",
    provenance: "deterministic-fallback",
  };
}

export interface MentionVisibilityPreview {
  brandMentioned: boolean;
  brandSentiment: MentionSentiment | null;
  brandPosition: number | null;
  competitorsMentioned: CompetitorMention[];
  citations: string[];
  brandCited: boolean;
}

export function analyzeMentionVisibility(
  input: BrandSubject & { text: string },
): MentionVisibilityPreview {
  const brandTerms = [input.brandName, ...(input.brandAliases ?? [])].filter(Boolean);
  const brandMentioned = brandTerms.some((term) => wordRegex(term).test(input.text));
  const positiveWords = [
    "best",
    "great",
    "excellent",
    "top",
    "leading",
    "popular",
    "powerful",
    "recommended",
    "reliable",
    "preferred",
  ];
  const negativeWords = [
    "worst",
    "bad",
    "poor",
    "lacking",
    "limited",
    "expensive",
    "outdated",
    "difficult",
    "slow",
    "unreliable",
  ];
  const context = input.text
    .split(/[.!?]+/)
    .filter((sentence) => brandTerms.some((term) => wordRegex(term).test(sentence)))
    .join(" ")
    .toLowerCase();
  const positiveCount = positiveWords.filter((word) => context.includes(word)).length;
  const negativeCount = negativeWords.filter((word) => context.includes(word)).length;
  const citations = normalizeCitations(input.text);
  const normalizedBrandUrl = input.brandUrl
    ?.toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  return {
    brandMentioned,
    brandSentiment: brandMentioned
      ? positiveCount > negativeCount
        ? "positive"
        : negativeCount > positiveCount
          ? "negative"
          : "neutral"
      : null,
    brandPosition: findListPosition(input.text, brandTerms),
    competitorsMentioned: (input.competitors ?? []).map((competitor) => ({
      name: competitor.name,
      mentioned: wordRegex(competitor.name).test(input.text),
      position: findListPosition(input.text, [competitor.name]),
    })),
    citations,
    brandCited: normalizedBrandUrl
      ? citations.some((url) => url.toLowerCase().includes(normalizedBrandUrl))
      : false,
  };
}
