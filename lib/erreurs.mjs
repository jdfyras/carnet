// Error journal: one file per entry, a closed list of families, counts that decide.
//
// Entries are private (`.carnet.local/erreurs/`, git-ignored): nobody keeps an
// honest journal that the team reads. What is shared is the lesson: the family
// list and the rules learned (`.carnet/erreurs/familles.json`,
// `.carnet/regles-apprises.md`).
//
// A family is picked from the closed list, never typed freely: free labels
// split the counts ("proof not replayed" vs "preuve-non-rejouee") and the rule
// "seen twice, it becomes a rule" stops firing.
//
// Thresholds, computed here and not remembered by a person:
//   2 occurrences, no rule yet        -> propose a rule
//   1 occurrence after the rule       -> change the FORM (tool, check, hook), not the sentence
//   3 occurrences after the rule      -> red

import fs from 'node:fs';
import path from 'node:path';
import { DOSSIER, LOCAL, ErreurCarnet, ecrireAtomique } from './racine.mjs';
import { fuseauEffectif, maintenant } from './heure.mjs';

export const SEUIL_REGLE = 2;
export const SEUIL_FORME = 1;
export const SEUIL_ROUGE = 3;

const cheminFamilles = (racine) => path.join(racine, DOSSIER, 'erreurs', 'familles.json');
const dossierEntrees = (racine) => path.join(racine, LOCAL, 'erreurs');

/** Comparison form: lowercase, no accents, spaces/underscores/apostrophes to one hyphen. */
export function normaliserNom(texte) {
  return String(texte)
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[\s_'’-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function lireFamilles(racine) {
  const chemin = cheminFamilles(racine);
  let donnees;
  try {
    donnees = JSON.parse(fs.readFileSync(chemin, 'utf8'));
  } catch (e) {
    throw new ErreurCarnet(`${chemin} is unreadable: ${e.message}`, 2);
  }
  if (!Array.isArray(donnees.familles)) throw new ErreurCarnet(`${chemin}: "familles" must be a list.`, 2);
  return donnees;
}

/** Normalised name or variant -> canonical name. Strict equality, never a substring. */
export function construireIndex(familles) {
  const index = new Map();
  for (const f of familles) {
    for (const nom of [f.nom, ...(f.variantes ?? [])]) {
      const cle = normaliserNom(nom);
      const deja = index.get(cle);
      if (deja && deja !== f.nom) throw new ErreurCarnet(`Duplicate variant "${nom}" for ${deja} and ${f.nom}.`, 2);
      index.set(cle, f.nom);
    }
  }
  return index;
}

function resoudre(index, libelle, familles) {
  const nom = index.get(normaliserNom(libelle));
  if (!nom) {
    throw new ErreurCarnet(
      `Unknown family "${libelle}". The list is closed: ${familles.map((f) => f.nom).join(', ')}. ` +
        'If none fits, ask the user, then add it with `carnet erreur famille <name> "<description>"`.',
    );
  }
  return nom;
}

const slug = (texte) => normaliserNom(texte).slice(0, 48) || 'entree';

/** Writes one entry file. `corps` is free Markdown (facts, effect, cause, fix, check). */
export function ajouter(racine, config, { famille, titre, corps = '', recidive = false }, instant = new Date()) {
  if (!titre || !String(titre).trim()) throw new ErreurCarnet('A title is required (--titre).');
  const { familles } = lireFamilles(racine);
  const nom = resoudre(construireIndex(familles), famille ?? '', familles);
  const p = maintenant(fuseauEffectif(config), instant);
  const id = `${p.date}-${p.heure.replace(':', '')}${p.secondes}-${slug(titre)}`;
  const chemin = path.join(dossierEntrees(racine), `${id}.md`);
  if (fs.existsSync(chemin)) throw new ErreurCarnet(`Entry ${id} already exists.`, 2);
  const contenu =
    `---\nid: ${id}\ndate: ${p.date}\nfamille: ${nom}\nrecidive: ${recidive ? 'true' : 'false'}\n---\n\n` +
    `# ${String(titre).trim()}\n\n${String(corps).trim()}\n`;
  ecrireAtomique(chemin, contenu);
  return { id, chemin, famille: nom };
}

function lireEntete(texte) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(texte);
  if (!m) return null;
  const champs = {};
  for (const ligne of m[1].split(/\r?\n/)) {
    const c = /^([a-z_]+):\s*(.*)$/.exec(ligne);
    if (c) champs[c[1]] = c[2].trim();
  }
  return champs;
}

export function lireEntrees(racine) {
  const dossier = dossierEntrees(racine);
  if (!fs.existsSync(dossier)) return [];
  return fs.readdirSync(dossier).filter((n) => n.endsWith('.md')).sort().map((nom) => {
    const champs = lireEntete(fs.readFileSync(path.join(dossier, nom), 'utf8'));
    return { fichier: nom, ...(champs ?? {}), illisible: !champs };
  });
}

/**
 * Per family: occurrences, occurrences dated after its rule, and the action the
 * thresholds call for. An entry with an unknown family is an error, not a
 * silent zero: a count that skips entries is worse than no count.
 */
export function compter(racine) {
  const { familles } = lireFamilles(racine);
  const index = construireIndex(familles);
  const entrees = lireEntrees(racine);
  const inconnues = [];
  const parFamille = new Map(familles.map((f) => [f.nom, { nom: f.nom, occurrences: 0, apres_regle: 0, marquees: 0, regle_depuis: f.regle_depuis ?? null, forme: f.forme ?? null }]));
  for (const e of entrees) {
    const nom = e.illisible ? null : index.get(normaliserNom(e.famille ?? ''));
    if (!nom) { inconnues.push(e.fichier); continue; }
    const c = parFamille.get(nom);
    c.occurrences += 1;
    if (e.recidive === 'true') c.marquees += 1;
    if (c.regle_depuis && e.date > c.regle_depuis) c.apres_regle += 1;
  }
  const lignes = [...parFamille.values()].filter((c) => c.occurrences > 0).map((c) => {
    let action = null;
    if (c.apres_regle >= SEUIL_ROUGE) action = 'red';
    else if (c.apres_regle >= SEUIL_FORME) action = 'change-the-form';
    else if (!c.regle_depuis && c.occurrences >= SEUIL_REGLE) action = 'propose-a-rule';
    return { ...c, action };
  }).sort((a, b) => b.occurrences - a.occurrences || a.nom.localeCompare(b.nom));
  return { entrees: entrees.length, familles: lignes, inconnues };
}

export function rapportCompte(compte) {
  const sortie = [`${compte.entrees} entr${compte.entrees === 1 ? 'y' : 'ies'}.`];
  for (const f of compte.familles) {
    const regle = f.regle_depuis ? `rule since ${f.regle_depuis}, ${f.apres_regle} after it` : 'no rule';
    sortie.push(`- ${f.nom}: ${f.occurrences} (${regle})${f.action ? ` -> ${f.action.toUpperCase()}` : ''}`);
  }
  if (compte.inconnues.length) sortie.push(`UNKNOWN FAMILY in: ${compte.inconnues.join(', ')}`);
  return sortie.join('\n');
}

function ecrireFamilles(racine, donnees) {
  ecrireAtomique(cheminFamilles(racine), `${JSON.stringify(donnees, null, 2)}\n`);
}

/** Records that a family now has a rule (or a new form). Run only on the user's decision. */
export function marquerRegle(racine, config, famille, forme = null, instant = new Date()) {
  const donnees = lireFamilles(racine);
  const nom = resoudre(construireIndex(donnees.familles), famille, donnees.familles);
  const f = donnees.familles.find((x) => x.nom === nom);
  f.regle_depuis = maintenant(fuseauEffectif(config), instant).date;
  if (forme) f.forme = forme;
  ecrireFamilles(racine, donnees);
  return f;
}

/** Adds a family to the closed list. Run only on the user's decision. */
export function ajouterFamille(racine, nom, description) {
  const canonique = normaliserNom(nom);
  if (!canonique) throw new ErreurCarnet('A family name is required.');
  if (!description || !String(description).trim()) throw new ErreurCarnet('A one-line description is required.');
  const donnees = lireFamilles(racine);
  if (construireIndex(donnees.familles).has(canonique)) throw new ErreurCarnet(`Family "${canonique}" already exists.`);
  donnees.familles.push({ nom: canonique, description: String(description).trim(), variantes: [], regle_depuis: null, forme: null });
  ecrireFamilles(racine, donnees);
  return canonique;
}
