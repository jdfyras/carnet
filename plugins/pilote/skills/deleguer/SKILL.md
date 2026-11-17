---
name: deleguer
description: Hands a bounded task to a worker - a subagent of this session (pilote:planner, pilote:implementer, pilote:reviewer) or the Codex CLI - under a written contract, then verifies the evidence itself before reporting anything as done. Use when the user asks to delegate, to have Codex or another agent do or review something, to get a second opinion from another model, or to split work between a planner, an implementer and a reviewer, or says "delegue", "fais-le faire par codex", "passe-le a codex", "fais relire par un autre agent", "deuxieme avis", "sous-agent". Not for sending a task to a person by message or email.
---

# Delegating a bounded task

This skill decides **who** does a task and holds the worker to a contract. The worker's answer is
evidence to check, never a result to repeat. Answer the user in their language.

## 1. Decide whether to delegate at all

Delegate only when all of these hold:

- the task is bounded and you can write its acceptance criteria now;
- it touches a known set of files;
- failure is cheap and visible.

Do not delegate anything that needs repository-wide judgement, touches credentials or secrets, or
whose acceptance criteria you cannot state yet. Do it yourself, or plan it first with
`pilote:planner`.

## 2. Choose the executor: first what each may see, then what each is good at

| Executor | Use for | How |
|---|---|---|
| `pilote:planner` | exploring, producing a bounded plan | Agent tool, read-only |
| `pilote:implementer` | a change that needs repository context | Agent tool, in its own worktree |
| `pilote:reviewer` | a second reading of a frozen diff | Agent tool, read-only |
| Codex | an independent review by another model family, or bounded work | `pilote codex <contract.json>` |

- A subagent of this session may see what this session sees.
- **Codex is a third party.** It may receive a directory only if a person authorised that
  directory for Codex. `pilote codex` refuses everything else before Codex is even started, and
  its refusal gives the command to authorise. Do not run that command yourself: show it to the
  user, who decides. Never infer permission from one executor to another.
- For an independent review, pick a different model family from the coordinator. A second agent
  of the same family agreeing tells you little.
- One worker at a time. A worker never delegates again.

## 3. Write the contract

A JSON file, under a folder the project ignores (add it to `.gitignore`): contracts carry the
composed prompt, the working directory and the worker's full answer. Forward slashes in paths.

```json
{
  "task_id": "T-12", "attempt_id": "a1",
  "mode": "analysis | review | implementation",
  "objective": "one sentence",
  "acceptance_criteria": ["..."],
  "workdir": "<absolute path>",
  "base_commit": "<exact sha>",
  "allowed_files": ["src/**"],
  "forbidden_paths": ["**/.env*", ".git/**"],
  "out_of_scope": ["..."],
  "verification_commands": ["npm test"],
  "model": "<model id the user's Codex accepts>",
  "max_seconds": 300,
  "prompt": "the instruction for this task"
}
```

Check it before running: `pilote contrat <file> --prompt` validates it and prints the exact prompt
the worker will receive. The tool composes a frame from the contract (criteria, read scope,
forbidden paths, out of scope, verification) so these fields reach the worker without being copied
by hand.

For a subagent, put the same content in the Agent tool prompt: objective, criteria, allowed files,
out of scope, verification command, and the report format the agent defines.

## 4. Prepare the workspace

An implementation worker gets its own worktree, cut from an explicit commit, that nobody else
touches while it runs:

```bash
git worktree add -b work/<task_id> ../<repo>-wt-<task_id> <base_commit>
git -C ../<repo>-wt-<task_id> rev-parse HEAD
```

A worktree does not contain uncommitted changes, and it is not a security boundary. The read-only
check measures a time window, not an author: anything that changes in the directory during the run
is attributed to the worker, including your own edits.

## 5. Run it

```bash
pilote codex .work/contract-T-12.json --out .work/result-T-12.json
```

- Codex enforces its sandbox per invocation: `analysis` and `review` run read-only,
  `implementation` runs workspace-write. Only `model_reasoning_effort` may be passed in `config`;
  any key that could change the sandbox is refused.
- Codex has no timeout of its own: `max_seconds` is the only deadline. When you run it from a tool
  that caps commands (often 10 minutes), keep `max_seconds` well under that cap.
- Fallback models are declared (`fallback_models`), never silent, and only used on a capacity
  failure (rate limit, quota, overload), not on a timeout or a refusal.
- At most one retry, only after diagnosing a transient failure. No correction loops.

## 6. Verify the result yourself

Exit code 0 is not proof of delivery. Read, in this order:

1. `status`: `completed`, `partial`, `failed`, `cancelled`, or `violated` (a read-only mode that
   wrote something);
2. `read_only_violation`, `notices`, `error`;
3. `files_touched_by_worker`, then `git -C <workdir> diff`: what actually changed;
4. **run the verification commands yourself**. `commands_run` shows what Codex ran; it is not your
   proof.

Then report: status, how each acceptance criterion is met or not, files actually changed, the
commands you ran and their real output, refusals and limits, remaining risks, and what the user
must decide. Never report a test as passing because a worker said so.

## 7. Before claiming something is absent

A negative claim ("nothing calls it", "it is not there") needs an exhaustive search, not a sample,
and states the scope actually checked: "I listed `src/` and it is not there". On a web source, an
absence holds only if you name two pages you read: the one that lacked the information and the one
that would be obliged to carry it (a home page, release notes). Otherwise bound the claim to your
reading. This applies to a worker's claims too.

## Tools

`pilote` is on the PATH when this plugin is enabled. `pilote aide` lists the commands:
`contrat`, `codex`, `autoriser`, `retirer`, `autorisations`, `journal`. The authorisation registry
and the journal live outside every repository, under `~/.pilote/` (or `PILOTE_HOME`).
