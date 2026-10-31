import { AppStoreError } from './store-core.mjs';
const ApiError = AppStoreError;
const record = (value) => { if (!value || typeof value !== 'object' || Array.isArray(value)) throw new AppStoreError('Expected an object.'); return value; };
const str = (value, max) => { if (typeof value !== 'string' || [...value].length > max) throw new AppStoreError('Invalid or oversized text.'); return value; };
export function parseAIInput(value         )          {
  const x = record(value);
  if (!['brainstorm', 'localize', 'listing'].includes(String(x.mode)))
    throw new ApiError('Choose a supported AI operation.');
  const result          = {
    mode: x.mode                   ,
    appName: str(x.appName, 200),
    description: str(x.description, 2000),
    seed: str(x.seed, 600),
    locale: str(x.locale, 40),
  };
  if (result.mode === 'listing') {
    const d = record(x.draft);
    result.draft = {
      name: str(d.name, 200),
      subtitle: str(d.subtitle, 200),
      keywords: str(d.keywords, 1000),
      description: str(d.description, 5000),
    };
  }
  return result;
}
export function parseAIOutput(value         , mode                 )           {
  const x = record(value);
  if (mode !== 'listing') {
    if (!Array.isArray(x.keywords) || x.keywords.length < 1 || x.keywords.length > 20)
      throw new ApiError(
        'AI returned invalid keyword suggestions. Existing work is unchanged.',
        502,
      );
    const keywords = x.keywords.map((v) => {
      const k = record(v);
      return { term: str(k.term, 100).trim(), rationale: str(k.rationale, 300) };
    });
    if (keywords.some((k) => !k.term))
      throw new ApiError('AI returned empty keywords. Existing work is unchanged.', 502);
    return { kind: 'keywords', keywords };
  }
  const out = {
    kind: 'listing'         ,
    name: str(x.name, 200),
    subtitle: str(x.subtitle, 200),
    keywords: str(x.keywords, 1000),
    description: str(x.description, 5000),
    notes: str(x.notes, 1000),
  };
  if (!out.name.trim())
    throw new ApiError('AI returned an empty listing. Existing work is unchanged.', 502);
  return out;
}
