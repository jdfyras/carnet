// Shared by the hooks: how a verdict is sent back, in warn or block mode.
//
// Contract read in the Claude Code hooks documentation (2026-11-16):
//   PreToolUse  block: hookSpecificOutput.permissionDecision = "deny" + permissionDecisionReason
//               warn : hookSpecificOutput.additionalContext (the call still runs, the model sees the note)
//   Stop        block: { decision: "block", reason }
//               warn : hookSpecificOutput.additionalContext
//   SessionStart     : plain stdout is added to the context, capped at 10,000 characters
//
// Default is WARN. A blocking false positive on a teammate's first day is how a
// guard gets uninstalled; blocking is opt-in, per project or per user.
//
// A hook never breaks a session: on any internal error it lets the action pass.

import fs from 'node:fs';
import { lireConfig, trouverRacine } from '../lib/racine.mjs';

export function lireEntree() {
  try { return JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { return null; }
}

/** 'avertir' | 'bloquer': user option first, then the project's carnet.json, then warn. */
export function mode(cwd) {
  const option = (process.env.CLAUDE_PLUGIN_OPTION_GARDES ?? '').toLowerCase();
  if (option === 'avertir' || option === 'bloquer') return option;
  try {
    const racine = trouverRacine(cwd || process.cwd());
    if (racine) return lireConfig(racine).gardes;
  } catch { /* unreadable config: warn */ }
  return 'avertir';
}

export function sortiePreToolUse(raison, quelMode) {
  if (quelMode === 'bloquer') {
    return { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: raison } };
  }
  return { hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: `Warning (not blocked): ${raison}` } };
}

export function sortieStop(raison, quelMode) {
  if (quelMode === 'bloquer') return { decision: 'block', reason: raison };
  return { hookSpecificOutput: { hookEventName: 'Stop', additionalContext: `Warning (not blocked): ${raison}` } };
}

export function emettre(sortie) {
  if (sortie) process.stdout.write(`${JSON.stringify(sortie)}\n`);
  process.exitCode = 0;
}
