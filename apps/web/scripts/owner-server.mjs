#!/usr/bin/env node
import { dev } from 'astro';
import { fileURLToPath } from 'node:url';

const port = Number(process.argv[2] ?? 4321);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid owner dashboard port.');
const server = await dev({
  root: fileURLToPath(new URL('../', import.meta.url)),
  server: { host: '127.0.0.1', port, open: false },
  vite: { server: { strictPort: true } },
});
let closing = false;
async function close() {
  if (closing) return;
  closing = true;
  process.exitCode = 0;
  try { await server.stop(); process.exitCode = 0; }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
process.on('SIGINT', close);
process.on('SIGTERM', close);
