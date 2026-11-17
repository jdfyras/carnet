// The result every adapter publishes, its status rules and its exit code.

import { READ_ONLY_MODES } from './contrat.mjs';

export const RESULT_CONTRACT = 'pilote.result.v1';

export const RESULT_CORE_FIELDS = [
  'result_contract', 'task_id', 'attempt_id', 'executor', 'mode', 'status',
  'model_requested', 'model_used', 'sandbox', 'fallback_used', 'attempts',
  'response', 'usage', 'stderr_notices', 'exit_code', 'timed_out', 'hard_killed', 'wall_seconds',
  'files_touched_by_worker', 'files_changed', 'files_changed_measured_from',
];

/**
 * Codex emits `item.completed` events of type `error` on runs that succeed (skipped hooks, skills
 * budget exceeded). Only `turn.failed` is fatal. A run with no final message is partial.
 */
export function deriveCodexStatus({ killed, turnFailed, response }) {
  if (killed) return 'cancelled';
  if (turnFailed) return 'failed';
  if (!String(response ?? '').trim()) return 'partial';
  return 'completed';
}

/**
 * Only the two statuses where work happened and an answer exists exit 0. Everything else exits 1,
 * an unknown status included: in the pilot repository, "binary not found", "killed" and "read-only
 * contract violated" all exited 0, and `command && echo ok` printed ok.
 */
export const ZERO_EXIT_STATUSES = ['completed', 'partial'];
export function exitCode(status) {
  return ZERO_EXIT_STATUSES.includes(String(status)) ? 0 : 1;
}

/**
 * Brings token usage to a comparable shape. `total` is always input + output, without cache or
 * reasoning: a convention for comparing runs, not an invoice. Unknown fields stay null and are
 * never filled with a zero that would sum silently.
 */
export function normalizeUsage(executor, usage) {
  if (!usage || typeof usage !== 'object') return null;
  const n = (v) => (Number.isFinite(Number(v)) && v !== null && v !== '' ? Number(v) : null);
  const input = n(usage.input_tokens);
  const output = n(usage.output_tokens);
  return {
    executor: executor ?? null,
    input,
    output,
    reasoning: n(usage.reasoning_output_tokens ?? usage.thinking_tokens),
    cached_read: n(usage.cache_read_tokens ?? usage.cached_input_tokens),
    cached_write: n(usage.cache_write_input_tokens),
    total: input === null || output === null ? null : input + output,
    total_semantics: 'input + output, without cache and without reasoning',
  };
}

/**
 * Tripwire: a worker declared read-only that wrote something is not `completed`, whatever the
 * provider said. It measures a WINDOW, not an author: an edit by the coordinator during the run is
 * attributed to the worker, which is why a worker gets a worktree nobody else touches. `touched`
 * null (git unavailable) triggers nothing: no violation is reported that was not measured.
 */
export function readOnlyViolation({ mode, status, touched }) {
  if (!READ_ONLY_MODES.includes(mode)) return { status, violation: null };
  if (!Array.isArray(touched) || touched.length === 0) return { status, violation: null };
  return {
    status: 'violated',
    violation: {
      mode,
      files: touched,
      announced_status: status,
      explanation: `the contract declares mode "${mode}", which must write nothing, and ${touched.length} file(s) `
        + 'changed during the run. The status announced by the provider is kept in `announced_status`.',
      warning: 'measures a window, not an author: an edit by the coordinator during the run is attributed '
        + 'to the worker. Use a dedicated worktree that nobody else modifies.',
    },
  };
}

/** The fields every result carries. Executor-specific extras sit beside them. */
export function resultCore({
  contract, executor, status, modelUsed, sandbox = null, fallbackUsed, attempts, response, usage,
  stderr = [], exitCode: code, timedOut, hardKilled, wallSeconds, touched, changed,
}) {
  return {
    result_contract: RESULT_CONTRACT,
    task_id: contract?.task_id ?? null,
    attempt_id: contract?.attempt_id ?? null,
    executor,
    mode: contract?.mode ?? null,
    status,
    model_requested: contract?.model ?? null,
    model_used: modelUsed ?? null,
    sandbox,
    fallback_used: fallbackUsed,
    attempts,
    response,
    usage: usage ?? null,
    usage_normalized: normalizeUsage(executor, usage),
    stderr_notices: stderr,
    exit_code: code,
    timed_out: timedOut,
    hard_killed: hardKilled,
    wall_seconds: wallSeconds,
    files_touched_by_worker: touched,
    files_changed: changed?.files ?? null,
    files_changed_measured_from: changed?.measured_from ?? null,
  };
}
