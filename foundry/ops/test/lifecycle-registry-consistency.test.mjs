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

test("generated attention counts and membership match the canonical project catalog", async () => {
  const [registryText, catalogText, generatedCatalog, readme] = await Promise.all([
    readFile(registryUrl, "utf8"),
    readFile(catalogUrl, "utf8"),
    readFile(generatedCatalogUrl, "utf8"),
    readFile(readmeUrl, "utf8")
  ]);
  const registry = JSON.parse(registryText);
  const catalog = JSON.parse(catalogText);
  const tiers = [
    ["my-work", "My Work"],
    ["toolbox", "Toolbox"],
    ["foundry", "Foundry + Helpers"],
    ["ignored", "Past / inactive"]
  ];

  for (const [attention, label] of tiers) {
    const projects = catalog.projects.filter(
      (project) => project.attention === attention
        && !(attention === "ignored" && project.tier === "non-product")
    );
    const automationProjects = projects.filter((project) => project.tier !== "non-product");
    const automationCount = registry.entries.filter((entry) => entry.attention === attention).length;
    assert.equal(registry.attentionCounts[attention], automationCount);
    assert.equal(automationCount, automationProjects.length);
    assert.match(generatedCatalog, new RegExp(`^## ${escapeRegExp(label)} — ${projects.length}$`, "m"));
    const readmeLabel = label === "Foundry + Helpers" ? "Foundry" : label;
    assert.match(readme, new RegExp(`^### ${escapeRegExp(readmeLabel)} — ${projects.length}$`, "m"));
    for (const project of projects) {
      assert.match(generatedCatalog, new RegExp(`\\| ${escapeRegExp(project.name)} \\|`));
    }
  }

  assert.match(readme, /Calorie/);
  assert.match(readme, /Mashup/);
  assert.match(readme, /Forecast Lab/);
});
