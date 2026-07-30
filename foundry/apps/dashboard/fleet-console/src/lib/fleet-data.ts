import { existsSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const appRoot = process.cwd();
const foundryRoot = resolve(appRoot, "../../..");
const fleetRoot = resolve(foundryRoot, "..");
const fleetOpsRoot = resolve(foundryRoot, "ops");

type RegistryProject = {
  id: string;
  name?: string;
  attention?: string;
  family?: string;
  repo?: string | null;
  sourcePath?: string | null;
  lifecycle?: string;
  tier?: string;
  status?: string;
  notes?: string;
  domains?: string[];
};

const registryPayload = readJsonObject(resolve(fleetOpsRoot, "config/projects.json")) as {
  projects?: RegistryProject[];
};
const registryProjects = registryPayload.projects ?? [];

const localDirBySlug: Record<string, string> = {
  "alive-ville": "aliveville",
  drank: "foundry/apps/internal/drank",
  "fleet-ops": "foundry/ops",
  "reel-pipeline": "foundry/marketing/reel-pipeline"
};

const canonicalSlugByAlias: Record<string, string> = {
  CodeVetter: "codevetter",
  "ai-game": "aliveville",
  "alive-ville": "aliveville",
  anime_list: "anime-list",
  linkchat: "karte",
  tinygpt: "posttrainllm",
  "resume-tailor": "rolepatch"
};

const productTitleBySlug: Record<string, string> = {
  aliveville: "AliveVille",
  "anime-list": "MAL Explorer",
  codevetter: "CodeVetter",
  drank: "drank",
  "email-manager": "Email Manager",
  "fleet-ops": "Fleet Ops",
  "free-ai": "AI Gateway",
  "high-signal": "High Signal",
  karte: "Karte",
  "knowledge-base": "Knowledge Base",
  looptv: "LoopTV",
  pace: "Pace",
  reader: "Reader",
  "reel-pipeline": "Reel Pipeline",
  "research-papers": "Research Papers",
  rolepatch: "RolePatch",
  starboard: "Starboard",
  "significanthobbies": "Significant Hobbies",
  "swe-interview-prep": "SWE Interview Prep",
  posttrainllm: "posttrainllm",
  "wifi-watch": "Wi-Fi Watch"
};

function canonicalProjectSlug(slug: string) {
  return canonicalSlugByAlias[slug] ?? slug;
}

function registrySlug(project: RegistryProject) {
  return project.id === "fleet-workspace" ? "fleet-ops" : canonicalProjectSlug(project.id);
}

function registryProject(slug: string) {
  return registryProjects.find((project) => registrySlug(project) === canonicalProjectSlug(slug));
}

export type CronJob = {
  id: string;
  enabled: boolean;
  cron: string;
  name: string;
  model: string;
  effort: string;
  promptFile: string;
  lockMinutes: number;
  source: string;
  nextHint: string;
  promptSummary: string;
};

export type WifiSummary = {
  health: string;
  latestMbps: number | null;
  averageMbps: number | null;
  sampleCount: number;
  eventCount: number;
  latestSampleAt: string | null;
  latestEventAt: string | null;
  incidents24h: number;
  captivePortalSeen: boolean;
  productPath: string;
  sparkline: number[];
};

export type FleetCommit = {
  hash: string;
  shortHash: string;
  committedAt: string;
  subject: string;
};

export type FleetDevlog = {
  projectSlug: string;
  projectTitle: string;
  repoUrl: string | null;
  commits: FleetCommit[];
};

export type DomainIntelligence = {
  domain: string;
  domainRating: number | null;
  domainRatingUpdatedAt: string | null;
  performanceScore: number | null;
  lcpMs: number | null;
  cls: number | null;
  psiUpdatedAt: string | null;
};

export type FleetProject = {
  slug: string;
  title: string;
  desc: string;
  tier: string;
  lane: string;
  repoUrl: string | null;
  homepage: string | null;
  localPath: string;
  localDir: string;
  checkedOut: boolean;
  branch: string | null;
  dirtyCount: number;
  hostingKind: "machine" | "cloudflare" | "external" | "local" | "unknown";
  hostingLabel: string;
  hostingDetail: string;
  deploymentStatus: string;
  workflowStatus: string;
  state: "needs-attention" | "active" | "blocked" | "local-only" | "past" | "local-changes" | "steady";
  stateLabel: string;
  updatedAt: string | null;
};

export type AgentSurface = {
  name: string;
  status: "running" | "configured" | "missing" | "stopped" | "unknown";
  detail: string;
};

export type FleetNode = {
  id: string;
  label: string;
  role: string;
  status: "online" | "needs-setup" | "offline" | "planned";
  host: string;
  operator: string;
  publicWorkloads: string[];
  privateAccess: AgentSurface[];
  agents: AgentSurface[];
  notes: string[];
};

export type MarketingPipeline = {
  updatedAt: string | null;
  proof: { brand: string; score: number; verdict: string; durationSeconds: number; sourceUrl: string } | null;
  stages: Array<{ name: string; state: "ready" | "blocked" | "not-configured"; detail: string }>;
  programs: Array<{
    slug: string;
    name: string;
    mode: "focus" | "evergreen" | "infrastructure" | "private";
    domain: string | null;
    publicMarketing: boolean;
    sourceBacked: boolean;
    cadence: string;
    cta: string;
  }>;
  orchestration: { state: "ready" | "blocked" | "not-configured"; detail: string; lastAt: string | null };
  targetHost: { state: "ready" | "blocked" | "not-configured"; detail: string; checkedAt: string | null };
  publisher: { state: "ready" | "blocked" | "not-configured"; detail: string; connected: number; total: number };
  lastReceipt: { brand: string; channel: string; provider: string; status: string; recordedAt: string } | null;
  brands: Array<{
    slug: string;
    name: string;
    domain: string;
    sourceReady: boolean;
    sourceDetail: string;
    channels: string[];
    mappedChannels: string[];
    connectedChannels: string[];
    postingState: "ready" | "blocked";
  }>;
};

export type LearningSummary = {
  url: string;
  generatedAt: string | null;
  sourceCount: number;
  freshCount: number;
  staleCount: number;
  pendingCount: number;
  activeSessionCount: number;
  completedSessionCount: number;
};

const nextHints: Record<string, string> = {
  "daily-fleet-health-sentinel": "Tue-Sun, 08:00 local",
  "weekly-fleet-ops-audit": "Mon, 08:00 local",
  "biweekly-fleet-audit": "Mon, 10:00 local"
};

function readJsonArray(path: string) {
  if (!existsSync(path)) return [];
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readJsonObject(path: string) {
  if (!existsSync(path)) return {};
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function safeGit(args: string[], cwd: string) {
  try {
    return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

function safeExec(command: string, args: string[] = [], timeout = 3500) {
  try {
    return execFileSync(command, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout
    }).trim();
  } catch (error) {
    const err = error as { stdout?: Buffer | string; stderr?: Buffer | string; message?: string };
    const stdout = err.stdout ? String(err.stdout).trim() : "";
    const stderr = err.stderr ? String(err.stderr).trim() : "";
    return stdout || stderr || err.message || "";
  }
}

function commandExists(command: string) {
  try {
    execFileSync("zsh", ["-lc", `command -v ${command}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 1200
    });
    return true;
  } catch {
    return false;
  }
}

function publicRepoUrl(value: string | null | undefined) {
  if (!value) return null;
  const normalized = value
    .replace(/^git@github.com:/, "https://github.com/")
    .replace(/\.git$/, "");
  return normalized.startsWith("https://github.com/") ? normalized : value;
}

function titleize(slug: string) {
  return slug
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function projectRoot(slug: string) {
  const project = registryProject(slug);
  const localDir =
    project?.lifecycle === "past"
      ? project.sourcePath ?? project.repo
      : project?.repo ?? project?.sourcePath;
  return resolve(fleetRoot, localDir ?? localDirBySlug[slug] ?? slug);
}

function projectLocalPath(slug: string) {
  const root = projectRoot(slug);
  return existsSync(root)
    ? relative(resolve(fleetRoot, ".."), root).replaceAll("\\", "/")
    : "not checked out";
}

function getHosting(project: {
  slug: string;
  root: string;
  checkedOut: boolean;
  pkg: Record<string, unknown>;
  homepage: string | null;
  verifiedSite: { url: string; platform: string } | null;
}) {
  if (project.slug === "fleet-ops") {
    return {
      hostingKind: "machine" as const,
      hostingLabel: "Machine-hosted",
      hostingDetail: "This Mac serves the Fleet info console through Cloudflare Tunnel."
    };
  }

  if (project.slug === "wifi-watch") {
    return {
      hostingKind: "local" as const,
      hostingLabel: "Machine telemetry",
      hostingDetail: "Local Wi-Fi telemetry feeds the console; it is not a separate public app host."
    };
  }

  if (project.verifiedSite) {
    return {
      hostingKind: "cloudflare" as const,
      hostingLabel: project.verifiedSite.platform,
      hostingDetail: `Live URL verified ${project.verifiedSite.url}`
    };
  }

  if (!project.checkedOut) {
    return {
      hostingKind: "unknown" as const,
      hostingLabel: "Not checked out",
      hostingDetail: "Cataloged in Foundry, but this machine has no local checkout to inspect."
    };
  }

  const hasWranglerConfig =
    existsSync(resolve(project.root, "wrangler.toml")) ||
    existsSync(resolve(project.root, "wrangler.jsonc")) ||
    existsSync(resolve(project.root, "wrangler.json"));
  const scripts = project.pkg && typeof project.pkg === "object" ? ((project.pkg as { scripts?: unknown }).scripts ?? {}) : {};
  const scriptText = JSON.stringify(scripts).toLowerCase();

  if (hasWranglerConfig || scriptText.includes("wrangler") || scriptText.includes("pages deploy")) {
    return {
      hostingKind: "cloudflare" as const,
      hostingLabel: "Cloudflare",
      hostingDetail: hasWranglerConfig
        ? "Local deploy config points at Cloudflare Workers or Pages."
        : "Package scripts deploy through Cloudflare tooling."
    };
  }

  if (project.homepage) {
    return {
      hostingKind: "external" as const,
      hostingLabel: "External/own domain",
      hostingDetail: "Has a public homepage, but no local Cloudflare deploy config was detected here."
    };
  }

  return {
    hostingKind: "local" as const,
    hostingLabel: "Local/dev",
    hostingDetail: "No public deploy target detected from this checkout."
  };
}

function summarizePrompt(prompt: string) {
  const lines = prompt
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replaceAll("/Users/assistant/Desktop/fleet", "fleet"));
  const purpose = lines.find((line) => /^Run|^Route|^Build/.test(line)) ?? "Scheduled Fleet Ops job.";
  const rules = lines
    .filter((line) => line.startsWith("- No ") || line.includes("Preserve dirty user work"))
    .slice(0, 3)
    .map((line) => line.replace(/^- /, ""));
  return [purpose, ...rules].join(" ");
}

export function getCronJobs(): CronJob[] {
  const cronRoot = resolve(fleetOpsRoot, "automation/codex-cron");
  const jobsPath = resolve(cronRoot, "jobs.tsv");
  const raw = readFileSync(jobsPath, "utf8").trim().split("\n");
  const headers = raw.shift()?.split("\t") ?? [];

  return raw.map((line) => {
    const values = line.split("\t");
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    const promptPath = resolve(cronRoot, row.prompt_file);
    const prompt = existsSync(promptPath) ? readFileSync(promptPath, "utf8").trim() : "";

    return {
      id: row.id,
      enabled: row.enabled === "yes",
      cron: row.cron,
      name: row.name,
      model: row.model,
      effort: row.effort,
      promptFile: row.prompt_file,
      lockMinutes: Number(row.lock_minutes || 0),
      source: row.source,
      nextHint: nextHints[row.id] ?? row.cron,
      promptSummary: summarizePrompt(prompt)
    };
  });
}

export function getWifiSummary(): WifiSummary {
  const wifiRoot = resolve(fleetRoot, "wifi-watch");
  const events = readJsonArray(resolve(wifiRoot, "data/events.json"));
  const samples = readJsonArray(resolve(wifiRoot, "data/samples.json"));
  const latestSample = samples.at(-1) as Record<string, unknown> | undefined;
  const latestEvent = events.at(-1) as Record<string, unknown> | undefined;
  const mbpsValues = samples
    .map((sample) => Number((sample as Record<string, unknown>).mbps))
    .filter((value) => Number.isFinite(value));
  const averageMbps =
    mbpsValues.length > 0
      ? Math.round((mbpsValues.reduce((sum, value) => sum + value, 0) / mbpsValues.length) * 10) / 10
      : null;
  const since = Date.now() - 24 * 60 * 60 * 1000;
  const incidents24h = events.filter((event) => {
    const item = event as Record<string, unknown>;
    const at = Date.parse(String(item.at ?? ""));
    const type = String(item.type ?? "");
    return at >= since && ["bandwidth_lost", "disconnected", "health_changed"].includes(type);
  }).length;
  const sparkline = mbpsValues.slice(-36).map((value) => Math.max(0, Math.min(100, Math.round(value))));

  return {
    health: String(latestSample?.health ?? "unknown"),
    latestMbps: Number.isFinite(Number(latestSample?.mbps)) ? Number(latestSample?.mbps) : null,
    averageMbps,
    sampleCount: samples.length,
    eventCount: events.length,
    latestSampleAt: typeof latestSample?.at === "string" ? latestSample.at : null,
    latestEventAt: typeof latestEvent?.at === "string" ? latestEvent.at : null,
    incidents24h,
    captivePortalSeen: samples.some((sample) => Boolean((sample as Record<string, unknown>).captivePortal)),
    productPath: "fleet/wifi-watch",
    sparkline
  };
}

export function getSnapshotInfo() {
  const registry = readJsonObject(resolve(fleetOpsRoot, "config/projects.json")) as {
    _meta?: { updated?: string };
  };

  return {
    generatedAt: new Date().toISOString(),
    refreshCadence: "Machine heartbeat updates every minute; project inventory is generated from the Fleet registry.",
    registryUpdatedAt: registry._meta?.updated ?? null
  };
}

export function getFleetDevlog(limit = 3): FleetDevlog[] {
  return getFleetProjects()
    .filter((project) => project.checkedOut)
    .map((project) => {
      const raw = safeGit(["log", `-${limit}`, "--format=%H%x09%h%x09%aI%x09%s"], projectRoot(project.slug));
      const commits = raw.split("\n").filter(Boolean).flatMap((line) => {
        const [hash, shortHash, committedAt, ...subjectParts] = line.split("\t");
        if (!hash || !shortHash || !committedAt) return [];
        return [{ hash, shortHash, committedAt, subject: subjectParts.join("\t") || "Untitled commit" }];
      });
      return {
        projectSlug: project.slug,
        projectTitle: project.title,
        repoUrl: project.repoUrl,
        commits
      };
    })
    .filter((entry) => entry.commits.length > 0)
    .sort((left, right) => Date.parse(right.commits[0]?.committedAt ?? "") - Date.parse(left.commits[0]?.committedAt ?? ""));
}

export function getDomainIntelligence(): DomainIntelligence[] {
  const drank = readJsonObject(resolve(fleetRoot, "foundry/apps/internal/drank/data/fleet-dr.json")) as {
    lastUpdated?: string | null;
    domains?: Record<string, { history?: Array<{ ts?: number; dr?: number }> }>;
  };
  const dbPath = resolve(process.env.HOME ?? "", ".psi-swarm/history.db");
  const rawRuns = existsSync(dbPath)
    ? safeExec("sqlite3", ["-json", dbPath, "SELECT url, started_at, lcp, cls, performance_score FROM runs WHERE error IS NULL AND tag = 'fleet-weekly' ORDER BY started_at DESC LIMIT 200"], 5000)
    : "";
  let runs: Array<{ url?: string; started_at?: number; lcp?: number; cls?: number; performance_score?: number }> = [];
  try { runs = JSON.parse(rawRuns || "[]"); } catch {}
  const domains = Object.entries(drank.domains ?? {}).map(([domain, entry]) => {
    const latestRating = (entry.history ?? []).at(-1);
    const domainRuns = runs.filter((run) => {
      try { return new URL(String(run.url)).hostname.replace(/^www\./, "") === domain; } catch { return false; }
    }).slice(0, 3);
    const median = (values: number[]) => {
      if (!values.length) return null;
      const sorted = [...values].sort((left, right) => left - right);
      return sorted[Math.floor(sorted.length / 2)] ?? null;
    };
    const performanceScore = median(domainRuns.map((run) => Number(run.performance_score)).filter(Number.isFinite));
    return {
      domain,
      domainRating: typeof latestRating?.dr === "number" ? latestRating.dr : null,
      domainRatingUpdatedAt: latestRating?.ts ? new Date(latestRating.ts).toISOString() : drank.lastUpdated ?? null,
      performanceScore: performanceScore !== null && performanceScore <= 1 ? performanceScore * 100 : performanceScore,
      lcpMs: median(domainRuns.map((run) => Number(run.lcp)).filter(Number.isFinite)),
      cls: median(domainRuns.map((run) => Number(run.cls)).filter(Number.isFinite)),
      psiUpdatedAt: domainRuns[0]?.started_at ? new Date(Number(domainRuns[0].started_at)).toISOString() : null
    };
  });
  return domains.sort((left, right) => left.domain.localeCompare(right.domain));
}

export function getFleetProjects(): FleetProject[] {
  const catalog = registryProjects.reduce<Record<string, {
    name?: string;
    desc?: string;
    homepage?: string | null;
    repo?: string | null;
    sourcePath?: string | null;
    lifecycle?: string;
    attention?: string;
    status?: string;
    tier?: string;
  }>>((entries, project) => {
    if (project.tier === "non-product") return entries;
    const slug = registrySlug(project);
    const current = entries[slug];
    entries[slug] = {
      name: current?.name || project.name,
      desc: current?.desc || project.notes,
      homepage: current?.homepage || (project.domains?.[0] ? `https://${project.domains[0]}` : null),
      repo: current?.repo || project.repo,
      sourcePath: current?.sourcePath || project.sourcePath,
      lifecycle: current?.lifecycle ?? project.lifecycle,
      attention: current?.attention ?? project.attention,
      status: current?.status === "live" && project.status === "live" ? "live" : (current?.status ?? project.status),
      tier: current?.tier ?? project.tier
    };
    return entries;
  }, {});
  const siteRegistry = readJsonObject(resolve(fleetOpsRoot, "config/project-sites.json")) as {
    projects?: Record<string, { url?: string; platform?: string }>;
  };
  const slugs = [...new Set([...Object.keys(catalog), "fleet-ops", "wifi-watch"])]
    .filter((slug) => Boolean(catalog[slug]) || existsSync(projectRoot(slug)))
    .sort((a, b) => a.localeCompare(b));

  return slugs.map((slug) => {
    const root = projectRoot(slug);
    const pkg = readJsonObject(resolve(root, "package.json")) as { homepage?: string; name?: string; description?: string };
    const meta = catalog[slug] ?? {};
    const localDir =
      meta.lifecycle === "past"
        ? meta.sourcePath ?? meta.repo ?? localDirBySlug[slug] ?? slug
        : meta.repo ?? meta.sourcePath ?? localDirBySlug[slug] ?? slug;
    const checkedOut = existsSync(root);
    const hasGit = safeGit(["rev-parse", "--is-inside-work-tree"], root) === "true";
    const registeredSite = siteRegistry.projects?.[slug];
    const verifiedSite = registeredSite?.url
      ? { url: registeredSite.url, platform: registeredSite.platform ?? "Cloudflare" }
      : null;
    const homepage = verifiedSite?.url ?? meta.homepage ?? pkg.homepage ?? null;
    const hosting = getHosting({ slug, root, checkedOut, pkg, homepage, verifiedSite });
    const branch = hasGit ? safeGit(["branch", "--show-current"], root) || null : null;
    const dirtyCount = hasGit
      ? safeGit(["status", "--short"], root).split("\n").filter(Boolean).length
      : 0;
    const deploymentStatus = String(meta.status ?? "unknown");
    const workflowStatus = "Use GitHub Actions for current CI status";
    const updatedAt = hasGit ? safeGit(["log", "-1", "--format=%aI"], root) || null : null;
    let state: FleetProject["state"] = "steady";
    if (["orphan", "unverified"].includes(deploymentStatus)) state = "needs-attention";
    else if (meta.lifecycle === "past") state = "past";
    else if (meta.lifecycle === "local-only") state = "local-only";
    else if (deploymentStatus === "undeployed") state = "blocked";
    else if (dirtyCount > 0) state = "local-changes";
    else if (["my-work", "foundry"].includes(meta.attention ?? "")) state = "active";
    const stateLabel = {
      "needs-attention": "Needs attention",
      active: "Active",
      blocked: "Blocked",
      "local-only": "Local-only",
      past: "Past project",
      "local-changes": "Local changes",
      steady: "Steady"
    }[state];

    return {
      slug,
      title: meta.name ?? productTitleBySlug[slug] ?? (pkg.name ? titleize(String(pkg.name).replace(/^@[^/]+\//, "")) : titleize(slug)),
      desc: meta.desc ?? pkg.description ?? "No description recorded yet.",
      tier: meta.tier ?? (slug === "fleet-ops" || slug === "wifi-watch" ? "ops" : "unknown"),
      lane: meta.lifecycle === "past"
        ? "Past projects"
        : meta.attention === "my-work"
          ? "My Work"
          : meta.attention === "foundry"
            ? "Foundry"
            : meta.lifecycle === "local-only"
              ? "Local-only"
              : "Toolbox",
      repoUrl: publicRepoUrl(safeGit(["remote", "get-url", "origin"], root)) ?? null,
      homepage,
      localPath: projectLocalPath(slug),
      localDir,
      checkedOut,
      branch,
      dirtyCount,
      ...hosting,
      deploymentStatus,
      workflowStatus,
      state,
      stateLabel,
      updatedAt
    };
  });
}

export function getFleetNodes(): FleetNode[] {
  const host = "private tailnet node";
  const label = "Primary Fleet machine";
  const operator = "private";
  const openClawStatus = commandExists("openclaw") ? safeExec("openclaw", ["status", "--json"], 5000) : "";
  const openClawTelegram = commandExists("openclaw") ? safeExec("zsh", ["-lc", "openclaw channels list --all 2>/dev/null | sed -n '/Telegram/p'"], 5000) : "";
  const hermesGateway = commandExists("hermes") ? safeExec("hermes", ["gateway", "status"], 5000) : "";
  const hermesStatus = commandExists("hermes") ? safeExec("hermes", ["status"], 5000) : "";
  const tailscaleStatus = commandExists("tailscale")
    ? safeExec(resolve(fleetOpsRoot, "scripts/agent-bin/mobile-control"), ["tailscale-status"], 2500)
    : "";
  const tmateStatus = safeExec(resolve(fleetOpsRoot, "scripts/agent-bin/mobile-control"), ["tmate-status"], 2500);
  const consoleStatus = safeExec("curl", ["-fsS", "--max-time", "2", "http://127.0.0.1:4329/healthz"], 2500);
  const grokStatus = commandExists("grok") ? safeExec("grok", ["models"], 10000) : "";

  const openClawRunning = openClawStatus.includes('"runtimeVersion"') || openClawStatus.includes("Dashboard");
  const hermesRunning = hermesGateway.includes("Gateway is supervised") || hermesGateway.includes("running");
  const openClawTelegramConfigured = /Telegram:\s+installed,\s+configured,\s+enabled/i.test(openClawTelegram);
  const hermesTelegramConfigured = /Telegram\s+✓|Telegram\s+configured/i.test(hermesStatus);
  const tailscaleRunning = Boolean(tailscaleStatus) && !/failed to connect|not running|stopped/i.test(tailscaleStatus);
  const tmateRunning = /^\s*active\b/im.test(tmateStatus);
  const consoleRunning = consoleStatus === "ok";
  const grokReady = commandExists("grok") && !/not authenticated|unauthenticated|login/i.test(grokStatus);
  const devinReady = commandExists("devin") || commandExists("devin-cli");
  const devinAdapter = existsSync(resolve(fleetOpsRoot, "scripts/agent-bin/devin-session.mjs"));

  return [
    {
      id: "primary-mac",
      label,
      role: "Primary Fleet node",
      status: openClawRunning && consoleRunning ? "online" : "needs-setup",
      host,
      operator,
      publicWorkloads: ["Fleet Ops console", "Wi-Fi Watch telemetry"],
      privateAccess: [
        {
          name: "Tailscale SSH",
          status: tailscaleRunning ? "running" : commandExists("tailscale") ? "stopped" : "missing",
          detail: tailscaleRunning
            ? "Tailnet connected; use Tailscale SSH from mobile once ACLs allow it."
            : "Tailscale CLI is installed, but the local service is not connected."
        },
        {
          name: "Emergency terminal fallback",
          status: tmateRunning ? "running" : commandExists("tmate") ? "stopped" : "missing",
          detail: tmateRunning
            ? "A deprecated temporary session is active; credential links remain private."
            : "tmate is disabled by default. Tailscale SSH is the durable mobile path."
        }
      ],
      agents: [
        {
          name: "OpenClaw",
          status: openClawRunning ? "running" : commandExists("openclaw") ? "stopped" : "missing",
          detail: openClawTelegramConfigured
            ? "Gateway running with Telegram configured."
            : "Gateway running; Telegram plugin is installed but still needs bot token and allowlist."
        },
        {
          name: "Hermes",
          status: hermesRunning ? "running" : commandExists("hermes") ? "stopped" : "missing",
          detail: hermesTelegramConfigured
            ? "Optional backup/persistent lane is running with Telegram configured."
            : "Optional lane only; configure Telegram and a model provider when a recurring job needs Hermes."
        },
        {
          name: "Fleet Ops console",
          status: consoleRunning ? "running" : "stopped",
          detail: consoleRunning ? "Local dashboard service is healthy." : "Local dashboard service is down."
        },
        {
          name: "Grok",
          status: grokReady ? "configured" : commandExists("grok") ? "stopped" : "missing",
          detail: grokReady
            ? "Grok CLI is installed and authenticated for teammate review/parallel attempts."
            : commandExists("grok")
              ? "Grok CLI is installed, but authentication is missing."
              : "Grok CLI is not installed on this node."
        },
        {
          name: "Devin",
          status: devinReady ? "configured" : devinAdapter ? "stopped" : "missing",
          detail: devinReady
            ? "Devin CLI is available as an optional explicit-spend teammate."
            : devinAdapter
              ? "Fleet API adapter is installed; service-user credentials and explicit spend approval are still required."
              : "No Devin integration detected; keep it optional and invoke only with explicit spend approval."
        }
      ],
      notes: [
        "This is the only machine currently hosting a public Fleet surface.",
        "Most products are Cloudflare-hosted; project pages show the per-product hosting split.",
        "Secrets and private terminal links are deliberately excluded from the public dashboard."
      ]
    }
  ];
}

export function getMarketingPipeline(): MarketingPipeline {
  const pipelineRoot = resolve(fleetRoot, "foundry/marketing/reel-pipeline");
  const registry = readJsonObject(resolve(fleetOpsRoot, "config/marketing-program.json")) as {
    version?: number;
    projects?: Array<{
      slug: string; name: string; mode: "focus" | "evergreen" | "infrastructure" | "private";
      domain: string | null; publicMarketing: boolean; cadence: string; cta: string;
      contentBase: { adapter?: string; path?: string } | null;
      channels: Array<{ channel: string; accountSlug: string }>;
    }>;
  };
  const rawProof = readJsonObject(resolve(pipelineRoot, "config/brand-video-proof.json")) as {
    generatedAt?: string;
    brand?: string;
    sourceUrl?: string;
    media?: { durationSeconds?: number };
    quality?: { overall?: number; verdict?: string };
  };
  const socialReadiness = readJsonObject(resolve(process.env.HOME ?? "", "Library/Application Support/Fleet Ops/marketing/readiness.json")) as {
    accounts?: Array<{ brand?: string; channel?: string; ready?: boolean }>;
    summary?: { totalAccounts?: number; connectedAccounts?: number; infrastructureReady?: boolean };
  };
  const targetReport = readJsonObject(resolve(pipelineRoot, "tmp/generation-readiness/report.json")) as {
    generatedAt?: string; targetHostReady?: boolean; targetHostNextActions?: unknown[];
  };
  const programs = (registry.projects ?? []).map((program) => ({
    slug: program.slug, name: program.name, mode: program.mode, domain: program.domain,
    publicMarketing: program.publicMarketing, sourceBacked: Boolean(program.contentBase), cadence: program.cadence, cta: program.cta
  }));
  const channelPrograms = (registry.projects ?? []).filter((program) => program.channels.length > 0);
  const brands = channelPrograms.map((program) => {
    const slug = program.slug;
    const channels = program.channels.map((mapping) => mapping.channel);
    const mappedChannels = program.channels.filter((mapping) => Boolean(mapping.accountSlug)).map((mapping) => mapping.channel);
    const connectedChannels = (socialReadiness.accounts ?? [])
      .filter((entry) => entry.brand === slug && entry.ready && entry.channel)
      .map((entry) => String(entry.channel));
    return {
      slug,
      name: program.name,
      domain: program.domain ?? "",
      sourceReady: Boolean(program.contentBase?.path && existsSync(resolve(fleetRoot, program.contentBase.path))),
      sourceDetail: program.contentBase ? `${program.contentBase.adapter} · ${program.contentBase.path}` : "Source adapter not registered",
      channels,
      mappedChannels,
      connectedChannels,
      postingState: connectedChannels.length === channels.length && channels.length > 0 ? "ready" as const : "blocked" as const
    };
  });
  const contentReady = existsSync(resolve(pipelineRoot, "src/content-package.js"))
    && existsSync(resolve(pipelineRoot, "src/content-extractors.js"));
  const videoReady = existsSync(resolve(pipelineRoot, "src/adapters/brand-video.js"))
    && existsSync(resolve(pipelineRoot, "node_modules/playwright"))
    && existsSync(resolve(pipelineRoot, "tools/kokoro"));
  const distributionReady = existsSync(resolve(pipelineRoot, "src/distribution.js"));
  const totalAccounts = Number(socialReadiness.summary?.totalAccounts ?? brands.reduce((sum, brand) => sum + brand.channels.length, 0));
  const connectedAccounts = Number(socialReadiness.summary?.connectedAccounts ?? 0);
  const publisherState = totalAccounts === 0 ? "not-configured" as const : connectedAccounts === totalAccounts ? "ready" as const : "blocked" as const;
  const targetHostState = typeof targetReport.targetHostReady !== "boolean" ? "not-configured" as const : targetReport.targetHostReady ? "ready" as const : "blocked" as const;
  const postizAdapterReady = existsSync(resolve(pipelineRoot, "src/postiz-client.js"));
  const orchestrationState = contentReady && distributionReady && postizAdapterReady
    ? "ready" as const
    : "blocked" as const;

  return {
    updatedAt: targetReport.generatedAt ?? rawProof.generatedAt ?? null,
    proof: rawProof.quality?.overall ? {
      brand: rawProof.brand ?? "unknown",
      score: Number(rawProof.quality.overall),
      verdict: rawProof.quality.verdict ?? "unknown",
      durationSeconds: Number(rawProof.media?.durationSeconds ?? 0),
      sourceUrl: rawProof.sourceUrl ?? ""
    } : null,
    stages: [
      { name: "Product stories", state: contentReady && brands.every((brand) => brand.sourceReady) ? "ready" : "blocked", detail: "Each story stays grounded in its product source." },
      { name: "Creative production", state: videoReady && Boolean(rawProof.quality?.overall) ? "ready" : "blocked", detail: "Fleet turns approved stories into reviewable media." },
      { name: "Postiz review", state: connectedAccounts === totalAccounts && totalAccounts > 0 ? "ready" : "blocked", detail: `${connectedAccounts}/${totalAccounts} Postiz destinations have local configuration evidence.` },
      { name: "Learn", state: "not-configured", detail: "Performance appears here after Postiz has real published results." }
    ],
    programs,
    orchestration: {
      state: orchestrationState,
      detail: orchestrationState === "ready"
        ? "Source packages, render receipts, and the draft-only Postiz adapter are present."
        : "One or more Fleet generation or Postiz handoff components are missing.",
      lastAt: null
    },
    targetHost: {
      state: targetHostState,
      detail: targetHostState === "ready" ? "Reel Pipeline reports current target-host readiness." : targetHostState === "blocked"
        ? `${targetReport.targetHostNextActions?.length ?? 0} target-host acceptance action(s) remain.` : "No target-host readiness report is available.",
      checkedAt: targetReport.generatedAt ?? null
    },
    publisher: {
      state: publisherState,
      detail: `${connectedAccounts}/${totalAccounts} Postiz destinations have local key and mapping evidence; live verification remains a target-host proof.`,
      connected: connectedAccounts,
      total: totalAccounts
    },
    lastReceipt: null,
    brands
  };
}

export function getLearningSummary(): LearningSummary {
  const catalog = readJsonObject(resolve(fleetRoot, "swe-interview-prep/src/data/learning-sources.json")) as {
    generatedAt?: string;
    sources?: Array<{ syncStatus?: string }>;
  };
  const control = readJsonObject(resolve(
    process.env.HOME ?? "",
    "Library/Application Support/Fleet Ops/learning-sync/control-state.json"
  )) as { sessions?: Array<{ status?: string }> };
  const sources = Array.isArray(catalog.sources) ? catalog.sources : [];
  const sessions = Array.isArray(control.sessions) ? control.sessions : [];
  const countSources = (status: string) => sources.filter((source) => source.syncStatus === status).length;
  return {
    url: "https://learn.significanthobbies.com/sources",
    generatedAt: catalog.generatedAt ?? null,
    sourceCount: sources.length,
    freshCount: countSources("fresh"),
    staleCount: countSources("stale"),
    pendingCount: countSources("pending"),
    activeSessionCount: sessions.filter((session) => session.status === "started").length,
    completedSessionCount: sessions.filter((session) => session.status === "completed").length
  };
}
