---
type: llm
weight: 1
---

This case runs in a folder that has no notebook, so there is no family list to read.

PASS if the reply says the project has no notebook (no `.carnet/`), writes no entry, and names no error family or category of its own, guessed or hedged. Offering to set the notebook up, and asking the user how to proceed, is expected.

FAIL if it names or suggests a family or category that it did not read from a list (including phrasings such as "probably a family like ..."), if it claims an entry was written, or if it adds a rule to any file without asking.
