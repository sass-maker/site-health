import { emptyWorkspace, retain, validateWorkspace, type Workspace } from './domain.ts';
export class ConflictError extends Error {}
export class StoredDataError extends Error {
  raw: unknown;
  constructor(error: unknown, raw: unknown) {
    super(
      `Stored workspace is invalid. ${error instanceof Error ? error.message : 'Validation failed.'}`,
    );
    this.raw = raw;
  }
}
export type SavedWorkspace = { revision: number; data: Workspace };
const DB = 'site-health-app-store-seo';
export class WorkspaceStore {
  private db: IDBDatabase;
  private channel =
    typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('site-health-app-store-seo');
  constructor(db: IDBDatabase) {
    this.db = db;
    db.onversionchange = () => db.close();
  }
  static open(): Promise<WorkspaceStore> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore('workspace');
      };
      request.onblocked = () =>
        reject(new Error('Close another App Store SEO tab to upgrade storage.'));
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(new WorkspaceStore(request.result));
    });
  }
  subscribe(callback: () => void) {
    if (!this.channel) return () => {};
    this.channel.addEventListener('message', callback);
    return () => this.channel?.removeEventListener('message', callback);
  }
  read(): Promise<SavedWorkspace> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('workspace', 'readonly');
      const r = tx.objectStore('workspace').get('current');
      r.onsuccess = () => {
        try {
          resolve(
            r.result
              ? { revision: r.result.revision, data: validateWorkspace(r.result.data) }
              : { revision: 0, data: emptyWorkspace() },
          );
        } catch (e) {
          reject(new StoredDataError(e, r.result));
        }
      };
      r.onerror = () => reject(r.error);
    });
  }
  write(data: Workspace, revision: number): Promise<SavedWorkspace> {
    const valid = validateWorkspace(retain(data));
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('workspace', 'readwrite');
      const store = tx.objectStore('workspace');
      const r = store.get('current');
      let conflict = false;
      const next = { revision: revision + 1, data: valid };
      r.onsuccess = () => {
        if ((r.result?.revision ?? 0) !== revision) {
          conflict = true;
          tx.abort();
          return;
        }
        store.put(next, 'current');
      };
      tx.oncomplete = () => {
        this.channel?.postMessage(next.revision);
        resolve(next);
      };
      tx.onabort = () =>
        reject(
          conflict
            ? new ConflictError(
                'Another tab saved changes. Reload the current workspace and retry; your on-screen changes remain available to back up.',
              )
            : (tx.error ?? new Error('Storage transaction failed.')),
        );
      tx.onerror = () => reject(tx.error);
    });
  }
  close() {
    this.channel?.close();
    this.db.close();
  }
}
