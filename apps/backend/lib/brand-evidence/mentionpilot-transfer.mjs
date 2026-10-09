import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

import {
  BrandEvidenceError,
  normalizeProviderSettings,
  normalizeTimestamp,
  observationFingerprint,
} from './store.mjs';

// Reversible transfer of MentionPilot's retained D1 evidence into the private
// Site Health brand-evidence store.
//
// Input is an owner-made export of the `mentionpilot-db` D1 database (the
// `wrangler d1 export` SQL dump, or a SQLite file). The export contains
// credentials (BYOK keys, auth sessions); this module never reads auth tables
// and never copies a key — it records only that one existed.
//
// Every row written carries the batch id and its MentionPilot record id. A
// batch can be verified against the export and reverted exactly.

export const SOURCE = 'mentionpilot';
export const MAPPING_SCHEMA = 'site-health.mentionpilot-mapping.v1';
const MISSING_PROMPT_TEXT = '(prompt text was not retained by MentionPilot for this record)';
const ENTITIES = ['profile', 'prompt', 'check', 'observation', 'finding', 'history', 'action'];

export function openMentionPilotExport(path) {
  const bytes = readFileSync(path);
  const digest = createHash('sha256').update(bytes).digest('hex');
  const isSqlite = bytes.subarray(0, 16).toString('latin1') === 'SQLite format 3\u0000';
  let database;
  if (isSqlite) {
    database = new DatabaseSync(path, { readOnly: true });
  } else {
    database = new DatabaseSync(':memory:');
    database.exec(bytes.toString('utf8'));
  }
  return { database, digest };
}

function tableExists(database, name) {
  return Boolean(database.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(name));
}

function rows(database, table, where = '', ...params) {
  if (!tableExists(database, table)) return [];
  return database.prepare(`SELECT * FROM ${table} ${where}`).all(...params);
}

function parseList(value) {
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function optionalTimestamp(value) {
  if (!value) return null;
  try {
    return normalizeTimestamp(value);
  } catch {
    return null;
  }
}

export function loadMapping(input) {
  const mapping = typeof input === 'string' ? JSON.parse(input) : input;
  if (mapping?.schema !== MAPPING_SCHEMA || !mapping.projects || typeof mapping.projects !== 'object') {
    throw new BrandEvidenceError(`mapping must use ${MAPPING_SCHEMA} with a projects object`);
  }
  const targets = Object.values(mapping.projects);
  if (targets.some((target) => typeof target !== 'string' || !target.trim())) {
    throw new BrandEvidenceError('every mapping target must be a Site Health project id');
  }
  // One MentionPilot project per Site Health project: merging two source
  // workspaces into one target would blur project isolation.
  if (new Set(targets).size !== targets.length) {
    throw new BrandEvidenceError('mapping must not send two MentionPilot projects to one Site Health project');
  }
  return mapping;
}

function resolveProjects(database, mapping, knownProjectIds) {
  const known = new Set(knownProjectIds);
  const mapped = [];
  const unmapped = [];
  const errors = [];
  const used = new Set();
  for (const project of rows(database, 'projects', 'ORDER BY created_at, id')) {
    const key = [project.id, project.slug].find((candidate) => candidate && mapping.projects[candidate]);
    if (!key) {
      unmapped.push({ sourceProjectId: project.id, slug: project.slug, name: project.name });
      continue;
    }
    used.add(key);
    const targetProjectId = mapping.projects[key];
    if (!known.has(targetProjectId)) {
      errors.push(`Site Health project ${targetProjectId} (mapped from ${key}) is not in the catalog`);
      continue;
    }
    mapped.push({ sourceProjectId: project.id, slug: project.slug, name: project.name, targetProjectId, project });
  }
  for (const key of Object.keys(mapping.projects)) {
    if (!used.has(key)) errors.push(`mapping key ${key} matches no MentionPilot project in the export`);
  }
  return { mapped, unmapped, errors };
}

function sourceObservationStatus(result) {
  if (result.provider_status === 'error') return 'error';
  if (!String(result.response_text ?? '').trim()) return 'unavailable';
  return 'completed';
}

function sourceSnapshot(database, sourceProjectId) {
  const prompts = rows(database, 'prompts', 'WHERE project_id = ? ORDER BY created_at, id', sourceProjectId);
  const checks = rows(database, 'checks', 'WHERE project_id = ? ORDER BY created_at, id', sourceProjectId);
  const results = rows(database, 'results', 'WHERE project_id = ? ORDER BY created_at, id', sourceProjectId);
  const findings = rows(database, 'findings', 'WHERE project_id = ? ORDER BY first_seen_at, id', sourceProjectId);
  const history = rows(database, 'finding_history', 'WHERE project_id = ? ORDER BY created_at, id', sourceProjectId);
  const tasks = rows(database, 'finding_tasks', 'WHERE project_id = ? ORDER BY created_at, id', sourceProjectId);
  const config = rows(database, 'brand_configs', 'WHERE project_id = ?', sourceProjectId)[0] ?? null;
  return { prompts, checks, results, findings, history, tasks, config };
}

function sourceCounts(snapshot) {
  const statuses = { completed: 0, unavailable: 0, error: 0 };
  for (const result of snapshot.results) statuses[sourceObservationStatus(result)] += 1;
  return {
    profile: snapshot.config ? 1 : 0,
    prompt: snapshot.prompts.length,
    check: snapshot.checks.length,
    observation: snapshot.results.length,
    finding: snapshot.findings.length,
    history: snapshot.history.length,
    action: snapshot.tasks.length,
    observationStatuses: statuses,
  };
}

function profileInput(config, project) {
  const warnings = [];
  let provider = { mode: 'free-ai' };
  if (config.ai_endpoint_url && config.ai_model) {
    try {
      provider = normalizeProviderSettings({
        mode: 'custom-endpoint',
        endpointUrl: config.ai_endpoint_url,
        model: config.ai_model,
        keyPresentAtSource: Boolean(config.ai_api_key),
      });
    } catch (error) {
      warnings.push(`custom endpoint not retained: ${error.message}`);
    }
  }
  const legacyKeys = ['openai_api_key', 'anthropic_api_key', 'google_api_key', 'perplexity_api_key', 'ai_api_key']
    .filter((column) => config[column]).length;
  if (legacyKeys) warnings.push(`${legacyKeys} stored provider key(s) were not transferred; re-enter through a private channel if still needed`);
  const schedule = ['daily', 'weekly'].includes(project.check_schedule) ? project.check_schedule : null;
  return {
    input: {
      brandName: config.brand_name,
      aliases: parseList(config.brand_aliases),
      brandUrl: config.brand_url,
      competitors: parseList(config.competitors),
      keywords: parseList(config.keywords),
      targetCustomer: config.target_customer ?? null,
      topics: parseList(config.monitoring_topics),
      communities: parseList(config.reddit_communities),
      schedule,
      provider,
    },
    warnings,
  };
}

function existingId(store, table, sourceRecordId) {
  if (table === 'community_findings') {
    return store.database
      .prepare('SELECT id FROM community_findings WHERE origin = ? AND origin_record_id = ?')
      .get(SOURCE, sourceRecordId)?.id ?? null;
  }
  return store.database
    .prepare(`SELECT id FROM ${table} WHERE source = ? AND source_record_id = ?`)
    .get(SOURCE, sourceRecordId)?.id ?? null;
}

function observationFor(result, targetProjectId, promptTextById) {
  const status = sourceObservationStatus(result);
  const promptText = result.prompt_text || promptTextById.get(result.prompt_id) || MISSING_PROMPT_TEXT;
  const observedAt = normalizeTimestamp(result.created_at, `result ${result.id} created_at`);
  const base = {
    projectId: targetProjectId,
    channel: 'api-model',
    provider: result.platform || 'unknown',
    model: result.model || 'unknown',
    promptText,
    status,
    observedAt,
    latencyMs: Number.isFinite(result.latency_ms) ? result.latency_ms : undefined,
  };
  if (status === 'error') return { ...base, errorMessage: result.error_message || 'Provider request failed' };
  if (status === 'unavailable') return { ...base, errorMessage: 'MentionPilot recorded an empty answer' };
  return {
    ...base,
    answerText: result.response_text,
    // The original verdicts are preserved rather than re-derived.
    analysis: {
      brandMentioned: Boolean(result.brand_mentioned),
      brandPosition: Number.isInteger(result.brand_position) ? result.brand_position : null,
      brandSentiment: result.brand_sentiment ?? null,
      competitorsMentioned: parseList(result.competitors_mentioned),
      citations: parseList(result.citations),
      brandCited: Boolean(result.brand_cited),
    },
  };
}

function checkStatus(check, counts) {
  if (check.status === 'running') return 'incomplete';
  if (counts.completed === 0) return 'failed';
  return counts.failed > 0 ? 'partial' : 'completed';
}

// Plans (dryRun) or applies one batch. Planning and applying share one code
// path; planning rolls the transaction back so its counts are exact.
function transfer({ store, source, mapping, knownProjectIds, dryRun, now }) {
  const { database, digest } = source;
  const resolved = resolveProjects(database, loadMapping(mapping), knownProjectIds);
  if (resolved.errors.length) throw new BrandEvidenceError(`mapping is not applicable: ${resolved.errors.join('; ')}`);
  const batchId = randomUUID();
  const appliedAt = now();
  const report = {
    schemaVersion: 'site-health.mentionpilot-transfer.v1',
    mode: dryRun ? 'plan' : 'apply',
    batchId: dryRun ? null : batchId,
    sourceDigest: digest,
    unmapped: resolved.unmapped.map(({ sourceProjectId, slug, name }) => ({ sourceProjectId, slug, name })),
    projects: [],
  };
  store.database.exec('BEGIN IMMEDIATE');
  try {
    const link = store.database.prepare(`
      INSERT INTO transfer_links(batch_id, entity, source_record_id, local_id, disposition) VALUES (?, ?, ?, ?, ?)
    `);
    for (const entry of resolved.mapped) {
      const target = entry.targetProjectId;
      const snapshot = sourceSnapshot(database, entry.sourceProjectId);
      const outcome = Object.fromEntries(ENTITIES.map((entity) => [entity, { inserted: 0, linkedDuplicate: 0, alreadyPresent: 0 }]));
      const warnings = [];
      const record = (entity, sourceRecordId, localId, disposition) => {
        link.run(batchId, entity, sourceRecordId, localId, disposition);
        outcome[entity][{ inserted: 'inserted', 'linked-duplicate': 'linkedDuplicate', 'already-present': 'alreadyPresent' }[disposition]] += 1;
      };

      if (snapshot.config) {
        const existing = store.getProfile(target);
        if (existing) {
          record('profile', snapshot.config.id, target, existing.source === SOURCE ? 'already-present' : 'linked-duplicate');
          if (existing.source !== SOURCE) warnings.push('Site Health already has a profile for this project; it was kept unchanged');
        } else {
          const { input, warnings: profileWarnings } = profileInput(snapshot.config, entry.project);
          warnings.push(...profileWarnings);
          store.saveProfile(target, input, {
            source: SOURCE,
            sourceRecordId: snapshot.config.id,
            importBatchId: batchId,
            now: optionalTimestamp(snapshot.config.created_at) ?? appliedAt,
          });
          record('profile', snapshot.config.id, target, 'inserted');
        }
      }

      const promptIds = new Map();
      const promptTextById = new Map(snapshot.prompts.map((prompt) => [prompt.id, prompt.prompt_text]));
      for (const prompt of snapshot.prompts) {
        const present = existingId(store, 'evidence_prompts', prompt.id);
        if (present) {
          promptIds.set(prompt.id, present);
          record('prompt', prompt.id, present, 'already-present');
          continue;
        }
        const created = store.addPrompt(target, prompt.prompt_text, {
          category: prompt.category ?? null,
          source: SOURCE,
          sourceRecordId: prompt.id,
          importBatchId: batchId,
          now: optionalTimestamp(prompt.created_at) ?? appliedAt,
        });
        promptIds.set(prompt.id, created.id);
        record('prompt', prompt.id, created.id, 'inserted');
      }

      const resultsByCheck = new Map();
      for (const result of snapshot.results) {
        resultsByCheck.set(result.check_id, [...(resultsByCheck.get(result.check_id) ?? []), result]);
      }
      const checkIds = new Map();
      for (const check of snapshot.checks) {
        const present = existingId(store, 'evidence_checks', check.id);
        if (present) {
          checkIds.set(check.id, present);
          record('check', check.id, present, 'already-present');
          continue;
        }
        const own = resultsByCheck.get(check.id) ?? [];
        const counts = { completed: 0, failed: 0 };
        for (const result of own) {
          if (sourceObservationStatus(result) === 'completed') counts.completed += 1;
          else counts.failed += 1;
        }
        const id = store.createCheck({
          projectId: target,
          channel: 'api-model',
          trigger: 'imported',
          status: checkStatus(check, counts),
          sourceStatus: check.status,
          attempted: own.length,
          completed: counts.completed,
          failed: counts.failed,
          mentionRate: Number.isFinite(check.brand_mention_rate) ? check.brand_mention_rate : null,
          summary: check.summary ?? null,
          startedAt: normalizeTimestamp(check.created_at, `check ${check.id} created_at`),
          finishedAt: optionalTimestamp(check.completed_at),
          source: SOURCE,
          sourceRecordId: check.id,
          importBatchId: batchId,
        });
        checkIds.set(check.id, id);
        record('check', check.id, id, 'inserted');
      }

      for (const result of snapshot.results) {
        const present = existingId(store, 'evidence_observations', result.id);
        if (present) {
          record('observation', result.id, present, 'already-present');
          continue;
        }
        const observation = observationFor(result, target, promptTextById);
        const fingerprint = observationFingerprint(store.normalizeObservation(observation));
        const duplicate = store.findObservationByFingerprint(target, fingerprint);
        if (duplicate) {
          record('observation', result.id, duplicate, 'linked-duplicate');
          continue;
        }
        const created = store.recordObservation({
          ...observation,
          checkId: checkIds.get(result.check_id) ?? null,
          promptId: promptIds.get(result.prompt_id) ?? null,
          source: SOURCE,
          sourceRecordId: result.id,
          importBatchId: batchId,
        });
        record('observation', result.id, created.id, 'inserted');
      }

      const findingIds = new Map();
      for (const finding of snapshot.findings) {
        const present = existingId(store, 'community_findings', finding.id)
          ?? store.database
            .prepare('SELECT id FROM community_findings WHERE project_id = ? AND source = ? AND source_record_id = ?')
            .get(target, finding.source, finding.source_record_id)?.id;
        if (present) {
          findingIds.set(finding.id, present);
          const origin = store.database.prepare('SELECT origin FROM community_findings WHERE id = ?').get(present).origin;
          record('finding', finding.id, present, origin === SOURCE ? 'already-present' : 'linked-duplicate');
          continue;
        }
        const id = randomUUID();
        const firstSeen = optionalTimestamp(finding.first_seen_at) ?? appliedAt;
        store.database.prepare(`
          INSERT INTO community_findings(id, project_id, source, source_record_id, source_name, title, content, url, author,
            published_at, first_seen_at, last_seen_at, engagement_score, comment_count, relevance_score, intent,
            matched_keywords_json, status, origin, origin_record_id, import_batch_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          id, target, finding.source, finding.source_record_id, finding.source_name, finding.title, finding.content ?? null,
          finding.url, finding.author ?? null, optionalTimestamp(finding.published_at), firstSeen,
          optionalTimestamp(finding.last_seen_at) ?? firstSeen, finding.engagement_score ?? null,
          finding.comment_count ?? null, finding.relevance_score ?? 0, finding.intent ?? 'general',
          JSON.stringify(parseList(finding.matched_keywords)),
          ['new', 'reviewed', 'dismissed', 'resolved'].includes(finding.status) ? finding.status : 'new',
          SOURCE, finding.id, batchId,
        );
        findingIds.set(finding.id, id);
        record('finding', finding.id, id, 'inserted');
      }

      for (const entryHistory of snapshot.history) {
        const present = existingId(store, 'evidence_history', entryHistory.id);
        if (present) {
          record('history', entryHistory.id, present, 'already-present');
          continue;
        }
        const id = store.appendHistory({
          projectId: target,
          subjectKind: 'finding',
          subjectId: findingIds.get(entryHistory.finding_id) ?? `mentionpilot:${entryHistory.finding_id}`,
          action: entryHistory.action,
          note: entryHistory.note ?? null,
          createdAt: normalizeTimestamp(entryHistory.created_at, `history ${entryHistory.id} created_at`),
          source: SOURCE,
          sourceRecordId: entryHistory.id,
          importBatchId: batchId,
        });
        record('history', entryHistory.id, id, 'inserted');
      }

      for (const task of snapshot.tasks) {
        const present = existingId(store, 'evidence_actions', task.id);
        if (present) {
          record('action', task.id, present, 'already-present');
          continue;
        }
        const id = randomUUID();
        store.database.prepare(`
          INSERT INTO evidence_actions(id, project_id, subject_kind, subject_id, title, status, created_at, completed_at,
            source, source_record_id, import_batch_id)
          VALUES (?, ?, 'finding', ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          id, target, findingIds.get(task.finding_id) ?? `mentionpilot:${task.finding_id}`, task.title,
          task.status === 'completed' ? 'completed' : 'open',
          normalizeTimestamp(task.created_at, `task ${task.id} created_at`), optionalTimestamp(task.completed_at),
          SOURCE, task.id, batchId,
        );
        record('action', task.id, id, 'inserted');
      }

      report.projects.push({
        sourceProjectId: entry.sourceProjectId,
        slug: entry.slug,
        targetProjectId: target,
        source: sourceCounts(snapshot),
        outcome,
        warnings,
      });
    }

    if (dryRun) {
      store.database.exec('ROLLBACK');
    } else {
      store.database.prepare(`
        INSERT INTO transfer_batches(id, source, source_digest, mapping_json, counts_json, state, applied_at)
        VALUES (?, ?, ?, ?, ?, 'applied', ?)
      `).run(batchId, SOURCE, digest, JSON.stringify(mapping), JSON.stringify(report.projects), appliedAt);
      store.database.exec('COMMIT');
    }
  } catch (error) {
    store.database.exec('ROLLBACK');
    throw error;
  }
  return report;
}

export function planTransfer({ store, source, mapping, knownProjectIds, now = () => new Date().toISOString() }) {
  return transfer({ store, source, mapping, knownProjectIds, dryRun: true, now });
}

export function applyTransfer({ store, source, mapping, knownProjectIds, now = () => new Date().toISOString() }) {
  return transfer({ store, source, mapping, knownProjectIds, dryRun: false, now });
}

function batchRow(store, batchId) {
  const batch = store.database.prepare('SELECT * FROM transfer_batches WHERE id = ?').get(batchId);
  if (!batch) throw new BrandEvidenceError(`transfer batch ${batchId} not found`, 404);
  return batch;
}

const BATCH_TABLES = [
  ['history', 'evidence_history'],
  ['action', 'evidence_actions'],
  ['observation', 'evidence_observations'],
  ['check', 'evidence_checks'],
  ['prompt', 'evidence_prompts'],
  ['finding', 'community_findings'],
  ['profile', 'brand_profiles'],
];

// Verifies a batch against the same export: every source record is linked
// exactly once, imported rows sit only in their mapped project, and failed
// provider calls kept their failure status.
export function verifyTransfer({ store, source, batchId }) {
  const batch = batchRow(store, batchId);
  const problems = [];
  if (batch.state !== 'applied') problems.push(`batch is ${batch.state}`);
  if (source.digest !== batch.source_digest) problems.push('export digest differs from the applied export');
  const mapping = loadMapping(batch.mapping_json);
  const planned = JSON.parse(batch.counts_json);
  const projects = [];
  for (const entry of planned) {
    const snapshot = sourceSnapshot(source.database, entry.sourceProjectId);
    const counts = sourceCounts(snapshot);
    const linked = Object.fromEntries(ENTITIES.map((entity) => [entity, 0]));
    const sourceIds = {
      profile: snapshot.config ? [snapshot.config.id] : [],
      prompt: snapshot.prompts.map((row) => row.id),
      check: snapshot.checks.map((row) => row.id),
      observation: snapshot.results.map((row) => row.id),
      finding: snapshot.findings.map((row) => row.id),
      history: snapshot.history.map((row) => row.id),
      action: snapshot.tasks.map((row) => row.id),
    };
    const lookup = store.database.prepare('SELECT local_id FROM transfer_links WHERE batch_id = ? AND entity = ? AND source_record_id = ?');
    for (const entity of ENTITIES) {
      for (const id of sourceIds[entity]) {
        if (lookup.get(batchId, entity, id)) linked[entity] += 1;
        else problems.push(`${entry.targetProjectId}: ${entity} ${id} has no link`);
      }
      if (linked[entity] !== counts[entity]) {
        problems.push(`${entry.targetProjectId}: ${entity} linked ${linked[entity]} of ${counts[entity]}`);
      }
    }
    const statuses = Object.fromEntries(store.database.prepare(`
      SELECT o.status, COUNT(*) AS count FROM transfer_links l JOIN evidence_observations o ON o.id = l.local_id
      WHERE l.batch_id = ? AND l.entity = 'observation' AND o.project_id = ? GROUP BY o.status
    `).all(batchId, entry.targetProjectId).map((row) => [row.status, row.count]));
    for (const status of ['completed', 'unavailable', 'error']) {
      if ((statuses[status] ?? 0) !== counts.observationStatuses[status]) {
        problems.push(`${entry.targetProjectId}: ${status} observations ${statuses[status] ?? 0} != source ${counts.observationStatuses[status]}`);
      }
    }
    projects.push({ targetProjectId: entry.targetProjectId, source: counts, linked, observationStatuses: statuses });
  }
  const allowedTargets = new Set(Object.values(mapping.projects));
  for (const [, table] of BATCH_TABLES) {
    const stray = store.database
      .prepare(`SELECT DISTINCT project_id FROM ${table} WHERE import_batch_id = ?`)
      .all(batchId)
      .map((row) => row.project_id)
      .filter((projectId) => !allowedTargets.has(projectId));
    if (stray.length) problems.push(`${table} has batch rows outside mapped projects: ${stray.join(', ')}`);
  }
  const failedAsNegative = store.database.prepare(`
    SELECT COUNT(*) AS count FROM evidence_observations
    WHERE import_batch_id = ? AND status != 'completed' AND brand_mentioned IS NOT NULL
  `).get(batchId).count;
  if (failedAsNegative) problems.push(`${failedAsNegative} failed observations carry a mention verdict`);
  return { batchId, state: batch.state, verified: problems.length === 0, problems, projects };
}

// Removes exactly what one batch inserted. Refuses when Site Health has since
// attached its own actions or history to imported rows, or edited an imported
// profile, so a revert never silently drops owner work.
export function revertTransfer({ store, batchId, now = () => new Date().toISOString() }) {
  const batch = batchRow(store, batchId);
  if (batch.state !== 'applied') throw new BrandEvidenceError(`batch ${batchId} is already ${batch.state}`);
  const dependents = store.database.prepare(`
    SELECT COUNT(*) AS count FROM (
      SELECT subject_id FROM evidence_actions WHERE COALESCE(import_batch_id, '') != ?
      UNION ALL
      SELECT subject_id FROM evidence_history WHERE COALESCE(import_batch_id, '') != ?
    ) d WHERE d.subject_id IN (
      SELECT id FROM evidence_observations WHERE import_batch_id = ?
      UNION SELECT id FROM community_findings WHERE import_batch_id = ?
      UNION SELECT id FROM evidence_checks WHERE import_batch_id = ?
    )
  `).get(batchId, batchId, batchId, batchId, batchId).count;
  if (dependents) {
    throw new BrandEvidenceError(`batch ${batchId} has ${dependents} Site Health action/history row(s) attached to imported evidence; resolve them before reverting`);
  }
  const editedProfiles = store.database
    .prepare('SELECT project_id FROM brand_profiles WHERE import_batch_id = ? AND updated_at != created_at')
    .all(batchId);
  if (editedProfiles.length) {
    throw new BrandEvidenceError(`imported profile(s) were edited after transfer: ${editedProfiles.map((row) => row.project_id).join(', ')}`);
  }
  return store.transaction(() => {
    const removed = {};
    for (const [entity, table] of BATCH_TABLES) {
      removed[entity] = Number(store.database.prepare(`DELETE FROM ${table} WHERE import_batch_id = ?`).run(batchId).changes);
    }
    store.database.prepare('DELETE FROM transfer_links WHERE batch_id = ?').run(batchId);
    store.database.prepare("UPDATE transfer_batches SET state = 'reverted', reverted_at = ? WHERE id = ?").run(now(), batchId);
    return { batchId, state: 'reverted', removed };
  });
}

export function listTransferBatches(store) {
  return store.database
    .prepare('SELECT id, source, source_digest, state, applied_at, reverted_at FROM transfer_batches ORDER BY applied_at DESC')
    .all()
    .map((row) => ({
      batchId: row.id,
      source: row.source,
      sourceDigest: row.source_digest,
      state: row.state,
      appliedAt: row.applied_at,
      revertedAt: row.reverted_at,
    }));
}
