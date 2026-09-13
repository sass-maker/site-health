#!/usr/bin/env node
/**
 * One-shot migration: replace the string `lifecycle` field with a
 * three-field lifecycle object per the Portfolio Cleanup PRD.
 *
 *   lifecycle: "maintained" | "past"
 *   →
 *   lifecycle: {
 *     status: "primary" | "active" | "inactive",
 *     shareable: boolean,
 *     resumeCondition: string | null,
 *   }
 *
 * Status allocation is binding from PRD Appendix A.
 * Existing lifecycle decisions are preserved. Legacy readiness flags never
 * establish shareability; an unmigrated project starts unverified (false).
 * resumeCondition is null for primary/active; null for inactive unless
 * explicit owner evidence exists (never fabricated).
 */

import { readFile } from 'node:fs/promises';
import { compatibilityCatalog } from '../../saas-maker/scripts/catalog-schema.mjs';
import { saveCatalog } from '../../saas-maker/scripts/catalog-store.mjs';

const CATALOG_PATH = new URL(
  '../../saas-maker/catalog/projects.json',
  import.meta.url,
).pathname;

// ─── Binding status allocation (PRD Appendix A) ───

const STATUS_MAP = {
  // Primary — 2
  codevetter: 'primary',
  posttrainllm: 'primary',

  // Active — 19 (Nomad added by owner on 2026-09-07)
  'nomad-data-adventure': 'active',
  starboard: 'active',
  'swe-interview-prep': 'active',
  'high-signal': 'active',
  setline: 'active',
  anchor: 'active',
  'anime-list': 'active',
  'what-it-takes-to-win': 'active',
  calorie: 'active',
  live: 'active',
  pace: 'active',
  'site-health': 'active',
  'app-health': 'active',
  'knowledge-base': 'active',
  'chatgpt-connections': 'active',
  'free-ai': 'active',
  'saas-maker': 'active',
  significanthobbies: 'active',
  'ios-landings': 'active',

  // Inactive — 36
  'on-record': 'inactive',
  'research-papers': 'inactive',
  'chatgpt-memory-insights': 'inactive',
  reader: 'inactive',
  looptv: 'inactive',
  'veg-protein-food': 'inactive',
  'india-standards': 'inactive',
  drank: 'inactive',
  'psi-swarm': 'inactive',
  gitstat: 'inactive',
  'sarthakagrawal-personal': 'inactive',
  'issue-pages': 'inactive',
  'email-manager': 'inactive',
  rolepatch: 'inactive',
  karte: 'inactive',
  'reel-pipeline': 'inactive',
  mashup: 'inactive',
  'field-track': 'inactive',
  'ai-game': 'inactive',
  kith: 'inactive',
  motion: 'inactive',
  'web-playables': 'inactive',
  'agent-office': 'inactive',
  'mobile-dev-cockpit': 'inactive',
  journal: 'inactive',
  chess: 'inactive',
  'protein-index': 'inactive',
  materia: 'inactive',
  'reddit-insights': 'inactive',
  everythingrated: 'inactive',
  'verified-bases': 'inactive',
  truehire: 'inactive',
  'local-ai-video-studio': 'inactive',
  'open-historia': 'inactive',
  'companion-robot': 'inactive',
  'forecast-lab': 'inactive',
};

// Preserve the canonical decision when this migration is rerun. Recorded
// legacy readiness flags are not runtime verification evidence.
function deriveShareable(project) {
  return typeof project.lifecycle === 'object'
    && project.lifecycle !== null
    && project.lifecycle.shareable === true;
}

function deriveResumeCondition(project, status) {
  if (status !== 'inactive') return null;
  return project.lifecycle?.resumeCondition ?? null;
}

// ─── Migration ───

async function main() {
  const raw = await readFile(CATALOG_PATH, 'utf8');
  const catalog = compatibilityCatalog(JSON.parse(raw));
  const projects = catalog.projects;

  // Validate: every project in the catalog has a binding status
  const catalogIds = projects.map((p) => p.id).sort();
  const statusIds = Object.keys(STATUS_MAP).sort();
  const missing = catalogIds.filter((id) => !STATUS_MAP[id]);
  const extra = statusIds.filter((id) => !catalogIds.includes(id));
  if (missing.length > 0) {
    throw new Error(`Missing status allocation for: ${missing.join(', ')}`);
  }
  if (extra.length > 0) {
    throw new Error(`Status map has extra IDs not in catalog: ${extra.join(', ')}`);
  }

  // Count check
  const counts = { primary: 0, active: 0, inactive: 0 };
  for (const id of statusIds) counts[STATUS_MAP[id]]++;
  if (counts.primary !== 2 || counts.active !== 19 || counts.inactive !== 36) {
    throw new Error(
      `Count mismatch: primary=${counts.primary} (expect 2), active=${counts.active} (expect 19), inactive=${counts.inactive} (expect 36)`,
    );
  }

  // Migrate each project
  const report = [];
  for (const project of projects) {
    const oldLifecycle = project.lifecycle;
    const status = STATUS_MAP[project.id];
    const shareable = deriveShareable(project);
    const resumeCondition = deriveResumeCondition(project, status);

    project.lifecycle = {
      status,
      shareable,
      resumeCondition,
    };

    report.push({
      id: project.id,
      oldLifecycle,
      newStatus: status,
      shareable,
      resumeCondition,
      oldReadyToShare: project.portfolio?.readyToShare ?? project.portfolio?.readyToBeShared ?? false,
      oldVerifiedAt: project.portfolio?.sharingReadiness?.verifiedAt ?? '',
    });
  }

  // Write updated catalog
  await saveCatalog(CATALOG_PATH, catalog, raw);

  // Print report
  console.log(`Migrated ${projects.length} projects`);
  console.log(`  primary: ${counts.primary}, active: ${counts.active}, inactive: ${counts.inactive}`);
  console.log(`  shareable=true: ${report.filter((r) => r.shareable).length}`);
  console.log(`  shareable=false: ${report.filter((r) => !r.shareable).length}`);
  console.log();
  for (const r of report) {
    console.log(
      `  ${r.id.padEnd(35)} ${String(r.oldLifecycle?.status ?? r.oldLifecycle).padEnd(12)} → ${r.newStatus.padEnd(10)} shareable=${r.shareable}`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
