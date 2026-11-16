// Size budgets, measured, not hoped for.
//
// A target written in a file header is not a control: the state file this tool
// replaces aimed at 15 KB and reached 1 MB. Every budget here is checked by a
// command whose exit code a pre-commit hook or a CI job can act on.

import fs from 'node:fs';
import path from 'node:path';
import { DOSSIER } from './racine.mjs';

function lire(chemin) {
  try { return fs.readFileSync(chemin, 'utf8'); } catch { return null; }
}

const lignes = (texte) => (texte === '' ? 0 : texte.replace(/\r?\n$/, '').split(/\r?\n/).length);

/** Open questions: one `## ` heading each in decisions/a-trancher.md. */
export function compterQuestions(texte) {
  return texte.split(/\r?\n/).filter((l) => /^##\s+\S/.test(l)).length;
}

/** [{ fichier, mesure, valeur, budget, depasse }] for every budgeted file that exists. */
export function mesurer(racine, config) {
  const b = config.budgets;
  const resultats = [];
  const ajouter = (fichier, mesure, valeur, budget) =>
    resultats.push({ fichier, mesure, valeur, budget, depasse: valeur > budget });

  const etat = lire(path.join(racine, DOSSIER, 'ETAT.md'));
  if (etat !== null) ajouter(`${DOSSIER}/ETAT.md`, 'bytes', Buffer.byteLength(etat), b.etat_octets);

  const agents = lire(path.join(racine, 'AGENTS.md'));
  if (agents !== null) {
    ajouter('AGENTS.md', 'bytes', Buffer.byteLength(agents), b.agents_octets);
    ajouter('AGENTS.md', 'lines', lignes(agents), b.agents_lignes);
  }

  const claude = lire(path.join(racine, 'CLAUDE.md'));
  if (claude !== null) ajouter('CLAUDE.md', 'lines', lignes(claude), b.claude_lignes);

  const dossierPassations = path.join(racine, DOSSIER, 'passations');
  if (fs.existsSync(dossierPassations)) {
    for (const nom of fs.readdirSync(dossierPassations).filter((n) => n.endsWith('.md')).sort()) {
      const t = lire(path.join(dossierPassations, nom));
      if (t !== null) ajouter(`${DOSSIER}/passations/${nom}`, 'bytes', Buffer.byteLength(t), b.passation_octets);
    }
  }

  const questions = lire(path.join(racine, DOSSIER, 'decisions', 'a-trancher.md'));
  if (questions !== null) {
    ajouter(`${DOSSIER}/decisions/a-trancher.md`, 'open questions', compterQuestions(questions), b.questions_ouvertes);
  }
  return resultats;
}

export function rapport(resultats) {
  return resultats
    .map((r) => `${r.depasse ? 'OVER ' : 'ok   '} ${r.fichier}: ${r.valeur} ${r.mesure} (budget ${r.budget})`)
    .join('\n');
}
