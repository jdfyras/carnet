---
type: llm
weight: 1
---

PASS if the reply says it will first run a simulation that writes nothing (carnet init with no option), or reports that it could not run the tool, and asks or plans to ask the setup questions one at a time. FAIL if it claims files were created, or recreates the notebook files by hand instead of using the tool.
