#!/usr/bin/env node
import { execFileSync, spawnSync } from 'node:child_process';
import { chmodSync, mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const label = 'com.fleet.site-health';
const domain = `gui/${process.getuid()}`;
const plistPath = join(homedir(), 'Library/LaunchAgents', `${label}.plist`);
const logs = join(homedir(), 'Library/Logs/Fleet/Site Health');
const ownerRepository = process.env.SITE_HEALTH_OWNER_REPOSITORY ?? root;
const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const command = process.argv[2] ?? 'status';
const call = (args, optional = false) => {
  const result = spawnSync('/bin/launchctl', args, { encoding: 'utf8' });
  if (result.status && !optional) throw new Error(result.stderr.trim() || 'launchctl failed');
  return result;
};

if (command === 'install') {
  let existingBackend = false;
  try { existingBackend = (await fetch('http://127.0.0.1:4187/health', { signal: AbortSignal.timeout(1_000) })).ok; } catch {}
  if (existingBackend) throw new Error('The owner backend is already running. Stop that dashboard process before installing its background replacement.');
  mkdirSync(dirname(plistPath), { recursive: true });
  mkdirSync(logs, { recursive: true, mode: 0o700 });
  const env = {
    PATH: `${dirname(process.execPath)}:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin`,
    SITE_HEALTH_OWNER_REPOSITORY: ownerRepository,
    SITE_HEALTH_CATALOG_PATH: join(ownerRepository, 'apps/backend/config/projects.json'),
  };
  // The backend resolves its named Infisical credential into process memory.
  // The LaunchAgent stores only paths and other non-secret runtime settings.
  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>Label</key><string>${label}</string>
<key>ProgramArguments</key><array><string>${escape(process.execPath)}</string><string>${escape(join(root, 'scripts/start-owner.mjs'))}</string></array>
<key>WorkingDirectory</key><string>${escape(root)}</string>
<key>EnvironmentVariables</key><dict>${Object.entries(env).map(([key, value]) => `<key>${key}</key><string>${escape(value)}</string>`).join('')}</dict>
<key>RunAtLoad</key><true/><key>KeepAlive</key><true/><key>ThrottleInterval</key><integer>30</integer>
<key>StandardOutPath</key><string>${escape(join(logs, 'service.log'))}</string>
<key>StandardErrorPath</key><string>${escape(join(logs, 'service-error.log'))}</string>
</dict></plist>\n`;
  writeFileSync(plistPath, plist, { mode: 0o600 }); chmodSync(plistPath, 0o600);
  execFileSync('/usr/bin/plutil', ['-lint', plistPath], { stdio: 'inherit' });
  call(['bootout', `${domain}/${label}`], true);
  call(['enable', `${domain}/${label}`]);
  call(['bootstrap', domain, plistPath]);
  let ready = false;
  for (let attempt = 0; attempt < 25; attempt++) {
    try {
      const response = await fetch('http://127.0.0.1:4187/health', { signal: AbortSignal.timeout(1_000) });
      const body = await response.json();
      if (response.ok && body.brandEvidence === 'native-v2') { ready = true; break; }
    } catch { /* Startup may still be resolving the model connection. */ }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  if (!ready) {
    call(['bootout', `${domain}/${label}`], true);
    call(['disable', `${domain}/${label}`], true);
    throw new Error('Background startup did not become ready; the service was stopped. macOS may block a LaunchAgent from reading the Desktop-based catalog. Use pnpm dashboard in your authorized terminal. The plist is retained for recovery.');
  }
  console.log('Installed Site Health owner service. Open http://127.0.0.1:4321/ai-awareness');
} else if (command === 'status') {
  const result = call(['print', `${domain}/${label}`], true);
  console.log(result.status ? 'Site Health owner service is not installed.' : result.stdout);
  process.exitCode = result.status ? 1 : 0;
} else if (command === 'stop') {
  call(['bootout', `${domain}/${label}`], true);
  call(['disable', `${domain}/${label}`], true);
  console.log('Site Health owner service stopped. The plist is retained for recovery.');
} else throw new Error('Use owner-service.mjs install|status|stop');
