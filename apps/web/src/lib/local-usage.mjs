const STORAGE_KEY = "site-health.local-usage.v1";
const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_MS = 30 * DAY_MS;
const RETAIN_DAYS = 32;
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

function iso(value) {
  return new Date(value).toISOString();
}

function utcDay(value) {
  return iso(value).slice(0, 10);
}

function emptyUsage() {
  return { schemaVersion: 1, days: {} };
}

function readStoredUsage(storage) {
  try {
    const serialized = storage.getItem(STORAGE_KEY);
    if (!serialized) return { state: emptyUsage(), present: false };
    const value = JSON.parse(serialized);
    if (!value || value.schemaVersion !== 1 || !value.days || Array.isArray(value.days)) {
      return { state: null, present: true };
    }
    if (
      typeof value.coverageStartedAt !== "string" ||
      !Number.isFinite(Date.parse(value.coverageStartedAt))
    ) {
      return { state: null, present: true };
    }
    for (const [day, entry] of Object.entries(value.days)) {
      if (
        !DATE_KEY.test(day) ||
        !entry ||
        !Number.isSafeInteger(entry.interactions) ||
        entry.interactions < 1 ||
        typeof entry.lastAt !== "string" ||
        !Number.isFinite(Date.parse(entry.lastAt)) ||
        utcDay(entry.lastAt) !== day
      ) {
        return { state: null, present: true };
      }
    }
    return { state: value, present: true };
  } catch {
    return { state: null, present: true };
  }
}

export function recordLocalInteraction(storage, now = new Date()) {
  const { state } = readStoredUsage(storage);
  if (!state) return false;

  const timestamp = iso(now);
  const today = utcDay(timestamp);
  state.coverageStartedAt ??= timestamp;
  const existing = state.days[today];
  state.days[today] = {
    interactions: Math.min(Number.MAX_SAFE_INTEGER, (existing?.interactions ?? 0) + 1),
    lastAt: timestamp,
  };

  const oldestDay = utcDay(Date.parse(timestamp) - RETAIN_DAYS * DAY_MS);
  for (const day of Object.keys(state.days)) {
    if (day < oldestDay) delete state.days[day];
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function buildLocalUsageBundle(storage, now = new Date()) {
  const checkedAt = iso(now);
  const checkedAtMs = Date.parse(checkedAt);
  const windowStart = iso(checkedAtMs - WINDOW_MS);
  const { state, present } = readStoredUsage(storage);
  const usableState = present && state ? state : null;
  const active = usableState && Object.values(usableState.days).some((entry) => {
    const lastAt = Date.parse(entry.lastAt);
    return lastAt >= Date.parse(windowStart) && lastAt < checkedAtMs;
  });
  const tracking = usableState ? "partial" : present ? "partial" : "missing";

  return {
    kind: "portfolio-usage",
    schemaVersion: 1,
    usage: {
      schemaVersion: 1,
      updatedAt: checkedAt,
      records: {
        "site-health": {
          windowStart,
          windowEnd: checkedAt,
          checkedAt,
          proxy: {
            count: active ? 1 : null,
            unit: "devices",
            precision: active ? "lower_bound" : "unknown",
          },
          core: {
            count: null,
            definition:
              "No owner-reviewed core workflow is mapped. Local interaction counts show dashboard activity only and do not prove a useful task completed.",
            lastUsedAt: null,
            qualified: false,
            precision: "unknown",
            coverage: "unknown",
          },
          tracking,
          evidence: [
            {
              source: "site-health.local-interactions",
              date: checkedAt,
              note: usableState
                ? `Content-free aggregate of explicit dashboard controls stored in this browser only; coverage began ${utcDay(usableState.coverageStartedAt)}. No identifiers, routes, queries, form values, provider payloads or page content are retained.`
                : present
                  ? "The local aggregate could not be read; tracking is partial and usage is unknown, not zero."
                  : "No local interaction aggregate is available in this browser; usage is unknown, not zero.",
            },
          ],
          limitations:
            "This export covers one browser profile only and does not combine devices or origins. It counts explicit dashboard controls, not page views or completed core tasks. WebDriver sessions, fleet_qa=1 sessions, and local-gallery fixtures are excluded; browser QA using native input may still contribute. No data is sent to a server.",
        },
      },
    },
  };
}

export function startLocalUsageTracking({ document, window }) {
  if (
    !document ||
    !window ||
    window.navigator?.webdriver ||
    new URL(window.location.href).searchParams.get("fleet_qa") === "1" ||
    document.body?.dataset.dashboardEvidence === "false"
  ) {
    return () => {};
  }

  const record = (event) => {
    if (!event.isTrusted || !(event.target instanceof window.Element)) return;
    const control = event.target.closest("[data-usage-event], nav[aria-label=App] a[href]");
    if (!control) return;
    const category = control.getAttribute("data-usage-event") ?? "navigation";
    if (!new Set(["navigation", "filter", "refresh", "action"]).has(category)) return;
    if (category === "filter" ? event.type !== "change" : event.type !== "click") return;
    try {
      recordLocalInteraction(window.localStorage);
    } catch {
      // Private browsing modes may deny local storage; usage remains unknown.
    }
  };

  document.addEventListener("click", record, true);
  document.addEventListener("change", record, true);
  return () => {
    document.removeEventListener("click", record, true);
    document.removeEventListener("change", record, true);
  };
}

export function downloadLocalUsageBundle(document, window, now = new Date()) {
  let storage;
  try {
    storage = window.localStorage;
  } catch {
    storage = { getItem: () => { throw new Error("Local storage is unavailable."); } };
  }
  const bundle = buildLocalUsageBundle(storage, now);
  const blob = new window.Blob([JSON.stringify(bundle, null, 2)], {
    type: "application/json",
  });
  const href = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = `site-health-usage-${utcDay(now)}.json`;
  link.click();
  window.setTimeout(() => window.URL.revokeObjectURL(href), 0);
}
