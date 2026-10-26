import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { requirePrivateDestination } from '../private-review-output.mjs';

test('private review destinations reject checkout paths and symlink aliases, including absent targets', (context) => {
  const root = mkdtempSync(join(tmpdir(), 'private-review-output-'));
  context.after(() => rmSync(root, { recursive: true, force: true }));
  const repository = join(root, 'repository');
  const external = join(root, 'private');
  mkdirSync(repository);
  mkdirSync(external);
  symlinkSync(repository, join(external, 'alias'));
  symlinkSync(join(repository, 'missing.json'), join(external, 'dangling.json'));
  symlinkSync(join(repository, 'new-directory'), join(external, 'dangling-directory'));
  writeFileSync(join(repository, 'existing.md'), 'synthetic');
  symlinkSync(join(repository, 'existing.md'), join(external, 'scoreboard-levers.md'));
  for (const destination of [
    join(repository, 'out.json'), join(repository, '..private/out.json'),
    join(external, 'alias/new/sub/out.json'), join(external, 'dangling.json'),
    join(external, 'dangling-directory/sub/out.json'), join(external, 'scoreboard-levers.md'),
  ]) assert.throws(() => requirePrivateDestination(repository, destination), /outside the repository/);
  assert.doesNotThrow(() => requirePrivateDestination(repository, join(external, 'new/sub/out.json')));
});
