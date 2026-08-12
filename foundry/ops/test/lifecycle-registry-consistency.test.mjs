import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const registryUrl = new URL("../config/automation-registry.json", import.meta.url);
const catalogUrl = new URL("../config/projects.json", import.meta.url);
const generatedCatalogUrl = new URL("../docs/project-catalog.md", import.meta.url);
const readmeUrl = new URL("../../../README.md", import.meta.url);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test("generated priority and kind membership cover the canonical project catalog exactly once", async () => {
  const [registryText, catalogText, generatedCatalog, readme] = await Promise.all([
    readFile(registryUrl, "utf8"),
    readFile(catalogUrl, "utf8"),
    readFile(generatedCatalogUrl, "utf8"),
    readFile(readmeUrl, "utf8")
  ]);
  const registry = JSON.parse(registryText);
  const catalog = JSON.parse(catalogText);
  const priorities = ["P1", "P2", "P4"];
  const kinds = ["product", "platform", "experiment"];

  for (const priority of priorities) {
    const projects = catalog.projects.filter((project) => project.portfolio.priority === priority);
    assert.match(generatedCatalog, new RegExp(`^## ${priority} — ${projects.length}$`, "m"));
    assert.match(readme, new RegExp(`^### ${priority} — ${projects.length}$`, "m"));
    for (const project of projects) {
      assert.equal(
        [...generatedCatalog.matchAll(new RegExp(`\\| ${escapeRegExp(project.name)} \\|`, "g"))].length,
        1,
      );
    }
  }

  for (const project of catalog.projects) {
    assert.ok(kinds.includes(project.portfolio.kind));
    assert.equal(typeof project.portfolio.deployed, "boolean");
    assert.equal(typeof project.portfolio.readyToBeShared, "boolean");
  }

  for (const attention of ["my-work", "toolbox", "foundry", "ignored"]) {
    const automationCount = registry.entries.filter((entry) => entry.attention === attention).length;
    assert.equal(registry.attentionCounts[attention], automationCount);
  }
});
