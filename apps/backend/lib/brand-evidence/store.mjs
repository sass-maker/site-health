import { createHash, randomUUID } from 'node:crypto';
import { chmodSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(moduleDirectory, 'schema.sql');

export const CHANNELS = Object.freeze(['api-model', 'consumer-assistant']);
export const OBSERVATION_STATUSES = Object.freeze(['completed', 'unavailable', 'error']);
export const FINDING_STATUSES = Object.freeze(['new', 'reviewed', 'dismissed', 'resolved']);
export const ACTION_STATUSES = Object.freeze(['open', 'completed']);
export const SCHEDULES = Object.freeze(['daily', 'weekly']);

const LIST_LIMITS = Object.freeze({ aliases: 10, competitors: 20, keywords: 20, topics: 10, communities: 5 });

export class BrandEvidenceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'BrandEvidenceError';
    this.statusCode = statusCode;
  }
}

export function defaultBrandEvidencePath({ home = process.env.HOME } = {}) {
  if (!home) throw new Error('HOME is required to resolve the brand evidence database path');
  return join(home, 'Library', 'Application Support', 'Fleet Ops', 'founder-control', 'brand-evidence.sqlite');
}

export function observationFingerprint({ projectId, channel, provider, model, promptText, observedAt, status, answerText }) {
  return createHash('sha256')
    .update([projectId, channel, provider, model, promptText, observedAt, status, answerText ?? ''].join('\u0000'))
    .digest('hex');
}

export function normalizeTimestamp(value, label = 'timestamp') {
  if (typeof value !== 'string' || !value.trim()) throw new BrandEvidenceError(`${label} is required`);
  const trimmed = value.trim();
  // D1 `datetime('now')` stores UTC as `YYYY-MM-DD HH:MM:SS` without a zone.
  const candidate = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/.test(trimmed)
    ? `${trimmed.replace(' ', 'T')}Z`
    : trimmed;
  const parsed = Date.parse(candidate);
  if (!Number.isFinite(parsed)) throw new BrandEvidenceError(`${label} must be a timestamp`);
  return new Date(parsed).toISOString();
}

function text(value, label, { max = 500, required = false } = {}) {
  if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
    if (required) throw new BrandEvidenceError(`${label} is required`);
    return null;
  }
  if (typeof value !== 'string') throw new BrandEvidenceError(`${label} must be text`);
  return value.trim().slice(0, max);
}

function stringList(value, label, max) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new BrandEvidenceError(`${label} must be a list`);
  return [...new Set(value.map((item) => text(item, label, { max: 200 })).filter(Boolean))].slice(0, max);
}

function competitorList(value) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new BrandEvidenceError('competitors must be a list');
  return value
    .map((item) => (typeof item === 'string' ? { name: item } : item))
    .map((item) => ({
      name: text(item?.name, 'competitor name', { max: 120, required: true }),
      ...(item?.url ? { url: text(item.url, 'competitor url', { max: 300 }) } : {}),
    }))
    .slice(0, LIST_LIMITS.competitors);
}

// Provider settings never hold a credential. A custom endpoint keeps only its
// URL and model; the key is resolved at run time from the owner's environment.
export function normalizeProviderSettings(value = { mode: 'free-ai' }) {
  const mode = value?.mode ?? 'free-ai';
  for (const key of Object.keys(value ?? {})) {
    if (/key|token|secret|password|authorization/i.test(key) && key !== 'keyPresentAtSource') {
      throw new BrandEvidenceError('provider settings must not contain credentials');
    }
  }
  if (mode === 'free-ai') return { mode };
  if (mode !== 'custom-endpoint') throw new BrandEvidenceError('provider mode must be free-ai or custom-endpoint');
  const endpointUrl = text(value.endpointUrl, 'endpointUrl', { max: 300, required: true });
  let parsed;
  try {
    parsed = new URL(endpointUrl);
  } catch {
    throw new BrandEvidenceError('endpointUrl must be a URL');
  }
  if (parsed.protocol !== 'https:') throw new BrandEvidenceError('endpointUrl must use https');
  return {
    mode,
    endpointUrl: parsed.href,
    model: text(value.model, 'model', { max: 120, required: true }),
    ...(value.keyPresentAtSource ? { keyPresentAtSource: true } : {}),
  };
}

function parseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function boolOrNull(value) {
  return value === null || value === undefined ? null : Boolean(value);
}

function profileRow(row) {
  if (!row) return null;
  return {
    projectId: row.project_id,
    brandName: row.brand_name,
    aliases: parseJson(row.aliases_json, []),
    brandUrl: row.brand_url,
    competitors: parseJson(row.competitors_json, []),
    keywords: parseJson(row.keywords_json, []),
    targetCustomer: row.target_customer,
    topics: parseJson(row.topics_json, []),
    communities: parseJson(row.communities_json, []),
    schedule: row.schedule,
    provider: parseJson(row.provider_json, { mode: 'free-ai' }),
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function observationRow(row) {
  return {
    id: row.id,
    projectId: row.project_id,
    checkId: row.check_id,
    channel: row.channel,
    provider: row.provider,
    model: row.model,
    promptId: row.prompt_id,
    promptText: row.prompt_text,
    status: row.status,
    errorMessage: row.error_message,
    answerText: row.answer_text,
    citations: parseJson(row.citations_json, []),
    brandMentioned: boolOrNull(row.brand_mentioned),
    brandPosition: row.brand_position,
    brandSentiment: row.brand_sentiment,
    competitors: parseJson(row.competitors_json, []),
    brandCited: boolOrNull(row.brand_cited),
    latencyMs: row.latency_ms,
    observedAt: row.observed_at,
    source: row.source,
  };
}

function checkRow(row) {
  return {
    id: row.id,
    projectId: row.project_id,
    channel: row.channel,
    trigger: row.trigger,
    status: row.status,
    sourceStatus: row.source_status,
    attempted: row.attempted,
    completed: row.completed,
    failed: row.failed,
    mentionRate: row.mention_rate,
    summary: row.summary,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    source: row.source,
  };
}

function findingRow(row) {
  return {
    id: row.id,
    projectId: row.project_id,
    source: row.source,
    sourceName: row.source_name,
    title: row.title,
    content: row.content,
    url: row.url,
    author: row.author,
    publishedAt: row.published_at,
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
    engagementScore: row.engagement_score,
    commentCount: row.comment_count,
    relevanceScore: row.relevance_score,
    intent: row.intent,
    matchedKeywords: parseJson(row.matched_keywords_json, []),
    status: row.status,
    origin: row.origin,
  };
}

function actionRow(row) {
  return {
    id: row.id,
    projectId: row.project_id,
    subjectKind: row.subject_kind,
    subjectId: row.subject_id,
    title: row.title,
    status: row.status,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    source: row.source,
  };
}

function historyRow(row) {
  return {
    id: row.id,
    projectId: row.project_id,
    subjectKind: row.subject_kind,
    subjectId: row.subject_id,
    action: row.action,
    note: row.note,
    createdAt: row.created_at,
    source: row.source,
  };
}

function boundedLimit(value, fallback, max) {
  const number = Number(value ?? fallback);
  return Number.isInteger(number) && number > 0 ? Math.min(number, max) : fallback;
}

export class BrandEvidenceStore {
  constructor({ databasePath = defaultBrandEvidencePath() } = {}) {
    this.databasePath = databasePath;
    if (databasePath !== ':memory:') mkdirSync(dirname(databasePath), { recursive: true, mode: 0o700 });
    this.database = new DatabaseSync(databasePath);
    if (databasePath !== ':memory:') chmodSync(databasePath, 0o600);
    this.database.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
    this.database.exec(readFileSync(schemaPath, 'utf8'));
    this.database
      .prepare('INSERT OR IGNORE INTO brand_evidence_migrations(version, applied_at) VALUES (1, ?)')
      .run(new Date().toISOString());
  }

  close() {
    this.database.close();
  }

  transaction(work) {
    this.database.exec('BEGIN IMMEDIATE');
    try {
      const result = work();
      this.database.exec('COMMIT');
      return result;
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }

  // Profiles -----------------------------------------------------------------

  getProfile(projectId) {
    return profileRow(this.database.prepare('SELECT * FROM brand_profiles WHERE project_id = ?').get(projectId));
  }

  normalizeProfile(input) {
    const schedule = input.schedule ?? null;
    if (schedule !== null && !SCHEDULES.includes(schedule)) {
      throw new BrandEvidenceError('schedule must be daily, weekly, or null');
    }
    return {
      brandName: text(input.brandName, 'brandName', { max: 120, required: true }),
      aliases: stringList(input.aliases, 'aliases', LIST_LIMITS.aliases),
      brandUrl: text(input.brandUrl, 'brandUrl', { max: 300 }),
      competitors: competitorList(input.competitors),
      keywords: stringList(input.keywords, 'keywords', LIST_LIMITS.keywords),
      targetCustomer: text(input.targetCustomer, 'targetCustomer', { max: 200 }),
      topics: stringList(input.topics, 'topics', LIST_LIMITS.topics),
      communities: stringList(input.communities, 'communities', LIST_LIMITS.communities),
      schedule,
      provider: normalizeProviderSettings(input.provider ?? { mode: 'free-ai' }),
    };
  }

  saveProfile(projectId, input, { source = 'site-health', sourceRecordId = null, importBatchId = null, now = new Date().toISOString() } = {}) {
    const profile = this.normalizeProfile(input);
    const existing = this.getProfile(projectId);
    this.database.prepare(`
      INSERT INTO brand_profiles(project_id, brand_name, aliases_json, brand_url, competitors_json, keywords_json,
        target_customer, topics_json, communities_json, schedule, provider_json, source, source_record_id,
        import_batch_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(project_id) DO UPDATE SET
        brand_name = excluded.brand_name, aliases_json = excluded.aliases_json, brand_url = excluded.brand_url,
        competitors_json = excluded.competitors_json, keywords_json = excluded.keywords_json,
        target_customer = excluded.target_customer, topics_json = excluded.topics_json,
        communities_json = excluded.communities_json, schedule = excluded.schedule,
        provider_json = excluded.provider_json, updated_at = excluded.updated_at
    `).run(
      projectId,
      profile.brandName,
      JSON.stringify(profile.aliases),
      profile.brandUrl,
      JSON.stringify(profile.competitors),
      JSON.stringify(profile.keywords),
      profile.targetCustomer,
      JSON.stringify(profile.topics),
      JSON.stringify(profile.communities),
      profile.schedule,
      JSON.stringify(profile.provider),
      existing?.source ?? source,
      sourceRecordId,
      importBatchId,
      existing?.createdAt ?? now,
      now,
    );
    return this.getProfile(projectId);
  }

  listProfiles() {
    return this.database.prepare(`
      SELECT p.project_id, p.brand_name, p.schedule, p.source,
        (SELECT COUNT(*) FROM evidence_observations o WHERE o.project_id = p.project_id) AS observations,
        (SELECT MAX(observed_at) FROM evidence_observations o WHERE o.project_id = p.project_id) AS last_observed_at,
        (SELECT COUNT(*) FROM community_findings f WHERE f.project_id = p.project_id) AS findings,
        (SELECT COUNT(*) FROM evidence_actions a WHERE a.project_id = p.project_id AND a.status = 'open') AS open_actions
      FROM brand_profiles p ORDER BY p.brand_name COLLATE NOCASE
    `).all().map((row) => ({
      projectId: row.project_id,
      brandName: row.brand_name,
      schedule: row.schedule,
      source: row.source,
      observations: row.observations,
      lastObservedAt: row.last_observed_at,
      findings: row.findings,
      openActions: row.open_actions,
    }));
  }

  // Prompts ------------------------------------------------------------------

  addPrompt(projectId, promptText, { category = null, source = 'site-health', sourceRecordId = null, importBatchId = null, now = new Date().toISOString(), id = randomUUID() } = {}) {
    const value = text(promptText, 'prompt', { max: 2000, required: true });
    this.database.prepare(`
      INSERT INTO evidence_prompts(id, project_id, prompt_text, category, source, source_record_id, import_batch_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, projectId, value, text(category, 'category', { max: 80 }), source, sourceRecordId, importBatchId, now);
    return { id, projectId, promptText: value, category };
  }

  listPrompts(projectId) {
    return this.database
      .prepare('SELECT * FROM evidence_prompts WHERE project_id = ? ORDER BY created_at, rowid')
      .all(projectId)
      .map((row) => ({ id: row.id, projectId: row.project_id, promptText: row.prompt_text, category: row.category, source: row.source }));
  }

  // Checks and observations ----------------------------------------------------

  createCheck({ id = randomUUID(), projectId, channel = 'api-model', trigger = 'manual', status = 'running', sourceStatus = null, attempted = 0, completed = 0, failed = 0, mentionRate = null, summary = null, startedAt, finishedAt = null, source = 'site-health', sourceRecordId = null, importBatchId = null }) {
    if (!CHANNELS.includes(channel)) throw new BrandEvidenceError('unknown evidence channel');
    this.database.prepare(`
      INSERT INTO evidence_checks(id, project_id, channel, trigger, status, source_status, attempted, completed, failed,
        mention_rate, summary, started_at, finished_at, source, source_record_id, import_batch_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, projectId, channel, trigger, status, sourceStatus, attempted, completed, failed, mentionRate, summary,
      startedAt, finishedAt, source, sourceRecordId, importBatchId);
    return id;
  }

  finishCheck(id, { status, attempted, completed, failed, mentionRate, summary, finishedAt }) {
    this.database.prepare(`
      UPDATE evidence_checks SET status = ?, attempted = ?, completed = ?, failed = ?, mention_rate = ?, summary = ?, finished_at = ?
      WHERE id = ?
    `).run(status, attempted, completed, failed, mentionRate, summary, finishedAt, id);
  }

  listChecks(projectId, { limit = 20 } = {}) {
    return this.database
      .prepare('SELECT * FROM evidence_checks WHERE project_id = ? ORDER BY started_at DESC, id LIMIT ?')
      .all(projectId, boundedLimit(limit, 20, 200))
      .map(checkRow);
  }

  lastCheck(projectId) {
    const row = this.database
      .prepare("SELECT * FROM evidence_checks WHERE project_id = ? AND channel = 'api-model' ORDER BY started_at DESC LIMIT 1")
      .get(projectId);
    return row ? checkRow(row) : null;
  }

  findObservationByFingerprint(projectId, fingerprint) {
    return this.database
      .prepare('SELECT id FROM evidence_observations WHERE project_id = ? AND fingerprint = ? LIMIT 1')
      .get(projectId, fingerprint)?.id ?? null;
  }

  normalizeObservation(input) {
    if (!CHANNELS.includes(input.channel)) throw new BrandEvidenceError('observation channel must be api-model or consumer-assistant');
    if (!OBSERVATION_STATUSES.includes(input.status)) {
      throw new BrandEvidenceError('observation status must be completed, unavailable, or error');
    }
    const completed = input.status === 'completed';
    if (completed && !(typeof input.answerText === 'string' && input.answerText.trim())) {
      throw new BrandEvidenceError('a completed observation requires its answer text');
    }
    const analysis = completed ? input.analysis ?? {} : {};
    return {
      id: input.id ?? randomUUID(),
      projectId: text(input.projectId, 'projectId', { max: 120, required: true }),
      checkId: input.checkId ?? null,
      channel: input.channel,
      provider: text(input.provider, 'provider', { max: 80, required: true }),
      model: text(input.model, 'model', { max: 160 }) ?? 'unknown',
      promptId: input.promptId ?? null,
      promptText: text(input.promptText, 'promptText', { max: 4000, required: true }),
      status: input.status,
      errorMessage: completed ? null : text(input.errorMessage, 'errorMessage', { max: 300 }) ?? 'Provider unavailable',
      answerText: completed ? input.answerText : null,
      citations: completed ? (analysis.citations ?? []).slice(0, 50) : [],
      // Failures carry no verdict. NULL is "not observed", never "not mentioned".
      brandMentioned: completed ? Boolean(analysis.brandMentioned) : null,
      brandPosition: completed && Number.isInteger(analysis.brandPosition) ? analysis.brandPosition : null,
      brandSentiment: completed ? analysis.brandSentiment ?? null : null,
      competitors: completed ? analysis.competitorsMentioned ?? [] : [],
      brandCited: completed ? Boolean(analysis.brandCited) : null,
      latencyMs: Number.isFinite(input.latencyMs) ? Math.round(input.latencyMs) : null,
      observedAt: normalizeTimestamp(input.observedAt, 'observedAt'),
      source: input.source ?? 'site-health',
      sourceRecordId: input.sourceRecordId ?? null,
      importBatchId: input.importBatchId ?? null,
    };
  }

  recordObservation(input) {
    const observation = this.normalizeObservation(input);
    const fingerprint = observationFingerprint(observation);
    this.database.prepare(`
      INSERT INTO evidence_observations(id, project_id, check_id, channel, provider, model, prompt_id, prompt_text, status,
        error_message, answer_text, citations_json, brand_mentioned, brand_position, brand_sentiment, competitors_json,
        brand_cited, latency_ms, observed_at, fingerprint, source, source_record_id, import_batch_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      observation.id, observation.projectId, observation.checkId, observation.channel, observation.provider,
      observation.model, observation.promptId, observation.promptText, observation.status, observation.errorMessage,
      observation.answerText, JSON.stringify(observation.citations),
      observation.brandMentioned === null ? null : Number(observation.brandMentioned),
      observation.brandPosition, observation.brandSentiment, JSON.stringify(observation.competitors),
      observation.brandCited === null ? null : Number(observation.brandCited),
      observation.latencyMs, observation.observedAt, fingerprint, observation.source, observation.sourceRecordId,
      observation.importBatchId,
    );
    return { id: observation.id, fingerprint };
  }

  listObservations(projectId, { limit = 50 } = {}) {
    return this.database
      .prepare('SELECT * FROM evidence_observations WHERE project_id = ? ORDER BY observed_at DESC, id LIMIT ?')
      .all(projectId, boundedLimit(limit, 50, 500))
      .map(observationRow);
  }

  // Findings, actions and history --------------------------------------------

  listFindings(projectId, { limit = 50 } = {}) {
    return this.database.prepare(`
      SELECT * FROM community_findings WHERE project_id = ?
      ORDER BY CASE status WHEN 'new' THEN 0 WHEN 'reviewed' THEN 1 WHEN 'resolved' THEN 2 ELSE 3 END,
        relevance_score DESC, COALESCE(published_at, first_seen_at) DESC
      LIMIT ?
    `).all(projectId, boundedLimit(limit, 50, 500)).map(findingRow);
  }

  subjectExists(projectId, subjectKind, subjectId) {
    const table = { observation: 'evidence_observations', finding: 'community_findings', check: 'evidence_checks' }[subjectKind];
    if (!table) throw new BrandEvidenceError('subjectKind must be observation, finding, or check');
    return Boolean(this.database.prepare(`SELECT 1 FROM ${table} WHERE id = ? AND project_id = ?`).get(subjectId, projectId));
  }

  appendHistory({ projectId, subjectKind, subjectId, action, note = null, createdAt = new Date().toISOString(), source = 'site-health', sourceRecordId = null, importBatchId = null, id = randomUUID() }) {
    this.database.prepare(`
      INSERT INTO evidence_history(id, project_id, subject_kind, subject_id, action, note, created_at, source, source_record_id, import_batch_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, projectId, subjectKind, subjectId, action, note, createdAt, source, sourceRecordId, importBatchId);
    return id;
  }

  updateFindingStatus(projectId, findingId, { status, note = null, now = new Date().toISOString() }) {
    if (!FINDING_STATUSES.includes(status)) throw new BrandEvidenceError('finding status must be new, reviewed, dismissed, or resolved');
    return this.transaction(() => {
      const result = this.database
        .prepare('UPDATE community_findings SET status = ? WHERE id = ? AND project_id = ?')
        .run(status, findingId, projectId);
      if (result.changes === 0) throw new BrandEvidenceError('finding not found', 404);
      this.appendHistory({
        projectId,
        subjectKind: 'finding',
        subjectId: findingId,
        action: status === 'new' ? 'reopened' : status,
        note: text(note, 'note', { max: 500 }),
        createdAt: now,
      });
      return findingRow(this.database.prepare('SELECT * FROM community_findings WHERE id = ?').get(findingId));
    });
  }

  createAction(projectId, { subjectKind, subjectId, title = null, now = new Date().toISOString() }) {
    if (!this.subjectExists(projectId, subjectKind, String(subjectId ?? ''))) {
      throw new BrandEvidenceError(`${subjectKind} not found in this project`, 404);
    }
    const label = text(title, 'title', { max: 200 }) ?? `Follow up ${subjectKind} evidence`;
    const id = randomUUID();
    return this.transaction(() => {
      this.database.prepare(`
        INSERT INTO evidence_actions(id, project_id, subject_kind, subject_id, title, status, created_at, source)
        VALUES (?, ?, ?, ?, ?, 'open', ?, 'site-health')
      `).run(id, projectId, subjectKind, subjectId, label, now);
      this.appendHistory({ projectId, subjectKind, subjectId, action: 'action-created', note: label, createdAt: now });
      return actionRow(this.database.prepare('SELECT * FROM evidence_actions WHERE id = ?').get(id));
    });
  }

  updateActionStatus(projectId, actionId, { status, now = new Date().toISOString() }) {
    if (!ACTION_STATUSES.includes(status)) throw new BrandEvidenceError('action status must be open or completed');
    return this.transaction(() => {
      const result = this.database.prepare(`
        UPDATE evidence_actions SET status = ?, completed_at = ? WHERE id = ? AND project_id = ?
      `).run(status, status === 'completed' ? now : null, actionId, projectId);
      if (result.changes === 0) throw new BrandEvidenceError('action not found', 404);
      const action = actionRow(this.database.prepare('SELECT * FROM evidence_actions WHERE id = ?').get(actionId));
      this.appendHistory({
        projectId,
        subjectKind: action.subjectKind,
        subjectId: action.subjectId,
        action: status === 'completed' ? 'action-completed' : 'action-reopened',
        note: action.title,
        createdAt: now,
      });
      return action;
    });
  }

  listActions(projectId, { limit = 50 } = {}) {
    return this.database.prepare(`
      SELECT * FROM evidence_actions WHERE project_id = ?
      ORDER BY CASE status WHEN 'open' THEN 0 ELSE 1 END, created_at DESC LIMIT ?
    `).all(projectId, boundedLimit(limit, 50, 500)).map(actionRow);
  }

  listHistory(projectId, { limit = 30 } = {}) {
    return this.database
      .prepare('SELECT * FROM evidence_history WHERE project_id = ? ORDER BY created_at DESC, id LIMIT ?')
      .all(projectId, boundedLimit(limit, 30, 500))
      .map(historyRow);
  }

  // Coverage is counted per channel and per status so an API model check and a
  // consumer-assistant capture are never blended, and failures never dilute the
  // mention rate.
  summary(projectId) {
    const rows = this.database.prepare(`
      SELECT channel, status, COUNT(*) AS count, SUM(CASE WHEN brand_mentioned = 1 THEN 1 ELSE 0 END) AS mentioned,
        SUM(CASE WHEN brand_cited = 1 THEN 1 ELSE 0 END) AS cited, MAX(observed_at) AS last_observed_at
      FROM evidence_observations WHERE project_id = ? GROUP BY channel, status
    `).all(projectId);
    const channels = Object.fromEntries(CHANNELS.map((channel) => {
      const own = rows.filter((row) => row.channel === channel);
      const count = (status) => own.find((row) => row.status === status)?.count ?? 0;
      const completedRow = own.find((row) => row.status === 'completed');
      const completed = count('completed');
      return [channel, {
        completed,
        unavailable: count('unavailable'),
        error: count('error'),
        mentioned: completedRow?.mentioned ?? 0,
        cited: completedRow?.cited ?? 0,
        mentionRate: completed > 0 ? (completedRow.mentioned ?? 0) / completed : null,
        lastObservedAt: own.map((row) => row.last_observed_at).filter(Boolean).sort().at(-1) ?? null,
      }];
    }));
    const findingCounts = Object.fromEntries(FINDING_STATUSES.map((status) => [status, 0]));
    for (const row of this.database
      .prepare('SELECT status, COUNT(*) AS count FROM community_findings WHERE project_id = ? GROUP BY status')
      .all(projectId)) findingCounts[row.status] = row.count;
    const openActions = this.database
      .prepare("SELECT COUNT(*) AS count FROM evidence_actions WHERE project_id = ? AND status = 'open'")
      .get(projectId).count;
    return { channels, findings: findingCounts, openActions };
  }

  projectView(projectId, { observationLimit = 50 } = {}) {
    return {
      schemaVersion: 'site-health.brand-evidence.v1',
      projectId,
      profile: this.getProfile(projectId),
      prompts: this.listPrompts(projectId),
      summary: this.summary(projectId),
      checks: this.listChecks(projectId, { limit: 20 }),
      observations: this.listObservations(projectId, { limit: observationLimit }),
      findings: this.listFindings(projectId, { limit: 50 }),
      actions: this.listActions(projectId, { limit: 50 }),
      history: this.listHistory(projectId, { limit: 30 }),
    };
  }

  countsFor(projectId) {
    const count = (table) => this.database.prepare(`SELECT COUNT(*) AS count FROM ${table} WHERE project_id = ?`).get(projectId).count;
    return {
      profiles: this.getProfile(projectId) ? 1 : 0,
      prompts: count('evidence_prompts'),
      checks: count('evidence_checks'),
      observations: count('evidence_observations'),
      findings: count('community_findings'),
      actions: count('evidence_actions'),
      history: count('evidence_history'),
    };
  }
}
