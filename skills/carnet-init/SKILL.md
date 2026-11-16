---
name: carnet-init
description: Sets up the carnet project notebook in the current project - bounded state file, journal, private error journal with a closed list of families, rules learned, open decisions. Use when the user asks to set up, install or initialise project memory, a notebook, carnet, a working method for agents, or says "init carnet", "mets en place le carnet", "installe la memoire du projet", "initialise le projet". Works on an empty folder and on an existing project, where it overwrites nothing.
---

# Initialise the project notebook

The goal is a project where any agent, and any teammate, can pick up the work: what is true now,
what was learned, what is still to decide. You set it up without destroying anything that exists.

Answer in the user's language.

All commands below are the `carnet` tool. If the command is not found, tell the user how to put it
on the PATH (the plugin does it for Claude Code; elsewhere, `npm link` in a clone of the carnet
repository) and stop: do not recreate the files by hand.

## 1. Look, without writing

Run `carnet init` with no option. It is a simulation: it prints what would be created, kept,
appended or in conflict, and writes nothing. Read the plan before going further.

- If it says the folder is not a git repository, say so and ask before running `git init`. The
  notebook is meant to be versioned, and project skills are only offered inside a repository.
- If files already exist, they are listed as "keep" or "CONFLICT". Nothing existing is replaced.

## 2. Ask only what is not already written

Look first: an existing `AGENTS.md` or `CLAUDE.md` often says which agents are used and where
tickets live. Ask the rest as questions with options, one at a time, the recommended option first:

1. **Time zone**, an IANA name. Recommend the machine's zone, shown by `carnet heure`.
2. **Agents** that will work here: `claude`, `codex`, or both.
3. **Ticket tool** URL, or none. Tasks stay there and are cited by link, never copied.
4. **Guards**: `avertir` (recommended: a warning the agent sees, nothing blocked) or `bloquer`.
   The secrets guard always blocks, whatever the answer: a warning after a key is printed
   protects nothing.

## 3. Show the plan again, then write

Run the simulation once more with the chosen options, show it, and only then apply:

```
carnet init --fuseau <zone> --agents <list> --tickets <url> --gardes <mode> --appliquer
```

## 4. Settle the conflicts with the user

A conflict leaves a `<file>.propose` next to the existing file, holding exactly what is missing.
For each one, show the proposal and ask before merging it. Typical cases:

- `AGENTS.md.propose`: the notebook block to add to an existing `AGENTS.md`.
- `CLAUDE.md.propose`: the single line `@AGENTS.md`, so Claude reads the same rules as the others.

Never merge silently, and never delete the `.propose` file yourself unless the user says so.

## 5. Check

- `carnet init --verifier` must print "Nothing missing." once the conflicts are settled.
- `carnet budget` must pass. If an existing `AGENTS.md` is over its budget, say so with the
  figures: it is the user's call to trim it, not yours.
- `carnet sante` shows the starting health.

Close by telling the user, in a few lines: what was created, what was left untouched, what waits
for them, and the two skills to use from now on (`carnet-reprise` to start a session, `carnet-cloture` to end it).
