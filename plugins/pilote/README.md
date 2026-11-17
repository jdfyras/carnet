# pilote

Delegation under contract, for Claude Code. Part of the [carnet](../../README.md) marketplace and
installed with it.

- **Subagents**: `pilote:planner` (read-only plan), `pilote:implementer` (one bounded change, no
  further delegation), `pilote:reviewer` (read-only review of a frozen diff).
- **Codex**: `pilote codex <contract.json>` runs `codex exec` with the sandbox set per mode
  (read-only for `analysis` and `review`), a deadline, declared fallbacks, and a result that says
  what the worker actually changed on disk.
- **Skill** `deleguer`: when to delegate, to whom, how to write the contract, and how to verify the
  result yourself.

## The authorisation gate

Codex is a third party: whatever directory it runs in is sent to its provider. `pilote codex`
refuses any directory a person has not authorised for Codex, before Codex starts:

```bash
pilote autoriser codex "/path/to/repo" --par "your name" --motif "why this repo may go to Codex"
pilote autorisations
pilote retirer codex "/path/to/repo"
```

The registry and the delegation journal live outside every repository, in `~/.pilote/` (or
`PILOTE_HOME`), because they name private directories.

## What is checked, and what is not

- Every refusal happens before anything is spawned: invalid contract, a `config` key that could
  change the sandbox, an unauthorised directory.
- A read-only run that wrote a file is reported `violated`, and exits non-zero. The check measures
  a time window, not an author: run workers in a worktree nobody else touches.
- Exit code 0 means `completed` or `partial`. Nothing else, an unknown status included.
- Not covered:
  - **What Codex may read.** The gate decides which directory is sent with `-C`. Whether Codex's
    read-only sandbox also stops reads *outside* that directory is not established here: the
    worker prompt asks it not to, which is a request, not a guarantee. Treat an authorised run as
    able to read whatever your user account can.
  - **Who authorises.** `pilote autoriser` is a command; any agent with a shell can run it. The
    skill tells the agent to show the command to the user instead, but nothing enforces that. A
    permission rule that asks before `pilote autoriser` would.
  - A deep write inside an existing ignored directory (for example inside `node_modules/`) is not
    seen.
  - Codex exposes no model list, so a bad model id only fails at run time.
  - `implementation` mode (workspace-write) is covered by tests against a fake `codex` only; it has
    not been run against the real CLI.

Tested with a fake `codex` (`tests/faux-codex.mjs`), on Windows and Linux. Codex flags checked
against `codex exec --help` of codex-cli 0.167.1.
