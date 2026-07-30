#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { renderPodcastEdit } from '../src/adapters/podcast-edit.js';

function usage() {
  return `Usage: npm run render:podcast-edit -- --file PATH [options]

Render one approved fleet.podcast-edit.v1 document through Reel Pipeline's
incorporated editorial runtime.

Options:
  --file PATH    Approved podcast edit JSON (required)
  --output PATH  Output root (default: .reel-pipeline/podcast-edits)
  --help         Show this help`;
}

export function parsePodcastRenderArgs(argv) {
  const options = {
    file: null,
    outputRoot: path.resolve('.reel-pipeline', 'podcast-edits'),
    help: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--help') {
      options.help = true;
      continue;
    }
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`${argument} requires a value`);
    if (argument === '--file') options.file = path.resolve(value);
    else if (argument === '--output') options.outputRoot = path.resolve(value);
    else throw new Error(`unknown argument: ${argument}`);
    index += 1;
  }
  if (!options.help && !options.file) throw new Error('--file is required');
  return options;
}

export async function runPodcastRenderCommand(argv) {
  const options = parsePodcastRenderArgs(argv);
  if (options.help) {
    process.stdout.write(`${usage()}\n`);
    return null;
  }
  const input = JSON.parse(await readFile(options.file, 'utf8'));
  const result = await renderPodcastEdit({
    input,
    manifestPath: options.file,
    outputRoot: options.outputRoot,
  });
  process.stdout.write(`${JSON.stringify({
    runDir: result.runDir,
    video: result.paths.video,
    captions: result.paths.captions,
    receipt: result.paths.receipt,
  }, null, 2)}\n`);
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runPodcastRenderCommand(process.argv.slice(2)).catch((error) => {
    console.error(`[render:podcast-edit] ${error.stack ?? error.message}`);
    process.exitCode = 1;
  });
}
