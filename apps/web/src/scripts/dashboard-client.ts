import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import EvidenceTable, { type EvidenceColumn } from "../components/EvidenceTable";
import { numericEvidence } from "../lib/evidence-table.mjs";
import { evidenceStateLabel, refreshAttemptLabel } from "../lib/evidence-labels.mjs";
import { downloadLocalUsageBundle, startLocalUsageTracking } from "../lib/local-usage.mjs";
import { dashboardApi } from "../lib/dashboard-api.mjs";
import { createOutcomeScope } from "../lib/cohort-scope.mjs";
import { bindProjectDisclosureCount, updateProjectResultCount } from "../lib/project-disclosure.mjs";
import {
  inactiveProjectState,
  isCurrentProject,
  matchesProjectFilters,
  partitionProjects,
  projectSharingLabel,
} from "../lib/project-directory.mjs";

type JsonRecord = Record<string, any>;

const base = document.querySelector<HTMLMetaElement>('meta[name="dashboard-api-base"]')?.content ?? "/api/dashboard";
const connection = document.querySelector<HTMLElement>("[data-dashboard-connection]");
const connectionLabel = document.querySelector<HTMLElement>("[data-dashboard-connection-label]");
const date = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});
const shortDate = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Record<string, string> = {},
  children: Array<Node | string | null | undefined> = [],
) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes)) {
    if (key === "class") node.className = value;
    else node.setAttribute(key, value);
  }
  for (const child of children) {
    if (child === null || child === undefined) continue;
    node.append(child instanceof Node ? child : document.createTextNode(child));
  }
  return node;
}

function formatted(value?: string | null) {
  return value && Number.isFinite(Date.parse(value)) ? date.format(new Date(value)) : "Not measured";
}

function age(value?: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return "No observation";
  const days = Math.max(0, Math.floor((Date.now() - Date.parse(value)) / 86_400_000));
  if (days === 0) return "Observed today";
  return `${days}d old`;
}

function reportingPeriod(period?: JsonRecord | null) {
  const start = period?.start;
  const end = period?.end;
  if (!start || !end || !Number.isFinite(Date.parse(start)) || !Number.isFinite(Date.parse(end))) {
    return "Reporting period unavailable";
  }
  const inclusiveDays = Math.max(1, Math.floor((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1);
  return `${shortDate.format(new Date(start))} – ${shortDate.format(new Date(end))} · ${inclusiveDays} days`;
}

function safeSearchConsoleUrl(value?: string | null) {
  try {
    const url = new URL(value ?? "");
    return url.protocol === "https:" && url.hostname === "search.google.com" ? url.href : null;
  } catch {
    return null;
  }
}

function state(value?: string | null) {
  const label = value || "not-measured";
  return element("span", { class: `state ${label}` }, [label.replaceAll("-", " ")]);
}

function lifecycleLabel(lifecycle: unknown): string {
  if (lifecycle && typeof lifecycle === "object" && "status" in lifecycle) {
    return (lifecycle as { status: string }).status;
  }
  return typeof lifecycle === "string" ? lifecycle : "unknown";
}

// A dash reads as "nothing here" for both an unmeasured surface and a measured zero. Naming the
// absence keeps the two apart on every page that renders a signal.
function value(signal?: JsonRecord | null, suffix = "") {
  return signalValue(signal, suffix);
}

const scopedView = ["domains", "search", "ai-awareness", "performance"].includes(document.body.dataset.dashboardView ?? "");
const includeInactive = new URLSearchParams(window.location.search).get("scope") === "all";
const scopeOutcome = createOutcomeScope(
  () => dashboardApi(base, "/v1/projects"),
  (message: string) => {
    const label = document.querySelector<HTMLElement>("[data-cohort-count]");
    if (label) label.textContent = message;
  },
);
async function api(path: string, options?: RequestInit) {
  const payload = await dashboardApi(base, path, options);
  if (scopedView && path.startsWith("/v1/outcomes/") && Array.isArray(payload.rows)) {
    return scopeOutcome(payload, includeInactive);
  }
  return payload;
}
const cohortSelect = document.querySelector<HTMLSelectElement>("[data-cohort-select]");
if (cohortSelect) {
  cohortSelect.value = includeInactive ? "all" : "active";
  cohortSelect.addEventListener("change", () => {
    const url = new URL(window.location.href);
    url.searchParams.set("scope", cohortSelect.value);
    window.location.assign(url);
  });
}

async function optionalOutcome(path: string) {
  try {
    return await api(path);
  } catch {
    return { generatedAt: null, rows: [], unavailable: true };
  }
}

async function optionalCapabilities() {
  try {
    return await api("/v1/capabilities");
  } catch {
    return {
      skills: [],
      sources: {
        skills: {
          state: "unavailable",
          reason: "The skill catalog is unavailable; project inventory remains available.",
        },
      },
      unavailable: true,
    };
  }
}

function empty(message: string) {
  return element("div", { class: "empty-state" }, [
    element("strong", {}, [message]),
    element("span", {}, ["The view will update when its provider returns evidence."]),
  ]);
}

const evidenceRoots = new WeakMap<HTMLElement, Root>();

function replace(slot: string, content: Node) {
  const target = document.querySelector<HTMLElement>(`[data-dashboard-slot="${slot}"]`);
  if (!target) return;
  target.className = "";
  target.removeAttribute("aria-busy");
  evidenceRoots.get(target)?.unmount();
  evidenceRoots.delete(target);
  target.replaceChildren(content);
}

function projectHref(id: string) {
  return `/projects/${id === "fleet-workspace" ? "dashboard" : id}`;
}

function catalogProjectId(id?: string) {
  return id === "dashboard" ? "fleet-workspace" : id;
}

const attentionStates = new Set([
  "failed",
  "needs-work",
  "stale",
  "zero-impressions",
  "failing",
  "unreachable",
  "absent",
]);

function signalValue(signal?: JsonRecord | null, suffix = "") {
  const numeric = numericEvidence(signal?.value);
  return numeric !== null
    ? `${numeric.toLocaleString("en", { maximumFractionDigits: 1 })}${suffix}`
    : "Not measured";
}

function signalTime(...signals: Array<JsonRecord | null | undefined>) {
  return signals.find((signal) => signal?.observedAt)?.observedAt ?? null;
}

function latestTime(...timestamps: Array<string | null | undefined>) {
  return timestamps
    .filter((timestamp): timestamp is string => Boolean(timestamp) && Number.isFinite(Date.parse(timestamp)))
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0] ?? null;
}

function sourceStatus(payload: JsonRecord, status?: string | null) {
  return payload?.unavailable ? "unavailable" : status ?? "not-measured";
}

function sourceValue(payload: JsonRecord, measured: string) {
  return payload?.unavailable ? "Provider unavailable" : measured;
}

function clarityValue(value: unknown, suffix = "") {
  if (value === null || value === undefined || value === "") return "Not measured";
  const numeric = Number(value);
  return Number.isFinite(numeric)
    ? `${numeric.toLocaleString("en", { maximumFractionDigits: 2 })}${suffix}`
    : "Not measured";
}

function clarityProviderState(value: unknown) {
  if (value === "provider-verified") return "Verified by reread";
  if (value === "provider-audited") return "Fully accounted";
  if (value === "partially-verified") return "Partially verified";
  if (value === "not-applicable") return "Not applicable";
  return "Unverified";
}

function projectOutcomes(projectId: string, payloads: JsonRecord) {
  return {
    domains: payloads.domains?.rows?.find((row: JsonRecord) =>
      row.projects?.some((item: JsonRecord) => item.projectId === projectId)),
    search: payloads.search?.rows?.find((row: JsonRecord) => row.projectId === projectId),
    awareness: payloads.awareness?.rows?.find((row: JsonRecord) => row.projectId === projectId),
    performance: payloads.performance?.rows?.find((row: JsonRecord) => row.projectId === projectId),
  };
}

function projectEvidence(projectId: string, payloads: JsonRecord) {
  const outcomes = projectOutcomes(projectId, payloads);
  return [
    {
      id: "domains",
      label: "DRANK",
      status: sourceStatus(payloads.domains, outcomes.domains?.status),
      value: sourceValue(payloads.domains, signalValue(outcomes.domains?.signal)),
      observedAt: signalTime(outcomes.domains?.signal),
    },
    {
      id: "performance",
      label: "Performance",
      status: sourceStatus(payloads.performance, outcomes.performance?.status),
      value: sourceValue(payloads.performance, Number.isFinite(Number(outcomes.performance?.psi?.value))
        ? `PSI ${outcomes.performance.psi.value}`
        : "Not measured"),
      observedAt: signalTime(outcomes.performance?.psi, outcomes.performance?.lcp),
    },
    {
      id: "search",
      label: "Search",
      status: sourceStatus(payloads.search, outcomes.search?.status),
      value: sourceValue(payloads.search, Number.isFinite(Number(outcomes.search?.impressions?.value))
        ? `${outcomes.search.impressions.value} ${Number(outcomes.search.impressions.value) === 1 ? "impression" : "impressions"}`
        : "Not measured"),
      observedAt: signalTime(outcomes.search?.impressions, outcomes.search?.clicks),
    },
    {
      id: "awareness",
      label: "AI awareness",
      status: sourceStatus(payloads.awareness, outcomes.awareness?.status),
      value: sourceValue(payloads.awareness, Number.isFinite(Number(outcomes.awareness?.recommendation?.value))
        ? `${outcomes.awareness.recommendation.value}% recommended`
        : "Not measured"),
      observedAt: signalTime(outcomes.awareness?.recommendation, outcomes.awareness?.mention),
    },
  ];
}

function evidenceCell(item: JsonRecord) {
  return element("div", { class: "evidence-cell" }, [
    element("span", { class: "evidence-cell__label" }, [item.label]),
    element("strong", {}, [item.value]),
    element("div", { class: "evidence-cell__meta" }, [
      state(item.status),
      element("small", { title: formatted(item.observedAt) }, [item.status === "unavailable" ? "Provider unavailable" : age(item.observedAt)]),
    ]),
  ]);
}

function metricGrid(items: Array<{ label: string; value: string; detail?: string }>) {
  return element("dl", { class: "outcome-metric-grid" }, items.map((item) =>
    element("div", { class: `outcome-metric${/^(?:[$~≥+-]?\d|—$)/.test(item.value) ? "" : " outcome-metric--text"}` }, [
      element("dt", {}, [item.label]),
      element("dd", {}, [item.value]),
      item.detail ? element("small", {}, [item.detail]) : null,
    ])));
}

function searchTrend(signal?: JsonRecord | null) {
  const series = (signal?.series ?? [])
    .filter((point: JsonRecord) => Number.isFinite(Number(point?.value)) && Number.isFinite(Date.parse(point?.observedAt)))
    .slice(-30);
  const figure = element("figure", { class: "search-trend" }, [
    element("div", { class: "search-trend__head" }, [
      element("strong", {}, ["Daily impressions"]),
      element("span", {}, [`${series.length} Google days`]),
    ]),
  ]);
  if (series.length < 2) {
    figure.append(element("div", { class: "search-trend__empty" }, ["Daily graph pending the next Google collection; aggregate snapshots are not graphed as traffic."]));
    return figure;
  }

  const width = 320;
  const height = 84;
  const padding = 8;
  const values = series.map((point: JsonRecord) => Number(point.value));
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = maximum - minimum || 1;
  const points = series.map((point: JsonRecord, index: number) => {
    const x = padding + (index / (series.length - 1)) * (width - padding * 2);
    const y = height - padding - ((Number(point.value) - minimum) / range) * (height - padding * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const svg = document.createElementNS(SVG_NAMESPACE, "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `Search impressions changed from ${values[0]} to ${values.at(-1)} across ${series.length} collected snapshots.`);
  const baseline = document.createElementNS(SVG_NAMESPACE, "line");
  baseline.setAttribute("x1", String(padding));
  baseline.setAttribute("x2", String(width - padding));
  baseline.setAttribute("y1", String(height - padding));
  baseline.setAttribute("y2", String(height - padding));
  baseline.setAttribute("class", "search-trend__baseline");
  const line = document.createElementNS(SVG_NAMESPACE, "polyline");
  line.setAttribute("points", points);
  line.setAttribute("class", "search-trend__line");
  svg.append(baseline, line);
  figure.append(
    svg,
    element("figcaption", {}, [
      element("span", {}, [shortDate.format(new Date(series[0].observedAt))]),
      element("span", {}, [`${values[0].toLocaleString("en")} → ${values.at(-1)?.toLocaleString("en")}`]),
      element("span", {}, [shortDate.format(new Date(series.at(-1).observedAt))]),
    ]),
  );
  return figure;
}

function searchKeywordVisibility(row: JsonRecord) {
  const terms: JsonRecord[] = row.searchTerms ?? [];
  const sample = row.searchTermSample;
  const sampleNote = sample
    ? `${sample.retainedRows} retained from ${sample.returnedRows} returned query/page rows. ${sample.rowLimitReached ? "Provider row limit reached. " : ""}Selected by clicks and impressions; Google omits some queries.`
    : "Sample coverage unavailable for this collection; Google omits some queries.";
  const number = (entry: unknown, suffix = "") => Number.isFinite(Number(entry))
    ? `${Number(entry).toLocaleString("en", { maximumFractionDigits: 1 })}${suffix}` : "Unavailable";
  const landing = (term: JsonRecord) => {
    try {
      const url = new URL(term.landingPage);
      if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
      return element("a", { href: url.href, target: "_blank", rel: "noreferrer" }, [url.pathname + url.search]);
    } catch { return null; }
  };
  return element("details", { class: "search-keywords" }, [
    element("summary", {}, [`Keyword visibility · ${terms.length} query/page rows`]),
    element("p", { class: "measurement-boundary-note" }, [sampleNote]),
    terms.length
      ? element("div", { class: "search-keywords__scroll", tabindex: "0", "aria-label": "Search keywords and landing pages" }, [
          element("table", {}, [
            element("caption", { class: "sr-only" }, ["Observed Google queries and their landing pages"]),
            element("thead", {}, [element("tr", {}, ["Keyword / page", "Impressions", "Clicks", "CTR", "Position"].map((label) => element("th", { scope: "col" }, [label])))]),
            element("tbody", {}, terms.map((term) => element("tr", {}, [
              element("th", { scope: "row" }, [element("strong", {}, [term.query]), landing(term) ?? element("small", {}, ["Landing page unavailable"])]),
              element("td", {}, [number(term.impressions)]),
              element("td", {}, [number(term.clicks)]),
              element("td", {}, [number(term.ctr, "%")]),
              element("td", {}, [number(term.position)]),
            ]))),
          ]),
        ])
      : element("p", { class: "measurement-boundary-note" }, ["No query/page rows were retained. This does not establish that the site has no keyword visibility."]),
  ]);
}

function searchIndexStatus(row: JsonRecord) {
  const inspection = row.indexInspection;
  return element("p", { class: "search-index-status" }, [
    inspection
      ? `Root index: ${String(inspection.state).replaceAll("-", " ")} · ${inspection.coverageState ?? inspection.failureReason ?? "Coverage detail unavailable"}${inspection.lastCrawlTime ? ` · last crawled ${formatted(inspection.lastCrawlTime)}` : ""}`
      : "Root index: not inspected",
  ]);
}

function searchResult(row: JsonRecord) {
  const providerUrl = safeSearchConsoleUrl(row.providerUrl);
  const previous = new Map((row.previousPeriod?.metrics ?? []).map((metric: JsonRecord) => [metric.label, Number(metric.value)]));
  const comparison = (label: string, current?: JsonRecord | null) => {
    const before = previous.get(label);
    const after = Number(current?.value);
    if (!Number.isFinite(before) || !Number.isFinite(after)) return "Previous period unavailable";
    const delta = after - before;
    const sign = delta > 0 ? "+" : "";
    return `Previous ${before.toLocaleString("en", { maximumFractionDigits: 1 })} · ${sign}${delta.toLocaleString("en", { maximumFractionDigits: 1 })}`;
  };
  return element("article", { class: "search-result" }, [
    element("header", { class: "search-result__head" }, [
      element("div", {}, [
        element("span", {}, [row.domain ?? "Google Search property"]),
        element("h2", {}, [row.name ?? row.projectName ?? row.projectId]),
        element("small", {}, [`Google reporting window: ${reportingPeriod(row.period)}`]),
      ]),
      state(row.status),
    ]),
    element("div", { class: "search-result__summary" }, [
      metricGrid([
        { label: "Impressions", value: value(row.impressions), detail: comparison("Search impressions", row.impressions) },
        { label: "Clicks", value: value(row.clicks), detail: comparison("Search clicks", row.clicks) },
        { label: "CTR", value: value(row.ctr, "%"), detail: comparison("Search CTR", row.ctr) },
        { label: "Position", value: value(row.averagePosition), detail: comparison("Search average position", row.averagePosition) },
      ]),
    ]),
    element("details", { class: "search-result__details" }, [
      element("summary", {}, ["Trend, indexing and keyword evidence"]),
      searchTrend(row.impressions),
      searchIndexStatus(row),
      searchKeywordVisibility(row),
    ]),
    element("footer", {}, [
      element("span", {}, [`Collected ${formatted(row.observedAt)}`]),
      providerUrl
        ? element("a", { href: providerUrl, target: "_blank", rel: "noreferrer" }, ["Open this property ↗"])
        : element("span", { class: "unavailable" }, ["Console link unavailable"]),
    ]),
  ]);
}

// "0 of 12" is a measured zero and reads differently from an unmeasured surface, so the count
// renderer only falls back to the absence label when the count itself is missing.
function countOf(count: unknown, total: unknown, absence = "Not measured") {
  return numericEvidence(count) !== null && numericEvidence(total) !== null
    ? `${Number(count)} of ${Number(total)}`
    : absence;
}

const GEO_CLASS_NOTES: Record<string, string> = {
  A: "own domain in the top three organic results",
  B: "partial page-one visibility",
  C: "absent from page one",
};

function geoQueryLedger(row: JsonRecord) {
  const observations = row.observations ?? [];
  if (!observations.length) {
    return element("p", { class: "outcome-panel__note" }, [
      row.status === "not-configured"
        ? "No GEO panel is configured for this product, so no query has ever been asked."
        : "A GEO panel is configured but no observation has been recorded yet.",
    ]);
  }
  return element("ul", { class: "geo-query-ledger" }, observations.map((item: JsonRecord) => {
    const moved = item.previousClass && item.previousClass !== item.class;
    return element("li", { class: `geo-query geo-query--${String(item.class).toLowerCase()}` }, [
      element("span", { class: "geo-query__class", title: GEO_CLASS_NOTES[item.class] ?? "" }, [item.class]),
      element("div", {}, [
        element("strong", {}, [item.query ?? item.qid]),
        element("small", {}, [
          [item.kind, moved ? `${item.previousClass} → ${item.class}` : item.previousClass ? "unchanged" : "first observation"]
            .filter(Boolean)
            .join(" · "),
        ]),
      ]),
    ]);
  }));
}

function geoResult(row: JsonRecord) {
  return element("div", { class: "geo-result" }, [
    metricGrid([
      { label: "Top three (A)", value: countOf(row.classes?.A, row.queries), detail: GEO_CLASS_NOTES.A },
      {
        label: "Page one (A+B)",
        value: countOf(
          numericEvidence(row.classes?.A) !== null && numericEvidence(row.classes?.B) !== null ? row.classes.A + row.classes.B : null,
          row.queries,
        ),
        detail: GEO_CLASS_NOTES.B,
      },
      { label: "Absent (C)", value: countOf(row.classes?.C, row.queries), detail: GEO_CLASS_NOTES.C },
      {
        label: "Top-three rate",
        value: value(row.topThree, "%"),
        detail: row.runCount > 1 ? `${row.runCount} runs of history` : "Baseline run only",
      },
    ]),
    geoQueryLedger(row),
  ]);
}

function seoCheckList(label: string, checks: string[]) {
  if (!checks.length) return null;
  return element("div", { class: "seo-check-list" }, [
    element("span", {}, [label]),
    element("code", {}, [checks.join(", ")]),
  ]);
}

function seoAuditResult(row: JsonRecord) {
  return element("div", { class: "seo-result" }, [
    metricGrid([
      { label: "Passed", value: value(row.pass), detail: countOf(row.pass?.value, row.checks, "No audit") },
      { label: "Failed", value: value(row.fail), detail: row.failedChecks?.length ? "Blocking" : "None blocking" },
      { label: "Warnings", value: value(row.warn), detail: row.warningChecks?.length ? "Non-blocking" : "None" },
      {
        label: "Reachable",
        value: row.reachable === null || row.reachable === undefined
          ? "Not audited"
          : row.reachable ? "Yes" : "No",
        detail: row.url ?? "No audited URL",
      },
    ]),
    seoCheckList("Failed", row.failedChecks ?? []),
    seoCheckList("Warned", row.warningChecks ?? []),
  ]);
}

function evidenceTable(slot: string, rows: JsonRecord[], label: string, columns: EvidenceColumn[], detail: (row: JsonRecord) => Node) {
  const target = document.querySelector<HTMLElement>(`[data-dashboard-slot="${slot}"]`);
  if (!target) return;
  target.className = "";
  target.removeAttribute("aria-busy");
  let root = evidenceRoots.get(target);
  if (!root) {
    target.replaceChildren();
    root = createRoot(target);
    evidenceRoots.set(target, root);
  }
  root.render(createElement(EvidenceTable, { rows, label, columns, detail, projectHref, formatted }));
}

function signalColumn(id: string, label: string, suffix = ""): EvidenceColumn {
  return { id, label, value: row => numericEvidence(row[id]?.value), display: row => value(row[id], suffix) };
}

async function renderProjects() {
  const [projects, domains, search, awareness, performance, capabilities] = await Promise.all([
    api("/v1/projects"),
    optionalOutcome("/v1/outcomes/domains"),
    optionalOutcome("/v1/outcomes/search"),
    optionalOutcome("/v1/outcomes/ai-awareness"),
    optionalOutcome("/v1/outcomes/performance"),
    optionalCapabilities(),
  ]);
  const payloads = { domains, search, awareness, performance };
  const { current, inactive } = partitionProjects(projects);
  const evidenceByProject = new Map(current.map((project: JsonRecord) => [
    project.id,
    projectEvidence(project.id, payloads),
  ]));
  const measured = current.filter((project: JsonRecord) =>
    evidenceByProject.get(project.id)?.some((item: JsonRecord) => item.observedAt)).length;
  const needsAttention = current.filter((project: JsonRecord) =>
    evidenceByProject.get(project.id)?.some((item: JsonRecord) => attentionStates.has(item.status))).length;
  const observedSignals = [...evidenceByProject.values()].flat()
    .filter((item: JsonRecord) => item.observedAt).length;
  const timestamp = document.querySelector<HTMLElement>("[data-project-status-time]");
  if (timestamp) timestamp.textContent = `Latest cached evidence ${formatted(latestTime(
    domains.generatedAt,
    performance.generatedAt,
    search.generatedAt,
    awareness.generatedAt,
  ))}`;
  replace("project-summary", element("dl", { class: "portfolio-summary__grid" }, [
    element("div", {}, [element("dt", {}, ["Current products"]), element("dd", {}, [String(current.length)]), element("small", {}, ["Primary and active lifecycle"])]),
    element("div", {}, [element("dt", {}, ["With evidence"]), element("dd", {}, [`${measured} / ${current.length}`]), element("small", {}, [`${observedSignals} source observations`])]),
    element("div", {}, [element("dt", {}, ["Needs attention"]), element("dd", {}, [String(needsAttention)]), element("small", {}, ["Measured regression or zero search"])]),
    element("div", {}, [
      element("dt", {}, ["Capabilities"]),
      element("dd", {}, [String(capabilities.skills?.length ?? 0)]),
      element("small", {}, [`Fleet skills ${capabilities.sources?.skills?.state ?? "unavailable"}`]),
    ]),
  ]));
  const currentDirectory = element("div", { class: "project-directory" }, current.map((project: JsonRecord) =>
    element("article", {
      class: "project-directory__row project-health-row",
      "data-project-id": project.id,
      "data-project-section": "current",
      "data-project-name": `${project.name} ${project.domains?.join(" ") ?? ""}`.toLowerCase(),
      "data-project-priority-value": project.priority ?? "",
      "data-project-health-value": evidenceByProject.get(project.id)?.some((item: JsonRecord) => attentionStates.has(item.status))
        ? "attention"
        : evidenceByProject.get(project.id)?.some((item: JsonRecord) => item.observedAt)
          ? "measured"
          : "missing",
    }, [
      element("div", { class: "project-directory__identity" }, [
        element("div", { class: "project-directory__kicker" }, [
          element("span", {}, [project.priority ?? "Unranked"]),
          state(project.status ?? lifecycleLabel(project.lifecycle)),
          element("span", {}, [projectSharingLabel(project)]),
        ]),
        element("h3", {}, [project.name]),
        element("p", {}, [project.description ?? project.domains?.[0] ?? "Private project"]),
        element("small", { class: "project-directory__domain" }, [project.domains?.[0] ?? "No public domain"]),
      ]),
      element("div", { class: "evidence-matrix", "aria-label": `${project.name} site evidence` },
        evidenceByProject.get(project.id)?.map(evidenceCell) ?? []),
      element("a", {
        class: "project-row-action",
        href: projectHref(project.id),
        "aria-label": `View ${project.name} details`,
        "data-usage-event": "navigation",
      }, ["View"]),
    ])));
  const currentSection = element("section", {
    class: "project-directory-section",
    "aria-labelledby": "current-projects-title",
    "data-current-projects": "",
  }, [
    element("div", { class: "directory-section-head" }, [
      element("div", {}, [
        element("h2", { id: "current-projects-title" }, ["Current products"]),
        element("p", {}, ["Primary and active identities, independent of priority and shareability."]),
      ]),
      element("span", {}, [`${current.length} products`]),
    ]),
    element("div", { class: "project-directory__header", "aria-hidden": "true" }, [
      element("span", {}, ["Product"]),
      element("span", {}, ["Site evidence"]),
      element("span"),
    ]),
    currentDirectory,
  ]);
  const inactiveDetails = element("details", {
    class: "inactive-projects",
    "data-inactive-projects": "",
  }, [
    element("summary", {}, [
      element("span", { class: "inactive-projects__toggle", "aria-hidden": "true" }),
      element("span", { class: "inactive-projects__title" }, [
        element("strong", {}, ["Inactive and retained"]),
        element("small", {}, ["Archived, parked, outside-Fleet, and resource-only identities"]),
      ]),
      element("span", { class: "inactive-projects__count", "data-inactive-visible-count": "" }, [`${inactive.length} identities`]),
    ]),
    element("p", { class: "inactive-projects__intro" }, [
      "Kept for history and ownership. These identities do not affect current portfolio counts or refresh scope.",
    ]),
    element("div", { class: "project-directory inactive-project-directory" }, inactive.map((project: JsonRecord) =>
      element("article", {
        class: "project-directory__row project-health-row inactive-project-row",
        "data-project-id": project.id,
        "data-project-section": "inactive",
        "data-project-name": `${project.name} ${project.domains?.join(" ") ?? ""}`.toLowerCase(),
        "data-project-priority-value": project.priority ?? "",
        "data-project-health-value": "inactive",
      }, [
        element("div", { class: "project-directory__identity" }, [
          element("div", { class: "project-directory__kicker" }, [
            element("span", {}, [project.identityKind === "repository" ? "Repository" : project.priority ?? "Unranked"]),
            state(project.identityKind === "repository" ? project.futureForm ?? "retained" : inactiveProjectState(project)),
            element("span", {}, [projectSharingLabel(project)]),
          ]),
          element("h3", {}, [project.name]),
          element("p", {}, [project.description ?? "Historical Fleet identity retained in the canonical catalog."]),
          element("small", { class: "project-directory__domain" }, [project.identityKind === "repository" ? project.repository : project.domains?.[0] ?? "No public domain"]),
        ]),
        project.identityKind === "repository"
          ? element("a", { class: "project-row-action", href: project.repositoryUrl, rel: "noreferrer", "aria-label": `Open ${project.name} on GitHub` }, ["GitHub"])
          : element("a", { class: "project-row-action", href: projectHref(project.id), "aria-label": `View retained identity ${project.name}` }, ["View"]),
      ]))),
  ]);
  const directory = element("div", { class: "project-directory-groups" }, [currentSection, inactiveDetails]);
  directory.append(element("div", {
    class: "directory-filter-empty",
    "data-project-filter-empty": "",
    role: "status",
    "aria-live": "polite",
    hidden: "",
  }, [
    element("strong", {}, ["No projects match these filters."]),
    element("span", {}, ["Clear the search or choose broader project filters."]),
  ]));
  replace("project-statuses", directory);
  bindProjectFilters(projects);
}

function bindProjectFilters(projects: JsonRecord[]) {
  const searchInput = document.querySelector<HTMLInputElement>("[data-project-search]");
  const priority = document.querySelector<HTMLSelectElement>("[data-project-priority]");
  const health = document.querySelector<HTMLSelectElement>("[data-project-health]");
  const sharing = document.querySelector<HTMLSelectElement>("[data-project-sharing]");
  const lifecycle = document.querySelector<HTMLSelectElement>("[data-project-lifecycle]");
  const resume = document.querySelector<HTMLSelectElement>("[data-project-resume]");
  const reset = document.querySelector<HTMLButtonElement>("[data-project-filter-reset]");
  bindProjectDisclosureCount(document);
  const projectById = new Map(projects.map((project) => [project.id, project]));
  const apply = () => {
    const query = searchInput?.value.trim().toLowerCase() ?? "";
    let currentCount = 0;
    let inactiveCount = 0;
    document.querySelectorAll<HTMLElement>(".project-health-row").forEach((row) => {
      const project = projectById.get(row.dataset.projectId);
      const matches = project ? matchesProjectFilters({
        ...project,
        health: row.dataset.projectHealthValue,
      }, {
        query,
        priority: priority?.value ?? "",
        health: health?.value ?? "",
        sharing: sharing?.value ?? "",
        lifecycle: lifecycle?.value ?? "",
        resume: resume?.value ?? "",
      }) : false;
      row.hidden = !matches;
      if (matches && row.dataset.projectSection === "current") currentCount += 1;
      if (matches && row.dataset.projectSection === "inactive") inactiveCount += 1;
    });
    const currentSection = document.querySelector<HTMLElement>("[data-current-projects]");
    const inactiveDetails = document.querySelector<HTMLDetailsElement>("[data-inactive-projects]");
    const inactiveCountLabel = document.querySelector<HTMLElement>("[data-inactive-visible-count]");
    const revealInactive = Boolean(
      query || health?.value === "inactive" || priority?.value === "P4" || sharing?.value || lifecycle?.value === "inactive" || resume?.value,
    );
    if (currentSection) currentSection.hidden = currentCount === 0;
    if (inactiveDetails) {
      inactiveDetails.hidden = inactiveCount === 0;
      if (revealInactive && inactiveDetails.dataset.filterDisclosureActive !== "true") {
        inactiveDetails.dataset.filterDisclosureActive = "true";
        inactiveDetails.dataset.wasOpen = String(inactiveDetails.open);
      }
      if (revealInactive) inactiveDetails.open = inactiveCount > 0;
      if (!revealInactive && inactiveDetails.dataset.filterDisclosureActive === "true") {
        inactiveDetails.open = inactiveDetails.dataset.wasOpen === "true";
        delete inactiveDetails.dataset.filterDisclosureActive;
        delete inactiveDetails.dataset.wasOpen;
      }
    }
    if (inactiveCountLabel) inactiveCountLabel.textContent = `${inactiveCount} ${inactiveCount === 1 ? "identity" : "identities"}`;
    const count = currentCount + inactiveCount;
    const emptyResult = document.querySelector<HTMLElement>("[data-project-filter-empty]");
    if (emptyResult) emptyResult.hidden = count !== 0;
    updateProjectResultCount(document);
    const activeFilters = [priority, health, sharing, lifecycle, resume].filter((control) => control?.value).length + (searchInput?.value.trim() ? 1 : 0);
    const filterCount = document.querySelector<HTMLElement>("[data-project-filter-count]");
    if (filterCount) filterCount.textContent = activeFilters ? `· ${activeFilters} active` : "";
  };
  if (searchInput && searchInput.dataset.projectFilterBound !== "true") {
    searchInput.dataset.projectFilterBound = "true";
    searchInput.addEventListener("input", apply);
    priority?.addEventListener("change", apply);
    health?.addEventListener("change", apply);
    sharing?.addEventListener("change", apply);
    lifecycle?.addEventListener("change", apply);
    resume?.addEventListener("change", apply);
    reset?.addEventListener("click", () => {
      searchInput.value = "";
      if (priority) priority.value = "";
      if (health) health.value = "";
      if (sharing) sharing.value = "";
      if (lifecycle) lifecycle.value = "";
      if (resume) resume.value = "";
      apply();
      searchInput.focus();
    });
  }
  apply();
}


async function renderDomains() {
  const payload = await api("/v1/outcomes/domains");
  evidenceTable("domains", payload.rows, "Domain evidence", [
    signalColumn("signal", "DRANK"),
    { id: "projects", label: "Projects", value: row => row.projects?.length ?? 0, display: row => String(row.projects?.length ?? 0) },
  ], row => element("div", {}, [
    metricGrid([{ label: "DRANK", value: value(row.signal), detail: row.signal?.history ?? "No recorded history" }]),
    element("div", { class: "evidence-project-links" }, (row.projects ?? []).map((project: JsonRecord) => element("a", { href: projectHref(project.id) }, [project.name ?? project.id]))),
  ]));
  updateOutcomeTime(payload);
  updateCoverage("domains", payload, ["not-collected", "not-measured", "unknown"]);
}

// Coverage is the number the whole task exists to make visible: how many surfaces carry a
// measurement versus how many were never collected. It is stated per section rather than left
// to be inferred from a list of rows.
function updateCoverage(slot: string, payload: JsonRecord, missingStates: string[]) {
  const count = document.querySelector<HTMLElement>(`[data-dashboard-count="${slot}"]`);
  const note = document.querySelector<HTMLElement>(`[data-dashboard-coverage="${slot}"]`);
  if (payload.unavailable) {
    if (count) count.textContent = "—";
    if (note) note.textContent = "Collector unavailable";
    return;
  }
  const rows = payload.rows ?? [];
  const missing = rows.filter((row: JsonRecord) => missingStates.includes(String(row.status)));
  if (count) count.textContent = String(rows.length - missing.length);
  if (note) {
    note.textContent = missing.length
      ? `${rows.length - missing.length} of ${rows.length} measured · ${missing.length} not collected`
      : `${rows.length} of ${rows.length} measured`;
  }
}

async function renderSearch() {
  const [payload, audit] = await Promise.all([
    api("/v1/outcomes/search"),
    optionalOutcome("/v1/outcomes/seo-audit"),
  ]);
  const period = payload.rows.find((row: JsonRecord) => row.period)?.period;
  const periodTarget = document.querySelector<HTMLElement>("[data-search-period]");
  if (periodTarget) periodTarget.textContent = `Google data: ${reportingPeriod(period)}`;
  const scopeNote = document.querySelector<HTMLElement>("[data-search-scope-note]");
  const rows = payload.rows;
  if (scopeNote) scopeNote.textContent = `${rows.length} properties · ${rows.filter((row: JsonRecord) => row.observedAt).length} measured`;
  evidenceTable("search", rows, "Google Search evidence", [signalColumn("clicks", "Clicks"), signalColumn("impressions", "Impressions"), signalColumn("ctr", "CTR", "%"), signalColumn("averagePosition", "Position")], searchResult);
  if (audit.unavailable) replace("seo-audit", empty("On-page SEO audit unavailable"));
  else evidenceTable("seo-audit", audit.rows, "On-page SEO audit", [signalColumn("pass", "Passed"), signalColumn("fail", "Failed"), signalColumn("warn", "Warnings"), { id: "reachable", label: "Reachable", value: row => row.reachable, display: row => row.reachable == null ? "Not audited" : row.reachable ? "Yes" : "No" }], seoAuditResult);
  updateCoverage("seo-audit", audit, ["not-audited"]);
  updateOutcomeTime(payload);
}

async function renderAiAwareness() {
  const brandWork = renderBrandEvidence().catch(() => replace("brand-evidence", empty("Brand evidence unavailable")));
  const [payload, geo] = await Promise.all([
    api("/v1/outcomes/ai-awareness"),
    optionalOutcome("/v1/outcomes/geo-awareness"),
  ]);
  evidenceTable("ai-awareness", payload.rows, "Core AI awareness", [signalColumn("mention", "Mentioned", "%"), signalColumn("recommendation", "Recommended", "%"), signalColumn("citation", "Cited", "%"), signalColumn("averageRank", "Average rank")], row => metricGrid([
    { label: "Mentioned", value: value(row.mention, "%") },
    { label: "Recommended", value: value(row.recommendation, "%") },
    { label: "Cited", value: value(row.citation, "%") },
    { label: "Average rank", value: value(row.averageRank) },
  ]));
  updateCoverage("ai-awareness", payload, ["not-measured"]);
  const awarenessState = document.querySelector<HTMLElement>("[data-ai-awareness-state]");
  if (awarenessState) awarenessState.textContent = evidenceStateLabel(payload.source);
  if (geo.unavailable) replace("geo-awareness", empty("GEO Observatory unavailable"));
  else evidenceTable("geo-awareness", geo.rows, "Organic ranking evidence", [
    { id: "topThreeCount", label: "Top three", value: row => numericEvidence(row.classes?.A), display: row => countOf(row.classes?.A, row.queries) },
    { id: "pageOneCount", label: "Page one", value: row => numericEvidence(row.classes?.A) !== null && numericEvidence(row.classes?.B) !== null ? row.classes.A + row.classes.B : null, display: row => countOf(numericEvidence(row.classes?.A) !== null && numericEvidence(row.classes?.B) !== null ? row.classes.A + row.classes.B : null, row.queries) },
    { id: "absent", label: "Absent", value: row => numericEvidence(row.classes?.C), display: row => countOf(row.classes?.C, row.queries) },
    signalColumn("topThree", "Top-three rate", "%"),
  ], geoResult);
  updateCoverage("geo-awareness", geo, ["not-measured", "not-configured"]);
  updateOutcomeTime(payload);
  await brandWork;
}

// Brand evidence (absorbed from MentionPilot): one project at a time, original
// prompts and answers, explicit failures, community findings and follow-ups.
const BRAND_EVIDENCE_CHANNELS: Record<string, string> = {
  "api-model": "API model check",
  "consumer-assistant": "Consumer assistant capture",
};

function rateLabel(rate: unknown) {
  return typeof rate === "number" && Number.isFinite(rate) ? `${Math.round(rate * 100)}%` : "Not measured";
}

function safeHttpUrl(candidate: unknown) {
  try {
    const url = new URL(String(candidate ?? ""));
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

// A failed or unavailable provider call has no verdict. Saying "not mentioned"
// for it would invent a negative observation.
function observationVerdict(observation: JsonRecord) {
  if (observation.status !== "completed") return `No verdict · ${observation.errorMessage ?? "provider unavailable"}`;
  if (!observation.brandMentioned) return "Not mentioned";
  const position = observation.brandPosition ? ` at #${observation.brandPosition}` : "";
  return `Mentioned${position}${observation.brandCited ? " · own site cited" : ""}`;
}

function brandEvidencePath(projectId: string, suffix = "") {
  return `/v1/projects/${encodeURIComponent(projectId)}/brand-evidence${suffix}`;
}

function brandEvidenceButton(label: string, onClick: () => Promise<void>) {
  const button = element("button", { type: "button", class: "secondary-action brand-evidence__action" }, [label]);
  button.addEventListener("click", async () => {
    button.disabled = true;
    try {
      await onClick();
    } catch (error) {
      const status = document.querySelector<HTMLElement>("[data-brand-evidence-status]");
      if (status) status.textContent = error instanceof Error ? error.message : "Unavailable";
      button.disabled = false;
    }
  });
  return button;
}

function brandEvidenceSummary(view: JsonRecord) {
  const apiChannel = view.summary?.channels?.["api-model"] ?? {};
  const consumer = view.summary?.channels?.["consumer-assistant"] ?? {};
  const failures = Number(apiChannel.error ?? 0) + Number(apiChannel.unavailable ?? 0);
  return metricGrid([
    { label: "API answers", value: String(apiChannel.completed ?? 0), detail: apiChannel.lastObservedAt ? `Last ${formatted(apiChannel.lastObservedAt)}` : "No API check yet" },
    { label: "Mentioned", value: rateLabel(apiChannel.mentionRate), detail: "Completed API answers only" },
    { label: "Provider failures", value: String(failures), detail: "Unavailable, not negative" },
    { label: "Consumer captures", value: String(consumer.completed ?? 0), detail: `Mention rate: ${rateLabel(consumer.mentionRate).toLowerCase()}` },
    { label: "Open follow-ups", value: String(view.summary?.openActions ?? 0) },
  ]);
}

function brandEvidenceGroup(title: string, count: number, body: Node) {
  return element("details", { class: "brand-evidence__group" }, [
    element("summary", {}, [title, element("span", { class: "brand-evidence__count" }, [String(count)])]),
    body,
  ]);
}

function brandEvidenceObservation(projectId: string, observation: JsonRecord, refresh: () => Promise<void>) {
  const citations = (observation.citations ?? []).map(safeHttpUrl).filter(Boolean).slice(0, 8) as string[];
  return element("article", { class: "brand-evidence__item", "data-observation-status": observation.status }, [
    element("header", { class: "brand-evidence__item-head" }, [
      element("span", {}, [`${observation.provider} · ${observation.model}`]),
      element("span", { class: "brand-evidence__channel" }, [BRAND_EVIDENCE_CHANNELS[observation.channel] ?? observation.channel]),
      state(observation.status),
      element("small", {}, [formatted(observation.observedAt)]),
    ]),
    element("p", { class: "brand-evidence__prompt" }, [observation.promptText]),
    element("p", { class: "brand-evidence__verdict" }, [observationVerdict(observation)]),
    observation.answerText
      ? element("details", { class: "brand-evidence__answer" }, [
          element("summary", {}, ["Original answer"]),
          element("p", {}, [observation.answerText]),
        ])
      : null,
    citations.length
      ? element("ul", { class: "brand-evidence__citations" }, citations.map((url) =>
          element("li", {}, [element("a", { href: url, rel: "noreferrer noopener", target: "_blank" }, [url])])))
      : null,
    brandEvidenceButton("Create follow-up", async () => {
      await api(brandEvidencePath(projectId, "/actions"), {
        method: "POST",
        body: JSON.stringify({
          subjectKind: "observation",
          subjectId: observation.id,
          title: `Follow up: ${String(observation.promptText).slice(0, 160)}`,
        }),
      });
      await refresh();
    }),
  ]);
}

function brandEvidenceFinding(projectId: string, finding: JsonRecord, refresh: () => Promise<void>) {
  const url = safeHttpUrl(finding.url);
  const setStatus = (status: string) => async () => {
    await api(brandEvidencePath(projectId, `/findings/${encodeURIComponent(finding.id)}`), {
      method: "POST",
      body: JSON.stringify({ status }),
    });
    await refresh();
  };
  return element("article", { class: "brand-evidence__item" }, [
    element("header", { class: "brand-evidence__item-head" }, [
      element("span", {}, [finding.sourceName ?? finding.source]),
      element("span", { class: "brand-evidence__channel" }, [`${finding.intent} · relevance ${finding.relevanceScore}`]),
      state(finding.status),
      element("small", {}, [formatted(finding.publishedAt ?? finding.firstSeenAt)]),
    ]),
    element("p", { class: "brand-evidence__prompt" }, [
      url ? element("a", { href: url, rel: "noreferrer noopener", target: "_blank" }, [finding.title]) : finding.title,
    ]),
    finding.content ? element("p", { class: "brand-evidence__verdict" }, [String(finding.content).slice(0, 280)]) : null,
    element("div", { class: "brand-evidence__buttons" }, [
      finding.status !== "reviewed" ? brandEvidenceButton("Mark reviewed", setStatus("reviewed")) : null,
      finding.status !== "resolved" ? brandEvidenceButton("Resolve", setStatus("resolved")) : null,
      finding.status !== "dismissed" ? brandEvidenceButton("Dismiss", setStatus("dismissed")) : null,
      brandEvidenceButton("Create follow-up", async () => {
        await api(brandEvidencePath(projectId, "/actions"), {
          method: "POST",
          body: JSON.stringify({ subjectKind: "finding", subjectId: finding.id, title: `Follow up: ${String(finding.title).slice(0, 160)}` }),
        });
        await refresh();
      }),
    ]),
  ]);
}

function brandEvidenceActions(projectId: string, actions: JsonRecord[], refresh: () => Promise<void>) {
  if (!actions.length) return element("p", { class: "brand-evidence__empty" }, ["No follow-ups yet. Create one from an answer or a finding."]);
  return element("ul", { class: "brand-evidence__list" }, actions.map((action) =>
    element("li", {}, [
      state(action.status),
      element("span", {}, [action.title]),
      element("small", {}, [`${action.subjectKind} · ${formatted(action.completedAt ?? action.createdAt)}`]),
      brandEvidenceButton(action.status === "open" ? "Mark done" : "Reopen", async () => {
        await api(brandEvidencePath(projectId, `/actions/${encodeURIComponent(action.id)}`), {
          method: "POST",
          body: JSON.stringify({ status: action.status === "open" ? "completed" : "open" }),
        });
        await refresh();
      }),
    ])));
}

function brandEvidenceChecks(checks: JsonRecord[]) {
  if (!checks.length) return element("p", { class: "brand-evidence__empty" }, ["No checks recorded."]);
  return element("ul", { class: "brand-evidence__list" }, checks.slice(0, 10).map((check) =>
    element("li", {}, [
      state(check.status),
      element("span", {}, [`${check.completed}/${check.attempted} answered · ${check.failed} unavailable`]),
      element("small", {}, [`${check.trigger} · ${formatted(check.startedAt)}`]),
    ])));
}

function brandEvidenceProfile(profile: JsonRecord | null) {
  if (!profile) return null;
  const provider = profile.provider?.mode === "custom-endpoint"
    ? `Custom endpoint · ${profile.provider.model}`
    : "free-ai gateway · auto";
  const competitors = (profile.competitors ?? []).map((competitor: JsonRecord) => competitor.name).join(", ");
  return element("p", { class: "measurement-boundary-note brand-evidence__profile" }, [
    `${profile.brandName}${profile.brandUrl ? ` · ${profile.brandUrl}` : ""}`,
    competitors ? ` · vs ${competitors}` : "",
    ` · ${provider}`,
    ` · schedule ${profile.schedule ?? "manual"}`,
  ]);
}

function brandGrowthTask(task: JsonRecord) {
  const count = (input: unknown) => typeof input === "number" ? input.toLocaleString("en") : "Not measured";
  const receiptUrl = safeHttpUrl(task.receipt?.url);
  const measurementUrl = safeHttpUrl(task.measurement?.url);
  const issueUrl = safeHttpUrl(task.issueUrl);
  const failed = Object.entries(task.review?.checks ?? {}).filter(([, value]) => !(value as JsonRecord).passed);
  return element("article", { class: "brand-evidence__item" }, [
    element("header", { class: "brand-evidence__item-head" }, [state(task.status), element("span", {}, [task.kind]), element("small", {}, [task.week])]),
    element("p", { class: "brand-evidence__prompt" }, [task.title]),
    element("p", { class: "brand-evidence__verdict" }, [task.brief]),
    task.keyword ? element("p", {}, [`Intent: ${task.intent} · Query: ${task.keyword}`]) : null,
    task.baseline ? element("p", { class: "measurement-boundary-note" }, [`Baseline: ${task.baseline}`]) : null,
    safeHttpUrl(task.targetUrl) ? element("p", {}, ["Mapped page: ", element("a", { href: safeHttpUrl(task.targetUrl)!, rel: "noreferrer noopener", target: "_blank" }, [task.targetUrl])]) : null,
    issueUrl ? element("a", { href: issueUrl, rel: "noreferrer noopener", target: "_blank" }, ["Open delivery issue"]) : null,
    task.draft ? element("details", { class: "brand-evidence__answer" }, [
      element("summary", {}, ["Current draft"]), element("p", {}, [task.draft.content]),
    ]) : null,
    task.review ? element("p", { class: "measurement-boundary-note" }, [
      `Reviewer: ${task.review.reviewer} · ${failed.length ? `${failed.length} checks need changes` : "All six checks passed"}. Reviewer attestation for this draft.`,
    ]) : null,
    task.review ? element("details", { class: "brand-evidence__answer" }, [
      element("summary", {}, ["QA findings"]),
      element("ul", {}, Object.entries(task.review.checks).map(([name, check]) =>
        element("li", {}, [`${name}: ${(check as JsonRecord).passed ? "passed" : "needs changes"} · ${(check as JsonRecord).note}`]))),
    ]) : null,
    receiptUrl ? element("p", {}, ["Publication receipt: ", element("a", { href: receiptUrl, rel: "noreferrer noopener", target: "_blank" }, [receiptUrl]), ` · ${formatted(task.receipt.observedAt)} · supplied evidence`]) : null,
    task.measurement ? element("div", {}, [
      metricGrid([
        { label: "Clicks", value: count(task.measurement.clicks) },
        { label: "Visits", value: count(task.measurement.visits) },
        { label: "Conversions", value: count(task.measurement.conversions) },
      ]),
      element("p", {}, [task.measurement.conclusion]),
      element("p", { class: "measurement-boundary-note" }, [`Window: ${formatted(task.measurement.windowStart)} – ${formatted(task.measurement.windowEnd)}`]),
      element("p", { class: "measurement-boundary-note" }, [task.measurement.attribution]),
      measurementUrl ? element("a", { href: measurementUrl, rel: "noreferrer noopener", target: "_blank" }, ["Measurement source"]) : null,
    ]) : null,
    task.parkReason ? element("p", {}, [`Parked: ${task.parkReason}`]) : null,
    task.completion ? element("p", { class: "measurement-boundary-note" }, [`Review completed: ${task.completion.note} · ${formatted(task.completion.observedAt)}. Execution evidence; growth remains unmeasured.`]) : null,
  ]);
}

async function brandGrowth(projectId: string, refresh: () => Promise<void>) {
  let growth: JsonRecord;
  try { growth = await api(brandEvidencePath(projectId, "/growth")); }
  catch { return empty("Growth cycle unavailable"); }
  return element("div", { class: "brand-evidence__items", "data-growth-cycle": projectId }, [
    element("p", {}, ["Turn observed search and AI gaps into researched briefs, reviewed changes and measured follow-ups. Delivery stays in the product’s own repository."]),
    element("p", { class: "measurement-boundary-note" }, ["Planning creates local work only. Drafts, QA and publication receipts are supplied by your agent. Publication and outreach use the product’s existing workflow."]),
    ...(growth.gaps ?? []).map((gap: string) => element("p", { class: "measurement-boundary-note" }, [gap])),
    brandEvidenceButton("Plan this week", async () => {
      await api(brandEvidencePath(projectId, "/growth"), { method: "POST", body: JSON.stringify({ revision: growth.revision, command: "plan" }) });
      await refresh();
    }),
    element("small", {}, [`${growth.cycles?.length ?? 0} weekly cycles · ${growth.tasks?.length ?? 0} tasks`]),
    ...(growth.tasks ?? []).map(brandGrowthTask),
  ]);
}

function brandEvidenceSetup(projectId: string, view: JsonRecord, project: JsonRecord, refresh: () => Promise<void>) {
  const profile = view.profile ?? {};
  const details = element("details", { class: "brand-evidence__setup" });
  if (!view.profile) details.open = true;
  details.append(element("summary", {}, [view.profile ? "Edit brand and prompts" : "Set up brand monitoring"]));
  const form = element("form", { class: "brand-evidence__form" });
  const inputs: Record<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> = {};
  const field = (name: string, label: string, value: string, multiline = false) => {
    const input = multiline ? element("textarea", { name, rows: "3" }) : element("input", { name, type: name === "brandUrl" ? "url" : "text" });
    input.value = value;
    if (name === "brandName") input.required = true;
    inputs[name] = input;
    return element("label", {}, [element("span", {}, [label]), input]);
  };
  form.append(
    field("brandName", "Brand name", profile.brandName ?? project.name ?? projectId),
    field("brandUrl", "Website", profile.brandUrl ?? project.websiteUrl ?? ""),
    field("aliases", "Other brand names · one per line", (profile.aliases ?? []).join("\n"), true),
    field("keywords", "Topics to watch · one per line", (profile.keywords ?? []).join("\n"), true),
    field("competitors", "Competitors · one per line", (profile.competitors ?? []).map((item: JsonRecord) => item.name).join("\n"), true),
    field("communities", "Reddit communities · one per line", (profile.communities ?? []).join("\n"), true),
  );
  const schedule = element("select", { name: "schedule" }, [
    element("option", { value: "" }, ["Manual"]), element("option", { value: "daily" }, ["Daily"]), element("option", { value: "weekly" }, ["Weekly · Mondays"]),
  ]);
  schedule.value = profile.schedule ?? ""; inputs.schedule = schedule;
  form.append(element("label", {}, [element("span", {}, ["Refresh cadence"]), schedule]));
  const message = element("p", { role: "status", class: "measurement-boundary-note" }, ["Scheduled refreshes run while Site Health’s backend is open. Community collection covers the latest 30 days; API checks need an available model connection."]);
  const save = element("button", { type: "submit", class: "secondary-action" }, ["Save brand"]);
  form.append(save, message);
  const lines = (key: string) => inputs[key].value.split("\n").map((value) => value.trim()).filter(Boolean);
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); save.disabled = true;
    try {
      const existingCompetitors = new Map((profile.competitors ?? []).map((item: JsonRecord) => [item.name, item]));
      await api(brandEvidencePath(projectId, "/profile"), { method: "PUT", body: JSON.stringify({
        ...profile, brandName: inputs.brandName.value, brandUrl: inputs.brandUrl.value,
        aliases: lines("aliases"), keywords: lines("keywords"), communities: lines("communities"),
        competitors: lines("competitors").map((name) => existingCompetitors.get(name) ?? { name }), schedule: schedule.value || null,
      }) });
      await refresh();
    } catch (error) { message.textContent = error instanceof Error ? error.message : "Could not save brand"; save.disabled = false; }
  });
  details.append(form);
  const prompts = view.prompts ?? [];
  details.append(element("h3", {}, ["Saved prompts"]));
  details.append(element("ul", { class: "brand-evidence__list" }, prompts.map((prompt: JsonRecord) => element("li", {}, [
    element("span", {}, [prompt.promptText]),
    brandEvidenceButton("Remove prompt", async () => {
      await api(brandEvidencePath(projectId, `/prompts/${encodeURIComponent(prompt.id)}/remove`), { method: "POST", body: "{}" });
      await refresh();
    }),
  ]))));
  const promptForm = element("form", { class: "brand-evidence__prompt-form" });
  const prompt = element("textarea", { name: "promptText", rows: "2", required: "", maxlength: "2000" });
  const add = element("button", { type: "submit", class: "secondary-action" }, ["Add prompt"]);
  promptForm.append(element("label", {}, [element("span", {}, ["Question to ask AI models"]), prompt]), add);
  promptForm.addEventListener("submit", async (event) => {
    event.preventDefault(); add.disabled = true;
    try {
      await api(brandEvidencePath(projectId, "/prompts"), { method: "POST", body: JSON.stringify({ promptText: prompt.value }) });
      await refresh();
    } catch (error) { message.textContent = error instanceof Error ? error.message : "Could not save prompt"; add.disabled = false; }
  });
  details.append(promptForm);
  return details;
}

function brandCollectionHistory(collections: JsonRecord[]) {
  if (!collections.length) return element("p", { class: "brand-evidence__empty" }, ["No fresh collection yet. Refresh web evidence to inspect the brand website and look for community mentions."]);
  return element("ul", { class: "brand-evidence__list" }, collections.slice(0, 12).map((run) => element("li", {}, [
    state(run.status),
    element("span", {}, [run.source === "hackernews" ? "Hacker News" : run.source === "reddit" ? "Reddit" : run.source === "reddit_insights" ? "Reddit Insights snapshot" : "Website",
      ` · ${run.query} · `, run.status === "completed" ? (run.source === "website" ? (Number.isInteger(run.matched) ? `${run.matched} configured terms found` : "Page text extracted") : `${run.matched} matched / ${run.received} inspected`) : run.errorMessage ?? "Collecting…"]),
    element("small", {}, [formatted(run.finishedAt ?? run.startedAt)]),
  ])));
}

function brandCommunityComposer(projectId: string, view: JsonRecord, project: JsonRecord, refresh: () => Promise<void>) {
  const section = element("section", { class: "brand-evidence__group" }, [
    element("h3", {}, ["Find your communities"]),
    element("p", { class: "measurement-boundary-note" }, ["Paste your product URL to find relevant subreddits, prepare post drafts, and find threads where you can contribute."]),
  ]);
  const form = element("form", { class: "brand-evidence__prompt-form" });
  const url = element("input", { type: "url", name: "websiteUrl", required: "", placeholder: "https://your-product.com" });
  url.value = view.profile?.brandUrl ?? project.websiteUrl ?? "";
  const submit = element("button", { type: "submit", class: "secondary-action" }, ["Find communities and prepare drafts"]);
  const message = element("p", { role: "status", class: "measurement-boundary-note" });
  form.append(element("label", {}, [element("span", {}, ["Product website"]), url]), submit, message);
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); submit.disabled = true;
    message.textContent = "Reading your website, checking communities and preparing drafts…";
    try {
      await api(brandEvidencePath(projectId, "/community-brief"), { method: "POST", body: JSON.stringify({ url: url.value }) });
      await refresh();
    } catch (error) {
      message.textContent = error instanceof Error ? error.message : "Could not prepare community brief";
      submit.disabled = false;
    }
  });
  section.append(form);
  const brief = (view.communityBriefs ?? [])[0];
  if (!brief) return section;
  section.append(element("p", { class: "measurement-boundary-note" }, [
    brief.message ?? "Saved community brief", ` · ${formatted(brief.preparedAt)}`,
  ]));
  if (brief.product) section.append(element("p", {}, [brief.product.summary]));
  if ((brief.communities ?? []).length) {
    section.append(element("h4", {}, ["Subreddits"]));
    section.append(element("div", { class: "brand-evidence__items" }, brief.communities.map((community: JsonRecord) => {
      const communityUrl = safeHttpUrl(community.url);
      return element("article", { class: "brand-evidence__item" }, [
        element("header", { class: "brand-evidence__item-head" }, [
          communityUrl ? element("a", { href: communityUrl, target: "_blank", rel: "noreferrer noopener" }, [`r/${community.name}`]) : community.name,
          state(community.status), element("small", {}, [community.rulesStatus === "verified" ? "Rules retrieved" : "Rules unavailable"]),
          community.capturedAt ? element("small", {}, [`Public capture ${formatted(community.capturedAt)}`]) : null,
        ]),
        element("p", {}, [community.reason]),
        community.message ? element("p", { class: "measurement-boundary-note" }, [community.message]) : null,
        (community.rules ?? []).length ? element("details", {}, [
          element("summary", {}, ["Community rules"]),
          element("ul", {}, community.rules.map((rule: JsonRecord) => element("li", {}, [`${rule.title}: ${rule.description}`]))),
        ]) : null,
      ]);
    })));
  }
  if ((brief.threads ?? []).length) {
    section.append(element("h4", {}, ["Threads to contribute to"]));
    section.append(element("ul", { class: "brand-evidence__list brand-evidence__threads" }, brief.threads.map((thread: JsonRecord) => {
      const threadUrl = safeHttpUrl(thread.url);
      return element("li", {}, [
        element("span", {}, [threadUrl ? element("a", { href: threadUrl, target: "_blank", rel: "noreferrer noopener" }, [thread.title]) : thread.title]),
        thread.fitReason ? element("span", { class: "measurement-boundary-note" }, [thread.fitReason]) : null,
        element("small", {}, [`r/${thread.subreddit} · ${formatted(thread.publishedAt)} · ${thread.capturedAt ? `captured ${formatted(thread.capturedAt)}` : `checked ${formatted(thread.checkedAt)}`}`]),
      ]);
    })));
  }
  if ((brief.drafts ?? []).length) section.append(element("h4", {}, ["Post and comment drafts"]));
  for (const draft of brief.drafts ?? []) {
    const draftForm = element("form", { class: "brand-evidence__draft" });
    const title = element("input", { name: "title", type: "text", maxlength: "300" }); title.value = draft.title ?? "";
    const body = element("textarea", { name: "body", rows: "8", required: "", maxlength: "8000" }); body.value = draft.body;
    const saved = element("span", { role: "status", class: "measurement-boundary-note" });
    const save = element("button", { type: "submit", class: "secondary-action" }, ["Save edits"]);
    const copy = element("button", { type: "button", class: "secondary-action" }, [draft.kind === "post" ? "Copy post" : "Copy comment"]);
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(draft.kind === "post" ? `${title.value}\n\n${body.value}` : body.value);
        saved.textContent = "Copied";
      } catch { saved.textContent = "Select the draft text to copy it."; }
    });
    const source = safeHttpUrl(draft.sourceUrl);
    draftForm.append(
      element("header", { class: "brand-evidence__item-head" }, [
        element("strong", {}, [`${draft.kind === "post" ? "Post" : "Comment"} · r/${draft.subreddit}`]),
        source ? element("a", { href: source, target: "_blank", rel: "noreferrer noopener" }, [draft.kind === "post" ? "Open subreddit" : "Open source thread"]) : null,
        element("small", {}, [draft.rulesStatus === "verified" ? "Based on retrieved community rules" : "Community rules need review"]),
      ]),
    );
    if (draft.kind === "post") draftForm.append(element("label", {}, [element("span", {}, ["Post title"]), title]));
    draftForm.append(element("label", {}, [element("span", {}, [draft.kind === "post" ? "Post body" : "Comment"]), body]),
      element("div", { class: "brand-evidence__buttons" }, [save, copy, saved]));
    draftForm.addEventListener("submit", async (event) => {
      event.preventDefault(); save.disabled = true;
      try {
        await api(brandEvidencePath(projectId, `/briefs/${encodeURIComponent(brief.id)}/drafts/${encodeURIComponent(draft.id)}`), {
          method: "POST", body: JSON.stringify({ title: title.value, body: body.value }),
        });
        saved.textContent = "Saved"; save.disabled = false;
      } catch (error) { saved.textContent = error instanceof Error ? error.message : "Could not save"; save.disabled = false; }
    });
    section.append(draftForm);
  }
  return section;
}

function brandWebsiteEvidence(collections: JsonRecord[]) {
  const latest = collections.find((run) => run.source === "website" && run.status === "completed");
  if (!latest?.payload) return null;
  const page = latest.payload;
  const url = safeHttpUrl(page.sourceUrl);
  return element("section", { class: "brand-evidence__group" }, [
    element("h3", {}, ["Website evidence"]),
    element("p", { class: "measurement-boundary-note" }, [`Last successful read ${formatted(page.checkedAt)} · ${age(page.checkedAt)}`]),
    element("strong", {}, [url ? element("a", { href: url, target: "_blank", rel: "noreferrer noopener" }, [page.title || url]) : page.title || "Website"]),
    page.description ? element("p", {}, [page.description]) : null,
    element("details", { class: "brand-evidence__answer" }, [
      element("summary", {}, ["Extracted page text"]), element("p", {}, [page.textExcerpt || "No text extracted"]),
    ]),
  ]);
}

async function renderBrandEvidence() {
  const select = document.querySelector<HTMLSelectElement>("[data-brand-evidence-project]");
  const checkButton = document.querySelector<HTMLButtonElement>("[data-brand-evidence-check]");
  const collectButton = document.querySelector<HTMLButtonElement>("[data-brand-evidence-collect]");
  const status = document.querySelector<HTMLElement>("[data-brand-evidence-status]");
  const count = document.querySelector<HTMLElement>('[data-dashboard-count="brand-evidence"]');
  if (!select) return;
  let listing: JsonRecord;
  try { listing = await api("/v1/brand-evidence/projects"); }
  catch { replace("brand-evidence", empty("Brand evidence unavailable · start the Site Health backend to load private evidence.")); return; }
  const profiles: JsonRecord[] = listing.profiles ?? [];
  const projects: JsonRecord[] = (listing.projects ?? []).filter((project: JsonRecord) => includeInactive || project.active);
  if (count) count.textContent = String(profiles.length);
  if (!projects.length) { replace("brand-evidence", empty("No projects available for brand monitoring.")); return; }
  const requested = new URLSearchParams(window.location.search).get("project");
  select.replaceChildren(...projects.map((project) => element("option", { value: project.projectId }, [
    `${project.name}${profiles.some((profile) => profile.projectId === project.projectId) ? "" : " · set up"}${project.active ? "" : " · retained history"}`,
  ])));
  select.value = projects.some((project) => project.projectId === requested) ? requested! : (profiles.find((p) => projects.some((project) => project.projectId === p.projectId && project.active))?.projectId ?? projects[0].projectId);
  let generation = 0;
  let busy = false;
  const show = async () => {
    const version = ++generation;
    const projectId = select.value;
    const url = new URL(window.location.href); url.searchParams.set("project", projectId); window.history.replaceState(null, "", url);
    const view = await api(brandEvidencePath(projectId));
    if (version !== generation || projectId !== select.value) return;
    const project = projects.find((item) => item.projectId === projectId)!;
    if (view.profile && !profiles.some((profile) => profile.projectId === projectId)) profiles.push(view.profile);
    if (count) count.textContent = String(profiles.length);
    const selectedOption = select.selectedOptions[0];
    if (selectedOption) selectedOption.textContent = `${view.profile?.brandName ?? project.name}${view.profile ? "" : " · set up"}${project.active ? "" : " · retained history"}`;
    if (checkButton) {
      checkButton.disabled = busy || !view.readiness?.api?.ready || !(view.prompts ?? []).length || !project.active;
      checkButton.title = view.readiness?.api?.reason ?? "Run saved prompts through the configured API model";
    }
    if (collectButton) collectButton.disabled = busy || !view.profile || !project.active;
    const growthSlot = element("div", {}, ["Reading saved growth cycle…"]);
    replace("brand-evidence", element("div", { class: "brand-evidence" }, [
      brandEvidenceSummary(view),
      brandEvidenceProfile(view.profile),
      element("details", { class: "brand-evidence__group" }, [element("summary", {}, ["Find communities and prepare a contribution"]), brandCommunityComposer(projectId, view, project, show)]),
      brandEvidenceSetup(projectId, view, project, show),
      view.profile && !view.readiness?.api?.ready ? element("p", { class: "measurement-boundary-note" }, ["API checks need an available model connection. Web evidence and saved history remain available."]) : null,
      brandEvidenceGroup("Collection history", (view.collections ?? []).length, brandCollectionHistory(view.collections ?? [])),
      brandWebsiteEvidence(view.collections ?? []),
      brandEvidenceGroup("Answers", (view.observations ?? []).length, (view.observations ?? []).length
        ? element("div", { class: "brand-evidence__items" }, view.observations.slice(0, 25).map((observation: JsonRecord) => brandEvidenceObservation(projectId, observation, show)))
        : element("p", { class: "brand-evidence__empty" }, ["No answers recorded for this project."])),
      brandEvidenceGroup("Follow-ups", (view.actions ?? []).length, brandEvidenceActions(projectId, view.actions ?? [], show)),
      brandEvidenceGroup("Community findings", (view.findings ?? []).length, (view.findings ?? []).length
        ? element("div", { class: "brand-evidence__items" }, view.findings.slice(0, 25).map((finding: JsonRecord) => brandEvidenceFinding(projectId, finding, show)))
        : element("p", { class: "brand-evidence__empty" }, ["No matching Hacker News or Reddit findings recorded. Check collection history for source availability."])),
      brandEvidenceGroup("Check history", (view.checks ?? []).length, brandEvidenceChecks(view.checks ?? [])),
      element("section", { class: "brand-evidence__group" }, [element("h3", {}, ["Growth cycle"]), growthSlot]),
    ]));
    try {
      const growth = await brandGrowth(projectId, show);
      if (version === generation && projectId === select.value) growthSlot.replaceChildren(growth);
    } catch { growthSlot.textContent = "Saved growth cycle unavailable."; }
  };
  select.onchange = () => { if (status) status.textContent = ""; void show().catch(() => replace("brand-evidence", empty("Brand evidence unavailable"))); };
  const run = async (kind: "checks" | "collect") => {
    const projectId = select.value; busy = true;
    if (checkButton) checkButton.disabled = true;
    if (collectButton) collectButton.disabled = true;
    select.disabled = true;
    if (status) status.textContent = kind === "checks" ? "Running API check…" : "Reading website and community sources…";
    try {
      const result = await api(brandEvidencePath(projectId, `/${kind}`), { method: "POST", body: "{}" });
      if (status) status.textContent = kind === "checks" ? (result.reason ?? result.summary ?? result.status)
        : `Collection ${result.status} · ${(result.results ?? []).filter((item: JsonRecord) => item.status === "completed").length} successful searches. See source details below.`;
    } catch (error) { if (status) status.textContent = error instanceof Error ? error.message : "Unavailable"; }
    finally { busy = false; select.disabled = false; await show(); }
  };
  if (checkButton) checkButton.onclick = () => { void run("checks"); };
  if (collectButton) collectButton.onclick = () => { void run("collect"); };
  await show();
}

async function renderPerformance() {
  const payload = await api("/v1/outcomes/performance");
  evidenceTable("performance", payload.rows, "Performance evidence", [signalColumn("psi", "PSI"), signalColumn("lcp", "LCP", " ms")], row => metricGrid([
    { label: "PSI", value: value(row.psi), detail: row.psi?.history ?? "No recorded history" },
    { label: "LCP", value: value(row.lcp, " ms"), detail: row.lcp?.history ?? "No recorded history" },
  ]));
  updateOutcomeTime(payload);
  updateCoverage("performance", payload, ["not-collected", "not-measured", "unknown"]);
}

function updateOutcomeTime(payload?: JsonRecord) {
  const target = document.querySelector<HTMLElement>("[data-outcome-time]");
  if (!target) return;
  const source = payload?.source;
  if (!source) {
    target.textContent = formatted(payload?.generatedAt);
    return;
  }
  const blocker = source.failure?.code
    ? ` · ${String(source.failure.code).toLowerCase().replaceAll("_", " ")}`
    : "";
  const refresh = refreshAttemptLabel(source, formatted);
  target.textContent = `${evidenceStateLabel(source)} · evidence ${formatted(source.observedAt)} · ${refresh}${blocker}`;
}

// Infrastructure spend is billed per account, not per product, and the collector records a cost
// it could not read as `unknown` rather than zero. Both facts are stated on the panel so a
// per-product page never implies a per-product number that was never measured.
function spendPanel(
  spend: JsonRecord,
  outcomePanel: (
    label: string,
    statusValue: string,
    observedAt: string | null | undefined,
    metrics: Array<{ label: string; value: string; detail?: string }>,
    note: string,
  ) => Node,
) {
  const providers = spend.providers ?? [];
  const known = providers.filter((provider: JsonRecord) => provider.spendState === "known");
  const total = known.reduce(
    (sum: number, provider: JsonRecord) =>
      sum + (provider.costs ?? []).reduce(
        (inner: number, cost: JsonRecord) => inner + (Number.isFinite(Number(cost.amountUsd)) ? Number(cost.amountUsd) : 0),
        0,
      ),
    0,
  );
  const pressure = providers
    .flatMap((provider: JsonRecord) => provider.quotas ?? [])
    .filter((quota: JsonRecord) => Number.isFinite(Number(quota.percent)))
    .sort((left: JsonRecord, right: JsonRecord) => Number(right.percent) - Number(left.percent))[0];
  return outcomePanel(
    "Infrastructure spend",
    spend.unavailable ? "unavailable" : spend.state ?? "not-collected",
    spend.observedAt,
    [
      {
        label: "Observed cost",
        value: known.length ? `$${total.toLocaleString("en", { maximumFractionDigits: 2 })}` : "Unknown",
        detail: known.length
          ? `${known.length} of ${providers.length} providers reported a cost`
          : "No provider returned a billable amount; unknown is not zero",
      },
      {
        label: "Providers",
        value: providers.length
          ? providers.map((provider: JsonRecord) => `${provider.provider} · ${provider.spendState}`).join(", ")
          : "Not collected",
      },
      {
        label: "Highest quota pressure",
        value: pressure ? `${Number(pressure.percent).toFixed(1)}%` : "Not measured",
        detail: pressure ? String(pressure.metric) : "No quota reading stored",
      },
      {
        label: "Alert",
        value: spend.alert?.severity ?? (spend.state === "not-collected" ? "Not collected" : "None"),
        detail: (spend.alert?.reasons ?? [])
          .map((reason: JsonRecord) => reason.detail)
          .filter(Boolean)
          .join(" · ") || undefined,
      },
    ],
    "Cloudflare and Turso bill at account scope, so this figure covers the whole fleet rather than this product alone. A cost the collector could not read stays `unknown` and is never rendered as $0.",
  );
}

async function renderProject() {
  const projectId = catalogProjectId(document.body.dataset.projectId);
  const [projects, domains, search, awareness, performance, capabilities, clarity, seo, geo, spend] =
    await Promise.all([
      api("/v1/projects"),
      optionalOutcome("/v1/outcomes/domains"),
      optionalOutcome("/v1/outcomes/search"),
      optionalOutcome("/v1/outcomes/ai-awareness"),
      optionalOutcome("/v1/outcomes/performance"),
      optionalCapabilities(),
      optionalOutcome(`/v1/projects/${encodeURIComponent(projectId)}/clarity`),
      optionalOutcome("/v1/outcomes/seo-audit"),
      optionalOutcome("/v1/outcomes/geo-awareness"),
      optionalOutcome("/v1/spend"),
    ]);
  const project = projects.find((item: JsonRecord) => item.id === projectId);
  if (!project) {
    replace("project-detail", empty("Project not found"));
    return;
  }
  const domain = domains.rows.find((row: JsonRecord) => row.projects?.some((item: JsonRecord) => item.projectId === projectId));
  const searchRow = search.rows.find((row: JsonRecord) => row.projectId === projectId);
  const aiRow = awareness.rows.find((row: JsonRecord) => row.projectId === projectId);
  const performanceRow = performance.rows.find((row: JsonRecord) => row.projectId === projectId);
  const seoRow = seo.rows.find((row: JsonRecord) => row.projectId === projectId);
  const geoRow = geo.rows.find((row: JsonRecord) => row.projectId === projectId);
  const claritySnapshot = clarity.snapshot;
  const clarityMetrics = claritySnapshot?.metrics ?? {};
  const clarityCapabilities = clarity.capabilities ?? {};
  const clarityCapabilitySummary = clarityCapabilities.summary ?? {};
  const clarityCapabilityStates = new Map(
    (clarityCapabilities.capabilities ?? []).map((item: JsonRecord) => [item.id, item.providerState]),
  );
  const journeyProviderVerified = ["smart-events-custom", "funnels"].every(
    (id) => clarityCapabilityStates.get(id) === "provider-verified",
  );
  const sharingDetails = element("section", { class: "profile-section", "aria-label": "Lifecycle and sharing" }, [
    element("h2", {}, ["Lifecycle and sharing"]),
    metricGrid([
      { label: "Development", value: lifecycleLabel(project.lifecycle) },
      { label: "Sharing", value: projectSharingLabel(project) },
    ]),
    element("details", { class: "evidence-details" }, [element("summary", {}, ["Sharing assessment and release conditions"]), element("p", {}, [project.sharingReadiness?.reason ?? "No sharing assessment is recorded."])]),
    project.sharingReadiness?.verifiedAt
      ? element("small", {}, [`Assessed ${shortDate.format(new Date(project.sharingReadiness.verifiedAt))}`]) : null,
    project.lifecycle?.resumeCondition
      ? element("p", {}, [element("strong", {}, ["Resume condition: "]), project.lifecycle.resumeCondition]) : null,
  ]);
  const profileLinks = element("div", { class: "project-profile__links" }, [
    element("a", { href: `/readiness?q=${encodeURIComponent(project.name)}` }, ["Find in readiness"]),
    project.websiteUrl ? element("a", { href: project.websiteUrl, target: "_blank", rel: "noreferrer" }, ["Open website ↗"]) : null,
    project.repositoryUrl ? element("a", { href: project.repositoryUrl, target: "_blank", rel: "noreferrer" }, ["Source ↗"]) : null,
    project.changelogUrl ? element("a", { href: project.changelogUrl, target: "_blank", rel: "noreferrer" }, ["Changelog ↗"]) : null,
  ]);
  const outcomePanel = (
    label: string,
    statusValue: string,
    observedAt: string | null | undefined,
    metrics: Array<{ label: string; value: string; detail?: string }>,
    note: string,
  ) => element("section", { class: "outcome-panel" }, [
    element("header", {}, [element("div", {}, [element("h3", {}, [label]), element("small", {}, [formatted(observedAt)])]), state(statusValue)]),
    metricGrid(metrics),
    element("details", { class: "evidence-details" }, [element("summary", {}, ["Source and methodology"]), element("p", { class: "outcome-panel__note" }, [note])]),
  ]);
  replace("project-detail", element("div", { class: "project-profile" }, [
    element("nav", { class: "section-jumps", "aria-label": "Product sections" }, [
      element("a", { href: "/projects" }, ["← Projects"]),
      element("a", { href: "#site-evidence-title" }, ["Site evidence"]),
      element("a", { href: "#capabilities-title" }, ["Fleet skills"]),
    ]),
    element("section", { class: "project-profile__identity" }, [
      element("div", {}, [
        element("div", { class: "project-directory__kicker" }, [
          element("span", {}, [project.priority ?? "Unranked"]),
          state(project.status ?? lifecycleLabel(project.lifecycle)),
          element("span", {}, [projectSharingLabel(project)]),
          state(lifecycleLabel(project.lifecycle)),
        ]),
        element("p", {}, [project.description ?? "Private Fleet product with no public description."]),
      ]),
      profileLinks,
      metricGrid([
        { label: "Primary domain", value: project.domains?.[0] ?? "No public domain" },
        { label: "Repository", value: project.repo ?? "Not cataloged" },
        { label: "Deployment", value: project.deployKind ?? "Not configured" },
        { label: "Visibility", value: project.repositoryVisibility ?? "Unknown" },
      ]),
    ]),
    sharingDetails,
    element("section", { class: "profile-section", "aria-labelledby": "site-evidence-title" }, [
      element("div", { class: "section-head" }, [element("div", {}, [
        element("p", { class: "eyebrow" }, ["Five independent sources"]),
        element("h2", { id: "site-evidence-title" }, ["Site evidence"]),
        element("p", {}, ["Each source keeps its own status and timestamp; missing evidence does not erase the rest."]),
      ])]),
      element("div", { class: "outcome-panel-grid" }, [
        outcomePanel("Domains / DRANK", sourceStatus(domains, domain?.status), signalTime(domain?.signal), [
          { label: "DRANK", value: sourceValue(domains, signalValue(domain?.signal)), detail: domain?.signal?.history ?? "No history" },
          { label: "Domains", value: String(project.domains?.length ?? 0) },
        ], "Domain-strength evidence is supplied by Drank."),
        outcomePanel("Performance", sourceStatus(performance, performanceRow?.status), signalTime(performanceRow?.psi, performanceRow?.lcp), [
          { label: "PSI", value: sourceValue(performance, signalValue(performanceRow?.psi)) },
          { label: "LCP", value: sourceValue(performance, signalValue(performanceRow?.lcp, " ms")) },
          { label: "Accessibility", value: "Pending", detail: "Pour Engine adapter" },
        ], "PSI Swarm supplies speed evidence. Pour Engine will add auditable WCAG passes, violations, incomplete results, and manual review here."),
        outcomePanel("Google Search / SEO", sourceStatus(search, searchRow?.status), signalTime(searchRow?.impressions, searchRow?.clicks), [
          { label: "Impressions", value: sourceValue(search, signalValue(searchRow?.impressions)) },
          { label: "Clicks", value: sourceValue(search, signalValue(searchRow?.clicks)) },
          { label: "CTR", value: sourceValue(search, signalValue(searchRow?.ctr, "%")) },
          { label: "Position", value: sourceValue(search, signalValue(searchRow?.averagePosition)) },
        ], "Search evidence is collected at portfolio scope from Google Search Console."),
        outcomePanel("On-page SEO", sourceStatus(seo, seoRow?.status), seoRow?.observedAt, [
          { label: "Passed", value: sourceValue(seo, signalValue(seoRow?.pass)) },
          { label: "Failed", value: sourceValue(seo, signalValue(seoRow?.fail)) },
          { label: "Warnings", value: sourceValue(seo, signalValue(seoRow?.warn)) },
          {
            label: "Blocking checks",
            value: seoRow?.failedChecks?.length ? seoRow.failedChecks.join(", ") : seoRow ? "None" : "Not audited",
          },
        ], "The seo-audit skill probes the live public surface. A surface with zero failures is audited and clean; a surface with no audit reports no counts at all."),
        outcomePanel("GEO / organic ranking", sourceStatus(geo, geoRow?.status), geoRow?.observedAt, [
          { label: "Top three (A)", value: sourceValue(geo, countOf(geoRow?.classes?.A, geoRow?.queries)) },
          { label: "Page one (A+B)", value: sourceValue(geo, countOf(
            Number.isFinite(Number(geoRow?.classes?.A)) ? Number(geoRow.classes.A) + Number(geoRow.classes.B) : null,
            geoRow?.queries,
          )) },
          { label: "Absent (C)", value: sourceValue(geo, countOf(geoRow?.classes?.C, geoRow?.queries)) },
          {
            label: "Top-three rate",
            value: sourceValue(geo, signalValue(geoRow?.topThree, "%")),
            detail: geoRow?.runCount > 1 ? `${geoRow.runCount} runs of history` : "Baseline run only",
          },
        ], "GEO Observatory classes each configured query against the live SERP: A = own domain in the top three, B = partial page-one visibility, C = absent."),
        outcomePanel("AI Awareness", sourceStatus(awareness, aiRow?.status), signalTime(aiRow?.mention, aiRow?.recommendation), [
          { label: "Mentioned", value: sourceValue(awareness, signalValue(aiRow?.mention, "%")) },
          { label: "Recommended", value: sourceValue(awareness, signalValue(aiRow?.recommendation, "%")) },
          { label: "Cited", value: sourceValue(awareness, signalValue(aiRow?.citation, "%")) },
          { label: "Average rank", value: sourceValue(awareness, signalValue(aiRow?.averageRank)) },
          { label: "Audit trail", value: "Pending", detail: "Elmo run model" },
        ], "Provider-backed observations remain bounded and source-specific. Elmo's per-prompt, per-engine, citation, and query fan-out mechanics will deepen this audit path."),
        outcomePanel("Clarity / behavior", clarity.unavailable ? "unavailable" : clarity.state, claritySnapshot?.observedAt, [
          { label: "Sessions", value: clarityValue(clarityMetrics.sessions) },
          { label: "Unique browser/device identities", value: clarityValue(clarityMetrics.uniqueBrowsers) },
          { label: "Bot sessions", value: clarityValue(clarityMetrics.botSessions) },
          { label: "Pages / session", value: clarityValue(clarityMetrics.pagesPerSession) },
          { label: "Full baseline", value: clarityValue(clarityCapabilitySummary.desired, " desired") },
          { label: "Conditional", value: clarityValue(clarityCapabilitySummary.conditional) },
          {
            label: "Provider audit",
            value: clarityProviderState(clarityCapabilities.providerState),
          },
          {
            label: "Reread evidence",
            value: `${clarityValue(clarityCapabilitySummary.providerVerified)} verified · ${clarityValue(clarityCapabilitySummary.providerAccounted)} accounted`,
          },
          {
            label: "Smart event + funnel",
            value: journeyProviderVerified
              ? "Verified by reread"
              : clarityCapabilities.journeyState === "ready"
              ? "Ready to configure"
              : clarityCapabilities.journeyState === "discovery-required"
                ? "Needs rendered audit"
                : "Not applicable",
          },
        ], `${clarity.eligibility?.reason ?? "Microsoft Clarity supplies a bounded 24-hour traffic snapshot."} Unique browser/device identities are not registered-account users.`),
        spendPanel(spend, outcomePanel),
      ]),
    ]),
    element("section", { class: "profile-section", "aria-labelledby": "capabilities-title" }, [
      element("div", { class: "section-head" }, [element("div", {}, [
        element("p", { class: "eyebrow" }, ["Operator capability layer"]),
        element("h2", { id: "capabilities-title" }, ["Fleet skills"]),
        element("p", {}, ["Applicable skills remain canonical in SaaS Maker tooling."]),
      ])]),
      element("div", { class: "capability-ledger" }, [
        element("article", {}, [
          element("div", {}, [
            element("h3", {}, ["Applicable skills"]),
            element("p", {}, [capabilities.sources?.skills?.reason ?? "Skill capability state unavailable."]),
            element("small", {}, [(capabilities.skills ?? []).map((item: JsonRecord) => item.id).join(" · ")]),
          ]),
          state(capabilities.sources?.skills?.state),
          element("a", { href: "https://github.com/sass-maker/saas-maker/tree/main/tooling", target: "_blank", rel: "noreferrer" }, ["Open skill catalog ↗"]),
        ]),
      ]),
    ]),
  ]));
  bindProjectRefresh(project);
}

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function completeMetricRun(run: JsonRecord) {
  let current = run;
  for (let attempt = 0; attempt < 80 && current.state === "running"; attempt += 1) {
    await wait(750);
    current = await api(`/v1/metric-runs/${encodeURIComponent(current.runId)}`);
  }
  return current;
}

async function runRefreshPlans(
  plans: Array<{ family: string; projectId?: string; scope: "project" | "portfolio" }>,
  status: HTMLElement | null,
) {
  const labels: Record<string, string> = { drank: "DRANK", psi: "Performance", search: "Search", ai: "AI awareness" };
  const progress = new Map(plans.map((plan) => [plan.family, "queued"]));
  const announce = () => {
    if (status) status.textContent = plans
      .map((plan) => `${labels[plan.family] ?? plan.family}: ${progress.get(plan.family)}`)
      .join(" · ");
  };
  announce();
  const results = await Promise.allSettled(plans.map(async (plan) => {
    try {
      const run = await api("/v1/metric-runs", { method: "POST", body: JSON.stringify(plan) });
      progress.set(plan.family, run.state ?? "running");
      announce();
      const completed = await completeMetricRun(run);
      progress.set(plan.family, completed.state ?? "unavailable");
      announce();
      return completed;
    } catch (error) {
      progress.set(plan.family, "unavailable");
      announce();
      throw error;
    }
  }));
  if (status) status.textContent = plans.map((plan, index) => {
    const result = results[index];
    const resultState = result.status === "fulfilled" ? result.value.state : "unavailable";
    const receipt = resultState === "succeeded"
      ? "refreshed"
      : resultState === "running"
        ? "still running"
        : "unavailable";
    return `${labels[plan.family] ?? plan.family}: ${receipt}`;
  }).join(" · ");
  return results;
}

function bindProjectRefresh(project: JsonRecord) {
  const button = document.querySelector<HTMLButtonElement>("[data-project-refresh]");
  const status = document.querySelector<HTMLElement>("[data-project-refresh-status]");
  if (!button || button.dataset.refreshBound === "true") return;
  button.dataset.refreshBound = "true";
  if (!isCurrentProject(project)) {
    button.disabled = true;
    const label = button.querySelector("span");
    if (label) label.textContent = "Refresh unavailable";
    if (status) status.textContent = "Inactive identity · excluded from portfolio refreshes";
    return;
  }
  button.disabled = false;
  if (status) status.textContent = project.domains?.length
    ? "Product DRANK + Performance · portfolio Search"
    : "Portfolio Search · no product domain configured";
  button?.addEventListener("click", async () => {
    if (button.disabled) return;
    const projectPlans = project.domains?.length
      ? [
          { family: "drank", projectId: project.id, scope: "project" as const },
          { family: "psi", projectId: project.id, scope: "project" as const },
        ]
      : [];
    const plans = [
      ...projectPlans,
      { family: "search", scope: "portfolio" as const },
    ];
    button.disabled = true;
    button.classList.add("running");
    if (status) status.textContent = "Refreshing product DRANK and Performance; Search is portfolio-wide…";
    try {
      await runRefreshPlans(plans, status);
      await renderProject();
    } catch (error) {
      if (status) status.textContent = error instanceof Error ? error.message : "Refresh unavailable";
    } finally {
      button.disabled = false;
      button.classList.remove("running");
    }
  });
}

function bindProjectRefreshAll() {
  const button = document.querySelector<HTMLButtonElement>("[data-project-refresh-all]");
  const status = document.querySelector<HTMLElement>("[data-project-refresh-status]");
  if (!button || button.dataset.refreshBound === "true") return;
  button.dataset.refreshBound = "true";
  button.addEventListener("click", async () => {
    if (button.disabled) return;
    button.disabled = true;
    button.classList.add("running");
    if (status) status.textContent = "Refreshing DRANK, Performance, and Search…";
    try {
      await runRefreshPlans([
        { family: "drank", scope: "portfolio" },
        { family: "psi", scope: "portfolio" },
        { family: "search", scope: "portfolio" },
      ], status);
      await renderProjects();
    } finally {
      button.disabled = false;
      button.classList.remove("running");
    }
  });
}

function bindPortfolioRefresh() {
  document.querySelectorAll<HTMLButtonElement>("[data-portfolio-refresh]").forEach((button) => {
    button.addEventListener("click", async () => {
      const family = button.dataset.portfolioRefresh;
      if (!family) return;
      const status = document.querySelector<HTMLElement>(`[data-portfolio-refresh-status="${family}"]`);
      button.disabled = true;
      if (status) status.textContent = "Starting…";
      try {
        const run = await api("/v1/metric-runs", {
          method: "POST",
          body: JSON.stringify({ family, scope: "portfolio" }),
        });
        const completed = await completeMetricRun(run);
        if (status) status.textContent = completed.state === "succeeded"
          ? "Refreshed"
          : completed.summary ?? completed.state ?? "Unavailable";
        const view = document.body.dataset.dashboardView;
        if (view === "domains") await renderDomains();
        if (view === "search") await renderSearch();
        if (view === "performance") await renderPerformance();
      } catch (error) {
        if (status) status.textContent = error instanceof Error ? error.message : "Unavailable";
      } finally {
        button.disabled = false;
      }
    });
  });
}

async function start() {
  const view = document.body.dataset.dashboardView;
  if (!view) return;
  startLocalUsageTracking({ document, window });
  document.querySelector<HTMLButtonElement>("[data-usage-export]")?.addEventListener("click", () => {
    downloadLocalUsageBundle(document, window);
  });
  // Local workspaces own their state; no provider evidence was loaded here.
  if (document.body.dataset.dashboardEvidence === "false") return;
  try {
    bindPortfolioRefresh();
    bindProjectRefreshAll();
    if (view === "projects") await renderProjects();
    if (view === "project") await renderProject();
    if (view === "domains") await renderDomains();
    if (view === "search") await renderSearch();
    if (view === "ai-awareness") await renderAiAwareness();
    if (view === "performance") await renderPerformance();
    connection?.classList.remove("offline");
    connection?.classList.add("online");
    if (connection) connection.dataset.dashboardEvidenceState = "online";
    if (connectionLabel) connectionLabel.textContent = "Live evidence";
  } catch (error) {
    const awarenessState = document.querySelector<HTMLElement>("[data-ai-awareness-state]");
    if (awarenessState) awarenessState.textContent = "Unavailable";
    const failure = element("div", { class: "error-state", role: "alert" }, [
      element("strong", {}, ["Site Health unavailable"]),
      element("span", {}, [error instanceof Error ? error.message : "Unknown backend error"]),
    ]);
    const slots: Record<string, string> = {
      projects: "project-statuses",
      project: "project-detail",
      domains: "domains",
      search: "search",
      "ai-awareness": "ai-awareness",
      performance: "performance",
    };
    if (view === "projects") {
      replace("project-summary", failure);
      replace("project-statuses", failure.cloneNode(true));
    } else if (slots[view]) replace(slots[view], failure);
    else document.querySelector<HTMLElement>("[data-dashboard-global-status]")?.replaceChildren(failure);
    connection?.classList.remove("online");
    connection?.classList.add("offline");
    if (connection) connection.dataset.dashboardEvidenceState = "offline";
    if (connectionLabel) connectionLabel.textContent = "Offline";
  }
}

void start();
