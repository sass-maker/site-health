export function evaluateOutcomeWindow({
  baseline,
  measured,
  direction = 'increase',
  minimumChange = 0,
  windowEnded = true,
  caveats = [],
}) {
  if (!windowEnded || !Number.isFinite(baseline) || !Number.isFinite(measured)) {
    return {
      verdict: 'not-yet-measurable',
      summary: 'The outcome window does not yet contain comparable measurements.',
      baseline: Number.isFinite(baseline) ? baseline : null,
      measured: Number.isFinite(measured) ? measured : null,
      caveats,
    };
  }
  const change = measured - baseline;
  const supported = direction === 'decrease' ? change <= -minimumChange : change >= minimumChange;
  const contradicted = direction === 'decrease' ? change > 0 : change < 0;
  const verdict = supported ? (caveats.length > 0 ? 'mixed' : 'supported') : contradicted ? 'unsupported' : 'mixed';
  return {
    verdict,
    summary:
      verdict === 'supported'
        ? 'The measured outcome supports the intended direction.'
        : verdict === 'unsupported'
          ? 'The measured outcome moved against the intended direction.'
          : 'The measurement is conclusive enough to review but does not cleanly support or reject the outcome.',
    baseline,
    measured,
    change,
    caveats,
  };
}

export function buildOwnerNotifications(projections, { now = new Date().toISOString(), blockerHours = 24 } = {}) {
  void now;
  void blockerHours;
  const items = [];
  for (const schedule of projections.schedules) {
    if (schedule.lastState !== 'failed') continue;
    items.push({
      key: `schedule/${schedule.id}/${schedule.lastRunAt ?? schedule.nextRunAt}`,
      kind: 'critical-work-failed',
      severity: 'critical',
      title: `${schedule.name} failed`,
      scheduleId: schedule.id,
    });
  }
  for (const recommendation of projections.recommendations ?? []) {
    if (
      recommendation.state !== 'open'
      || !['security', 'cost', 'data-loss'].includes(recommendation.risk)
    ) {
      continue;
    }
    items.push({
      key: `risk/${recommendation.id}/${recommendation.updatedAt}`,
      kind: 'material-risk',
      severity: 'critical',
      title: recommendation.title,
      projectId: recommendation.projectId,
      risk: recommendation.risk,
    });
  }
  return [...new Map(items.map((item) => [item.key, item])).values()];
}
