export type Platform = 'ios' | 'mac';
export type SearchKey = Readonly<{
  term: string;
  country: string;
  platform: Platform;
  limit: number;
}>;
export type App = Readonly<{
  id: string;
  name: string;
  developer: string;
  url: string;
  icon?: string;
  description: string;
  genre: string;
  rating: number | null;
  ratings: number | null;
  price: string;
  version: string;
}>;
export type Observation = Readonly<{
  id: string;
  fetchedAt: string;
  sourceUrl: string;
  notice?: string;
  key: SearchKey;
  apps: readonly App[];
}>;
export type Attempt = Readonly<
  { id: string; projectId: string; key: SearchKey; at: string } & (
    | { status: 'success'; observationId: string; cache: 'hit' | 'miss' }
    | { status: 'failure'; message: string }
  )
>;
export type ListingDraft = {
  id: string;
  projectId: string;
  locale: string;
  name: string;
  subtitle: string;
  keywords: string;
  description: string;
  updatedAt: string;
};
export type Project = {
  id: string;
  name: string;
  app: App;
  appSourceUrl?: string;
  appFetchedAt?: string;
  appSourceNotice?: string;
  platform: Platform;
  countries: string[];
  keywords: string[];
  limit: number;
  cadenceHours: number;
  autoRefresh: boolean;
  lastRunAt?: string;
  createdAt: string;
  updatedAt: string;
};
export type Workspace = {
  version: 1;
  projects: Project[];
  observations: Observation[];
  attempts: Attempt[];
  drafts: ListingDraft[];
};
export type CellPresence =
  | { kind: 'found'; position: number }
  | { kind: 'not-in-returned-results' }
  | { kind: 'unavailable'; message: string }
  | { kind: 'unobserved' };
export type Estimate = {
  value: number | null;
  method: 'title-coverage/v1' | 'rating-footprint/v1';
  evidenceIds: string[];
  coverage: number;
  inputs: string;
};
export const COUNTRIES = [
  ['us', 'United States'],
  ['gb', 'United Kingdom'],
  ['in', 'India'],
  ['ca', 'Canada'],
  ['au', 'Australia'],
  ['de', 'Germany'],
  ['fr', 'France'],
  ['jp', 'Japan'],
  ['br', 'Brazil'],
  ['mx', 'Mexico'],
  ['es', 'Spain'],
  ['it', 'Italy'],
  ['kr', 'South Korea'],
  ['nl', 'Netherlands'],
  ['se', 'Sweden'],
  ['sg', 'Singapore'],
  ['nz', 'New Zealand'],
  ['za', 'South Africa'],
  ['id', 'Indonesia'],
  ['tr', 'Türkiye'],
] as const;
export const MAX_OBSERVATIONS = 120;
export const BACKUP_LIMIT = 12_000_000;
export const backupText = (workspace: Workspace) => JSON.stringify(workspace, null, 2);
export const backupBytes = (workspace: Workspace) =>
  new TextEncoder().encode(backupText(workspace)).length;
export const MAX_CELLS = 60;
export const emptyWorkspace = (): Workspace => ({
  version: 1,
  projects: [],
  observations: [],
  attempts: [],
  drafts: [],
});
export const uid = () => crypto.randomUUID();
export const normalizeTerm = (term: string) =>
  term.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLocaleLowerCase('en');
export function searchKey(input: unknown): SearchKey {
  const x = record(input);
  const term = normalizeTerm(str(x.term, 100));
  if (!term) throw new Error('Enter a keyword.');
  if (!/^[a-z]{2}$/u.test(String(x.country)))
    throw new Error('Country must be a two-letter storefront code.');
  if (x.platform !== 'ios' && x.platform !== 'mac') throw new Error('Choose iOS or Mac.');
  if (!Number.isInteger(x.limit) || Number(x.limit) < 20 || Number(x.limit) > 200)
    throw new Error('Result limit must be 20–200.');
  return { term, country: String(x.country), platform: x.platform, limit: Number(x.limit) };
}
export const keyId = (key: SearchKey) =>
  JSON.stringify([key.term, key.country, key.platform, key.limit]);
export const sameKey = (a: SearchKey, b: SearchKey) => keyId(a) === keyId(b);
export function appleId(value: string): string | null {
  if (/^\d{1,15}$/u.test(value.trim())) return value.trim();
  try {
    const u = new URL(value);
    if (
      u.protocol !== 'https:' ||
      u.hostname !== 'apps.apple.com' ||
      u.username ||
      u.password ||
      u.port
    )
      return null;
    return u.pathname.match(/\/id(\d{1,15})(?:\/|$)/u)?.[1] ?? null;
  } catch {
    return null;
  }
}
export function safeAppleUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  try {
    const u = new URL(value);
    return u.protocol === 'https:' &&
      u.hostname === 'apps.apple.com' &&
      !u.username &&
      !u.password &&
      !u.port
      ? u.href
      : '';
  } catch {
    return '';
  }
}
function iconUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  try {
    const u = new URL(value);
    return u.protocol === 'https:' &&
      /(^|\.)mzstatic\.com$/u.test(u.hostname) &&
      !u.username &&
      !u.password &&
      !u.port
      ? u.href
      : undefined;
  } catch {
    return undefined;
  }
}
export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Expected an object.');
  return value as Record<string, unknown>;
}
export function str(value: unknown, max: number): string {
  if (
    typeof value !== 'string' ||
    value.length > max ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value)
  )
    throw new Error(`Invalid text (maximum ${max} characters).`);
  return value;
}
const id = (value: unknown) => {
  const v = str(value, 80);
  if (!/^[a-zA-Z0-9_-]{1,80}$/u.test(v)) throw new Error('Invalid record ID.');
  return v;
};
const date = (value: unknown) => {
  const v = str(value, 40);
  if (
    !/^\d{4}-\d{2}-\d{2}T/u.test(v) ||
    !Number.isFinite(Date.parse(v)) ||
    Date.parse(v) < Date.UTC(2000, 0, 1) ||
    Date.parse(v) >= Date.UTC(2200, 0, 1)
  )
    throw new Error('Invalid capture time.');
  return new Date(v).toISOString();
};
function count(value: unknown, max: number, apple: boolean, integer = false): number | null {
  if (value === null || value === undefined) return null;
  if (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= max &&
    (!integer || Number.isInteger(value))
  )
    return value;
  if (apple) return null;
  throw new Error('Invalid app rating data.');
}
export function parseApp(value: unknown, apple = false): App {
  const x = record(value);
  const appId = apple ? String(x.trackId) : id(x.id);
  if (!/^\d{1,15}$/u.test(appId)) throw new Error('Invalid Apple app ID.');
  const url = safeAppleUrl(apple ? x.trackViewUrl : x.url);
  if (!url) throw new Error('App link must be an Apple App Store URL.');
  const text = (v: unknown, max = 500) => str(typeof v === 'string' ? v : '', max);
  const icon = iconUrl(apple ? x.artworkUrl100 : x.icon);
  return {
    id: appId,
    name: text(apple ? x.trackName : x.name),
    developer: text(apple ? x.artistName : x.developer),
    url,
    ...(icon ? { icon } : {}),
    description: text(x.description, 15000),
    genre: text(apple ? x.primaryGenreName : x.genre),
    rating: count(apple ? x.averageUserRating : x.rating, 5, apple),
    ratings: count(apple ? x.userRatingCount : x.ratings, 1e12, apple, true),
    price: text(apple ? x.formattedPrice : x.price),
    version: text(x.version, 100),
  };
}
export function parseObservation(value: unknown): Observation {
  const x = record(value);
  const key = searchKey(x.key);
  const expected = appleSearchUrl(key);
  if (x.sourceUrl !== expected)
    throw new Error('Observation source does not match its search parameters.');
  const apps = array(x.apps, 200).map((v) => parseApp(v));
  unique(apps.map((a) => a.id));
  if (apps.length > key.limit) throw new Error('Capture exceeds its result limit.');
  return { id: id(x.id), fetchedAt: date(x.fetchedAt), sourceUrl: expected, key, apps, ...(x.notice ? { notice: str(x.notice, 1000) } : {}) };
}
export function appleSearchUrl(key: SearchKey): string {
  const u = new URL('https://itunes.apple.com/search');
  u.search = new URLSearchParams({
    term: key.term,
    country: key.country,
    media: 'software',
    entity: key.platform === 'mac' ? 'macSoftware' : 'software',
    limit: String(key.limit),
  }).toString();
  return u.href;
}
export function parseKeywords(text: string): string[] {
  if (text.length > 16000) throw new Error('Keyword import is limited to 16,000 characters.');
  const terms = [
    ...new Set(
      text
        .split(/[,;\n\r\t]+/u)
        .map(normalizeTerm)
        .filter(Boolean),
    ),
  ];
  if (terms.length > 60 || terms.some((t) => t.length > 100))
    throw new Error('Use up to 60 keywords, each at most 100 characters.');
  return terms;
}
function array(value: unknown, max: number): unknown[] {
  if (!Array.isArray(value) || value.length > max)
    throw new Error(`Expected a list with at most ${max} records.`);
  return value;
}
function unique(ids: string[]) {
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate record IDs.');
}
export function validateWorkspace(input: unknown): Workspace {
  const x = record(input);
  if (x.version !== 1) throw new Error('Unsupported backup version. Expected version 1.');
  const projects: Project[] = array(x.projects, 20).map((v) => {
    const p = record(v);
    const key = searchKey({
      term: 'validation',
      country: 'us',
      platform: p.platform,
      limit: p.limit,
    });
    const countries = array(p.countries, 10).map((c) => {
      if (typeof c !== 'string' || !/^[a-z]{2}$/u.test(c)) throw new Error('Invalid country.');
      return c;
    });
    unique(countries);
    const keywords = array(p.keywords, 60).map((k) => {
      const s = str(k, 100);
      if (!s || normalizeTerm(s) !== s) throw new Error('Keywords must be normalized.');
      return s;
    });
    unique(keywords);
    const cadence = Number(p.cadenceHours);
    if (![0, 24, 72, 168].includes(cadence)) throw new Error('Invalid cadence.');
    if (p.appSourceUrl !== undefined) {
      const source = new URL(str(p.appSourceUrl, 2000));
      if (
        source.protocol !== 'https:' ||
        source.hostname !== 'itunes.apple.com' ||
        !['/search', '/lookup'].includes(source.pathname) ||
        source.username ||
        source.password ||
        source.port
      )
        throw new Error('Invalid app metadata source.');
    }
    return {
      id: id(p.id),
      name: str(p.name, 200),
      app: parseApp(p.app),
      ...(p.appSourceUrl
        ? { appSourceUrl: String(p.appSourceUrl), appFetchedAt: date(p.appFetchedAt), ...(p.appSourceNotice ? { appSourceNotice: str(p.appSourceNotice, 1000) } : {}) }
        : {}),
      platform: key.platform,
      countries,
      keywords,
      limit: key.limit,
      cadenceHours: cadence,
      autoRefresh: p.autoRefresh === true,
      ...(p.lastRunAt ? { lastRunAt: date(p.lastRunAt) } : {}),
      createdAt: date(p.createdAt),
      updatedAt: date(p.updatedAt),
    };
  });
  unique(projects.map((p) => p.id));
  const projectIds = new Set(projects.map((p) => p.id));
  const observations = array(x.observations, MAX_OBSERVATIONS).map(parseObservation);
  unique(observations.map((o) => o.id));
  const obs = new Map(observations.map((o) => [o.id, o]));
  const attempts: Attempt[] = array(x.attempts, 400).map((v) => {
    const a = record(v);
    const base = {
      id: id(a.id),
      projectId: id(a.projectId),
      key: searchKey(a.key),
      at: date(a.at),
    };
    if (!projectIds.has(base.projectId)) throw new Error('Attempt refers to a missing project.');
    if (a.status === 'success') {
      const observationId = id(a.observationId);
      const o = obs.get(observationId);
      if (!o || !sameKey(o.key, base.key) || !['hit', 'miss'].includes(String(a.cache)))
        throw new Error('Attempt has invalid evidence.');
      return { ...base, status: 'success', observationId, cache: a.cache as 'hit' | 'miss' };
    }
    if (a.status !== 'failure') throw new Error('Invalid attempt state.');
    return { ...base, status: 'failure', message: str(a.message, 600) };
  });
  unique(attempts.map((a) => a.id));
  const drafts: ListingDraft[] = array(x.drafts, 100).map((v) => {
    const d = record(v);
    const projectId = id(d.projectId);
    if (!projectIds.has(projectId)) throw new Error('Draft refers to a missing project.');
    const locale = str(d.locale, 40);
    if (!/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/u.test(locale))
      throw new Error('Invalid draft locale.');
    return {
      id: id(d.id),
      projectId,
      locale,
      name: str(d.name, 200),
      subtitle: str(d.subtitle, 200),
      keywords: str(d.keywords, 1000),
      description: str(d.description, 15000),
      updatedAt: date(d.updatedAt),
    };
  });
  unique(drafts.map((d) => d.id));
  unique(drafts.map((d) => `${d.projectId}/${d.locale}`));
  return { version: 1, projects, observations, attempts, drafts };
}
export function readBackup(text: string): Workspace {
  if (new TextEncoder().encode(text).length > BACKUP_LIMIT)
    throw new Error('Backup exceeds 12 MB.');
  return validateWorkspace(JSON.parse(text));
}
export function mergeWorkspace(current: Workspace, incoming: Workspace): Workspace {
  const merge = <T extends { id: string }>(a: T[], b: T[]): T[] => {
    const m = new Map(a.map((v) => [v.id, v]));
    for (const v of b) {
      const old = m.get(v.id);
      if (old && JSON.stringify(old) !== JSON.stringify(v))
        throw new Error(`Conflicting record ${v.id}. Use replace or import an unchanged backup.`);
      m.set(v.id, v);
    }
    return [...m.values()];
  };
  return validateWorkspace(
    retain({
      version: 1,
      projects: merge(current.projects, incoming.projects),
      observations: merge(current.observations, incoming.observations),
      attempts: merge(current.attempts, incoming.attempts),
      drafts: merge(current.drafts, incoming.drafts),
    }),
  );
}
export function retain(workspace: Workspace): Workspace {
  const observations = [...workspace.observations]
    .sort((a, b) => b.fetchedAt.localeCompare(a.fetchedAt))
    .slice(0, MAX_OBSERVATIONS);
  const newestSuccess = new Map<string, string>();
  for (const a of workspace.attempts)
    if (a.status === 'success') {
      const k = `${a.projectId}/${keyId(a.key)}`;
      if (a.at > (newestSuccess.get(k) ?? '')) newestSuccess.set(k, a.at);
    }
  const pruned = () => {
    const ids = new Set(observations.map((o) => o.id));
    return {
      ...workspace,
      observations,
      attempts: workspace.attempts
        .filter((a) =>
          a.status === 'success'
            ? ids.has(a.observationId)
            : a.at >= (newestSuccess.get(`${a.projectId}/${keyId(a.key)}`) ?? ''),
        )
        .sort((a, b) => a.at.localeCompare(b.at))
        .slice(-400),
    };
  };
  let result = pruned();
  while (backupBytes(result) > BACKUP_LIMIT && observations.length) {
    observations.pop();
    result = pruned();
  }
  if (backupBytes(result) > BACKUP_LIMIT)
    throw new Error(
      'Workspace exceeds the 12 MB backup bound. Export individual drafts and shorten older draft text before saving.',
    );
  return result;
}

export function removeProject(workspace: Workspace, projectId: string): Workspace {
  const attempts = workspace.attempts.filter((a) => a.projectId !== projectId);
  const referenced = new Set(
    attempts.flatMap((a) => (a.status === 'success' ? [a.observationId] : [])),
  );
  const removedReferences = new Set(
    workspace.attempts
      .filter((a) => a.projectId === projectId)
      .flatMap((a) => (a.status === 'success' ? [a.observationId] : [])),
  );
  return validateWorkspace({
    ...workspace,
    projects: workspace.projects.filter((p) => p.id !== projectId),
    attempts,
    drafts: workspace.drafts.filter((d) => d.projectId !== projectId),
    observations: workspace.observations.filter(
      (o) => !removedReferences.has(o.id) || referenced.has(o.id),
    ),
  });
}
export function importSummary(
  current: Workspace,
  incoming: Workspace,
  mode: 'merge' | 'replace',
): { workspace: Workspace; trimmedCaptures: number; trimmedAttempts: number } {
  const result = mode === 'merge' ? mergeWorkspace(current, incoming) : retain(incoming);
  const captureCount =
    mode === 'merge'
      ? new Set([...current.observations, ...incoming.observations].map((o) => o.id)).size
      : incoming.observations.length;
  const attemptCount =
    mode === 'merge'
      ? new Set([...current.attempts, ...incoming.attempts].map((a) => a.id)).size
      : incoming.attempts.length;
  return {
    workspace: result,
    trimmedCaptures: captureCount - result.observations.length,
    trimmedAttempts: attemptCount - result.attempts.length,
  };
}

export function cell(
  workspace: Workspace,
  project: Project,
  key: SearchKey,
): {
  presence: CellPresence;
  observation?: Observation;
  attempt?: Attempt;
  previous?: Observation;
} {
  const attempts = workspace.attempts
    .filter((a) => a.projectId === project.id && sameKey(a.key, key))
    .sort((a, b) => b.at.localeCompare(a.at));
  const attempt = attempts[0];
  const observations = workspace.observations
    .filter((o) => attempts.some((a) => a.status === 'success' && a.observationId === o.id))
    .sort((a, b) => b.fetchedAt.localeCompare(a.fetchedAt));
  const observation = observations[0];
  const position = observation?.apps.findIndex((a) => a.id === project.app.id);
  const presence: CellPresence =
    attempt?.status === 'failure'
      ? { kind: 'unavailable', message: attempt.message }
      : observation
        ? position !== undefined && position >= 0
          ? { kind: 'found', position: position + 1 }
          : { kind: 'not-in-returned-results' }
        : { kind: 'unobserved' };
  return {
    presence,
    observation,
    attempt,
    previous: observations.find(
      (o) => o.id !== observation?.id && o.fetchedAt !== observation?.fetchedAt,
    ),
  };
}
export function trend(appId: string, current?: Observation, previous?: Observation): string {
  if (!current || !previous || !sameKey(current.key, previous.key)) return 'No comparable capture';
  const a = current.apps.findIndex((a) => a.id === appId);
  const b = previous.apps.findIndex((a) => a.id === appId);
  if (a < 0 || b < 0)
    return a < 0 && b < 0
      ? 'Absent in both captures'
      : a < 0
        ? 'Left returned results'
        : 'Entered returned results';
  return a === b ? 'Unchanged' : `${a < b ? '↑' : '↓'} ${Math.abs(a - b)} positions`;
}
export function estimates(observation?: Observation): {
  targeting: Estimate;
  competition: Estimate;
} {
  const apps = observation?.apps ?? [];
  const top = apps.slice(0, 50);
  const term = observation?.key.term ?? '';
  const matches = top.filter((a) => normalizeTerm(a.name).includes(term)).length;
  const ratings = apps.slice(0, 10).flatMap((a) => (a.ratings === null ? [] : [a.ratings]));
  const footprint = ratings.length
    ? Math.round(
        Math.min(
          100,
          (Math.log10(1 + ratings.reduce((a, b) => a + b, 0) / ratings.length) / 6) * 100,
        ),
      )
    : null;
  return {
    targeting: {
      value: top.length ? Math.round((matches / top.length) * 100) : null,
      method: 'title-coverage/v1',
      evidenceIds: observation ? [observation.id] : [],
      coverage: top.length,
      inputs: `${matches} exact phrase matches in ${top.length} returned titles (up to 50). Describes competitor targeting, not demand.`,
    },
    competition: {
      value: footprint,
      method: 'rating-footprint/v1',
      evidenceIds: observation ? [observation.id] : [],
      coverage: ratings.length,
      inputs: `Mean rating count of ${ratings.length}/10 returned leaders; log10(1 + mean) / 6 × 100, capped at 100. Lifetime ratings proxy; no search volume or official difficulty.`,
    },
  };
}
export const keywordBytes = (text: string) => new TextEncoder().encode(text).length;
export function auditDraft(draft: ListingDraft): string[] {
  const notes: string[] = [];
  for (const [name, text, max] of [
    ['Name', draft.name, 30],
    ['Subtitle', draft.subtitle, 30],
    ['Description', draft.description, 4000],
  ] as const) {
    const n = Array.from(text).length;
    if (n > max) notes.push(`${name} is ${n - max} characters over its ${max}-character budget.`);
    if (!text.trim()) notes.push(`${name} is empty.`);
  }
  if (keywordBytes(draft.keywords) > 100)
    notes.push(
      `Keywords are ${keywordBytes(draft.keywords) - 100} UTF-8 bytes over the 100-byte App Store Connect budget.`,
    );
  if (!draft.keywords.trim()) notes.push('Keywords are empty.');
  const words = draft.keywords.split(',').map(normalizeTerm).filter(Boolean);
  if (new Set(words).size < words.length) notes.push('Remove repeated keyword entries.');
  if (words.some((w) => normalizeTerm(`${draft.name} ${draft.subtitle}`).includes(w)))
    notes.push(
      'Some keyword phrases already appear in the name or subtitle. Review redundant coverage.',
    );
  return notes.length
    ? notes
    : [
        'Character budgets pass. Review accuracy, claims and locale suitability before copying into App Store Connect.',
      ];
}
const csvField = (v: unknown) =>
  `"${String(v ?? '')
    .replace(/^[\s]*[=+@\-]/u, "'$&")
    .replace(/"/gu, '""')}"`;
export function exportCsv(workspace: Workspace, project: Project): string {
  const rows: unknown[][] = [
    [
      'keyword',
      'country',
      'platform',
      'limit',
      'state',
      'position',
      'fetched_at',
      'source',
      'last_attempt',
      'error',
      'title_coverage_estimate',
      'competition_estimate',
    ],
  ];
  for (const term of project.keywords)
    for (const country of project.countries) {
      const key = { term, country, platform: project.platform, limit: project.limit };
      const c = cell(workspace, project, key);
      const e = estimates(c.observation);
      rows.push([
        term,
        country,
        project.platform,
        project.limit,
        c.presence.kind,
        c.presence.kind === 'found' ? c.presence.position : '',
        c.observation?.fetchedAt,
        c.observation?.sourceUrl,
        c.attempt?.at,
        c.presence.kind === 'unavailable' ? c.presence.message : '',
        e.targeting.value,
        e.competition.value,
      ]);
    }
  return rows.map((r) => r.map(csvField).join(',')).join('\r\n');
}
