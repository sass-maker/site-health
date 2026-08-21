function byTime(left, right) {
  if (Number.isInteger(left.sequence) && Number.isInteger(right.sequence)) {
    return left.sequence - right.sequence;
  }
  return left.occurredAt.localeCompare(right.occurredAt)
    || left.recordedAt.localeCompare(right.recordedAt)
    || left.id.localeCompare(right.id);
}

function freshness(pointer, now) {
  if (!pointer) return 'unverified';
  if (pointer.state === 'unavailable' || pointer.state === 'stale') return pointer.state;
  if (pointer.freshUntil && Date.parse(pointer.freshUntil) < Date.parse(now)) return 'stale';
  return pointer.state;
}

export function buildProjections(inputEvents, { now = new Date().toISOString(), projects = [] } = {}) {
  const visibilityRuns = new Map();
  for (const event of [...inputEvents].sort(byTime)) {
    if (event.type !== 'visibility.run-recorded') continue;
    const pointer = event.evidence[0] ?? null;
    const history = visibilityRuns.get(event.projectId) ?? [];
    history.push({
      runId: event.payload.runId,
      promptSetId: event.payload.promptSetId ?? null,
      evidenceMode: event.payload.evidenceMode ?? null,
      projectId: event.projectId,
      observedAt: event.occurredAt,
      freshUntil: pointer?.freshUntil ?? null,
      freshness: freshness(pointer, now),
      coverage: event.payload.coverage,
      cost: event.payload.cost,
      metrics: event.payload.metrics,
      citations: event.payload.citations,
      attempts: event.payload.attempts,
      comparison: event.payload.comparison ?? null,
      evidence: event.evidence,
    });
    visibilityRuns.set(event.projectId, history);
  }

  return {
    generatedAt: now,
    projects: projects.map((project) => ({ ...project })),
    aiVisibility: {
      generatedAt: now,
      projects: [...visibilityRuns.entries()]
        .map(([projectId, history]) => {
          const ordered = [...history].sort((left, right) => right.observedAt.localeCompare(left.observedAt));
          return {
            projectId,
            latest: ordered[0],
            previous: ordered[1] ?? null,
            comparison: ordered[0]?.comparison ?? null,
            history: ordered,
          };
        })
        .sort((left, right) => left.projectId.localeCompare(right.projectId)),
    },
  };
}
