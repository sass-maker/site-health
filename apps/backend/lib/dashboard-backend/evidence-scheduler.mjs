// Each lane owns its cadence and failure state. An unavailable source cannot
// stop independent collectors or leave an overlapping invocation behind.
export function startEvidenceScheduler({
  lanes, now = Date.now, setTimer = setInterval, clearTimer = clearInterval,
  pollMs = 60_000, onError = () => {},
}) {
  const states = new Map(lanes.map((lane) => [lane.id, { running: false, nextAt: 0 }]));
  let stopped = false;
  const pending = new Set();
  const tick = () => {
    if (stopped) return;
    for (const lane of lanes) {
      const state = states.get(lane.id);
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
