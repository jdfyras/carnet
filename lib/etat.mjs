// Current state and journal are two different files with two different rules.
//
// ETAT.md is REWRITTEN at each close and holds only what is true now: heading,
// in progress, blocked, commitments, links to tickets. It is refused above its
// budget. The journal is append-only, one file per month, and nobody has to
// read it to start working. Mixing the two is how a state file reaches 1 MB.

import fs from 'node:fs';
import path from 'node:path';
import { DOSSIER, LOCAL, ErreurCarnet, ecrireAtomique, octets } from './racine.mjs';
import { fuseauEffectif, maintenant } from './heure.mjs';

export const COPIES_GARDEES = 10;
const MARQUE = /^<!-- carnet: updated .*-->\r?\n?/;

export function cheminEtat(racine) {
  return path.join(racine, DOSSIER, 'ETAT.md');
}

/** Keeps the last few previous versions, bounded: a safety net, not an archive. */
function garderCopie(racine, ancien, parties) {
  const dossier = path.join(racine, LOCAL, 'copies');
  fs.mkdirSync(dossier, { recursive: true });
  const nom = `ETAT-${parties.date}-${parties.heure.replace(':', '')}${parties.secondes}.md`;
  fs.writeFileSync(path.join(dossier, nom), ancien);
  const copies = fs.readdirSync(dossier).filter((n) => /^ETAT-.*\.md$/.test(n)).sort();
  for (const vieux of copies.slice(0, Math.max(0, copies.length - COPIES_GARDEES))) {
    fs.unlinkSync(path.join(dossier, vieux));
  }
}

/** Replaces ETAT.md by `texte`. Refuses, without writing, anything above the budget. */
export function ecrireEtat(racine, config, texte, instant = new Date()) {
  const corps = String(texte).replace(MARQUE, '').trimEnd() + '\n';
  if (!corps.trim()) throw new ErreurCarnet('Empty state: nothing written.');
  const parties = maintenant(fuseauEffectif(config), instant);
  const contenu = `<!-- carnet: updated ${parties.date} ${parties.heure} (${parties.fuseau}) -->\n${corps}`;
  const taille = octets(contenu);
  const budget = config.budgets.etat_octets;
  if (taille > budget) {
    throw new ErreurCarnet(
      `State is ${taille} bytes, budget ${budget}. Nothing written. Move history to the journal ` +
        '(`carnet noter`), cite tickets by link instead of copying them, and keep only what is true now.',
    );
  }
  const chemin = cheminEtat(racine);
  if (fs.existsSync(chemin)) garderCopie(racine, fs.readFileSync(chemin), parties);
  ecrireAtomique(chemin, contenu);
  if (fs.readFileSync(chemin, 'utf8') !== contenu) throw new ErreurCarnet('State differs when read back.', 2);
  return { chemin, taille, budget, parties };
}

/** Appends one dated line to this month's journal. The date is set here, never typed. */
export function noter(racine, config, texte, instant = new Date()) {
  const propre = String(texte).trim().replace(/\s*\r?\n\s*/g, ' ');
  if (!propre) throw new ErreurCarnet('Empty note.');
  if (/^-?\s*\d{4}-\d{2}-\d{2}|^-?\s*\d{1,2}\/\d{1,2}/.test(propre)) {
    throw new ErreurCarnet('The note must not start with a date: the tool sets it.');
  }
  const parties = maintenant(fuseauEffectif(config), instant);
  const chemin = path.join(racine, DOSSIER, 'journal', `${parties.mois}.md`);
  fs.mkdirSync(path.dirname(chemin), { recursive: true });
  if (!fs.existsSync(chemin)) fs.writeFileSync(chemin, `# Journal ${parties.mois}\n\n`);
  const ligne = `- ${parties.date} ${parties.heure} — ${propre}\n`;
  fs.appendFileSync(chemin, ligne);
  if (!fs.readFileSync(chemin, 'utf8').endsWith(ligne)) throw new ErreurCarnet('Note missing when read back.', 2);
  return { chemin, ligne: ligne.trimEnd() };
}
