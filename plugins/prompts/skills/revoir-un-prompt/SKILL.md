---
name: revoir-un-prompt
description: Reviews an existing prompt or instruction file - a system prompt, an API prompt, a SKILL.md, a CLAUDE.md or AGENTS.md, a subagent brief, a tool description - and returns sourced findings - what changes the output, what sits in the wrong layer (prompt, memory file, skill, hook, tool description), what is stale for the target model. Model-specific facts are re-read on the vendor's official page before being asserted. Use when the user asks to review, audit, check, critique or improve an existing prompt or agent instruction, or says "relis mon prompt", "revois ce prompt", "audite ce skill", "ce prompt est bon ?", "pourquoi mon prompt marche pas", "ameliore ce CLAUDE.md". Not for writing a new prompt from scratch (that is ecrire-un-prompt), and not for shell prompts or UI copy.
---

# Reviewing a prompt, with sources

The review says what in this text changes the model's output, why, and on what evidence. A
finding without a source is an opinion and is labelled as one. Answer in the user's language.

## 1. Pin down what is being reviewed

Before reading for defects, establish, from the text, the files around it, or one question to the
user:

- **Target model and surface**: which model and version will read this, through what (an API call,
  Claude Code, Codex, another agent tool). A rule true for one model is false for another; the
  reference base shows several reversals between generations.
- **Layer**: is it a one-off prompt, a memory file loaded every session, a skill, a subagent brief,
  a tool description? Each has a different cost and guarantee (`../../references/00b-reference-rapide.md`,
  section 4).
- **What "good" means here**: the output the user expects, and how they would tell it failed.

If the target model is unknown, say that model-specific findings cannot be made, and review only
what holds across models.

## 2. Re-read before asserting anything model-specific

The references in `../../references/` (the plugin's shared base, relative to this skill's directory) were consulted on 2026-11-09 and carry a re-read date in their
header. Model behaviour, defaults and parameters change in weeks. So:

1. For any finding about a specific model (effort or thinking settings, defaults, sampling
   parameters, phrasing that model over- or under-reacts to, output format quirks), open the
   vendor's **official** prompting page for that model, at the version the user targets.
   `../../references/02-regles-par-fournisseur.md` and the key tables at the bottom of
   `../../references/00-checklist.md` say which page.
2. If you cannot read it in this session (no web access, page unreachable), keep the finding but
   mark it **"from the 2026-11-09 reference, not re-read"**, and never present it as current.
3. Never correct a reference line from memory. If the page now says something else, report the
   difference with today's date.

## 3. Read for defects, in this order

Use `../../references/00-checklist.md` (section 1) as the base list, then:

1. **Missing intent**: no task, no reason, no success criteria up front. Models generalise from
   the reason behind a rule; a bare rule is followed narrowly.
2. **Phrasings known to misfire**: `../../references/00b-reference-rapide.md` section 2 lists wordings to
   remove, each with the models it applies to. Check the scope before flagging.
3. **Wrong layer**: a rule with zero exceptions written as prose belongs in a hook or a deny rule;
   a procedure inside a memory file belongs in a skill; a fact a subagent needs must be in its
   brief, because it does not inherit the conversation.
4. **Structure**: long documents placement, one delimiter style, examples (how many, how diverse),
   enumerable outputs that should be a schema or an enum rather than prose.
5. **Claims in the prompt itself**: a prompt that asserts how a model behaves ("you always do X")
   may be repeating a myth; `../../references/07-mythes.md` gives verdicts.
6. **Security**: untrusted content mixed with instructions, tool output treated as orders
   (`../../references/06-securite.md`).

Do not flag a preference as a defect. If the prompt is sound, say so; finding nothing is a valid
review.

## 4. Report

One table, most consequential first:

| # | Where (line or quote, under 15 words) | What changes in the output | Fix | Source | Status |
|---|---|---|---|---|---|

- **Source**: the official page with the date you read it, or the reference file and section with
  its 2026-11-09 date, or "judgement" when there is none.
- **Status**: `verified today`, `reference, not re-read`, or `judgement`.

Then, only if the user wants it, the revised text, with each change traceable to a row. Close with
what cannot be known without testing, and the smallest test that would settle it: two or three
inputs run against the old and the new version (`../../references/05-evals.md`). A review predicts; only
a run measures.
