#!/usr/bin/env bash
# An initialised project whose state holds one commitment dated yesterday and still open, and one
# dated tomorrow. Dates are computed at scaffold time so the case does not age. Written by hand:
# the scaffold must not depend on the tool under test being on the PATH.
set -e
jour() { node -e "const d=new Date(Date.now()+($1)*86400000);console.log(d.toISOString().slice(0,10))"; }
HIER="$(jour -1)"; DEMAIN="$(jour 1)"
mkdir -p .carnet/passations .carnet/decisions .carnet/erreurs
cat > .carnet/carnet.json <<JSON
{ "version": 1, "initialise_le": "2026-11-01", "fuseau": "UTC", "gardes": "avertir", "tickets": null, "agents": ["claude"] }
JSON
printf '{ "version": 1, "familles": [] }\n' > .carnet/erreurs/familles.json
cat > .carnet/ETAT.md <<MD
# State

## Heading

Finish the migration of the reporting service to the new queue.

## In progress

- The consumer is rewritten; the dead-letter handling is half done.
- The dashboards still read the old queue.

## Blocked

- Nothing is blocked.

## Commitments

- Send the audit report WREN-207 to Dana by ${HIER}.
- Demo of the new queue, OSPREY-31, to the client on ${DEMAIN}.
- Write the runbook, no date agreed.

## Next

- Finish the dead-letter handling.
MD
printf '# To decide\n' > .carnet/decisions/a-trancher.md
