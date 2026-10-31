import { createHash } from 'node:crypto';
import {
  DashboardValidationError,
  normalizeBackupEvent,
  normalizeEvent,
  redactForExport,
} from './contracts.mjs';
import { buildProjections } from './projections.mjs';
import { currentProjects, replayReadiness } from './readiness-model.mjs';

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function backupDigest(events) {
  return createHash('sha256').update(stableJson(events)).digest('hex');
}

function rowToEvent(row) {
  return {
    sequence: row.sequence,
    schemaVersion: row.schema_version,
    id: row.id,
    type: row.type,
    occurredAt: row.occurred_at,
    recordedAt: row.recorded_at,
    actor: JSON.parse(row.actor_json),
    ...(row.project_id ? { projectId: row.project_id } : {}),
    ...(row.objective_id ? { objectiveId: row.objective_id } : {}),
    ...(row.correlation_id ? { correlationId: row.correlation_id } : {}),
    idempotencyKey: row.idempotency_key,
    visibility: row.visibility,
    payload: JSON.parse(row.payload_json),
    evidence: JSON.parse(row.evidence_json),
  };
}

function sameRequest(existing, input) {
  const comparable = {
    type: input.type,
    actor: input.actor,
    projectId: input.projectId,
    objectiveId: input.objectiveId,
    correlationId: input.correlationId,
    visibility: input.visibility ?? 'private',
    payload: input.payload ?? {},
    evidence: input.evidence ?? [],
  };
  const stored = {
    type: existing.type,
    actor: existing.actor,
    projectId: existing.projectId,
    objectiveId: existing.objectiveId,
    correlationId: existing.correlationId,
    visibility: existing.visibility,
    payload: existing.payload,
    evidence: existing.evidence,
  };
  return stableJson(comparable) === stableJson(stored);
}

export class SqlDashboardStore {
  constructor({ database, transaction, migrationSql, projects = [] }) {
    this.database = database;
    this.transaction = transaction;
    this.projects = projects;
    this.transaction(() => {
      this.database.exec(migrationSql);
      this.database.prepare('INSERT OR IGNORE INTO schema_migrations(version, applied_at) VALUES (1, ?)').run(new Date().toISOString());
    });
  }

  getEventByIdempotencyKey(idempotencyKey) {
    const row = this.database.prepare('SELECT * FROM events WHERE idempotency_key = ?').get(idempotencyKey);
    return row ? rowToEvent(row) : null;
  }

  append(input, { now = new Date().toISOString() } = {}) {
    return this.#append(input, { now, normalize: normalizeEvent });
  }

  #append(input, { now, normalize }) {
    const existing = input?.idempotencyKey
      ? this.getEventByIdempotencyKey(input.idempotencyKey)
      : null;
    if (existing) {
      if (!sameRequest(existing, input)) {
        throw new DashboardValidationError(
          'IDEMPOTENCY_CONFLICT',
          `idempotency key ${input.idempotencyKey} already belongs to another event`,
        );
      }
      return { event: existing, duplicate: true };
    }

    const event = normalize(input, { now });
    return this.transaction(() => {
      // Recheck after acquiring the writer lock: another connection may have
      // committed the same retry while BEGIN IMMEDIATE waited.
      const concurrent = this.getEventByIdempotencyKey(event.idempotencyKey);
      if (concurrent) {
        if (!sameRequest(concurrent, input)) throw new DashboardValidationError('IDEMPOTENCY_CONFLICT', 'Idempotency key belongs to another event');
        return { event: concurrent, duplicate: true };
      }
      // Serialize the revision comparison with insertion across connections.
      if (event.type === 'readiness.state-updated') {
        if (normalize === normalizeEvent && !currentProjects(this.projects).some(p => p.id === event.projectId)) {
          throw Object.assign(new DashboardValidationError('READINESS_PROJECT_NOT_CURRENT', 'Readiness updates require a current product'), { statusCode: 404 });
        }
        const revision = this.database.prepare("SELECT COUNT(*) AS count FROM events WHERE type = 'readiness.state-updated' AND project_id = ?").get(event.projectId).count;
        if (revision !== event.payload.expectedRevision) {
          throw Object.assign(new DashboardValidationError('READINESS_REVISION_CONFLICT', 'This product changed since you loaded it. Reload before saving.'), { statusCode: 409 });
        }
      }
      this.database
        .prepare(`
          INSERT INTO events (
            id, schema_version, type, occurred_at, recorded_at, actor_json,
            project_id, objective_id, correlation_id,
            idempotency_key, visibility, payload_json, evidence_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          event.id,
          event.schemaVersion,
          event.type,
          event.occurredAt,
          event.recordedAt,
          JSON.stringify(event.actor),
          event.projectId ?? null,
          event.objectiveId ?? null,
          event.correlationId ?? null,
          event.idempotencyKey,
          event.visibility,
          JSON.stringify(event.payload),
          JSON.stringify(event.evidence),
        );
      this.database
        .prepare('INSERT INTO idempotency_keys(idempotency_key, event_id, recorded_at) VALUES (?, ?, ?)')
        .run(event.idempotencyKey, event.id, event.recordedAt);
      return { event, duplicate: false };
    });
  }

  listEvents({ afterSequence = 0, limit = -1 } = {}) {
    return this.database
      .prepare('SELECT * FROM events WHERE sequence > ? ORDER BY sequence LIMIT ?')
      .all(afterSequence, limit)
      .map(rowToEvent);
  }

  getMetadata(key) {
    const row = this.database
      .prepare('SELECT value_json, updated_at FROM local_metadata WHERE key = ?')
      .get(key);
    return row
      ? { value: JSON.parse(row.value_json), updatedAt: row.updated_at }
      : null;
  }

  listMetadata({ prefix = '' } = {}) {
    const pattern = `${prefix.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;
    return this.database
      .prepare("SELECT key, value_json, updated_at FROM local_metadata WHERE key LIKE ? ESCAPE '\\' ORDER BY key")
      .all(pattern)
      .map((row) => ({ key: row.key, value: JSON.parse(row.value_json), updatedAt: row.updated_at }));
  }

  setMetadata(key, value, { now = new Date().toISOString() } = {}) {
    this.database
      .prepare(`
        INSERT INTO local_metadata(key, value_json, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          value_json = excluded.value_json,
          updated_at = excluded.updated_at
      `)
      .run(key, JSON.stringify(value), now);
    return { key, value, updatedAt: now };
  }

  rebuildProjections({ now = new Date().toISOString() } = {}) {
    const events = this.listEvents();
    const projections = buildProjections(events, { now, projects: this.projects });
    const checkpoint = this.database.prepare('SELECT COALESCE(MAX(sequence), 0) AS sequence FROM events').get();
    this.database
      .prepare(`
        INSERT INTO projection_checkpoints(name, last_sequence, rebuilt_at, projection_version)
        VALUES ('owner', ?, ?, 1)
        ON CONFLICT(name) DO UPDATE SET
          last_sequence = excluded.last_sequence,
          rebuilt_at = excluded.rebuilt_at,
          projection_version = excluded.projection_version
      `)
      .run(checkpoint.sequence, now);
    return projections;
  }

  createBackup({ now = new Date().toISOString() } = {}) {
    const events = redactForExport(this.listEvents());
    return {
      format: 'fleet-founder-control-backup',
      version: 1,
      createdAt: now,
      eventCount: events.length,
      digest: backupDigest(events),
      events,
      backupDestination: 'not-configured',
    };
  }

  restoreBackup(backup) {
    verifyBackup(backup);
    const existingCount = this.database.prepare('SELECT COUNT(*) AS count FROM events').get().count;
    if (existingCount > 0) throw new Error('restore requires an empty event ledger');
    for (const event of backup.events) {
      this.#append(event, { now: event.recordedAt, normalize: normalizeBackupEvent });
    }
    return this.rebuildProjections({ now: backup.createdAt });
  }
}

export function verifyBackup(backup) {
  if (!backup || backup.format !== 'fleet-founder-control-backup' || backup.version !== 1) {
    throw new Error('unsupported Dashboard backup');
  }
  if (!Array.isArray(backup.events) || backup.eventCount !== backup.events.length) {
    throw new Error('backup event count does not match payload');
  }
  if (backup.digest !== backupDigest(backup.events)) throw new Error('backup digest mismatch');
  for (const event of backup.events) {
    normalizeBackupEvent(event, { now: event.recordedAt });
  }
  replayReadiness(backup.events);
  return { valid: true, eventCount: backup.eventCount, digest: backup.digest };
}
