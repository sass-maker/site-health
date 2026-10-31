import { randomUUID } from 'node:crypto';
import { closeSync, constants, fstatSync, fsyncSync, lstatSync, openSync, opendirSync, readSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

const MAX_BYTES = 32_768;
const MAX_IDS = 100;
const prefix = (databasePath) => `.${basename(databasePath)}.interrupted-`;
import { interruptionRecord } from './interruption-record.mjs';
export { interruptionRecord } from './interruption-record.mjs';

export function writeInterruptionJournal(databasePath, record) {
  if (databasePath === ':memory:') return false;
  const path = join(dirname(databasePath), `${prefix(databasePath)}${randomUUID()}.json`);
  const file = openSync(path, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
  try { writeFileSync(file, JSON.stringify(record)); fsyncSync(file); }
  finally { closeSync(file); }
  return true;
}

export function readInterruptionJournals(databasePath) {
  if (databasePath === ':memory:') return [];
  const records = [];
  let totalIds = 0;
  const directory = opendirSync(dirname(databasePath));
  try {
    for (let scanned = 0; scanned < 1_000 && records.length < 32; scanned++) {
      const entry = directory.readSync();
      if (!entry) break;
      if (!entry.isFile() || !entry.name.startsWith(prefix(databasePath))
        || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.json$/.test(entry.name.slice(prefix(databasePath).length))) continue;
      const path = join(dirname(databasePath), entry.name);
      let file;
      try {
        file = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
        const stat = fstatSync(file);
        if (!stat.isFile() || stat.nlink !== 1 || stat.size < 1 || stat.size > MAX_BYTES || (stat.mode & 0o077) !== 0 || stat.uid !== process.getuid()) continue;
        const buffer = Buffer.alloc(stat.size + 1);
        if (readSync(file, buffer, 0, buffer.length, 0) !== stat.size) continue;
        const parsed = JSON.parse(buffer.subarray(0, stat.size).toString('utf8'));
        if (parsed.version !== 1 || Object.keys(parsed).sort().join(',') !== 'checks,collections,interruptedAt,version') continue;
        const record = interruptionRecord(parsed.collections, parsed.checks, parsed.interruptedAt);
        const count = record.collections.length + record.checks.length;
        if (!count || totalIds + count > MAX_IDS) continue;
        records.push({ path, stat, ...record });
        totalIds += count;
      } catch { /* Invalid or concurrently replaced journals remain untouched. */ }
      finally { if (file !== undefined) closeSync(file); }
    }
  } finally { directory.closeSync(); }
  return records;
}

export function removeInterruptionJournal({ path, stat }) {
  try {
    const current = lstatSync(path);
    if (current.isFile() && current.ino === stat.ino && current.dev === stat.dev && current.mtimeMs === stat.mtimeMs) unlinkSync(path);
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
