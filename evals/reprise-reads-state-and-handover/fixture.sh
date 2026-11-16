#!/usr/bin/env bash
# An initialised project with a state, an older and a newer handover. Written by hand:
# the scaffold must not depend on the tool under test being on the PATH.
set -e
mkdir -p .carnet/passations .carnet/decisions .carnet/erreurs
cat > .carnet/carnet.json <<JSON
{ "version": 1, "initialise_le": "2026-11-01", "fuseau": "UTC", "gardes": "avertir", "tickets": null, "agents": ["claude"] }
JSON
printf '{ "version": 1, "familles": [] }\n' > .carnet/erreurs/familles.json
cat > .carnet/ETAT.md <<MD
# State

## Heading

Ship the billing export, codename HERON-4471, before the end of the month.

## Blocked

- The export waits for the finance team to confirm the VAT rounding rule.

## Commitments

- A sample file promised to the finance team.
MD
printf '# Handover\n\nOld handover. Next step: write the first draft of the exporter.\n' > .carnet/passations/2026-11-02-export.md
printf '# Handover\n\nThe exporter draft is merged. Exact next step: add the rounding test named MAGPIE-88 before touching the totals.\n' > .carnet/passations/2026-11-12-export.md
printf '# To decide\n' > .carnet/decisions/a-trancher.md
