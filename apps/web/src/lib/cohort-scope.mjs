import { isCurrentProject, scopeOutcomeRows } from "./project-directory.mjs";

// Share successful inventory loads, but let a later request recover after failure.
export function createOutcomeScope(loadProjects, reportScope) {
  let pending;
  const projects = () => pending ??= Promise.resolve().then(loadProjects).catch((error) => {
    pending = undefined;
    throw error;
  });
  return async (payload, includeInactive = false) => {
    try {
      const inventory = await projects();
      reportScope(`${inventory.filter(isCurrentProject).length} current products · primary and active`);
      return { ...payload, rows: scopeOutcomeRows(payload.rows, inventory, includeInactive) };
    } catch {
      reportScope("Scope unavailable · showing all recorded products; refresh to retry");
      return payload;
    }
  };
}
