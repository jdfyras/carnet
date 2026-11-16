#!/usr/bin/env bash
# An initialised project, written by hand here because the scaffold must not depend on the
# tool under test being on the PATH.
set -e
mkdir -p .carnet/erreurs .carnet/decisions
cat > .carnet/carnet.json <<JSON
{ "version": 1, "initialise_le": "2026-11-01", "fuseau": "UTC", "gardes": "avertir", "tickets": null, "agents": ["claude"] }
JSON
cat > .carnet/erreurs/familles.json <<JSON
{ "version": 1, "familles": [
  { "nom": "preuve-non-rejouee", "description": "A proof declared (tests pass, it works) without re-running the command that shows it.", "variantes": [], "regle_depuis": null, "forme": null },
  { "nom": "affirmation-sans-source", "description": "A figure, a status or a date stated without a source read in the same session.", "variantes": [], "regle_depuis": null, "forme": null },
  { "nom": "commande-destructive", "description": "A command that erased or overwrote work that was not saved.", "variantes": [], "regle_depuis": null, "forme": null }
] }
JSON
printf "# State\n\n## Heading\n\nShip the billing export.\n" > .carnet/ETAT.md
printf ".carnet.local/\n" > .gitignore
