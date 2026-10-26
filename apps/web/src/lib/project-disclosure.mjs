// Count the current rendered rows so refreshes and filter changes share one source.
// A disclosure toggle only updates its label; it must not reopen the disclosure.
export function updateProjectResultCount(document) {
  const result = document.querySelector('[data-project-result-count]');
  if (!result) return;
  let current = 0;
  let inactive = 0;
  for (const row of document.querySelectorAll('.project-health-row')) {
    if (row.hidden) continue;
    if (row.dataset.projectSection === 'current') current += 1;
    if (row.dataset.projectSection === 'inactive') inactive += 1;
  }
  result.textContent = document.querySelector('[data-inactive-projects]')?.open
    ? `${current} current products · ${inactive} inactive identities`
    : `${current} current products`;
}

export function bindProjectDisclosureCount(document) {
  const details = document.querySelector('[data-inactive-projects]');
  if (!details || details.dataset.countBound === 'true') return;
  details.dataset.countBound = 'true';
  details.addEventListener('toggle', () => updateProjectResultCount(document));
}
