export type AIInput = {
  mode: 'brainstorm' | 'localize' | 'listing';
  appName: string;
  description: string;
  seed: string;
  locale: string;
  draft?: { name: string; subtitle: string; keywords: string; description: string };
};
export type AIOutput =
  | { kind: 'keywords'; keywords: { term: string; rationale: string }[] }
  | {
      kind: 'listing';
      name: string;
      subtitle: string;
      keywords: string;
      description: string;
      notes: string;
    };
