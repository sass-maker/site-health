import type {
  BrandSubject,
  CompetitorMention,
  MentionAnalysis,
  MentionSentiment,
} from "./types.js";

export function buildMentionJudgePrompt(subject: BrandSubject, responseText: string): string {
  const aliases = (subject.brandAliases ?? []).filter(Boolean);
  const competitorNames = (subject.competitors ?? []).map((item) => item.name).filter(Boolean);
  return [
    "You are grading how an AI assistant's answer portrays a specific brand, for a GEO (generative engine optimization) visibility report.",
    "",
    `BRAND: ${subject.brandName}${aliases.length ? ` (also: ${aliases.join(", ")})` : ""}`,
    subject.brandUrl ? `BRAND SITE: ${subject.brandUrl}` : "BRAND SITE: (none)",
    `COMPETITORS: ${competitorNames.length ? competitorNames.join(", ") : "(none provided)"}`,
    "",
    "AI ANSWER TO GRADE:",
    '"""',
    responseText.slice(0, 6000),
    '"""',
    "",
    "Return ONLY a JSON object (no prose, no markdown fence) with exactly these keys:",
    "{",
    '  "brandMentioned": boolean,',
    '  "brandRecommended": boolean,',
    '  "brandSentiment": "positive"|"neutral"|"negative"|null,',
    '  "brandPosition": number|null,',
    '  "competitorsMentioned": [ { "name": string, "mentioned": boolean, "position": number|null } ],',
    '  "citations": string[],',
    '  "brandCited": boolean,',
    '  "reasoning": string',
    "}",
    "Judge only what the text supports. Do not invent citations. If the brand is absent, brandMentioned=false and sentiment=null.",
  ].join("\n");
}

export function extractJsonObject(raw: string): string | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] ?? raw;
  const start = candidate.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < candidate.length; index++) {
    const character = candidate[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') inString = true;
    else if (character === "{") depth++;
    else if (character === "}") {
      depth--;
      if (depth === 0) return candidate.slice(start, index + 1);
    }
  }
  return null;
}

const SENTIMENTS: MentionSentiment[] = ["positive", "neutral", "negative"];

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function parseMentionVerdict(
  raw: string,
  knownCompetitors: Array<{ name: string }> = [],
): MentionAnalysis | null {
  const json = extractJsonObject(raw);
  if (!json) return null;
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;

  const brandMentioned = parsed.brandMentioned === true;
  const sentiment =
    typeof parsed.brandSentiment === "string" &&
    SENTIMENTS.includes(parsed.brandSentiment as MentionSentiment)
      ? (parsed.brandSentiment as MentionSentiment)
      : null;
  const citations = Array.isArray(parsed.citations)
    ? Array.from(
        new Set(parsed.citations.filter((value): value is string => typeof value === "string")),
      )
    : [];

  const judged = Array.isArray(parsed.competitorsMentioned)
    ? parsed.competitorsMentioned
    : [];
  const byName = new Map<string, CompetitorMention>();
  for (const item of judged) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    if (typeof record.name !== "string") continue;
    byName.set(record.name.toLowerCase(), {
      name: record.name,
      mentioned: record.mentioned === true,
      position: numberOrNull(record.position),
    });
  }
  const competitorsMentioned = knownCompetitors.length
    ? knownCompetitors.map(
        (competitor) =>
          byName.get(competitor.name.toLowerCase()) ?? {
            name: competitor.name,
            mentioned: false,
            position: null,
          },
      )
    : Array.from(byName.values());

  return {
    brandMentioned,
    brandRecommended: parsed.brandRecommended === true,
    brandSentiment: brandMentioned ? sentiment : null,
    brandPosition: numberOrNull(parsed.brandPosition),
    competitorsMentioned,
    citations,
    brandCited: parsed.brandCited === true,
    reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning.slice(0, 500) : "",
    provenance: "judge",
  };
}
