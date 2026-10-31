import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { sqliteTransaction } from '../sqlite-transaction.mjs';
import { SqlAppStoreStore } from './store-core.mjs';
export { AppStoreError } from './store-core.mjs';
export const defaultAppStorePath = () => join(homedir(), 'Library/Application Support/Fleet Ops/founder-control/app-store-seo.sqlite');
export class AppStoreStore extends SqlAppStoreStore {
  constructor({ databasePath = defaultAppStorePath(), now = Date.now } = {}) {
    if (databasePath !== ':memory:') mkdirSync(dirname(databasePath), { recursive: true, mode: 0o700 });
    const database = new DatabaseSync(databasePath);
    try {
      database.exec('PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL;');
      super({ database, transaction: sqliteTransaction(database), now });
    } catch (error) { database.close(); throw error; }
  }
}
