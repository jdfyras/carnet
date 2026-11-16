---
name: carnet-erreur
description: Records one of our own errors in the project's private error journal, with a family taken from a closed list, then reads the counts and proposes what they call for - a rule when a family is seen twice, a tool or a check when it comes back after its rule. Use as soon as the user corrects a result, a message or a method, when a claim is withdrawn ("I was wrong", "that was false"), when a proof or a test turns out to be wrong, when someone finds a defect we should have seen, or when the user says "note the error", "log this mistake", "note l'erreur", "note ca", "au journal", "c'est une erreur a noter". Requires a project initialised with carnet.
---

# Note an error

An error noted with a free label cannot be counted, and an error that is not counted never becomes
a rule. This skill keeps the label inside a closed list and lets the counts decide what happens.

Answer in the user's language. The entry is private: it stays in `.carnet.local/`, which git
ignores. What is shared with the team is the lesson, not the fault.

## 1. Establish the facts at their source

Reread what shows the error (the message, the output, the file, the diff) before writing. For the
cause, say only what a reading establishes, and cite it. If you have not read what proves it,
write "cause not established". A guessed cause produces a rule that fixes nothing.

Do not copy anyone's words into the entry, and name no colleague or client: describe the fact.

## 2. Pick the family from the closed list

```
carnet erreur familles
```

Use one canonical name, exactly as listed. One family per entry.

If none fits, do not invent a label and do not write "other". Ask the user, as a question with
options: the two or three closest families, and a new name you propose. A new family is added
only on their decision:

```
carnet erreur famille <name> "<one-line description>"
```

## 3. Write the entry

Put the body in a temporary Markdown file with these parts, then add it:

- **Facts**: what happened, dated, with the source of each fact.
- **Effect**: what it cost, and to whom.
- **Cause**: read, or "not established".
- **Fix**: what was corrected, and how it was checked.
- **Proposed rule**: one sentence that can be verified.
- **Check**: how we will know next time that the rule held.

```
carnet erreur ajouter --famille <name> --titre "<one-line summary>" --corps <temporary file>
```

Add `--recidive` only when the family already had a rule and came back anyway. The tool sets the
date. It prints the counts right after.

## 4. Do what the counts call for

Read the line of the entry's family in the printed counts.

- **PROPOSE-A-RULE** (seen twice, no rule yet): put the rule to the user as a question with
  options, the recommended one first. Typical options: adopt the rule as worded, keep it in the
  journal until the next review, give it a tool or a check right away. Never write the rule
  yourself before their answer. On their yes, add it to `.carnet/regles-apprises.md` and record it:

  ```
  carnet erreur regle <name>
  ```

- **CHANGE-THE-FORM** (came back after its rule): do not rewrite the sentence more firmly. A rule
  that was read and broken will be read and broken again. Propose a change of form, as options:
  a tool that produces the value instead of a person typing it, a required field in a template, a
  check at commit time, a hook. On the user's choice, build it, test it by breaking what it guards,
  and record it:

  ```
  carnet erreur regle <name> --forme "<what now enforces it>"
  ```

- **RED** (came back three times after its rule): say plainly that the current form does not work,
  and that this family needs the user's attention before more of the same work is done.

## 5. Report in three lines

The entry added, the family and its count, and the question you asked if there is one.
