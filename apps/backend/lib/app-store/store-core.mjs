export class AppStoreError extends Error {
  constructor(message, statusCode = 400, retryAfter = 0) { super(message); this.statusCode = statusCode; this.retryAfter = retryAfter; }
}
// Public provider captures and shared allowances only. Private workspaces stay in IndexedDB.
export class SqlAppStoreStore {
  constructor({ database, transaction, now = Date.now }) {
    this.now = now;
    this.db = database;
    this.transaction = transaction;
    this.db.exec(`CREATE TABLE IF NOT EXISTS public_captures (key TEXT PRIMARY KEY, data TEXT NOT NULL, expires INTEGER NOT NULL, saved INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS allowances (kind TEXT NOT NULL, at INTEGER NOT NULL);
      CREATE INDEX IF NOT EXISTS allowances_kind_at ON allowances(kind, at);`);
  }
  reserveApple() {
    return this.transaction(() => {
      const now = this.now();
      this.db.prepare("DELETE FROM allowances WHERE kind='apple' AND at<=?").run(now - 60000);
      const rows = this.db.prepare("SELECT at FROM allowances WHERE kind='apple' ORDER BY at").all();
      const last = rows.at(-1)?.at;
      const wait = Math.max(rows.length >= 18 ? rows[0].at + 60000 - now : 0, last === undefined ? 0 : last + 3334 - now);
      if (wait > 0) throw new AppStoreError('Apple collection is paced across Site Health. Retrying shortly.', 429, Math.ceil(wait / 1000));
      this.db.prepare("INSERT INTO allowances VALUES ('apple', ?)").run(now);
    });
  }
  reserveAI() {
    return this.transaction(() => {
      const now = this.now(), day = Date.UTC(...new Date(now).toISOString().slice(0, 10).split('-').map((n,i) => Number(n) - (i === 1 ? 1 : 0)));
      this.db.prepare("DELETE FROM allowances WHERE kind='ai' AND at<?").run(day);
      const rows = this.db.prepare("SELECT at FROM allowances WHERE kind='ai' ORDER BY at").all();
      if (rows.length >= 60) throw new AppStoreError('AI daily research allowance reached. Try after 00:00 UTC.', 429, Math.ceil((day + 86400000 - now) / 1000));
      if (rows.length && now - rows.at(-1).at < 10000) throw new AppStoreError('Wait 10 seconds between AI requests.', 429, 10);
      this.db.prepare("INSERT INTO allowances VALUES ('ai', ?)").run(now);
    });
  }
  get(key) {
    const row = this.db.prepare('SELECT data FROM public_captures WHERE key=? AND expires>?').get(key, this.now());
    return row ? JSON.parse(row.data) : null;
  }
  put(key, capture, ttl) {
    const data = JSON.stringify(capture), now = this.now();
    if (Buffer.byteLength(data) > 1900000) return false;
    return this.transaction(() => {
      this.db.prepare('DELETE FROM public_captures WHERE expires<=?').run(now);
      this.db.prepare('INSERT OR REPLACE INTO public_captures VALUES (?, ?, ?, ?)').run(key, data, now + ttl, now);
      this.db.exec('DELETE FROM public_captures WHERE key NOT IN (SELECT key FROM public_captures ORDER BY saved DESC, key LIMIT 128)');
      return true;
    });
  }
  close() { this.db.close(); }
}
