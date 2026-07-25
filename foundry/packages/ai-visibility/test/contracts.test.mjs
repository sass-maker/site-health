import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  ProviderUnavailableError,
  RetryableProviderError,
  analyzeMentionResponse,
  buildMentionJudgePrompt,
  computeCitationGaps,
  computePersonaVisibility,
  computeShareOfVoice,
  computeVisibilityScore,
  createCacheFingerprint,
  executeVisibilityRun,
  extractJsonObject,
  parseMentionVerdict,
} from "../dist/index.js";

const fixtures = JSON.parse(
  await readFile(
    new URL("./fixtures/high-signal-mention-parity.json", import.meta.url),
    "utf8",
  ),
);

test("frozen High Signal deterministic fixtures retain parity", () => {
  for (const fixture of fixtures) {
    const actual = analyzeMentionResponse(fixture.input);
    assert.deepEqual(
      {
        brandMentioned: actual.brandMentioned,
        brandRecommended: actual.brandRecommended,
        brandSentiment: actual.brandSentiment,
        brandPosition: actual.brandPosition,
        competitorsMentioned: actual.competitorsMentioned,
        citations: actual.citations,
        brandCited: actual.brandCited,
      },
      fixture.expected,
      fixture.name,
    );
    assert.equal(actual.provenance, "deterministic-fallback");
  }
});

test("judge contract handles negation and backfills competitors", () => {
  const subject = {
    brandName: "Acme",
    brandAliases: ["AcmeAI"],
    brandUrl: "https://acme.com",
    competitors: [{ name: "Globex" }, { name: "Initech" }],
  };
  const prompt = buildMentionJudgePrompt(
    subject,
    "Acme is mentioned, but I do not recommend it.",
  );
  assert.match(prompt, /Return ONLY a JSON object/i);
  assert.equal(extractJsonObject('```json\n{"a":1}\n```'), '{"a":1}');
  const result = parseMentionVerdict(
    JSON.stringify({
      brandMentioned: true,
      brandRecommended: false,
      brandSentiment: "negative",
      brandPosition: null,
      competitorsMentioned: [{ name: "Globex", mentioned: true, position: 2 }],
      citations: ["https://example.com", "https://example.com"],
      brandCited: false,
      reasoning: "The brand is explicitly rejected.",
    }),
    subject.competitors,
  );
  assert.equal(result?.brandMentioned, true);
  assert.equal(result?.brandRecommended, false);
  assert.equal(result?.provenance, "judge");
  assert.deepEqual(result?.citations, ["https://example.com"]);
  assert.deepEqual(result?.competitorsMentioned[1], {
    name: "Initech",
    mentioned: false,
    position: null,
  });
});

test("visibility aggregation preserves provider and persona slices", () => {
  const rows = [
    {
      brandMentioned: true,
      brandRecommended: true,
      competitorsMentioned: ["Globex"],
      citations: ["https://g2.com/acme", "https://competitor.com/x"],
      brandCited: false,
      platform: "chatgpt",
      persona: "developer",
      createdAt: "2026-07-01T00:00:00Z",
    },
    {
      brandMentioned: true,
      brandRecommended: false,
      competitorsMentioned: ["Globex", "Globex"],
      citations: ["https://g2.com/acme"],
      brandCited: true,
      platform: "perplexity",
      persona: "developer",
      createdAt: "2026-07-02T00:00:00Z",
    },
    {
      brandMentioned: false,
      brandRecommended: false,
      competitorsMentioned: ["Globex"],
      citations: [],
      brandCited: false,
      platform: "gemini",
      persona: "procurement",
      createdAt: "2026-07-03T00:00:00Z",
    },
  ];
  const share = computeShareOfVoice(rows, 30);
  assert.equal(share.competitorShare.Globex, 4 / 3);
  const score = computeVisibilityScore(share, rows);
  assert.equal(score.platformsCovered, 2);
  assert.equal(score.platformsTotal, 3);
  assert.equal(computePersonaVisibility(rows)[0].persona, "procurement");
  assert.deepEqual(
    computeCitationGaps(rows, {
      brandUrl: "https://acme.com",
      competitorUrls: [{ id: "Globex", url: "https://competitor.com" }],
    }).slice(0, 2),
    [
      { host: "g2.com", ownership: "third_party", citations: 2 },
      {
        host: "competitor.com",
        ownership: "competitor",
        citations: 1,
        competitorId: "Globex",
      },
    ],
  );
});

test("call ceiling fails closed before providers execute", async () => {
  let calls = 0;
  await assert.rejects(
    executeVisibilityRun({
      subject: { brandName: "Acme" },
      prompts: [
        { id: "one", text: "one" },
        { id: "two", text: "two" },
      ],
      providers: [
        {
          id: "a",
          model: "a",
          execute: async () => {
            calls++;
            return { text: "Acme" };
          },
        },
        {
          id: "b",
          model: "b",
          execute: async () => {
            calls++;
            return { text: "Acme" };
          },
        },
      ],
      policy: {
        maxCalls: 3,
        maxConcurrency: 2,
        timeoutMs: 50,
        retryAttempts: 1,
      },
    }),
    /exceeding maxCalls/,
  );
  assert.equal(calls, 0);
});

test("execution discloses provider coverage and excludes unavailable attempts", async () => {
  const run = await executeVisibilityRun({
    subject: { brandName: "Acme" },
    prompts: [{ id: "category", text: "best tools", persona: "developer" }],
    providers: [
      {
        id: "working",
        model: "model-a",
        execute: async () => ({
          text: "Acme is the best choice. https://acme.example",
          observedCostUsd: 0.002,
        }),
      },
      {
        id: "missing",
        model: "model-b",
        execute: async () => {
          throw new ProviderUnavailableError("not configured");
        },
      },
    ],
    policy: {
      maxCalls: 2,
      maxConcurrency: 2,
      timeoutMs: 50,
      retryAttempts: 1,
      maxEstimatedCostUsd: 0.01,
    },
  });
  assert.deepEqual(run.coverage, {
    configured: 2,
    completed: 1,
    cached: 0,
    unavailable: 1,
    timedOut: 0,
    failed: 0,
  });
  assert.equal(run.attempts[0].analysis.brandMentioned, true);
  assert.equal(run.cost.observedUsd, 0.002);
});

test("invalid judge output is labeled deterministic fallback", async () => {
  const run = await executeVisibilityRun({
    subject: { brandName: "Acme" },
    prompts: [{ id: "one", text: "one" }],
    providers: [
      { id: "provider", model: "model", execute: async () => ({ text: "Acme is great." }) },
    ],
    judge: {
      id: "judge",
      judge: async () => "not json",
    },
    policy: {
      maxCalls: 1,
      maxConcurrency: 1,
      timeoutMs: 50,
      retryAttempts: 1,
    },
  });
  assert.equal(run.attempts[0].analysis.provenance, "deterministic-fallback");
});

test("retryable failures retry within the declared attempt budget", async () => {
  let calls = 0;
  const run = await executeVisibilityRun({
    subject: { brandName: "Acme" },
    prompts: [{ id: "one", text: "one" }],
    providers: [
      {
        id: "provider",
        model: "model",
        execute: async () => {
          calls++;
          if (calls === 1) throw new RetryableProviderError("rate limited");
          return { text: "Acme is recommended." };
        },
      },
    ],
    policy: {
      maxCalls: 1,
      maxConcurrency: 1,
      timeoutMs: 50,
      retryAttempts: 2,
    },
  });
  assert.equal(calls, 2);
  assert.equal(run.coverage.completed, 1);
});

test("timeouts are explicit coverage gaps", async () => {
  const run = await executeVisibilityRun({
    subject: { brandName: "Acme" },
    prompts: [{ id: "one", text: "one" }],
    providers: [
      {
        id: "slow",
        model: "model",
        execute: async () => new Promise(() => {}),
      },
    ],
    policy: {
      maxCalls: 1,
      maxConcurrency: 1,
      timeoutMs: 5,
      retryAttempts: 1,
    },
  });
  assert.equal(run.coverage.timedOut, 1);
  assert.equal(run.attempts[0].status, "timed_out");
  assert.equal(run.attempts[0].analysis, null);
});

test("estimated cost ceiling fails closed before providers execute", async () => {
  let calls = 0;
  await assert.rejects(
    executeVisibilityRun({
      subject: { brandName: "Acme" },
      prompts: [{ id: "one", text: "one" }],
      providers: [
        {
          id: "provider",
          model: "model",
          estimateCostUsd: () => 0.02,
          execute: async () => {
            calls++;
            return { text: "Acme" };
          },
        },
      ],
      policy: {
        maxCalls: 1,
        maxConcurrency: 1,
        timeoutMs: 50,
        retryAttempts: 1,
        maxEstimatedCostUsd: 0.01,
      },
    }),
    /estimated cost/,
  );
  assert.equal(calls, 0);
});

test("cache fingerprint and cache hits are stable and cost-free", async () => {
  const values = new Map();
  const cache = {
    get: async (key) => values.get(key) ?? null,
    set: async (key, value) => values.set(key, value),
  };
  const base = {
    subject: { brandName: "Acme" },
    prompts: [{ id: "one", text: "one" }],
    providers: [
      {
        id: "provider",
        model: "model",
        estimateCostUsd: () => 0.01,
        execute: async () => ({ text: "Acme", observedCostUsd: 0.01 }),
      },
    ],
    policy: {
      maxCalls: 1,
      maxConcurrency: 1,
      timeoutMs: 50,
      retryAttempts: 1,
      cacheTtlMs: 1_000,
      maxEstimatedCostUsd: 0.02,
    },
  };
  const fingerprint = createCacheFingerprint({
    subject: base.subject,
    prompt: base.prompts[0],
    providerId: "provider",
    model: "model",
  });
  assert.equal(fingerprint, createCacheFingerprint({
    subject: base.subject,
    prompt: base.prompts[0],
    providerId: "provider",
    model: "model",
  }));
  const first = await executeVisibilityRun({
    ...base,
    cache: { adapter: cache, now: () => 1_000 },
  });
  const second = await executeVisibilityRun({
    ...base,
    cache: { adapter: cache, now: () => 1_500 },
  });
  assert.equal(first.coverage.completed, 1);
  assert.equal(second.coverage.cached, 1);
  assert.equal(second.cost.observedUsd, 0);
  assert.equal(second.cost.providerCalls, 0);
});
