#!/usr/bin/env node
// SessionStart: the state arrives in the context without anyone remembering to read it.
//
// Prints .carnet/ETAT.md and the health alerts. Outside a carnet project it
// prints nothing. The injected context is capped at 10,000 characters by
// Claude Code, so a long state is cut here on purpose, with a pointer to the
// file, instead of being cut silently there.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOSSIER, lireConfig, trouverRacine } from '../lib/racine.mjs';
import { sante } from '../lib/sante.mjs';
import { lireEntree } from './commun.mjs';

export const PLAFOND = 9000;

export function contexte(racine, instant = new Date()) {
  const config = lireConfig(racine);
  const morceaux = [];
  let etat = null;
  try { etat = fs.readFileSync(path.join(racine, DOSSIER, 'ETAT.md'), 'utf8'); } catch { /* no state yet */ }
  let alertes = [];
  try { alertes = sante(racine, config, instant).alertes; } catch (e) { alertes = [`Health check failed: ${e.message}`]; }

  if (alertes.length) morceaux.push(`[carnet] ${alertes.length} alert(s):\n${alertes.map((a) => `- ${a}`).join('\n')}`);
  if (etat === null) {
    morceaux.push(`[carnet] No ${DOSSIER}/ETAT.md yet. Write one at close with \`carnet etat <file>\`.`);
  } else {
    const reste = Math.max(500, PLAFOND - morceaux.join('\n\n').length - 200);
    const coupe = etat.length > reste;
    morceaux.push(
      `[carnet] Project state (${DOSSIER}/ETAT.md)${coupe ? `, first ${reste} characters of ${etat.length}: read the file for the rest` : ''}:\n\n` +
        (coupe ? etat.slice(0, reste) : etat).trimEnd(),
    );
  }
  return morceaux.join('\n\n');
}

if (process.argv[1] && path.resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase()) {
  try {
    const entree = lireEntree() ?? {};
    const racine = trouverRacine(entree.cwd || process.cwd());
    if (racine) process.stdout.write(`${contexte(racine)}\n`);
  } catch { /* never break a session start */ }
  process.exitCode = 0;
}
