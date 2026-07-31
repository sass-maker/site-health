type JsonRecord = Record<string, any>;

const base = document.querySelector<HTMLMetaElement>('meta[name="founder-api-base"]')?.content ?? "/api/founder";
const connection = document.querySelector<HTMLElement>("[data-founder-connection]");
const connectionLabel = document.querySelector<HTMLElement>("[data-founder-connection-label]");
const date = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
const day = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "Asia/Kolkata" });
let selectedProjectId = "";
let selectedProjectName = "All projects";

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

function svgElement<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attributes: Record<string, string> = {},
  children: SVGElement[] = [],
) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  node.append(...children);
  return node;
}

function state(value: string) {
  return element("span", { class: `state ${value}` }, [value.replaceAll("-", " ")]);
}

function formatted(value?: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return "No verified time";
  return date.format(new Date(value));
}

function formattedDay(value?: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return "No verified date";
  return day.format(new Date(value));
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: value >= 10_000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}

function bytes(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0 B";
  if (value < 1024) return `${value} B`;
  return `${(value / 1024).toFixed(value < 10 * 1024 ? 1 : 0)} KB`;
}

function titleCase(value: string) {
  return value
    .replaceAll("-", " ")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function api(path: string) {
  const response = await fetch(`${base}${path}`, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(response.status === 404 ? "No matching record was found." : "The local control service is unavailable.");
  return response.json();
}

async function mutate(path: string, body: JsonRecord) {
  const response = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error ?? "The owner action was not accepted.");
  return result;
}

function empty(message: string, detail: string) {
  return element("div", { class: "empty-state" }, [element("strong", {}, [message]), element("span", {}, [detail])]);
}

function errorState(error: unknown) {
  return element("div", { class: "error-state" }, [
    element("strong", {}, ["Local evidence unavailable"]),
    element("span", {}, [error instanceof Error ? error.message : "The control loop did not return a readable response."]),
    element("small", {}, ["Start it with: node foundry/ops/scripts/founder-control.mjs serve"]),
  ]);
}

function replace(id: string, content: Node) {
  const target = document.querySelector<HTMLElement>(`[data-founder-slot="${id}"]`);
  if (target) {
    target.className = "";
    target.setAttribute("aria-busy", "false");
    target.replaceChildren(content);
  }
}

function missionHref(id: string) {
  return `/missions?id=${encodeURIComponent(id)}`;
}

function projectHref(id: string) {
  const aliases: Record<string, string> = { "fleet-workspace": "fleet-ops" };
  return `/projects/${aliases[id] ?? id}`;
}

function catalogProjectId(id?: string) {
  return id === "fleet-ops" ? "fleet-workspace" : id;
}

function consoleHref(value?: string | null) {
  if (!value) return "/metrics";
  const normalized = value.replace(/^\/connections/, "/metrics");
  if (!selectedProjectId || normalized.startsWith("/projects/")) return normalized;
  const url = new URL(normalized, window.location.origin);
  url.searchParams.set("project", selectedProjectId);
  return `${url.pathname}${url.search}${url.hash}`;
}

async function initProjectScope() {
  const select = document.querySelector<HTMLSelectElement>("[data-project-scope-select]");
  if (!select) return;
  const projects = await api("/v1/projects");
  const active = projects
    .filter(
      (project: JsonRecord) =>
        project.lifecycle === "maintained" &&
        (project.publicListing === "maintained" ||
          project.metricEligibility?.publicSite === true),
    )
    .sort((left: JsonRecord, right: JsonRecord) => left.name.localeCompare(right.name));
  const requested = new URLSearchParams(window.location.search).get("project") ?? "";
  const selected = active.find((project: JsonRecord) => project.id === requested);
  selectedProjectId = selected?.id ?? "";
  selectedProjectName = selected?.name ?? "All projects";
  for (const project of active) {
    select.append(element("option", { value: project.id }, [project.name]));
  }
  select.value = selectedProjectId;
  const label = document.querySelector<HTMLElement>("[data-project-scope-label]");
  if (label) label.textContent = selectedProjectName;
  const syncLinks = () => {
    document.querySelectorAll<HTMLAnchorElement>("[data-project-scope-link]").forEach((link) => {
      const url = new URL(link.href, window.location.origin);
      if (selectedProjectId) url.searchParams.set("project", selectedProjectId);
      else url.searchParams.delete("project");
      link.href = `${url.pathname}${url.search}${url.hash}`;
    });
  };
  syncLinks();
  select.addEventListener("change", () => {
    const url = new URL(window.location.href);
    if (select.value) url.searchParams.set("project", select.value);
    else url.searchParams.delete("project");
    window.location.assign(`${url.pathname}${url.search}${url.hash}`);
  });
}

function missionRecord(mission: JsonRecord) {
  const link = element("a", { class: "record", href: missionHref(mission.id) });
  const main = element("div", { class: "record-main" }, [
    element("div", { class: "record-kicker" }, [mission.projectId ?? "Portfolio", " · ", formatted(mission.updatedAt)]),
    element("h3", {}, [mission.title]),
    element("p", {}, [mission.latestSummary || mission.outcome || "No progress summary yet."]),
  ]);
  const side = element("div", { class: "record-side" }, [
    state(mission.state),
    element("small", {}, [mission.actor?.label ?? mission.actor?.id ?? "Unassigned"]),
  ]);
  link.append(main, side);
  return link;
}

function decisionCard(decision: JsonRecord) {
  const status = element("span", { class: "action-status", role: "status", "aria-live": "polite" });
  const actions = element("div", { class: "decision-actions" });
  if (["open", "stale"].includes(decision.state)) {
    for (const response of decision.allowedResponses ?? []) {
      const button = element(
        "button",
        { type: "button", class: response === "approve" ? "primary-action" : "secondary-action" },
        [response],
      );
      button.addEventListener("click", async () => {
        button.setAttribute("disabled", "");
        status.textContent = "Saving…";
        try {
          await mutate(`/v1/decisions/${encodeURIComponent(decision.id)}/respond`, { response });
          status.textContent = "Decision recorded.";
          location.reload();
        } catch (error) {
          status.textContent = error instanceof Error ? error.message : "Decision failed.";
          button.removeAttribute("disabled");
        }
      });
      actions.append(button);
    }
  }
  return element("article", { class: "decision" }, [
    element("div", {}, [
      element("div", { class: "record-kicker" }, [decision.projectId ?? "Portfolio", " · ", formatted(decision.updatedAt)]),
      state(decision.state),
      element("h3", {}, [decision.question]),
      element("p", {}, [decision.why]),
    ]),
    element("footer", {}, [
      element("div", {}, [
        element("span", {}, [decision.reversible ? "Reversible" : "Hard to reverse"]),
        status,
      ]),
      element("div", { class: "decision-footer-actions" }, [
        actions,
        decision.missionId ? element("a", { class: "action-link", href: missionHref(decision.missionId) }, ["Open mission"]) : null,
      ]),
    ]),
  ]);
}

function activityItem(item: JsonRecord) {
  const evidence = element("div", { class: "evidence" });
  for (const pointer of item.evidence ?? []) {
    const label = `${pointer.provider} · ${pointer.state}`;
    evidence.append(pointer.url ? element("a", { href: pointer.url, target: "_blank", rel: "noreferrer" }, [label]) : element("span", {}, [label]));
  }
  return element("article", { class: "timeline-item" }, [
    element("h3", {}, [item.summary]),
    element("p", {}, [`${item.projectId ?? "Portfolio"} · ${item.type.replaceAll(".", " ")}`]),
    element("time", { datetime: item.occurredAt }, [formatted(item.occurredAt)]),
    evidence,
  ]);
}

function connectionStat(label: string, value: string | number, tone: string) {
  return element("div", { class: `connection-stat connection-stat--${tone}` }, [
    element("strong", {}, [String(value)]),
    element("span", {}, [label]),
  ]);
}

function connectionSummary(summary: JsonRecord, { compact = false } = {}) {
  return element("div", { class: compact ? "connection-summary connection-summary--compact" : "connection-summary" }, [
    connectionStat("Connected", summary.connected ?? 0, "connected"),
    connectionStat("Partial", summary.partial ?? 0, "partial"),
    connectionStat("Missing", summary.missing ?? 0, "missing"),
    connectionStat("Stale evidence", summary.stale ?? 0, "stale"),
    connectionStat("Unavailable", summary.unavailable ?? 0, "unavailable"),
    connectionStat("Transport coverage", `${summary.connected ?? 0}/${summary.total ?? 0} · ${summary.coverage ?? 0}%`, "coverage"),
  ]);
}

function bucketTile(bucket: JsonRecord, terminal = false) {
  const components = element("ul", { class: "bucket-components" });
  for (const component of bucket.components ?? []) {
    const componentState = component.freshness === "stale" ? "stale" : component.status;
    const componentStateLabel =
      component.freshness === "stale"
        ? "evidence stale"
        : `path ${component.status}`;
    components.append(element("li", {}, [
      element("span", {}, [component.name]),
      element("span", { class: `component-state component-state--${componentState}` }, [componentStateLabel]),
      element("small", {}, [component.headline]),
    ]));
  }
  return element("article", {
    class: terminal ? "bucket-tile bucket-tile--terminal" : "bucket-tile",
    id: `bucket-${bucket.id}`,
  }, [
    element("header", {}, [
      element("span", { class: "bucket-label" }, [bucket.label]),
      state(bucket.status),
    ]),
    element("h3", {}, [bucket.purpose]),
    components,
  ]);
}

function connectionMap(payload: JsonRecord) {
  const sourceBuckets = payload.buckets.filter((bucket: JsonRecord) => bucket.id !== "dashboard");
  const dashboard = payload.buckets.find((bucket: JsonRecord) => bucket.id === "dashboard");
  return element("div", { class: "connection-system" }, [
    connectionSummary(payload.summary),
    element("div", { class: "connection-legend" }, [
      element("span", {}, [element("strong", {}, ["Transport"]), " = implemented path"]),
      element("span", {}, [element("strong", {}, ["Evidence"]), " = freshness or observed outcome"]),
    ]),
    element("div", { class: "system-map" }, [
      element("div", { class: "bucket-sources" }, sourceBuckets.map((bucket: JsonRecord) => bucketTile(bucket))),
      element("div", { class: "system-flow", "aria-hidden": "true" }, [
        element("span", {}, ["Evidence"]),
        element("i"),
        element("span", {}, ["Owner view"]),
      ]),
      dashboard ? bucketTile(dashboard, true) : null,
    ]),
  ]);
}

function connectionGap(item: JsonRecord) {
  const displayedState = item.freshness === "stale" ? "stale" : item.status;
  return element("a", { class: "record connection-gap", href: consoleHref(item.ownerPath) }, [
    element("div", { class: "record-main" }, [
      element("div", { class: "record-kicker" }, [item.provider, " → ", item.consumer]),
      element("h3", {}, [item.detail]),
      element("p", {}, [item.transport]),
    ]),
    element("div", { class: "record-side" }, [
      state(displayedState),
      element("small", {}, [item.freshness === "not-applicable" ? "Contract state" : item.freshness]),
    ]),
  ]);
}

function connectionLedgerItem(item: JsonRecord) {
  const displayedState = item.freshness === "stale" ? "stale" : item.status;
  const evidence = item.evidence?.length
    ? element("div", { class: "connection-evidence-list" }, item.evidence.map((pointer: JsonRecord) =>
        element("div", {}, [
          element("span", {}, [pointer.label]),
          element("small", {}, [formatted(pointer.observedAt), " · ", pointer.freshness]),
        ])))
    : element("p", { class: "connection-no-evidence" }, ["No durable evidence is attached to this transport yet."]);
  return element("details", { class: "connection-row", id: item.id }, [
    element("summary", {}, [
      element("div", { class: "connection-route" }, [
        element("strong", {}, [item.provider]),
        element("span", { "aria-hidden": "true" }, ["→"]),
        element("strong", {}, [item.consumer]),
      ]),
      element("span", { class: "connection-transport" }, [item.transport]),
      state(displayedState),
    ]),
    element("div", { class: "connection-detail" }, [
      element("p", {}, [item.detail]),
      evidence,
      element("a", { class: "action-link", href: consoleHref(item.ownerPath) }, ["Open owning surface"]),
    ]),
  ]);
}

function revealTargetedConnection() {
  const targetId = decodeURIComponent(window.location.hash.slice(1));
  if (!targetId) return;
  const target = document.getElementById(targetId);
  const sheet = document.querySelector<HTMLDialogElement>("[data-system-sheet]");
  if (target && sheet?.contains(target) && !sheet.open) sheet.showModal();
  if (target instanceof HTMLDetailsElement) {
    target.open = true;
    target.scrollIntoView({ block: "start" });
    target.querySelector("summary")?.focus({ preventScroll: true });
  }
}

function wireSystemSheet() {
  const sheet = document.querySelector<HTMLDialogElement>("[data-system-sheet]");
  const open = document.querySelector<HTMLButtonElement>("[data-system-sheet-open]");
  const close = document.querySelector<HTMLButtonElement>("[data-system-sheet-close]");
  if (!sheet || !close) return;
  open?.addEventListener("click", () => sheet.showModal());
  close.addEventListener("click", () => sheet.close());
  sheet.addEventListener("click", (event) => {
    if (event.target === sheet) sheet.close();
  });
}

function evidenceMetric(label: string, value: string | number, detail: string) {
  return element("div", { class: "evidence-metric" }, [
    element("span", {}, [label]),
    element("strong", {}, [String(value)]),
    element("small", {}, [detail]),
  ]);
}

function connectionEvidence(payload: JsonRecord) {
  const skillRuns = payload.evidence.skillRuns;
  const workflows = payload.evidence.publicWorkflows;
  const domains = payload.evidence.domainIntelligence;
  return element("div", { class: "connection-evidence-grid" }, [
    element("article", { id: "skill-runs" }, [
      element("header", {}, [element("h3", {}, ["Skill runs"]), state(skillRuns.runCount > 0 ? "connected" : "unavailable")]),
      element("div", { class: "evidence-metrics" }, [
        evidenceMetric("Recorded runs", skillRuns.runCount, "Sanitized, machine-local"),
        evidenceMetric("Numeric observations", skillRuns.metricCount, "Available for project histories"),
      ]),
      element("p", {}, [skillRuns.newestRunAt ? `Newest evidence ${formatted(skillRuns.newestRunAt)}` : "No run evidence is readable."]),
    ]),
    element("article", { id: "public-evidence" }, [
      element("header", {}, [element("h3", {}, ["Public surfaces"]), state(workflows.sites > 0 ? "connected" : "unavailable")]),
      element("div", { class: "evidence-metrics" }, [
        evidenceMetric("Audited sites", workflows.sites, "Public workflow manifest"),
        evidenceMetric("Failing", workflows.failed, "At least one current report"),
      ]),
      element("p", {}, [workflows.reports.length ? `Newest report ${formatted(workflows.reports.map((item: JsonRecord) => item.observedAt).filter(Boolean).sort().at(-1))}` : "No public workflow report is readable."]),
    ]),
    element("article", { id: "domain-intelligence" }, [
      element("header", {}, [element("h3", {}, ["Domain intelligence"]), state(domains.drank.domains > 0 || domains.psi.runs > 0 ? "connected" : "unavailable")]),
      element("div", { class: "evidence-metrics" }, [
        evidenceMetric("Drank domains", domains.drank.domains, domains.drank.freshness),
        evidenceMetric("PSI runs", domains.psi.runs, `${domains.psi.tags} tagged groups`),
      ]),
      element("p", {}, ["Drank and PSI retain their domain logic; Console receives bounded summaries."]),
    ]),
  ]);
}

function outputMeasure(label: string, value: string | number, detail: string, tone = "") {
  return element("div", { class: `output-measure${tone ? ` output-measure--${tone}` : ""}` }, [
    element("strong", {}, [String(value)]),
    element("span", {}, [label]),
    element("small", {}, [detail]),
  ]);
}

function outputOverview(payload: JsonRecord, { compact = false } = {}) {
  const summary = payload.outputs.summary;
  const boundaries = payload.outputs.boundaries;
  const skillRunDetail = [
    `${summary.successfulSkillRuns} succeeded`,
    `${summary.failedSkillRuns} failed`,
    summary.otherSkillRuns ? `${summary.otherSkillRuns} other` : "",
  ].filter(Boolean).join(" · ");
  const measures = element("div", { class: compact ? "output-measures output-measures--compact" : "output-measures" }, [
    outputMeasure("Skill runs", summary.skillRuns, skillRunDetail, "success"),
    outputMeasure("Captured outputs", summary.capturedOutputs, bytes(summary.capturedOutputBytes), "accent"),
    outputMeasure("Measured values", summary.measuredValues, "Structured numeric observations"),
    outputMeasure("Projects producing", `${summary.projectsProducing}/${summary.projectsTracked}`, "At least one recorded result"),
    outputMeasure("Public surfaces", `${summary.publicSitesPassed}/${summary.publicSites}`, "Latest checks passed", summary.publicSitesPassed === summary.publicSites ? "success" : "warning"),
    outputMeasure("PSI measurements", compactNumber(summary.performanceRuns), `${summary.domainHistories} domain histories`),
  ]);
  if (compact) return measures;
  return element("div", { class: "output-system" }, [
    measures,
    element("div", { class: "output-boundaries" }, [
      element("div", {}, [
        element("strong", {}, ["AI Visibility"]),
        state(boundaries.aiVisibility.status),
        element("span", {}, [`${boundaries.aiVisibility.observations}/${boundaries.aiVisibility.configured} project baselines`]),
      ]),
      element("div", {}, [
        element("strong", {}, ["Feedback"]),
        state(boundaries.feedback.status),
        element("span", {}, [boundaries.feedback.detail]),
      ]),
      element("div", {}, [
        element("strong", {}, ["Marketing outcomes"]),
        state(boundaries.marketing.status),
        element("span", {}, [boundaries.marketing.detail]),
      ]),
    ]),
  ]);
}

function projectScopeOverview(project: JsonRecord) {
  return element("div", { class: "project-scope-overview" }, [
    element("div", { class: "output-measures output-measures--compact" }, [
      outputMeasure("Recorded results", project.produced.length, "Current provider observations"),
      outputMeasure("Historical signals", project.history.signals.length, project.history.state),
      outputMeasure("Skill runs", project.skill?.runCount ?? 0, `${project.skill?.outputCount ?? 0} captured outputs`),
      outputMeasure("Last observed", project.lastObservedAt ? formatted(project.lastObservedAt) : "—", project.name),
    ]),
  ]);
}

function metricOverview(payload: JsonRecord, project?: JsonRecord | null) {
  if (project) {
    const comparable = project.history.signals.filter((signal: JsonRecord) => signal.series?.length >= 2);
    const improvements = payload.outputs.improvements.filter((item: JsonRecord) => item.projectId === project.projectId);
    return element("div", { class: "output-measures" }, [
      outputMeasure("Current results", project.produced.filter((item: JsonRecord) => item.kind !== "skill").length, project.name),
      outputMeasure("Numeric series", project.history.signals.length, "Retained observations"),
      outputMeasure("Comparable histories", comparable.length, comparable.length ? "Graphable now" : "Baselines only"),
      outputMeasure("Improvement actions", improvements.length, improvements.length ? "Produced by current evidence" : "None recorded"),
      outputMeasure("PSI runs", project.performance?.runs ?? 0, project.performance?.domain ?? "No PSI history"),
      outputMeasure("D-Rank observations", project.domainRating?.observations ?? 0, project.domainRating?.domain ?? "No domain history"),
    ]);
  }
  const comparableProjects = payload.outputs.projects.filter((item: JsonRecord) => item.history.state === "comparable").length;
  return element("div", { class: "output-measures" }, [
    outputMeasure("Measured values", payload.outputs.summary.measuredValues, "Structured numeric observations"),
    outputMeasure("Comparable projects", `${comparableProjects}/${payload.outputs.summary.projectsTracked}`, "At least one historical signal"),
    outputMeasure("Public surfaces", `${payload.outputs.summary.publicSitesPassed}/${payload.outputs.summary.publicSites}`, "Latest checks passed"),
    outputMeasure("PSI measurements", compactNumber(payload.outputs.summary.performanceRuns), `${payload.evidence.domainIntelligence.psi.tags} tagged groups`),
    outputMeasure("D-Rank histories", payload.outputs.summary.domainHistories, payload.evidence.domainIntelligence.drank.freshness),
    outputMeasure("AI visibility", `${payload.outputs.boundaries.aiVisibility.observations}/${payload.outputs.boundaries.aiVisibility.configured}`, "Recorded project baselines"),
  ]);
}

function outputRun(run: JsonRecord) {
  const metrics = run.metrics?.length
    ? run.metrics.map((metric: JsonRecord) =>
        `${titleCase(metric.metricName)} ${compactNumber(metric.value)}${metric.unit ? ` ${metric.unit}` : ""}`,
      ).join(" · ")
    : "";
  const result = element("div", { class: "skill-ledger__result", role: "cell" }, [
    element("strong", {}, [run.resultSummary]),
    metrics ? element("small", {}, [metrics]) : null,
  ]);
  if (run.outputCount > 0) {
    const body = element("div", { class: "skill-run-output__body" }, [
      element("span", {}, ["Open to load retained output"]),
    ]);
    const disclosure = element("details", { class: "skill-run-output" }, [
      element("summary", {}, [`View output (${run.outputCount})`]),
      body,
    ]);
    let loaded = false;
    disclosure.addEventListener("toggle", async () => {
      if (!disclosure.open || loaded) return;
      loaded = true;
      body.replaceChildren(element("span", {}, ["Loading retained output…"]));
      try {
        const payload = await api(`/v1/skill-runs/${encodeURIComponent(run.runId)}/output`);
        body.replaceChildren(...payload.streams.map((stream: JsonRecord) =>
          element("section", { class: "skill-run-output__stream" }, [
            element("header", {}, [
              element("strong", {}, [titleCase(stream.kind)]),
              stream.truncated ? element("span", {}, ["Truncated"]) : null,
            ]),
            element("pre", {}, [stream.content || "No retained text"]),
          ]),
        ));
      } catch (error) {
        loaded = false;
        body.replaceChildren(errorState(error));
      }
    });
    result.append(disclosure);
  }
  return element("div", { class: "skill-ledger__row", role: "row" }, [
    element("time", { class: "skill-ledger__time", role: "cell", datetime: run.observedAt }, [
      formatted(run.observedAt),
    ]),
    element("span", { class: "skill-ledger__project", role: "cell" }, [run.projectId ?? "Portfolio"]),
    element("strong", { class: "skill-ledger__skill", role: "cell" }, [titleCase(run.skillId)]),
    result,
    element("div", { class: "skill-ledger__status", role: "cell" }, [state(run.status)]),
  ]);
}

function skillLedger(runs: JsonRecord[]) {
  return element("div", { class: "skill-ledger", role: "table", "aria-label": "Skill run history" }, [
    element("div", { class: "skill-ledger__head", role: "row" }, [
      element("span", { role: "columnheader" }, ["Time"]),
      element("span", { role: "columnheader" }, ["Project"]),
      element("span", { role: "columnheader" }, ["Skill"]),
      element("span", { role: "columnheader" }, ["Result"]),
      element("span", { role: "columnheader" }, ["Outcome"]),
    ]),
    ...runs.map(outputRun),
  ]);
}

function skillHistoryForRuns(runs: JsonRecord[]) {
  const periods = new Map<string, JsonRecord>();
  for (const run of runs) {
    const period = String(run.observedAt).slice(0, 10);
    const entry = periods.get(period) ?? { period, runs: 0, succeeded: 0, failed: 0 };
    entry.runs += 1;
    if (["succeeded", "backfilled"].includes(run.status)) entry.succeeded += 1;
    if (run.status === "failed") entry.failed += 1;
    periods.set(period, entry);
  }
  return [...periods.values()]
    .sort((left, right) => left.period.localeCompare(right.period))
    .slice(-14);
}

function outputPriority(item: JsonRecord) {
  return element("a", { class: "output-priority", href: consoleHref(item.work?.ownerPath ?? item.ownerPath) }, [
    element("span", {}, [item.scope === "project" ? item.projectId : "System"]),
    element("strong", {}, [item.action]),
    element("small", {}, [item.signal]),
    state(item.work?.state ?? "not-started"),
  ]);
}

function resultValue(item: JsonRecord) {
  const problem = String(item.value).toLowerCase() === "failed" || String(item.detail).includes("failed");
  return element("div", { class: problem ? "project-result project-result--problem" : "project-result" }, [
    element("span", {}, [item.label]),
    element("strong", {}, [String(item.value)]),
    element("small", {}, [item.detail]),
    item.observedAt
      ? element("small", { class: "project-result__observed" }, [
          `${formatted(item.observedAt)} · ${item.freshness ?? "unknown"}`,
        ])
      : null,
  ]);
}

function historySignal(signal: JsonRecord) {
  if (signal.series?.length >= 2) return historyChart(signal);
  const hasDelta = Number.isFinite(signal.delta);
  const favorable =
    hasDelta &&
    ((signal.direction === "higher-is-better" && signal.delta > 0) ||
      (signal.direction === "lower-is-better" && signal.delta < 0));
  const unfavorable =
    hasDelta &&
    ((signal.direction === "higher-is-better" && signal.delta < 0) ||
      (signal.direction === "lower-is-better" && signal.delta > 0));
  let delta = "No history";
  if (signal.history === "baseline-only") delta = "Baseline only";
  if (hasDelta) {
    delta = signal.delta === 0 ? "No change" : metricDeltaValue(signal.delta, signal.unit);
  }
  return element("div", { class: "history-signal" }, [
    element("span", {}, [signal.label]),
    element("strong", {}, [
      Number.isFinite(signal.value) ? metricValue(signal.value, signal.unit) : "—",
    ]),
    element("small", { class: favorable ? "positive" : unfavorable ? "negative" : "" }, [delta]),
    element("small", { class: "history-signal__source" }, [
      `${signal.source ?? "Recorded evidence"} · ${formatted(signal.observedAt)}`,
    ]),
  ]);
}

function metricValue(value: number, unit?: string | null) {
  const absolute = Math.abs(value);
  const maximumFractionDigits = absolute > 0 && absolute < .01 ? 4 : absolute < 1 ? 3 : absolute < 100 ? 2 : 1;
  const formattedValue = new Intl.NumberFormat("en", { maximumFractionDigits }).format(value);
  if (unit === "percent") return `${formattedValue}%`;
  if (unit === "rank") return `#${formattedValue}`;
  if (unit === "milliseconds") return `${formattedValue} ms`;
  if (unit === "runs") return `${formattedValue} ${Math.abs(value) === 1 ? "run" : "runs"}`;
  if (unit === "class") return ({ 3: "Own domain top 3", 2: "Partial page one", 1: "Absent" } as Record<number, string>)[Math.round(value)] ?? "—";
  if (unit?.startsWith("score/")) return `${formattedValue}/${unit.slice("score/".length)}`;
  return `${formattedValue}${unit ? ` ${unit}` : ""}`;
}

function metricDeltaValue(value: number, unit?: string | null) {
  const absolute = metricValue(Math.abs(value), unit);
  if (unit === "rank") return `${value > 0 ? "+" : value < 0 ? "-" : ""}${absolute.slice(1)} positions`;
  if (unit === "class") return `${value > 0 ? "+" : value < 0 ? "-" : ""}${Math.abs(value)} ${Math.abs(value) === 1 ? "class" : "classes"}`;
  return `${value > 0 ? "+" : value < 0 ? "-" : ""}${absolute}`;
}

function historyChart(signal: JsonRecord, options: JsonRecord = {}) {
  const series = signal.series
    .filter((point: JsonRecord) => Number.isFinite(point.value) && point.observedAt)
    .slice(-60);
  const values = series.map((point: JsonRecord) => Number(point.value));
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const spread = maximum - minimum || Math.max(Math.abs(maximum) * .1, 1);
  const width = 360;
  const height = 112;
  const inset = 8;
  const points = series.map((point: JsonRecord, index: number) => {
    const x = inset + (index / Math.max(1, series.length - 1)) * (width - inset * 2);
    const y = height - inset - ((Number(point.value) - minimum) / spread) * (height - inset * 2);
    return { x, y, ...point };
  });
  const start = Number(series[0].value);
  const current = Number(series.at(-1).value);
  const total = values.reduce((sum: number, value: number) => sum + value, 0);
  const change = current - start;
  const percentage = start === 0 || signal.unit === "class"
    ? null
    : (change / Math.abs(start)) * 100;
  const favorable =
    (signal.direction === "higher-is-better" && change > 0) ||
    (signal.direction === "lower-is-better" && change < 0);
  const unfavorable =
    (signal.direction === "higher-is-better" && change < 0) ||
    (signal.direction === "lower-is-better" && change > 0);
  const changeLabel = favorable ? "Improved" : unfavorable ? "Worsened" : change === 0 ? "No net change" : "Changed";
  const changeText = `${changeLabel}${change === 0 ? "" : ` ${metricDeltaValue(change, signal.unit)}`}${
    Number.isFinite(percentage) ? ` · ${percentage > 0 ? "+" : ""}${Math.round(percentage * 10) / 10}%` : ""
  }`;
  const aggregate = options.aggregate === "sum";
  const chart = svgElement("svg", {
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-label": aggregate
      ? `${signal.label}: ${metricValue(total, signal.unit)} total across ${series.length} periods; latest ${metricValue(current, signal.unit)}.`
      : `${signal.label} changed from ${metricValue(start, signal.unit)} to ${metricValue(current, signal.unit)} across ${series.length} observations.`,
    preserveAspectRatio: "none",
  }, [
    svgElement("line", { x1: String(inset), y1: String(height - inset), x2: String(width - inset), y2: String(height - inset), class: "history-chart__axis" }),
    svgElement("polyline", { points: points.map((point: JsonRecord) => `${point.x},${point.y}`).join(" "), class: "history-chart__line" }),
  ]);
  const tooltip = element("div", { class: "history-chart__tooltip", role: "status" });
  tooltip.hidden = true;
  const plot = element("div", { class: "history-chart__plot" }, [chart, tooltip]);
  plot.addEventListener("pointermove", (event) => {
    const bounds = plot.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - bounds.left) / Math.max(1, bounds.width)));
    const point = points[Math.round(ratio * Math.max(0, points.length - 1))];
    tooltip.textContent = `${formatted(point.observedAt)} · ${metricValue(Number(point.value), signal.unit)}`;
    tooltip.style.left = `${Math.max(8, Math.min(92, (point.x / width) * 100))}%`;
    tooltip.style.top = `${Math.max(12, Math.min(88, (point.y / height) * 100))}%`;
    tooltip.hidden = false;
  });
  plot.addEventListener("pointerleave", () => {
    tooltip.hidden = true;
  });
  return element("article", { class: "history-chart" }, [
    element("header", {}, [
      element("div", {}, [
        element("span", {}, [titleCase(signal.label)]),
        element("strong", {}, [metricValue(aggregate ? total : current, signal.unit)]),
      ]),
      element("small", { class: aggregate ? "" : favorable ? "positive" : unfavorable ? "negative" : "" }, [
        aggregate ? `${metricValue(current, signal.unit)} latest` : changeText,
      ]),
    ]),
    plot,
    element("footer", {}, [
      element("span", {}, [aggregate ? `${series.length} ${series.length === 1 ? "period" : "periods"}` : `Started ${metricValue(start, signal.unit)}`]),
      element("span", {}, [aggregate ? `First ${metricValue(start, signal.unit)}` : `${series.length} observations`]),
      element("span", {}, [
        `${aggregate ? formattedDay(series[0].observedAt) : formatted(series[0].observedAt)} → ${
          aggregate ? formattedDay(series.at(-1).observedAt) : formatted(series.at(-1).observedAt)
        }`,
      ]),
      signal.source ? element("span", {}, [signal.source]) : null,
    ]),
  ]);
}

function skillOutcomeCharts(history: JsonRecord[]) {
  const series = (field: "succeeded" | "failed") => history.map((period: JsonRecord) => ({
    observedAt: `${period.period}T00:00:00.000Z`,
    value: Number(period[field] ?? 0),
  }));
  return element("div", { class: "skill-outcome-charts" }, [
    historyChart(
      { label: "Successful runs", unit: "runs", direction: "higher-is-better", series: series("succeeded") },
      { aggregate: "sum" },
    ),
    historyChart(
      { label: "Failed runs", unit: "runs", direction: "lower-is-better", series: series("failed") },
      { aggregate: "sum" },
    ),
  ]);
}

function projectOutput(project: JsonRecord) {
  const summaryResults = project.produced.slice(0, 3);
  const detail = element("div", { class: "project-output__detail" }, [
    element("div", { class: "project-results-grid" }, project.produced.length
      ? project.produced.map(resultValue)
      : [empty("No recorded output", "No current provider has produced evidence for this project.")]),
    element("div", { class: "project-history-grid" }, project.history.signals.length
      ? project.history.signals.map(historySignal)
      : [empty("No historical output", "A second comparable observation is required before Fleet can show movement.")]),
    element("a", { class: "action-link", href: projectHref(project.projectId) }, ["Open project"]),
  ]);
  const details = element("details", { class: "project-output" }, [
    element("summary", {}, [
      element("div", { class: "project-output__identity" }, [
        element("strong", {}, [project.name]),
        element("small", {}, [project.lastObservedAt ? formatted(project.lastObservedAt) : "No recorded observation"]),
      ]),
      element("div", { class: "project-output__summary" }, summaryResults.length
        ? summaryResults.map((item: JsonRecord) =>
            element("span", {
              class: String(item.value).toLowerCase() === "failed" || String(item.detail).includes("failed")
                ? "problem"
                : "",
            }, [item.label, " ", element("strong", {}, [String(item.value)])]))
        : [element("span", {}, ["No output"])],
      ),
      element("div", { class: "project-output__side" }, [
        state(project.history.state),
        element("span", {}, ["Inspect"]),
      ]),
    ]),
    detail,
  ]);
  if (selectedProjectId === project.projectId) details.setAttribute("open", "");
  return details;
}

function projectOutputCollection(projects: JsonRecord[]) {
  const visible = projects.slice(0, 8);
  const remaining = projects.slice(8);
  const list = element("div", { class: "project-output-list" }, visible.map(projectOutput));
  if (remaining.length > 0) {
    list.append(element("details", { class: "project-output-more" }, [
      element("summary", {}, [
        element("strong", {}, [`${remaining.length} more projects`]),
        element("span", {}, ["Open the complete project output ledger"]),
      ]),
      element("div", {}, remaining.map(projectOutput)),
    ]));
  }
  return list;
}

function outputHistory(history: JsonRecord[]) {
  const maximum = Math.max(1, ...history.map((period) => period.outputs));
  return element("div", { class: "output-history" }, history.map((period) => {
    const otherRuns = period.runs - period.succeeded - period.failed;
    return element("div", { class: "output-history__row" }, [
      element("time", { datetime: period.period }, [period.period]),
      element("div", { class: "output-history__track", "aria-hidden": "true" }, [
        element("i", { style: `--history-width:${Math.max(4, (period.outputs / maximum) * 100)}%` }),
      ]),
      element("strong", {}, [`${period.outputs} output${period.outputs === 1 ? "" : "s"}`]),
      element("span", {}, [
        `${period.succeeded} succeeded · ${period.failed} failed`,
        otherRuns > 0
          ? ` · ${otherRuns} other`
          : "",
        ` · ${period.metrics} metric${period.metrics === 1 ? "" : "s"}`,
      ]),
      (period.failed && period.succeeded) || otherRuns > 0
        ? state("mixed")
        : period.failed
          ? state("failed")
          : state("succeeded"),
    ]);
  }));
}

function improvementAction(item: JsonRecord) {
  return element("a", { class: "record improvement-action", href: consoleHref(item.work?.ownerPath ?? item.ownerPath) }, [
    element("div", { class: "record-main" }, [
      element("div", { class: "record-kicker" }, [item.scope === "project" ? item.projectId : "System"]),
      element("h3", {}, [item.action]),
      element("p", {}, [item.signal]),
    ]),
    element("div", { class: "record-side" }, [
      state(item.work?.state ?? "not-started"),
      element("small", {}, [
        item.work
          ? `${item.severity} priority · linked mission`
          : `${item.severity} priority · recommendation`,
      ]),
    ]),
  ]);
}

function renderConnectionHome(payload: JsonRecord) {
  const improvement = payload.outputs.improvements[0];
  const body = element("div", { class: "connection-home__content" }, [
    outputOverview(payload, { compact: true }),
    element("div", { class: "connection-home__next" }, [
      element("span", {}, [improvement ? "Highest-impact improvement" : "Output state"]),
      element("strong", {}, [improvement?.action ?? "No evidence-backed improvement is waiting."]),
      element("a", { class: "action-link", href: "/metrics" }, ["Open metrics"]),
    ]),
  ]);
  replace("connection-home", body);
}

function latestResultRecord(item: JsonRecord) {
  const href = item.kind === "skill"
    ? "/skill-uses"
    : ["psi", "domain-rating", "ai-visibility"].includes(item.kind)
      ? "/metrics"
      : `/projects/${item.projectId}`;
  const failed = String(item.value).toLowerCase() === "failed" || String(item.detail).toLowerCase().includes("failed");
  return element("a", { class: "record", href: consoleHref(href) }, [
    element("div", { class: "record-main" }, [
      element("div", { class: "record-kicker" }, [item.projectName]),
      element("h3", {}, [`${item.label}: ${item.value}`]),
      element("p", {}, [item.detail]),
    ]),
    element("div", { class: "record-side" }, [
      state(failed ? "failed" : item.freshness ?? "unknown"),
      element("small", {}, [formatted(item.observedAt)]),
    ]),
  ]);
}

async function renderHome() {
  const payload = await api("/v1/connections");
  const renderedAt = document.querySelector<HTMLElement>("[data-snapshot-time]");
  if (renderedAt) renderedAt.textContent = `Evidence rebuilt ${formatted(payload.generatedAt)}`;
  const scopedAttention = selectedProjectId
    ? payload.outputs.improvements.filter((item: JsonRecord) => item.projectId === selectedProjectId)
    : payload.outputs.improvements.filter((item: JsonRecord) => item.scope === "project" || item.work);
  const attention = scopedAttention.slice(0, 4);
  const count = document.querySelector<HTMLElement>('[data-founder-count="overview-attention"]');
  if (count) count.textContent = String(attention.length);
  replace(
    "overview-attention",
    attention.length
      ? element("div", { class: "record-list" }, attention.map(improvementAction))
      : empty("No evidence-backed improvement", "Fleet will not invent work when recorded evidence is healthy."),
  );
  const latest = payload.outputs.projects
    .filter((project: JsonRecord) => !selectedProjectId || project.projectId === selectedProjectId)
    .flatMap((project: JsonRecord) => project.produced.map((result: JsonRecord) => ({
      ...result,
      projectId: project.projectId,
      projectName: project.name,
    })))
    .filter((item: JsonRecord) => item.observedAt)
    .filter((item: JsonRecord) => {
      if (selectedProjectId) return true;
      if (!["availability", "http-performance"].includes(item.kind)) return true;
      return String(item.value).toLowerCase() === "failed" || String(item.detail).toLowerCase().includes("failed");
    })
    .sort((left: JsonRecord, right: JsonRecord) => Date.parse(right.observedAt) - Date.parse(left.observedAt))
    .slice(0, 10);
  const latestCount = document.querySelector<HTMLElement>('[data-founder-count="overview-latest"]');
  if (latestCount) latestCount.textContent = String(latest.length);
  replace(
    "overview-latest",
    latest.length
      ? element("div", { class: "record-list" }, latest.map(latestResultRecord))
      : empty("No recent result", selectedProjectId ? `${selectedProjectName} has no recorded result yet.` : "No project has produced dated evidence yet."),
  );
}

type MetricFamily =
  | "search"
  | "ai"
  | "drank"
  | "agent"
  | "crawl"
  | "coverage"
  | "psi"
  | "design";

type MetricEmptyState = {
  title: string;
  detail: string;
};

type MetricFamilyDefinition = {
  title: string;
  runLabel: string;
  includesProject: (project: JsonRecord) => boolean;
  matchesSignal: (signal: JsonRecord) => boolean;
  matchesAction: (action: JsonRecord) => boolean;
  canRun: (project: JsonRecord) => boolean;
  runBoundary?: string;
  historyState?: (project: JsonRecord, signals: JsonRecord[]) => string;
  observedAt?: (project: JsonRecord, signals: JsonRecord[]) => string | null;
  emptyState: (project: JsonRecord) => MetricEmptyState;
  renderEvidence: (
    project: JsonRecord,
    signals: JsonRecord[],
    emptyState: MetricEmptyState,
  ) => HTMLElement;
};

const METRIC_FAMILY_ORDER: MetricFamily[] = [
  "search",
  "ai",
  "drank",
  "agent",
  "crawl",
  "coverage",
  "psi",
  "design",
];

const METRIC_FAMILIES: Record<MetricFamily, MetricFamilyDefinition> = {
  search: {
    title: "Search outcomes & observations",
    runLabel: "Record search run",
    includesProject: (project) => project.metricEligibility?.publicSite === true,
    matchesSignal: (signal) =>
      signal.label === "Worst tracked query class" || signal.label.startsWith("Search "),
    matchesAction: () => false,
    canRun: () => false,
    historyState: (_project, signals) => metricHistoryState(
      signals.filter((signal) => signal.source === "Google Search Console"),
    ),
    observedAt: (project) => project.searchVisibility?.outcome?.observedAt ?? null,
    emptyState: (project) => project.searchVisibility?.configured
      ? {
          title: "No Search Visibility baseline",
          detail: "Queries are configured, but no evidence-backed search observation is recorded.",
        }
      : {
          title: "Search Visibility not configured",
          detail: "This project needs stable tracked queries before comparable search history can begin.",
        },
    renderEvidence: renderSearchVisibility,
  },
  ai: {
    title: "AI Visibility",
    runLabel: "Run fixture canary",
    includesProject: (project) => project.metricEligibility?.publicSite === true,
    matchesSignal: (signal) =>
      signal.label.startsWith("AI visibility") ||
      signal.label.startsWith("AI mention") ||
      signal.label.startsWith("AI recommendation") ||
      signal.label.startsWith("AI citation") ||
      signal.label.startsWith("AI coverage") ||
      signal.label.startsWith("AI average rank"),
    matchesAction: (action) => action.id.includes(":ai-"),
    canRun: (project) => Boolean(project.aiVisibility?.configured),
    emptyState: (project) => {
      if (!project.aiVisibility?.configured) {
        return {
          title: "AI Visibility not configured",
          detail: "This public project needs a project-specific prompt set before it can produce a baseline.",
        };
      }
      return {
        title: "AI Visibility not measured",
        detail: "Questions are configured, but no provider-backed observation is recorded.",
      };
    },
    runBoundary: "Fixture runner · not a visibility outcome",
    renderEvidence: renderAiVisibility,
  },
  drank: {
    title: "D-Rank",
    runLabel: "Refresh D-Rank",
    includesProject: (project) => project.metricEligibility?.publicSite === true,
    matchesSignal: (signal) => signal.label === "Domain rating",
    matchesAction: (action) => action.id.endsWith(":domain-rating"),
    canRun: (project) => project.metricEligibility?.publicSite === true,
    emptyState: () => ({
      title: "No D-Rank baseline",
      detail: "This eligible project has no recorded domain-rating observation.",
    }),
    renderEvidence: renderMetricCharts,
  },
  agent: {
    title: "AI Agent Readiness",
    runLabel: "Audit agent readiness",
    includesProject: (project) => project.metricEligibility?.publicSite === true,
    matchesSignal: (signal) => signal.label.startsWith("Agent "),
    matchesAction: () => false,
    canRun: (project) => project.metricEligibility?.publicSite === true,
    emptyState: () => ({
      title: "No AI Agent Readiness baseline",
      detail: "Run the live audit to check agent entrypoints, public-route Markdown coverage, and catalog integrity.",
    }),
    renderEvidence: readinessMetricCharts("agent"),
  },
  crawl: {
    title: "AI Crawlability",
    runLabel: "Audit AI crawlability",
    includesProject: (project) => project.metricEligibility?.publicSite === true,
    matchesSignal: (signal) =>
      signal.label === "AI crawlability" ||
      signal.label === "AI crawler checks passed" ||
      signal.label === "AI crawler checks failed",
    matchesAction: () => false,
    canRun: (project) => project.metricEligibility?.publicSite === true,
    emptyState: () => ({
      title: "No AI Crawlability baseline",
      detail: "Run the live audit to check robots, critical AI-bot access, and sitemap readiness.",
    }),
    renderEvidence: readinessMetricCharts("crawl"),
  },
  coverage: {
    title: "Content Coverage",
    runLabel: "Inventory content",
    includesProject: (project) => project.metricEligibility?.publicSite === true,
    matchesSignal: (signal) => signal.label.startsWith("Content "),
    matchesAction: () => false,
    canRun: (project) => project.metricEligibility?.publicSite === true,
    emptyState: () => ({
      title: "No Content Coverage baseline",
      detail: "Run the local inventory to record owned pages and content archetypes.",
    }),
    renderEvidence: readinessMetricCharts("coverage"),
  },
  psi: {
    title: "PSI Swarm",
    runLabel: "Run PSI",
    includesProject: (project) => project.metricEligibility?.publicSite === true,
    matchesSignal: (signal) => signal.label.startsWith("PSI "),
    matchesAction: (action) => action.id.includes(":psi-"),
    canRun: (project) => project.metricEligibility?.publicSite === true,
    emptyState: () => ({
      title: "No PSI Swarm baseline",
      detail: "This public project is eligible but has no recorded PSI report.",
    }),
    renderEvidence: renderMetricCharts,
  },
  design: {
    title: "Design Critique",
    runLabel: "Validate review",
    includesProject: (project) => project.metricEligibility?.publicSite === true,
    matchesSignal: (signal) => /(?:design|critique|audit)/i.test(signal.label),
    matchesAction: () => false,
    canRun: (project) => Boolean(project.designReview),
    emptyState: () => ({
      title: "No design review",
      detail: "No valid design-review receipt is available.",
    }),
    renderEvidence: renderDesignReview,
  },
};

function metricHistoryState(signals: JsonRecord[]) {
  if (signals.some((signal) => signal.series?.length >= 2)) return "comparable";
  if (signals.length > 0) return "baseline-only";
  return "unmeasured";
}

function metricFamilyHistoryState(
  definition: MetricFamilyDefinition,
  project: JsonRecord,
  signals: JsonRecord[],
) {
  if (definition.historyState) return definition.historyState(project, signals);
  return metricHistoryState(signals);
}

function metricFamilyObservedAt(
  definition: MetricFamilyDefinition,
  project: JsonRecord,
  signals: JsonRecord[],
) {
  if (definition.observedAt) return definition.observedAt(project, signals);
  return signals
    .map((signal: JsonRecord) => signal.observedAt)
    .filter(Boolean)
    .sort((left: string, right: string) => Date.parse(right) - Date.parse(left))[0] ?? null;
}

function renderMetricCharts(
  _project: JsonRecord,
  signals: JsonRecord[],
  emptyState: MetricEmptyState,
) {
  if (signals.length === 0) {
    return empty(emptyState.title, emptyState.detail);
  }
  return element("div", { class: "project-history-grid" }, signals.map(historySignal));
}

function renderSearchVisibility(
  project: JsonRecord,
  signals: JsonRecord[],
  emptyState: MetricEmptyState,
) {
  const outcome = project.searchVisibility?.outcome;
  let outcomeSummary = "Direct search outcome is not measured · Google Search Console is not connected. The rows below are current web-search observations, not an overall grade.";
  if (outcome) {
    outcomeSummary = `Google Search Console outcome · ${outcomeMetricsSummary(outcome)} · ${formatted(outcome.observedAt)} · ${formattedDay(outcome.period?.start)} to ${formattedDay(outcome.period?.end)} · ${outcome.scope}`;
  }
  const queries = project.searchVisibility?.queries ?? [];
  const queryList = queries.length
    ? element("div", { class: "tracked-intent-list" }, queries.map((query: JsonRecord) => {
        const latest = query.history?.at(-1);
        return element("article", { class: "tracked-intent" }, [
          element("div", {}, [
            element("span", {}, [query.kind ?? "query"]),
            element("strong", {}, [query.text]),
          ]),
          latest
            ? element("div", { class: "tracked-intent__result" }, [
                element("strong", {}, [{ A: "Own domain top 3", B: "Partial page one", C: "Absent" }[latest.class] ?? "Unknown"]),
                element("small", {}, [`Web search · ${formattedDay(latest.observedAt)}`]),
              ])
            : state("unmeasured"),
        ]);
      }))
    : empty("No tracked search terms", "This project needs a stable query set before ranking history can begin.");
  return element("div", { class: "metric-evidence" }, [
    element("div", { class: "metric-evidence__summary" }, [
      element("span", {}, [outcomeSummary]),
      element("a", {
        href: "https://search.google.com/search-console",
        target: "_blank",
        rel: "noreferrer",
      }, ["Open Search Console"]),
    ]),
    queryList,
    renderMetricCharts(project, signals, emptyState),
  ]);
}

function outcomeMetricsSummary(outcome: JsonRecord) {
  const metrics = Array.isArray(outcome.metrics) ? outcome.metrics : [];
  if (metrics.length === 0) return "No aggregate values";
  return metrics
    .map((metric: JsonRecord) => `${metric.label.replace(/^AI /, "")}: ${metricValue(metric.value, metric.unit)}`)
    .join(" · ");
}

function discoveryOutcomeSummary(label: string, outcome: JsonRecord | null | undefined) {
  if (!outcome) return null;
  return element("p", { class: "metric-evidence__summary" }, [
    `${label} · ${outcomeMetricsSummary(outcome)} · ${formatted(outcome.observedAt)} · ${formattedDay(outcome.period?.start)} to ${formattedDay(outcome.period?.end)} · ${outcome.scope}`,
  ]);
}

function renderAiVisibility(
  project: JsonRecord,
  signals: JsonRecord[],
  emptyState: MetricEmptyState,
) {
  const questions = project.aiVisibility?.questions ?? [];
  const discoverySummaries = [
    discoveryOutcomeSummary(
      "Cloudflare AI crawler activity",
      project.aiVisibility?.discovery?.crawler,
    ),
    discoveryOutcomeSummary(
      "Cloudflare AI referral traffic",
      project.aiVisibility?.discovery?.referral,
    ),
  ].filter(Boolean);
  let discoverySection = null;
  if (discoverySummaries.length > 0) {
    discoverySection = element("section", {
      class: "metric-discovery",
      "aria-label": "Discovery evidence",
    }, [
      element("p", { class: "metric-evidence__summary" }, [
        element("strong", {}, ["Discovery evidence"]),
        " · crawler access and referral traffic do not establish a model mention, citation, rank, or recommendation.",
      ]),
      ...discoverySummaries,
    ]);
  }
  const questionList = questions.length
    ? element("div", { class: "tracked-intent-list" }, questions.map((question: JsonRecord) =>
        element("article", { class: "tracked-intent" }, [
          element("div", {}, [
            element("span", {}, [question.setId ?? "question"]),
            element("strong", {}, [question.text]),
          ]),
          state(project.aiVisibility?.observations > 0 ? "measured" : "unmeasured"),
        ])))
    : empty("No tracked AI questions", "This project needs a stable question set before comparable AI visibility can begin.");
  return element("div", { class: "metric-evidence" }, [
    project.aiVisibility?.observations > 0
      ? element("p", { class: "metric-evidence__summary" }, [
          `Provider-backed outcome · ${formatted(project.aiVisibility.observedAt)}`,
        ])
      : element("p", { class: "metric-evidence__summary" }, [
          project.aiVisibility?.fixture?.observations > 0
            ? `Real AI visibility is not measured · ${project.aiVisibility.fixture.observations} fixture canary recorded for runner verification.`
            : "Real AI visibility is not measured · no provider-backed observation or fixture canary is recorded.",
        ]),
    discoverySection,
    questionList,
    renderMetricCharts(project, signals, emptyState),
  ]);
}

function readinessMetricCharts(family: "agent" | "crawl" | "coverage") {
  return (
    project: JsonRecord,
    signals: JsonRecord[],
    emptyState: MetricEmptyState,
  ) => {
    const latest = project.visibilityReadiness?.[family];
    const charts = renderMetricCharts(project, signals, emptyState);
    if (!latest) return charts;
    return element("div", { class: "metric-evidence" }, [
      element("p", { class: "metric-evidence__summary" }, [latest.summary]),
      charts,
    ]);
  };
}

function designScoreTone(score: number, maximum: number) {
  const ratio = maximum > 0 ? score / maximum : 0;
  if (ratio >= .85) return "strong";
  if (ratio >= .7) return "steady";
  return "needs-work";
}

function designScoreCard(label: string, score: number, maximum: number) {
  const percentage = maximum > 0 ? Math.round((score / maximum) * 100) : 0;
  const boundedPercentage = Math.max(0, Math.min(100, percentage));
  const tone = designScoreTone(score, maximum);
  return element("article", { class: `design-score design-score--${tone}` }, [
    element("span", {}, [label]),
    element("strong", {}, [
      String(score),
      element("small", {}, [`/${maximum}`]),
    ]),
    element("div", { class: "design-score__track", "aria-hidden": "true" }, [
      element("i", { style: `width: ${boundedPercentage}%` }),
    ]),
    element("small", {}, [`${boundedPercentage}% of review standard`]),
  ]);
}

function renderDesignReview(
  project: JsonRecord,
  signals: JsonRecord[],
  emptyState: MetricEmptyState,
) {
  const review = project.designReview;
  if (!review) return renderMetricCharts(project, signals, emptyState);
  const historicalSignals = signals.filter((signal) => signal.series?.length >= 2);
  const content = [
    element("div", { class: "design-review__scores" }, [
      designScoreCard("Critique", Number(review.critique), Number(review.critiqueMaximum)),
      designScoreCard("Audit", Number(review.audit), Number(review.auditMaximum)),
    ]),
    element("footer", { class: "design-review__meta" }, [
      element("span", {}, ["Owner review"]),
      state(review.ownerDecision ?? "pending"),
      element("small", {}, [review.observedAt ? formatted(review.observedAt) : "No observation date"]),
    ]),
  ];
  if (historicalSignals.length > 0) {
    content.push(
      element("div", { class: "design-review__history" }, [
        element("span", {}, ["History"]),
        element("div", { class: "project-history-grid" }, historicalSignals.map(historySignal)),
      ]),
    );
  }
  return element("div", { class: "design-review" }, content);
}

function metricRunButton(project: JsonRecord, family: MetricFamily) {
  const definition = METRIC_FAMILIES[family];
  if (!definition.canRun(project)) return null;
  const wrap = element("div", { class: "metric-run-control" });
  const statusText = element("span", { role: "status", "aria-live": "polite" });
  const button = element("button", { type: "button", class: "secondary-action" }, [definition.runLabel]);
  button.addEventListener("click", async () => {
    button.setAttribute("disabled", "");
    button.textContent = "Starting…";
    statusText.textContent = "";
    try {
      button.textContent = "Running…";
      const run = await startAndPollMetricRun({
        family,
        projectId: project.catalogProjectId ?? project.projectId,
        statusText,
        isConnected: () => button.isConnected,
      });
      if (!run) return;
      if (run.state === "succeeded") {
        button.textContent = "Completed";
        if (document.body.dataset.founderView === "project") {
          await renderProjectDetail();
        } else {
          await renderMetrics();
        }
        return;
      }
      throw new Error(run.summary || `${definition.runLabel} failed.`);
    } catch (error) {
      button.removeAttribute("disabled");
      button.textContent = definition.runLabel;
      statusText.textContent = error instanceof Error ? error.message : "Run failed.";
    }
  });
  wrap.append(button, statusText);
  return wrap;
}

function metricRunBoundary(family: MetricFamily) {
  const boundary = METRIC_FAMILIES[family].runBoundary;
  return boundary
    ? element("span", { class: "metric-run-boundary" }, [boundary])
    : null;
}

function metricReportProject(
  project: JsonRecord,
  signals: JsonRecord[],
  actions: JsonRecord[],
  family: MetricFamily,
) {
  const definition = METRIC_FAMILIES[family];
  const historyState = metricFamilyHistoryState(definition, project, signals);
  const observedAt = metricFamilyObservedAt(definition, project, signals);
  const identity = element("div", {}, [
    element("h3", {}, [project.name]),
    element("small", {}, [observedAt ? formatted(observedAt) : "No observation"]),
  ]);
  const evidence = definition.renderEvidence(project, signals, definition.emptyState(project));
  const actionRows = actions.map((action: JsonRecord) => {
    const content = [
      element("span", {}, ["Next"]),
      element("strong", {}, [action.action]),
      state(action.work?.state ?? "not-started"),
    ];
    return action.work
      ? element("a", { class: "metric-report__action", href: consoleHref(action.work.ownerPath) }, content)
      : element("div", { class: "metric-report__action" }, content);
  });

  if (family === "design") {
    return element("details", { class: "metric-report metric-report--disclosure" }, [
      element("summary", { class: "metric-report__summary" }, [
        identity,
        element("div", { class: "metric-report__header-actions" }, [
          state(historyState),
          element("span", { class: "metric-report__toggle", "aria-hidden": "true" }),
        ]),
      ]),
      element("div", { class: "metric-report__body" }, [
        metricRunButton(project, family),
        metricRunBoundary(family),
        evidence,
        ...actionRows,
      ]),
    ]);
  }

  return element("article", { class: "metric-report" }, [
    element("header", {}, [
      identity,
      element("div", { class: "metric-report__header-actions" }, [
        state(historyState),
        metricRunButton(project, family),
        metricRunBoundary(family),
      ]),
    ]),
    evidence,
    ...actionRows,
  ]);
}

function metricReportFamily(
  projects: JsonRecord[],
  improvements: JsonRecord[],
  family: MetricFamily,
) {
  const definition = METRIC_FAMILIES[family];
  const entries = projects.flatMap((project: JsonRecord) => {
    const signals = project.history.signals.filter(definition.matchesSignal);
    const included = definition.includesProject(project);
    if (!included) return [];
    const actions = improvements.filter((action: JsonRecord) => {
      if (action.projectId !== project.projectId) return false;
      return definition.matchesAction(action);
    });
    return [metricReportProject(project, signals, actions, family)];
  });
  return entries.length ? element("div", { class: "metric-report-list" }, entries) : null;
}

function projectSignal(project: JsonRecord, label: string) {
  return project.history.signals.find((signal: JsonRecord) => signal.label === label);
}

type MetricMatrixMeasureInput = {
  label: string;
  signal?: JsonRecord;
  missing?: string;
  source: string;
  observedAt?: string | null;
  detail?: string | null;
  tone?: "support" | "standard";
};

function metricMatrixMeasure({
  label,
  signal,
  missing = "Not measured",
  source,
  observedAt = signal?.observedAt ?? null,
  detail = null,
  tone = "standard",
}: MetricMatrixMeasureInput) {
  const evidence = [source, observedAt ? formattedDay(observedAt) : "No observation", detail]
    .filter(Boolean)
    .join(" · ");
  if (!signal || !Number.isFinite(signal.value)) {
    return element("span", {
      class: `metric-matrix__measure metric-matrix__measure--${tone} metric-matrix__measure--missing`,
      title: evidence,
    }, [
      element("small", {}, [label]),
      element("strong", {}, [missing]),
      element("em", {}, [evidence]),
    ]);
  }
  const favorable =
    Number.isFinite(signal.delta) &&
    ((signal.direction === "higher-is-better" && signal.delta > 0) ||
      (signal.direction === "lower-is-better" && signal.delta < 0));
  const unfavorable =
    Number.isFinite(signal.delta) &&
    ((signal.direction === "higher-is-better" && signal.delta < 0) ||
      (signal.direction === "lower-is-better" && signal.delta > 0));
  let trendClass = "";
  if (favorable) trendClass = "positive";
  if (unfavorable) trendClass = "negative";
  let trend = "";
  if (Number.isFinite(signal.delta)) {
    trend = metricDeltaValue(signal.delta, signal.unit);
  } else if (signal.history === "baseline-only") {
    trend = "Baseline";
  }
  return element("span", {
    class: `metric-matrix__measure metric-matrix__measure--${tone}`,
    title: evidence,
  }, [
    element("small", {}, [label]),
    element("strong", {}, [metricValue(signal.value, signal.unit)]),
    element("em", { class: trendClass }, [trend ? `${trend} · ${evidence}` : evidence]),
  ]);
}

type MetricMatrixColumn = "drank" | "readiness" | "performance";

function metricMatrixCell(project: JsonRecord, column: MetricMatrixColumn) {
  const semantics = project.metricSemantics ?? {};
  const domainScope = semantics.seo?.domainAuthority?.sharedRoot
    ? `shared root ${semantics.seo.domainAuthority.rootDomain}`
    : semantics.seo?.domainAuthority?.domain ?? null;
  const cells: Record<MetricMatrixColumn, { section: string; measures: HTMLElement[] }> = {
    drank: {
      section: "seo",
      measures: [
      metricMatrixMeasure({
        label: "D-Rank",
        signal: projectSignal(project, "Domain rating"),
        source: "Drank",
        observedAt: semantics.seo?.domainAuthority?.observedAt,
        detail: domainScope,
      }),
      ],
    },
    readiness: {
      section: "geo",
      measures: [
      metricMatrixMeasure({
        label: "Agent readiness",
        signal: projectSignal(project, "Agent readiness"),
        source: "Agent audit",
        observedAt: semantics.geo?.technicalReadiness?.observedAt,
        tone: "support",
      }),
      ],
    },
    performance: {
      section: "performance",
      measures: [
      metricMatrixMeasure({
        label: "PSI",
        signal: projectSignal(project, "PSI performance"),
        source: "PSI Swarm",
        observedAt: semantics.performance?.observedAt,
      }),
      metricMatrixMeasure({
        label: "LCP",
        signal: projectSignal(project, "PSI LCP"),
        source: "PSI Swarm",
        observedAt: semantics.performance?.observedAt,
      }),
      ],
    },
  };
  const cell = cells[column];
  const href = `${projectHref(project.projectId)}#${cell.section}`;
  return element("div", {
    class: `metric-matrix__cell metric-matrix__cell--${column}`,
    role: "cell",
  }, [
    element("a", {
      href,
      title: `Open ${project.name} ${column} metrics`,
    }, cell.measures),
  ]);
}

function metricMatrixRow(project: JsonRecord) {
  return element("div", { class: "metric-matrix__row", role: "row" }, [
    element("div", { class: "metric-matrix__project", role: "rowheader" }, [
      element("a", { href: projectHref(project.projectId) }, [
        element("strong", {}, [project.name]),
        element("small", {}, [project.domains?.[0] ?? "No domain"]),
      ]),
    ]),
    metricMatrixCell(project, "drank"),
    metricMatrixCell(project, "readiness"),
    metricMatrixCell(project, "performance"),
  ]);
}

type MetricMatrixSort = "project" | MetricMatrixColumn;

function metricMatrixSortValue(project: JsonRecord, key: MetricMatrixSort) {
  if (key === "project") return project.name;
  if (key === "drank") return projectSignal(project, "Domain rating")?.value;
  if (key === "readiness") return projectSignal(project, "Agent readiness")?.value;
  return projectSignal(project, "PSI performance")?.value;
}

function metricMatrix(projects: JsonRecord[]) {
  let sortKey: MetricMatrixSort = "project";
  let sortDirection: "ascending" | "descending" = "ascending";
  const headers = new Map<MetricMatrixSort, HTMLElement>();
  const sortStatus = element("span", { class: "sr-only", role: "status", "aria-live": "polite" });
  const matrix = element("div", {
    class: "metric-matrix",
    role: "table",
    "aria-label": "Fleet project metrics",
  });

  const renderRows = () => {
    for (const [key, header] of headers) {
      header.setAttribute("aria-sort", key === sortKey ? sortDirection : "none");
    }
    const sorted = [...projects].sort((left, right) => {
      const leftValue = metricMatrixSortValue(left, sortKey);
      const rightValue = metricMatrixSortValue(right, sortKey);
      const leftMissing = leftValue === null || leftValue === undefined || leftValue === "";
      const rightMissing = rightValue === null || rightValue === undefined || rightValue === "";
      if (leftMissing !== rightMissing) return leftMissing ? 1 : -1;
      if (leftMissing && rightMissing) return left.name.localeCompare(right.name);
      let order = 0;
      if (typeof leftValue === "string" && typeof rightValue === "string") {
        order = leftValue.localeCompare(rightValue);
      } else {
        order = Number(leftValue) - Number(rightValue);
      }
      return sortDirection === "ascending" ? order : -order;
    });
    matrix.replaceChildren(head, ...sorted.map(metricMatrixRow));
    sortStatus.textContent = `Sorted by ${sortKey}, ${sortDirection}.`;
  };

  const headerCell = (
    key: MetricMatrixSort,
    label: string,
    description: string,
  ) => {
    const header = element("span", { role: "columnheader", "aria-sort": "none" });
    const button = element("button", {
      type: "button",
      title: description,
      "aria-label": `${label}. ${description}`,
    }, [
      label,
      element("span", { class: "metric-matrix__sort", "aria-hidden": "true" }),
    ]);
    button.addEventListener("click", () => {
      if (sortKey === key) {
        sortDirection = sortDirection === "ascending" ? "descending" : "ascending";
      } else {
        sortKey = key;
        sortDirection = key === "project" ? "ascending" : "descending";
      }
      renderRows();
    });
    header.append(button);
    headers.set(key, header);
    return header;
  };

  const head = element("div", { class: "metric-matrix__head", role: "row" }, [
    headerCell("project", "Project", "Sort alphabetically"),
    headerCell("drank", "D-Rank", "Sort by domain rating"),
    headerCell("readiness", "Agent readiness", "Sort by technical readiness"),
    headerCell("performance", "Performance", "Sort by PSI score"),
  ]);
  renderRows();
  return element("div", { class: "metric-matrix-wrap" }, [
    element("p", { class: "metric-matrix__scroll-hint" }, ["Swipe sideways to compare D-Rank, agent readiness, and performance."]),
    sortStatus,
    matrix,
  ]);
}

type OutcomeColumn = {
  key: string;
  label: string;
  description: string;
  sortable?: boolean;
  value: (row: JsonRecord) => string | number | null | undefined;
  render: (row: JsonRecord) => Node | string;
};

type OutcomeTableOptions = {
  details?: (row: JsonRecord) => Node;
  rowKey?: (row: JsonRecord) => string;
};

function matchesProject(projectId?: string | null) {
  if (!selectedProjectId) return true;
  return projectId === selectedProjectId || projectId === catalogProjectId(selectedProjectId);
}

function outcomeTable(
  rows: JsonRecord[],
  columns: OutcomeColumn[],
  defaultSort: string,
  label: string,
  defaultDirection: "ascending" | "descending" = "ascending",
  options: OutcomeTableOptions = {},
) {
  let sortKey = defaultSort;
  let sortDirection: "ascending" | "descending" = defaultDirection;
  const headCells = new Map<string, HTMLTableCellElement>();
  const body = element("tbody");
  const status = element("span", { class: "sr-only", role: "status", "aria-live": "polite" });
  const expandedRows = new Set<string>();

  const draw = () => {
    for (const [key, cell] of headCells) {
      cell.setAttribute("aria-sort", key === sortKey ? sortDirection : "none");
    }
    const column = columns.find((item) => item.key === sortKey) ?? columns[0];
    const sorted = [...rows].sort((left, right) => {
      const leftValue = column.value(left);
      const rightValue = column.value(right);
      const leftMissing = leftValue === null || leftValue === undefined || leftValue === "";
      const rightMissing = rightValue === null || rightValue === undefined || rightValue === "";
      if (leftMissing && !rightMissing) return 1;
      if (!leftMissing && rightMissing) return -1;
      if (leftMissing && rightMissing) return 0;
      let order = 0;
      if (typeof leftValue === "number" && typeof rightValue === "number") {
        order = leftValue - rightValue;
      } else {
        order = String(leftValue).localeCompare(String(rightValue));
      }
      if (sortDirection === "descending") return -order;
      return order;
    });
    body.replaceChildren(...sorted.flatMap((row, rowIndex) => {
      const cells = columns.map((item, columnIndex): HTMLTableCellElement => {
        const rendered = item.render(row);
        if (columnIndex === 0) return element("th", { scope: "row" }, [rendered]);
        return element("td", { "data-label": item.label }, [rendered]);
      });
      const mainRow = element("tr", {}, cells);
      if (!options.details) return [mainRow];

      const rowKey = options.rowKey?.(row) ?? `${rowIndex}`;
      const detailId = `outcome-detail-${rowKey.replace(/[^a-z0-9_-]+/gi, "-")}`;
      const detailRow = element("tr", { id: detailId, class: "outcome-table__detail-row" }, [
        element("td", { colspan: String(columns.length + 1) }, [options.details(row)]),
      ]);
      const expanded = expandedRows.has(rowKey);
      detailRow.hidden = !expanded;
      const toggle = element("button", {
        type: "button",
        class: "outcome-detail-toggle",
        "aria-controls": detailId,
        "aria-expanded": String(expanded),
      }, [expanded ? "Hide" : "View"]);
      toggle.addEventListener("click", () => {
        const shouldExpand = detailRow.hidden;
        detailRow.hidden = !shouldExpand;
        toggle.setAttribute("aria-expanded", String(shouldExpand));
        toggle.textContent = shouldExpand ? "Hide" : "View";
        if (shouldExpand) expandedRows.add(rowKey);
        else expandedRows.delete(rowKey);
      });
      mainRow.insertBefore(element("td", { "data-label": "Details" }, [toggle]), mainRow.children[1]);
      return [mainRow, detailRow];
    }));
    status.textContent = `Sorted by ${column.label}, ${sortDirection}.`;
  };

  const headerCells = columns.map((column) => {
    const cell = element("th", { scope: "col", "aria-sort": "none" });
    if (column.sortable === false) {
      cell.removeAttribute("aria-sort");
      cell.append(element("span", { class: "outcome-table__label" }, [column.label]));
      return cell;
    }
    const button = element("button", {
      type: "button",
      title: column.description,
      "aria-label": `${column.label}. ${column.description}`,
    }, [column.label, element("span", { class: "outcome-table__sort", "aria-hidden": "true" })]);
    button.addEventListener("click", () => {
      if (sortKey === column.key) {
        sortDirection = sortDirection === "ascending" ? "descending" : "ascending";
      } else {
        sortKey = column.key;
        sortDirection = column.key === defaultSort ? "ascending" : "descending";
      }
      draw();
    });
    cell.append(button);
    headCells.set(column.key, cell);
    return cell;
  });
  if (options.details) {
    headerCells.splice(1, 0, element("th", { scope: "col" }, [
      element("span", { class: "outcome-table__label" }, ["Details"]),
    ]));
  }
  const header = element("tr", {}, headerCells);
  const table = element("table", { class: "outcome-table", "aria-label": label }, [
    element("thead", {}, [header]),
    body,
  ]);
  draw();
  return element("div", { class: "outcome-table-wrap" }, [
    element("p", { class: "outcome-table__scroll-hint" }, ["Swipe sideways to inspect every column."]),
    status,
    table,
  ]);
}

async function startAndPollMetricRun({
  family,
  projectId,
  scope = "project",
  statusText,
  maxAttempts = 240,
  isConnected,
}: {
  family: string;
  projectId?: string;
  scope?: "project" | "portfolio";
  statusText?: HTMLElement | null;
  maxAttempts?: number;
  isConnected: () => boolean;
}) {
  const request: JsonRecord = { family, scope };
  if (projectId) request.projectId = projectId;
  let run = await mutate("/v1/metric-runs", request);
  if (statusText) statusText.textContent = run.summary;
  for (let attempt = 0; attempt < maxAttempts && run.state === "running"; attempt += 1) {
    await new Promise((resolve) => window.setTimeout(resolve, 1500));
    if (!isConnected()) return null;
    run = await api(`/v1/metric-runs/${encodeURIComponent(run.runId)}`);
    if (statusText) statusText.textContent = run.summary;
  }
  return run;
}

function outcomeSignal(signal?: JsonRecord | null) {
  if (!signal || !Number.isFinite(signal.value)) {
    return element("span", { class: "outcome-missing" }, ["Not measured"]);
  }
  let detail = titleCase(signal.history ?? "baseline-only");
  if (Number.isFinite(signal.delta)) {
    detail = signal.delta === 0 ? "No change" : metricDeltaValue(signal.delta, signal.unit);
  }
  return element("span", { class: "outcome-signal" }, [
    element("strong", {}, [metricValue(signal.value, signal.unit)]),
    element("small", {}, [detail]),
  ]);
}

function providerLink(label: string, url?: string | null) {
  if (!url) return null;
  return element("a", {
    class: "secondary-action provider-link",
    href: url,
    target: "_blank",
    rel: "noreferrer",
    "aria-label": `${label} (opens in a new tab)`,
  }, [label]);
}

function outcomePeriod(outcome?: JsonRecord | null) {
  if (!outcome?.period?.start || !outcome?.period?.end) return "Not measured";
  return `${searchReportingDay(outcome.period.start)} – ${searchReportingDay(outcome.period.end)}`;
}

function outcomeBreakdowns(outcome?: JsonRecord | null) {
  const breakdowns = outcome?.breakdowns ?? [];
  if (breakdowns.length === 0) return null;
  return element("div", { class: "outcome-breakdowns" }, breakdowns.map((breakdown: JsonRecord) => {
    const children: Node[] = [
      element("h3", {}, [breakdown.label]),
      element("div", { class: "tracked-intent-list" }, (breakdown.values ?? []).slice(0, 5).map((item: JsonRecord) =>
        element("div", { class: "tracked-intent" }, [
          element("div", {}, [element("strong", {}, [item.label])]),
          element("div", { class: "tracked-intent__result" }, [
            element("strong", {}, [metricValue(Number(item.value), breakdown.unit)]),
          ]),
        ]),
      )),
    ];
    if ((breakdown.values ?? []).length > 5) {
      children.push(element("p", { class: "outcome-breakdown__more" }, [
        `Showing 5 of ${breakdown.values.length}. Open Cloudflare for full detail.`,
      ]));
    }
    return element("section", { class: "outcome-breakdown" }, children);
  }));
}

function providerOutcomeDetails({
  note,
  outcomes,
  signals,
}: {
  note: string;
  outcomes: { label: string; outcome?: JsonRecord | null; linkLabel: string }[];
  signals: (JsonRecord | null | undefined)[];
}) {
  const recordedOutcomes = outcomes.filter((item) => item.outcome);
  const links = recordedOutcomes.flatMap((item) => {
    const link = providerLink(item.linkLabel, item.outcome?.providerUrl);
    return link ? [link] : [];
  });
  const facts = recordedOutcomes.flatMap((item) => [
    element("div", {}, [element("dt", {}, [`${item.label} period`]), element("dd", {}, [outcomePeriod(item.outcome)])]),
    element("div", {}, [element("dt", {}, [`${item.label} scope`]), element("dd", {}, [item.outcome?.scope ?? "Not measured"])]),
  ]);
  const signalNodes = signals.flatMap((signal) => signal ? [historySignal(signal)] : []);
  const breakdownNodes = recordedOutcomes.flatMap((item) => {
    const breakdown = outcomeBreakdowns(item.outcome);
    return breakdown ? [breakdown] : [];
  });
  const content: Node[] = [element("p", { class: "search-detail__note" }, [note])];
  if (links.length > 0) content.push(element("div", { class: "provider-links" }, links));
  if (facts.length > 0) content.push(element("dl", { class: "search-detail__facts" }, facts));
  if (signalNodes.length > 0) content.push(element("div", { class: "project-history-grid" }, signalNodes));
  content.push(...breakdownNodes);
  return element("div", { class: "search-detail" }, content);
}

function domainRatingSignal(signal?: JsonRecord | null) {
  if (!signal || !Number.isFinite(signal.value)) {
    return element("span", { class: "outcome-missing" }, ["Not measured"]);
  }
  return element("span", { class: "outcome-signal" }, [
    element("strong", {}, [new Intl.NumberFormat("en", { maximumFractionDigits: 1 }).format(signal.value)]),
    element("small", {}, ["0–100"]),
  ]);
}

function domainChangeSignal(signal?: JsonRecord | null) {
  if (!signal || !Number.isFinite(signal.delta)) {
    return element("span", { class: "outcome-missing" }, ["No comparison"]);
  }
  const sign = signal.delta > 0 ? "+" : "";
  const value = new Intl.NumberFormat("en", { maximumFractionDigits: 1 }).format(signal.delta);
  let tone = "neutral";
  if (signal.delta > 0) tone = "positive";
  if (signal.delta < 0) tone = "negative";
  return element("strong", { class: `outcome-change ${tone}` }, [`${sign}${value}`]);
}

function projectIdentity(row: JsonRecord, section?: string) {
  const href = `${projectHref(row.projectId)}${section ? `#${section}` : ""}`;
  return element("a", { class: "outcome-identity", href }, [
    element("strong", {}, [row.name]),
    element("small", {}, [row.domain ?? "No domain"]),
  ]);
}

function updateOutcomeTime(generatedAt: string) {
  const target = document.querySelector<HTMLElement>("[data-outcome-time]");
  if (target) target.textContent = `Evidence rebuilt ${formatted(generatedAt)}`;
}

function domainTrendChart(signal?: JsonRecord | null) {
  const series = (signal?.series ?? [])
    .filter((point: JsonRecord) => Number.isFinite(point.value) && point.observedAt)
    .slice(-30);
  if (series.length < 2) {
    return element("span", { class: "outcome-missing" }, [
      series.length === 1 ? "Baseline only" : "Not measured",
    ]);
  }
  const width = 180;
  const height = 48;
  const inset = 3;
  const values = series.map((point: JsonRecord) => Number(point.value));
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const flat = minimum === maximum;
  const visualMinimum = flat ? minimum - 1 : minimum;
  const visualMaximum = flat ? maximum + 1 : maximum;
  const points = series.map((point: JsonRecord, index: number) => ({
    ...point,
    x: inset + (index / Math.max(1, series.length - 1)) * (width - inset * 2),
    y: height - inset - ((Number(point.value) - visualMinimum) / (visualMaximum - visualMinimum)) * (height - inset * 2),
  }));
  const chartLabel = `D-Rank history from ${formattedDay(series[0].observedAt)} to ${formattedDay(series.at(-1).observedAt)}. Use Left and Right arrow keys to inspect ${series.length} observations.`;
  const chart = svgElement("svg", {
    viewBox: `0 0 ${width} ${height}`,
    preserveAspectRatio: "none",
    "aria-hidden": "true",
  }, [
    svgElement("polyline", {
      points: points.map((point: JsonRecord) => `${point.x},${point.y}`).join(" "),
      class: "domain-trend__line",
    }),
  ]);
  const tooltip = element("span", { class: "domain-trend__tooltip", role: "status" });
  tooltip.hidden = true;
  let selectedIndex = points.length - 1;
  const show = (index: number) => {
    selectedIndex = Math.max(0, Math.min(points.length - 1, index));
    const point = points[selectedIndex];
    tooltip.textContent = `${formattedDay(point.observedAt)} · D-Rank ${metricValue(Number(point.value))}`;
    tooltip.style.left = `${Math.max(8, Math.min(92, (point.x / width) * 100))}%`;
    tooltip.style.top = `${Math.max(18, Math.min(90, (point.y / height) * 100))}%`;
    tooltip.hidden = false;
  };
  const plot = element("span", {
    class: "domain-trend",
    role: "img",
    tabindex: "0",
    "aria-label": chartLabel,
  }, [chart, tooltip]);
  plot.addEventListener("pointermove", (event) => {
    const bounds = plot.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - bounds.left) / Math.max(1, bounds.width)));
    show(Math.round(ratio * (points.length - 1)));
  });
  plot.addEventListener("pointerleave", () => {
    if (document.activeElement !== plot) tooltip.hidden = true;
  });
  plot.addEventListener("focus", () => show(points.length - 1));
  plot.addEventListener("blur", () => { tooltip.hidden = true; });
  plot.addEventListener("keydown", (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    show(selectedIndex + (event.key === 'ArrowLeft' ? -1 : 1));
  });
  return plot;
}

async function renderDomains() {
  const payload = await api("/v1/outcomes/domains");
  updateOutcomeTime(payload.generatedAt);
  const rows = payload.rows ?? [];
  const columns: OutcomeColumn[] = [
    {
      key: "domain",
      label: "Domain",
      description: "Sort alphabetically by registrable domain",
      value: (row) => row.domain,
      render: (row) => element("span", { class: "outcome-identity" }, [
        element("strong", {}, [row.domain]),
        element("small", {}, [`${row.projects.length} active project${row.projects.length === 1 ? "" : "s"}`]),
      ]),
    },
    {
      key: "rating",
      label: "D-Rank",
      description: "Sort by latest domain rating",
      value: (row) => row.signal?.value,
      render: (row) => domainRatingSignal(row.signal),
    },
    {
      key: "change",
      label: "Change",
      description: "Sort by change between the latest observations",
      value: (row) => row.signal?.delta,
      render: (row) => domainChangeSignal(row.signal),
    },
    {
      key: "trend",
      label: "Trend",
      description: "Sort by D-Rank change and inspect dated history",
      value: (row) => row.signal?.delta,
      render: (row) => domainTrendChart(row.signal),
    },
    {
      key: "projects",
      label: "Active projects",
      description: "Sort by number of active projects on the domain",
      value: (row) => row.projects.length,
      render: (row) => {
        const visibleProjects = row.projects.slice(0, 3);
        const remaining = row.projects.length - visibleProjects.length;
        return element("span", { class: "outcome-project-links" }, [
          ...visibleProjects.map((project: JsonRecord) =>
            element("a", { href: `${projectHref(project.projectId)}#seo` }, [project.name])),
          remaining > 0 ? element("span", { class: "outcome-project-more" }, [`+${remaining} more`]) : null,
          row.projects.length === 0 ? element("span", { class: "outcome-project-more" }, ["0 active projects"]) : null,
        ]);
      },
    },
    {
      key: "observed",
      label: "Last observed",
      description: "Sort by observation time",
      value: (row) => row.observedAt ? Date.parse(row.observedAt) : null,
      render: (row) => formattedDay(row.observedAt),
    },
  ];
  replace("domains", rows.length
    ? outcomeTable(rows, columns, "change", "Fleet domain strength", "ascending")
    : empty("No matching domain", "The current project scope has no public domain."));
}

type SearchMetricKind = "count" | "percent" | "rank";

function searchReportingDay(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function updateSearchPeriod(rows: JsonRecord[]) {
  const target = document.querySelector<HTMLElement>("[data-search-period]");
  if (!target) return;
  const periods = new Map<string, { start: string; end: string }>();
  for (const row of rows) {
    const start = row.period?.start;
    const end = row.period?.end;
    if (typeof start !== "string" || typeof end !== "string") continue;
    periods.set(`${start}\n${end}`, { start, end });
  }
  if (periods.size === 0) {
    target.textContent = "Reporting period not measured";
    return;
  }
  if (periods.size > 1) {
    target.textContent = "Reporting periods vary by project";
    return;
  }
  const period = periods.values().next().value;
  if (!period) return;
  let label = `Reporting period ${searchReportingDay(period.start)} – ${searchReportingDay(period.end)}`;
  const startTime = Date.parse(period.start);
  const endTime = Date.parse(period.end);
  if (Number.isFinite(startTime) && Number.isFinite(endTime) && endTime >= startTime) {
    const days = Math.floor((endTime - startTime) / 86_400_000) + 1;
    label = `${label} · ${days} days`;
  }
  target.textContent = label;
}

function searchMetricText(value: unknown, kind: SearchMetricKind) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Not measured";
  const numericValue = value;
  if (kind === "count") {
    return new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(numericValue);
  }
  const formattedValue = new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(numericValue);
  if (kind === "percent") return `${formattedValue}%`;
  return `#${formattedValue}`;
}

function searchMetric(signal: JsonRecord | null | undefined, kind: SearchMetricKind) {
  if (!signal || !Number.isFinite(signal.value)) {
    return element("span", { class: "outcome-missing" }, ["Not measured"]);
  }
  return element("strong", { class: "search-metric" }, [searchMetricText(signal.value, kind)]);
}

function searchObservationHistory(row: JsonRecord) {
  const definitions = [
    { key: "impressions", label: "Search impressions", unit: "impressions", direction: "higher-is-better" },
    { key: "clicks", label: "Search clicks", unit: "clicks", direction: "higher-is-better" },
    { key: "averagePosition", label: "Average position", unit: "rank", direction: "lower-is-better" },
  ];
  const charts: Node[] = [];
  for (const definition of definitions) {
    const series = row[definition.key]?.series ?? [];
    if (series.length < 2) continue;
    charts.push(historyChart({
      label: definition.label,
      unit: definition.unit,
      direction: definition.direction,
      series,
    }));
  }
  if (charts.length === 0) return null;
  return element("div", { class: "search-detail__history" }, [
    element("h3", {}, ["Search history"]),
    element("div", { class: "search-detail__history-charts" }, charts),
  ]);
}

function searchTermsTable(row: JsonRecord) {
  const terms = [...(row.searchTerms ?? [])].sort((left: JsonRecord, right: JsonRecord) => {
    const priority = Number(left.action?.priority ?? 99) - Number(right.action?.priority ?? 99);
    if (priority !== 0) return priority;
    return Number(right.impressions ?? 0) - Number(left.impressions ?? 0);
  });
  if (terms.length === 0) {
    return element("div", { class: "search-detail__terms" }, [
      element("h2", {}, ["Search terms"]),
      element("p", { class: "search-detail__empty" }, [
        "No search terms were returned for this reporting window.",
      ]),
    ]);
  }
  const header = element("tr", {}, [
    element("th", { scope: "col" }, ["Search term"]),
    element("th", { scope: "col" }, ["Action"]),
    element("th", { scope: "col" }, ["Impressions"]),
    element("th", { scope: "col" }, ["Clicks"]),
    element("th", { scope: "col" }, ["CTR"]),
    element("th", { scope: "col" }, ["Avg position"]),
  ]);
  const rows = terms.map((term: JsonRecord, index: number) => {
    const identity: Node[] = [element("strong", {}, [term.query])];
    if (term.landingPage) {
      let label = term.landingPage;
      try {
        const url = new URL(term.landingPage);
        label = `${url.hostname}${url.pathname}`;
      } catch {}
      identity.push(element("a", {
        class: "search-term__page",
        href: term.landingPage,
        target: "_blank",
        rel: "noopener noreferrer",
      }, [label]));
    } else {
      identity.push(element("span", { class: "outcome-missing" }, ["Landing page unavailable"]));
    }
    const row = element("tr", {}, [
      element("th", { scope: "row", class: "search-term__identity" }, identity),
      element("td", { "data-label": "Action", class: "search-term__action" }, [searchActionLabel(term.action)]),
      element("td", { "data-label": "Impressions" }, [searchMetricText(term.impressions, "count")]),
      element("td", { "data-label": "Clicks" }, [searchMetricText(term.clicks, "count")]),
      element("td", { "data-label": "CTR" }, [searchMetricText(term.ctr, "percent")]),
      element("td", { "data-label": "Avg position" }, [searchMetricText(term.position, "rank")]),
    ]);
    if (index >= 10) row.hidden = true;
    return row;
  });
  const table = element("table", { "aria-label": `${row.name} Google Search terms` }, [
    element("thead", {}, [header]),
    element("tbody", {}, rows),
  ]);
  const controls: Node[] = [];
  if (rows.length > 10) {
    const button = element("button", {
      type: "button",
      class: "secondary-action search-terms-toggle",
      "aria-expanded": "false",
    }, [`Show ${rows.length - 10} more`]);
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      for (const item of rows.slice(10)) item.hidden = expanded;
      button.setAttribute("aria-expanded", String(!expanded));
      button.textContent = expanded ? `Show ${rows.length - 10} more` : "Show fewer";
    });
    controls.push(button);
  }
  return element("div", { class: "search-detail__terms" }, [
    element("h2", {}, ["Search terms"]),
    element("div", { class: "search-detail__terms-wrap" }, [table]),
    ...controls,
  ]);
}

function searchActionLabel(action?: JsonRecord | null) {
  if (!action?.label) return element("span", { class: "outcome-missing" }, ["Not measured"]);
  const reason = action.reason ? `${action.label}: ${action.reason}` : action.label;
  return element("span", {
    class: `search-action search-action--${action.id ?? "unknown"}`,
    title: action.reason ?? "",
    "aria-label": reason,
  }, [
    element("strong", {}, [action.label]),
    action.reason ? element("small", {}, [action.reason]) : null,
  ]);
}

function searchActionSortValue(action?: JsonRecord | null) {
  const priority = Number(action?.priority);
  if (!Number.isFinite(priority)) return null;
  return -priority;
}

function searchOutcomeDetails(row: JsonRecord) {
  let source = "Not measured";
  if (row.provider === "google-search-console") source = "Google Search Console";
  let period = "Not measured";
  if (row.period?.start && row.period?.end) {
    period = `${searchReportingDay(row.period.start)} – ${searchReportingDay(row.period.end)}`;
  }
  let note = "No Google Search Console observation is recorded for this project.";
  if (row.status === "zero-impressions") {
    note = "Google recorded zero impressions during this completed reporting window.";
  }
  if (row.status === "observed") {
    note = "These are aggregate Search Console results for the recorded project scope.";
    if (Number(row.impressions?.value) < 100) {
      note = "This is a low-volume result; CTR and average position may move sharply between windows.";
    }
  }
  const history = searchObservationHistory(row);
  const searchConsoleLink = providerLink("Open Search Console", row.providerUrl);
  const content: Node[] = [
    element("p", { class: "search-detail__note" }, [note]),
    element("dl", { class: "search-detail__facts" }, [
      element("div", {}, [element("dt", {}, ["Source"]), element("dd", {}, [source])]),
      element("div", {}, [element("dt", {}, ["Reporting period"]), element("dd", {}, [period])]),
      element("div", {}, [element("dt", {}, ["Property scope"]), element("dd", {}, [row.scope ?? "Not measured"])]),
      element("div", {}, [element("dt", {}, ["Stored snapshots"]), element("dd", {}, [String(row.observations ?? 0)])]),
    ]),
  ];
  if (searchConsoleLink) content.splice(1, 0, element("div", { class: "provider-links" }, [searchConsoleLink]));
  if (history) content.push(history);
  content.push(searchTermsTable(row));
  return element("div", { class: "search-detail" }, content);
}

async function renderSearch() {
  const payload = await api("/v1/outcomes/search");
  updateOutcomeTime(payload.generatedAt);
  const rows = payload.rows ?? [];
  updateSearchPeriod(rows);
  const columns: OutcomeColumn[] = [
    { key: "project", label: "Product", description: "Sort by project", value: (row) => row.name, render: (row) => projectIdentity(row, "search") },
    { key: "impressions", label: "Impressions", description: "Sort by Google Search impressions", value: (row) => row.impressions?.value, render: (row) => searchMetric(row.impressions, "count") },
    { key: "clicks", label: "Clicks", description: "Sort by Google Search clicks", value: (row) => row.clicks?.value, render: (row) => searchMetric(row.clicks, "count") },
    { key: "ctr", label: "CTR", description: "Sort by click-through rate", value: (row) => row.ctr?.value, render: (row) => searchMetric(row.ctr, "percent") },
    { key: "position", label: "Avg position", description: "Sort by average Google Search position", value: (row) => row.averagePosition?.value, render: (row) => searchMetric(row.averagePosition, "rank") },
    { key: "action", label: "Next action", description: "Sort by recommended next action", value: (row) => searchActionSortValue(row.action), render: (row) => searchActionLabel(row.action) },
    { key: "observed", label: "Last observed", description: "Sort by measurement time", value: (row) => row.observedAt ? Date.parse(row.observedAt) : null, render: (row) => formattedDay(row.observedAt) },
  ];
  replace("search", rows.length
    ? outcomeTable(
        rows,
        columns,
        "impressions",
        "Google Search results by project",
        "descending",
        { details: searchOutcomeDetails, rowKey: (row) => row.projectId },
      )
    : empty("No Google Search evidence", "No Search Console outcomes are recorded yet."));
}

type PortfolioMetricFamily = "drank" | "psi" | "search" | "cloudflare";

const CLOUDFLARE_VIEW_REFRESH: Record<string, () => Promise<void>> = {
  "ai-awareness": renderAiAwareness,
  performance: renderPerformance,
  marketing: renderMarketing,
};

async function refreshCloudflareView() {
  const view = document.body.dataset.founderView ?? "";
  const refresh = CLOUDFLARE_VIEW_REFRESH[view];
  if (refresh) await refresh();
}

const PORTFOLIO_REFRESH_CONFIG: Record<PortfolioMetricFamily, {
  idleLabel: string;
  runningLabel: string;
  startingMessage: string;
  completedMessage: string;
  failureMessage: string;
  maxAttempts: number;
  refresh: () => Promise<void>;
}> = {
  drank: {
    idleLabel: "Re-run",
    runningLabel: "Re-running…",
    startingMessage: "Starting D-Rank refresh…",
    completedMessage: "D-Rank updated.",
    failureMessage: "D-Rank refresh failed.",
    maxAttempts: 240,
    refresh: renderDomains,
  },
  psi: {
    idleLabel: "Run all PSI",
    runningLabel: "Running all…",
    startingMessage: "Starting performance refresh…",
    completedMessage: "Performance updated.",
    failureMessage: "Performance refresh failed.",
    maxAttempts: 2400,
    refresh: renderPerformance,
  },
  search: {
    idleLabel: "Update",
    runningLabel: "Updating…",
    startingMessage: "Updating Google Search evidence…",
    completedMessage: "Google Search evidence updated.",
    failureMessage: "Google Search update failed.",
    maxAttempts: 240,
    refresh: renderSearch,
  },
  cloudflare: {
    idleLabel: "Update Cloudflare",
    runningLabel: "Updating…",
    startingMessage: "Updating Cloudflare evidence…",
    completedMessage: "Cloudflare evidence updated.",
    failureMessage: "Cloudflare update failed.",
    maxAttempts: 240,
    refresh: refreshCloudflareView,
  },
};

function bindPortfolioRefresh(family: PortfolioMetricFamily) {
  const config = PORTFOLIO_REFRESH_CONFIG[family];
  const button = document.querySelector<HTMLButtonElement>(`[data-portfolio-refresh="${family}"]`);
  const statusText = document.querySelector<HTMLElement>(`[data-portfolio-refresh-status="${family}"]`);
  if (!button || button.dataset.bound === "true") return;
  button.dataset.bound = "true";
  button.addEventListener("click", async () => {
    button.disabled = true;
    button.textContent = config.runningLabel;
    if (statusText) statusText.textContent = config.startingMessage;
    try {
      const run = await startAndPollMetricRun({
        family,
        scope: "portfolio",
        statusText,
        maxAttempts: config.maxAttempts,
        isConnected: () => button.isConnected,
      });
      if (!run) return;
      if (run.state !== "succeeded") {
        throw new Error(run.summary || config.failureMessage);
      }
      await config.refresh();
      if (statusText) statusText.textContent = config.completedMessage;
    } catch (error) {
      if (statusText) {
        statusText.textContent = error instanceof Error ? error.message : config.failureMessage;
      }
    } finally {
      button.disabled = false;
      button.textContent = config.idleLabel;
    }
  });
}

async function renderAiAwareness() {
  const payload = await api("/v1/outcomes/ai-awareness");
  updateOutcomeTime(payload.generatedAt);
  const rows = payload.rows ?? [];
  const count = document.querySelector<HTMLElement>('[data-founder-count="ai-awareness"]');
  if (count) count.textContent = String(rows.length);
  const columns: OutcomeColumn[] = [
    { key: "project", label: "Core project", description: "Sort by project", value: (row) => row.name, render: (row) => projectIdentity(row, "geo") },
    { key: "status", label: "Awareness", description: "Sort by evidence state", value: (row) => row.status, render: (row) => state(row.status) },
    { key: "crawls", label: "AI crawls", description: "Sort by verified AI crawler requests", value: (row) => row.crawlerRequests?.value, render: (row) => outcomeSignal(row.crawlerRequests) },
    { key: "referrals", label: "AI visits", description: "Sort by visits referred by AI assistants", value: (row) => row.aiReferralVisits?.value, render: (row) => outcomeSignal(row.aiReferralVisits) },
    { key: "mention", label: "Mentioned", description: "Sort by model mention rate", value: (row) => row.mention?.value, render: (row) => outcomeSignal(row.mention) },
    { key: "recommendation", label: "Recommended", description: "Sort by recommendation rate", value: (row) => row.recommendation?.value, render: (row) => outcomeSignal(row.recommendation) },
    { key: "citation", label: "Cited", description: "Sort by citation rate", value: (row) => row.citation?.value, render: (row) => outcomeSignal(row.citation) },
    { key: "rank", label: "Average rank", description: "Sort by average answer rank", value: (row) => row.averageRank?.value, render: (row) => outcomeSignal(row.averageRank) },
    { key: "observed", label: "Last observed", description: "Sort by provider observation time", value: (row) => row.observedAt ? Date.parse(row.observedAt) : null, render: (row) => formattedDay(row.observedAt) },
  ];
  replace("ai-awareness", rows.length
    ? outcomeTable(rows, columns, "project", "Core project AI awareness", "ascending", {
        rowKey: (row) => row.projectId,
        details: (row) => providerOutcomeDetails({
          note: "Cloudflare shows whether AI systems reached the product and whether people arrived from AI assistants. Model-answer evidence remains a separate outcome.",
          outcomes: [
            { label: "AI crawl", outcome: row.discovery?.crawler, linkLabel: "Open Cloudflare AI" },
            { label: "AI referral", outcome: row.discovery?.referral, linkLabel: "Open Cloudflare Traffic" },
          ],
          signals: [row.crawlerRequests, row.aiReferralVisits],
        }),
      })
    : empty("No core project in scope", "AI awareness is limited to maintained P1 products."));
}

function performanceRunControl(row: JsonRecord) {
  const wrap = element("div", { class: "outcome-run-control" });
  const statusText = element("span", { role: "status", "aria-live": "polite" });
  const button = element("button", { type: "button", class: "secondary-action" }, ["Run PSI"]);
  button.addEventListener("click", async () => {
    button.disabled = true;
    button.textContent = "Running…";
    statusText.textContent = "Starting PSI…";
    try {
      const run = await startAndPollMetricRun({
        family: "psi",
        projectId: row.catalogProjectId ?? row.projectId,
        statusText,
        isConnected: () => button.isConnected,
      });
      if (!run) return;
      if (run.state !== "succeeded") {
        throw new Error(run.summary || "Performance refresh failed.");
      }
      statusText.textContent = "Updated.";
      await renderPerformance();
    } catch (error) {
      statusText.textContent = error instanceof Error ? error.message : "Performance refresh failed.";
    } finally {
      button.disabled = false;
      button.textContent = "Run PSI";
    }
  });
  wrap.append(button, statusText);
  return wrap;
}

async function renderPerformance() {
  const payload = await api("/v1/outcomes/performance");
  updateOutcomeTime(payload.generatedAt);
  const rows = payload.rows ?? [];
  const columns: OutcomeColumn[] = [
    { key: "project", label: "Product", description: "Sort by project", value: (row) => row.name, render: (row) => projectIdentity(row, "performance") },
    { key: "status", label: "Guardrail", description: "Sort by guardrail state", value: (row) => row.status, render: (row) => state(row.status) },
    { key: "psi", label: "PSI", description: "Sort by PageSpeed performance score", value: (row) => row.psi?.value, render: (row) => outcomeSignal(row.psi) },
    { key: "lcp", label: "Lab LCP", description: "Sort by lab Largest Contentful Paint", value: (row) => row.lcp?.value, render: (row) => outcomeSignal(row.lcp) },
    { key: "fieldLcp", label: "Field LCP", description: "Sort by real-user p75 Largest Contentful Paint", value: (row) => row.fieldLcp?.value, render: (row) => outcomeSignal(row.fieldLcp) },
    { key: "observed", label: "Last observed", description: "Sort by measurement time", value: (row) => row.observedAt ? Date.parse(row.observedAt) : null, render: (row) => formattedDay(row.observedAt) },
    { key: "run", label: "Run", description: "Refresh one product", sortable: false, value: (row) => row.projectId, render: performanceRunControl },
  ];
  replace("performance", rows.length
    ? outcomeTable(rows, columns, "project", "Fleet public product performance", "ascending", {
        rowKey: (row) => row.projectId,
        details: (row) => providerOutcomeDetails({
          note: "PSI is a lab run. Cloudflare field metrics are p75 measurements from real visits during the recorded period.",
          outcomes: [{ label: "Field performance", outcome: row.field, linkLabel: "Open Cloudflare Speed" }],
          signals: [row.psi, row.lcp, row.fieldLcp, row.fieldInp, row.fieldCls, row.fieldTtfb, row.rumSamples],
        }),
      })
    : empty("No matching public product", "The current project scope has no public performance target."));
}

async function renderMetrics() {
  const payload = await api("/v1/connections");
  const renderedAt = document.querySelector<HTMLElement>("[data-connections-time]");
  if (renderedAt) renderedAt.textContent = `Reports rebuilt ${formatted(payload.generatedAt)}`;
  const eligibleProjects = payload.outputs.projects
    .filter((project: JsonRecord) => project.metricEligibility?.publicSite === true)
    .filter((project: JsonRecord) => !selectedProjectId || project.projectId === selectedProjectId)
    .sort((left: JsonRecord, right: JsonRecord) => left.name.localeCompare(right.name));
  const projectCount = document.querySelector<HTMLElement>('[data-founder-count="metric-projects"]');
  if (projectCount) projectCount.textContent = String(eligibleProjects.length);
  replace(
    "metric-projects",
    eligibleProjects.length
      ? metricMatrix(eligibleProjects)
      : empty("No matching project", "The current project scope has no eligible public measurement surface."),
  );
  replace("connection-overview", connectionMap(payload));

  const gaps = payload.connections
    .filter((item: JsonRecord) => ["missing", "partial", "unavailable"].includes(item.status) || item.freshness === "stale")
    .sort((left: JsonRecord, right: JsonRecord) => {
      const leftState = left.freshness === "stale" ? "stale" : left.status;
      const rightState = right.freshness === "stale" ? "stale" : right.status;
      const order: JsonRecord = { missing: 0, unavailable: 1, stale: 2, partial: 3 };
      return (order[leftState] ?? 4) - (order[rightState] ?? 4);
    });
  const gapCount = document.querySelector<HTMLElement>('[data-founder-count="connection-gaps"]');
  if (gapCount) gapCount.textContent = String(gaps.length);
  replace(
    "connection-gaps",
    gaps.length
      ? element("div", { class: "record-list" }, gaps.map(connectionGap))
      : empty("Every intended connection is complete", "No missing or partial relationship is present."),
  );

  const count = document.querySelector<HTMLElement>('[data-founder-count="connections"]');
  if (count) count.textContent = String(payload.connections.length);
  replace("connections", element("div", { class: "connection-ledger" }, payload.connections.map(connectionLedgerItem)));
  replace("connection-evidence", connectionEvidence(payload));
  wireSystemSheet();
  revealTargetedConnection();
  window.addEventListener("hashchange", revealTargetedConnection);
}

async function renderSkillUses() {
  const payload = await api("/v1/connections");
  const renderedAt = document.querySelector<HTMLElement>("[data-skill-uses-time]");
  if (renderedAt) renderedAt.textContent = `Runs rebuilt ${formatted(payload.generatedAt)}`;
  const projectRuns = selectedProjectId
    ? payload.outputs.skillRuns.filter((run: JsonRecord) => run.projectId === selectedProjectId)
    : payload.outputs.skillRuns;
  const skills = [...new Set(projectRuns.map((run: JsonRecord) => run.skillId))].sort();
  const query = new URLSearchParams(window.location.search);
  let selectedSkill = skills.includes(query.get("skill") ?? "") ? query.get("skill") ?? "" : "";
  let page = Math.max(1, Number.parseInt(query.get("page") ?? "1", 10) || 1);
  const pageSize = 15;

  const syncUrl = () => {
    const params = new URLSearchParams(window.location.search);
    if (selectedSkill) params.set("skill", selectedSkill);
    else params.delete("skill");
    if (page > 1) params.set("page", String(page));
    else params.delete("page");
    const suffix = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${suffix ? `?${suffix}` : ""}${window.location.hash}`);
  };

  const draw = () => {
    const filteredRuns = selectedSkill
      ? projectRuns.filter((run: JsonRecord) => run.skillId === selectedSkill)
      : projectRuns;
    const pages = Math.max(1, Math.ceil(filteredRuns.length / pageSize));
    page = Math.min(page, pages);
    syncUrl();
    const first = (page - 1) * pageSize;
    const pageRuns = filteredRuns.slice(first, first + pageSize);
    const history = skillHistoryForRuns(filteredRuns);
    const runCount = document.querySelector<HTMLElement>('[data-founder-count="skill-runs"]');
    if (runCount) runCount.textContent = String(filteredRuns.length);

    const select = element("select", { id: "skill-filter-select", name: "skill" }, [
      element("option", { value: "" }, ["All skills"]),
      ...skills.map((skill) => element("option", {
        value: skill,
        ...(selectedSkill === skill ? { selected: "" } : {}),
      }, [titleCase(skill)])),
    ]);
    select.addEventListener("change", () => {
      selectedSkill = select.value;
      page = 1;
      syncUrl();
      draw();
    });
    const previous = element("button", {
      type: "button",
      class: "secondary-action",
      ...(page <= 1 ? { disabled: "" } : {}),
    }, ["Previous"]);
    const next = element("button", {
      type: "button",
      class: "secondary-action",
      ...(page >= pages ? { disabled: "" } : {}),
    }, ["Next"]);
    previous.addEventListener("click", () => {
      page -= 1;
      syncUrl();
      draw();
    });
    next.addEventListener("click", () => {
      page += 1;
      syncUrl();
      draw();
    });
    replace("skill-controls", element("div", { class: "skill-ledger-controls" }, [
      element("label", { for: "skill-filter-select" }, [
        element("span", {}, ["Skill"]),
        select,
      ]),
      element("div", { class: "skill-ledger-pagination" }, [
        element("span", {}, [
          filteredRuns.length
            ? `${first + 1}–${Math.min(first + pageSize, filteredRuns.length)} of ${filteredRuns.length}`
            : "0 runs",
        ]),
        previous,
        next,
      ]),
    ]));
    replace(
      "skill-outcomes",
      history.length
        ? skillOutcomeCharts(history)
        : empty("No run outcomes", "A retained run will create the first success or failure period."),
    );
    replace(
      "skill-runs",
      pageRuns.length
        ? skillLedger(pageRuns)
        : empty("No recorded skill uses", "No retained run matches this project and skill filter."),
    );
  };
  syncUrl();
  draw();
}

async function renderFeedback() {
  const payload = await api("/v1/connections");
  const renderedAt = document.querySelector<HTMLElement>("[data-feedback-time]");
  if (renderedAt) renderedAt.textContent = `Inbox rebuilt ${formatted(payload.generatedAt)}`;
  const submissions = (payload.outputs.feedback?.submissions ?? [])
    .filter((item: JsonRecord) => !selectedProjectId || item.projectId === selectedProjectId);
  const count = document.querySelector<HTMLElement>('[data-founder-count="feedback-submissions"]');
  if (count) count.textContent = String(submissions.length);
  replace(
    "feedback-submissions",
    submissions.length
      ? element("div", { class: "feedback-inbox" }, submissions.map((item: JsonRecord) =>
          element("article", { class: "feedback-entry" }, [
            element("header", {}, [
              element("div", {}, [
                element("span", {}, [item.projectId ?? "Unknown project"]),
                element("h3", {}, [item.category ?? "Feedback"]),
              ]),
              element("time", { datetime: item.receivedAt }, [formatted(item.receivedAt)]),
            ]),
            element("p", {}, [item.message]),
            element("footer", {}, [
              item.page ? element("span", {}, [item.page]) : null,
              item.hasAttachment ? element("span", {}, ["Attachment"]) : null,
            ]),
          ])))
      : empty(
          "No feedback received",
          selectedProjectId ? `${selectedProjectName} has no submissions yet.` : "No project has submitted feedback yet.",
        ),
  );
}

async function renderDecisions() {
  const decisions = await api("/v1/decisions");
  const groups = ["open", "stale", "resolved", "rejected", "reversed"];
  for (const group of groups) {
    const items = decisions.filter((decision: JsonRecord) => decision.state === group);
    const count = document.querySelector<HTMLElement>(`[data-founder-count="${group}"]`);
    if (count) count.textContent = String(items.length);
    replace(group, items.length ? element("div", { class: "decision-grid" }, items.map(decisionCard)) : empty(`No ${group} decisions`, "This is a factual empty state."));
  }
}

async function renderProjects() {
  const projects = await api("/v1/projects");
  const activeProjects = projects.filter(
    (project: JsonRecord) =>
      project.lifecycle !== "non-product" &&
      project.attention !== "ignored" &&
      (!selectedProjectId || project.id === selectedProjectId),
  ).sort((left: JsonRecord, right: JsonRecord) => left.name.localeCompare(right.name));
  const renderedAt = document.querySelector<HTMLElement>("[data-project-status-time]");
  if (renderedAt) renderedAt.textContent = `${activeProjects.length} active records`;
  const directory = element("div", { class: "project-directory" }, activeProjects.map((project: JsonRecord) => {
    const actions = element("div", { class: "project-directory__actions" }, [
      project.websiteUrl
        ? element("a", { href: project.websiteUrl, target: "_blank", rel: "noreferrer" }, ["Open"])
        : element("span", { class: "unavailable" }, ["No website"]),
      project.changelogUrl
        ? element("a", { href: project.changelogUrl, target: "_blank", rel: "noreferrer" }, ["Changelog"])
        : element("span", { class: "unavailable" }, ["No changelog"]),
      project.repositoryUrl
        ? element("a", { href: project.repositoryUrl, target: "_blank", rel: "noreferrer" }, ["Source"])
        : element("span", { class: "unavailable" }, ["No source"]),
    ]);
    return element("article", { class: "project-directory__row" }, [
      element("a", { class: "project-directory__identity", href: projectHref(project.id) }, [
        element("span", {}, [
          project.familyName ?? project.family ?? project.id,
          " · ",
          titleCase(project.lifecycle ?? "unknown"),
        ]),
        element("h3", {}, [project.name]),
        element("p", {}, [
          project.description
            ?? (project.domains?.[0] ? project.domains[0] : project.repo ?? "Canonical Fleet project"),
        ]),
        element("small", { class: "project-directory__domain" }, [
          project.domains?.[0] ?? "No domain",
        ]),
      ]),
      state(project.status ?? project.lifecycle ?? "unknown"),
      actions,
    ]);
  }));
  const count = document.querySelector<HTMLElement>('[data-founder-count="project-statuses"]');
  if (count) count.textContent = String(activeProjects.length);
  replace("project-statuses", activeProjects.length ? directory : empty("No projects", "The canonical registry did not return a matching project."));
}

function projectMetricPanel(
  project: JsonRecord,
  improvements: JsonRecord[],
  family: MetricFamily,
) {
  const definition = METRIC_FAMILIES[family];
  const signals = project.history.signals.filter(definition.matchesSignal);
  const historyState = metricFamilyHistoryState(definition, project, signals);
  const observedAt = metricFamilyObservedAt(definition, project, signals);
  const evidence = definition.renderEvidence(project, signals, definition.emptyState(project));
  const actions = improvements
    .filter((action: JsonRecord) =>
      action.projectId === project.projectId && definition.matchesAction(action))
    .map((action: JsonRecord) => {
      const content = [
        element("span", {}, ["Next"]),
        element("strong", {}, [action.action]),
        state(action.work?.state ?? "not-started"),
      ];
      if (!action.work) {
        return element("div", { class: "metric-report__action" }, content);
      }
      return element("a", {
        class: "metric-report__action",
        href: consoleHref(action.work.ownerPath),
      }, content);
    });
  return element("article", { class: "metric-report project-metric-panel" }, [
    element("header", {}, [
      element("div", {}, [
        element("h3", {}, [definition.title]),
        element("small", {}, [
          observedAt ? formatted(observedAt) : "No observation",
        ]),
      ]),
      element("div", { class: "metric-report__header-actions" }, [
        state(historyState),
        metricRunButton(project, family),
        metricRunBoundary(family),
      ]),
    ]),
    evidence,
    ...actions,
  ]);
}

function projectMetricSection(
  project: JsonRecord,
  improvements: JsonRecord[],
  section: "seo" | "geo" | "performance" | "design",
  title: string,
  description: string,
  families: MetricFamily[],
) {
  return element("section", {
    class: "owner-section project-metric-section",
    id: section,
    "aria-labelledby": `${section}-title`,
  }, [
    element("div", { class: "section-head" }, [
      element("div", {}, [
        element("h2", { id: `${section}-title` }, [title]),
        element("p", {}, [description]),
      ]),
    ]),
    element("div", { class: "project-metric-grid" }, families.map((family) =>
      projectMetricPanel(project, improvements, family))),
  ]);
}

function projectMetricsWorkspace(project: JsonRecord, improvements: JsonRecord[]) {
  return element("div", { class: "project-metrics-workspace" }, [
    projectMetricSection(
      project,
      improvements,
      "seo",
      "SEO",
      "What people search for, where this domain ranks, and whether the site has enough owned content.",
      ["drank", "search", "coverage"],
    ),
    projectMetricSection(
      project,
      improvements,
      "geo",
      "GEO",
      "Which questions surface this product, whether answer engines cite it, and whether AI crawlers can reach it.",
      ["ai", "crawl", "agent"],
    ),
    projectMetricSection(
      project,
      improvements,
      "performance",
      "Performance",
      "Current PSI score, LCP, CLS, and their historical movement.",
      ["psi"],
    ),
    projectMetricSection(
      project,
      improvements,
      "design",
      "Design",
      "The latest critique, audit result, and any comparable review history.",
      ["design"],
    ),
  ]);
}

function revealProjectMetricSection() {
  const id = window.location.hash.slice(1);
  if (!["seo", "geo", "performance", "design"].includes(id)) return;
  document.getElementById(id)?.scrollIntoView({ block: "start" });
}

async function renderProjectDetail() {
  const routeProjectId = document.body.dataset.projectId;
  const projectId = catalogProjectId(routeProjectId);
  const [projects, missions, decisions, recommendations, connections] = await Promise.all([
    api("/v1/projects"),
    api("/v1/missions"),
    api("/v1/decisions"),
    api("/v1/home").then((home) => home.recommendedNext),
    api("/v1/connections"),
  ]);
  const project = projects.find((item: JsonRecord) => item.id === projectId);
  if (!project) {
    replace("project-detail", empty("Project not in current registry", "This static route no longer resolves to a canonical Fleet project."));
    return;
  }
  const projectMissions = missions.filter((mission: JsonRecord) => mission.projectId === project.id);
  const current = projectMissions.find((mission: JsonRecord) => ["active", "blocked", "awaiting-verification", "accepted"].includes(mission.state));
  const completed = projectMissions.filter((mission: JsonRecord) => mission.state === "completed");
  const needsMe = decisions.filter((decision: JsonRecord) => decision.projectId === project.id && ["open", "stale"].includes(decision.state));
  const next = recommendations.filter((item: JsonRecord) => item.projectId === project.id);
  const metricProject = connections.outputs.projects.find(
    (item: JsonRecord) =>
      item.catalogProjectId === project.id || item.projectId === project.id,
  );
  const metricImprovements = connections.outputs.improvements.filter(
    (item: JsonRecord) => item.projectId === project.id,
  );
  const wrap = element("div");
  wrap.append(
    element("div", { class: "project-list" }, [
      element("article", { class: "project" }, [
        element("header", {}, [element("h2", {}, ["Owner view"]), state(project.attention)]),
        element("dl", {}, [
          element("div", {}, [element("dt", {}, ["Current objective"]), element("dd", {}, [current?.outcome ?? "No accepted mission"])]),
          element("div", {}, [element("dt", {}, ["Needs you"]), element("dd", {}, [needsMe[0]?.question ?? "No"])]),
          element("div", {}, [element("dt", {}, ["Latest outcome"]), element("dd", {}, [completed[0]?.latestSummary ?? "None verified"])]),
          element("div", {}, [element("dt", {}, ["Next suggestion"]), element("dd", {}, [next[0]?.title ?? "No recommendation"])]),
        ]),
      ]),
      element("article", { class: "project" }, [
        element("header", {}, [element("h2", {}, ["Canonical record"]), state(project.status)]),
        element("dl", {}, [
          element("div", {}, [element("dt", {}, ["Family"]), element("dd", {}, [project.family ?? project.id])]),
          element("div", {}, [element("dt", {}, ["Priority"]), element("dd", {}, [project.priority ?? "Unranked"])]),
          element("div", {}, [element("dt", {}, ["Domain"]), element("dd", {}, [project.domains?.[0] ?? "No public domain"])]),
          element("div", {}, [element("dt", {}, ["Deploy surface"]), element("dd", {}, [project.deployKind ?? "Unknown"])]),
        ]),
        element("div", { class: "project-directory__actions project__links" }, [
          project.websiteUrl
            ? element("a", { href: project.websiteUrl, target: "_blank", rel: "noreferrer" }, ["Open"])
            : null,
          project.changelogUrl
            ? element("a", { href: project.changelogUrl, target: "_blank", rel: "noreferrer" }, ["Changelog"])
            : null,
          project.repositoryUrl
            ? element("a", { href: project.repositoryUrl, target: "_blank", rel: "noreferrer" }, ["Source"])
            : null,
        ]),
      ]),
    ]),
    element("section", { class: "owner-section" }, [
      element("div", { class: "section-head" }, [element("div", {}, [element("p", { class: "eyebrow" }, ["Work"]), element("h2", {}, ["Missions"])]), element("span", { class: "count" }, [String(projectMissions.length)])]),
      projectMissions.length ? element("div", { class: "record-list" }, projectMissions.map(missionRecord)) : empty("No missions for this product", "The registry record exists, but Foundry has not accepted work against it."),
    ]),
    metricProject
      ? projectMetricsWorkspace(metricProject, metricImprovements)
      : element("section", { class: "owner-section" }, [
          empty("No project measurements", "This project is not part of the current Metrics coverage set."),
        ]),
  );
  replace("project-detail", wrap);
  window.setTimeout(revealProjectMetricSection, 100);
}

async function renderActivity() {
  const activity = await api("/v1/activity");
  replace("activity", activity.length ? element("div", { class: "timeline" }, activity.map(activityItem)) : empty("No mission activity", "Provider noise is intentionally excluded."));
}

function percentage(value?: number | null) {
  return Number.isFinite(value) ? `${Math.round(Number(value) * 100)}%` : "—";
}

function money(value?: number | null) {
  return Number.isFinite(value) ? `$${Number(value).toFixed(4)}` : "—";
}

function visibilityMetric(label: string, value: string, detail?: string) {
  return element("div", { class: "visibility-metric" }, [
    element("span", {}, [label]),
    element("strong", {}, [value]),
    detail ? element("small", {}, [detail]) : null,
  ]);
}

function visibilityProject(project: JsonRecord) {
  if (!project.latest) {
    return element("article", { class: "visibility-project" }, [
      element("header", {}, [
        element("div", {}, [element("span", { class: "record-kicker" }, [project.attention]), element("h3", {}, [project.name])]),
        state("unverified"),
      ]),
      empty("No local run yet", "Run an approved fixture canary to create a normalized baseline. Recurring checks remain off."),
    ]);
  }
  const latest = project.latest;
  const metrics = latest.metrics ?? {};
  const competitor = Object.entries(metrics.competitorShare ?? {}).sort(
    (left: [string, any], right: [string, any]) => Number(right[1]) - Number(left[1]),
  )[0];
  const scoreDelta = project.comparison?.deltas?.visibilityScore;
  const trend = Number.isFinite(scoreDelta)
    ? `${Number(scoreDelta) > 0 ? "+" : ""}${scoreDelta} points`
    : "No baseline";
  const history = element("details", { class: "visibility-history" }, [
    element("summary", {}, [`${project.history.length} local run${project.history.length === 1 ? "" : "s"}`]),
    element("div", { class: "record-list" }, project.history.slice(0, 6).map((run: JsonRecord) =>
      element("div", { class: "record" }, [
        element("div", { class: "record-main" }, [
          element("h3", {}, [`${run.metrics.visibilityScore}/100 visibility`]),
          element("p", {}, [`${percentage(run.metrics.coverageRate)} coverage · ${run.coverage.cached} cached · ${run.coverage.failed + run.coverage.timedOut + run.coverage.unavailable} unavailable or failed`]),
        ]),
        element("div", { class: "record-side" }, [
          element("strong", {}, [money(run.cost.observedUsd)]),
          element("small", {}, [formatted(run.observedAt)]),
        ]),
      ]))),
  ]);
  return element("article", { class: "visibility-project" }, [
    element("header", {}, [
      element("div", {}, [element("span", { class: "record-kicker" }, [project.attention]), element("h3", {}, [project.name])]),
      state(latest.freshness),
    ]),
    element("div", { class: "visibility-metrics" }, [
      visibilityMetric("Visibility", `${metrics.visibilityScore}/100`, trend),
      visibilityMetric("Recommended", percentage(metrics.recommendationRate)),
      visibilityMetric("Average rank", metrics.averagePosition ? `#${metrics.averagePosition}` : "Not ranked"),
      visibilityMetric("Citations", String(latest.citations.total), `${latest.citations.hosts.length} source hosts`),
      visibilityMetric("Top competitor", competitor ? percentage(Number(competitor[1])) : "None", competitor?.[0]),
      visibilityMetric("Coverage", percentage(metrics.coverageRate), `${latest.coverage.completed + latest.coverage.cached}/${latest.coverage.configured} answers`),
      visibilityMetric("Freshness", formatted(latest.observedAt), latest.freshness),
      visibilityMetric("Observed cost", money(latest.cost.observedUsd), `${latest.cost.cacheHits} cache hits`),
    ]),
    history,
  ]);
}

async function renderMarketing() {
  const payload = await api("/v1/outcomes/marketing");
  updateOutcomeTime(payload.generatedAt);
  const rows = (payload.rows ?? []).filter((row: JsonRecord) => matchesProject(row.projectId));
  const count = document.querySelector<HTMLElement>('[data-founder-count="marketing-coverage"]');
  if (count) count.textContent = String(rows.length);
  const columns: OutcomeColumn[] = [
    { key: "project", label: "Product", description: "Sort by product", value: (row) => row.name, render: (row) => projectIdentity(row) },
    { key: "positioning", label: "Positioning", description: "Sort by positioning readiness", value: (row) => row.positioning, render: (row) => element("span", { class: "outcome-positioning" }, [row.description ?? "No public positioning recorded"]) },
    { key: "visits", label: "Visits", description: "Sort by Cloudflare Web Analytics visits", value: (row) => row.visits?.value, render: (row) => outcomeSignal(row.visits) },
    { key: "pageViews", label: "Page views", description: "Sort by Cloudflare Web Analytics page views", value: (row) => row.pageViews?.value, render: (row) => outcomeSignal(row.pageViews) },
    { key: "published", label: "Last published", description: "Sort by latest publishing receipt", value: (row) => row.latestOutcome?.observedAt ? Date.parse(row.latestOutcome.observedAt) : null, render: (row) => row.latestOutcome ? formattedDay(row.latestOutcome.observedAt) : "Never" },
    { key: "recommendations", label: "Next actions", description: "Sort by recommendation count", value: (row) => row.recommendationCount, render: (row) => String(row.recommendationCount) },
    { key: "status", label: "Coverage", description: "Sort by marketing coverage state", value: (row) => row.status, render: (row) => state(row.status) },
  ];
  replace("marketing-coverage", rows.length
    ? outcomeTable(rows, columns, "project", "Fleet product marketing coverage", "ascending", {
        rowKey: (row) => row.projectId,
        details: (row) => providerOutcomeDetails({
          note: "Cloudflare Web Analytics shows whether distribution produced visits. Expand the breakdowns to see the pages and referrers responsible.",
          outcomes: [{ label: "Traffic", outcome: row.traffic, linkLabel: "Open Cloudflare Traffic" }],
          signals: [row.visits, row.pageViews, row.searchReferrals],
        }),
      })
    : empty("No matching product", "The current project scope has no public marketing target."));
}

async function renderMission() {
  const missionId = new URLSearchParams(location.search).get("id");
  const host = document.querySelector<HTMLElement>("[data-mission]");
  if (!host) return;
  if (!missionId) {
    const missions = await api("/v1/missions");
    host.replaceChildren(missions.length ? element("div", { class: "record-list" }, missions.map(missionRecord)) : empty("No missions yet", "Draft one through the local control service."));
    return;
  }
  const [mission, decisions] = await Promise.all([
    api(`/v1/missions/${encodeURIComponent(missionId)}`),
    api("/v1/decisions"),
  ]);
  const latestOutcome = mission.outcomes.at(-1);
  const missionDecisions = decisions.filter((decision: JsonRecord) => decision.missionId === mission.id);
  const evidence = mission.evidence.length ? element("div", { class: "record-list" }, mission.evidence.map((pointer: JsonRecord) =>
    element("div", { class: "record" }, [
      element("div", { class: "record-main" }, [element("h3", {}, [`${pointer.provider} · ${pointer.kind}`]), element("p", {}, [pointer.summary ? JSON.stringify(pointer.summary) : "Evidence pointer only"])]),
      element("div", { class: "record-side" }, [state(pointer.currentState ?? pointer.state), element("small", {}, [formatted(pointer.observedAt)])]),
    ]))) : empty("No evidence attached", "This mission has not received a provider receipt.");
  const deliverables = mission.deliverables.length
    ? element("div", { class: "record-list" }, mission.deliverables.map((item: JsonRecord) =>
        element("div", { class: "record" }, [
          element("div", { class: "record-main" }, [
            element("h3", {}, [item.title]),
            element("p", {}, [item.kind]),
          ]),
          item.url
            ? element("a", { class: "action-link", href: item.url, target: "_blank", rel: "noreferrer" }, ["Open"])
            : null,
        ])))
    : empty("No deliverables recorded", "Deliverables appear after an actor attaches a durable receipt.");
  host.replaceChildren(
    element("section", { class: "mission-hero" }, [
      element("div", {}, [state(mission.state), element("h2", {}, [mission.title]), element("p", { class: "lede" }, [mission.outcome])]),
      element("div", { class: "mission-meta" }, [
        element("div", {}, [element("span", {}, ["Project"]), element("strong", {}, [mission.projectId ?? "Portfolio"])]),
        element("div", {}, [element("span", {}, ["Actor"]), element("strong", {}, [mission.actor?.label ?? mission.actor?.id ?? "Unassigned"])]),
        element("div", {}, [element("span", {}, ["Updated"]), element("strong", {}, [formatted(mission.updatedAt)])]),
        element("div", {}, [element("span", {}, ["Outcome"]), element("strong", {}, [latestOutcome?.verdict ?? "Not measured"])]),
      ]),
    ]),
    element("section", { class: "owner-section" }, [
      element("div", { class: "section-head" }, [
        element("div", {}, [element("p", { class: "eyebrow" }, ["Proof"]), element("h2", {}, ["Evidence"])]),
      ]),
      evidence,
    ]),
    element("section", { class: "owner-section" }, [
      element("div", { class: "section-head" }, [
        element("div", {}, [element("p", { class: "eyebrow" }, ["Output"]), element("h2", {}, ["Deliverables"])]),
      ]),
      deliverables,
    ]),
    element("section", { class: "owner-section" }, [
      element("div", { class: "section-head" }, [
        element("div", {}, [element("p", { class: "eyebrow" }, ["Judgment"]), element("h2", {}, ["Owner decisions"])]),
      ]),
      missionDecisions.length
        ? element("div", { class: "decision-grid" }, missionDecisions.map(decisionCard))
        : empty("No owner decision attached", "This mission has not needed an explicit choice."),
    ]),
    element("section", { class: "owner-section" }, [element("div", { class: "section-head" }, [element("div", {}, [element("p", { class: "eyebrow" }, ["History"]), element("h2", {}, ["Mission timeline"])])]), element("div", { class: "timeline" }, mission.timeline.map(activityItem))]),
  );
}

async function start() {
  const view = document.body.dataset.founderView;
  if (!view) return;
  const slots = document.querySelectorAll<HTMLElement>("[data-founder-slot]");
  slots.forEach((slot) => {
    slot.setAttribute("aria-busy", "true");
  });
  try {
    await initProjectScope();
    if (view === "domains") {
      bindPortfolioRefresh("drank");
      await renderDomains();
    }
    if (view === "search") {
      bindPortfolioRefresh("search");
      await renderSearch();
    }
    if (view === "ai-awareness") {
      bindPortfolioRefresh("cloudflare");
      await renderAiAwareness();
    }
    if (view === "home") await renderHome();
    if (view === "project-statuses") await renderProjects();
    if (view === "project") await renderProjectDetail();
    if (view === "metrics") await renderMetrics();
    if (view === "skill-uses") await renderSkillUses();
    if (view === "feedback") await renderFeedback();
    if (view === "marketing") {
      bindPortfolioRefresh("cloudflare");
      await renderMarketing();
    }
    if (view === "performance") {
      bindPortfolioRefresh("psi");
      bindPortfolioRefresh("cloudflare");
      await renderPerformance();
    }
    if (view === "mission") await renderMission();
    connection?.classList.add("online");
    if (connectionLabel) connectionLabel.textContent = "Live evidence";
  } catch (error) {
    document.querySelector<HTMLElement>("[data-founder-global-status]")?.replaceChildren(errorState(error));
    slots.forEach((slot) => {
      slot.className = "";
      slot.setAttribute("aria-busy", "false");
      slot.replaceChildren(empty("Unavailable", "This view will recover when the local control service returns."));
    });
    connection?.classList.add("offline");
    if (connectionLabel) connectionLabel.textContent = "Offline";
  }
}

void start();
