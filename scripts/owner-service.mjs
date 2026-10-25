#!/usr/bin/env node
import { execFileSync, spawnSync } from 'node:child_process';
import { chmodSync, copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const label = 'com.fleet.site-health';
export const bundleId = 'com.fleet.site-health.owner-host';
const domain = `gui/${process.getuid()}`;
const plistPath = join(homedir(), 'Library/LaunchAgents', `${label}.plist`);
const logs = join(homedir(), 'Library/Logs/Fleet/Site Health');
const prepared = join(root, '.fleet-local/owner-host/Site Health.app');
const installed = join(homedir(), 'Applications/Fleet/Site Health.app');
const binary = (app) => join(app, 'Contents/MacOS/SiteHealthOwner');
const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const run = (command, args) => execFileSync(command, args, { stdio: 'inherit' });
const call = (args, optional = false) => {
  const result = spawnSync('/bin/launchctl', args, { encoding: 'utf8' });
  if ((result.error || result.status) && !optional) throw new Error(result.error?.message || result.stderr.trim() || 'launchctl failed');
  return result;
};

export function launchAgent(app, logDirectory) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>Label</key><string>${label}</string>
<key>ProgramArguments</key><array><string>${escape(binary(app))}</string></array>
<key>AssociatedBundleIdentifiers</key><array><string>${bundleId}</string></array>
<key>RunAtLoad</key><true/>
<key>AbandonProcessGroup</key><false/>
<key>KeepAlive</key><dict><key>SuccessfulExit</key><false/></dict>
<key>ThrottleInterval</key><integer>30</integer>
<key>StandardOutPath</key><string>${escape(join(logDirectory, 'service.log'))}</string>
<key>StandardErrorPath</key><string>${escape(join(logDirectory, 'service-error.log'))}</string>
</dict></plist>\n`;
}

export async function ownerReady() {
  try {
    const [backend, web] = await Promise.all([
      fetch('http://127.0.0.1:4187/health', { signal: AbortSignal.timeout(1_000) }),
      fetch('http://127.0.0.1:4321/ai-awareness', { signal: AbortSignal.timeout(1_000) }),
    ]);
    const health = await backend.json();
    const html = await web.text();
    return backend.ok && health.service === 'site-health-backend' && health.brandEvidence === 'native-v2'
      && web.ok && html.includes('data-brand-evidence-collect') && html.includes('Site Health');
  } catch { return false; }
}

async function assertPortsFree() {
  const { createServer } = await import('node:net');
  for (const port of [4187, 4321]) await new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', () => reject(new Error(`Port ${port} is in use. Keep the working dashboard running until you are ready to switch, then stop it before activation.`)));
    server.listen(port, '127.0.0.1', () => server.close(resolve));
  });
}

async function main() {
  const command = process.argv[2] ?? 'status';
  if (command === 'prepare') {
    const identity = process.argv[3];
    if (!identity || identity === '-') throw new Error('Pass a persistent code-signing identity: pnpm owner:service prepare "Developer ID Application: …". Ad-hoc signing cannot preserve this app’s consent identity.');
    const ownerRepository = resolve(process.env.SITE_HEALTH_OWNER_REPOSITORY ?? root);
    const contents = join(prepared, 'Contents');
    mkdirSync(join(contents, 'MacOS'), { recursive: true });
    mkdirSync(join(contents, 'Resources'), { recursive: true });
    const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
    const sourceDigest = createHash('sha256');
    for (const path of ['scripts/owner-host/main.swift', 'scripts/start-owner.mjs', 'scripts/owner-service.mjs', 'apps/web/scripts/owner-server.mjs']) sourceDigest.update(readFileSync(join(root, path)));
    writeFileSync(join(contents, 'Resources/owner-host.json'), JSON.stringify({
      nodePath: process.execPath, repositoryPath: root, ownerRepositoryPath: ownerRepository,
      catalogPath: join(ownerRepository, 'apps/backend/config/projects.json'),
    }, null, 2) + '\n', { mode: 0o600 });
    writeFileSync(join(contents, 'Info.plist'), `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0"><dict>
<key>CFBundleExecutable</key><string>SiteHealthOwner</string>
<key>CFBundleIdentifier</key><string>${bundleId}</string>
<key>CFBundleName</key><string>Site Health</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>CFBundleVersion</key><string>1</string>
<key>LSUIElement</key><true/>
<key>NSDesktopFolderUsageDescription</key><string>Site Health reads the Fleet portfolio catalog and local evidence on your Desktop.</string>
<key>SiteHealthSourceRevision</key><string>${revision}</string>
<key>SiteHealthHostSourceSHA256</key><string>${sourceDigest.digest('hex')}</string>
</dict></plist>\n`);
    run('/usr/bin/swiftc', ['-O', join(root, 'scripts/owner-host/main.swift'), '-o', binary(prepared), '-framework', 'AppKit']);
    run('/usr/bin/plutil', ['-lint', join(contents, 'Info.plist')]);
    run('/usr/bin/codesign', ['--force', '--sign', identity, '--identifier', bundleId, prepared]);
    run('/usr/bin/codesign', ['--verify', '--strict', prepared]);
    writeFileSync(join(root, '.fleet-local/owner-host/launch-agent.plist'), launchAgent(installed, logs));
    console.log(`Prepared signed owner host at ${prepared}. Source ${revision}. No app or service was installed.`);
  } else if (command === 'permission') {
    run('/usr/bin/codesign', ['--verify', '--strict', prepared]);
    if (!call(['print', `${domain}/${label}`], true).status) throw new Error('Stop the existing owner service before replacing its host.');
    if (existsSync(installed)) {
      const backup = `${installed}.previous-${Date.now()}`;
      cpSync(installed, backup, { recursive: true, errorOnExist: true });
      console.log(`Previous app retained at ${backup}`);
    }
    mkdirSync(dirname(installed), { recursive: true });
    cpSync(prepared, installed, { recursive: true });
    run('/usr/bin/codesign', ['--verify', '--strict', installed]);
    run('/usr/bin/open', ['-W', '-n', installed, '--args', '--request-access']);
    console.log('Permission window closed. No service was started. Activation verifies the launchd host and both services using the app’s own macOS access.');
  } else if (command === 'install') {
    run('/usr/bin/codesign', ['--verify', '--strict', installed]);
    await assertPortsFree();
    mkdirSync(dirname(plistPath), { recursive: true });
    mkdirSync(logs, { recursive: true, mode: 0o700 });
    if (existsSync(plistPath)) {
      const backup = `${plistPath}.previous-${Date.now()}`;
      copyFileSync(plistPath, backup);
      console.log(`Previous LaunchAgent retained at ${backup}`);
    }
    writeFileSync(plistPath, launchAgent(installed, logs), { mode: 0o600 });
    chmodSync(plistPath, 0o600);
    run('/usr/bin/plutil', ['-lint', plistPath]);
    call(['bootout', `${domain}/${label}`], true);
    call(['enable', `${domain}/${label}`]);
    call(['bootstrap', domain, plistPath]);
    let ready = false;
    for (let attempt = 0; attempt < 60; attempt++) {
      const state = call(['print', `${domain}/${label}`], true);
      if (!state.status && /state = running/.test(state.stdout) && await ownerReady()) { ready = true; break; }
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }
    if (!ready) {
      call(['bootout', `${domain}/${label}`], true);
      call(['disable', `${domain}/${label}`], true);
      throw new Error(`The launchd host, backend and dashboard did not become ready; the LaunchAgent was stopped and disabled. Confirm Site Health has Desktop access in System Settings → Privacy & Security → Files and Folders. Inspect ${join(logs, 'service-error.log')} for the startup failure. Retained app/plist backups and pnpm dashboard remain available for recovery.`);
    }
    console.log('Installed Site Health owner service. Open http://127.0.0.1:4321/ai-awareness');
  } else if (command === 'status') {
    const result = call(['print', `${domain}/${label}`], true);
    console.log(result.status ? 'Site Health owner service is not loaded.' : result.stdout);
    process.exitCode = result.status ? 1 : 0;
  } else if (command === 'stop') {
    call(['bootout', `${domain}/${label}`], true);
    call(['disable', `${domain}/${label}`], true);
    console.log('Site Health owner service stopped. The app and plist are retained for recovery.');
  } else throw new Error('Use owner-service.mjs prepare <signing-identity>|permission|install|status|stop');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { await main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
