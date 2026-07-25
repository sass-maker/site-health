type JsonRecord = Record<string, any>;

const base = document.querySelector<HTMLMetaElement>('meta[name="founder-api-base"]')?.content ?? "/api/founder";
const connection = document.querySelector<HTMLElement>("[data-founder-connection]");
const connectionLabel = document.querySelector<HTMLElement>("[data-founder-connection-label]");
const date = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });

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

function state(value: string) {
  return element("span", { class: `state ${value}` }, [value.replaceAll("-", " ")]);
}

function formatted(value?: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return "No verified time";
  return date.format(new Date(value));
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

async function renderHome() {
  const home = await api("/v1/home");
  const renderedAt = document.querySelector<HTMLElement>("[data-snapshot-time]");
  if (renderedAt) renderedAt.textContent = `Evidence rebuilt ${formatted(home.generatedAt)}`;
  const sections = [
    ["needs-me", home.needsMe, "Nothing needs your decision", "Foundry will only interrupt you for a bounded owner choice.", decisionCard],
    ["working-now", home.workingNow, "No accepted work is moving", "Draft missions stay inert until you accept them.", missionRecord],
    ["what-shipped", home.whatShipped, "No verified outcomes yet", "Completed work appears only after its mission reaches a verified end state.", missionRecord],
    ["what-changed", home.whatChanged, "No material changes recorded", "Routine provider noise stays out of the owner view.", activityItem],
    ["recommended-next", home.recommendedNext, "No evidence-backed recommendation", "Foundry will not invent work when the evidence is quiet.", (item: JsonRecord) =>
      element("div", { class: "record" }, [
        element("div", { class: "record-main" }, [
          element("div", { class: "record-kicker" }, [item.projectId ?? "Portfolio"]),
          element("h3", {}, [item.title]),
          element("p", {}, [item.rationale]),
        ]),
        element("div", { class: "record-side" }, [element("strong", {}, [`${item.score}/100`]), element("small", {}, ["Priority score"])]),
      ])],
  ] as const;
  for (const [id, items, title, detail, renderer] of sections) {
    const count = document.querySelector<HTMLElement>(`[data-founder-count="${id}"]`);
    if (count) count.textContent = String(items.length);
    replace(id, items.length ? element("div", { class: id === "needs-me" ? "decision-grid" : id === "what-changed" ? "timeline" : "record-list" }, items.map(renderer)) : empty(title, detail));
  }
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
  const [projects, missions, decisions] = await Promise.all([api("/v1/projects"), api("/v1/missions"), api("/v1/decisions")]);
  const activeProjects = projects.filter((project: JsonRecord) => !["out-of-fleet", "non-product"].includes(project.attention));
  const groups = new Map<string, JsonRecord[]>();
  for (const project of activeProjects) {
    const group = groups.get(project.attention) ?? [];
    group.push(project);
    groups.set(project.attention, group);
  }
  const groupedList = element("div", { class: "project-groups" });
  const routeAliases: Record<string, string> = { "fleet-workspace": "fleet-ops" };
  for (const attention of ["focus", "active", "secondary", "parked"]) {
    const group = groups.get(attention) ?? [];
    if (group.length === 0) continue;
    const list = element("div", { class: "project-list" });
    for (const project of group) {
    const projectMissions = missions.filter((mission: JsonRecord) => mission.projectId === project.id);
    const current = projectMissions.find((mission: JsonRecord) => ["active", "blocked", "awaiting-verification", "accepted"].includes(mission.state));
    const completed = projectMissions.find((mission: JsonRecord) => mission.state === "completed");
    const ownerDecision = decisions.find((decision: JsonRecord) => decision.projectId === project.id && ["open", "stale"].includes(decision.state));
      list.append(element("a", { class: "project", href: `/projects/${routeAliases[project.id] ?? project.id}` }, [
      element("header", {}, [element("h3", {}, [project.name]), state(project.attention)]),
      element("dl", {}, [
        element("div", {}, [element("dt", {}, ["Current objective"]), element("dd", {}, [current?.outcome ?? "No accepted mission"])]),
        element("div", {}, [element("dt", {}, ["Verified outcome"]), element("dd", {}, [completed?.latestSummary ?? "None recorded"])]),
        element("div", {}, [element("dt", {}, ["Needs you"]), element("dd", {}, [ownerDecision?.question ?? "No"])]),
        element("div", {}, [element("dt", {}, ["Evidence"]), element("dd", {}, [projectMissions[0] ? formatted(projectMissions[0].updatedAt) : "No mission evidence"])]),
      ]),
      ]));
    }
    const details = element("details", { class: "project-group" }, [
      element("summary", {}, [
        element("span", {}, [attention.replaceAll("-", " ")]),
        element("span", { class: "count" }, [String(group.length)]),
      ]),
      list,
    ]);
    if (["focus", "active"].includes(attention)) details.setAttribute("open", "");
    groupedList.append(details);
  }
  replace("projects", activeProjects.length ? groupedList : empty("No active projects", "The canonical registry did not return an active portfolio."));
}

async function renderProjectDetail() {
  const projectId = document.body.dataset.projectId;
  const [projects, missions, decisions, recommendations] = await Promise.all([
    api("/v1/projects"),
    api("/v1/missions"),
    api("/v1/decisions"),
    api("/v1/home").then((home) => home.recommendedNext),
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
      ]),
    ]),
    element("section", { class: "owner-section" }, [
      element("div", { class: "section-head" }, [element("div", {}, [element("p", { class: "eyebrow" }, ["Work"]), element("h2", {}, ["Missions"])]), element("span", { class: "count" }, [String(projectMissions.length)])]),
      projectMissions.length ? element("div", { class: "record-list" }, projectMissions.map(missionRecord)) : empty("No missions for this product", "The registry record exists, but Foundry has not accepted work against it."),
    ]),
  );
  replace("project-detail", wrap);
}

async function renderActivity() {
  const activity = await api("/v1/activity");
  replace("activity", activity.length ? element("div", { class: "timeline" }, activity.map(activityItem)) : empty("No mission activity", "Provider noise is intentionally excluded."));
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
    slot.setAttribute("aria-live", "polite");
    slot.setAttribute("aria-busy", "true");
  });
  try {
    if (view === "home") await renderHome();
    if (view === "decisions") await renderDecisions();
    if (view === "projects") await renderProjects();
    if (view === "project") await renderProjectDetail();
    if (view === "activity") await renderActivity();
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
