---
name: carnet-reprise
description: Starts a work session from the project notebook - reads the current state, the last handover and the health alerts, then says where things stand and what to do first. Use at the start of a session, after a break or a context reset, or when the user asks "where are we", "what's next", "resume", "ou on en est", "on en est ou", "on reprend", "quoi next", "fais le point". Requires a project initialised with carnet.
---

# Resume from the notebook

Starting from memory of an earlier conversation is how stale facts get repeated. Start from what
the project wrote down, say where it stands, and only then work.

Answer in the user's language. Do not start the work itself until the user has seen the brief.

## 1. Read, in this order

1. **State**: `.carnet/ETAT.md`. In Claude Code the notebook plugin already placed it in your
   context at session start; if you do not see it there, read the file. If it was cut ("read the
   file for the rest"), read the file.
2. **Handover**: the most recent file in `.carnet/passations/`, if any. It was written for you.
3. **Health**: run `carnet sante`. It lists budgets exceeded, an overdue review, and error
   families past a threshold.
4. **Open decisions**: `.carnet/decisions/a-trancher.md`.
5. **Tickets**: if `.carnet/carnet.json` names a ticket tool and you have access to it, read the
   tickets the state links to. The state cites them; it does not copy them.

Do not read the journal (`.carnet/journal/`) by default: it is history, kept for when a specific
question needs it.

## 2. Check what the state claims

A state file says what was true when it was written. Before repeating a claim that matters, check
it at its source: a branch with `git status`, a pull request with its real state, a deployment
with what is actually served. Say which claims you checked and which you are only relaying.

## 3. Give the brief

Short, in this shape:

- **Where it stands**: two or three sentences.
- **Commitments and deadlines**: who is waiting for what, by when, the nearest first.
- **Blocked**: what cannot move and on whom it depends.
- **Alerts**: each line of `carnet sante`, as is. An overdue review or a family past its threshold
  is not noise: it is the notebook asking for attention.
- **Proposed first step**: one, with its reason.

If something needs the user's decision, put it as a question with options, one at a time, the
recommended option first. Then wait.
