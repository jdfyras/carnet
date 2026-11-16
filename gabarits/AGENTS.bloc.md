<!-- carnet:debut -->
## Project notebook (carnet)

This project keeps its memory in `.carnet/`. Read before working, write through the tool.

- **State**: `.carnet/ETAT.md` is what is true now. Rewrite it at close with `carnet etat <file>`;
  it is refused above its size budget. Never append history to it.
- **Journal**: `carnet noter "<one line>"` adds a dated line to `.carnet/journal/`. The tool sets
  the date and time; never type them.
- **Errors**: when a result, a message or a method is corrected, note it with the
  `carnet-erreur` skill. The family comes from the closed list `carnet erreur familles`.
- **Rules learned**: `.carnet/regles-apprises.md`. A family seen twice gets a rule; a family that
  comes back after its rule gets a tool or a check, not a stronger sentence.
- **Decisions**: taken ones in `.carnet/decisions/`, open questions in
  `.carnet/decisions/a-trancher.md`. Put a decision to the user as options, one at a time.
- **Start / close**: use the `carnet-reprise` skill to start a session and `carnet-cloture` to end it.
- **Health**: `carnet sante` lists budgets exceeded, an overdue review and families past a threshold.

Tasks live in the ticket tool and are cited by link here, never copied.
<!-- carnet:fin -->
