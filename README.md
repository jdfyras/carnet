# carnet

A project notebook for work with AI agents: what is true now, what was learned, what is still to
decide, kept in the repository, readable by any agent and any teammate.

It exists because of four failures that are easy to measure and that prose rules do not fix:

- **The journal passes itself off as the state.** A state file that is appended to grows without
  limit. The one this tool replaces aimed at 15 KB and reached 1 MB, read first by every session.
- **A copy replaces a version.** Dated copies, hand-synced folders and mechanically rewritten
  duplicates drift apart.
- **The machine's identity is in the code.** Hooks wired by absolute paths and skills that begin
  with `cd /somewhere/of/mine` cannot be handed to a teammate.
- **A rule in prose is treated as a control.** The same family of error came back 34 times after
  its rule was written.

## What you get

```
AGENTS.md              the rules, one canonical file; CLAUDE.md imports it
.carnet/               versioned
  ETAT.md              current state, REWRITTEN at each close, refused above 15 KB
  journal/2026-11.md   append-only, one file per month, dated by the tool
  erreurs/familles.json   the closed list of error families, shared
  regles-apprises.md   the lesson, not the fault
  decisions/           decisions taken, and a-trancher.md for the open ones
  passations/          handovers, under 5 KB each
.carnet.local/         git-ignored: your error entries, health snapshot, bounded copies
```

- **State is loaded for you.** A `SessionStart` hook puts `ETAT.md` and the health alerts in the
  agent's context. Nobody has to remember to read it.
- **Budgets are checked, not hoped for.** `carnet budget` exits non-zero when a file is over; use
  it in a pre-commit hook or in CI.
- **Counts decide.** Error entries are private, one file each, with a family from a closed list.
  Seen twice: propose a rule. Back after its rule: change its *form* (a tool, a required field, a
  check, a hook), not its wording. Three times after: red.
- **Guards warn by default.** A blocking false positive on a teammate's first day is how a guard
  gets uninstalled. Blocking is opt-in. The secrets guard is the exception: it always blocks,
  because a warning after a key is printed protects nothing.

## Install

Claude Code, in one step (2.1.275 or later):

```bash
claude plugin install carnet --marketplace jdfyras/carnet
```

For a team, commit the plugin in the project's `.claude/settings.json` under `enabledPlugins`;
each teammate then runs the same command once with `--scope project`.

Codex, other agents, and the `carnet` command in a terminal:

```bash
git clone https://github.com/jdfyras/carnet && cd carnet
npm link                          # puts `carnet` on the PATH; Node 20 or later, no dependency
./installer.sh --agents           # skills into ~/.agents/skills
```

## Use

In a project, ask the agent to set it up, or run it yourself:

```bash
carnet init                       # simulation: prints the plan, writes nothing
carnet init --agents claude,codex --appliquer
```

On an existing project nothing is overwritten. A file that conflicts gets a sibling
`<name>.propose` holding exactly what is missing; you merge it or not. Running `init` again
changes nothing.

Then, day to day:

| When | Skill | What the tool does underneath |
|---|---|---|
| Starting a session | `carnet-reprise` | reads the state, the last handover, `carnet sante` |
| Ending a session | `carnet-cloture` | `carnet etat <file>`, `carnet noter "<line>"`, `carnet budget` |
| Something was corrected | `carnet-erreur` | `carnet erreur ajouter …`, then acts on the counts |
| Setting up a project | `carnet-init` | `carnet init`, simulation first |

`carnet aide` lists every command.

## What is measured, and what is not

Measured: file sizes against budgets, age of the last review, families past a threshold, open
questions, uncommitted files, and that `init` run twice leaves a byte-identical tree.

Not claimed: an "error rate". Entries are self-declared, so a falling count may be
under-reporting; `carnet sante` says so every time it prints the figure. The guards recognise
vocabulary and shapes: each one lists its known limits at the top of its file.

## Tests

```bash
npm test
```

Node's built-in runner, no dependency. Every guard has refused cases *and* decoys that must pass,
and every check is broken on purpose at least once: a control that has never refused has proved
nothing, and one that refuses everything has proved nothing either.

## Layout

```
bin/carnet.mjs   lib/          the tool
hooks/           hooks.json and the four hook scripts
skills/          carnet-init, carnet-reprise, carnet-cloture, carnet-erreur
gabarits/        what `init` writes
tests/           node --test
```

Skill bodies are written once, in neutral terms, and copied as they are for every agent. Nothing
rewrites "Claude" into "Codex": that is how copies end up pointing at folders that do not exist.

## Licence

MIT.
