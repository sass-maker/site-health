import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { EnvironmentAdapter } from "./contracts.mjs";

const execFileAsync = promisify(execFile);

export function experimentMarkerToken(marker) {
  if (typeof marker !== "string" || marker.trim() === "") {
    throw new TypeError("marker must be a non-empty string");
  }
  return `<!-- fleetworkspace-marker:${marker} -->`;
}

async function defaultRunGh(args) {
  const { stdout } = await execFileAsync("gh", args, {
    encoding: "utf8",
    maxBuffer: 5 * 1024 * 1024,
    timeout: 30_000,
  });
  return stdout;
}

function normalizePages(parsed) {
  if (!Array.isArray(parsed)) return [];
  if (parsed.length === 0) return [];
  return Array.isArray(parsed[0]) ? parsed.flat() : parsed;
}

export class GithubEnvironmentAdapter extends EnvironmentAdapter {
  constructor({ repository, runGh = defaultRunGh } = {}) {
    super();
    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository ?? "")) {
      throw new TypeError("repository must use owner/name format");
    }
    this.repository = repository;
    this.runGh = runGh;
  }

  async observe({ marker }) {
    const token = experimentMarkerToken(marker);
    const output = await this.runGh([
      "api",
      "--paginate",
      "--slurp",
      `repos/${this.repository}/issues?state=open&per_page=100`,
    ]);
    const issues = normalizePages(JSON.parse(output))
      .filter((issue) => !issue.pull_request)
      .filter((issue) => typeof issue.body === "string" && issue.body.includes(token))
      .map((issue) => ({
        number: issue.number,
        title: issue.title,
        url: issue.html_url,
        state: issue.state,
      }))
      .sort((left, right) => left.number - right.number);

    return {
      repository: this.repository,
      marker,
      matchingCount: issues.length,
      matchingIssues: issues,
    };
  }

  async execute(action) {
    if (action.type !== "create_issue") {
      throw new TypeError(`Unsupported GitHub action: ${action.type}`);
    }
    const token = experimentMarkerToken(action.marker);
    const body = action.body.includes(token) ? action.body : `${action.body}\n\n${token}`;
    const output = await this.runGh([
      "api",
      "--method",
      "POST",
      `repos/${this.repository}/issues`,
      "-f",
      `title=${action.title}`,
      "-f",
      `body=${body}`,
    ]);
    const issue = JSON.parse(output);

    return {
      success: true,
      issue: {
        number: issue.number,
        title: issue.title,
        url: issue.html_url,
        state: issue.state,
      },
    };
  }
}

