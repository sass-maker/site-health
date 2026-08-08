import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";

import { assertEventEnvelope } from "./events.mjs";

export class EventStore {
  #pendingWrite = Promise.resolve();

  constructor(filePath) {
    if (typeof filePath !== "string" || filePath.trim() === "") {
      throw new TypeError("filePath must be a non-empty string");
    }
    this.filePath = filePath;
  }

  async append(event) {
    assertEventEnvelope(event);
    const snapshot = structuredClone(event);
    const line = `${JSON.stringify(snapshot)}\n`;

    this.#pendingWrite = this.#pendingWrite.then(async () => {
      await mkdir(dirname(this.filePath), { recursive: true });
      await appendFile(this.filePath, line, "utf8");
    });

    await this.#pendingWrite;
    return snapshot;
  }

  async list({ workspaceId, runId } = {}) {
    await this.#pendingWrite;

    let contents;
    try {
      contents = await readFile(this.filePath, "utf8");
    } catch (error) {
      if (error?.code === "ENOENT") return [];
      throw error;
    }

    return contents
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .filter((event) => !workspaceId || event.workspaceId === workspaceId)
      .filter((event) => !runId || event.runId === runId);
  }
}

