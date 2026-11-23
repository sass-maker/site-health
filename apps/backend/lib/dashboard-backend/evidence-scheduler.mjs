// Each lane owns its cadence and failure state. An unavailable source cannot
// stop independent collectors or leave an overlapping invocation behind.
export function startEvidenceScheduler({
  lanes, now = Date.now, setTimer = setInterval, clearTimer = clearInterval,
  pollMs = 60_000, onError = () => {},
}) {
  const states = new Map(lanes.map((lane) => [lane.id, { running: false, nextAt: 0, scheduleKey: null, initial: true }]));
  let stopped = false;
  const pending = new Set();
  const tick = () => {
    if (stopped) return;
    for (const lane of lanes) {
      const state = states.get(lane.id);
      if (typeof lane.schedule === 'function') {
        try {
          const schedule = lane.schedule(now(), state.initial);
          state.initial = false;
          const key = schedule?.key ?? null;
          if (key !== state.scheduleKey) {
            state.scheduleKey = key;
            state.nextAt = Number.isFinite(schedule?.at) ? schedule.at : 0;
          }
        } catch {
          // A missing hint must not erase existing lane backoff or block siblings.
          state.initial = false;
          state.scheduleKey = null;
        }
      }
      if (state.running || now() < state.nextAt) continue;
      state.running = true;
      const job = Promise.resolve().then(() => lane.run()).catch((error) => {
        onError(lane.id, error);
      }).finally(() => {
        state.running = false;
        state.nextAt = now() + lane.intervalMs;
        pending.delete(job);
      });
      pending.add(job);
    }
  };
  const timer = setTimer(tick, pollMs);
  timer.unref?.();
  return {
    tick,
    async stop() { stopped = true; clearTimer(timer); await Promise.allSettled([...pending]); },
  };
}
