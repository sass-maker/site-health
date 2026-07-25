import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const registryUrl = new URL("../config/automation-registry.json", import.meta.url);
const projectTiersUrl = new URL("../docs/project-tiers.md", import.meta.url);
const readmeUrl = new URL("../../../README.md", import.meta.url);

function section(markdown, heading) {
  const level = heading.match(/^#+/)?.[0].length;
  assert.ok(level, `invalid heading: ${heading}`);
  const start = markdown.indexOf(`${heading}\n`);
  assert.notEqual(start, -1, `missing section: ${heading}`);
  const bodyStart = start + heading.length + 1;
  const nextHeading = new RegExp(`^#{1,${level}}\\s`, "m");
  const match = nextHeading.exec(markdown.slice(bodyStart));
  return markdown.slice(bodyStart, match ? bodyStart + match.index : undefined);
}

function bulletNames(markdown) {
  return [...markdown.matchAll(/^- (.+)$/gm)].map(([, name]) => name.trim());
}

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test("attention counts and ignored membership match the canonical registry", async () => {
  const [registryText, projectTiers, readme] = await Promise.all([
    readFile(registryUrl, "utf8"),
    readFile(projectTiersUrl, "utf8"),
    readFile(readmeUrl, "utf8")
  ]);
  const registry = JSON.parse(registryText);
  const tiers = [
    ["my-work", "My Work"],
    ["toolbox", "Toolbox"],
    ["foundry", "Foundry + Helpers"],
    ["ignored", "Ignored / inactive"]
  ];

  for (const [attention, label] of tiers) {
    const count = registry.entries.filter((entry) => entry.attention === attention).length;
    assert.equal(registry.attentionCounts[attention], count);
    assert.match(projectTiers, new RegExp(`^## ${escapeRegExp(label)} — ${count}$`, "m"));
  }

  assert.match(readme, /^### My Work — 4$/m);
  assert.match(readme, /^### Toolbox — 16$/m);
  assert.match(readme, /^### Foundry — 5$/m);
  assert.match(readme, /^### Ignored \/ inactive — 12$/m);

  const expectedIgnored = sorted(
    registry.entries
      .filter((entry) => entry.attention === "ignored")
      .map((entry) => entry.name)
  );
  assert.deepEqual(
    sorted(bulletNames(section(projectTiers, "## Ignored / inactive — 12"))),
    expectedIgnored
  );
  assert.deepEqual(
    sorted(bulletNames(section(readme, "### Ignored / inactive — 12"))),
    expectedIgnored
  );
});
