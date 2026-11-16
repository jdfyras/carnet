#!/usr/bin/env node
// Stop "state after stop": a reply that says a script or task is stopped must
// have listed the live processes in that same reply; a reply that says a pull
// request is not merged or still open must have read its state.
//
// Why: a "killed" notice or a task-stop call does not always kill child
// processes. A script announced as stopped has merged a pull request before.
//
// Known limits, stated rather than hidden:
//   - recognition by vocabulary (English and French): an unlisted phrasing passes;
//   - "still open" counts only with a pull request named in the same sentence;
//   - any process listing or PR read in the reply satisfies the check, even on another subject;
//   - stop_hook_active true: the hook lets go, so it can never loop.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { emettre, lireEntree, mode, sortieStop } from './commun.mjs';

// No \b before an accented letter: outside unicode mode it fails there.
export const RE_PROCESSUS = new RegExp([
  '(?:script|tâche|processus|process|task|job|watcher|loop)[^.\\n]{0,60}?(?:arrêtée?s?|coupée?s?|tuée?s?|stoppée?s?|killed|stopped|terminated)',
  '(?:arrêtée?s?|coupée?s?|tuée?s?|stoppée?s?|killed|stopped|terminated)[^.\\n]{0,40}?(?:script|tâche|processus|process|task|job)',
].join('|'), 'i');
// "Still open" alone is not about a pull request: a commitment, a question or a ticket is "still
// open" too, and a brief that said so was flagged three times out of three in an eval (2026-11-16).
// The open/ouverte forms need a pull request named in the same sentence; "merged" needs nothing.
const PR = '(?:pull requests?|merge requests?|\\bPRs?\\b|#\\d+)';
const OUVERTE = '(?:still open|(?:toujours|encore) ouverte)';
export const RE_PR = new RegExp([
  "rien (?:n'a été |n’a été |n'est |n’est |ne sera )?fusionné",
  'pas (?:encore )?fusionnée',
  '(?:nothing|not yet|has not been|hasn\'t been|isn\'t|is not) merged',
  `${PR}[^.\\n]{0,80}?${OUVERTE}`,
  `${OUVERTE}[^.\\n]{0,40}?${PR}`,
].join('|'), 'i');

const LIT_PROCESSUS = /(?:^|[\s;&|(])ps(?:\s|$)|Get-Process|Get-CimInstance\s+Win32_Process|tasklist|pgrep/i;
const LIT_PR = /gh\s+pr\s+(?:view|list|checks|status)|gh\s+api\s+[^\n]*pulls/i;

function estSaisie(entree) {
  if (entree.type !== 'user') return false;
  const c = entree.message?.content;
  if (typeof c === 'string') return true;
  return Array.isArray(c) && c.some((b) => b?.type === 'text') && !c.some((b) => b?.type === 'tool_result');
}

/** Transcript entries of the reply in progress: everything after the last user input. */
export function reponseEnCours(entrees) {
  let debut = 0;
  for (let i = entrees.length - 1; i >= 0; i -= 1) {
    if (estSaisie(entrees[i])) { debut = i + 1; break; }
  }
  return entrees.slice(debut);
}

/** A reason string, or null. */
export function analyser(entrees, dernierMessage = '') {
  const textes = dernierMessage ? [String(dernierMessage)] : [];
  let processus = false;
  let pr = false;
  for (const e of reponseEnCours(entrees)) {
    if (e.type !== 'assistant' || !Array.isArray(e.message?.content)) continue;
    for (const b of e.message.content) {
      if (b?.type === 'text' && typeof b.text === 'string') textes.push(b.text);
      if (b?.type === 'tool_use') {
        const commande = String(b.input?.command ?? '');
        if (LIT_PROCESSUS.test(commande)) processus = true;
        if (LIT_PR.test(commande)) pr = true;
      }
    }
  }
  const extrait = (t, m) => t.slice(Math.max(0, m.index - 20), m.index + m[0].length + 20).replace(/\s+/g, ' ').trim();
  for (const t of textes) {
    const mp = !processus && RE_PROCESSUS.exec(t);
    if (mp) {
      return `[etat-apres-arret] This reply says a script or task is stopped without listing live processes: "${extrait(t, mp)}". ` +
        'A "killed" notice does not always kill child processes. List them (ps, Get-Process), then correct the sentence.';
    }
    const mr = !pr && RE_PR.exec(t);
    if (mr) {
      return `[etat-apres-arret] This reply states a pull request's state without reading it: "${extrait(t, mr)}". ` +
        'Read it (`gh pr view`), then correct the sentence.';
    }
  }
  return null;
}

/** Only the end of a large transcript is read: reading 600 MB whole throws, and a thrown hook is a silent hook. */
export const FIN_LUE = 24 * 1024 * 1024;

export function lireTranscript(chemin, finLue = FIN_LUE) {
  const taille = fs.statSync(chemin).size;
  let texte;
  if (taille <= finLue) {
    texte = fs.readFileSync(chemin, 'utf8');
  } else {
    const fd = fs.openSync(chemin, 'r');
    try {
      const tampon = Buffer.alloc(finLue);
      fs.readSync(fd, tampon, 0, finLue, taille - finLue);
      texte = tampon.toString('utf8');
      texte = texte.slice(texte.indexOf('\n') + 1); // the first line is cut
    } finally {
      fs.closeSync(fd);
    }
  }
  return texte.split('\n').filter(Boolean).flatMap((l) => {
    try { return [JSON.parse(l)]; } catch { return []; }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase()) {
  try {
    const entree = lireEntree();
    if (!entree || entree.stop_hook_active || !entree.transcript_path) process.exitCode = 0;
    else {
      const raison = analyser(lireTranscript(entree.transcript_path), entree.last_assistant_message);
      emettre(raison ? sortieStop(raison, mode(entree.cwd)) : null);
    }
  } catch { process.exitCode = 0; }
}
