// Deadlines in the state file: today, tomorrow, overdue, coming up.
//
// A brief that does not start with the deadlines lets one pass unseen. This reads the state file
// and sorts the dated lines of its commitments section against today's date in the project's
// time zone. It reads a file; it does not know whether a promise was kept.
//
// What it reads:
// - under a heading that names commitments or deadlines (any level, English or French): every line
//   with a date. Dates are YYYY-MM-DD, or DD/MM and DD/MM/YYYY (day first). Without a year, the
//   year that puts the date closest to today is taken.
// - elsewhere in the file: only the lines that cite today's or tomorrow's date, as other mentions.
// What it does not do:
// - resolve "Tuesday", "tomorrow" or "tonight": such a line is listed as to be read.
// - tell a deadline from a date the line merely cites ("cancelled on 13/11"): both come out as
//   dated in the past, and the report says so.
// - judge that a commitment is kept. It only looks at how the line starts ("[x]", done, kept,
//   cancelled, tenu, fait, annulé…). A stale status in the file gives a stale output, so every
//   overdue line is printed as to be verified at its source.

import { joursEntre } from './heure.mjs';

const TITRE = /^(#{1,6})\s+(.*)$/u;
const SECTION = /(commitment|deadline|engagement|échéance|echeance)/iu;
const ISO = /(?<![\d-])(\d{4})-(\d{2})-(\d{2})(?![\d-])/gu;
const JMA = /(?<![\d/])(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?(?![\d/])/gu;
const CLOS = /^(?:\[x\]|~~|(?:done|kept|cancell?ed|dropped|replaced|tenu|fait|annulé|abandonné|remplacé|sans objet)(?!\p{L}))/iu;
const RELATIF = /(?<!\p{L})(monday|tuesday|wednesday|thursday|friday|saturday|sunday|today|tomorrow|tonight|next week|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|aujourd'hui|demain|ce soir|prochaine?)(?!\p{L})/iu;
const HORIZON = 7;
const MENTIONS = 5;

const iso = (a, m, j) => `${a}-${String(m).padStart(2, '0')}-${String(j).padStart(2, '0')}`;
const valide = (m, j) => m >= 1 && m <= 12 && j >= 1 && j <= 31;

/** Every date a line cites, as YYYY-MM-DD. */
export function datesDe(ligne, aujourdhui) {
  const dates = [];
  for (const m of ligne.matchAll(ISO)) if (valide(Number(m[2]), Number(m[3]))) dates.push(iso(m[1], m[2], m[3]));
  for (const m of ligne.matchAll(JMA)) {
    const [j, mois] = [Number(m[1]), Number(m[2])];
    if (!valide(mois, j)) continue;
    if (m[3]) { dates.push(iso(m[3], mois, j)); continue; }
    const annee = Number(aujourdhui.slice(0, 4));
    const candidates = [annee - 1, annee, annee + 1].map((a) => iso(a, mois, j));
    dates.push(candidates.reduce((x, y) => (Math.abs(joursEntre(aujourdhui, y)) < Math.abs(joursEntre(aujourdhui, x)) ? y : x)));
  }
  return dates;
}

const corps = (ligne) => ligne.replace(/^\s*(?:[-*+]|\d+[.)])\s+/u, '').replace(/^\|\s*/u, '').replace(/^\*\*|\*\*$/gu, '').trim();

/** Sorts the lines of `texte` against `aujourdhui` ('YYYY-MM-DD'). */
export function lire(texte, aujourdhui) {
  const r = { aujourdhui, jour: [], demain: [], depassees: [], a_venir: [], relatives: [], sans_date: [], mentions: [], closes: 0, section: null };
  let dans = false;
  let niveau = 0;
  const lignes = texte.split(/\r?\n/u);
  lignes.forEach((ligne, i) => {
    const t = TITRE.exec(ligne);
    if (t) {
      if (dans && t[1].length <= niveau) dans = false;
      if (!dans && SECTION.test(t[2])) { dans = true; niveau = t[1].length; r.section = r.section ?? t[2].trim(); }
      return;
    }
    const c = corps(ligne);
    if (!c || c.startsWith('<!--')) return;
    const entree = { ligne: i + 1, texte: c.slice(0, 200) };
    const dates = datesDe(ligne, aujourdhui);
    if (!dans) {
      if (dates.some((d) => [0, 1].includes(joursEntre(aujourdhui, d)))) r.mentions.push(entree);
      return;
    }
    if (!/^\s*(?:[-*+]|\d+[.)]|\|)\s*/u.test(ligne)) return; // prose under the heading, not an item
    if (/^[\s|:-]*$/u.test(ligne)) return; // table separator
    if (CLOS.test(c)) { r.closes += 1; return; }
    if (!dates.length) { (RELATIF.test(c) ? r.relatives : r.sans_date).push(entree); return; }
    // An item is as urgent as its earliest date that is not behind us; else its latest past date.
    const ecarts = dates.map((d) => joursEntre(aujourdhui, d));
    const futurs = ecarts.filter((e) => e >= 0);
    const ecart = futurs.length ? Math.min(...futurs) : Math.max(...ecarts);
    entree.ecart = ecart;
    if (ecart === 0) r.jour.push(entree);
    else if (ecart === 1) r.demain.push(entree);
    else if (ecart < 0) r.depassees.push(entree);
    else if (ecart <= HORIZON) r.a_venir.push(entree);
  });
  r.depassees.sort((a, b) => b.ecart - a.ecart);
  r.a_venir.sort((a, b) => a.ecart - b.ecart);
  return r;
}

export function rapport(r, fichier) {
  const bloc = (titre, entrees, suffixe = () => '') => (entrees.length
    ? [`${titre}: ${entrees.length}`, ...entrees.map((e) => `  L${e.ligne}${suffixe(e)}  ${e.texte}`)]
    : [`${titre}: 0`]);
  if (!r.section) {
    return [`${fichier}, ${r.aujourdhui}: no heading names commitments or deadlines, so no deadline can be read.`,
      ...(r.mentions.length ? bloc('OTHER MENTIONS of today or tomorrow', r.mentions) : [])].join('\n');
  }
  return [
    `${fichier}, section "${r.section}", today ${r.aujourdhui}.`,
    ...bloc('TODAY', r.jour),
    ...bloc('TOMORROW', r.demain),
    ...bloc('DATED IN THE PAST, still open in the file — a deadline missed, or only a date the line cites: VERIFY AT THE SOURCE before saying late', r.depassees, (e) => ` (${-e.ecart} d ago)`),
    ...bloc(`NEXT ${HORIZON} DAYS`, r.a_venir, (e) => ` (in ${e.ecart} d)`),
    ...bloc('RELATIVE DATE (a weekday, "tomorrow") — read the line, do not guess', r.relatives),
    `WITHOUT A DATE: ${r.sans_date.length}${r.sans_date.length ? ` (lines ${r.sans_date.map((e) => e.ligne).join(', ')})` : ''}`,
    `Closed by how the line starts, not shown: ${r.closes}.`,
    ...(r.mentions.length ? [...bloc('OTHER MENTIONS of today or tomorrow outside that section', r.mentions.slice(0, MENTIONS)), ...(r.mentions.length > MENTIONS ? [`  … and ${r.mentions.length - MENTIONS} more`] : [])] : []),
    'A status written in the file is not a fact: check each line above at its source before repeating it.',
  ].join('\n');
}
