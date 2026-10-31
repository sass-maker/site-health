import { chmodSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { sqliteTransaction } from '../sqlite-transaction.mjs';
import { SqlBrandEvidenceStore } from './store-core.mjs';
import { readInterruptionJournals, removeInterruptionJournal, writeInterruptionJournal } from './interruption-journal.mjs';
export * from './store-core.mjs';

export function defaultBrandEvidencePath({ home = process.env.HOME } = {}) {
  if (!home) throw new Error('HOME is required to resolve the brand evidence database path');
  return join(home, 'Library', 'Application Support', 'Fleet Ops', 'founder-control', 'brand-evidence.sqlite');
}
export class BrandEvidenceStore extends SqlBrandEvidenceStore {
  constructor({ databasePath = defaultBrandEvidencePath() } = {}) {
    if (databasePath !== ':memory:') mkdirSync(dirname(databasePath), { recursive: true, mode: 0o700 });
    const database = new DatabaseSync(databasePath);
    try {
      if (databasePath !== ':memory:') chmodSync(databasePath, 0o600);
      database.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
      const transaction = sqliteTransaction(database);
      let currentPath = () => databasePath;
      super({ database, transaction, schemaSql: readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'),
        journal: { write: (record) => writeInterruptionJournal(currentPath(), record),
          read: () => readInterruptionJournals(currentPath()), remove: removeInterruptionJournal },
        interruptionTransaction: (work) => {
          const previous = database.prepare('PRAGMA busy_timeout').get().timeout;
          database.exec('PRAGMA busy_timeout = 1000');
          try { return transaction(work); } finally { database.exec(`PRAGMA busy_timeout = ${previous}`); }
        },
      });
      this.databasePath = databasePath;
      currentPath = () => this.databasePath;
    } catch (error) { database.close(); throw error; }
  }
}
