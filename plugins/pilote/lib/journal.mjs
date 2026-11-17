// Append-only journal of delegations, outside every repository (it names private directories):
// PILOTE_HOME/journal.jsonl, default ~/.pilote/journal.jsonl.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { homePilote } from './autorisations.mjs';
import { normalizeUsage } from './resultat.mjs';

export const journalPath = () => path.join(homePilote(), 'journal.jsonl');

export function fingerprint(obj) {
  try { return crypto.createHash('sha256').update(JSON.stringify(obj)).digest('hex').slice(0, 16); } catch { return null; }
}

/** One line per run. Never blocking: a journal that broke a paid run would be worse than none. */
export function append(contract, result, extra = {}, file = journalPath()) {
  const entry = {
    ts: new Date().toISOString(),
    task_id: result?.task_id ?? contract?.task_id ?? null,
    attempt_id: result?.attempt_id ?? contract?.attempt_id ?? null,
    executor: result?.executor ?? null,
    mode: result?.mode ?? contract?.mode ?? null,
    status: result?.status ?? null,
    model_requested: result?.model_requested ?? contract?.model ?? null,
    model_used: result?.model_used ?? null,
    fallback_used: result?.fallback_used ?? null,
    sandbox: result?.sandbox ?? null,
    wall_seconds: result?.wall_seconds ?? null,
    tokens: normalizeUsage(result?.executor, result?.usage),
    files_touched: Array.isArray(result?.files_touched_by_worker) ? result.files_touched_by_worker.length : null,
    measured_from: result?.files_changed_measured_from ?? null,
    timed_out: result?.timed_out ?? null,
    contract_sha256: fingerprint(contract),
    workdir: contract?.workdir ?? null,
    ...extra,
  };
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.appendFileSync(file, `${JSON.stringify(entry)}\n`, 'utf8');
    return { written: true, path: file };
  } catch (e) {
    return { written: false, path: file, error: e.message };
  }
}

/** Three states never to confuse: absent, empty, unreadable. "I cannot read it" is not "no run". */
export function read(file = journalPath()) {
  let raw;
  try { raw = fs.readFileSync(file, 'utf8'); } catch (e) {
    if (e.code === 'ENOENT') return { entries: [], unreadable: 0, absent: true, error: null };
    return { entries: [], unreadable: 0, absent: false, error: `${e.code ?? e.message}: ${file}` };
  }
  const entries = [];
  let unreadable = 0;
  for (const l of raw.split('\n')) {
    if (!l.trim()) continue;
    try { entries.push(JSON.parse(l)); } catch { unreadable += 1; }
  }
  return { entries, unreadable, absent: false, error: null };
}

/** Aggregates. A run without a token measure is counted apart, never as zero. */
export function summarize(entries) {
  const by = {};
  let seconds = 0;
  let tokens = 0;
  let withoutTokens = 0;
  for (const e of entries) {
    const k = `${e.executor ?? '?'} / ${e.mode ?? '?'} / ${e.status ?? '?'}`;
    by[k] = (by[k] || 0) + 1;
    seconds += Number(e.wall_seconds) || 0;
    if (e.tokens && Number.isFinite(e.tokens.total)) tokens += e.tokens.total; else withoutTokens += 1;
  }
  return { runs: entries.length, by, seconds, tokens, withoutTokens };
}
