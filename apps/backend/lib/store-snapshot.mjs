import { createHash } from 'node:crypto';

export const STORE_TABLES = Object.freeze({
  dashboard: ['schema_migrations', 'events', 'idempotency_keys', 'projection_checkpoints', 'local_metadata'],
  brand: ['brand_evidence_migrations', 'brand_profiles', 'evidence_prompts', 'evidence_checks', 'evidence_observations', 'community_findings', 'evidence_actions', 'evidence_history', 'transfer_batches', 'transfer_links', 'collection_runs', 'community_briefs', 'brand_growth'],
  'app-store': ['public_captures', 'allowances'],
});
const MIGRATION_TABLES = new Set(['schema_migrations', 'brand_evidence_migrations']);
const identifier = (name) => `"${name.replaceAll('"', '""')}"`;
export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
export const snapshotDigest = value => createHash('sha256').update(canonicalJson(value)).digest('hex');
function describe(database, kind) {
  const allowed = STORE_TABLES[kind];
  if (!allowed) throw new Error('Unknown snapshot store');
  const tables = database.prepare("SELECT name, sql FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT GLOB '_cloud_*' ORDER BY name").all();
  if (canonicalJson(tables.map(t => t.name).sort()) !== canonicalJson([...allowed].sort())) throw new Error('Snapshot schema is incomplete or has unknown tables');
  return tables.map(table => ({ ...table, sql: table.sql.match(/'(?:''|[^'])*'|"(?:""|[^"])*"|\w+|[^\s]/g).map(token => /^[\"']/.test(token) ? token : token.toLowerCase()).join(' '), columns: database.prepare(`PRAGMA table_info(${identifier(table.name)})`).all().map(c => c.name) }));
}
export function exportStoreSnapshot(database, kind, { now = new Date().toISOString() } = {}) {
  const tables = describe(database, kind).map(table => ({ ...table,
    rows: database.prepare(`SELECT rowid AS __rowid, * FROM ${identifier(table.name)} ORDER BY rowid`).all().map(row => ({...row})),
  }));
  const sequenceExists = database.prepare("SELECT 1 AS present FROM sqlite_schema WHERE name='sqlite_sequence'").get();
  const sequences = sequenceExists ? database.prepare('SELECT name, seq FROM sqlite_sequence ORDER BY name').all().map(row => ({...row})) : [];
  const body = { format: 'site-health.full-store.v1', kind, createdAt: now, tables, sequences };
  return { ...body, digest: snapshotDigest(body), counts: Object.fromEntries(tables.map(table => [table.name, table.rows.length])) };
}
export function verifyStoreSnapshot(snapshot, database, kind) {
  if (snapshot?.format !== 'site-health.full-store.v1' || snapshot.kind !== kind || !Number.isFinite(Date.parse(snapshot.createdAt))) throw new Error('Unsupported full store snapshot');
  const { digest, counts, ...body } = snapshot;
  if (!/^[a-f0-9]{64}$/.test(digest ?? '') || snapshotDigest(body) !== digest) throw new Error('Snapshot digest mismatch');
  const schema = describe(database, kind);
  if (!Array.isArray(snapshot.tables) || snapshot.tables.length !== schema.length) throw new Error('Snapshot table set is incomplete');
  for (const [index, expected] of schema.entries()) {
    const table = snapshot.tables[index];
    if (table?.name !== expected.name || table.sql !== expected.sql || canonicalJson(table.columns) !== canonicalJson(expected.columns)
      || !Array.isArray(table.rows) || counts?.[table.name] !== table.rows.length) throw new Error('Snapshot schema or counts mismatch');
    for (const row of table.rows) {
      if (!Number.isSafeInteger(row.__rowid) || canonicalJson(Object.keys(row).sort()) !== canonicalJson(['__rowid', ...table.columns].sort())
        || Object.values(row).some(value => value !== null && typeof value !== 'string' && (typeof value !== 'number' || !Number.isFinite(value)))) throw new Error('Invalid snapshot row');
    }
  }
  if (!Array.isArray(snapshot.sequences) || snapshot.sequences.some(row => !STORE_TABLES[kind].includes(row.name) || !Number.isSafeInteger(row.seq) || row.seq < 0)
    || new Set(snapshot.sequences.map(row => row.name)).size !== snapshot.sequences.length) throw new Error('Invalid snapshot sequences');
  return { digest, counts };
}
function dependencyOrder(database, names) {
  const ordered = [], visiting = new Set();
  function visit(name) {
    if (ordered.includes(name)) return;
    if (visiting.has(name)) throw new Error('Snapshot schema has cyclic foreign keys');
    visiting.add(name);
    for (const row of database.prepare(`PRAGMA foreign_key_list(${identifier(name)})`).all()) if (names.includes(row.table)) visit(row.table);
    visiting.delete(name); ordered.push(name);
  }
  names.forEach(visit); return ordered;
}
export function importStoreSnapshot(database, transaction, snapshot, kind) {
  const verified = verifyStoreSnapshot(snapshot, database, kind);
  return transaction(() => {
    database.exec('CREATE TABLE IF NOT EXISTS _cloud_migration_receipts (digest TEXT PRIMARY KEY, imported_at TEXT NOT NULL)');
    const previous = database.prepare('SELECT digest FROM _cloud_migration_receipts').all();
    if (previous.length) {
      if (previous.length === 1 && previous[0].digest === snapshot.digest) {
        if (exportStoreSnapshot(database,kind,{now:snapshot.createdAt}).digest !== snapshot.digest) throw new Error('Staged store changed after import');
        return { ...verified, duplicate: true };
      }
      throw new Error('A different snapshot was already imported');
    }
    for (const name of STORE_TABLES[kind]) if (!MIGRATION_TABLES.has(name)
      && database.prepare(`SELECT COUNT(*) AS count FROM ${identifier(name)}`).get().count !== 0) throw new Error('Snapshot import requires an empty staged store');
    const order = dependencyOrder(database, STORE_TABLES[kind]);
    for (const name of [...order].reverse()) database.exec(`DELETE FROM ${identifier(name)}`);
    for (const name of order) {
      const table = snapshot.tables.find(t => t.name === name);
      const columns = ['__rowid', ...table.columns];
      const statement = database.prepare(`INSERT INTO ${identifier(name)} (rowid, ${table.columns.map(identifier).join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`);
      for (const row of table.rows) statement.run(...columns.map(column => row[column]));
    }
    const sequenceExists = database.prepare("SELECT 1 AS present FROM sqlite_schema WHERE name='sqlite_sequence'").get();
    if (sequenceExists) {
      database.exec('DELETE FROM sqlite_sequence');
      for (const row of snapshot.sequences) database.prepare('INSERT INTO sqlite_sequence(name, seq) VALUES (?, ?)').run(row.name, row.seq);
    } else if (snapshot.sequences.length) throw new Error('Snapshot sequence schema mismatch');
    if (database.prepare('PRAGMA foreign_key_check').all().length) throw new Error('Snapshot foreign key integrity failed');
    const replay = exportStoreSnapshot(database, kind, { now: snapshot.createdAt });
    if (replay.digest !== snapshot.digest) throw new Error('Snapshot replay digest mismatch');
    database.prepare('INSERT INTO _cloud_migration_receipts VALUES (?, ?)').run(snapshot.digest, new Date().toISOString());
    return { ...verified, duplicate: false };
  });
}
export function migrationBundle(stores, { now = new Date().toISOString(), sourceRevision, watermark } = {}) {
  if (!/^[a-f0-9]{40}$/.test(sourceRevision ?? '') || !watermark || typeof watermark !== 'string') throw new Error('Source revision and final watermark are required');
  if (canonicalJson(Object.keys(stores).sort()) !== canonicalJson(Object.keys(STORE_TABLES).sort())) throw new Error('All three stores are required');
  const body = { format: 'site-health.migration-bundle.v1', createdAt: now, sourceRevision, watermark, stores };
  return { ...body, digest: snapshotDigest(body) };
}

export function verifyMigrationBundle(bundle) {
  if (bundle?.format !== 'site-health.migration-bundle.v1') throw new Error('Unsupported migration bundle');
  const { digest, ...body } = bundle;
  if (!/^[a-f0-9]{64}$/.test(digest ?? '') || snapshotDigest(body) !== digest) throw new Error('Migration bundle digest mismatch');
  // Reuse the constructor's complete-store/source/watermark validation.
  migrationBundle(bundle.stores, bundle);
  if (!Number.isFinite(Date.parse(bundle.createdAt))) throw new Error('Invalid migration timestamp');
  for (const [kind, snapshot] of Object.entries(bundle.stores)) {
    const { digest: storeDigest, counts, ...storeBody } = snapshot;
    if (snapshot.kind !== kind || snapshotDigest(storeBody) !== storeDigest) throw new Error('Migration store digest mismatch');
  }
  return { digest, sourceRevision: bundle.sourceRevision, watermark: bundle.watermark };
}
export async function stageMigrationBundle(bundle, namespaces, { stageId } = {}) {
  const verified = verifyMigrationBundle(bundle);
  if (!/^staging-[a-z0-9-]{1,100}$/.test(stageId ?? '')) throw new Error('An isolated staging identity is required');
  if (canonicalJson(Object.keys(namespaces).sort()) !== canonicalJson(Object.keys(STORE_TABLES).sort())) throw new Error('All three staging targets are required');
  const targets = Object.fromEntries(Object.entries(namespaces).map(([kind, namespace]) => [kind, namespace.getByName(stageId)]));
  const stores = {};
  for (const kind of Object.keys(STORE_TABLES)) {
    const receipt = await targets[kind].importSnapshot(bundle.stores[kind]);
    const replay = await targets[kind].exportSnapshot();
    const comparable = { ...replay, createdAt: bundle.stores[kind].createdAt };
    const {digest,counts,...body} = comparable;
    if (snapshotDigest(body) !== bundle.stores[kind].digest) throw new Error(`Staged ${kind} replay mismatch`);
    stores[kind] = receipt;
  }
  return { ...verified, stageId, stores, status: 'stores-verified', cutoverPerformed: false };
}
