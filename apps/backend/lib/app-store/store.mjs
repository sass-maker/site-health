import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';

export const defaultAppStorePath = () => join(homedir(), 'Library/Application Support/Fleet Ops/founder-control/app-store-seo.sqlite');
export class AppStoreError extends Error {
  constructor(message, statusCode = 400, retryAfter = 0) { super(message); this.statusCode = statusCode; this.retryAfter = retryAfter; }
}
// Public provider captures and shared allowances only. Private workspaces stay in IndexedDB.
export class AppStoreStore {
  constructor({ databasePath = defaultAppStorePath(), now = Date.now } = {}) {
    this.now = now;
    if (databasePath !== ':memory:') mkdirSync(dirname(databasePath), { recursive: true, mode: 0o700 });
    this.db = new DatabaseSync(databasePath);
    this.db.exec(`PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL;
      CREATE TABLE IF NOT EXISTS public_captures (key TEXT PRIMARY KEY, data TEXT NOT NULL, expires INTEGER NOT NULL, saved INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS allowances (kind TEXT NOT NULL, at INTEGER NOT NULL);
      CREATE INDEX IF NOT EXISTS allowances_kind_at ON allowances(kind, at);`);
  }
  reserveApple() {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const now = this.now();
      this.db.prepare("DELETE FROM allowances WHERE kind='apple' AND at<=?").run(now - 60000);
      const rows = this.db.prepare("SELECT at FROM allowances WHERE kind='apple' ORDER BY at").all();
      const last = rows.at(-1)?.at;
      const wait = Math.max(rows.length >= 18 ? rows[0].at + 60000 - now : 0, last === undefined ? 0 : last + 3334 - now);
      if (wait > 0) throw new AppStoreError('Apple collection is paced across Site Health. Retrying shortly.', 429, Math.ceil(wait / 1000));
      this.db.prepare("INSERT INTO allowances VALUES ('apple', ?)").run(now);
      this.db.exec('COMMIT');
    } catch (e) { this.db.exec('ROLLBACK'); throw e; }
  }
  reserveAI() {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const now = this.now(), day = Date.UTC(...new Date(now).toISOString().slice(0, 10).split('-').map((n,i) => Number(n) - (i === 1 ? 1 : 0)));
      this.db.prepare("DELETE FROM allowances WHERE kind='ai' AND at<?").run(day);
      const rows = this.db.prepare("SELECT at FROM allowances WHERE kind='ai' ORDER BY at").all();
      if (rows.length >= 60) throw new AppStoreError('AI daily research allowance reached. Try after 00:00 UTC.', 429, Math.ceil((day + 86400000 - now) / 1000));
      if (rows.length && now - rows.at(-1).at < 10000) throw new AppStoreError('Wait 10 seconds between AI requests.', 429, 10);
      this.db.prepare("INSERT INTO allowances VALUES ('ai', ?)").run(now);
      this.db.exec('COMMIT');
    } catch (e) { this.db.exec('ROLLBACK'); throw e; }
  }
  get(key) {
    const row = this.db.prepare('SELECT data FROM public_captures WHERE key=? AND expires>?').get(key, this.now());
    return row ? JSON.parse(row.data) : null;
  }
  put(key, capture, ttl) {
    const data = JSON.stringify(capture), now = this.now();
    if (Buffer.byteLength(data) > 1900000) return false;
    this.db.exec('BEGIN IMMEDIATE');
    try {
      this.db.prepare('DELETE FROM public_captures WHERE expires<=?').run(now);
      this.db.prepare('INSERT OR REPLACE INTO public_captures VALUES (?, ?, ?, ?)').run(key, data, now + ttl, now);
      this.db.exec('DELETE FROM public_captures WHERE key NOT IN (SELECT key FROM public_captures ORDER BY saved DESC, key LIMIT 128)');
      this.db.exec('COMMIT'); return true;
    } catch(e) { this.db.exec('ROLLBACK'); throw e; }
  }
  close() { this.db.close(); }
}
