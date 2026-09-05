#!/usr/bin/env node
// Manage the launchd agent that recurs `clarity:refresh`.
//
// Nothing here touches the machine unless `install` or `uninstall` is invoked
// explicitly, and `install` additionally requires `--confirm` so an accidental
// run cannot leave a persistent agent behind. `print`, `status`, and `preflight`
// are read-only.

import { spawnSync } from 'node:child_process';
import { accessSync, constants, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const LABEL = 'com.sarthak.clarity-refresh';
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const HOME = process.env.HOME ?? '';
const PLIST_PATH = join(HOME, 'Library', 'LaunchAgents', `${LABEL}.plist`);
const LOG_PATH = join(HOME, 'Library', 'Logs', `${LABEL}.log`);
const COLLECTOR = join(REPO_ROOT, 'apps', 'backend', 'scripts', 'clarity-collect.mjs');

// `--days 3` is the widest window the Clarity Data Export API serves. A cadence
// longer than three days leaves the gap unmeasured; no collector change helps.
const REFRESH_DAYS = 3;
const THREE_DAYS_SECONDS = 3 * 24 * 60 * 60;

const CADENCES = {
  weekly: {
    label: 'weekly',
    coverage: `measures ${REFRESH_DAYS} of every 7 days — 4 days per week go unmeasured`,
    schedule: ({ hour, minute, weekday }) => ({
      key: 'StartCalendarInterval',
      body: [
        '  <key>StartCalendarInterval</key>',
        '  <dict>',
        `    <key>Weekday</key>`,
        `    <integer>${weekday}</integer>`,
        `    <key>Hour</key>`,
        `    <integer>${hour}</integer>`,
        `    <key>Minute</key>`,
        `    <integer>${minute}</integer>`,
        '  </dict>',
      ].join('\n'),
    }),
  },
  'every-3-days': {
    label: 'every-3-days',
    coverage: `runs every 3 days — consecutive ${REFRESH_DAYS}-day windows abut, nothing goes unmeasured`,
    schedule: () => ({
      key: 'StartInterval',
      body: [
        '  <key>StartInterval</key>',
        `  <integer>${THREE_DAYS_SECONDS}</integer>`,
      ].join('\n'),
    }),
  },
};

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
    else if (argument === '--cadence') options.cadence = rest[index += 1];
    else if (argument === '--hour') options.hour = Number(rest[index += 1]);
    else if (argument === '--minute') options.minute = Number(rest[index += 1]);
    else if (argument === '--weekday') options.weekday = Number(rest[index += 1]);
    else if (argument === '--check-token') options.checkToken = rest[index += 1];
    else fail(`Unknown argument: ${argument}`);
  }
  return options;
}

function resolveCadence({ cadence, hour = 9, minute = 40, weekday = 1 }) {
  const definition = CADENCES[cadence ?? ''];
  if (!definition) {
    fail(`--cadence must be one of: ${Object.keys(CADENCES).join(', ')}`);
  }
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) fail('--hour must be 0-23');
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) fail('--minute must be 0-59');
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 7) fail('--weekday must be 0-7 (0 and 7 are Sunday, 1 is Monday)');
  return { definition, hour, minute, weekday };
}

function buildPlist(options) {
  const { definition, hour, minute, weekday } = resolveCadence(options);
  const command = `exec node ${JSON.stringify(COLLECTOR)} fetch-all --days ${REFRESH_DAYS}`;
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
${definition.schedule({ hour, minute, weekday }).body}
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
    `command    node apps/backend/scripts/clarity-collect.mjs fetch-all --days ${REFRESH_DAYS}`,
  ];
  if (installed) {
    const plist = readFileSync(PLIST_PATH, 'utf8');
    const interval = /<key>StartInterval<\/key>\s*<integer>(\d+)<\/integer>/.exec(plist);
    const calendar = /<key>StartCalendarInterval<\/key>\s*<dict>([\s\S]*?)<\/dict>/.exec(plist);
    if (interval) lines.push(`cadence    every ${Number(interval[1]) / 86_400} days (StartInterval)`);
    else if (calendar) lines.push(`cadence    ${calendar[1].replace(/\s+/g, ' ').trim()} (StartCalendarInterval)`);
  }
  if (existsSync(LOG_PATH)) {
    const tail = readFileSync(LOG_PATH, 'utf8').trimEnd().split('\n').slice(-5);
    lines.push('', 'last log lines:', ...tail.map((line) => `  ${line}`));
  }
  process.stdout.write(`${lines.join('\n')}\n`);
}

// Everything the scheduled job depends on, checked through the same
// `/bin/zsh -lc` login shell launchd will use. Token probes report an exit
// status only — no secret value is ever read into this process or logged.
function runPreflight({ checkToken }) {
  const checks = [];
  const shell = (script) => spawnSync('/bin/zsh', ['-lc', script], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  for (const binary of ['node', 'infisical']) {
    const result = shell(`command -v ${binary}`);
    checks.push([binary, result.status === 0 ? `ok — ${result.stdout.trim()}` : 'MISSING from login-shell PATH']);
  }
  checks.push(['collector', existsSync(COLLECTOR) ? 'ok' : `MISSING at ${COLLECTOR}`]);
  try {
    mkdirSync(dirname(LOG_PATH), { recursive: true });
    accessSync(dirname(LOG_PATH), constants.W_OK);
    checks.push(['log dir', 'ok — writable']);
  } catch {
    checks.push(['log dir', `NOT WRITABLE at ${dirname(LOG_PATH)}`]);
  }
  if (checkToken) {
    const key = `CLARITY_API_TOKEN_${checkToken.replace(/[^a-z0-9]/gi, '_').toUpperCase()}`;
    const result = shell(`infisical secrets get ${key} --plain --env dev --path / --silent >/dev/null 2>&1`);
    checks.push([`token ${checkToken}`, result.status === 0
      ? 'ok — resolvable from a login shell (value not read)'
      : 'UNRESOLVABLE from a login shell; the scheduled run would fail on this project']);
  } else {
    checks.push(['token', 'not checked — pass --check-token <project-id> to probe one (exit status only)']);
  }
  const width = Math.max(...checks.map(([name]) => name.length));
  process.stdout.write(`${checks.map(([name, note]) => `${name.padEnd(width)}  ${note}`).join('\n')}\n`);
}

function runInstall(options) {
  if (!options.confirm) {
    fail([
      'Refusing to install without --confirm.',
      '',
      'This writes a persistent launchd agent to the owner\'s Mac:',
      `  ${PLIST_PATH}`,
      '',
      `Preview it first:  node scripts/clarity-schedule.mjs print --cadence ${options.cadence ?? '<cadence>'}`,
    ].join('\n'));
  }
  const { definition } = resolveCadence(options);
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
    `Installed ${LABEL} — ${definition.label}, ${definition.coverage}.`,
    `plist  ${PLIST_PATH}`,
    `log    ${LOG_PATH}`,
    '',
    `Trigger one run now with:  launchctl kickstart -p gui/${process.getuid()}/${LABEL}`,
    'Remove it with:            node scripts/clarity-schedule.mjs uninstall',
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
  clarity-schedule.mjs status
  clarity-schedule.mjs preflight [--check-token <project-id>]
  clarity-schedule.mjs print     --cadence <weekly|every-3-days> [--hour H] [--minute M] [--weekday D]
  clarity-schedule.mjs install   --cadence <weekly|every-3-days> --confirm [--hour H] [--minute M] [--weekday D]
  clarity-schedule.mjs uninstall

Cadences:
${Object.values(CADENCES).map((cadence) => `  ${cadence.label.padEnd(13)} ${cadence.coverage}`).join('\n')}

Defaults: --hour 9 --minute 40 --weekday 1 (Monday). --weekday applies to weekly only.
Only install/uninstall change the machine, and install requires --confirm.
`);
}

const options = parseArguments(process.argv.slice(2));
switch (options.command) {
  case 'status': runStatus(); break;
  case 'preflight': runPreflight(options); break;
  case 'print': process.stdout.write(buildPlist(options)); break;
  case 'install': runInstall(options); break;
  case 'uninstall': runUninstall(); break;
  case 'help': case '--help': case '-h': runHelp(); break;
  default: fail(`Unknown command: ${options.command}\nRun with 'help' for usage.`);
}
