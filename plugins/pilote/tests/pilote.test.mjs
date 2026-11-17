// pilote tests. Ported from the private pilot repository's suite, plus the authorisation gate and
// an end-to-end run against a fake codex. Each guard is broken on purpose at least once.

import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import * as autorisations from '../lib/autorisations.mjs';
import { isInside } from '../lib/chemins.mjs';
import { buildArgs, run, SANDBOX, sandboxUsed } from '../lib/codex.mjs';
import { CODEX_CONFIG_ALLOWED, isCapacityFailure, modelChain, shouldFallback, validateContract, validateExecutorConfig } from '../lib/contrat.mjs';
import { filesChanged, isUsableBaseCommit, newlyTouched, parseNameOnly, parsePorcelain } from '../lib/git.mjs';
import * as journal from '../lib/journal.mjs';
import { buildPreamble, buildPrompt, DEFAULT_READ_CAP } from '../lib/prompt.mjs';
import { deriveCodexStatus, exitCode, normalizeUsage, readOnlyViolation, RESULT_CORE_FIELDS, resultCore } from '../lib/resultat.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const FAUX = path.join(ICI, 'faux-codex.mjs');
const BIN = path.join(ICI, '..', 'bin', 'pilote.mjs');
const contrat = (x = {}) => ({ task_id: 'T-1', mode: 'review', objective: 'Review the change', workdir: '.', model: 'm', max_seconds: 20, ...x });

function depot() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pilote test '));
  const git = (...a) => execFileSync('git', a, { cwd: dir, encoding: 'utf8' });
  git('init', '-q');
  git('config', 'user.email', 'test@example.invalid');
  git('config', 'user.name', 'test');
  git('config', 'core.hooksPath', path.join(dir, '.no-hooks')); // a machine-wide commit hook must not apply
  fs.writeFileSync(path.join(dir, 'tracked.txt'), 'origin\n');
  fs.writeFileSync(path.join(dir, 'noise.txt'), 'already there\n');
  git('add', 'tracked.txt');
  git('commit', '-qm', 'base');
  return { dir, base: git('rev-parse', 'HEAD').trim() };
}

// ------------------------------------------------------------------ contract

test('contract: complete validates; every required field is required; empty counts as missing', () => {
  assert.equal(validateContract(contrat()), null);
  for (const k of ['task_id', 'mode', 'objective', 'workdir', 'model', 'max_seconds']) {
    assert.match(validateContract(contrat({ [k]: undefined })), new RegExp(k));
    assert.match(validateContract(contrat({ [k]: '' })), new RegExp(k));
  }
});

test('contract: unknown mode, non-positive deadline, misspelled fallback are refused', () => {
  assert.match(validateContract(contrat({ mode: 'yolo' })), /mode must be one of/);
  for (const s of [0, -5, 'abc']) assert.match(validateContract(contrat({ max_seconds: s })), /max_seconds/);
  assert.match(validateContract(contrat({ fallback: ['x'] })), /fallback_models/);
  assert.match(validateContract(contrat({ fallback_models: 'x' })), /array/);
  assert.match(validateContract([]), /JSON object/);
});

test('config: the one allowed key passes; any sandbox override and non-scalars are refused', () => {
  assert.deepEqual(CODEX_CONFIG_ALLOWED, ['model_reasoning_effort']);
  assert.equal(validateExecutorConfig({ model_reasoning_effort: 'high' }), null);
  for (const k of ['sandbox_mode', 'sandbox_permissions', 'shell_environment_policy.inherit']) {
    assert.match(validateExecutorConfig({ [k]: 'x' }), /not allowed/, k);
  }
  assert.match(validateExecutorConfig({ model_reasoning_effort: { a: 1 } }), /scalar/);
  assert.match(validateExecutorConfig([]), /object/);
});

test('fallback: capacity triggers the chain; timeout, denial, completion and chain end do not', () => {
  assert.deepEqual(modelChain(contrat({ fallback_models: ['b', 'c'] })), ['m', 'b', 'c']);
  assert.ok(isCapacityFailure('Rate limit reached'));
  assert.ok(!isCapacityFailure('timed out after 300s'));
  assert.ok(!isCapacityFailure('permission denied'));
  assert.equal(shouldFallback({ status: 'failed', haystack: 'quota', index: 0, chainLength: 2 }), true);
  assert.equal(shouldFallback({ status: 'failed', haystack: 'quota', index: 1, chainLength: 2 }), false);
  assert.equal(shouldFallback({ status: 'completed', haystack: 'quota', index: 0, chainLength: 2 }), false);
  assert.equal(isCapacityFailure('custom wall', ['custom']), true);
});

// ------------------------------------------------------------------ prompt

test('prompt: the frame carries the fields that never reached a worker', () => {
  const p = buildPreamble(contrat({ acceptance_criteria: ['A', 'B'], forbidden_paths: ['.env'], out_of_scope: ['refactor'], verification_commands: ['npm test'] }), 'codex');
  for (const s of ['1. A', '2. B', 'Forbidden paths', '.env', 'refactor', 'npm test', 'Read scope']) assert.ok(p.includes(s), s);
});

test('prompt: the read scope is added to a bare contract; the cap applies to read-only modes only', () => {
  assert.match(buildPreamble({}), /Read scope/);
  assert.match(buildPreamble(contrat({ mode: 'review' })), new RegExp(`At most ${DEFAULT_READ_CAP} read commands`));
  assert.doesNotMatch(buildPreamble(contrat({ mode: 'implementation' })), /At most/);
  assert.match(buildPreamble(contrat({ mode: 'implementation', max_read_commands: 5 })), /At most 5/);
});

test('prompt: an empty allowed_files is a statement; the shell clause differs by executor', () => {
  assert.match(buildPreamble(contrat({ allowed_files: [] })), /must not modify any file/);
  assert.doesNotMatch(buildPreamble(contrat()), /must not modify any file/);
  assert.match(buildPreamble(contrat(), 'codex'), /You may run read commands/);
  assert.match(buildPreamble(contrat(), 'claude'), /only have Read, Glob and Grep/);
  assert.doesNotMatch(buildPreamble(contrat(), 'inconnu'), /You may run|only have Read/);
  assert.ok(buildPrompt(contrat({ prompt: 'Look at x' }), 'codex').endsWith('=== TASK ===\nLook at x'));
});

// ------------------------------------------------------------------ git measures

test('porcelain: columns, CRLF, renames, quoted paths, -z form, clean tree', () => {
  assert.deepEqual(parsePorcelain(' M a.txt\r\n?? b c.txt\r\n'), ['a.txt', 'b c.txt']);
  assert.deepEqual(parsePorcelain('R  old.txt -> new.txt\n'), ['new.txt']);
  assert.deepEqual(parsePorcelain('?? "caf\\303\\251 x.txt"\n'), ['café x.txt']);
  assert.deepEqual(parsePorcelain('R  new.txt\0old.txt\0 M z.txt\0'), ['new.txt', 'z.txt']);
  assert.deepEqual(parsePorcelain(''), []);
  assert.deepEqual(parseNameOnly('a\r\nb\n\n'), ['a', 'b']);
});

test('base commit: a sha is usable, the literals seen in real contracts are not', () => {
  assert.ok(isUsableBaseCommit('abc1234'));
  for (const v of ['n/a', '', null, undefined, 'HEAD', 'zzzzzzz']) assert.ok(!isUsableBaseCommit(v), String(v));
});

test('newlyTouched: appeared, rewritten in place and vanished; null when a side is unmeasured', () => {
  const before = { files: ['a', 'b'], fingerprints: { a: '1', b: '2' } };
  const after = { files: ['a', 'c'], fingerprints: { a: '9', c: '3' } };
  assert.deepEqual(newlyTouched(before, after).sort(), ['a', 'b', 'c']);
  assert.equal(newlyTouched(null, after), null);
  assert.equal(newlyTouched({ files: null }, after), null);
});

test('filesChanged: the worker delta against a base, an honest null reference without one', () => {
  const { dir, base } = depot();
  try {
    const clean = filesChanged(dir, base);
    assert.equal(clean.measured_from, base);
    assert.ok(!clean.files.includes('tracked.txt'));
    fs.writeFileSync(path.join(dir, 'tracked.txt'), 'changed\n');
    assert.ok(filesChanged(dir, base).files.includes('tracked.txt'));
    assert.equal(filesChanged(dir, 'n/a').measured_from, null);
    const bad = filesChanged(dir, 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeef');
    assert.equal(bad.measured_from, null);
    assert.equal(bad.base_unusable, 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeef');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

// ------------------------------------------------------------------ result and exit

test('status: codex notices do not fail a run; turn.failed does; no message is partial; kill wins', () => {
  assert.equal(deriveCodexStatus({ response: 'x' }), 'completed');
  assert.equal(deriveCodexStatus({ turnFailed: {}, response: 'x' }), 'failed');
  assert.equal(deriveCodexStatus({ response: '  ' }), 'partial');
  assert.equal(deriveCodexStatus({ killed: true, response: 'x' }), 'cancelled');
});

test('exit code: only a status that produced work exits zero, an unknown one included', () => {
  for (const s of ['completed', 'partial']) assert.equal(exitCode(s), 0);
  for (const s of ['failed', 'cancelled', 'violated', 'blocked', 'nouveau', '', null, undefined]) assert.equal(exitCode(s), 1, String(s));
});

test('read-only tripwire: a write in review is violated; implementation and unmeasured are not', () => {
  const r = readOnlyViolation({ mode: 'review', status: 'completed', touched: ['x'] });
  assert.equal(r.status, 'violated');
  assert.equal(r.violation.announced_status, 'completed');
  assert.match(r.violation.warning, /window, not an author/);
  assert.equal(readOnlyViolation({ mode: 'implementation', status: 'completed', touched: ['x'] }).status, 'completed');
  assert.equal(readOnlyViolation({ mode: 'review', status: 'completed', touched: null }).violation, null);
  assert.equal(readOnlyViolation({ mode: 'review', status: 'completed', touched: [] }).violation, null);
});

test('usage: a comparable total, and never a total invented from a missing measure', () => {
  assert.equal(normalizeUsage('codex', { input_tokens: 10, output_tokens: 5, reasoning_output_tokens: 99 }).total, 15);
  assert.equal(normalizeUsage('codex', { input_tokens: 10 }).total, null);
  assert.equal(normalizeUsage('codex', null), null);
  const r = resultCore({ contract: contrat(), executor: 'codex', status: 'completed', attempts: [], touched: [], changed: { files: [], measured_from: 'abc1234' } });
  for (const f of RESULT_CORE_FIELDS) assert.ok(f in r, f);
});

// ------------------------------------------------------------------ sandbox table and arguments

test('sandbox: read-only for analysis and review, never full access; the passed sandbox is read back', () => {
  assert.deepEqual({ ...SANDBOX }, { analysis: 'read-only', review: 'read-only', implementation: 'workspace-write' });
  assert.ok(!Object.values(SANDBOX).includes('danger-full-access'));
  const args = buildArgs(contrat({ config: { model_reasoning_effort: 'high' } }), 'm', '/w', '/o.txt');
  assert.equal(sandboxUsed(args), 'read-only');
  assert.ok(args.includes('model_reasoning_effort=high'));
  assert.equal(sandboxUsed(['-s', 'read-only', '-c', 'sandbox_mode=danger-full-access']), 'danger-full-access');
});

// ------------------------------------------------------------------ authorisation gate

test('gate: segment comparison, nothing authorised by default, per executor, subdirectories covered', () => {
  assert.ok(isInside('/srv/repo/a', '/srv/repo', 'linux'));
  assert.ok(!isInside('/srv/repo-secret', '/srv/repo', 'linux'));
  assert.ok(isInside('C:\\Code\\Repo\\x', 'c:\\code\\repo', 'win32'));
  const root = path.resolve(os.tmpdir(), 'pilote-root');
  const reg = { entries: [{ executor: 'codex', root }] };
  const same = (x) => path.resolve(x);
  assert.match(autorisations.check('codex', root, { entries: [] }, { resolve: same }), /not authorised/);
  assert.equal(autorisations.check('codex', path.join(root, 'wt'), reg, { resolve: same }), null);
  assert.match(autorisations.check('autre', root, reg, { resolve: same }), /not authorised for "autre"/);
});

test('gate: a relative root authorises nothing; an unreadable registry refuses everything', () => {
  const same = (x) => path.resolve(x);
  assert.match(autorisations.check('codex', process.cwd(), { entries: [{ executor: 'codex', root: '.' }] }, { resolve: same }), /not authorised/);
  assert.match(autorisations.check('codex', process.cwd(), { entries: [{ executor: 'codex', root: process.cwd() }], unreadable: 'x' }, { resolve: same }), /unreadable/);
});

test('registry: grant refuses anonymous or relative; grant, list, revoke end to end; unreadable never overwritten', () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'pilote-reg-'));
  const file = path.join(d, 'autorisations.json');
  const root = path.join(d, 'projet');
  try {
    assert.throws(() => autorisations.grant('codex', root, { file }), /--by/);
    assert.throws(() => autorisations.grant('codex', 'relatif', { by: 'a', reason: 'b', file }), /absolute/);
    assert.equal(autorisations.grant('codex', root, { by: 'a', reason: 'b', file }), true);
    assert.equal(autorisations.grant('codex', root, { by: 'a', reason: 'b', file }), false, 'no duplicate');
    assert.equal(autorisations.read(file).entries.length, 1);
    assert.equal(autorisations.revoke('codex', root, { file }), 1);
    assert.equal(autorisations.read(file).entries.length, 0);
    fs.writeFileSync(file, '{ broken');
    assert.ok(autorisations.read(file).unreadable);
    assert.throws(() => autorisations.grant('codex', root, { by: 'a', reason: 'b', file }), /unreadable/);
    assert.equal(fs.readFileSync(file, 'utf8'), '{ broken', 'the unreadable registry is left as it was');
  } finally { fs.rmSync(d, { recursive: true, force: true }); }
});

test('gate: an alias inside an authorised root cannot smuggle an unauthorised directory', (t) => {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'pilote-alias-')));
  const autorise = path.join(d, 'autorise');
  const secret = path.join(d, 'secret');
  fs.mkdirSync(autorise);
  fs.mkdirSync(secret);
  try {
    try { fs.symlinkSync(secret, path.join(autorise, 'lien'), 'junction'); } catch { t.skip('cannot create a link here'); return; }
    const reg = { entries: [{ executor: 'codex', root: autorise }] };
    assert.equal(autorisations.check('codex', path.join(autorise, 'sous'), reg), null);
    assert.match(autorisations.check('codex', path.join(autorise, 'lien'), reg), /physical path/);
  } finally { fs.rmSync(d, { recursive: true, force: true }); }
});

// ------------------------------------------------------------------ journal

test('journal: one line per run with a fingerprint; never blocking; absent, empty and unreadable apart', () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'pilote-journal-'));
  const file = path.join(d, 'journal.jsonl');
  try {
    assert.equal(journal.read(file).absent, true);
    const w = journal.append(contrat(), { executor: 'codex', status: 'completed', usage: { input_tokens: 1, output_tokens: 2 } }, {}, file);
    assert.equal(w.written, true);
    const r = journal.read(file);
    assert.equal(r.entries.length, 1);
    assert.match(r.entries[0].contract_sha256, /^[0-9a-f]{16}$/);
    fs.appendFileSync(file, 'not json\n');
    assert.equal(journal.read(file).unreadable, 1);
    assert.equal(journal.append(contrat(), {}, {}, d).written, false, 'a directory as journal fails softly');
    const s = journal.summarize([{ tokens: { total: 3 } }, { tokens: null }]);
    assert.equal(s.tokens, 3);
    assert.equal(s.withoutTokens, 1);
  } finally { fs.rmSync(d, { recursive: true, force: true }); }
});

// ------------------------------------------------------------------ end to end with a fake codex

function avecFaux(mode, f) {
  const { dir, base } = depot();
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'pilote-home-'));
  const argsFile = path.join(home, 'args.jsonl');
  const env = { ...process.env, CODEX_PATH: FAUX, FAUX_CODEX: mode, FAUX_CODEX_ARGS: argsFile, PILOTE_HOME: home };
  const saved = { ...process.env };
  Object.assign(process.env, env);
  return Promise.resolve(f({ dir, base, home, argsFile }))
    .finally(() => {
      for (const k of Object.keys(env)) if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k];
      fs.rmSync(dir, { recursive: true, force: true });
      fs.rmSync(home, { recursive: true, force: true });
    });
}
const autorise = (dir) => ({ entries: [{ executor: 'codex', root: dir }] });
const codexFaux = { cmd: process.execPath, pre: [FAUX] };

test('run: refuses before spawning anything when the directory is not authorised', () => avecFaux('ok', async ({ dir, argsFile }) => {
  const r = await run(contrat({ workdir: dir }), { registry: { entries: [] }, codex: codexFaux });
  assert.equal(r.status, 'failed');
  assert.equal(r.refused_before_spawn, true);
  assert.equal(fs.existsSync(argsFile), false, 'codex was never started');
}));

test('run: refuses a sandbox override before spawning', () => avecFaux('ok', async ({ dir, argsFile }) => {
  const r = await run(contrat({ workdir: dir, config: { sandbox_mode: 'danger-full-access' } }), { registry: autorise(dir), codex: codexFaux });
  assert.match(r.error, /not allowed/);
  assert.equal(fs.existsSync(argsFile), false);
}));

test('run: a completed review, read-only sandbox passed, notices kept, commands recorded', () => avecFaux('ok', async ({ dir, base, argsFile }) => {
  const r = await run(contrat({ workdir: dir, base_commit: base }), { registry: autorise(dir), codex: codexFaux });
  assert.equal(r.status, 'completed');
  assert.equal(r.sandbox, 'read-only');
  assert.equal(r.response, 'answer from m');
  assert.deepEqual(r.commands_run, ['git status']);
  assert.equal(r.notices.length, 1);
  assert.deepEqual(r.files_touched_by_worker, []);
  assert.equal(r.usage_normalized.total, 120);
  const args = JSON.parse(fs.readFileSync(argsFile, 'utf8').trim());
  assert.equal(args[args.indexOf('-s') + 1], 'read-only');
  assert.match(args.at(-1), /=== TASK FRAME/);
}));

test('run: a review that wrote a file is violated, not completed, and exits non-zero', () => avecFaux('ecrit', async ({ dir, base }) => {
  const r = await run(contrat({ workdir: dir, base_commit: base }), { registry: autorise(dir), codex: codexFaux });
  assert.equal(r.status, 'violated');
  assert.deepEqual(r.read_only_violation.files, ['ecrit-par-le-worker.txt']);
  assert.equal(exitCode(r.status), 1);
}));

test('run: a workdir below the repository root still sees an in-place rewrite of a dirty file', () => avecFaux('reecrit', async ({ dir }) => {
  const sous = path.join(dir, 'sous');
  fs.mkdirSync(sous);
  fs.writeFileSync(path.join(sous, 'deja-modifie.txt'), 'committed\n');
  const git = (...a) => execFileSync('git', a, { cwd: dir, encoding: 'utf8' });
  git('add', '-A');
  git('commit', '-qm', 'sub');
  const base = git('rev-parse', 'HEAD').trim();
  fs.writeFileSync(path.join(sous, 'deja-modifie.txt'), 'dirty before the run\n');
  const r = await run(contrat({ workdir: sous, base_commit: base }), { registry: autorise(dir), codex: codexFaux });
  assert.equal(r.status, 'violated', JSON.stringify(r.files_touched_by_worker));
}));

test('run: turn.failed fails; a rate limit moves to the declared fallback, and says so', async () => {
  await avecFaux('echoue', async ({ dir }) => {
    const r = await run(contrat({ workdir: dir }), { registry: autorise(dir), codex: codexFaux });
    assert.equal(r.status, 'failed');
  });
  await avecFaux('quota', async ({ dir }) => {
    const r = await run(contrat({ workdir: dir, fallback_models: ['secours'] }), { registry: autorise(dir), codex: codexFaux });
    assert.equal(r.status, 'completed');
    assert.equal(r.fallback_used, true);
    assert.equal(r.model_used, 'secours');
    assert.deepEqual(r.attempts.map((a) => a.limit_hit), [true, false]);
  });
});

test('run: the deadline is ours, a killed run is cancelled', () => avecFaux('lent', async ({ dir }) => {
  const r = await run(contrat({ workdir: dir, max_seconds: 1 }), { registry: autorise(dir), codex: codexFaux });
  assert.equal(r.status, 'cancelled');
  assert.equal(r.timed_out, true);
}));

test('command line: contrat validates, codex refuses an unauthorised folder with exit 1 and no journal line', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'pilote-cli-'));
  const fichier = path.join(home, 'c.json');
  try {
    fs.writeFileSync(fichier, JSON.stringify(contrat({ workdir: home })));
    const env = { ...process.env, PILOTE_HOME: home, CODEX_PATH: FAUX };
    const v = spawnSync(process.execPath, [BIN, 'contrat', fichier, '--prompt'], { encoding: 'utf8', env });
    assert.equal(v.status, 0);
    assert.match(v.stdout, /Contract valid[\s\S]*=== TASK FRAME/);
    const r = spawnSync(process.execPath, [BIN, 'codex', fichier], { encoding: 'utf8', env });
    assert.equal(r.status, 1);
    assert.match(r.stdout, /not authorised for \\"codex\\"/);
    assert.equal(fs.existsSync(path.join(home, 'journal.jsonl')), false);
    const g = spawnSync(process.execPath, [BIN, 'autoriser', 'codex', home], { encoding: 'utf8', env });
    assert.notEqual(g.status, 0, 'an anonymous authorisation is refused');
  } finally { fs.rmSync(home, { recursive: true, force: true }); }
});
