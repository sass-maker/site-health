#!/usr/bin/env node
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";

import { EventStore } from "./event-store.mjs";
import { GithubEnvironmentAdapter } from "./github-adapter.mjs";
import { GithubIssueWorldProgram } from "./github-issue-world-program.mjs";
import { runGithubIssueExperiment } from "./run-issue-workflow.mjs";
import { formatTimeline } from "./timeline.mjs";
import { TransitionVerifier } from "./transition-verifier.mjs";

function parseOptions(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (!token.startsWith("--")) throw new Error(`Unexpected argument: ${token}`);
    const name = token.slice(2);
    const next = args[index + 1];
    if (!next || next.startsWith("--")) {
      options[name] = true;
    } else {
      options[name] = next;
      index += 1;
    }
  }
  return options;
}

function requireOption(options, name) {
  const value = options[name];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required option --${name}`);
  }
  return value;
}

async function run(options) {
  if (options["confirm-external-write"] !== true) {
    throw new Error("Refusing GitHub mutation without --confirm-external-write");
  }
  const repository = requireOption(options, "repo");
  const title = requireOption(options, "title");
  const marker = requireOption(options, "marker");
  const timelinePath = resolve(requireOption(options, "timeline"));
  const workspaceId = options.workspace ?? `workspace:github:${marker}`;
  const runId = options.run ?? `run:${randomUUID()}`;
  const actorId = options.actor ?? "agent:github-runner";

  const result = await runGithubIssueExperiment({
    store: new EventStore(timelinePath),
    environment: new GithubEnvironmentAdapter({ repository }),
    worldProgram: new GithubIssueWorldProgram(),
    verifier: new TransitionVerifier(),
    workspaceId,
    runId,
    actorId,
    objective: {
      description: "Exactly one open GitHub issue exists with the experiment marker",
      expectedMatchingIssueCount: 1,
    },
    action: {
      type: "create_issue",
      title,
      marker,
      body: [
        "FleetWorkspace verified-transition experiment.",
        "",
        "This issue is external state for sass-maker/fleet-workspace#245.",
      ].join("\n"),
    },
    unsafeRetry: options["unsafe-retry"] === true,
  });

  process.stdout.write(`${formatTimeline(result.events)}\n`);
  process.stdout.write(`\nTimeline: ${timelinePath}\n`);
  process.stdout.write(`Run: ${result.runId}\n`);
  process.stdout.write(`Mismatch: ${result.mismatchCategory ?? "none"}\n`);

  if (options["unsafe-retry"] && result.mismatchCategory !== "duplicate_side_effect") {
    process.exitCode = 1;
  }
}

async function print(options) {
  const timelinePath = resolve(requireOption(options, "timeline"));
  const events = await new EventStore(timelinePath).list({
    workspaceId: options.workspace,
    runId: options.run,
  });
  process.stdout.write(`${formatTimeline(events)}\n`);
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  const options = parseOptions(args);
  if (command === "run-github-issue") return run(options);
  if (command === "print") return print(options);
  throw new Error("Usage: cli.mjs <run-github-issue|print> [options]");
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
