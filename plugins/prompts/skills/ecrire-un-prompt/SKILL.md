---
name: ecrire-un-prompt
description: Writes a new prompt or agent instruction from a brief - a system prompt, an API prompt, a SKILL.md, a subagent brief, a tool description - for a named target model, applying sourced prompting rules re-read on the vendor's official page, and delivers it with the reasons for each choice and two or three test inputs to check it. Use when the user asks to write, draft, create or generate a prompt, a system prompt, a skill or a brief for an agent, or says "ecris-moi un prompt", "redige un prompt", "fais-moi un system prompt", "cree un skill", "ecris le brief pour l'agent". Not for reviewing or fixing an existing prompt (that is revoir-un-prompt), and not for image generation prompts.
---

# Writing a prompt

The deliverable is a prompt the user can test, not a prompt they must trust. Each choice in it has
a reason, and the reasons that depend on a model are re-read at the source. Answer in the user's
language; write the prompt in the language that suits its reader (often English for a model).

## 1. Get the brief, with as few questions as possible

Look first in the conversation and the files for what is already known. Ask only what changes the
prompt, one question at a time, the recommended answer first:

- **Target model and surface** (API, Claude Code, Codex, another tool). Required: rules differ by
  model and some are reversed between generations.
- **Layer**: a one-off prompt, a memory file read every session, a skill, a subagent brief, a tool
  description (`../../references/00b-reference-rapide.md`, section 4). If the request is really a rule
  with zero exceptions, say it belongs in a hook or a deny rule, not in a prompt.
- **Task and success criteria**: what a good output looks like, and how the user would see a bad
  one. Two or three real example inputs if they exist.

## 2. Re-read what depends on the model

`../../references/` (the plugin's shared base, relative to this skill's directory) was consulted on 2026-11-09 and each file carries a re-read date. Before applying a
model-specific rule (effort or thinking settings, defaults, sampling parameters, phrasing the model
over- or under-reacts to), open the vendor's official prompting page for that model
(`../../references/02-regles-par-fournisseur.md` names it). If you cannot read it in this session, apply
only rules that hold across models and say which model-specific checks remain.

## 3. Write

Apply `../../references/00-checklist.md`, section 1. The points that matter most:

- task, intent and constraints up front, with the reason behind each rule;
- say what to do, not only what to avoid;
- long material at the top, the question at the end;
- one delimiter style; examples that are diverse and wrapped consistently;
- an enumerable output as a schema, an enum or a tool, not as prose;
- nothing in capitals or absolutes for emphasis unless the target model's page asks for it
  (`../../references/00b-reference-rapide.md`, section 2);
- for a skill: name in lowercase with hyphens, a description that says what it does and when to use
  it, body under 500 lines, detail moved to reference files one level deep;
- for a subagent brief: everything it needs, since it inherits neither the conversation nor the
  files already read.

Keep it as short as the task allows. Every line costs attention on every call.

## 4. Deliver

1. The prompt, in one block.
2. A short table: each significant choice, its reason, and its source (official page and the date
   you read it, or the reference file with its 2026-11-09 date, or "judgement").
3. Two or three test inputs, including one that should fail or be refused, and what a correct
   output looks like for each (`../../references/05-evals.md`). The prompt is a hypothesis until these
   have been run.
4. What remains unverified.
