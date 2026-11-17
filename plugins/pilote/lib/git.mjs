// What a worker actually changed on disk, measured with git.
//
// Ported from a private pilot repository where each rule below was learned on real runs:
// - `git status --porcelain` alone has no reference point: a read-only review in a clone reported
//   522 files, all pre-existing. With a base commit the measure becomes a delta.
// - a path set difference cannot see a worker rewriting a file that was already modified, which
//   is the normal case when a worker reviews a diff in progress: paths are fingerprinted too.
// - a failed git command must give `null` ("not measured"), never an empty list ("clean").

import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const LF = '\n';
const CR = '\r';
const NUL = '\0';

/** git quotes and escapes an "unusual" path. Returns the real path. */
export function unquoteGitPath(p) {
  if (!(p.startsWith('"') && p.endsWith('"') && p.length >= 2)) return p;
  const body = p.slice(1, -1);
  const bytes = [];
  for (let i = 0; i < body.length; i += 1) {
    if (body[i] !== '\\') { bytes.push(...Buffer.from(body[i], 'utf8')); continue; }
    const next = body[i + 1];
    const simple = { n: 10, t: 9, r: 13, '"': 34, '\\': 92 };
    if (next in simple) { bytes.push(simple[next]); i += 1; continue; }
    if (/[0-7]/.test(next)) { bytes.push(parseInt(body.slice(i + 1, i + 4), 8)); i += 3; continue; }
    bytes.push(body.charCodeAt(i));
  }
  return Buffer.from(bytes).toString('utf8');
}

/**
 * `git status --porcelain` -> paths. Keeps the destination of a rename, unquotes escaped paths,
 * survives CRLF, and also accepts the `-z` form, where git never quotes.
 */
export function parsePorcelain(stdout) {
  const raw = String(stdout);
  if (raw.includes(NUL)) {
    const parts = raw.split(NUL).filter(Boolean);
    const out = [];
    for (let i = 0; i < parts.length; i += 1) {
      out.push(parts[i].slice(3));
      if (/^[RC]/.test(parts[i])) i += 1; // the source of a rename or copy follows: skip it
    }
    return out;
  }
  return raw.split(LF)
    .map((l) => l.split(CR).join(''))
    .filter(Boolean)
    .map((l) => l.slice(3))
    .map((p) => { const a = p.indexOf(' -> '); return a === -1 ? p : p.slice(a + 4); })
    .map(unquoteGitPath)
    .filter(Boolean);
}

/** `git diff --name-only` or `ls-files` -> paths, one per line, never quoted. */
export function parseNameOnly(stdout) {
  return String(stdout).split(LF).map((l) => l.split(CR).join('').trim()).filter(Boolean);
}

/** Contracts carry a real sha, a literal "n/a", or nothing. Only the first is a git reference. */
export function isUsableBaseCommit(v) {
  return typeof v === 'string' && /^[0-9a-f]{7,40}$/i.test(v.trim());
}

/**
 * Fingerprint of a path git reported, to see a change and not only an appearance. A directory
 * (ignored trees are reported folded, `node_modules/` on one line) is fingerprinted by its date
 * and its first-level entry count. Known limit: a deep write inside an existing ignored tree stays
 * invisible; covering it would mean walking those trees at every run.
 */
export function fingerprintPath(root, file) {
  try {
    const p = path.resolve(String(root), String(file));
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      let n = -1;
      try { n = fs.readdirSync(p).length; } catch { /* unreadable: -1 */ }
      return `dir:${Math.round(st.mtimeMs)}:${n}`;
    }
    if (!st.isFile()) return 'other';
    return `file:${st.size}:${crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').slice(0, 24)}`;
  } catch {
    return 'absent'; // differs from any present file, so a deletion shows
  }
}

export function fingerprints(root, files) {
  if (!Array.isArray(files)) return null;
  const m = Object.create(null);
  for (const f of files) m[f] = fingerprintPath(root, f);
  return m;
}

/**
 * What changed during the run and nothing else: the difference between two snapshots taken before
 * the first and after the last invocation. A `null` side gives `null`: no attribution is invented
 * from a missing measure.
 */
export function newlyTouched(before, after) {
  const norm = (x) => {
    if (Array.isArray(x)) return { files: x, prints: null };
    if (x && Array.isArray(x.files)) return { files: x.files, prints: x.fingerprints ?? null };
    return null;
  };
  const a = norm(before);
  const b = norm(after);
  if (!a || !b) return null;
  const seenBefore = new Set(a.files);
  const seenAfter = new Set(b.files);
  const appeared = b.files.filter((f) => !seenBefore.has(f));
  if (!a.prints || !b.prints) return appeared;
  const rewritten = b.files.filter((f) => seenBefore.has(f)
    && a.prints[f] !== undefined && b.prints[f] !== undefined && a.prints[f] !== b.prints[f]);
  const vanished = a.files.filter((f) => !seenAfter.has(f));
  return [...new Set([...appeared, ...rewritten, ...vanished])];
}

/**
 * A directory that is not the repository under review, to start processes from. On Windows a bare
 * program name is also looked up in the current directory: started from a repository being reviewed,
 * a planted `git.exe` there would run instead of git. Node's own directory is trusted by definition.
 */
export const TRUSTED_CWD = path.dirname(process.execPath);

function git(dir, args) {
  const r = spawnSync('git', ['-C', String(dir), ...args], { cwd: TRUSTED_CWD, encoding: 'utf8', shell: false });
  return r.status === 0 ? r.stdout : null;
}

/**
 * Snapshot of what differs in `dir`: against `baseCommit` when it is usable, otherwise against
 * nothing (and the result says so). Ignored paths are included on purpose: secrets and `.env`
 * files are exactly what contracts forbid, and `.gitignore` hides them from a plain status.
 */
export function filesChanged(dir, baseCommit) {
  // Every path below is relative to the repository ROOT, and fingerprints are taken from the root.
  // `git diff --name-only` and `status --porcelain` print root-relative paths even when run from a
  // subfolder; fingerprinting them against the subfolder made every path "absent" on both sides, so
  // an in-place rewrite in a workdir below the root went unseen (found by a test on 2026-11-17).
  const top = (git(dir, ['rev-parse', '--show-toplevel']) ?? '').trim() || dir;
  if (isUsableBaseCommit(baseCommit)) {
    const base = String(baseCommit).trim();
    const tracked = git(dir, ['diff', '--name-only', base, '--']);
    const untracked = git(dir, ['ls-files', '--full-name', '--others', '--exclude-standard']);
    const ignored = git(dir, ['ls-files', '--full-name', '--others', '--ignored', '--exclude-standard', '--directory']);
    if (tracked !== null && untracked !== null) {
      const files = [...new Set([...parseNameOnly(tracked), ...parseNameOnly(untracked), ...parseNameOnly(ignored ?? '')])];
      return { files, fingerprints: fingerprints(top, files), measured_from: base };
    }
    const fallback = git(dir, ['status', '--porcelain', '--ignored=traditional']);
    const files = fallback === null ? null : parsePorcelain(fallback);
    return { files, fingerprints: fingerprints(top, files), measured_from: null, base_unusable: base };
  }
  const st = git(dir, ['status', '--porcelain', '--ignored=traditional']);
  const files = st === null ? null : parsePorcelain(st);
  return { files, fingerprints: fingerprints(top, files), measured_from: null };
}
