// Deterministic answer analysis carried over from MentionPilot's mention checks
// (High-Signal-App/mentionpilot workers/api/src/lib/ai-engine.ts @ 4d7a23e).
// It reads only a completed answer; a failed provider call is never analysed.

const POSITIVE_WORDS = [
  'best', 'great', 'excellent', 'top', 'leading', 'popular', 'powerful',
  'recommended', 'outstanding', 'innovative', 'reliable', 'favorite', 'preferred',
];
const NEGATIVE_WORDS = [
  'worst', 'bad', 'poor', 'lacking', 'limited', 'expensive', 'outdated',
  'difficult', 'slow', 'unreliable', 'disappointing',
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function termPattern(term, flags = 'i') {
  return new RegExp(`\\b${escapeRegExp(term)}\\b`, flags);
}

export function analyzeAnswer(text, { brandName, aliases = [], brandUrl = null, competitors = [] }) {
  const answer = String(text ?? '');
  const terms = [brandName, ...aliases].filter((term) => typeof term === 'string' && term.trim());
  const brandMentioned = terms.some((term) => termPattern(term).test(answer));

  let brandPosition = null;
  const listItem = /^\s*(\d+)[.)]\s*\**\s*([^\n]+)/gm;
  let match;
  while ((match = listItem.exec(answer)) !== null) {
    const item = match[2];
    if (terms.some((term) => termPattern(term).test(item))) {
      brandPosition = Number.parseInt(match[1], 10);
      break;
    }
  }

  let brandSentiment = null;
  if (brandMentioned) {
    const context = answer
      .split(/[.!?]+/)
      .filter((sentence) => terms.some((term) => termPattern(term).test(sentence)))
      .join(' ')
      .toLowerCase();
    const positive = POSITIVE_WORDS.filter((word) => context.includes(word)).length;
    const negative = NEGATIVE_WORDS.filter((word) => context.includes(word)).length;
    brandSentiment = positive > negative ? 'positive' : negative > positive ? 'negative' : 'neutral';
  }

  const competitorsMentioned = competitors
    .filter((competitor) => typeof competitor?.name === 'string' && competitor.name.trim())
    .map((competitor) => {
      const escaped = escapeRegExp(competitor.name);
      const mentioned = new RegExp(`\\b${escaped}\\b`, 'i').test(answer);
      let position = null;
      if (mentioned) {
        const listMatch = answer.match(new RegExp(`^\\s*(\\d+)[.)]\\s*\\**\\s*[^\\n]*\\b${escaped}\\b`, 'im'));
        if (listMatch) position = Number.parseInt(listMatch[1], 10);
      }
      return { name: competitor.name, mentioned, position };
    });

  const citations = [...new Set(answer.match(/https?:\/\/[^\s)>\]"',]+/g) ?? [])];
  const ownHost = brandUrl
    ? String(brandUrl).toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
    : null;
  const brandCited = ownHost ? citations.some((url) => url.toLowerCase().includes(ownHost)) : false;

  return {
    brandMentioned,
    brandPosition,
    brandSentiment,
    competitorsMentioned,
    citations,
    brandCited,
  };
}
