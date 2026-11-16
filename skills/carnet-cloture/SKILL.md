---
name: carnet-cloture
description: Closes a work session in the project notebook - rewrites the bounded state file, adds the journal lines, records commitments, notes errors, checks the size budgets and writes a handover if someone else takes over. Use when the user ends a session or says "close", "wrap up", "handover", "update the notes", "cloture", "on cloture", "fais la cloture", "passation", "mets a jour l'etat". Requires a project initialised with carnet.
---

# Close the session

The next session, yours or a teammate's, starts from what you leave here. Leave what is true now,
not the story of how you got there.

Answer in the user's language.

## 1. Rewrite the state

`.carnet/ETAT.md` is replaced, never appended to. Write the new state to a temporary file with
these sections, then pass it to the tool:

- **Heading**: what the project is trying to reach.
- **In progress**: what is open right now, each with a link to its ticket if there is one.
- **Blocked**: what cannot move, and on whom it depends.
- **Commitments**: every promise made to someone, with who and by when.
- **Next**: the first things the next session should do.

```
carnet etat <temporary file>
```

The tool refuses a state above its size budget, and writes nothing. When that happens, do not
argue with the budget: the state holds history or copied tickets. Move the history to the journal,
replace copied tasks by links, and try again.

Write only what you can stand behind. A status you did not check in this session is written as
"reported, not checked", or left out.

## 2. Add the journal lines

One line per fact worth finding again later: a decision taken, a release, a result measured.

```
carnet noter "<one line, no date>"
```

The tool sets the date and the time. Never type them: a time written from memory is the most
common wrong fact in a notebook.

## 3. Note the errors

If a result, a message or a method was corrected during the session, and it is not noted yet, use
the `carnet-erreur` skill now. An error left for "later" is an error that will not be counted.

## 4. Check

```
carnet budget
carnet sante
```

Fix what you can. Report the rest to the user as it is printed.

## 5. Write a handover only if someone else takes over

If another session or another person continues this work, write
`.carnet/passations/<date>-<subject>.md`, under 5 KB: what was being done, the exact next step,
what must not be redone, and where the proof of each claim is. A handover is deleted once the
work has been resumed; it is not an archive.

## 6. Report, and do not commit unless asked

Tell the user in a few lines what the state now says, what waits for them, and what you could not
verify. Do not commit, push or send anything unless the user asked for it in this session.
