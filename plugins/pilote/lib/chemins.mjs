// Path comparisons for the authorisation gate.

import fs from 'node:fs';
import path from 'node:path';

/**
 * Is `file` inside `root`? Compared segment by segment, never as a string prefix: `/srv/repo-secret`
 * is not inside `/srv/repo`. Case-insensitive on Windows, like the file system.
 */
export function isInside(file, root, platform = process.platform) {
  const norm = (x) => {
    const r = path.resolve(String(x)).replace(/[\\/]+$/, '');
    return (platform === 'win32' ? r.toLowerCase() : r).split(/[\\/]/);
  };
  const c = norm(file);
  const r = norm(root);
  return r.length <= c.length && r.every((seg, i) => seg === c[i]);
}

/**
 * The physical path of a directory, with junctions and symbolic links resolved. `path.resolve`
 * only normalises text: an authorised root that holds a junction to somewhere else would otherwise
 * let that somewhere else through under its alias. Walks up to the longest existing ancestor first,
 * because realpath fails on a path that does not exist yet.
 */
export function realPath(p) {
  const start = path.resolve(String(p));
  let current = start;
  const rest = [];
  for (;;) {
    try {
      const real = fs.realpathSync.native(current);
      return rest.length ? path.join(real, ...rest.reverse()) : real;
    } catch {
      const parent = path.dirname(current);
      if (parent === current) return start;
      rest.push(path.basename(current));
      current = parent;
    }
  }
}
