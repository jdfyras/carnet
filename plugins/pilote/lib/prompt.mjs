// The prompt actually sent to a worker: a deterministic frame composed from the contract, then the
// hand-written instruction.
//
// Why a composed frame: in the pilot repository, contracts declared guard-rails the adapter never
// sent. Measured on 55 archived contracts, by looking for each field's literal value in the prompt:
// forbidden_paths filled 35 times, sent 0 times; out_of_scope 34 and 0; verification commands 29
// and 4. Everything had to be copied by hand into the prompt, and was not.

/**
 * Default cap on read commands before a read-only worker must start writing its answer. 12 is the
 * value carried by the 25 review contracts that completed; the only one without it produced nothing,
 * cancelled after 480 seconds and 27 commands.
 */
export const DEFAULT_READ_CAP = 12;

/** What each executor may do with a shell. The two clauses say opposite things, on purpose. */
export const SHELL_CLAUSE = {
  claude:
    'In a read-only mode you only have Read, Glob and Grep: no execution, no write. In implementation '
    + 'mode you also have editing and the shell; use them to run the verification command of the '
    + 'contract and report its real output. Never commit and never push: integration is the '
    + "coordinator's work, not yours.",
  codex:
    'You may run read commands, and they are recorded in the result as evidence. Use them to check '
    + 'what you claim instead of assuming it. If the contract gives a verification command, run it and '
    + 'report its real output. Never claim a test passes without having run it and seen it pass.',
};

const list = (v) => (Array.isArray(v) ? v.filter(Boolean) : v ? [v] : []);

export function buildPreamble(contract = {}, executor = null) {
  const c = contract;
  const block = [];

  const criteria = list(c.acceptance_criteria);
  if (criteria.length) {
    block.push(`Acceptance criteria - what your work will be judged on:\n${criteria.map((x, i) => `  ${i + 1}. ${x}`).join('\n')}`);
  }

  // The read SCOPE always applies: its absence is what once let a review worker read the user's
  // personal memory. The read CAP only applies to read-only modes; an implementer must explore
  // as much as editing correctly needs. `max_read_commands` forces the value either way.
  const asked = Number(c.max_read_commands);
  const cap = Number.isFinite(asked) && asked > 0 ? asked : (c.mode === 'implementation' ? null : DEFAULT_READ_CAP);
  block.push('Read scope: read no file outside the working directory. In particular no personal memory '
    + '(~/.codex, ~/.claude*, ~/.gemini), no other repository, no configuration file of the machine.'
    + (cap === null ? '' : `\nAt most ${cap} read commands before you start writing your answer.`));

  if (SHELL_CLAUSE[executor]) block.push(SHELL_CLAUSE[executor]);

  // An empty array is a statement, not an absence: "nothing may be modified".
  const allowed = list(c.allowed_files);
  if (allowed.length) block.push(`Files you may modify: ${allowed.join(', ')}. No other.`);
  else if (Array.isArray(c.allowed_files)) block.push('You must not modify any file. Return your work as text.');

  const forbidden = list(c.forbidden_paths);
  if (forbidden.length) block.push(`Forbidden paths, even for reading: ${forbidden.join(', ')}`);

  const out = list(c.out_of_scope);
  if (out.length) block.push(`Out of scope - do not do it, even if it looks useful:\n${out.map((x) => `  - ${x}`).join('\n')}`);

  const verify = list(c.verification_commands);
  if (verify.length) {
    block.push(`Verification: the coordinator will run ${verify.join(', ')} itself. `
      + 'Never claim a test passes without having run it and seen it pass.');
  }

  return `=== TASK FRAME (composed from the contract) ===\n\n${block.join('\n\n')}\n\n=== TASK ===\n`;
}

export function buildPrompt(contract = {}, executor = null) {
  return `${buildPreamble(contract, executor)}${contract.prompt ?? contract.objective ?? ''}`;
}
