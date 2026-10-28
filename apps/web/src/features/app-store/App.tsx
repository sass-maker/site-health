import { NativeSelect, NativeDisclosure, NativeSummary, NativeProgress, NativeDialog } from '@saas-maker/ui/components/native-controls';
import { Textarea as UiTextarea } from '@saas-maker/ui/components/textarea';
import { Table as UiTable, TableHeader as UiTableHeader, TableRow as UiTableRow, TableHead as UiTableHead, TableBody as UiTableBody, TableCell as UiTableCell } from '@saas-maker/ui/components/table';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import React, { useEffect, useRef, useState } from 'react';
import {
  appleId,
  auditDraft,
  backupText,
  cell,
  COUNTRIES,
  emptyWorkspace,
  estimates,
  exportCsv,
  MAX_CELLS,
  keywordBytes,
  importSummary,
  removeProject,
  normalizeTerm,
  parseKeywords,
  readBackup,
  retain,
  trend,
  uid,
  type App,
  type ListingDraft,
  type Platform,
  type Project,
  type SearchKey,
  type Workspace,
} from './domain.ts';
import { WorkspaceStore, StoredDataError, type SavedWorkspace } from './storage.ts';
import {
  appleRequest,
  askAI,
  pacedCapture,
  requestJson,
  searchPath,
  type Capture,
  type Status,
} from './api.ts';
import {
  commitWorkspace,
  SaveError,
  DraftConflictError,
  persistDraft,
  withDraftGuard,
} from './persistence.ts';
import type { AIOutput } from './ai-types.ts';
const time = (s?: string) =>
  s
    ? new Date(s).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : 'No capture yet';
const shortTime = (s?: string) =>
  s ? new Date(s).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';
const message = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong.');
function download(name: string, text: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Icon({ app }: { app: App }) {
  return app.icon ? (
    <img className="app-icon" src={app.icon} alt="" loading="lazy" referrerPolicy="no-referrer" />
  ) : (
    <span className="app-icon fallback">{app.name.slice(0, 1)}</span>
  );
}
function StoreLink({ app }: { app: App }) {
  return (
    <a href={app.url} target="_blank" rel="noreferrer">
      View in App Store ↗
    </a>
  );
}
type Run = {
  state: 'running' | 'complete' | 'cancelled';
  done: number;
  total: number;
  failed: number;
  label: string;
};
export default function ResearchApp() {
  const [workspace, setWorkspace] = useState<Workspace>(emptyWorkspace);
  const saved = useRef<SavedWorkspace>({ revision: 0, data: emptyWorkspace() });
  const store = useRef<WorkspaceStore | null>(null);
  const saving = useRef(Promise.resolve());
  const [, setCadenceTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCadenceTick((t) => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);
  const draftGuard = useRef<() => Promise<boolean>>(async () => true);
  const [rawRecovery, setRawRecovery] = useState<unknown>(null);
  const [saveRecovery, setSaveRecovery] = useState<Workspace | null>(null);
  const deleteDialog = useRef<HTMLDialogElement | null>(null);
  const [deleteReady, setDeleteReady] = useState(false);
  const go = (action: () => void | Promise<void>) =>
    withDraftGuard(() => draftGuard.current(), action);
  const [storageState, setStorageState] = useState('Opening local workspace…');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [retentionNotice, setRetentionNotice] = useState('');
  const [projectId, setProjectId] = useState('');
  const [tab, setTab] = useState('research');
  const [status, setStatus] = useState<Status | null>(null);
  const [statusError, setStatusError] = useState('');
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState<Platform>('ios');
  const [country, setCountry] = useState('us');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Capture | null>(null);
  const [searched, setSearched] = useState(false);
  const [choosing, setChoosing] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [extraCountry, setExtraCountry] = useState('');
  const [selection, setSelection] = useState<SearchKey | null>(null);
  const [run, setRun] = useState<Run | null>(null);
  const runAbort = useRef<AbortController | null>(null);
  const searchAbort = useRef<AbortController | null>(null);
  const privacyDialog = useRef<HTMLDialogElement | null>(null);
  const [imported, setImported] = useState<Workspace | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const importDialog = useRef<HTMLDialogElement | null>(null);
  const project = workspace.projects.find((p) => p.id === projectId);
  const active = project && !choosing ? project : undefined;
  const busy = run?.state === 'running';
  useEffect(() => {
    let alive = true;
    let unsubscribe = () => {};
    WorkspaceStore.open()
      .then(async (s) => {
        let current;
        try {
          current = await s.read();
        } catch (error) {
          s.close();
          throw error;
        }
        if (!alive) {
          s.close();
          return;
        }
        store.current = s;
        saved.current = current;
        setWorkspace(current.data);
        setProjectId(current.data.projects[0]?.id ?? '');
        setStorageState('Saved on this browser');
        unsubscribe = s.subscribe(() => {
          void saving.current.then(async () => {
            try {
              const latest = await s.read();
              if (latest.revision > saved.current.revision) {
                saved.current = latest;
                setWorkspace(latest.data);
                setNotice('Workspace updated from another tab.');
              }
            } catch (e) {
              setError(message(e));
            }
          });
        });
      })
      .catch((e) => {
        if (alive) {
          if (e instanceof StoredDataError) setRawRecovery(e.raw);
          setStorageState('Temporary workspace · storage unavailable');
          setError(
            `Browser storage could not be opened. ${message(e)} Download a backup before leaving; this session will not survive reload.`,
          );
        }
      })
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
      unsubscribe();
      store.current?.close();
      runAbort.current?.abort();
      searchAbort.current?.abort();
    };
  }, []);
  const exportBackup = async (name = 'app-store-research-backup.json') => {
    if (!(await draftGuard.current())) return false;
    await saving.current;
    download(name, backupText(saved.current.data));
    return true;
  };
  const refreshStatus = () => {
    setStatusError('');
    void requestJson('/api/dashboard/v1/seo/app-store/status')
      .then((v) => setStatus(v as Status))
      .catch((e) => {
        const reason = `Service status unavailable. ${message(e)}`;
        setStatusError(reason);
        setStatus({ apple: { enabled: null, limitPerMinute: 18, cacheMinutes: 15 }, ai: { enabled: false, reason, local: true }, connections: { appleAds: false, appStoreConnect: false } });
      });
  };
  useEffect(refreshStatus, []);
  const change = (update: (data: Workspace) => Workspace): Promise<void> => {
    const task = saving.current.then(async () => {
      if (store.current) {
        setStorageState('Saving…');
        try {
          let requestedCaptures = 0;
          const result = await commitWorkspace(store.current, saved.current, (data) => {
            const proposed = update(data);
            requestedCaptures = proposed.observations.length;
            return proposed;
          });
          if (requestedCaptures > result.data.observations.length) setRetentionNotice(`${requestedCaptures - result.data.observations.length} oldest captures were trimmed to keep this workspace within 120 captures / 12 MB. Export a backup to keep a separate archive.`);
          saved.current = result;
          setWorkspace(result.data);
          setStorageState('Saved on this browser');
        } catch (error) {
          setStorageState('Save failed · recovery available');
          if (error instanceof SaveError) setSaveRecovery(error.recovery);
          throw error;
        }
      } else {
        const proposed = update(saved.current.data);
        const next = retain(proposed);
        if (proposed.observations.length > next.observations.length) setRetentionNotice(`${proposed.observations.length - next.observations.length} oldest captures were trimmed to keep this workspace within 120 captures / 12 MB.`);
        saved.current = { revision: saved.current.revision + 1, data: next };
        setWorkspace(next);
      }
    });
    saving.current = task.catch(() => {});
    return task;
  };
  const updateProject = (patch: Partial<Project>) => {
    if (!active) return;
    void change((data) => ({
      ...data,
      projects: data.projects.map((p) =>
        p.id === active.id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p,
      ),
    })).catch((e) => setError(message(e)));
  };
  async function findApp(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setResults(null);
    setSearched(false);
    searchAbort.current?.abort();
    const controller = new AbortController();
    searchAbort.current = controller;
    setSearching(true);
    try {
      const value = search.trim();
      if (!value) throw new Error('Enter an app name, Apple ID or App Store URL.');
      const id = appleId(value);
      if (!id && /^(?:https?:|www\.)/iu.test(value))
        throw new Error('Use an https://apps.apple.com app URL or numeric Apple ID.');
      const path = id
        ? `/api/dashboard/v1/seo/app-store/lookup?${new URLSearchParams({ id, country, platform })}`
        : searchPath({ term: normalizeTerm(value), country, platform, limit: 50 });
      let capture: Capture;
      try {
        capture = await appleRequest(path, controller.signal);
      } catch (e) {
        if (!controller.signal.aborted && 'retryAfter' in Object(e))
          throw new Error(`${message(e)} Wait a few seconds and search again.`);
        throw e;
      }
      setResults(capture);
      setSearched(true);
    } catch (e) {
      if (!controller.signal.aborted) setError(message(e));
    } finally {
      if (searchAbort.current === controller) setSearching(false);
    }
  }
  async function chooseApp(app: App) {
    if (!(await draftGuard.current())) return;
    if (saved.current.data.projects.length >= 20) {
      setError(
        'This browser already has 20 projects. Open an existing project’s Data & connections view to back it up and delete it before adding another.',
      );
      return;
    }
    const now = new Date().toISOString();
    const p: Project = {
      id: uid(),
      name: app.name,
      app,
      ...(results ? { appSourceUrl: results.sourceUrl, appFetchedAt: results.fetchedAt, appSourceNotice: results.notice } : {}),
      platform,
      countries: [country],
      keywords: [],
      limit: 50,
      cadenceHours: 24,
      autoRefresh: false,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await change((data) => {
        if (data.projects.length >= 20)
          throw new Error(
            'Project limit reached. Back up and delete an existing project in Data & connections.',
          );
        return { ...data, projects: [...data.projects, p] };
      });
      setProjectId(p.id);
      setChoosing(false);
      setTab('research');
      setSelection(null);
      setNotice([results?.notice, 'Research created. Add a keyword to collect its first observation.'].filter(Boolean).join(' '));
    } catch (e) {
      setError(message(e));
    }
  }
  function addKeywords(text = keywords) {
    try {
      const added = parseKeywords(text);
      const joined = [...new Set([...(active?.keywords ?? []), ...added])];
      if (joined.length > 60) throw new Error('Keep at most 60 keywords per project.');
      updateProject({ keywords: joined });
      setKeywords('');
      setNotice(
        `${added.length} keyword ideas added. They have no observations until you collect them.`,
      );
    } catch (e) {
      setError(message(e));
    }
  }
  async function collect(only?: SearchKey[]) {
    if (!active || busy) return;
    setError('');
    setNotice('');
    const p = active;
    const keys =
      only ??
      p.keywords.flatMap((term) =>
        p.countries.map((country) => ({ term, country, platform: p.platform, limit: p.limit })),
      );
    if (!keys.length) {
      setError('Add a keyword and select at least one storefront.');
      return;
    }
    if (keys.length > MAX_CELLS) {
      setError(
        `This matrix has ${keys.length} cells. Use at most ${MAX_CELLS} per collection by reducing keywords or countries.`,
      );
      return;
    }
    const controller = new AbortController();
    runAbort.current = controller;
    let done = 0,
      failed = 0;
    setRun({
      state: 'running',
      done,
      total: keys.length,
      failed,
      label: 'Starting public Apple collection…',
    });
    try {
      await change((data) => ({
        ...data,
        projects: data.projects.map((item) =>
          item.id === p.id ? { ...item, lastRunAt: new Date().toISOString() } : item,
        ),
      }));
    } catch (e) {
      setError(message(e));
      setRun(null);
      runAbort.current = null;
      return;
    }
    setRun({
      state: 'running',
      done,
      total: keys.length,
      failed,
      label: 'Starting public Apple collection…',
    });
    for (const key of keys) {
      if (controller.signal.aborted) break;
      setSelection(key);
      setRun({
        state: 'running',
        done,
        total: keys.length,
        failed,
        label: `${key.term} · ${key.country.toUpperCase()}`,
      });
      let capture: Capture;
      try {
        capture = await pacedCapture(key, controller.signal, (seconds) =>
          setRun({
            state: 'running',
            done,
            total: keys.length,
            failed,
            label: `Shared quota · waiting ${seconds}s for ${key.country.toUpperCase()}`,
          }),
        );
        if (!capture.observation)
          throw new Error('The service did not return a search observation.');
      } catch (providerError) {
        if (controller.signal.aborted) break;
        failed++;
        const attempt = {
          id: uid(),
          projectId: p.id,
          key,
          at: new Date().toISOString(),
          status: 'failure' as const,
          message: message(providerError).slice(0, 600),
        };
        try {
          await change((data) => ({ ...data, attempts: [...data.attempts, attempt] }));
        } catch (saveError) {
          setError(
            `Provider attempt could not be saved. ${message(saveError)} Recovery is available below.`,
          );
          controller.abort();
          break;
        }
        done++;
        continue;
      }
      if (controller.signal.aborted) break;
      const observation = capture.observation!;
      const success = {
        id: uid(),
        projectId: p.id,
        key,
        at: new Date().toISOString(),
        status: 'success' as const,
        observationId: observation.id,
        cache: capture.cache,
      };
      try {
        await change((data) => ({
          ...data,
          observations: data.observations.some((o) => o.id === observation.id)
            ? data.observations
            : [...data.observations, observation],
          attempts: [...data.attempts, success],
        }));
        if (capture.cacheNotice) setNotice(capture.cacheNotice);
      } catch (saveError) {
        const data = saved.current.data;
        if (!(saveError instanceof SaveError))
          setSaveRecovery(
            retain({
              ...data,
              projects: data.projects.some((item) => item.id === p.id)
                ? data.projects
                : [...data.projects, p],
              observations: data.observations.some((o) => o.id === observation.id)
                ? data.observations
                : [...data.observations, observation],
              attempts: [...data.attempts, success],
            }),
          );
        setError(
          `Apple returned a valid capture, but local storage could not save it. Download the unsaved recovery below. ${message(saveError)}`,
        );
        controller.abort();
        break;
      }
      done++;
      setRun({ state: 'running', done, total: keys.length, failed, label: 'Saving observations…' });
    }
    setRun({
      state: controller.signal.aborted ? 'cancelled' : 'complete',
      done,
      total: keys.length,
      failed,
      label: controller.signal.aborted
        ? 'Cancelled. Completed observations are kept.'
        : failed
          ? 'Partial result. Retry the unavailable cells.'
          : 'Collection complete.',
    });
    runAbort.current = null;
  }
  async function previewBackup(file?: File) {
    if (!file || !(await draftGuard.current())) return;
    try {
      if (file.size > 12_000_000) throw new Error('Backup exceeds 12 MB.');
      const backup = readBackup(await file.text());
      setImported(backup);
      setImportMode('merge');
      importDialog.current?.showModal();
    } catch (e) {
      setError(`Backup was not imported. ${message(e)}`);
    }
  }
  async function applyImport() {
    if (!imported || !(await draftGuard.current())) return;
    try {
      await change((data) => importSummary(data, imported, importMode).workspace);
      setProjectId(imported.projects[0]?.id ?? '');
      setChoosing(false);
      setSelection(null);
      setNotice('Validated backup imported atomically.');
      setImported(null);
      importDialog.current?.close();
    } catch (e) {
      setError(`Nothing was imported. ${message(e)}`);
    }
  }
  let importPreview: ReturnType<typeof importSummary> | null = null;
  let importPreviewError = '';
  if (imported) {
    try {
      importPreview = importSummary(workspace, imported, importMode);
    } catch (error) {
      importPreviewError = message(error);
    }
  }
  const selected = active && selection ? cell(workspace, active, selection) : undefined;
  const failedKeys = active
    ? active.keywords
        .flatMap((term) =>
          active.countries.map((country) => ({
            term,
            country,
            platform: active.platform,
            limit: active.limit,
          })),
        )
        .filter((key) => cell(workspace, active, key).presence.kind === 'unavailable')
    : [];
  const lastCapture = active
    ? workspace.attempts
        .filter((a) => a.projectId === active.id && a.status === 'success')
        .map(
          (a) =>
            workspace.observations.find((o) => a.status === 'success' && o.id === a.observationId)
              ?.fetchedAt ?? '',
        )
        .sort()
        .at(-1)
    : undefined;
  const cadenceFrom =
    active?.lastRunAt && (!lastCapture || active.lastRunAt > lastCapture)
      ? active.lastRunAt
      : lastCapture;
  const due =
    !!active?.cadenceHours &&
    (!cadenceFrom || Date.now() - Date.parse(cadenceFrom) > active.cadenceHours * 3600000);
  useEffect(() => {
    if (
      !ready ||
      !active?.autoRefresh ||
      !active.cadenceHours ||
      !store.current ||
      busy ||
      !due ||
      !navigator.locks
    )
      return;
    let disposed = false;
    const timer = setTimeout(() => {
      void navigator.locks.request(
        `app-store-research-auto-${active.id}`,
        { ifAvailable: true },
        async (lock) => {
          if (!lock || disposed) return;
          const latest = await store.current!.read();
          if (disposed) return;
          const current = latest.data.projects.find((p) => p.id === active.id);
          if (
            !current?.autoRefresh ||
            (current.lastRunAt &&
              Date.now() - Date.parse(current.lastRunAt) < current.cadenceHours * 3600000)
          )
            return;
          await collect();
        },
      );
    }, 1500);
    return () => {
      disposed = true;
      clearTimeout(timer);
    };
  }, [ready, active?.id, active?.autoRefresh, active?.cadenceHours, active?.lastRunAt, busy, due]);
  return (
    <div className="app-store-seo">
      <header className="feature-toolbar">
        <span className="save-status" role="status"><i />{storageState}</span>
        <Button variant="ghost" className="quiet" disabled={busy} onClick={() => void go(() => {
          setChoosing(true); setResults(null); setSearched(false);
        })}>＋ New research</Button>
      </header>
      <div className="research-content">
        {rawRecovery !== null && (
          <div className="alert error">
            <span>
              Stored data could not be validated. It has not been overwritten. Download the raw
              record for recovery.
            </span>
            <Button variant="outline"
              onClick={() =>
                download('raw-workspace-recovery.json', JSON.stringify(rawRecovery, null, 2))
              }
            >
              Download raw recovery
            </Button>
          </div>
        )}
        {saveRecovery && (
          <div className="alert error">
            <span>
              A local write failed. The proposed workspace, including fetched evidence, is held in
              this tab. Download it before leaving.
            </span>
            <Button variant="outline"
              onClick={() => download('unsaved-workspace-recovery.json', backupText(saveRecovery))}
            >
              Download unsaved recovery
            </Button>
          </div>
        )}

        {statusError && <div className="alert error" role="alert"><span>{statusError}</span><Button variant="outline" onClick={refreshStatus}>Check service status</Button></div>}
        {error && (
          <div className="alert error" role="alert">
            <span>{error}</span>
            <Button variant="outline" aria-label="Dismiss error" onClick={() => setError('')}>
              ×
            </Button>
          </div>
        )}
        {retentionNotice && <div className="alert notice" role="status"><span>{retentionNotice}</span><Button variant="outline" aria-label="Dismiss retention notice" onClick={() => setRetentionNotice('')}>×</Button></div>}
        {notice && (
          <div className="alert notice" role="status">
            <span>{notice}</span>
            <Button variant="outline" aria-label="Dismiss notification" onClick={() => setNotice('')}>
              ×
            </Button>
          </div>
        )}
        {!ready ? (
          <div className="empty">
            <span className="eyebrow">LOCAL WORKSPACE</span>
            <h2>Opening your research…</h2>
            <p>Your saved observations stay on this device.</p>
          </div>
        ) : !active ? (
          <>
            <section className="search-panel" aria-labelledby="search-title">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">01 / CHOOSE YOUR APP</span>
                  <h2 id="search-title">Choose an app to research</h2>
                </div>
                <span className="pill">Public Apple data</span>
              </div>
              {workspace.projects.length >= 20 && (
                <p className="alert error">
                  All 20 local project slots are used. Open a saved project’s Data & connections
                  view to back it up and review deletion before starting another.
                </p>
              )}
              <form className="app-search" onSubmit={findApp}>
                <label className="search-field">
                  App name, Apple ID or App Store URL
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search for your app…"
                    maxLength={400}
                    autoComplete="off"
                  />
                </label>
                <label>
                  Platform
                  <NativeSelect
                    disabled={searching}
                    value={platform}
                    onChange={(e) => {
                      setPlatform(e.target.value as Platform);
                      setResults(null);
                    }}
                  >
                    <option value="ios">iPhone & iPad</option>
                    <option value="mac">Mac</option>
                  </NativeSelect>
                </label>
                <label>
                  Storefront
                  <NativeSelect
                    disabled={searching}
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setResults(null);
                    }}
                  >
                    {COUNTRIES.map(([code, name]) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ))}
                  </NativeSelect>
                </label>
                <Button variant="default" className="primary" disabled={searching || !search.trim()}>
                  {searching ? 'Searching…' : 'Find app →'}
                </Button>
                {searching && (
                  <Button variant="outline" type="button" onClick={() => searchAbort.current?.abort()}>
                    Cancel
                  </Button>
                )}
              </form>
              <p className="caption">
                Public search API order can differ from the native App Store. Country chooses the
                storefront; returned text is not guaranteed to be fully localized.
              </p>
              {searching && (
                <div className="search-loading" role="status">
                  <span className="spinner" />
                  Asking Apple for matching apps…
                </div>
              )}
              {searched && !results?.apps.length && (
                <div className="empty small">
                  <h3>No matching apps returned.</h3>
                  <p>
                    {results?.notice ??
                      'Try a more specific name, another storefront, or the numeric ID from the app’s Apple URL.'}
                  </p>
                </div>
              )}
              {results && (
                <>
                  <div className="source-line">
                    {results.apps.length} results · {time(results.fetchedAt)} ·{' '}
                    {results.cache === 'hit' ? 'public cache' : 'new Apple capture'}{' '}
                    <a href={results.sourceUrl} target="_blank" rel="noreferrer">
                      Inspect source ↗
                    </a>
                  </div>
                  <div className="app-results">
                    {results.apps.map((app) => (
                      <article className="app-result" key={app.id}>
                        <Icon app={app} />
                        <div>
                          <h3>{app.name}</h3>
                          <p>{app.developer}</p>
                          <small>
                            {app.genre} · {app.price || 'Price unavailable'} ·{' '}
                            {app.ratings === null
                              ? 'Ratings unavailable'
                              : `${app.ratings.toLocaleString()} ratings`}
                          </small>
                        </div>
                        <Button variant="outline"
                          disabled={workspace.projects.length >= 20}
                          onClick={() => void chooseApp(app)}
                        >
                          Research app ↗
                        </Button>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </section>
            {!!workspace.projects.length && (
              <section className="saved-projects">
                <div className="section-heading">
                  <h2>Pick up where you left off.</h2>
                  <span className="caption">{workspace.projects.length}/20 local projects</span>
                </div>
                <div className="project-cards">
                  {workspace.projects.map((p) => (
                    <Button variant="outline"
                      key={p.id}
                      onClick={() => {
                        setProjectId(p.id);
                        setChoosing(false);
                        setSelection(null);
                        setTab('research');
                      }}
                    >
                      <Icon app={p.app} />
                      <span>
                        <strong>{p.name}</strong>
                        <small>
                          {p.platform.toUpperCase()} · {p.keywords.length} keywords ·{' '}
                          {p.countries.length} storefronts
                        </small>
                      </span>
                      <span>↗</span>
                    </Button>
                  ))}
                </div>
              </section>
            )}
            <section className="how-it-works">
              <div>
                <span className="mono">01</span>
                <h3>Bring an app.</h3>
                <p>Choose any publicly listed iOS or Mac app. No developer credentials needed.</p>
              </div>
              <div>
                <span className="mono">02</span>
                <h3>Compare the evidence.</h3>
                <p>
                  Collect a bounded matrix, inspect competitors and compare like-for-like captures.
                </p>
              </div>
              <div>
                <span className="mono">03</span>
                <h3>Make your next move.</h3>
                <p>
                  Turn findings into locale drafts. Save a portable backup and return when a refresh
                  is due.
                </p>
              </div>
            </section>
          </>
        ) : (
          <div className="workspace">
            <section className="workspace-head">
              <div>
                <div className="eyebrow">
                  YOUR RESEARCH / {active.platform === 'mac' ? 'MAC APP STORE' : 'IPHONE & IPAD'}
                </div>
                <div className="workspace-title">
                  <h2>{active.name}</h2>
                  <span className="pill">
                    {active.keywords.length * active.countries.length} cells
                  </span>
                </div>
                <p>{active.keywords.length} keywords · {active.countries.length} storefronts · {lastCapture ? `Evidence ${time(lastCapture)}` : 'No observations yet'}</p>
              </div>
              <div className="app-identity">
                <Icon app={active.app} />
                <div>
                  <label className="sr-only" htmlFor="project">
                    Local project
                  </label>
                  <NativeSelect
                    id="project"
                    disabled={busy}
                    value={active.id}
                    onChange={(e) => {
                      const id = e.target.value;
                      void go(() => {
                        setProjectId(id);
                        setSelection(null);
                      });
                    }}
                  >
                    {workspace.projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </NativeSelect>
                  <small>
                    {active.app.developer} · ID {active.app.id}
                  </small>
                </div>
              </div>
            </section>
            <nav className="workspace-nav" aria-label="Research views">
              {[
                ['research', 'Comparison matrix'],
                ['history', 'Observation history'],
                ['ideas', 'Keyword ideas'],
                ['listing', 'Listing studio'],
                ['data', 'Data & connections'],
              ].map(([id, label]) => (
                <Button variant={tab === id ? 'secondary' : 'ghost'}
                  key={id}
                  onClick={() => void go(() => setTab(id))}
                  aria-current={tab === id ? 'page' : undefined}
                >
                  {label}
                </Button>
              ))}
            </nav>
            {tab === 'research' && (
              <>
                <div className="workspace-tools">
                  <NativeDisclosure className="setup">
                    <NativeSummary>
                      Research setup{' '}
                      <span>
                        {active.keywords.length} keywords · {active.countries.length} countries
                      </span>
                    </NativeSummary>
                    <div className="setup-body">
                      <div>
                        <h3>Keywords to investigate</h3>
                        <label className="sr-only" htmlFor="keywords">
                          Add keywords
                        </label>
                        <UiTextarea
                          id="keywords"
                          value={keywords}
                          onChange={(e) => setKeywords(e.target.value)}
                          placeholder="One keyword per line, or separated by commas"
                          rows={3}
                          maxLength={16000}
                          disabled={busy}
                        />
                        <div className="button-row">
                          <Button variant="outline" disabled={busy || !keywords.trim()} onClick={() => addKeywords()}>
                            Add keywords
                          </Button>
                          <Button asChild variant="outline"><label className="file-button">
                            Import .txt / .csv
                            <Input
                              type="file"
                              accept=".txt,.csv,text/plain,text/csv"
                              disabled={busy}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file && file.size <= 16000)
                                  void file
                                    .text()
                                    .then(addKeywords)
                                    .catch((e) => setError(message(e)));
                                else if (file) setError('Keyword file exceeds 16 KB.');
                                e.target.value = '';
                              }}
                            />
                          </label></Button>
                        </div>
                        <div className="keyword-chips">
                          {active.keywords.map((term) => (
                            <Button variant="outline"
                              key={term}
                              disabled={busy}
                              aria-label={`Remove ${term}`}
                              onClick={() =>
                                updateProject({
                                  keywords: active.keywords.filter((t) => t !== term),
                                })
                              }
                            >
                              {term}
                              <span>×</span>
                            </Button>
                          ))}
                        </div>
                        <p className="caption">
                          Up to 60 terms. Imports accept comma-separated or one term per line.
                        </p>
                      </div>
                      <div>
                        <h3>Compare storefronts</h3>
                        <div className="country-picker">
                          {COUNTRIES.map(([code, name]) => (
                            <label key={code}>
                              <Input
                                type="checkbox"
                                checked={active.countries.includes(code)}
                                disabled={
                                  busy ||
                                  (!active.countries.includes(code) &&
                                    active.countries.length >= 10)
                                }
                                onChange={(e) =>
                                  updateProject({
                                    countries: e.target.checked
                                      ? [...active.countries, code]
                                      : active.countries.filter((c) => c !== code),
                                  })
                                }
                              />
                              <span>{code.toUpperCase()}</span>
                              {name}
                            </label>
                          ))}
                        </div>
                        <div className="button-row custom-country">
                          <label>
                            Another Apple storefront code
                            <Input
                              value={extraCountry}
                              onChange={(e) => setExtraCountry(e.target.value.toLowerCase())}
                              maxLength={2}
                              placeholder="e.g. ch"
                              disabled={busy}
                            />
                          </label>
                          <Button variant="outline"
                            disabled={busy || active.countries.length >= 10}
                            onClick={() => {
                              if (!/^[a-z]{2}$/u.test(extraCountry)) {
                                setError('Enter a two-letter Apple storefront country code.');
                                return;
                              }
                              updateProject({
                                countries: [...new Set([...active.countries, extraCountry])],
                              });
                              setExtraCountry('');
                            }}
                          >
                            Add storefront
                          </Button>
                        </div>
                        <div className="extra-countries">
                          {active.countries
                            .filter((c) => !COUNTRIES.some(([code]) => code === c))
                            .map((c) => (
                              <Button variant="outline"
                                key={c}
                                disabled={busy}
                                onClick={() =>
                                  updateProject({
                                    countries: active.countries.filter((v) => v !== c),
                                  })
                                }
                              >
                                {c.toUpperCase()} ×
                              </Button>
                            ))}
                        </div>
                        <div className="button-row">
                          <label>
                            Result coverage
                            <NativeSelect
                              disabled={busy}
                              value={active.limit}
                              onChange={(e) => {
                                updateProject({ limit: Number(e.target.value) });
                                setSelection(null);
                              }}
                            >
                              {[20, 50, 100, 200].map((n) => (
                                <option key={n} value={n}>
                                  {n} returned apps
                                </option>
                              ))}
                            </NativeSelect>
                          </label>
                          <label>
                            Refresh reminder
                            <NativeSelect
                              disabled={busy}
                              value={active.cadenceHours}
                              onChange={(e) =>
                                updateProject({ cadenceHours: Number(e.target.value) })
                              }
                            >
                              <option value={0}>Manual only</option>
                              <option value={24}>After 1 day</option>
                              <option value={72}>After 3 days</option>
                              <option value={168}>After 1 week</option>
                            </NativeSelect>
                          </label>
                        </div>
                        <label className="auto-refresh">
                          <Input
                            type="checkbox"
                            checked={active.autoRefresh}
                            disabled={busy || !active.cadenceHours || !navigator.locks}
                            onChange={(e) => updateProject({ autoRefresh: e.target.checked })}
                          />
                          Automatically collect when due while this project is open
                        </label>
                        {!navigator.locks && (
                          <p className="caption">
                            Automatic collection needs browser Web Locks support. Manual collection
                            remains available.
                          </p>
                        )}
                        <p className="caption">
                          Refresh runs only while this tab is open. A due opted-in project refreshes
                          when reopened. At most 60 cells per run; attempts reset the cadence,
                          including partial failures.
                        </p>
                      </div>
                    </div>
                  </NativeDisclosure>
                  <div className="collection-bar">
                    <div>
                      <span className={`status-dot ${due ? 'due' : ''}`} />
                      {lastCapture
                        ? `Last evidence ${time(lastCapture)}`
                        : 'No search observations yet'}
                      {due && <span className="due-label">Refresh due</span>}
                    </div>
                    <div className="button-row">
                      {!!failedKeys.length && (
                        <Button variant="outline" disabled={busy} onClick={() => void collect(failedKeys)}>
                          Retry {failedKeys.length} unavailable
                        </Button>
                      )}
                      {busy ? (
                        <Button variant="default" className="primary" onClick={() => runAbort.current?.abort()}>
                          Cancel collection
                        </Button>
                      ) : (
                        <Button variant="default"
                          className="primary"
                          disabled={
                            !active.keywords.length ||
                            !active.countries.length ||
                            status?.apple.enabled === false
                          }
                          onClick={() => void collect()}
                        >
                          ↻ Collect matrix
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                {run && (
                  <div className={`run-status ${run.failed ? 'partial' : ''}`} role="status">
                    <span>
                      {run.state === 'running' && <span className="spinner" />}
                      {run.label}
                    </span>
                    <span className="mono">
                      {run.done}/{run.total} complete
                      {run.failed ? ` · ${run.failed} unavailable` : ''}
                    </span>
                    <NativeProgress value={run.done} max={run.total} />
                  </div>
                )}
                {!active.keywords.length || !active.countries.length ? (
                  <div className="empty">
                    <span className="matrix-symbol">⊞</span>
                    <h2>Your first comparison starts with a word.</h2>
                    <p>
                      Add keywords and choose storefronts in Research setup, then collect the
                      matrix.
                    </p>
                    <Button variant="outline"
                      onClick={() => {
                        document.querySelector<HTMLDetailsElement>('.setup')!.open = true;
                        document.getElementById('keywords')?.focus();
                      }}
                    >
                      Add your first keywords →
                    </Button>
                  </div>
                ) : (
                  <>
                    <div
                      className="matrix-scroll"
                      tabIndex={0}
                      aria-label="Keyword comparison table, scroll horizontally for more countries"
                    >
                      <UiTable className="matrix">
                        <UiTableHeader>
                          <UiTableRow>
                            <UiTableHead scope="col">
                              KEYWORD <span>{active.keywords.length} TRACKED</span>
                            </UiTableHead>
                            {active.countries.map((c) => (
                              <UiTableHead scope="col" key={c}>
                                {c.toUpperCase()}
                                <small>{COUNTRIES.find(([code]) => code === c)?.[1] ?? c}</small>
                              </UiTableHead>
                            ))}
                          </UiTableRow>
                        </UiTableHeader>
                        <UiTableBody>
                          {active.keywords.map((term) => (
                            <UiTableRow key={term}>
                              <UiTableHead scope="row">
                                <strong>{term}</strong>
                                <small>{active.limit}-result coverage</small>
                              </UiTableHead>
                              {active.countries.map((country) => {
                                const key = {
                                  term,
                                  country,
                                  platform: active.platform,
                                  limit: active.limit,
                                };
                                const c = cell(workspace, active, key);
                                const selected =
                                  selection?.term === term && selection.country === country;
                                return (
                                  <UiTableCell key={country}>
                                    <Button variant="outline"
                                      className={`${selected ? 'selected' : ''} ${c.presence.kind}`}
                                      onClick={() => setSelection(key)}
                                      aria-label={`${term}, ${country.toUpperCase()}: ${c.presence.kind === 'found' ? `position ${c.presence.position}` : c.presence.kind}`}
                                      aria-pressed={selected}
                                    >
                                      <strong>
                                        {c.presence.kind === 'found'
                                          ? String(c.presence.position).padStart(2, '0')
                                          : c.presence.kind === 'not-in-returned-results'
                                            ? 'NF'
                                            : c.presence.kind === 'unavailable'
                                              ? '!'
                                              : '—'}
                                      </strong>
                                      <small>
                                        {c.presence.kind === 'found'
                                          ? 'API position'
                                          : c.presence.kind === 'not-in-returned-results'
                                            ? 'in returned set'
                                            : c.presence.kind === 'unavailable'
                                              ? 'unavailable'
                                              : 'not observed'}
                                        <span>{shortTime(c.observation?.fetchedAt)}</span>
                                      </small>
                                    </Button>
                                  </UiTableCell>
                                );
                              })}
                            </UiTableRow>
                          ))}
                        </UiTableBody>
                      </UiTable>
                    </div>
                    <div className="matrix-legend">
                      <span>
                        <b>01</b> Observed API position
                      </span>
                      <span>
                        <b>NF</b> Not found within returned results
                      </span>
                      <span>
                        <b>—</b> No observation
                      </span>
                      <span>
                        <b>!</b> Latest attempt failed
                      </span>
                    </div>
                  </>
                )}
                {selected && selection ? (
                  <Evidence
                    project={active}
                    keyValue={selection}
                    data={selected}
                    onRefresh={() => void collect([selection])}
                    busy={busy}
                  />
                ) : (
                  !!active.keywords.length && (
                    <div className="evidence-empty">
                      <span>↳</span>Select a cell to inspect its source and competitors.
                    </div>
                  )
                )}
                <div className="workspace-foot">
                  <span>Source-backed observations. No invented search volume.</span>
                  <Button variant="outline"
                    onClick={() =>
                      download(
                        `${active.app.id}-matrix.csv`,
                        exportCsv(workspace, active),
                        'text/csv;charset=utf-8',
                      )
                    }
                  >
                    Export this matrix ↗
                  </Button>
                </div>
              </>
            )}
            {tab === 'history' && (
              <section className="panel">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">CAPTURE LOG</span>
                    <h2>A history you can inspect.</h2>
                  </div>
                  <span className="pill">Up to 120 captures / 12 MB</span>
                </div>
                <p className="muted">
                  Trends compare successful evidence for the same keyword, country, platform and
                  coverage. Reusing a cached capture does not create a new trend point.
                </p>
                {!workspace.attempts.some((a) => a.projectId === active.id) ? (
                  <div className="empty small">
                    <h3>No collection attempts yet.</h3>
                    <p>Your first matrix collection will appear here.</p>
                    <Button variant="outline" onClick={() => void go(() => setTab('research'))}>Open matrix →</Button>
                  </div>
                ) : (
                  <div className="history-list">
                    {workspace.attempts
                      .filter((a) => a.projectId === active.id)
                      .slice()
                      .reverse()
                      .map((a) => {
                        const o =
                          a.status === 'success'
                            ? workspace.observations.find((o) => o.id === a.observationId)
                            : undefined;
                        const position = o?.apps.findIndex((v) => v.id === active.app.id);
                        return (
                          <article key={a.id}>
                            <span className={`history-state ${a.status}`}>
                              {a.status === 'success' ? '↗' : '!'}
                            </span>
                            <div>
                              <strong>{a.key.term}</strong>
                              <small>
                                {a.key.country.toUpperCase()} · {a.key.platform.toUpperCase()} ·{' '}
                                {a.key.limit} results · attempted {time(a.at)}
                              </small>
                              <p>
                                {a.status === 'failure'
                                  ? a.message
                                  : `${position !== undefined && position >= 0 ? `Position ${position + 1}` : 'Not in returned results'} · ${a.cache === 'hit' ? 'cached capture' : 'new capture'} from ${time(o?.fetchedAt)}`}
                              </p>
                            </div>
                            {o && (
                              <a href={o.sourceUrl} target="_blank" rel="noreferrer">
                                Source ↗
                              </a>
                            )}
                            <Button variant="outline"
                              onClick={() => {
                                setSelection(a.key);
                                setTab('research');
                              }}
                            >
                              Inspect cell
                            </Button>
                          </article>
                        );
                      })}
                  </div>
                )}
              </section>
            )}
            {tab === 'ideas' && (
              <Ideas
                project={active}
                status={status}
                add={(terms) => addKeywords(terms.join('\n'))}
                onError={setError}
              />
            )}
            {tab === 'listing' && (
              <Listing
                project={active}
                workspace={workspace}
                status={status}
                change={change}
                onError={setError}
                onNotice={setNotice}
                guard={draftGuard}
              />
            )}
            {tab === 'data' && (
              <section className="panel">
                <span className="eyebrow">OWN YOUR RESEARCH</span>
                <h2>A portable workspace. A clear boundary.</h2>
                <div className="data-grid">
                  <article className="data-card">
                    <h3>Local backups</h3>
                    <p>
                      Projects, observations, attempts and drafts live in this browser’s IndexedDB.
                      Clearing site data removes this local copy. Keep a JSON backup to move or
                      recover your work.
                    </p>
                    <div className="button-row">
                      <Button variant="default" className="primary" onClick={() => void exportBackup()}>
                        Download JSON backup
                      </Button>
                      <Button asChild variant="outline"><label className="file-button">
                        Preview JSON import
                        <Input
                          type="file"
                          accept=".json,application/json"
                          disabled={busy}
                          onChange={(e) => {
                            void previewBackup(e.target.files?.[0]);
                            e.target.value = '';
                          }}
                        />
                      </label></Button>
                    </div>
                    <p className="caption">
                      Version 1 · {workspace.projects.length}/20 projects ·{' '}
                      {workspace.observations.length}/120 captures · {workspace.drafts.length}/100
                      drafts · 12 MB import limit. Oldest captures and their success attempts are
                      trimmed at 120 captures or 12 MB, so every exported backup can be restored.
                    </p>
                  </article>
                  <article className="data-card">
                    <h3>Share a flat comparison</h3>
                    <p>
                      CSV includes cell states, positions, timestamps, sources and transparent
                      estimates. Missing and failed results stay distinct. CSV is for analysis; JSON
                      restores the full workspace.
                    </p>
                    <Button variant="outline"
                      onClick={() =>
                        download(
                          `${active.app.id}-matrix.csv`,
                          exportCsv(workspace, active),
                          'text/csv;charset=utf-8',
                        )
                      }
                    >
                      Export matrix CSV ↗
                    </Button>
                    <h4>Remove this local project</h4>
                    <p>
                      Back up first. Deletion removes this project’s attempts and drafts. Captures
                      referenced by another project are preserved.
                    </p>
                    <Button variant="outline"
                      disabled={busy}
                      onClick={() =>
                        void go(() => {
                          setDeleteReady(false);
                          deleteDialog.current?.showModal();
                        })
                      }
                    >
                      Review project deletion
                    </Button>
                    <h4>Storage status</h4>
                    <p>
                      {storageState}. Cross-tab writes use revision checks and atomic transactions.
                    </p>
                  </article>
                  <article className="data-card">
                    <h3>Connections</h3>
                    <div className="connection">
                      <span>Apple public search</span>
                      <b>
                        {status?.apple.enabled === true ? 'Connected' : status?.apple.enabled === false ? 'Unavailable' : statusError ? 'Not confirmed' : 'Checking…'}
                      </b>
                    </div>
                    <div className="connection">
                      <span>AI research assistant</span>
                      <b>{status?.ai.enabled ? 'Connected' : 'Not connected'}</b>
                    </div>
                    <p className="caption">
                      {status?.ai.reason || statusError || 'Checking service status…'}
                    </p>
                    <div className="connection">
                      <span>Apple Ads popularity</span>
                      <b>Not connected</b>
                    </div>
                    <div className="connection">
                      <span>App Store Connect</span>
                      <b>Not connected</b>
                    </div>
                    <p className="caption">
                      No popularity metric or publishing is available. Copy or export listing drafts
                      manually. No developer account is required for public observations.
                    </p>
                    <Button variant="outline" onClick={refreshStatus}>Check service status</Button>
                    {statusError && <p role="alert">{statusError}</p>}
                  </article>
                  <article className="data-card">
                    <h3>Collection contract</h3>
                    <p>
                      The shared collector spaces uncached Apple requests to at most 18 per minute.
                      Searches cache for 15 minutes; lookups for 6 hours. Cache hits keep their
                      original source time.
                    </p>
                    <p>
                      Only public Apple captures enter the server cache. Competitor descriptions are omitted from local observation history; the selected app’s description remains available for listing drafts. Your local keywords and
                      drafts are sent to AI only when you request a proposal. No accounts, remote
                      workspace sync or background collection.
                    </p>
                    <a href="/api/dashboard/v1/seo/app-store/status" target="_blank" rel="noreferrer">
                      Service status JSON ↗
                    </a>
                  </article>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
      <div className="research-footer">
        <span>
          <b>App Store SEO</b> · Public Apple observations and local drafts.
        </span>
        <span>Apple data belongs to its respective owners. Unaffiliated with Apple.</span>
        <div>
          <Button variant="outline" onClick={() => privacyDialog.current?.showModal()}>Privacy & methods</Button>
          <Button variant="outline" onClick={() => void exportBackup()}>Back up workspace</Button>
          <Button asChild variant="outline"><label className="file-button">
            Restore backup
            <Input
              type="file"
              accept=".json"
              disabled={busy}
              onChange={(e) => {
                void previewBackup(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </label></Button>
        </div>
      </div>
      <NativeDialog ref={deleteDialog}>
        {active && (
          <>
            <span className="eyebrow">LOCAL PROJECT DELETION</span>
            <h2>Delete {active.name}?</h2>
            <p>
              This removes {workspace.attempts.filter((a) => a.projectId === active.id).length}{' '}
              attempts and {workspace.drafts.filter((d) => d.projectId === active.id).length} drafts
              for this project from this browser. Shared captures stay available to other projects.
            </p>
            <label className="radio-choice">
              <Input
                type="checkbox"
                checked={deleteReady}
                onChange={(e) => setDeleteReady(e.target.checked)}
              />
              I have reviewed this local deletion and want to remove this project.
            </label>
            <div className="button-row">
              <Button variant="outline" onClick={() => void exportBackup('before-project-deletion.json')}>
                Back up workspace
              </Button>
              <Button variant="default"
                className="primary"
                disabled={!deleteReady}
                onClick={() =>
                  void go(async () => {
                    try {
                      await change((data) => removeProject(data, active.id));
                      deleteDialog.current?.close();
                      setProjectId(saved.current.data.projects[0]?.id ?? '');
                      setSelection(null);
                      setNotice(
                        'Local project deleted. Shared referenced captures were preserved.',
                      );
                    } catch (error) {
                      setError(message(error));
                    }
                  })
                }
              >
                Delete local project
              </Button>
              <Button variant="outline" onClick={() => deleteDialog.current?.close()}>Cancel</Button>
            </div>
          </>
        )}
      </NativeDialog>
      <NativeDialog ref={privacyDialog}>
        <span className="eyebrow">PRIVACY & METHODS</span>
        <h2>Keep the evidence. Keep control.</h2>
        <p>
          Projects, keyword lists, observations and drafts stay in this browser’s IndexedDB. No
          account or cloud workspace sync is provided. Clearing browser site data removes this copy;
          JSON backups let you restore it.
        </p>
        <p>
          When you search or collect, the query, platform and storefront go through our server to
          Apple’s public API. Only public Apple responses enter the bounded shared cache. App icons
          load from Apple’s artwork servers and send normal browser requests to Apple.
        </p>
        <p>
          AI receives public app metadata and the seed, locale or draft you submit only when you
          request a proposal. AI has global and per-client daily limits. Public requests use
          Turnstile verification and salted, hashed client identifiers for daily anti-abuse
          counters; raw IP addresses are not stored by this application.
        </p>
        <p>
          Public API positions may differ from the native App Store. NF means absent from the
          returned set, never a zero rank. Estimates use title phrase coverage and the rating
          footprint of returned competitors, with inputs shown beside each score. They do not
          measure search volume or official Apple difficulty.
        </p>
        <p>
          No background collection runs while this website is closed. Optional automatic refresh
          collects only an open, opted-in project when due. Collection attempts and original cache
          timestamps remain inspectable.
        </p>
        <p>
          Server observability samples requests with query strings redacted. This application does
          not log draft bodies or API keys.
        </p>
        <Button variant="default" className="primary" onClick={() => privacyDialog.current?.close()}>
          Close
        </Button>
      </NativeDialog>
      <NativeDialog ref={importDialog} className="import-dialog" onCancel={() => setImported(null)}>
        <span className="eyebrow">VALIDATED BACKUP PREVIEW</span>
        <h2>Bring this research into your browser.</h2>
        {imported && (
          <>
            <p>
              {imported.projects.length} projects · {imported.observations.length} captures ·{' '}
              {imported.attempts.length} attempts · {imported.drafts.length} listing drafts
            </p>
            <ul>
              {imported.projects.map((p) => (
                <li key={p.id}>
                  {p.name} · {p.platform.toUpperCase()} · {p.keywords.length} keywords
                </li>
              ))}
            </ul>
            <label className="radio-choice">
              <Input
                type="radio"
                checked={importMode === 'merge'}
                onChange={() => setImportMode('merge')}
              />
              Merge new records. Conflicting existing IDs reject the entire import.
            </label>
            <label className="radio-choice">
              <Input
                type="radio"
                checked={importMode === 'replace'}
                onChange={() => setImportMode('replace')}
              />
              Replace current workspace. Download a backup first if you want to keep it.
            </label>
            {importPreview && (
              <p className="caption">
                After {importMode}: {importPreview.workspace.projects.length} projects,{' '}
                {importPreview.workspace.observations.length} captures. Retention will trim{' '}
                {importPreview.trimmedCaptures} oldest captures and {importPreview.trimmedAttempts}{' '}
                associated or superseded attempts.
              </p>
            )}
            {importPreviewError && (
              <p role="alert">Nothing can be imported: {importPreviewError}</p>
            )}
            <p className="caption">
              The entire import commits in one transaction. Invalid records and conflicts leave the
              previous workspace intact.
            </p>
            <div className="button-row">
              <Button variant="outline" onClick={() => void exportBackup('before-import-backup.json')}>
                Back up current
              </Button>
              <Button variant="default"
                className="primary"
                disabled={!importPreview}
                onClick={() => void applyImport()}
              >
                Confirm {importMode}
              </Button>
              <Button variant="outline"
                onClick={() => {
                  setImported(null);
                  importDialog.current?.close();
                }}
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </NativeDialog>
    </div>
  );
}
function Evidence({
  project,
  keyValue,
  data,
  onRefresh,
  busy,
}: {
  project: Project;
  keyValue: SearchKey;
  data: ReturnType<typeof cell>;
  onRefresh: () => void;
  busy: boolean;
}) {
  const { observation, presence, previous } = data;
  const estimate = estimates(observation);
  return (
    <section className="evidence" aria-label="Selected cell evidence">
      <div className="evidence-top">
        <div>
          <span className="eyebrow">SELECTED OBSERVATION</span>
          <h2>
            {keyValue.term} <span>/ {keyValue.country.toUpperCase()}</span>
          </h2>
        </div>
        <span className="pill">
          {keyValue.platform.toUpperCase()} · up to {keyValue.limit} results
        </span>
        <Button variant="outline" disabled={busy} onClick={onRefresh}>
          ↻ {presence.kind === 'unavailable' ? 'Retry cell' : 'Refresh cell'}
        </Button>
      </div>
      {presence.kind === 'unavailable' && (
        <div className="alert error" role="status">
          Latest attempt failed: {presence.message}
          {observation
            ? ' The previous valid capture is preserved below.'
            : ' No observation was replaced.'}
        </div>
      )}
      <div className="evidence-grid">
        <section>
          <span className="eyebrow">
            {presence.kind === 'unavailable' ? 'LAST VALID CAPTURE' : 'OBSERVED PRESENCE'}
          </span>
          <div className="big-position">
            {observation
              ? (() => {
                  const n = observation.apps.findIndex((a) => a.id === project.app.id);
                  return n >= 0 ? String(n + 1).padStart(2, '0') : 'NF';
                })()
              : '—'}
          </div>
          <p>
            {observation
              ? observation.apps.some((a) => a.id === project.app.id)
                ? 'Position in the public Apple search API.'
                : 'App was not in the returned set. This does not establish a lower rank.'
              : 'Collect this cell to see where the selected app appears.'}
          </p>
          <div className="trend">{trend(project.app.id, observation, previous)}</div>
          {previous && (
            <p className="caption">
              Compared with {time(previous.fetchedAt)} · same search parameters
            </p>
          )}
          {observation?.notice && <p className="caption">{observation.notice}</p>}
          <dl className="evidence-facts">
            <div>
              <dt>Captured</dt>
              <dd>{time(observation?.fetchedAt)}</dd>
            </div>
            <div>
              <dt>Coverage</dt>
              <dd>
                {observation
                  ? `${observation.apps.length} returned / ${keyValue.limit} requested`
                  : 'No results captured'}
              </dd>
            </div>
            <div>
              <dt>Latest attempt</dt>
              <dd>{time(data.attempt?.at)}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>
                {data.attempt?.status === 'success'
                  ? data.attempt.cache === 'hit'
                    ? 'Public cache · original time kept'
                    : 'Fresh provider response'
                  : 'No successful latest attempt'}
              </dd>
            </div>
          </dl>
          {observation && (
            <>
              <a
                className="source-link"
                href={observation.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Inspect exact Apple source ↗
              </a>
              <NativeDisclosure className="source-details">
                <NativeSummary>Source parameters & ID</NativeSummary>
                <code>{observation.sourceUrl}</code>
                <code>Capture {observation.id}</code>
              </NativeDisclosure>
            </>
          )}
          <p className="caption">
            API order may differ from native App Store results. No Apple Ads popularity or absolute
            search volume is connected.
          </p>
        </section>
        <section>
          <div className="section-heading">
            <span className="eyebrow">RETURNED COMPETITORS</span>
            <span className="caption">
              First {Math.min(observation?.apps.length ?? 0, 20)} of {observation?.apps.length ?? 0}
            </span>
          </div>
          {!observation ? (
            <p className="muted">No competitor evidence yet.</p>
          ) : !observation.apps.length ? (
            <p className="muted">Apple returned an empty result set for this query.</p>
          ) : (
            <ol className="competitors">
              {observation.apps.slice(0, 20).map((app, i) => (
                <li key={app.id} className={app.id === project.app.id ? 'your-app' : ''}>
                  <span className="rank mono">{String(i + 1).padStart(2, '0')}</span>
                  <Icon app={app} />
                  <div>
                    <a href={app.url} target="_blank" rel="noreferrer">
                      {app.name} ↗
                    </a>
                    <small>{app.developer}</small>
                    <small>
                      {app.rating === null ? 'Rating unavailable' : `${app.rating.toFixed(1)} ★`} ·{' '}
                      {app.ratings === null
                        ? 'count unavailable'
                        : `${app.ratings.toLocaleString()} ratings`}
                      {app.id === project.app.id ? ' · SELECTED APP' : ''}
                    </small>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
        <section className="estimates">
          <span className="eyebrow">TRANSPARENT ESTIMATES</span>
          <h3>Signals, with their workings.</h3>
          <p className="caption">
            Heuristics describe this returned set. They are not Apple metrics, demand predictions or
            guaranteed difficulty.
          </p>
          {[
            ['Title targeting', estimate.targeting],
            ['Competition footprint', estimate.competition],
          ].map(([name, e]) => {
            const item = e as ReturnType<typeof estimates>['targeting'];
            return (
              <div className="estimate" key={String(name)}>
                <div>
                  <strong>{String(name)}</strong>
                  <b className="mono">
                    {item.value === null ? '—' : item.value}
                    <small>/100</small>
                  </b>
                </div>
                <p>{item.inputs}</p>
                <code>
                  {item.method} · {item.coverage} inputs
                </code>
              </div>
            );
          })}
          <p className="caption">
            Subtitles are not supplied by this public API; targeting uses app titles only. Rating
            counts may be missing or market-dependent. Source evidence is the selected capture.
          </p>
        </section>
      </div>
    </section>
  );
}
function Ideas({
  project,
  status,
  add,
  onError,
}: {
  project: Project;
  status: Status | null;
  add: (terms: string[]) => void;
  onError: (message: string) => void;
}) {
  const [seed, setSeed] = useState(project.app.genre);
  const [locale, setLocale] = useState('en-US');
  const [mode, setMode] = useState<'brainstorm' | 'localize'>('brainstorm');
  const [output, setOutput] = useState<AIOutput | null>(null);
  const [chosen, setChosen] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function generate() {
    const abort = new AbortController();
    controller.current = abort;
    setPending(true);
    onError('');
    try {
      const result = await askAI(
        {
          mode,
          appName: project.app.name,
          description: project.app.description.slice(0, 2000),
          seed,
          locale,
        },
        abort.signal,
      );
      setOutput(result);
      setChosen(result.kind === 'keywords' ? result.keywords.map((k) => k.term) : []);
    } catch (e) {
      if (!abort.signal.aborted) onError(message(e));
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">FROM HYPOTHESIS TO EVIDENCE</span>
          <h2>A useful next word.</h2>
          <p className="muted">
            Explore ideas, then collect them in the matrix. Suggestions are never observations.
          </p>
        </div>
        <span className="pill">
          {status?.ai.enabled ? 'AI connected' : 'Manual research available'}
        </span>
      </div>
      <div className="ideas-layout">
        <div className="data-card">
          <h3>Start with intent.</h3>
          <label>
            Task
            <NativeSelect value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
              <option value="brainstorm">Brainstorm related keywords</option>
              <option value="localize">Localize keyword ideas</option>
            </NativeSelect>
          </label>
          <label>
            Seed topics or keywords
            <UiTextarea
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              maxLength={600}
              rows={5}
              placeholder="The problems your app solves, or terms to localize"
            />
          </label>
          <label>
            Target language / locale
            <Input
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              maxLength={40}
              placeholder="e.g. de-DE"
            />
          </label>
          <p className="caption">
            {status?.ai.reason ?? 'Checking AI connection…'} Only this app’s public metadata, your
            seed and target locale are sent when you ask for ideas.
          </p>
          <div className="button-row">
            <Button variant="default"
              className="primary"
              disabled={
                !status?.ai.enabled || pending || !seed.trim()
              }
              onClick={() => void generate()}
            >
              {pending
                ? 'Thinking…'
                : mode === 'localize'
                  ? 'Suggest localized ideas'
                  : 'Suggest keyword ideas'}
            </Button>
            {pending && <Button variant="outline" onClick={() => controller.current?.abort()}>Cancel</Button>}
          </div>
          <hr />
          <h4>Work directly from your own ideas</h4>
          <p className="caption">Add comma-separated terms below. No AI connection required.</p>
          <Button variant="outline"
            disabled={!seed.trim()}
            onClick={() => {
              try {
                add(parseKeywords(seed));
              } catch (e) {
                onError(message(e));
              }
            }}
          >
            Add seed terms to matrix →
          </Button>
        </div>
        <div className="idea-results">
          {output?.kind === 'keywords' ? (
            <>
              <div className="section-heading">
                <h3>Research candidates</h3>
                <span className="pill">Unobserved · AI proposal</span>
              </div>
              {output.keywords.map((k) => (
                <label className="idea" key={k.term}>
                  <Input
                    type="checkbox"
                    checked={chosen.includes(k.term)}
                    onChange={(e) =>
                      setChosen(
                        e.target.checked ? [...chosen, k.term] : chosen.filter((t) => t !== k.term),
                      )
                    }
                  />
                  <span>
                    <strong>{k.term}</strong>
                    <small>{k.rationale}</small>
                  </span>
                </label>
              ))}
              <Button variant="default" className="primary" disabled={!chosen.length} onClick={() => add(chosen)}>
                Add {chosen.length} selected to matrix →
              </Button>
              <p className="caption">
                Locale words are hypotheses, distinct from storefront metadata. Validate language
                quality and intent before a collection.
              </p>
            </>
          ) : (
            <div className="empty">
              <span className="matrix-symbol">✳</span>
              <h3>Make room for the unexpected.</h3>
              <p>
                Suggestions will appear here with an explanation for each. Nothing enters the matrix
                until you choose it.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
function Listing({
  project,
  workspace,
  status,
  change,
  onError,
  onNotice,
  guard,
}: {
  project: Project;
  workspace: Workspace;
  status: Status | null;
  change: (update: (data: Workspace) => Workspace) => Promise<void>;
  onError: (message: string) => void;
  onNotice: (message: string) => void;
  guard: React.RefObject<() => Promise<boolean>>;
}) {
  const [locale, setLocale] = useState('en-US');
  const [localeInput, setLocaleInput] = useState('');
  const [draft, setDraft] = useState<ListingDraft | null>(null);
  const [proposal, setProposal] = useState<Extract<AIOutput, { kind: 'listing' }> | null>(null);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState('');
  const pendingDraft = useRef<ListingDraft | null>(null);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftBases = useRef(new Map<string, string | undefined>());
  const [draftSaving, setDraftSaving] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    setProposal(null);
    const existing = workspace.drafts.find(
      (d) => d.projectId === project.id && d.locale === locale,
    );
    draftBases.current.set(`${project.id}/${locale}`, existing?.updatedAt);
    setDraft(
      existing ?? {
        id: uid(),
        projectId: project.id,
        locale,
        name: project.app.name,
        subtitle: '',
        keywords: '',
        description: project.app.description,
        updatedAt: new Date().toISOString(),
      },
    );
  }, [project.id, locale]);
  useEffect(() => () => controller.current?.abort(), []);
  const inFlight = useRef<Promise<boolean> | null>(null);
  const [draftConflict, setDraftConflict] = useState<ListingDraft | null>(null);
  async function flushDraft(): Promise<boolean> {
    if (draftTimer.current) clearTimeout(draftTimer.current);
    if (inFlight.current) {
      if (!(await inFlight.current)) return false;
      return flushDraft();
    }
    const next = pendingDraft.current;
    if (!next) return true;
    pendingDraft.current = null;
    const task = (async () => {
      try {
        const key = `${next.projectId}/${next.locale}`;
        const committedAt = await persistDraft(change, next, draftBases.current.get(key));
        draftBases.current.set(key, committedAt);
        setDraftConflict(null);
        setDraftSaving(pendingDraft.current !== null);
        return true;
      } catch (error) {
        if (!pendingDraft.current) pendingDraft.current = next;
        setDraftSaving(true);
        if (error instanceof DraftConflictError) setDraftConflict(error.latest);
        onError(
          `Draft was not saved. ${message(error)} Your on-screen text remains available to export.`,
        );
        return false;
      }
    })();
    inFlight.current = task;
    const success = await task;
    if (inFlight.current === task) inFlight.current = null;
    return success && pendingDraft.current ? flushDraft() : success;
  }
  useEffect(() => {
    guard.current = flushDraft;
  });
  useEffect(() => {
    const hidden = () => {
      if (document.visibilityState === 'hidden') void flushDraft();
    };
    const beforeLeave = (event: BeforeUnloadEvent) => {
      if (pendingDraft.current || inFlight.current) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    document.addEventListener('visibilitychange', hidden);
    window.addEventListener('beforeunload', beforeLeave);
    return () => {
      guard.current = async () => true;
      document.removeEventListener('visibilitychange', hidden);
      window.removeEventListener('beforeunload', beforeLeave);
    };
  }, []);
  const changeLocale = async (next: string) => {
    if (await flushDraft()) setLocale(next);
  };
  const save = (next: ListingDraft) => {
    setDraft(next);
    pendingDraft.current = next;
    setDraftSaving(true);
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(flushDraft, 500);
  };
  const edit = (field: keyof ListingDraft, value: string) => {
    if (draft) save({ ...draft, [field]: value, updatedAt: new Date().toISOString() });
  };
  async function generate() {
    if (!draft) return;
    const abort = new AbortController();
    controller.current = abort;
    setPending(true);
    try {
      const result = await askAI(
        {
          mode: 'listing',
          appName: project.app.name,
          description: project.app.description.slice(0, 2000),
          seed: project.keywords.join(', ').slice(0, 600),
          locale,
          draft: {
            name: draft.name,
            subtitle: draft.subtitle,
            keywords: draft.keywords,
            description: draft.description.slice(0, 5000),
          },
        },
        abort.signal,
      );
      if (result.kind === 'listing') setProposal(result);
    } catch (e) {
      if (!abort.signal.aborted) onError(message(e));
    } finally {
      setPending(false);
    }
  }
  if (!draft) return <div className="empty">Opening local draft…</div>;
  const locales = [
    ...new Set([
      'en-US',
      'de-DE',
      'fr-FR',
      'ja-JP',
      ...workspace.drafts.filter((d) => d.projectId === project.id).map((d) => d.locale),
      locale,
    ]),
  ];
  const copy = async () => {
    flushDraft();
    try {
      await navigator.clipboard.writeText(
        `${draft.name}\n${draft.subtitle}\n\nKeywords: ${draft.keywords}\n\n${draft.description}`,
      );
      setCopied('Copied');
    } catch {
      onError('Clipboard is unavailable. Use Export draft instead.');
    }
  };
  return (
    <section className="panel listing">
      <div className="section-heading">
        <div>
          <span className="eyebrow">FROM RESEARCH TO A LISTING</span>
          <h2>The next version, in your words.</h2>
          <p className="muted">
            Local drafts with explicit budgets. Nothing is published to Apple.
          </p>
        </div>
        <span className="pill">
          {draftSaving ? 'Draft saving…' : 'Browser-local · edits autosave'}
        </span>
      </div>
      {draftConflict && (
        <div className="alert error" role="alert">
          <span>This locale changed in another tab. Your text is still on screen.</span>
          <div className="button-row">
            <Button variant="outline"
              onClick={() => {
                draftBases.current.set(`${project.id}/${locale}`, draftConflict.updatedAt);
                pendingDraft.current = draft;
                void flushDraft();
              }}
            >
              Keep my on-screen text
            </Button>
            <Button variant="outline"
              onClick={() => {
                if (draftTimer.current) clearTimeout(draftTimer.current);
                pendingDraft.current = null;
                draftBases.current.set(`${project.id}/${locale}`, draftConflict.updatedAt);
                setDraft(draftConflict);
                setDraftConflict(null);
                setDraftSaving(false);
              }}
            >
              Load saved text
            </Button>
            <Button variant="outline"
              onClick={() =>
                download(`${project.app.id}-${locale}-unsaved.json`, JSON.stringify(draft, null, 2))
              }
            >
              Export on-screen text
            </Button>
          </div>
        </div>
      )}
      <div className="locale-bar">
        <label>
          Draft locale
          <NativeSelect value={locale} onChange={(e) => void changeLocale(e.target.value)}>
            {locales.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </NativeSelect>
        </label>
        <label>
          Another locale
          <Input
            value={localeInput}
            onChange={(e) => setLocaleInput(e.target.value)}
            placeholder="e.g. pt-BR"
            maxLength={40}
          />
        </label>
        <Button variant="outline"
          onClick={() => {
            if (!/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/u.test(localeInput)) {
              onError('Use a locale such as pt-BR or en-GB.');
              return;
            }
            void changeLocale(localeInput);
            setLocaleInput('');
          }}
        >
          Open locale
        </Button>
      </div>
      <div className="listing-columns">
        <section className="listing-original">
          <span className="eyebrow">PUBLIC APP METADATA</span>
          <div className="listing-app">
            <Icon app={project.app} />
            <div>
              <h3>{project.app.name}</h3>
              <p>{project.app.developer}</p>
              <StoreLink app={project.app} />
              {project.appSourceNotice && <p className="caption">{project.appSourceNotice}</p>}
              {project.appSourceUrl && (
                <p className="caption">
                  Captured {time(project.appFetchedAt)} ·{' '}
                  <a href={project.appSourceUrl} target="_blank" rel="noreferrer">
                    Metadata source ↗
                  </a>
                </p>
              )}
            </div>
          </div>
          <div className="unavailable-field">
            Subtitle <span>Not supplied by the public API</span>
          </div>
          <div className="unavailable-field">
            Keyword field <span>Private in App Store Connect</span>
          </div>
          <NativeDisclosure>
            <NativeSummary>Returned public description</NativeSummary>
            <p className="description">{project.app.description || 'Not supplied.'}</p>
          </NativeDisclosure>
          <p className="caption">
            Metadata comes from the selected app’s public API response. A country lookup does not
            guarantee language-specific text. Use this as a reference, then verify the locale in App
            Store Connect.
          </p>
          <div className="audit">
            <span className="eyebrow">LOCAL LISTING AUDIT</span>
            <h3>Before you move it over.</h3>
            <ul>
              {auditDraft(draft).map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
            <p className="caption">
              Name, subtitle and description use Unicode code points. Keywords use the stricter 100
              UTF-8 byte budget in App Store Connect’s reference; localized characters may use
              multiple bytes. Apple’s final validation is authoritative.
            </p>
            <a
              className="caption"
              href="https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information"
              target="_blank"
              rel="noreferrer"
            >
              Apple’s field limits ↗
            </a>
          </div>
        </section>
        <section className="draft-editor">
          <div className="section-heading">
            <h3>{locale} draft</h3>
            <span className="caption">
              {workspace.drafts.some((d) => d.id === draft.id)
                ? `Saved ${shortTime(draft.updatedAt)}`
                : 'Edit a field to save this new locale'}
            </span>
          </div>
          {(
            [
              ['name', 'App name', 30, 200],
              ['subtitle', 'Subtitle', 30, 200],
              ['keywords', 'Keywords · comma-separated', 100, 1000],
              ['description', 'Description', 4000, 15000],
            ] as const
          ).map(([field, label, budget, max]) => {
            const count =
              field === 'keywords' ? keywordBytes(draft[field]) : Array.from(draft[field]).length;
            return (
              <label className="draft-field" key={field}>
                <span>
                  {label}
                  <small className={count > budget ? 'over' : ''}>
                    {count} / {budget}
                    {field === 'keywords' ? ' bytes' : ''}
                  </small>
                </span>
                {field === 'description' ? (
                  <UiTextarea
                    aria-label={label}
                    value={draft[field]}
                    onChange={(e) => edit(field, e.target.value)}
                    rows={9}
                    maxLength={max}
                  />
                ) : (
                  <Input
                    aria-label={label}
                    value={draft[field]}
                    onChange={(e) => edit(field, e.target.value)}
                    maxLength={max}
                  />
                )}
              </label>
            );
          })}
          <div className="button-row">
            <Button variant="outline" onClick={() => void copy()}>{copied || 'Copy listing'}</Button>
            <Button variant="outline"
              onClick={() => {
                flushDraft();
                download(`${project.app.id}-${locale}-draft.json`, JSON.stringify(draft, null, 2));
              }}
            >
              Export draft ↗
            </Button>
            <Button variant="outline"
              onClick={() => {
                save({ ...draft, updatedAt: new Date().toISOString() });
                flushDraft();
                onNotice('Draft save requested. The header reports its durable save status.');
              }}
            >
              Save draft
            </Button>
          </div>
          <p className="caption">
            App Store Connect is not connected. Review and copy your approved text manually.
          </p>
        </section>
      </div>
      <div className="ai-listing">
        <div>
          <span className="eyebrow">OPTIONAL / AI EDITOR</span>
          <h3>Ask for a considered alternative.</h3>
          <p className="caption">
            {status?.ai.reason ?? 'Checking AI status…'} A proposal is shown before you apply it.
            Your existing draft is preserved on failure.
          </p>
        </div>
        <div className="button-row">
          <Button variant="outline"
            disabled={!status?.ai.enabled || pending}
            onClick={() => void generate()}
          >
            {pending ? 'Preparing proposal…' : 'Propose a listing draft'}
          </Button>
          {pending && <Button variant="outline" onClick={() => controller.current?.abort()}>Cancel</Button>}
        </div>
      </div>
      {proposal && (
        <section className="proposal">
          <div className="section-heading">
            <h3>Proposed changes · {locale}</h3>
            <span className="pill">Review before applying</span>
          </div>
          <div className="proposal-fields">
            {(['name', 'subtitle', 'keywords', 'description'] as const).map((field) => (
              <div key={field}>
                <span className="eyebrow">{field}</span>
                <p>{proposal[field]}</p>
                <small>Current: {draft[field] || 'Empty'}</small>
              </div>
            ))}
          </div>
          <p>{proposal.notes}</p>
          <div className="button-row">
            <Button variant="default"
              className="primary"
              onClick={() => {
                save({
                  ...draft,
                  name: proposal.name,
                  subtitle: proposal.subtitle,
                  keywords: proposal.keywords,
                  description: proposal.description,
                  updatedAt: new Date().toISOString(),
                });
                flushDraft();
                setProposal(null);
              }}
            >
              Apply proposal to local draft
            </Button>
            <Button variant="outline" onClick={() => setProposal(null)}>Discard proposal</Button>
          </div>
        </section>
      )}
    </section>
  );
}
