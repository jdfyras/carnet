// Health of the notebook itself, in numbers a person can check.
//
// What is measured honestly: file sizes against budgets, age of the last
// review, families past a threshold, open questions, uncommitted files.
// What is NOT claimed: an "error rate". Entries are self-declared, so a falling
// count may be under-reporting. This report never presents it as progress.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { DOSSIER, LOCAL, ecrireAtomique } from './racine.mjs';
import { mesurer } from './budget.mjs';
import { compter } from './erreurs.mjs';
import { fuseauEffectif, joursEntre, maintenant } from './heure.mjs';

function derniereRevue(racine) {
  const dossier = path.join(racine, DOSSIER, 'revues');
  if (!fs.existsSync(dossier)) return null;
  const dates = fs.readdirSync(dossier).map((n) => /^(\d{4}-\d{2}-\d{2})\.md$/.exec(n)?.[1]).filter(Boolean).sort();
  return dates.at(-1) ?? null;
}

function nonCommites(racine) {
  try {
    const sortie = execFileSync('git', ['status', '--porcelain'], { cwd: racine, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    return sortie.split('\n').filter(Boolean).length;
  } catch {
    return null; // not a git repository, or git missing: unknown, not zero
  }
}

export function sante(racine, config, instant = new Date()) {
  const aujourdhui = maintenant(fuseauEffectif(config), instant).date;
  const budgets = mesurer(racine, config);
  const compte = compter(racine);
  const revue = derniereRevue(racine);
  const reference = revue ?? config.initialise_le ?? null;
  const jours = reference ? joursEntre(reference, aujourdhui) : null;
  const alertes = [];
  for (const b of budgets.filter((x) => x.depasse)) alertes.push(`${b.fichier} is over budget: ${b.valeur} ${b.mesure} (budget ${b.budget}).`);
  if (jours !== null && jours > config.revue_jours) {
    alertes.push(`Review overdue by ${jours - config.revue_jours} day(s): last ${revue ? `review ${revue}` : `reference ${reference} (no review yet)`}.`);
  }
  for (const f of compte.familles.filter((x) => x.action)) {
    const texte = {
      'propose-a-rule': `seen ${f.occurrences} times with no rule: propose one to the user`,
      'change-the-form': `came back ${f.apres_regle} time(s) after its rule: change the form (tool, check, hook), not the sentence`,
      red: `came back ${f.apres_regle} times after its rule: RED, the current form does not work`,
    }[f.action];
    alertes.push(`Family ${f.nom} ${texte}.`);
  }
  if (compte.inconnues.length) alertes.push(`Entries with an unknown family: ${compte.inconnues.join(', ')}.`);
  const etat = {
    date: aujourdhui,
    budgets,
    revue: { derniere: revue, jours_depuis: jours, seuil: config.revue_jours },
    erreurs: { entrees: compte.entrees, familles: compte.familles },
    non_commites: nonCommites(racine),
    alertes,
  };
  return etat;
}

export function enregistrer(racine, etat) {
  ecrireAtomique(path.join(racine, LOCAL, 'sante.json'), `${JSON.stringify(etat, null, 2)}\n`);
}

export function rapportSante(etat) {
  const lignes = [`Health on ${etat.date}: ${etat.alertes.length ? `${etat.alertes.length} alert(s)` : 'no alert'}.`];
  for (const a of etat.alertes) lignes.push(`- ${a}`);
  if (etat.non_commites !== null) lignes.push(`Uncommitted files: ${etat.non_commites}.`);
  lignes.push(`Error entries: ${etat.erreurs.entrees} (self-declared: a lower count is not proof of fewer errors).`);
  return lignes.join('\n');
}

/** Records that a review happened today; the report of that day is kept as its trace. */
export function marquerRevue(racine, config, notes = '', instant = new Date()) {
  const etat = sante(racine, config, instant);
  const chemin = path.join(racine, DOSSIER, 'revues', `${etat.date}.md`);
  ecrireAtomique(chemin, `# Review ${etat.date}\n\n${rapportSante(etat)}\n${notes.trim() ? `\n## Notes\n\n${notes.trim()}\n` : ''}`);
  return chemin;
}
