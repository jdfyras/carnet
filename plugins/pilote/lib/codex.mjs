// Adapter over the Codex CLI's non-interactive mode (`codex exec`).
//
// Flags checked against `codex exec --help` of codex-cli 0.167.1 on 2026-11-17: --json, -s/--sandbox,
// -C/--cd, -m/--model, -o/--output-last-message, -c/--config, --output-schema.
//
// Codex enforces its sandbox itself, per invocation: analysis and review run read-only,
// implementation runs workspace-write. It has no timeout flag, so this adapter's deadline is the
// only one, and no model list, so a bad model id only fails at run time (loudly).
//
// The contract is read from a file and Codex is spawned with an argument array, never through a
// shell: no prompt text is ever interpolated into a command line.

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import * as autorisations from './autorisations.mjs';
import { DEFAULT_FALLBACK_ON, isCapacityFailure, modelChain, validateContract, validateExecutorConfig } from './contrat.mjs';
import { filesChanged, newlyTouched, TRUSTED_CWD } from './git.mjs';
import { buildPrompt } from './prompt.mjs';
import { deriveCodexStatus, readOnlyViolation, resultCore } from './resultat.mjs';

export const SANDBOX = Object.freeze({ analysis: 'read-only', review: 'read-only', implementation: 'workspace-write' });
const KILL_GRACE_MS = 15000;

/**
 * On Windows `codex` on PATH is a .cmd/.ps1 shim that Node cannot spawn without a shell, and a shell
 * would bring back the interpolation risk. So the package's JS entry point is run with this Node.
 * CODEX_PATH overrides: a .js/.mjs path runs through Node, anything else is executed directly.
 */
export function resolveCodex(env = process.env) {
  const override = env.CODEX_PATH;
  if (override) return /\.(c|m)?js$/.test(override) ? { cmd: process.execPath, pre: [override] } : { cmd: override, pre: [] };
  const rel = path.join('node_modules', '@openai', 'codex', 'bin', 'codex.js');
  for (const dir of (env.PATH || env.Path || '').split(path.delimiter).filter(Boolean)) {
    const js = path.join(dir, rel);
    if (fs.existsSync(js)) return { cmd: process.execPath, pre: [js] };
  }
  return { cmd: 'codex', pre: [] };
}

/** The argument list for one invocation. Exported so the sandbox it really passes can be tested. */
export function buildArgs(contract, model, workdir, lastMessageFile, pre = []) {
  const args = [...pre, 'exec', '--json', '-s', SANDBOX[contract.mode], '-C', workdir, '-m', model, '-o', lastMessageFile];
  for (const [k, v] of Object.entries(contract.config ?? {})) args.push('-c', `${k}=${v}`);
  if (contract.output_schema) args.push('--output-schema', path.resolve(contract.output_schema));
  args.push(buildPrompt(contract, 'codex'));
  return args;
}

/** The sandbox actually passed, read back from the argument list rather than copied from the table. */
export function sandboxUsed(args) {
  const override = args.find((a, i) => args[i - 1] === '-c' && /^sandbox_mode=/.test(a));
  if (override) return override.slice('sandbox_mode='.length);
  const i = args.lastIndexOf('-s');
  return i === -1 ? null : args[i + 1];
}

async function invoke(contract, model, workdir, timeoutSec, codex) {
  // A private directory (created with mode 0700, unpredictable name) for the final message: a fixed
  // name in the shared temporary folder could be created or read by another local user first.
  const privateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pilote-'));
  const lastMsg = path.join(privateDir, 'last-message.txt');
  const args = buildArgs(contract, model, workdir, lastMsg, codex.pre);
  const started = Date.now();
  let child;
  try {
    // Started from a trusted directory, never from the workdir: `-C` gives Codex its working
    // directory, and a bare `codex` must not be looked up in a repository under review (Windows).
    child = spawn(codex.cmd, args, { cwd: TRUSTED_CWD, shell: false, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    fs.rmSync(privateDir, { recursive: true, force: true });
    return { model, status: 'failed', response: '', killed: false, hardKilled: false, code: null, sandbox: sandboxUsed(args),
      usage: null, notices: [], commands: [], error_text: e.message, haystack: e.message, stderr: [e.message], wall_seconds: 0 };
  }
  let out = '';
  let err = '';
  let killed = false;
  let hardKilled = false;
  child.stdout.on('data', (d) => { out += d; });
  child.stderr.on('data', (d) => { err += d; });
  const timer = setTimeout(() => {
    killed = true;
    child.kill('SIGTERM');
    setTimeout(() => { if (child.exitCode === null) { hardKilled = true; child.kill('SIGKILL'); } }, KILL_GRACE_MS).unref();
  }, timeoutSec * 1000);
  const code = await new Promise((res) => {
    child.on('error', (e) => { err += `\n${e.message}`; res(null); });
    child.on('close', res);
  });
  clearTimeout(timer);

  const events = out.split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  const thread = events.find((e) => e.type === 'thread.started');
  const completed = events.find((e) => e.type === 'turn.completed');
  const failed = events.find((e) => e.type === 'turn.failed');
  const items = events.filter((e) => e.type === 'item.completed' && e.item).map((e) => e.item);
  // An item of type `error` is a notice (skipped hooks, skills budget), not a failure.
  const notices = items.filter((i) => i.type === 'error').map((i) => String(i.message).slice(0, 300));
  const commands = items.filter((i) => i.type === 'command_execution').map((i) => String(i.command).slice(0, 200));

  let response = '';
  try { response = fs.readFileSync(lastMsg, 'utf8'); } catch { /* not written on failure */ } finally {
    fs.rmSync(privateDir, { recursive: true, force: true });
  }
  const errorText = failed ? JSON.stringify(failed.error ?? failed) : (code === null ? err.trim() : '');
  return {
    model,
    status: code === null && !killed ? 'failed' : deriveCodexStatus({ killed, turnFailed: failed, response }),
    response: response.trim(),
    killed,
    hardKilled,
    code,
    sandbox: sandboxUsed(args),
    thread_id: thread?.thread_id ?? null,
    usage: completed?.usage ?? null,
    notices,
    commands,
    error_text: errorText,
    haystack: `${err}\n${errorText}`,
    stderr: err.trim() ? err.trim().split('\n').slice(0, 20) : [],
    wall_seconds: Math.round((Date.now() - started) / 1000),
  };
}

const fail = (error, extra = {}) => ({ status: 'failed', error, ...extra });

/**
 * Runs a contract. Every refusal happens before anything is spawned: invalid contract, a config key
 * outside the allow-list, a directory not authorised for Codex, a missing workdir.
 */
export async function run(contract, { registry = autorisations.read(), codex = resolveCodex() } = {}) {
  const invalid = validateContract(contract, { modes: Object.keys(SANDBOX) });
  if (invalid) return fail(invalid);
  const badConfig = validateExecutorConfig(contract.config);
  if (badConfig) return fail(badConfig);
  const workdir = path.resolve(contract.workdir);
  const refused = autorisations.check('codex', workdir, registry);
  if (refused) return fail(refused, { refused_before_spawn: true });
  if (!fs.existsSync(workdir) || !fs.statSync(workdir).isDirectory()) return fail(`workdir does not exist or is not a directory: ${workdir}`);
  if (contract.output_schema && !fs.existsSync(path.resolve(contract.output_schema))) return fail(`output_schema file not found: ${contract.output_schema}`);

  const timeoutSec = Number(contract.max_seconds);
  const chain = modelChain(contract);
  const patterns = contract.fallback_on ?? DEFAULT_FALLBACK_ON;
  const before = filesChanged(workdir, contract.base_commit);
  const attempts = [];
  let last = null;
  for (let i = 0; i < chain.length; i += 1) {
    last = await invoke(contract, chain[i], workdir, timeoutSec, codex);
    const limitHit = last.status !== 'completed' && isCapacityFailure(last.haystack, patterns);
    attempts.push({ model: chain[i], status: last.status, limit_hit: limitHit, wall_seconds: last.wall_seconds, moved_on: limitHit && i < chain.length - 1 });
    if (!limitHit) break;
  }
  const changed = filesChanged(workdir, contract.base_commit);
  const touched = newlyTouched(before, changed);
  const { status, violation } = readOnlyViolation({ mode: contract.mode, status: last.status, touched });

  return {
    ...resultCore({
      contract,
      executor: 'codex',
      status,
      modelUsed: last.model, // Codex does not report the model: this is the one requested for this attempt
      sandbox: last.sandbox,
      fallbackUsed: attempts.length > 1,
      attempts,
      response: last.response,
      usage: last.usage,
      stderr: last.stderr,
      exitCode: last.code,
      timedOut: last.killed,
      hardKilled: last.hardKilled,
      wallSeconds: attempts.reduce((a, x) => a + x.wall_seconds, 0),
      touched,
      changed,
    }),
    ...(violation ? { read_only_violation: violation } : {}),
    ...(changed.base_unusable ? { base_commit_unusable: changed.base_unusable } : {}),
    thread_id: last.thread_id,
    notices: last.notices,
    commands_run: last.commands,
    error: last.error_text || undefined,
  };
}
