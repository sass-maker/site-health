import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";

import {
  inspectIndependentProductBoundaries,
  scanTrackedFile,
} from "../lib/independent-product-boundary.mjs";

const temporaryRoots = [];

function fixtureRoot() {
  const root = mkdtempSync(path.join(os.tmpdir(), "fleet-boundary-"));
  temporaryRoots.push(root);
  return root;
}

function writeFixture(root, repo, files) {
  for (const [file, content] of Object.entries(files)) {
    const target = path.join(root, repo, file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
}

function inspect(root, filesByRepo, projects) {
  return inspectIndependentProductBoundaries({
    workspaceRoot: root,
    projects,
    listTrackedFiles: (repoPath) =>
      Object.keys(filesByRepo[path.basename(repoPath)] ?? {}),
  });
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("independent product boundary", () => {
  it("passes a standalone product with repo-local commands", () => {
    const root = fixtureRoot();
    const files = {
      product: {
        "AGENTS.md": "Use npm run check and repository GitHub Issues.\n",
        "package.json": '{"scripts":{"deploy":"npm run check && wrangler deploy"}}',
      },
    };
    writeFixture(root, "product", files.product);

    const [result] = inspect(root, files, [
      { id: "product", repo: "product", lifecycle: "maintained" },
    ]);

    assert.equal(result.status, "pass");
  });

  it("fails a tracked command that calls private Fleet source", () => {
    const violations = scanTrackedFile(
      "package.json",
      '{"scripts":{"deploy":"bash ../foundry/ops/scripts/fleet-deploy-guard.sh product"}}',
    );

    assert.deepEqual(violations.map((entry) => entry.rule), [
      "private-fleet-path",
    ]);
  });

  it("fails parent and private Fleet instruction dependencies", () => {
    const violations = scanTrackedFile(
      "AGENTS.md",
      [
        "Read ../AGENTS.md.",
        "See https://github.com/sass-maker/fleet-workspace/blob/main/AGENTS.md.",
      ].join("\n"),
    );

    assert.deepEqual(
      violations.map((entry) => entry.rule).sort(),
      ["parent-agent-instructions", "private-fleet-instructions"],
    );
  });

  it("skips a cataloged product whose checkout is unavailable", () => {
    const root = fixtureRoot();
    const [result] = inspect(root, {}, [
      { id: "missing", repo: "missing", lifecycle: "maintained" },
    ]);

    assert.equal(result.status, "skipped");
    assert.equal(result.reason, "checkout unavailable");
  });
});

