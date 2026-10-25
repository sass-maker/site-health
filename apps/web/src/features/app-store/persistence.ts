import { retain, type ListingDraft, type Workspace } from './domain.ts';
import { ConflictError, type SavedWorkspace } from './storage.ts';
export interface WorkspaceIO {
  read(): Promise<SavedWorkspace>;
  write(data: Workspace, revision: number): Promise<SavedWorkspace>;
}
export class SaveError extends Error {
  recovery: Workspace;
  constructor(error: unknown, recovery: Workspace) {
    super(
      `Local save failed. ${error instanceof Error ? error.message : 'Storage is unavailable.'}`,
    );
    this.recovery = recovery;
  }
}
export async function commitWorkspace(
  io: WorkspaceIO,
  initial: SavedWorkspace,
  update: (data: Workspace) => Workspace,
): Promise<SavedWorkspace> {
  let current = initial;
  for (let retry = 0; ; retry++) {
    const next = retain(update(current.data));
    try {
      return await io.write(next, current.revision);
    } catch (error) {
      if (error instanceof ConflictError && retry < 2) {
        try {
          current = await io.read();
        } catch (readError) {
          throw new SaveError(readError, next);
        }
        continue;
      }
      throw new SaveError(error, next);
    }
  }
}
export class DraftConflictError extends Error {
  latest: ListingDraft;
  constructor(latest: ListingDraft) {
    super(
      'Another tab changed this locale. Choose which text to keep, or export your on-screen draft.',
    );
    this.latest = latest;
  }
}
export function replaceDraft(
  data: Workspace,
  next: ListingDraft,
  base: string | undefined,
): Workspace {
  const existing = data.drafts.find(
    (d) => d.projectId === next.projectId && d.locale === next.locale,
  );
  if (existing && existing.updatedAt !== base) throw new DraftConflictError(existing);
  if (!data.projects.some((p) => p.id === next.projectId))
    throw new Error(
      'This project was deleted in another tab. Export your on-screen draft before leaving.',
    );
  return {
    ...data,
    drafts: [
      ...data.drafts.filter((d) => d.projectId !== next.projectId || d.locale !== next.locale),
      next,
    ],
  };
}
export async function persistDraft(
  change: (update: (data: Workspace) => Workspace) => Promise<void>,
  next: ListingDraft,
  base: string | undefined,
): Promise<string> {
  await change((data) => replaceDraft(data, next, base));
  return next.updatedAt;
}

export async function withDraftGuard(
  guard: () => Promise<boolean>,
  action: () => void | Promise<void>,
): Promise<boolean> {
  if (!(await guard())) return false;
  await action();
  return true;
}
