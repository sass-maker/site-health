export function numericEvidence(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function evidenceRowId(row) {
  // A product can own multiple Search Console properties or domains.
  return JSON.stringify([row.projectId ?? null, row.domain ?? null, row.property ?? row.propertyUrl ?? null]);
}
