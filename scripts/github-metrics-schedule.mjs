#!/usr/bin/env node
// Manage the launchd agent that runs the GitHub visibility collector daily.
//
// Nothing here touches the machine unless `install` or `uninstall` is invoked
// explicitly, and `install` additionally requires `--confirm` so an accidental
// run cannot leave a persistent agent behind. `print`, `status`, and `preflight`
// are read-only.

import { spawnSync } from 'node:child_process';
import { accessSync, constants, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const LABEL = 'com.sarthak.github-metrics';
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const HOME = process.env.HOME ?? '';
const PLIST_PATH = join(HOME, 'Library', 'LaunchAgents', `${LABEL}.plist`);
const LOG_PATH = join(HOME, 'Library', 'Logs', `${LABEL}.log`);
const COLLECTOR = join(REPO_ROOT, 'apps', 'backend', 'scripts', 'github-metrics-collect.mjs');

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function parseArguments(argv) {
  const [command = 'status', ...rest] = argv;
  const options = { command, confirm: false };
  for (let index = 0; index < rest.length; index += 1) {
    const argument = rest[index];
    if (argument === '--confirm') options.confirm = true;
    else if (argument === '--hour') options.hour = Number(rest[index += 1]);
    else if (argument === '--minute') options.minute = Number(rest[index += 1]);
    else fail(`Unknown argument: ${argument}`);
  }
  return options;
}

function resolveSchedule({ hour = 9, minute = 30 } = {}) {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) fail('--hour must be 0-23');
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) fail('--minute must be 0-59');
  return { hour, minute };
}

function buildPlist(options) {
  const { hour, minute } = resolveSchedule(options);
  const command = `exec node ${JSON.stringify(COLLECTOR)}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/zsh</string>
    <string>-lc</string>
    <string>cd ${REPO_ROOT} &amp;&amp; ${command.replace(/"/g, '&quot;')}</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>${hour}</integer>
    <key>Minute</key>
    <integer>${minute}</integer>
  </dict>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    <key>HOME</key>
    <string>${HOME}</string>
  </dict>
  <key>StandardOutPath</key>
  <string>${LOG_PATH}</string>
  <key>StandardErrorPath</key>
  <string>${LOG_PATH}</string>
  <key>RunAtLoad</key>
  <false/>
  <key>ProcessType</key>
  <string>Background</string>
</dict>
</plist>
`;
}

function launchctl(args) {
  const result = spawnSync('/bin/launchctl', args, { encoding: 'utf8' });
  return { code: result.status, stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
}

function isLoaded() {
  return launchctl(['print', `gui/${process.getuid()}/${LABEL}`]).code === 0;
}

function runStatus() {
  const installed = existsSync(PLIST_PATH);
  const lines = [
    `label      ${LABEL}`,
    `plist      ${PLIST_PATH} ${installed ? '(present)' : '(absent)'}`,
    `loaded     ${installed && isLoaded() ? 'yes' : 'no'}`,
    `log        ${LOG_PATH} ${existsSync(LOG_PATH) ? '(present)' : '(absent)'}`,
    'command    node apps/backend/scripts/github-metrics-collect.mjs',
  ];
  if (installed) {
    const plist = readFileSync(PLIST_PATH, 'utf8');
    const calendar = /<key>StartCalendarInterval<\/key>\s*<dict>([\s\S]*?)<\/dict>/.exec(plist);
    if (calendar) lines.push(`cadence    daily at ${calendar[1].replace(/\s+/g, ' ').trim()}`);
  }
  if (existsSync(LOG_PATH)) {
    const tail = readFileSync(LOG_PATH, 'utf8').trimEnd().split('\n').slice(-5);
    lines.push('', 'last log lines:', ...tail.map((line) => `  ${line}`));
  }
  process.stdout.write(`${lines.join('\n')}\n`);
}

// Everything the scheduled job depends on, checked through the same
// `/bin/zsh -lc` login shell launchd will use. The gh probe reports an exit
// status only — no token value is ever read into this process or logged.
function runPreflight() {
  const checks = [];
  const shell = (script) => spawnSync('/bin/zsh', ['-lc', script], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  for (const binary of ['node', 'gh']) {
    const result = shell(`command -v ${binary}`);
    checks.push([binary, result.status === 0 ? `ok — ${result.stdout.trim()}` : 'MISSING from login-shell PATH']);
  }
  checks.push(['collector', existsSync(COLLECTOR) ? 'ok' : `MISSING at ${COLLECTOR}`]);
  const auth = shell('gh auth status >/dev/null 2>&1');
  checks.push(['gh auth', auth.status === 0
    ? 'ok — an authenticated GitHub account is available to a login shell'
    : 'NOT AUTHENTICATED for a login shell; run `gh auth login` first']);
  try {
    mkdirSync(dirname(LOG_PATH), { recursive: true });
    accessSync(dirname(LOG_PATH), constants.W_OK);
    checks.push(['log dir', 'ok — writable']);
  } catch {
    checks.push(['log dir', `NOT WRITABLE at ${dirname(LOG_PATH)}`]);
  }
  const width = Math.max(...checks.map(([name]) => name.length));
  process.stdout.write(`${checks.map(([name, note]) => `${name.padEnd(width)}  ${note}`).join('\n')}\n`);
}

function runInstall(options) {
  const { hour, minute } = resolveSchedule(options);
  if (!options.confirm) {
    fail([
      'Refusing to install without --confirm.',
      '',
      'This writes a persistent launchd agent to the owner\'s Mac:',
      `  ${PLIST_PATH}`,
      '',
      `Preview it first:  node scripts/github-metrics-schedule.mjs print --hour ${hour} --minute ${minute}`,
    ].join('\n'));
  }
  const plist = buildPlist(options);
  mkdirSync(dirname(PLIST_PATH), { recursive: true });
  mkdirSync(dirname(LOG_PATH), { recursive: true });
  if (existsSync(PLIST_PATH)) launchctl(['bootout', `gui/${process.getuid()}/${LABEL}`]);
  writeFileSync(PLIST_PATH, plist, 'utf8');
  const bootstrap = launchctl(['bootstrap', `gui/${process.getuid()}`, PLIST_PATH]);
  if (bootstrap.code !== 0) {
    fail(`launchctl bootstrap failed (${bootstrap.code}): ${bootstrap.stderr.trim() || bootstrap.stdout.trim()}`);
  }
  process.stdout.write([
    `Installed ${LABEL} — daily at ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}.`,
    `plist  ${PLIST_PATH}`,
    `log    ${LOG_PATH}`,
    '',
    `Trigger one run now with:  launchctl kickstart -p gui/${process.getuid()}/${LABEL}`,
    'Remove it with:            node scripts/github-metrics-schedule.mjs uninstall',
  ].join('\n') + '\n');
}

function runUninstall() {
  if (!existsSync(PLIST_PATH)) {
    process.stdout.write(`Nothing to remove — ${PLIST_PATH} is absent.\n`);
    return;
  }
  launchctl(['bootout', `gui/${process.getuid()}/${LABEL}`]);
  rmSync(PLIST_PATH);
  process.stdout.write(`Removed ${LABEL} and ${PLIST_PATH}. The log at ${LOG_PATH} is left in place.\n`);
}

function runHelp() {
  process.stdout.write(`Usage:
  github-metrics-schedule.mjs status
  github-metrics-schedule.mjs preflight
  github-metrics-schedule.mjs print     [--hour H] [--minute M]
  github-metrics-schedule.mjs install   --confirm [--hour H] [--minute M]
  github-metrics-schedule.mjs uninstall

Runs the GitHub visibility collector once a day (default 09:30 local).
Only install/uninstall change the machine, and install requires --confirm.
`);
}

const options = parseArguments(process.argv.slice(2));
switch (options.command) {
  case 'status': runStatus(); break;
  case 'preflight': runPreflight(); break;
  case 'print': process.stdout.write(buildPlist(options)); break;
  case 'install': runInstall(options); break;
  case 'uninstall': runUninstall(); break;
  case 'help': case '--help': case '-h': runHelp(); break;
  default: fail(`Unknown command: ${options.command}\nRun with 'help' for usage.`);
}
