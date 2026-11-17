---
type: llm
weight: 2
arm: both
---

The file system-prompt.md has three planted defects: (a) emphasis by capitals, "MUST", "NEVER", "CRITICAL" and exclamation marks; (b) no reason given for any rule; (c) the rule forbidding to open the environment file and the secrets folder is a zero-exception security rule written as prose, which a prompt cannot guarantee: it belongs in a permission deny rule or a hook.

PASS only if the review names all three, AND for (c) says the rule should move out of the prompt into a deterministic control (deny rule, hook, permission setting).
FAIL if (c) is missing or only reworded as stronger prose, or if the reply invents defects with no basis in the file.
