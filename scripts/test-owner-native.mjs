#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

if (process.platform !== 'darwin') throw new Error('Native owner verification requires macOS and the Swift toolchain.');
const root = resolve(import.meta.dirname, '..');
const temporary = mkdtempSync(join(tmpdir(), 'site-health-native-test-'));
const binary = join(temporary, 'SiteHealthOwner');
try {
  const build = spawnSync('/usr/bin/swiftc', ['-O', join(root, 'scripts/owner-host/main.swift'), '-o', binary, '-framework', 'AppKit'], { stdio: 'inherit' });
  if (build.error || build.status !== 0) throw build.error ?? new Error('Native test host compilation failed');
  const result = spawnSync(process.execPath, ['--test', join(root, 'scripts/test/owner-host.test.mjs')], {
    stdio: 'inherit',
    env: { ...process.env, SITE_HEALTH_HOST_TEST_BINARY: binary, SITE_HEALTH_TEST_ASTRO: '1' },
  });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally { rmSync(temporary, { recursive: true, force: true }); }
