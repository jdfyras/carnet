# Changelog

Dates are YYYY-MM-DD. This file follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
loosely and [semantic versioning](https://semver.org/).

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
