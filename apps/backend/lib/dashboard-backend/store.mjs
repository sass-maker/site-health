import { chmodSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { sqliteTransaction } from '../sqlite-transaction.mjs';
import { SqlDashboardStore } from './store-core.mjs';
export { verifyBackup } from './store-core.mjs';

export function defaultDatabasePath({ home = process.env.HOME } = {}) {
  if (!home) throw new Error('HOME is required to resolve the Dashboard database path');
  return join(home, 'Library', 'Application Support', 'Fleet Ops', 'founder-control', 'foundry.sqlite');
}

export class DashboardStore extends SqlDashboardStore {
  constructor({ databasePath = defaultDatabasePath(), projects = [] } = {}) {
    if (databasePath !== ':memory:') mkdirSync(dirname(databasePath), { recursive: true, mode: 0o700 });
    const database = new DatabaseSync(databasePath);
    try {
      if (databasePath !== ':memory:') chmodSync(databasePath, 0o600);
      database.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
      super({ database, transaction: sqliteTransaction(database), projects,
        migrationSql: readFileSync(new URL('./migrations/001-initial.sql', import.meta.url), 'utf8') });
      this.databasePath = databasePath;
    } catch (error) { database.close(); throw error; }
  }
  close() { this.database.close(); }
}
