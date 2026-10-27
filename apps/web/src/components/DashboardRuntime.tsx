import { useEffect } from 'react';

// Astro initializes the React runtime before the DOM dashboard mounts its
// shared-library evidence tables. Keep collection and page handlers in one place.
export default function DashboardRuntime() {
  useEffect(() => { void import('../scripts/dashboard-client'); }, []);
  return null;
}
