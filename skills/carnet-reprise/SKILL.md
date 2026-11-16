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
2. **Deadlines**: run `carnet echeances`. It sorts the dated lines of the commitments section
   against today's date in the project's time zone: today, tomorrow, dated in the past and still
   open, the next seven days, and the lines whose date is only a weekday or "tomorrow". Read those
   last ones yourself; do not guess the day. The date comes from the tool, not from what you
   believe today is.
   With no shell, read the commitments section yourself, compare each date with today's date as
   your session gives it, and say which date you used.
3. **Handover**: the most recent file in `.carnet/passations/`, if any. It was written for you.
4. **Health**: run `carnet sante`. It lists budgets exceeded, an overdue review, and error
   families past a threshold.
5. **Open decisions**: `.carnet/decisions/a-trancher.md`.
6. **Tickets**: if `.carnet/carnet.json` names a ticket tool and you have access to it, read the
   tickets the state links to. The state cites them; it does not copy them.

Do not read the journal (`.carnet/journal/`) by default: it is history, kept for when a specific
question needs it.

## 2. Check what the state claims

A state file says what was true when it was written. Before repeating a claim that matters, check
it at its source: a branch with `git status`, a pull request with its real state, a deployment
with what is actually served. Say which claims you checked and which you are only relaying.

This matters most for a deadline. A line dated in the past and still open in the file may be a
promise that was kept without the file being updated, or a date the line only cites. Never tell
the user that something is late, and never ask them about it, unless you read in this same reply
what establishes its state (the message, the pull request, the ticket). Otherwise write "status in
the state file, not verified". Announcing a delay that does not exist costs the user's trust in
every later brief.

## 3. Give the brief

Short, in this shape, deadlines first so that none passes unseen:

- **Deadlines**: today and tomorrow, then what is dated in the past and still open, each with its
  line number in the state file and whether you verified it. If there is none, say so in one line.
- **Where it stands**: two or three sentences.
- **Commitments**: who else is waiting for what, the nearest first.
- **Blocked**: what cannot move and on whom it depends.
- **Alerts**: each line of `carnet sante`, as is. An overdue review or a family past its threshold
  is not noise: it is the notebook asking for attention.
- **Proposed first step**: one, with its reason.

If something needs the user's decision, put it as a question with options, one at a time, the
recommended option first, never as a list of things you are waiting for. Then wait. When the
decision has several parts or real trade-offs, use the `arbitrage` skill, which is installed with
this plugin.
