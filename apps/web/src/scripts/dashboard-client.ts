type JsonRecord = Record<string, any>;

const base = document.querySelector<HTMLMetaElement>('meta[name="dashboard-api-base"]')?.content ?? "/api/dashboard";
const connection = document.querySelector<HTMLElement>("[data-dashboard-connection]");
const connectionLabel = document.querySelector<HTMLElement>("[data-dashboard-connection-label]");
const date = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

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

function state(value?: string | null) {
  const label = value || "not-measured";
  return element("span", { class: `state ${label}` }, [label.replaceAll("-", " ")]);
}

function value(signal?: JsonRecord | null, suffix = "") {
  return Number.isFinite(Number(signal?.value)) ? `${signal.value}${suffix}` : "—";
}

async function api(path: string, options?: RequestInit) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: { accept: "application/json", "content-type": "application/json", ...options?.headers },
  });
  if (!response.ok) throw new Error("Site Health backend is unavailable.");
  return response.json();
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

function metricGrid(items: Array<{ label: string; value: string; detail?: string }>) {
  return element("dl", { class: "outcome-metric-grid" }, items.map((item) =>
    element("div", { class: "outcome-metric" }, [
      element("dt", {}, [item.label]),
      element("dd", {}, [item.value]),
      item.detail ? element("small", {}, [item.detail]) : null,
    ])));
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
  const projects = await api("/v1/projects");
  const visible = projects
    .filter((project: JsonRecord) => project.lifecycle !== "non-product" && project.attention !== "ignored")
    .sort((left: JsonRecord, right: JsonRecord) => left.name.localeCompare(right.name));
  const timestamp = document.querySelector<HTMLElement>("[data-project-status-time]");
  if (timestamp) timestamp.textContent = `${visible.length} project records`;
  replace("project-statuses", element("div", { class: "project-directory" }, visible.map((project: JsonRecord) =>
    element("article", { class: "project-directory__row" }, [
      element("a", { class: "project-directory__identity", href: projectHref(project.id) }, [
        element("span", {}, [project.familyName ?? project.family ?? project.id]),
        element("h3", {}, [project.name]),
        element("p", {}, [project.description ?? project.domains?.[0] ?? "Private project"]),
        element("small", { class: "project-directory__domain" }, [project.domains?.[0] ?? "No public domain"]),
      ]),
      state(project.status ?? project.lifecycle),
      element("div", { class: "project-directory__actions" }, [
        project.websiteUrl ? element("a", { href: project.websiteUrl, target: "_blank", rel: "noreferrer" }, ["Open"]) : null,
        project.repositoryUrl ? element("a", { href: project.repositoryUrl, target: "_blank", rel: "noreferrer" }, ["Source"]) : null,
      ]),
    ]))));
}

async function renderDomains() {
  const payload = await api("/v1/outcomes/domains");
  replace("domains", payload.rows.length ? outcomeRows(payload.rows, (row) => metricGrid([
    { label: "DRANK", value: value(row.signal), detail: row.signal?.history ?? "Current rating" },
    { label: "Projects", value: String(row.projects?.length ?? 0) },
  ])) : empty("No domain evidence"));
  updateOutcomeTime(payload.generatedAt);
}

async function renderSearch() {
  const payload = await api("/v1/outcomes/search");
  replace("search", payload.rows.length ? outcomeRows(payload.rows, (row) => metricGrid([
    { label: "Impressions", value: value(row.impressions) },
    { label: "Clicks", value: value(row.clicks) },
    { label: "CTR", value: value(row.ctr, "%") },
    { label: "Position", value: value(row.averagePosition) },
  ])) : empty("No Google Search evidence"));
  updateOutcomeTime(payload.generatedAt);
}

async function renderAiAwareness() {
  const payload = await api("/v1/outcomes/ai-awareness");
  replace("ai-awareness", payload.rows.length ? outcomeRows(payload.rows, (row) => metricGrid([
    { label: "Mentioned", value: value(row.mention, "%") },
    { label: "Recommended", value: value(row.recommendation, "%") },
    { label: "Cited", value: value(row.citation, "%") },
    { label: "Average rank", value: value(row.averageRank) },
  ])) : empty("No provider-backed AI evidence"));
  updateOutcomeTime(payload.generatedAt);
}

async function renderPerformance() {
  const payload = await api("/v1/outcomes/performance");
  replace("performance", payload.rows.length ? outcomeRows(payload.rows, (row) => metricGrid([
    { label: "PSI", value: value(row.psi) },
    { label: "LCP", value: value(row.lcp, " ms") },
  ])) : empty("No PSI evidence"));
  updateOutcomeTime(payload.generatedAt);
}

function updateOutcomeTime(timestamp?: string) {
  const target = document.querySelector<HTMLElement>("[data-outcome-time]");
  if (target) target.textContent = formatted(timestamp);
}

async function renderProject() {
  const projectId = catalogProjectId(document.body.dataset.projectId);
  const [projects, domains, search, awareness, performance] = await Promise.all([
    api("/v1/projects"),
    api("/v1/outcomes/domains"),
    api("/v1/outcomes/search"),
    api("/v1/outcomes/ai-awareness"),
    api("/v1/outcomes/performance"),
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
  replace("project-detail", element("div", { class: "project-metrics-workspace" }, [
    element("section", { class: "owner-section" }, [
      element("h2", {}, ["Project"]),
      metricGrid([
        { label: "Lifecycle", value: project.lifecycle ?? "unknown" },
        { label: "Priority", value: project.priority ?? "unranked" },
        { label: "Domain", value: project.domains?.[0] ?? "none" },
      ]),
    ]),
    element("section", { class: "owner-section" }, [element("h2", {}, ["Domains"]), metricGrid([
      { label: "DRANK", value: value(domain?.signal) },
    ])]),
    element("section", { class: "owner-section" }, [element("h2", {}, ["Google Search"]), metricGrid([
      { label: "Impressions", value: value(searchRow?.impressions) },
      { label: "Clicks", value: value(searchRow?.clicks) },
    ])]),
    element("section", { class: "owner-section" }, [element("h2", {}, ["AI Awareness"]), metricGrid([
      { label: "Mentioned", value: value(aiRow?.mention, "%") },
      { label: "Recommended", value: value(aiRow?.recommendation, "%") },
    ])]),
    element("section", { class: "owner-section" }, [element("h2", {}, ["Performance"]), metricGrid([
      { label: "PSI", value: value(performanceRow?.psi) },
      { label: "LCP", value: value(performanceRow?.lcp, " ms") },
    ])]),
  ]));
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
        if (status) status.textContent = run.summary ?? "Started";
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
    if (view === "projects") await renderProjects();
    if (view === "project") await renderProject();
    if (view === "domains") await renderDomains();
    if (view === "search") await renderSearch();
    if (view === "ai-awareness") await renderAiAwareness();
    if (view === "performance") await renderPerformance();
    connection?.classList.add("online");
    if (connectionLabel) connectionLabel.textContent = "Live evidence";
  } catch (error) {
    document.querySelector<HTMLElement>("[data-dashboard-global-status]")?.replaceChildren(
      element("div", { class: "error-state" }, [
        element("strong", {}, ["Site Health unavailable"]),
        element("span", {}, [error instanceof Error ? error.message : "Unknown backend error"]),
      ]),
    );
    connection?.classList.add("offline");
    if (connectionLabel) connectionLabel.textContent = "Offline";
  }
}

void start();
