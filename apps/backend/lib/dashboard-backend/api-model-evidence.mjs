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
      const models = [...new Set(available.map(row => row.model))].join(', ');
      return { projectId: project.id, id: `api-model:${intent}`, label: `API model · ${intent} mentions`,
        value: available.length ? mentioned / available.length * 100 : null, unit: '%',
        observedAt: available.map(row => row.observedAt).sort().at(-1) ?? null,
        source: 'free-ai.api-model', qualification: available.length ? 'proxy' : 'unknown',
        window: ids.size ? `${available.length}/${ids.size} configured answers available${models ? ` · ${models}` : ''}` : 'Panel not configured',
        gap: intent === 'brand' ? 'Name mention does not prove factual recognition. Review the saved answer. Not consumer-assistant visibility.'
          : 'One hypothesis question per intent, API models only. Consumer assistants, citations, later dates and demand validation are separate.',
      };
    });
  });
}
