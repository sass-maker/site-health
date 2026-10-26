const orders = {
  'psi-low': ['psi', 1], 'psi-high': ['psi', -1], 'lcp-slow': ['lcp', -1],
  clicks: ['clicks', -1], impressions: ['impressions', -1],
};
export const outcomeTitle = (row) => row.name ?? row.projectName ?? row.projectId ?? row.domain ?? 'Portfolio evidence';
function numericSignal(row, key) {
  const value = row[key]?.value;
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
export function filterOutcomeRows(rows, query = '', order = 'name') {
  const needle = query.trim().toLocaleLowerCase();
  return rows.filter((row) => [outcomeTitle(row), row.domain, ...(row.projects ?? []).map((project) => project.name)].filter(Boolean).join(' ').toLocaleLowerCase().includes(needle))
    .sort((left, right) => {
      const sort = orders[order];
      if (sort) {
        const a = numericSignal(left, sort[0]);
        const b = numericSignal(right, sort[0]);
        if (a === null && b !== null) return 1;
        if (b === null && a !== null) return -1;
        if (a !== null && b !== null && a !== b) return (a - b) * sort[1];
      }
      return outcomeTitle(left).localeCompare(outcomeTitle(right));
    });
}
