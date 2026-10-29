// Only aggregates leave the private brand store. Intent panels never combine
// direct-name prompting with neutral discovery or consumer-assistant captures.
export function apiModelObservations(projects, store) {
  return projects.flatMap(project => {
    const prompts = store.listPrompts(project.id);
    const observations = store.apiModelPanelObservations(project.id);
    return ['brand', 'category', 'problem', 'comparison', 'use-case'].map(intent => {
      const ids = new Set(prompts.filter(row => row.category === `panel-v1:${intent}`).map(row => row.id));
      const available = observations.filter(row => ids.has(row.promptId) && row.status === 'completed');
      const mentioned = available.filter(row => row.brandMentioned).length;
      const dates = available.map(row => row.observedAt).filter(Boolean).sort();
      const dateRange = dates.length && dates[0] !== dates.at(-1) ? ` · answers dated ${dates[0].slice(0, 10)} to ${dates.at(-1).slice(0, 10)}` : '';
      const models = [...new Set(available.map(row => row.model))].join(', ');
      return { projectId: project.id, id: `api-model:${intent}`, label: `API model · ${intent} mentions`,
        value: available.length ? mentioned / available.length * 100 : null, unit: '%',
        observedAt: dates[0] ?? null,
        context: { method: 'API model hypothesis panel; not consumer assistants', intent, numerator: mentioned, denominator: available.length, completed: available.length, configured: ids.size, models, detail: 'Exploratory sample; one hypothesis question per intent' },
        source: 'free-ai.api-model', qualification: available.length ? 'proxy' : 'unknown',
        window: ids.size ? `${available.length}/${ids.size} configured answers available${models ? ` · ${models}` : ''}${dateRange}` : 'Panel not configured',
        gap: intent === 'brand' ? 'Name mention does not prove factual recognition. Review the saved answer. Not consumer-assistant visibility.'
          : 'One hypothesis question per intent, API models only. Consumer assistants, citations, later dates and demand validation are separate.',
      };
    });
  });
}
