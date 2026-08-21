import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const packageRoot = resolve(import.meta.dirname, "..");
const temporaryProject = mkdtempSync(join(tmpdir(), "ai-visibility-consumer-"));

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed:\n${result.stdout}\n${result.stderr}`);
  }
}

run("pnpm", ["pack", "--pack-destination", temporaryProject], packageRoot);
const archive = readdirSync(temporaryProject).find((name) => name.endsWith(".tgz"));
assert.ok(archive, "pnpm pack produced an archive");

writeFileSync(
  join(temporaryProject, "package.json"),
  JSON.stringify({ type: "module", dependencies: { "@site-health/ai-visibility": `file:./${archive}` } }),
);
writeFileSync(
  join(temporaryProject, "tsconfig.json"),
  JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      module: "NodeNext",
      moduleResolution: "NodeNext",
      strict: true,
      outDir: "dist",
    },
    include: ["consumer.ts"],
  }),
);
writeFileSync(
  join(temporaryProject, "consumer.ts"),
  [
    'import { analyzeMentionResponse, type BrandSubject } from "@site-health/ai-visibility";',
    'const subject: BrandSubject = { brandName: "Acme" };',
    'const result = analyzeMentionResponse({ ...subject, text: "Acme is recommended." });',
    'if (!result.brandMentioned) throw new Error("consumer contract failed");',
  ].join("\n"),
);

run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"], temporaryProject);
run(resolve(packageRoot, "node_modules/.bin/tsc"), ["-p", "tsconfig.json"], temporaryProject);
run("node", ["dist/consumer.js"], temporaryProject);

console.log(`clean packed consumer passed: ${archive}`);
