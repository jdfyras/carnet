# Changelog

Dates are YYYY-MM-DD. This file follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
loosely and [semantic versioning](https://semver.org/).

## [0.3.1] - 2026-11-17

### Security

- pilote 0.1.1: `git` and `codex` are started from Node's own directory, with `-C` for the
  working directory, never from the repository under review: on Windows a bare program name is
  also looked up in the current directory, so a planted `git.exe` could have run instead of git.
- pilote 0.1.1: Codex's final message goes through a private temporary directory removed after
  the run, instead of a predictable name in the shared temporary folder.

Both found by an automated security review after the push of 0.3.0; each fix has a test that fails
when the flaw is put back.

## [0.3.0] - 2026-11-17

### Added

- Two plugins in this marketplace, under `plugins/`, installed with carnet as dependencies:
  - `pilote` 0.1.0: skill `deleguer`, agents `planner`, `implementer`, `reviewer`, and the `pilote`
    tool (contract validation, `codex exec` adapter with per-mode sandbox, deadline, declared
    fallbacks, read-only tripwire, append-only journal, and an authorisation gate that refuses any
    directory not authorised for Codex before Codex starts). 28 tests, each guard broken on purpose.
  - `prompts` 0.1.0: skills `revoir-un-prompt` and `ecrire-un-prompt`, and a dated reference base
    in French. Model-specific rules are re-read on the vendor's official page before being asserted.
- `tests/public.test.mjs`: no machine path, member id, key, token or e-mail in a published file, no
  quotation over 25 words in the reference base, and no term of a private deny list kept outside the
  repository.

## [0.2.1] - 2026-11-16

### Fixed

- The stop guard flagged "still open" as a claim about a pull request whatever it was about. A
  brief saying a commitment was "still open" was flagged in every run of an eval, and the user's
  last message became a discussion of the guard instead of the brief. It now needs a pull request
  named in the same sentence.
- `carnet-reprise`: with no shell, it reads the commitments section itself and says which date it
  compared against.

### Added

- `evals/lancer.sh` runs the suite on a copy of the plugin without its `dependencies` line. With
  the line, `claude plugin eval` never called a carnet skill (0 of 9 runs; 3 of 3 without it, same
  case). The cause is not established.
- Eval case `reprise-deadlines-first`: 3 of 3 with the plugin, 1 of 3 without (2026-11-16, n=3).

## [0.2.0] - 2026-11-16

### Added

- `arbitrage` is installed with carnet: declared in `dependencies` and listed in this marketplace
  from its own repository. No copy of the skill lives here.
- `carnet echeances`: deadlines read in the commitments section of the state file (today,
  tomorrow, dated in the past and still open, next seven days, relative dates listed apart).
- `carnet decouper`: splits an oversized, appended-to state file into a remainder and monthly
  journal files. Simulation by default, never edits the source, refuses to overwrite, and checks
  that the outputs hold exactly the input lines. `--etat` names sections whose dated bullets are
  state (deadlines), `--garder` keeps the most recent entries of each section.
- Eval cases for the four skills, including prepared projects (`fixture.sh`).

### Changed

- `carnet-reprise`: deadlines come first in the brief, from `carnet echeances`; nothing is called
  late without its source read in the same reply; a decision with several parts goes to `arbitrage`.
- `carnet-init`: with no shell, it gives the command and stops; the setup questions come after
  the simulation.
- `carnet-erreur`: in a project with no notebook, it writes no entry and guesses no family.
- The default `AGENTS.md` block no longer says the state file is "what is true now": it holds the
  heading, what is blocked and the commitments, with links to tickets.

## [0.1.0] - 2026-11-16

First version.

### Added

- `carnet` command, Node only, no dependency: `init` (simulation by default, nothing existing
  overwritten, idempotent), `heure`, `etat` (rewrites the state, refused above its budget),
  `noter` (journal, dated by the tool, one file per month), `budget`, `erreur` (closed list of
  families, one private file per entry, thresholds), `sante`, `revue`.
- Skills `carnet-init`, `carnet-reprise`, `carnet-cloture`, `carnet-erreur`: one neutral text for
  every agent, copied as is.
- Hooks: `SessionStart` puts the state and the health alerts in the context; guards for secrets
  (always blocks), estimated times in published text, and "stopped" or "not merged" claims made
  without reading. Guards warn by default; blocking is an option.
- `installer.sh` for agents that read plain skill folders: explicit targets, backup outside the
  scanned folder, links left alone.
- Tests with Node's runner: every guard has refused cases and decoys that must pass.
