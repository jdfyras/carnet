// The delegation contract: what every adapter enforces before anything runs.

export const MODES = ['analysis', 'review', 'implementation'];
export const READ_ONLY_MODES = ['analysis', 'review'];
export const REQUIRED_FIELDS = ['task_id', 'mode', 'objective', 'workdir', 'model', 'max_seconds'];

/**
 * Keys a contract may pass to the Codex CLI with `-c key=value`. Deliberately tiny: `-c` can set
 * any value of the user's Codex configuration, including the sandbox. Measured on an earlier Codex
 * version: `-c sandbox_mode=danger-full-access` let a write through that `-s read-only` refused.
 * Without an allow-list, a read-only contract could give itself full disk access.
 */
export const CODEX_CONFIG_ALLOWED = ['model_reasoning_effort'];

/**
 * Capacity conditions that justify a declared fallback model. Deliberately narrow: a timeout means
 * the task was too big and a denial means the worker was refused; another model fixes neither.
 * Not verified against a real quota response; a contract can override them with `fallback_on`.
 */
export const DEFAULT_FALLBACK_ON = [
  'rate.?limit', 'quota', 'overloaded', 'capacity', 'try again later',
  'temporarily unavailable', 'resource.?exhausted', '429', '503',
];

/** An error string, or null when the contract is valid. */
export function validateContract(contract, { modes = MODES } = {}) {
  if (!contract || typeof contract !== 'object' || Array.isArray(contract)) return 'contract must be a JSON object';
  for (const k of REQUIRED_FIELDS) {
    const v = contract[k];
    if (v === undefined || v === null || v === '') return `contract field missing: ${k}`;
  }
  if (!modes.includes(contract.mode)) return `mode must be one of ${modes.join('|')}, got "${contract.mode}"`;
  const secs = Number(contract.max_seconds);
  if (!Number.isFinite(secs) || secs <= 0) return 'max_seconds must be > 0';
  // A contract that wrote `fallback` believed it was covered and had no fallback at all. Refused
  // rather than aliased: an alias would hide the mistake, and the next spelling would pass too.
  if (contract.fallback !== undefined && contract.fallback_models === undefined) {
    return 'contract field `fallback` is not read; the key is `fallback_models`';
  }
  if (contract.fallback_models !== undefined && !Array.isArray(contract.fallback_models)) {
    return 'fallback_models must be an array of model names';
  }
  if (contract.acceptance_criteria !== undefined && !Array.isArray(contract.acceptance_criteria)) {
    return 'acceptance_criteria must be an array';
  }
  return null;
}

/** An allow-list, not a deny-list: the surface of `-c` is the whole configuration file. */
export function validateExecutorConfig(config, allowed = CODEX_CONFIG_ALLOWED) {
  if (config === undefined || config === null) return null;
  if (typeof config !== 'object' || Array.isArray(config)) return 'contract.config must be an object';
  const rejected = Object.keys(config).filter((k) => !allowed.includes(k));
  if (rejected.length) {
    return `contract.config: key(s) not allowed: ${rejected.join(', ')}. Allowed: ${allowed.join(', ')}. `
      + 'A key such as sandbox_mode or sandbox_permissions would override the sandbox this adapter relies on.';
  }
  for (const [k, v] of Object.entries(config)) {
    if (v === null || typeof v === 'object') return `contract.config.${k} must be a scalar`;
  }
  return null;
}

/** The requested model, then the declared fallbacks, in order. */
export function modelChain(contract) {
  return [contract.model, ...(contract.fallback_models ?? [])];
}

export function isCapacityFailure(haystack, patterns = DEFAULT_FALLBACK_ON) {
  return patterns.some((p) => new RegExp(p, 'i').test(String(haystack ?? '')));
}

/** Advance the chain only on a non-completed run that looks like capacity, while a model remains. */
export function shouldFallback({ status, haystack, patterns, index, chainLength }) {
  if (status === 'completed') return false;
  if (index >= chainLength - 1) return false;
  return isCapacityFailure(haystack, patterns);
}
