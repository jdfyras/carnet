#!/usr/bin/env node
// pilote: delegation tools. Node only, no dependency.
//
// Exit codes: 0 success, 1 refusal / failed run / validation, 2 environment, 64 usage.

import fs from 'node:fs';

import * as autorisations from '../lib/autorisations.mjs';
import * as journal from '../lib/journal.mjs';
import { run, SANDBOX } from '../lib/codex.mjs';
import { validateContract, validateExecutorConfig } from '../lib/contrat.mjs';
import { buildPrompt } from '../lib/prompt.mjs';
import { exitCode } from '../lib/resultat.mjs';

const AIDE = `pilote <command>

  contrat <contract.json> [--prompt]    validate a contract; --prompt prints what the worker would receive
  codex <contract.json> [--out <file>]  run a contract with Codex (codex exec), print the result JSON
  autoriser <executor> <root> --par "<who>" --motif "<why>"
                                        authorise a directory for an external executor
  retirer <executor> <root>             revoke it
  autorisations                         list authorisations and where they are stored
  journal [resume|fin <n>|chemin]       the delegation journal (outside every repository)
`;

function options(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) { o[a.slice(2)] = next; i += 1; } else o[a.slice(2)] = true;
    } else o._.push(a);
  }
  return o;
}

function readContract(file) {
  if (!file) { console.error(AIDE); process.exit(64); }
  try { return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, '')); } catch (e) {
    console.error(`cannot read contract ${file}: ${e.message}`);
    process.exit(2);
  }
}

async function main(argv) {
  const [cmd, ...rest] = argv;
  const o = options(rest);
  if (!cmd || cmd === 'aide' || cmd === '--help' || cmd === '-h') return console.log(AIDE);

  if (cmd === 'contrat') {
    const c = readContract(o._[0]);
    const err = validateContract(c, { modes: Object.keys(SANDBOX) }) ?? validateExecutorConfig(c.config);
    if (err) { console.error(err); process.exit(1); }
    console.log('Contract valid.');
    if (o.prompt) console.log(`\n${buildPrompt(c, typeof o.executeur === 'string' ? o.executeur : 'codex')}`);
    return undefined;
  }

  if (cmd === 'codex') {
    const c = readContract(o._[0]);
    const res = await run(c);
    const json = JSON.stringify(res, null, 2);
    if (typeof o.out === 'string') fs.writeFileSync(o.out, json);
    if (!res.refused_before_spawn) {
      const j = journal.append(c, res, { out: typeof o.out === 'string' ? o.out : null });
      if (!j.written) console.error(`journal not written (${j.path}): ${j.error}`);
    }
    console.log(json);
    process.exit(exitCode(res.status));
  }

  if (cmd === 'autoriser') {
    const [executor, root] = o._;
    const added = autorisations.grant(executor, root, { by: o.par, reason: o.motif });
    return console.log(added ? `Authorised: ${executor} on ${root}.` : `Already authorised: ${executor} on ${root}.`);
  }

  if (cmd === 'retirer') {
    const [executor, root] = o._;
    const n = autorisations.revoke(executor, root);
    return console.log(n ? `Revoked: ${executor} on ${root}.` : `Nothing to revoke for ${executor} on ${root}.`);
  }

  if (cmd === 'autorisations') {
    const r = autorisations.read();
    console.log(`Registry: ${autorisations.registryPath()}`);
    if (r.unreadable) { console.error(`UNREADABLE: ${r.unreadable}. Everything is refused until it is repaired.`); process.exit(2); }
    if (!r.entries.length) return console.log('No authorisation: every external run is refused.');
    for (const e of r.entries) console.log(`- ${e.executor}  ${e.root}  (by ${e.by}, ${e.granted_at?.slice(0, 10)}: ${e.reason})`);
    return undefined;
  }

  if (cmd === 'journal') {
    const [sous = 'resume', n] = o._;
    if (sous === 'chemin') return console.log(journal.journalPath());
    const { entries, unreadable, absent, error } = journal.read();
    if (error) { console.error(`journal UNREADABLE: ${error}. This is not "no run": it is "cannot read".`); process.exit(2); }
    if (!entries.length && unreadable) { console.error(`journal UNREADABLE: ${unreadable} line(s), none usable.`); process.exit(2); }
    if (!entries.length) return console.log(`${absent ? 'No journal yet' : 'Empty journal'}: ${journal.journalPath()}`);
    if (unreadable) console.error(`Warning: ${unreadable} unreadable line(s), not counted.`);
    if (sous === 'fin') {
      for (const e of entries.slice(-(Number(n) || 10))) {
        console.log(`${e.ts}  ${String(e.status).padEnd(10)} ${String(e.executor).padEnd(6)} ${String(e.mode).padEnd(15)} ${String(e.wall_seconds ?? '?').padStart(4)}s  ${e.task_id ?? '?'}`);
      }
      return undefined;
    }
    const s = journal.summarize(entries);
    console.log(`${s.runs} run(s), ${Math.round(s.seconds / 60)} min, ${s.tokens} tokens (input + output)`);
    for (const k of Object.keys(s.by).sort()) console.log(`  ${String(s.by[k]).padStart(4)}  ${k}`);
    if (s.withoutTokens) console.log(`  ${s.withoutTokens} run(s) without a token measure: not counted, not counted as zero`);
    return undefined;
  }

  console.error(`Unknown command "${cmd}".\n${AIDE}`);
  process.exit(64);
}

main(process.argv.slice(2)).catch((e) => { console.error(e.message); process.exit(1); });
