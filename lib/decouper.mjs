// Split an oversized state file into what is state and what is journal.
//
// A state file that was appended to for months is mostly dated entries: a
// journal stored in the wrong place. This separates the two mechanically and
// PROVES that nothing was lost: every input line lands in exactly one output,
// and the multiset of lines is compared before anything is reported as done.
//
// It never edits the source. By default it is a simulation that only measures.
// With an output folder it writes new files there and refuses to overwrite.
//
// What it does not do: decide what is still true. The remainder it leaves
// (tables, undated bullets, prose) is usually still far above the state budget;
// trimming that is a person's judgement, and the report says so with figures.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { ErreurCarnet } from './racine.mjs';

// "- 06/11 16:15 …", "- 06/11/2026 …", "- 2026-11-06 16:15 …", with optional leading spaces.
const ENTREE_JMA = /^(\s*)[-*] (\d{2})\/(\d{2})(?:\/(\d{4}))?(?=[\s,:.)]|$)/;
const ENTREE_ISO = /^(\s*)[-*] (\d{4})-(\d{2})-(\d{2})(?=[\s,:.)T]|$)/;
const TITRE = /^(#{1,6})\s+(.*)$/;

function lireEntree(ligne, anneeDefaut) {
  let m = ENTREE_ISO.exec(ligne);
  if (m) return { retrait: m[1].length, mois: `${m[2]}-${m[3]}`, cle: `${m[2]}-${m[3]}-${m[4]}` };
  m = ENTREE_JMA.exec(ligne);
  if (!m) return null;
  const [jour, mois, annee] = [Number(m[2]), Number(m[3]), m[4] ?? String(anneeDefaut)];
  if (mois < 1 || mois > 12 || jour < 1 || jour > 31) return null;
  return { retrait: m[1].length, mois: `${annee}-${m[3]}`, cle: `${annee}-${m[3]}-${m[2]}` };
}

const retraitDe = (ligne) => ligne.length - ligne.trimStart().length;
const empreinte = (lignes) => crypto.createHash('sha256').update([...lignes].sort().join('\n')).digest('hex');

/**
 * Splits `texte`. Returns the remainder, the journal per month, and a proof.
 * `garder`: number of most recent dated entries left in the state, per section.
 */
export function decouper(texte, { annee, garder = 0, sectionsEtat = [] } = {}) {
  // A dated bullet is not always history: under "Commitments" it is a deadline, which is state.
  // Sections named here keep all their lines.
  const estEtat = (section) => sectionsEtat.some((s) => s && section.toLowerCase().includes(s.toLowerCase()));
  if (!Number.isInteger(annee)) throw new ErreurCarnet('A default year is required (--annee) for entries written without one.');
  const finDeLigne = texte.includes('\r\n') ? '\r\n' : '\n';
  const lignes = texte.split(/\r?\n/);
  const finale = lignes.at(-1) === '';
  if (finale) lignes.pop();

  // Pass 1: group lines into blocks. A dated entry owns the more-indented lines that follow it.
  const blocs = [];
  let section = '(before any heading)';
  let i = 0;
  while (i < lignes.length) {
    const ligne = lignes[i];
    const titre = TITRE.exec(ligne);
    if (titre) section = titre[2].trim();
    const entree = titre || estEtat(section) ? null : lireEntree(ligne, annee);
    if (!entree) { blocs.push({ type: 'reste', section, lignes: [ligne] }); i += 1; continue; }
    const corps = [ligne];
    let j = i + 1;
    while (j < lignes.length && lignes[j].trim() !== '' && retraitDe(lignes[j]) > entree.retrait && !TITRE.test(lignes[j])) {
      corps.push(lignes[j]); j += 1;
    }
    blocs.push({ type: 'entree', section, mois: entree.mois, cle: entree.cle, lignes: corps });
    i = j;
  }

  // Pass 2: keep the N most recent entries of each section in the state, if asked.
  if (garder > 0) {
    const parSection = new Map();
    for (const b of blocs) if (b.type === 'entree') (parSection.get(b.section) ?? parSection.set(b.section, []).get(b.section)).push(b);
    for (const entrees of parSection.values()) {
      const recentes = [...entrees].sort((a, b) => (a.cle < b.cle ? 1 : a.cle > b.cle ? -1 : 0)).slice(0, garder);
      for (const b of recentes) b.type = 'reste';
    }
  }

  const reste = blocs.filter((b) => b.type === 'reste').flatMap((b) => b.lignes);
  const journal = new Map(); // month -> [{ section, lignes }]
  for (const b of blocs) {
    if (b.type !== 'entree') continue;
    (journal.get(b.mois) ?? journal.set(b.mois, []).get(b.mois)).push(b);
  }

  // Proof: the lines that went out are exactly the lines that came in.
  const sorties = [...reste, ...[...journal.values()].flat().flatMap((b) => b.lignes)];
  const preuve = {
    lignes_entree: lignes.length,
    lignes_sortie: sorties.length,
    empreinte_entree: empreinte(lignes),
    empreinte_sortie: empreinte(sorties),
  };
  preuve.conserve = preuve.lignes_entree === preuve.lignes_sortie && preuve.empreinte_entree === preuve.empreinte_sortie;
  if (!preuve.conserve) throw new ErreurCarnet('Conservation check failed: the outputs do not hold exactly the input lines. Nothing written.', 2);

  const octets = (ls) => Buffer.byteLength(ls.join('\n')) + (ls.length ? 1 : 0);
  const parSection = new Map();
  for (const b of blocs) {
    const s = parSection.get(b.section) ?? parSection.set(b.section, { entrees: 0, octets_journal: 0, octets_reste: 0 }).get(b.section);
    if (b.type === 'entree') { s.entrees += 1; s.octets_journal += octets(b.lignes); } else s.octets_reste += octets(b.lignes);
  }
  return {
    finDeLigne, finale, reste, journal, preuve,
    mesures: {
      octets_entree: octets(lignes),
      octets_reste: octets(reste),
      octets_journal: Object.fromEntries([...journal].sort().map(([m, bs]) => [m, octets(bs.flatMap((b) => b.lignes))])),
      entrees: [...journal.values()].flat().length,
      sections: Object.fromEntries(parSection),
    },
  };
}

/** Journal file for one month: entries verbatim, grouped under the section they came from. */
export function fichierJournal(mois, blocs, source, finDeLigne = '\n') {
  const lignes = [`# Journal ${mois}`, '', `Moved from ${source} by \`carnet decouper\`. Entries are verbatim, in their original order.`];
  let section = null;
  for (const b of blocs) {
    if (b.section !== section) { section = b.section; lignes.push('', `## ${section}`, ''); }
    lignes.push(...b.lignes);
  }
  return lignes.join(finDeLigne) + finDeLigne;
}

export function rapport(resultat, budget) {
  const m = resultat.mesures;
  const pct = (n) => `${((100 * n) / m.octets_entree).toFixed(1)} %`;
  const lignes = [
    `Input: ${m.octets_entree} bytes, ${resultat.preuve.lignes_entree} lines.`,
    `Dated entries: ${m.entrees}, moved to the journal.`,
    ...Object.entries(m.octets_journal).map(([mois, n]) => `  journal ${mois}: ${n} bytes (${pct(n)})`),
    `Remainder (state): ${m.octets_reste} bytes (${pct(m.octets_reste)}).`,
  ];
  if (budget) {
    lignes.push(m.octets_reste > budget
      ? `The remainder is still ${(m.octets_reste / budget).toFixed(1)}x the state budget (${budget} bytes): what is left is undated text, and trimming it is a person's judgement.`
      : `The remainder fits the state budget (${budget} bytes).`);
  }
  const gros = Object.entries(m.sections).sort((a, b) => b[1].octets_reste - a[1].octets_reste).slice(0, 6);
  lignes.push('Largest sections of the remainder:');
  for (const [nom, s] of gros) lignes.push(`  ${String(s.octets_reste).padStart(8)} bytes kept, ${String(s.entrees).padStart(4)} entries moved  ${nom.slice(0, 70)}`);
  lignes.push(`Conservation: ${resultat.preuve.lignes_sortie}/${resultat.preuve.lignes_entree} lines, identical fingerprint ${resultat.preuve.empreinte_entree.slice(0, 12)}.`);
  return lignes.join('\n');
}

/** Writes the remainder and the journal files into `dossier`. Refuses to overwrite anything. */
export function ecrire(resultat, dossier, source) {
  const cibles = [
    [path.join(dossier, 'ETAT.reste.md'), resultat.reste.join(resultat.finDeLigne) + (resultat.finale ? resultat.finDeLigne : '')],
    ...[...resultat.journal].sort().map(([mois, blocs]) => [path.join(dossier, 'journal', `${mois}.md`), fichierJournal(mois, blocs, source, resultat.finDeLigne)]),
  ];
  for (const [chemin] of cibles) if (fs.existsSync(chemin)) throw new ErreurCarnet(`${chemin} already exists: nothing written.`, 2);
  for (const [chemin, contenu] of cibles) {
    fs.mkdirSync(path.dirname(chemin), { recursive: true });
    fs.writeFileSync(chemin, contenu);
  }
  return cibles.map(([chemin]) => chemin);
}
