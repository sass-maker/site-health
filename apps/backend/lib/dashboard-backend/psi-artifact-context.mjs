import { execFileSync } from 'node:child_process';
import { constants, closeSync, fstatSync, openSync, readSync, realpathSync, statSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const MAX_CACHE_BYTES = 8 * 1024 * 1024;
// Fits both presets across the current portfolio without retaining old history.
const MAX_CACHE_ENTRIES = 96;
const MAX_RUNS = 5;
const cache = new Map();
const unknown = 'Capture metadata unknown; warning coverage unknown; observed timings unknown.';
const finite = value => typeof value === 'number' && Number.isFinite(value);
const record = value => value && typeof value === 'object' && !Array.isArray(value);

function inside(root, path) {
  const child = relative(root, path);
  return child !== '' && !isAbsolute(child) && child !== '..' && !child.startsWith(`..${sep}`);
}

// Paths come only from the selected runs' existing insight records. Never walk
// artifact directories or follow a pointer outside the canonical artifact root.
function readBundle(home, path) {
  let fd;
  try {
    const expectedRoot = resolve(home, '.psi-swarm/artifacts');
    if (!isAbsolute(path) || !inside(expectedRoot, resolve(path))) return null;
    const root = realpathSync(expectedRoot);
    const canonical = realpathSync(path);
    if (!inside(root, canonical)) return null;
    const stat = statSync(canonical);
    if (!stat.isFile() || stat.size > MAX_FILE_BYTES) return null;
    const key = `${stat.dev}:${stat.ino}:${stat.size}:${stat.mtimeMs}:${stat.ctimeMs}`;
    const cached = cache.get(canonical);
    if (cached?.key === key) return cached.bundle;
    fd = openSync(canonical, constants.O_RDONLY | constants.O_NOFOLLOW);
    const opened = fstatSync(fd);
    if (opened.dev !== stat.dev || opened.ino !== stat.ino || opened.size !== stat.size) return null;
    // A fixed buffer also bounds a file that grows after stat; reject the extra byte.
    const buffer = Buffer.alloc(stat.size + 1);
    let length = 0;
    while (length < buffer.length) {
      const count = readSync(fd, buffer, length, buffer.length - length, null);
      if (!count) break;
      length += count;
    }
    if (length !== stat.size) return null;
    const parsed = JSON.parse(buffer.subarray(0, length).toString('utf8'));
    if (!record(parsed) || !Array.isArray(parsed.metrics) || !Array.isArray(parsed.runMetadata)
      || parsed.metrics.length > 100 || parsed.runMetadata.length > 100) return null;
    // Cache bounded owner bundles without audits. Nested metrics/metadata may
    // retain unknown fields; only the allowlisted summary below reaches the API.
    const bundle = { url: parsed.url, tag: parsed.tag ?? null, preset: parsed.preset,
      metrics: parsed.metrics, runMetadata: parsed.runMetadata };
    cache.delete(canonical);
    cache.set(canonical, { key, bytes: stat.size, bundle });
    while (cache.size > MAX_CACHE_ENTRIES
      || [...cache.values()].reduce((sum, entry) => sum + entry.bytes, 0) > MAX_CACHE_BYTES) {
      cache.delete(cache.keys().next().value);
    }
    return bundle;
  } catch { return null; }
  finally { if (fd !== undefined) { try { closeSync(fd); } catch {} } }
}

function matchingMetadata(bundle, run) {
  if (!bundle || bundle.url !== run.url || bundle.preset !== run.preset
    || bundle.tag !== (run.tag ?? null)) return null;
  const matches = bundle.runMetadata.filter(item => item?.startedAt === run.startedAt
    && item?.finishedAt === run.finishedAt);
  if (matches.length !== 1) return null;
  const item = matches[0];
  if (!Number.isInteger(item.metricsIndex) || item.metricsIndex < 0
    || item.metricsIndex >= bundle.metrics.length
    || bundle.runMetadata.filter(other => other?.metricsIndex === item.metricsIndex).length !== 1) return null;
  const metric = bundle.metrics[item.metricsIndex];
  if (metric?.performance_score !== run.score || metric?.lcp !== run.lcp
    || item.provenance?.schemaVersion !== 1) return null;
  return item.provenance;
}

const version = value => typeof value === 'string' && /^v?\d+(?:\.\d+){0,3}$/.test(value) ? value : 'unknown';
function method(provenance) {
  const browser = typeof provenance.browserUserAgent === 'string'
    ? /(?:HeadlessChrome|Chrome|Chromium)\/([\d.]+)/.exec(provenance.browserUserAgent)?.[1] : undefined;
  const screen = record(provenance.screenEmulation) ? provenance.screenEmulation : {};
  const throttle = record(provenance.throttling) ? provenance.throttling : {};
  const mode = ['simulate', 'devtools', 'provided'].includes(provenance.throttlingMethod) ? provenance.throttlingMethod : 'unknown';
  const allowedFlags = ['--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage'];
  const flags = Array.isArray(provenance.chromeFlags) && provenance.chromeFlags.every(flag => allowedFlags.includes(flag))
    ? provenance.chromeFlags.join(',') : 'unknown';
  return [`LH ${version(provenance.lighthouseVersion)}`, `Chrome UA ${version(browser)}`, `Node ${version(provenance.nodeVersion)}`,
    `method ${mode}${mode === 'simulate' ? ' (scored timings simulated)' : ''}`,
    `form ${['mobile', 'desktop'].includes(provenance.formFactor) ? provenance.formFactor : 'unknown'}`,
    `screen ${['width', 'height', 'deviceScaleFactor', 'mobile', 'disabled'].map(key => `${key}=${typeof screen[key] === 'boolean' || finite(screen[key]) ? screen[key] : '?'}`).join(',')}`,
    `throttle ${['rttMs', 'throughputKbps', 'requestLatencyMs', 'downloadThroughputKbps', 'uploadThroughputKbps', 'cpuSlowdownMultiplier'].map(key => `${key}=${finite(throttle[key]) ? throttle[key] : '?'}`).join(',')}`,
    `Requested Chrome flags ${flags}`].join('; ');
}

function safeWarning(text) {
  const normalized = text.replace(/[\u0000-\u001f]/g, ' ');
  // Header/token formats vary; omit the whole warning rather than guessing
  // where a credential ends. Counts and other warning messages remain intact.
  if (/\b(?:authorization|proxy-authorization|bearer|api[-_]?key|(?:access|refresh)[-_]?token|password|client[-_]?secret|cookie)\b/i.test(normalized)) {
    return '[credential-bearing warning redacted]';
  }
  return normalized.replace(/(?:\b[a-z][a-z\d+.-]*:)?\/\/[^\s<>"']+/gi, value => {
    try {
      const url = new URL(value, 'https://redaction.invalid');
      if (!['https:', 'http:'].includes(url.protocol)) return '[URL redacted]';
      return `${url.origin}${url.pathname}${url.search ? '?[query redacted]' : ''}${url.hash ? '#[fragment redacted]' : ''}`;
    } catch { return '[URL redacted]'; }
  }).replace(/\/(?:Users|home|private|tmp|var|Volumes)\/[^\s<>"']+/g, '[local path]').slice(0, 300);
}

function summarize(metadata, total) {
  if (!metadata.length) return unknown;
  const methods = [...new Set(metadata.map(method))];
  const warnings = metadata.filter(item => Array.isArray(item.runWarnings)
    && item.runWarnings.length <= 100 && item.runWarnings.every(warning => typeof warning === 'string'));
  const warningCount = warnings.reduce((sum, item) => sum + item.runWarnings.length, 0);
  const warningText = [...new Set(warnings.flatMap(item => item.runWarnings))].slice(0, 5)
    .map(safeWarning);
  const warningDetail = warnings.length
    ? `Warnings: ${warningCount} captured across ${warnings.length}/${total} samples${warnings.length < total ? '; remaining warning coverage unknown' : ''}${warningText.length ? `; ${warningText.join(' | ')}` : ''}`
    : `Warning coverage unknown (0/${total} captured)`;
  const details = [`Capture metadata ${metadata.length}/${total}${metadata.length < total ? ' (partial; remainder unknown)' : ''}`,
    `${methods.length > 1 ? 'Mixed measurement configurations: ' : 'Measurement configuration: '}${methods.join(' | ')}`,
    warningDetail];
  const benchmarks = metadata.map(item => item.benchmarkIndex).filter(finite);
  details.push(`Host benchmark: ${benchmarks.length ? `${Math.min(...benchmarks)}–${Math.max(...benchmarks)} (${benchmarks.length}/${total} samples)` : 'unknown'}`);
  for (const [key, label] of [['fcpMs', 'FCP'], ['lcpMs', 'LCP'], ['siMs', 'SI']]) {
    const values = metadata.map(item => item.observed?.[key]).filter(value => finite(value) && value >= 0).sort((a, b) => a - b);
    const middle = Math.floor(values.length / 2);
    const median = values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2;
    details.push(`Observed ${label}: ${values.length ? `${Math.round(median)} ms median (${values.length}/${total} samples)` : `unknown (0/${total} samples)`}; separate from scored timing`);
  }
  return details.join(' · ');
}

/** Enrichment failure never changes the selected cohort, metrics or status. */
export function psiArtifactContexts(home, cohorts) {
  const selections = cohorts.map(runs => runs.slice(-MAX_RUNS));
  const ids = [...new Set(selections.flat().map(run => run.id).filter(id => Number.isSafeInteger(id) && id > 0))];
  const paths = new Map();
  if (ids.length) {
    try {
      const rows = JSON.parse(execFileSync('sqlite3', ['-readonly', '-json', resolve(home, '.psi-swarm/history.db'),
        `SELECT run_id, artifact_path FROM run_insights WHERE run_id IN (${ids.join(',')})`],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 4000, maxBuffer: 1024 * 1024 }) || '[]');
      for (const row of rows) if (ids.includes(row.run_id) && typeof row.artifact_path === 'string') paths.set(row.run_id, row.artifact_path);
    } catch { /* Older databases and missing insight pointers mean unknown metadata. */ }
  }
  return cohorts.map((runs, index) => {
    const selected = selections[index];
    const pointers = [...new Set(selected.map(run => paths.get(run.id)).filter(Boolean))];
    // Normal five-run Console cohorts have one bundle per preset. Ambiguous
    // multiple pointers fail closed rather than expanding filesystem reads.
    if (pointers.length !== 1) return unknown;
    const bundle = readBundle(home, pointers[0]);
    return summarize(selected.map(run => matchingMetadata(bundle, run)).filter(Boolean), runs.length);
  });
}
