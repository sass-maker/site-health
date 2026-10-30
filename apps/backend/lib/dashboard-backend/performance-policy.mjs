export const PERFORMANCE_TARGET = Object.freeze({
  psiScore: 95,
  lcpMilliseconds: 2500,
  samplesPerPreset: 5,
  presets: ['desktop', 'mobile-mid'],
  parallel: 1,
  concurrentTargets: 1,
  targetTimeoutMs: 5 * 2 * 90_000 + 120_000,
  portfolioTimeoutMs: 5 * 60 * 60_000,
});
