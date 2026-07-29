#!/usr/bin/env node
// fleet-tasks — gather all open GitHub issues across Fleet repos.
//
// Enumerates projects from foundry/ops/config/projects.json, resolves each
// project's GitHub owner/repo from its git remote (fleet-workspace remote for
// foundry/* projects), dedupes by GitHub repo, and prints open issues grouped
// by repo. Read-only. Requires `gh` (authed) and `jq` on PATH.
//
// Usage:
//   ./foundry/ops/scripts/fleet-tasks.mjs
//   ./foundry/ops/scripts/fleet-tasks.mjs --assignee me      # only issues assigned to you
//   ./foundry/ops/scripts/fleet-tasks.mjs --label bug        # filter by label
//   ./foundry/ops/scripts/fleet-tasks.mjs --repo owner/name  # single repo override
//   ./foundry/ops/scripts/fleet-tasks.mjs --json             # emit machine-readable JSON
//   ./foundry/ops/scripts/fleet-tasks.mjs --limit 500        # per-repo cap (default 200)

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const moduleDir = dirname(fileURLToPath(import.meta.url));
const fleetOpsRoot = resolve(moduleDir, "..");
const fleetRoot = resolve(fleetOpsRoot, "..", "..");
const projectsPath = resolve(fleetOpsRoot, "config", "projects.json");

// Projects explicitly excluded from fleet-wide sweeps (mirrors AGENTS.md).
const OUT_OF_FLEET = new Set([
  "open-historia",
  "today-little-log",
  "truehire",
  "companion-robot",
  "device-net-test",
  "forecast-lab",
  "elves-hq",
  "saas-maker-ci-fix",
]);

const EXCLUDED_TIERS = new Set(["out-of-fleet", "non-product"]);

function parseArgs(argv) {
  const flags = { assignee: null, label: null, repo: null, json: false, limit: 200, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") flags.help = true;
    else if (arg === "--json") flags.json = true;
    else if (arg === "--assignee") flags.assignee = argv[++i];
    else if (arg === "--label") flags.label = argv[++i];
    else if (arg === "--repo") flags.repo = argv[++i];
    else if (arg === "--limit") flags.limit = Number(argv[++i]);
    else if (arg.startsWith("--assignee=")) flags.assignee = arg.slice("--assignee=".length);
    else if (arg.startsWith("--label=")) flags.label = arg.slice("--label=".length);
    else if (arg.startsWith("--repo=")) flags.repo = arg.slice("--repo=".length);
    else if (arg.startsWith("--limit=")) flags.limit = Number(arg.slice("--limit=".length));
  }
  return flags;
}

function help() {
  return `fleet-tasks — all open GitHub issues across Fleet repos.

Usage:
  ./foundry/ops/scripts/fleet-tasks.mjs [flags]

Flags:
  --assignee <user|me>  Only issues assigned to this user ("me" = authenticated user).
  --label <name>        Only issues with this label.
  --repo <owner/name>   Query a single GitHub repo instead of the full fleet.
  --limit <n>           Per-repo issue cap (default 200).
  --json                Emit machine-readable JSON instead of grouped text.
  -h, --help            Show this help.

Requires: gh (authed), jq.`;
}

// Parse a git remote URL into { owner, repo } or null.
function parseRemote(url) {
  if (!url) return null;
  const ssh = url.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (ssh) return { owner: ssh[1], repo: ssh[2] };
  return null;
}

function gitRemote(dir) {
  const result = spawnSync("git", ["-C", dir, "remote", "get-url", "origin"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  if (result.status !== 0) return null;
  return result.stdout.trim();
}

// Build the unique set of GitHub repos to query from projects.json.
// Returns [{ owner, repo, projectIds: string[] }] deduped by "owner/repo".
function resolveRepos(flags) {
  if (flags.repo) {
    const [owner, repo] = flags.repo.split("/");
    if (!owner || !repo) {
      console.error(`Invalid --repo "${flags.repo}", expected owner/name.`);
      process.exit(2);
    }
    return [{ owner, repo, projectIds: [flags.repo] }];
  }

  const config = JSON.parse(readFileSync(projectsPath, "utf8"));
  const projects = config.projects || [];
  const fleetWorkspaceRemote = gitRemote(fleetRoot);
  const fleetWorkspaceParsed = parseRemote(fleetWorkspaceRemote);

  const byKey = new Map();
  const noRemote = [];

  for (const project of projects) {
    const id = project.id;
    if (OUT_OF_FLEET.has(id) || EXCLUDED_TIERS.has(project.tier)) continue;
    const repoPath = project.repo;
    if (!repoPath) continue;

    let parsed;
    if (repoPath.startsWith("foundry/")) {
      parsed = fleetWorkspaceParsed; // foundry/* projects live in fleet-workspace repo
    } else {
      const dir = resolve(fleetRoot, repoPath);
      parsed = parseRemote(gitRemote(dir));
    }

    if (!parsed) {
      noRemote.push({ id, repoPath });
      continue;
    }
    const key = `${parsed.owner}/${parsed.repo}`;
    const existing = byKey.get(key);
    if (existing) existing.projectIds.push(id);
    else byKey.set(key, { ...parsed, projectIds: [id] });
  }

  if (noRemote.length) {
    console.error(
      `warn: ${noRemote.length} project(s) had no resolvable GitHub remote and were skipped:`,
    );
    for (const { id, repoPath } of noRemote) console.error(`  ${id} (${repoPath})`);
  }

  return [...byKey.values()];
}

function queryIssues(target, flags) {
  const args = [
    "issue", "list",
    "--repo", `${target.owner}/${target.repo}`,
    "--state", "open",
    "--json", "number,title,assignees,labels,updatedAt,url",
    "--limit", String(flags.limit),
  ];
  if (flags.assignee) args.push("--assignee", flags.assignee);
  if (flags.label) args.push("--label", flags.label);

  const result = spawnSync("gh", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status !== 0) {
    return {
      ok: false,
      error: (result.stderr || result.stdout || "").trim() || `gh exited ${result.status}`,
      issues: [],
    };
  }
  let issues;
  try {
    issues = JSON.parse(result.stdout);
  } catch (error) {
    return { ok: false, error: `failed to parse gh output: ${error.message}`, issues: [] };
  }
  return { ok: true, error: null, issues };
}

function formatIssue(issue) {
  const assignees = (issue.assignees || []).map((a) => a.login).join(",") || "—";
  const labels = (issue.labels || []).map((l) => l.name).join(",") || "";
  const labelPart = labels ? ` [${labels}]` : "";
  return `  #${issue.number}  ${issue.title}${labelPart}  @${assignees}  ${issue.updatedAt.slice(0, 10)}`;
}

function printText(results, flags) {
  const total = results.reduce((sum, r) => sum + (r.ok ? r.issues.length : 0), 0);
  const failed = results.filter((r) => !r.ok);
  const withIssues = results.filter((r) => r.ok && r.issues.length > 0);
  const empty = results.filter((r) => r.ok && r.issues.length === 0);

  for (const r of withIssues) {
    const key = `${r.target.owner}/${r.target.repo}`;
    console.log(`\n== ${key}  (${r.issues.length}) ==`);
    for (const issue of r.issues) console.log(formatIssue(issue));
  }

  if (empty.length) {
    console.log(`\n== No open issues ==`);
    for (const r of empty) console.log(`  ${r.target.owner}/${r.target.repo}`);
  }

  if (failed.length) {
    console.log(`\n== Failed to query ==`);
    for (const r of failed) console.log(`  ${r.target.owner}/${r.target.repo}: ${r.error}`);
  }

  console.log(`\n== Summary ==`);
  console.log(`Repos queried: ${results.length}`);
  console.log(`Open issues: ${total}`);
  if (failed.length) console.log(`Failed: ${failed.length}`);
  if (flags.assignee) console.log(`Assignee filter: ${flags.assignee}`);
  if (flags.label) console.log(`Label filter: ${flags.label}`);
}

function printJson(results) {
  const payload = {
    generatedAt: new Date().toISOString(),
    total: results.reduce((sum, r) => sum + (r.ok ? r.issues.length : 0), 0),
    repos: results.map((r) => ({
      owner: r.target.owner,
      repo: r.target.repo,
      projectIds: r.target.projectIds,
      ok: r.ok,
      error: r.error,
      issueCount: r.ok ? r.issues.length : 0,
      issues: r.issues,
    })),
  };
  console.log(JSON.stringify(payload, null, 2));
}

function main() {
  const flags = parseArgs(process.argv.slice(2));
  if (flags.help) {
    console.log(help());
    return;
  }

  const repos = resolveRepos(flags);
  if (!repos.length) {
    console.error("No Fleet repos resolved from projects.json.");
    process.exit(1);
  }

  const results = repos.map((target) => {
    const query = queryIssues(target, flags);
    return { target, ...query };
  });

  if (flags.json) printJson(results);
  else printText(results, flags);

  const anyFailed = results.some((r) => !r.ok);
  if (anyFailed) process.exit(1);
}

main();
