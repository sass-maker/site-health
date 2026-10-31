export function sqliteTransaction(database) {
  return (work) => {
    database.exec('BEGIN IMMEDIATE');
    try {
      const result = work();
      if (result && typeof result.then === 'function') throw new TypeError('SQLite transactions must be synchronous');
      database.exec('COMMIT');
      return result;
    } catch (error) {
      database.exec('ROLLBACK');
      throw error;
    }
  };
}
