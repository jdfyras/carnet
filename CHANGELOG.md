# Changelog

Dates are YYYY-MM-DD. This file follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
loosely and [semantic versioning](https://semver.org/).

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
