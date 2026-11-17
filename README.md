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

That one command also installs three plugins declared as dependencies and listed in this
marketplace:

- [`arbitrage`](https://github.com/jdfyras/arbitrage-skill): the decision skill `carnet-reprise`
  hands over to when something needs your choice;
- [`pilote`](plugins/pilote/README.md): delegation under contract, to a planner, an implementer and a
  reviewer subagent, or to the Codex CLI behind an authorisation gate;
- [`prompts`](plugins/prompts/README.md): reviewing and writing prompts and agent instructions, with
  model-specific rules re-read at the source.

For a team, commit the plugin in the project's `.claude/settings.json` under `enabledPlugins`;
each teammate then runs the same command once with `--scope project`.

Codex, other agents, and the `carnet` command in a terminal:

```bash
git clone https://github.com/jdfyras/carnet && cd carnet
npm link                          # puts `carnet` on the PATH; Node 20 or later, no dependency
./installer.sh --agents           # skills into ~/.agents/skills
```

Plugin dependencies are a Claude Code mechanism. Outside it, install `arbitrage` from its own
repository with its own `installer.sh`. `pilote` and `prompts` are Claude Code plugins only for
now: `installer.sh` does not copy them, and their skills expect the plugin layout (the `prompts`
skills read `../../references/`, the `deleguer` skill expects `pilote` on the PATH).

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
| Starting a session, "where are we" | `carnet-reprise` | `carnet echeances` first, then the state, the last handover, `carnet sante` |
| A decision to make | `arbitrage` (installed with carnet) | maps the decisions, then one at a time with options |
| Handing work to another agent or to Codex | `pilote:deleguer` | `pilote contrat`, `pilote codex`, `pilote autoriser` |
| Reviewing or writing a prompt, a skill, an AGENTS.md | `prompts:revoir-un-prompt`, `prompts:ecrire-un-prompt` | reads the official page of the target model |
| Ending a session | `carnet-cloture` | `carnet etat <file>`, `carnet noter "<line>"`, `carnet budget` |
| Something was corrected | `carnet-erreur` | `carnet erreur ajouter …`, then acts on the counts |
| Setting up a project | `carnet-init` | `carnet init`, simulation first |

`carnet echeances` reads the commitments section of the state file and sorts its dated lines against
today's date in the project's time zone: today, tomorrow, dated in the past and still open, the
next seven days. It cannot tell a missed deadline from a date a line merely cites, nor whether a
promise was kept; it says so, and the skill verifies at the source before calling anything late.

`carnet aide` lists every command.

### Migrating an old state file

A state file that was appended to for months is mostly dated entries: a journal stored in the wrong
place. `decouper` separates the two and proves nothing was lost.

```bash
carnet decouper OLD-STATE.md --annee 2026                       # simulation: measures, writes nothing
carnet decouper OLD-STATE.md --annee 2026 --etat "Commitments" --sortie ./split
```

It never edits the source. Every input line lands in exactly one output, and the tool compares the
two sets of lines before reporting. Sections named with `--etat` keep their dated bullets: under
"Commitments", a date is a deadline, not history. What it leaves is usually still above the state
budget; trimming undated text is a person's judgement, and the report says by how much.

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
tests/           node --test, including public.test.mjs (nothing personal is published)
plugins/pilote/  delegation plugin   plugins/prompts/  prompt engineering plugin
```

Skill bodies are written once, in neutral terms, and copied as they are for every agent. Nothing
rewrites "Claude" into "Codex": that is how copies end up pointing at folders that do not exist.

## Licence

MIT.
