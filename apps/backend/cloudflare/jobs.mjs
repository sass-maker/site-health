import { randomUUID } from 'node:crypto';
import { canonicalJson } from '../lib/store-snapshot.mjs';
const error = (message, statusCode = 409) => Object.assign(new Error(message), { statusCode });
const publicJob = row => row ? { ...JSON.parse(row.input_json), runId: row.id, state: row.state, startedAt: row.created_at,
  finishedAt: row.finished_at, attempts: row.attempts, summary: row.summary,
  ...(row.result_json ? { result: JSON.parse(row.result_json) } : {}) } : null;
export class DurableJobs {
  constructor(database, transaction, { now = Date.now, leaseMs = 60_000 } = {}) {
    this.database = database; this.transaction = transaction; this.now = now; this.leaseMs = leaseMs;
    database.exec(`CREATE TABLE IF NOT EXISTS _cloud_jobs (
      id TEXT PRIMARY KEY, request_key TEXT NOT NULL UNIQUE, input_json TEXT NOT NULL,
      state TEXT NOT NULL CHECK(state IN ('queued','running','succeeded','failed','cancelled','unavailable')),
      created_at TEXT NOT NULL, finished_at TEXT, lease_token TEXT, lease_until INTEGER,
      attempts INTEGER NOT NULL DEFAULT 0, result_json TEXT, summary TEXT);
      CREATE INDEX IF NOT EXISTS _cloud_jobs_state ON _cloud_jobs(state, lease_until);`);
  }
  start(input, requestKey) {
    if (!requestKey || typeof requestKey !== 'string' || requestKey.length > 200) throw error('An idempotency key is required', 400);
    const payload = canonicalJson(input);
    return this.transaction(() => {
      const existing = this.database.prepare('SELECT * FROM _cloud_jobs WHERE request_key=?').get(requestKey);
      if (existing) {
        if (existing.input_json !== payload) throw error('Job idempotency conflict');
        return { ...publicJob(existing), duplicate: true };
      }
      const id = randomUUID();
      this.database.prepare("INSERT INTO _cloud_jobs(id,request_key,input_json,state,created_at) VALUES (?,?,?,'queued',?)").run(id, requestKey, payload, new Date(this.now()).toISOString());
      return { ...this.get(id), duplicate: false };
    });
  }
  get(id) { return publicJob(this.database.prepare('SELECT * FROM _cloud_jobs WHERE id=?').get(id)); }
  claim() {
    return this.transaction(() => {
      const row = this.database.prepare("SELECT * FROM _cloud_jobs WHERE state='queued' OR (state='running' AND lease_until<=?) ORDER BY created_at,id LIMIT 1").get(this.now());
      if (!row) return null;
      const token = randomUUID();
      this.database.prepare("UPDATE _cloud_jobs SET state='running', lease_token=?, lease_until=?, attempts=attempts+1 WHERE id=?").run(token, this.now() + this.leaseMs, row.id);
      return { job: this.get(row.id), token };
    });
  }
  finish(id, token, { state = 'succeeded', result = null, summary = '' } = {}) {
    if (!['succeeded', 'failed', 'unavailable'].includes(state)) throw error('Invalid terminal job state', 400);
    const changed = this.database.prepare("UPDATE _cloud_jobs SET state=?,result_json=?,summary=?,finished_at=?,lease_token=NULL,lease_until=NULL WHERE id=? AND state='running' AND lease_token=? AND lease_until>?")
      .run(state, JSON.stringify(result), String(summary).slice(0,800), new Date(this.now()).toISOString(), id, token, this.now()).changes;
    if (changed !== 1) throw error('Job lease expired or was cancelled');
    return this.get(id);
  }
  cancel(id) {
    this.database.prepare("UPDATE _cloud_jobs SET state='cancelled',finished_at=?,lease_token=NULL,lease_until=NULL WHERE id=? AND state IN ('queued','running')").run(new Date(this.now()).toISOString(), id);
    return this.get(id);
  }
  nextAlarm() {
    const row = this.database.prepare("SELECT MIN(CASE WHEN state='queued' THEN ? ELSE lease_until END) AS at FROM _cloud_jobs WHERE state IN ('queued','running')").get(this.now());
    return row.at;
  }
}
