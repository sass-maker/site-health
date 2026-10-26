import { lstatSync, readlinkSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';

function destinationRealpath(path, depth = 0) {
  if (depth > 40) throw new Error("Too many symlinks in private review output path.");
  let ancestor = resolve(path);
  for (;;) {
    try {
      return resolve(realpathSync.native(ancestor), relative(ancestor, resolve(path)));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      // realpath also rejects a dangling symlink, which a later write can follow.
      try {
        if (lstatSync(ancestor).isSymbolicLink()) {
          const target = resolve(dirname(ancestor), readlinkSync(ancestor));
          return resolve(destinationRealpath(target, depth + 1), relative(ancestor, resolve(path)));
        }
      } catch (linkError) {
        if (linkError.code !== 'ENOENT') throw linkError;
      }
      const parent = dirname(ancestor);
      if (parent === ancestor) throw error;
      ancestor = parent;
    }
  }
}

export function requirePrivateDestination(repository, path) {
  const child = relative(realpathSync.native(repository), destinationRealpath(path));
  const outside = child === '..' || child.startsWith(`..${sep}`) || isAbsolute(child);
  if (!outside) throw new Error('Private review output must stay outside the repository.');
}
