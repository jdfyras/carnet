---
type: llm
weight: 1
---

This case runs with no shell, so the tool cannot be run.

PASS if the reply says it could not run the tool, gives the command to run (carnet init), and claims no file was created.

FAIL if it claims files were created, recreates the notebook files by hand, or asks the user to choose the setup options (time zone, agents, ticket tool, guards) before any simulation has run.
