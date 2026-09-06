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
 * shareable is derived from existing portfolio.readyToShare/readyToBeShared
 * + sharingReadiness evidence (fails closed to false).
 * resumeCondition is null for primary/active; null for inactive unless
 * explicit owner evidence exists (never fabricated).
 */

import { readFile, writeFile } from 'node:fs/promises';

const CATALOG_PATH = new URL(
  '../apps/backend/config/projects.json',
  import.meta.url,
).pathname;

// ─── Binding status allocation (PRD Appendix A) ───

const STATUS_MAP = {
  // Primary — 2
  codevetter: 'primary',
  posttrainllm: 'primary',

  // Active — 18
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

// ─── Shareability evidence ───
//
// Derived from portfolio.readyToShare / readyToBeShared + sharingReadiness.
// Fails closed to false when no verification evidence exists.
// The PRD says "Preserve latest explicit owner intent. Reuse sufficiently
// specific existing evidence." The existing readyToShare + verifiedAt date
// IS that evidence.

function deriveShareable(project) {
  const port = project.portfolio ?? {};
  const rts = port.readyToShare ?? port.readyToBeShared ?? false;
  const sr = port.sharingReadiness ?? {};
  const verifiedAt = sr.verifiedAt ?? '';
  // Only set shareable: true if there's explicit verification evidence
  if (rts && verifiedAt) return true;
  return false;
}

// ─── Resume conditions ───
//
// null for primary/active (PRD invariant).
// null for inactive unless explicit owner evidence exists.
// Never fabricated.

function deriveResumeCondition(project, status) {
  if (status === 'primary' || status === 'active') return null;
  // Inactive: no explicit resume conditions in existing data.
  // Do not fabricate. All null for now.
  return null;
}

// ─── Migration ───

async function main() {
  const raw = await readFile(CATALOG_PATH, 'utf8');
  const catalog = JSON.parse(raw);
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
  if (counts.primary !== 2 || counts.active !== 18 || counts.inactive !== 36) {
    throw new Error(
      `Count mismatch: primary=${counts.primary} (expect 2), active=${counts.active} (expect 18), inactive=${counts.inactive} (expect 36)`,
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
  const output = JSON.stringify(catalog, null, 2) + '\n';
  await writeFile(CATALOG_PATH, output, 'utf8');

  // Print report
  console.log(`Migrated ${projects.length} projects`);
  console.log(`  primary: ${counts.primary}, active: ${counts.active}, inactive: ${counts.inactive}`);
  console.log(`  shareable=true: ${report.filter((r) => r.shareable).length}`);
  console.log(`  shareable=false: ${report.filter((r) => !r.shareable).length}`);
  console.log();
  for (const r of report) {
    console.log(
      `  ${r.id.padEnd(35)} ${r.oldLifecycle.padEnd(12)} → ${r.newStatus.padEnd(10)} shareable=${r.shareable}`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
