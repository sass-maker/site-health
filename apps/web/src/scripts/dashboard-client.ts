import {
  inactiveProjectState,
  isCurrentProject,
  matchesProjectFilters,
  partitionProjects,
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

function value(signal?: JsonRecord | null, suffix = "") {
  const numeric = Number(signal?.value);
  return Number.isFinite(numeric)
    ? `${numeric.toLocaleString("en", { maximumFractionDigits: 1 })}${suffix}`
    : "—";
}

async function api(path: string, options?: RequestInit) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: { accept: "application/json", "content-type": "application/json", ...options?.headers },
  });
  if (!response.ok) throw new Error("Site Health backend is unavailable.");
  return response.json();
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

function replace(slot: string, content: Node) {
  const target = document.querySelector<HTMLElement>(`[data-dashboard-slot="${slot}"]`);
  if (!target) return;
  target.className = "";
  target.removeAttribute("aria-busy");
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
]);

function signalValue(signal?: JsonRecord | null, suffix = "") {
  const numeric = Number(signal?.value);
  return Number.isFinite(numeric)
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
    element("div", { class: "outcome-metric" }, [
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
    element("div", { class: "search-result__body" }, [
      metricGrid([
        { label: "Impressions", value: value(row.impressions), detail: comparison("Search impressions", row.impressions) },
        { label: "Clicks", value: value(row.clicks), detail: comparison("Search clicks", row.clicks) },
        { label: "CTR", value: value(row.ctr, "%"), detail: comparison("Search CTR", row.ctr) },
        { label: "Position", value: value(row.averagePosition), detail: comparison("Search average position", row.averagePosition) },
      ]),
      searchTrend(row.impressions),
    ]),
    element("footer", {}, [
      element("span", {}, [`Collected ${formatted(row.observedAt)}`]),
      providerUrl
        ? element("a", { href: providerUrl, target: "_blank", rel: "noreferrer" }, ["Open this property ↗"])
        : element("span", { class: "unavailable" }, ["Console link unavailable"]),
    ]),
  ]);
}

function outcomeRows(rows: JsonRecord[], renderMetrics: (row: JsonRecord) => Node) {
  return element("div", { class: "project-directory" }, rows.map((row) =>
    element("article", { class: "project-directory__row" }, [
      element("div", { class: "project-directory__identity" }, [
        element("span", {}, [row.domain ?? row.scope ?? "Portfolio evidence"]),
        element("h3", {}, [row.name ?? row.projectName ?? row.projectId ?? row.domain]),
        element("small", { class: "project-directory__domain" }, [formatted(row.observedAt)]),
      ]),
      state(row.status),
      renderMetrics(row),
    ])));
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
    element("div", {}, [element("dt", {}, ["Current products"]), element("dd", {}, [String(current.length)]), element("small", {}, ["Active P1 and P2 owner scope"])]),
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
          state(project.status ?? project.lifecycle),
        ]),
        element("h3", {}, [project.name]),
        element("p", {}, [project.description ?? project.domains?.[0] ?? "Private project"]),
        element("small", { class: "project-directory__domain" }, [project.domains?.[0] ?? "No public domain"]),
      ]),
      element("div", { class: "evidence-matrix", "aria-label": `${project.name} site evidence` },
        evidenceByProject.get(project.id)?.map(evidenceCell) ?? []),
      element("a", { class: "project-row-action", href: projectHref(project.id), "aria-label": `View ${project.name} details` }, ["View"]),
    ])));
  const currentSection = element("section", {
    class: "project-directory-section",
    "aria-labelledby": "current-projects-title",
    "data-current-projects": "",
  }, [
    element("div", { class: "directory-section-head" }, [
      element("div", {}, [
        element("h2", { id: "current-projects-title" }, ["Current products"]),
        element("p", {}, ["Operational P1 and P2 identities with portfolio evidence."]),
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
            element("span", {}, [project.priority ?? "Unranked"]),
            state(inactiveProjectState(project)),
          ]),
          element("h3", {}, [project.name]),
          element("p", {}, [project.description ?? "Historical Fleet identity retained in the canonical catalog."]),
          element("small", { class: "project-directory__domain" }, [project.domains?.[0] ?? "No public domain"]),
        ]),
        element("a", { class: "project-row-action", href: projectHref(project.id), "aria-label": `View retained identity ${project.name}` }, ["View"]),
      ]))),
  ]);
  const directory = element("div", { class: "project-directory-groups" }, [currentSection, inactiveDetails]);
  directory.append(element("div", { class: "directory-filter-empty", "data-project-filter-empty": "", hidden: "" }, [
    element("strong", {}, ["No projects match these filters."]),
    element("span", {}, ["Clear the search or choose a broader priority or state."]),
  ]));
  replace("project-statuses", directory);
  bindProjectFilters(projects);
}

function bindProjectFilters(projects: JsonRecord[]) {
  const searchInput = document.querySelector<HTMLInputElement>("[data-project-search]");
  const priority = document.querySelector<HTMLSelectElement>("[data-project-priority]");
  const health = document.querySelector<HTMLSelectElement>("[data-project-health]");
  const reset = document.querySelector<HTMLButtonElement>("[data-project-filter-reset]");
  const result = document.querySelector<HTMLElement>("[data-project-result-count]");
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
      }) : false;
      row.hidden = !matches;
      if (matches && row.dataset.projectSection === "current") currentCount += 1;
      if (matches && row.dataset.projectSection === "inactive") inactiveCount += 1;
    });
    const currentSection = document.querySelector<HTMLElement>("[data-current-projects]");
    const inactiveDetails = document.querySelector<HTMLDetailsElement>("[data-inactive-projects]");
    const inactiveCountLabel = document.querySelector<HTMLElement>("[data-inactive-visible-count]");
    const revealInactive = Boolean(
      query || health?.value === "inactive" || priority?.value === "P4",
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
    if (result) result.textContent = `${currentCount} current · ${inactiveCount} inactive`;
  };
  if (searchInput && searchInput.dataset.projectFilterBound !== "true") {
    searchInput.dataset.projectFilterBound = "true";
    searchInput.addEventListener("input", apply);
    priority?.addEventListener("change", apply);
    health?.addEventListener("change", apply);
    reset?.addEventListener("click", () => {
      searchInput.value = "";
      if (priority) priority.value = "";
      if (health) health.value = "";
      apply();
      searchInput.focus();
    });
  }
  apply();
}

async function renderDomains() {
  const payload = await api("/v1/outcomes/domains");
  replace("domains", payload.rows.length ? outcomeRows(payload.rows, (row) => metricGrid([
    { label: "DRANK", value: value(row.signal), detail: row.signal?.history ?? "Current rating" },
    { label: "Projects", value: String(row.projects?.length ?? 0) },
  ])) : empty("No domain evidence"));
  updateOutcomeTime(payload);
}

async function renderSearch() {
  const payload = await api("/v1/outcomes/search");
  const period = payload.rows.find((row: JsonRecord) => row.period)?.period;
  const periodTarget = document.querySelector<HTMLElement>("[data-search-period]");
  if (periodTarget) periodTarget.textContent = `Google data: ${reportingPeriod(period)}`;
  replace("search", payload.rows.length
    ? element("div", { class: "search-results" }, payload.rows.map(searchResult))
    : empty("No Google Search evidence"));
  updateOutcomeTime(payload);
}

async function renderAiAwareness() {
  const payload = await api("/v1/outcomes/ai-awareness");
  replace("ai-awareness", payload.rows.length ? outcomeRows(payload.rows, (row) => metricGrid([
    { label: "Mentioned", value: value(row.mention, "%") },
    { label: "Recommended", value: value(row.recommendation, "%") },
    { label: "Cited", value: value(row.citation, "%") },
    { label: "Average rank", value: value(row.averageRank) },
  ])) : empty("No provider-backed AI evidence"));
  updateOutcomeTime(payload);
}

async function renderPerformance() {
  const payload = await api("/v1/outcomes/performance");
  replace("performance", payload.rows.length ? outcomeRows(payload.rows, (row) => metricGrid([
    { label: "PSI", value: value(row.psi) },
    { label: "LCP", value: value(row.lcp, " ms") },
  ])) : empty("No PSI evidence"));
  updateOutcomeTime(payload);
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
  const refresh = source.lastAttemptAt ? `refresh ${formatted(source.lastAttemptAt)}` : "no refresh needed";
  target.textContent = `${source.state} · evidence ${formatted(source.observedAt)} · ${refresh}${blocker}`;
}

async function renderProject() {
  const projectId = catalogProjectId(document.body.dataset.projectId);
  const [projects, domains, search, awareness, performance, capabilities] = await Promise.all([
    api("/v1/projects"),
    optionalOutcome("/v1/outcomes/domains"),
    optionalOutcome("/v1/outcomes/search"),
    optionalOutcome("/v1/outcomes/ai-awareness"),
    optionalOutcome("/v1/outcomes/performance"),
    optionalCapabilities(),
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
  const profileLinks = element("div", { class: "project-profile__links" }, [
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
    element("p", { class: "outcome-panel__note" }, [note]),
  ]);
  replace("project-detail", element("div", { class: "project-profile" }, [
    element("section", { class: "project-profile__identity" }, [
      element("div", {}, [
        element("div", { class: "project-directory__kicker" }, [
          element("span", {}, [project.priority ?? "Unranked"]),
          state(project.status ?? project.lifecycle),
          state(project.lifecycle ?? "unknown"),
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
    element("section", { class: "profile-section", "aria-labelledby": "site-evidence-title" }, [
      element("div", { class: "section-head" }, [element("div", {}, [
        element("p", { class: "eyebrow" }, ["Four independent sources"]),
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
        outcomePanel("AI Awareness / GEO", sourceStatus(awareness, aiRow?.status), signalTime(aiRow?.mention, aiRow?.recommendation), [
          { label: "Mentioned", value: sourceValue(awareness, signalValue(aiRow?.mention, "%")) },
          { label: "Recommended", value: sourceValue(awareness, signalValue(aiRow?.recommendation, "%")) },
          { label: "Cited", value: sourceValue(awareness, signalValue(aiRow?.citation, "%")) },
          { label: "Average rank", value: sourceValue(awareness, signalValue(aiRow?.averageRank)) },
          { label: "Audit trail", value: "Pending", detail: "Elmo run model" },
        ], "Provider-backed observations remain bounded and source-specific. Elmo's per-prompt, per-engine, citation, and query fan-out mechanics will deepen this audit path."),
      ]),
    ]),
    element("section", { class: "profile-section", "aria-labelledby": "capabilities-title" }, [
      element("div", { class: "section-head" }, [element("div", {}, [
        element("p", { class: "eyebrow" }, ["Operator capability layer"]),
        element("h2", { id: "capabilities-title" }, ["Fleet skills"]),
        element("p", {}, ["Applicable skills remain canonical in the workflows-and-skills repository."]),
      ])]),
      element("div", { class: "capability-ledger" }, [
        element("article", {}, [
          element("div", {}, [
            element("h3", {}, ["Applicable skills"]),
            element("p", {}, [capabilities.sources?.skills?.reason ?? "Skill capability state unavailable."]),
            element("small", {}, [(capabilities.skills ?? []).map((item: JsonRecord) => item.id).join(" · ")]),
          ]),
          state(capabilities.sources?.skills?.state),
          element("a", { href: "https://github.com/sass-maker/workflows-and-skills", target: "_blank", rel: "noreferrer" }, ["Open skill catalog ↗"]),
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
