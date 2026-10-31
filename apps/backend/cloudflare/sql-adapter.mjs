// SQL remains synchronous inside one Durable Object. Never send individual
// statements over RPC or emulate SQL transaction control with mutable flags.
export function durableSqlDatabase(storage) {
  const exec = (sql, ...parameters) => storage.sql.exec(sql, ...parameters);
  return {
    exec(sql) { exec(sql).toArray(); },
    prepare(sql) {
      return {
        all(...parameters) { return exec(sql, ...parameters).toArray(); },
        get(...parameters) { return exec(sql, ...parameters).toArray()[0]; },
        run(...parameters) {
          exec(sql, ...parameters).toArray();
          // rowsWritten includes index maintenance; changes() matches SQLite's
          // affected-row semantics used by the existing stores.
          const row = exec('SELECT changes() AS changes, last_insert_rowid() AS lastInsertRowid').one();
          return row;
        },
      };
    },
    close() {},
  };
}
export function durableTransaction(storage) {
  return (work) => storage.transactionSync(() => {
    const result = work();
    if (result && typeof result.then === 'function') throw new TypeError('SQLite transactions must be synchronous');
    return result;
  });
}
