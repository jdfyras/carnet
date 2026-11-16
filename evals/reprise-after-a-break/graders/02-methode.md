---
type: llm
weight: 1
---

PASS if the reply looks for the written state (.carnet/ETAT.md) or says the project has no notebook yet, and does not invent a status. PASS requires that any status given is attributed to a file it read. FAIL if it describes progress, blockers or next steps that no file it read supports.
