# prompts

Prompt engineering with sources, for Claude Code. Part of the [carnet](../../README.md) marketplace
and installed with it.

- **`revoir-un-prompt`**: reviews an existing prompt or instruction file (system prompt, SKILL.md,
  CLAUDE.md or AGENTS.md, subagent brief, tool description) and returns findings that each say what
  changes in the output, the fix, and the source.
- **`ecrire-un-prompt`**: writes a new one from a brief, with the reason and source of each choice
  and two or three test inputs.

## Why the facts are not in the skills

Model behaviour, defaults and parameters change in weeks. A prompting skill that states them as
facts goes stale silently: an audit of one widely installed prompting skill found 20 of 72 checked
claims out of date. So the skills hold the method, and every model-specific rule is re-read on the
vendor's official page before it is asserted. When that page cannot be read, the finding says so.

## The reference base

`references/` holds a reference base in French: checklist, phrasings to remove, instruction layers,
techniques, rules per vendor and model generation, context engineering, structured outputs, evals,
prompt injection, myths. It was written from official documentation and papers **consulted on
2026-11-09**. Each file states its re-read date, and the model-specific files expire first. Every
line carries its source and the model or version it applies to; `references/LISEZMOI.md` explains
the labels and how to verify a line.

Quotations are short (none over 25 words between quotation marks, checked by a script); the rest is
paraphrase with links. Block quotations were not measured by that script.
