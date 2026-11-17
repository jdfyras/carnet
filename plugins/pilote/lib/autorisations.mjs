// The authorisation gate: content goes to an external executor only from a directory a person
// authorised for that executor.
//
// Why a gate and not a document: in the pilot repository, 38 of 50 archived runs had sent private
// client code to a third-party executor, 9 of them against a rule written in the project's own
// instructions, and nothing recorded or prevented it. A document describing who authorised what
// goes stale at the first run that does not read it; a gate that refuses produces the record as it
// works. It is fail-closed, with no exemption computed from the tool's own location.
//
// The registry lives outside every repository (PILOTE_HOME, default ~/.pilote/autorisations.json),
// because it names the directories of private projects.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { isInside, realPath } from './chemins.mjs';

export function homePilote() {
  return process.env.PILOTE_HOME || path.join(os.homedir(), '.pilote');
}
export const registryPath = () => path.join(homePilote(), 'autorisations.json');

/**
 * Reads the registry. An ABSENT file is an empty registry, the normal first-use case. A PRESENT but
 * unreadable file is something else: it is returned marked `unreadable`, the gate treats it as empty
 * (everything refused) and writing refuses to overwrite it, so authorisations are never lost.
 */
export function read(file = registryPath()) {
  let raw;
  try { raw = fs.readFileSync(file, 'utf8'); } catch (e) {
    if (e.code === 'ENOENT') return { version: 1, entries: [] };
    return { version: 1, entries: [], unreadable: `${e.code ?? e.message}: ${file}` };
  }
  try {
    const j = JSON.parse(raw);
    if (!j || typeof j !== 'object' || !Array.isArray(j.entries)) return { version: 1, entries: [], unreadable: `unexpected structure: ${file}` };
    return j;
  } catch (e) {
    return { version: 1, entries: [], unreadable: `invalid JSON: ${e.message}` };
  }
}

function writeAtomic(j, file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, `${JSON.stringify(j, null, 2)}\n`, 'utf8');
  fs.renameSync(tmp, file);
}

/**
 * Lock around read-modify-write: several sessions on one machine can grant or revoke, and without a
 * lock a revocation can report success and leave the path authorised. A lock older than `staleMs`
 * was left by a killed process and is removed.
 */
function withLock(work, file, { tries = 60, waitMs = 100, staleMs = 30000 } = {}) {
  const lock = `${file}.lock`;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  for (let i = 0; i < tries; i += 1) {
    let fd = null;
    try { fd = fs.openSync(lock, 'wx'); } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      try { if (Date.now() - fs.statSync(lock).mtimeMs > staleMs) { fs.unlinkSync(lock); continue; } } catch { /* gone */ }
      sleep(waitMs);
      continue;
    }
    try {
      fs.writeSync(fd, String(process.pid));
      fs.closeSync(fd); fd = null;
      return work();
    } finally {
      if (fd !== null) { try { fs.closeSync(fd); } catch { /* closed */ } }
      try { fs.unlinkSync(lock); } catch { /* removed */ }
    }
  }
  throw new Error(`registry locked by another process: ${lock}`);
}

function modify(transform, file = registryPath()) {
  return withLock(() => {
    const current = read(file);
    if (current.unreadable) {
      throw new Error(`registry unreadable, nothing written (${current.unreadable}). Repair or move ${file} first.`);
    }
    const out = transform(current);
    writeAtomic(current, file);
    return out;
  }, file);
}

/** Records an authorisation. Refuses an anonymous one, and a relative root. */
export function grant(executor, root, { by, reason, file = registryPath(), when = new Date() } = {}) {
  if (!executor || !root) throw new Error('grant needs an executor and a root');
  if (!path.isAbsolute(String(root))) throw new Error(`root must be absolute: ${root}`);
  if (!by || !reason) throw new Error('grant needs --by "<who decided>" and --reason "<why>": an anonymous authorisation explains nothing later');
  return modify((j) => {
    const exists = j.entries.some((e) => e.executor === executor && isInside(root, e.root) && isInside(e.root, root));
    if (!exists) j.entries.push({ executor, root: path.resolve(root), by, reason, granted_at: when.toISOString() });
    return !exists;
  }, file);
}

export function revoke(executor, root, { file = registryPath() } = {}) {
  return modify((j) => {
    const before = j.entries.length;
    j.entries = j.entries.filter((e) => !(e.executor === executor && isInside(root, e.root) && isInside(e.root, root)));
    return before - j.entries.length;
  }, file);
}

/**
 * Was this workdir authorised for THIS executor? null when it was, a refusal message otherwise.
 * Both sides are resolved physically; a root covers its subdirectories (a worktree must not ask
 * again for a decision already made); a relative root authorises nothing.
 */
export function check(executor, workdir, registry, { platform = process.platform, resolve = realPath } = {}) {
  if (!executor || !workdir) return 'authorisation: executor or workdir missing';
  const wd = resolve(workdir);
  const entries = registry && !registry.unreadable && Array.isArray(registry.entries) ? registry.entries : [];
  const ok = entries.some((e) => e && String(e.executor) === String(executor)
    && typeof e.root === 'string' && path.isAbsolute(e.root)
    && isInside(wd, resolve(e.root), platform));
  if (ok) return null;
  const lexical = path.resolve(String(workdir));
  return `not authorised for "${executor}": ${workdir}${wd !== lexical ? `\n  physical path: ${wd}` : ''}\n`
    + (registry?.unreadable ? `  The registry is unreadable (${registry.unreadable}), so everything is refused.\n` : '')
    + '  Sending this directory to an external executor is a decision a person makes once, by name.\n'
    + `  To authorise:  pilote autoriser ${executor} "<root>" --par "<who>" --motif "<why>"`;
}
