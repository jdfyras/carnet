// Project root discovery and configuration. Node only, no dependency.
//
// The root is the nearest ancestor holding `.carnet/carnet.json`. Nothing here
// relies on where this file is installed: a plugin cache, a personal skills
// folder and a cloned repository must all behave the same.

import fs from 'node:fs';
import path from 'node:path';

export const DOSSIER = '.carnet';
export const LOCAL = '.carnet.local';
export const FICHIER_CONFIG = 'carnet.json';

export const CODE_USAGE = 1;
export const CODE_ENVIRONNEMENT = 2;

export class ErreurCarnet extends Error {
  constructor(message, codeSortie = CODE_USAGE) {
    super(message);
    this.name = 'ErreurCarnet';
    this.codeSortie = codeSortie;
  }
}

export const DEFAUTS = Object.freeze({
  version: 1,
  fuseau: null, // null: the machine's time zone
  gardes: 'avertir', // 'avertir' | 'bloquer'
  tickets: null, // URL of the ticket tool, cited by link, never copied
  revue_jours: 7,
  budgets: Object.freeze({
    etat_octets: 15000,
    agents_octets: 12000,
    agents_lignes: 200,
    claude_lignes: 200,
    passation_octets: 5000,
    questions_ouvertes: 15,
  }),
});

/** Nearest ancestor of `depart` that holds `.carnet/carnet.json`, or null. */
export function trouverRacine(depart = process.cwd()) {
  let courant = path.resolve(depart);
  for (;;) {
    if (fs.existsSync(path.join(courant, DOSSIER, FICHIER_CONFIG))) return courant;
    const parent = path.dirname(courant);
    if (parent === courant) return null;
    courant = parent;
  }
}

export function exigerRacine(depart = process.cwd()) {
  const racine = trouverRacine(depart);
  if (!racine) {
    throw new ErreurCarnet(
      `No ${DOSSIER}/${FICHIER_CONFIG} found from ${path.resolve(depart)} upward. Run \`carnet init\` in the project first.`,
      CODE_ENVIRONNEMENT,
    );
  }
  return racine;
}

/** Configuration merged over the defaults. A malformed file is an error, never a silent default. */
export function lireConfig(racine) {
  const chemin = path.join(racine, DOSSIER, FICHIER_CONFIG);
  let brut;
  try {
    brut = JSON.parse(fs.readFileSync(chemin, 'utf8'));
  } catch (e) {
    throw new ErreurCarnet(`${chemin} is unreadable: ${e.message}`, CODE_ENVIRONNEMENT);
  }
  if (!['avertir', 'bloquer'].includes(brut.gardes ?? DEFAUTS.gardes)) {
    throw new ErreurCarnet(`${chemin}: "gardes" must be "avertir" or "bloquer".`);
  }
  return { ...DEFAUTS, ...brut, budgets: { ...DEFAUTS.budgets, ...(brut.budgets ?? {}) } };
}

/** Atomic write: a reader never sees a half-written file. */
export function ecrireAtomique(chemin, contenu) {
  fs.mkdirSync(path.dirname(chemin), { recursive: true });
  const provisoire = `${chemin}.${process.pid}.tmp`;
  fs.writeFileSync(provisoire, contenu);
  fs.renameSync(provisoire, chemin);
}

export const octets = (texte) => Buffer.byteLength(texte, 'utf8');
