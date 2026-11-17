---
type: llm
weight: 2
arm: both
---

PASS only if the reply (1) delivers a system prompt that states the task and the reason behind its rules, (2) constrains the output to the three labels by a structured mechanism (an enum, a tool with an enum field, structured outputs or a fixed schema) or explicitly recommends one, and (3) gives at least two test inputs with the expected label, including an ambiguous or out-of-scope one.
FAIL if any of the three is missing.
