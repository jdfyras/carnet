#!/usr/bin/env node
// PreToolUse "secrets guard": refuses a tool call that would print a secret file.
//
// ALWAYS BLOCKS, whatever the `gardes` mode. A warning after a key has been
// printed in a transcript protects nothing: the value is already out.
//
// What it does:
// - Read: refuses a secrets file (.env and variants except .env.example, *.key, *.pem, *.p12,
//   *.pfx, id_rsa*, .ssh/, .aws/credentials, *credentials*.json, *.tfstate).
// - Bash and PowerShell: refuses a command that names such a path with a raw reader (cat, head,
//   tail, type, Get-Content, sed, awk, grep, jq, node -e, python -c ...) UNLESS it masks the values
//   (the word "mask", "masqu" or "<redacted>" in the command) or reads names only (ls, test, wc -l,
//   cut -d= -f1, grep -o '^[A-Z_]*=').
// - Key paths (*.key, *.pem, .ssh/): NO mask exemption. A key file holds a bare value: a masking
//   sed or cut aimed at NAME=value prints it whole. Passing the path to a printer is refused;
//   ls, stat, wc, test, sha256sum, grep -c/-l/-q and programs that take the path as an argument
//   without printing it (ssh -i, a script) pass.
// - Grep in content mode on such a path: refused (files_with_matches and count pass).
//
// Known limits:
// - a secret in a file with an ordinary name is not recognised;
// - outside key paths, "mask" in the command is enough: this guards against forgetting, not
//   against a deliberate bypass;
// - a read through a variable set in an earlier call, eval, or a script on disk is not seen;
// - on unreadable input the hook lets the call pass.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { emettre, lireEntree, sortiePreToolUse } from './commun.mjs';

const SEP = String.raw`[\\/]`;
export const CHEMIN_SECRET = new RegExp(
  [
    // The trailing class includes the backtick: echo `cat .env` ends the path with one.
    String.raw`(^|${SEP}|\s|["'=:])\.env(?!\.example\b)(\.[\w.-]+)?(?=$|\s|["';|)&>\x60])`,
    String.raw`\.(key|pem|p12|pfx)(?=$|\s|["';|)&>*\x60])`,
    String.raw`(^|${SEP})id_(rsa|ed25519|ecdsa)\w*`,
    String.raw`${SEP}\.ssh${SEP}`,
    String.raw`\.aws${SEP}credentials`,
    String.raw`credentials[\w-]*\.json`,
    String.raw`\.tfstate\b`,
  ].join('|'),
  'i',
);

const LECTEUR_BRUT = /(^|[\s;|&(`$])(cat|head|tail|less|more|type|get-content|gc|sed|awk|grep|egrep|findstr|select-string|base64|xxd|od|strings|jq|bat)(\s|$)|git\s+show|node\s+(-e|--eval|-p)|python3?\s+-c/i;
const MASQUE = /masqu|\bmask|<redacted>/i;
const MOTS_SEULEMENT = /^\s*(echo|printf|write-output|write-host)\b/i;
// Commands that only output names or counts, never a value.
const NOMS_SEULEMENT = /^\s*(ls|dir|test|\[|stat|wc\s+-[lc]|file)\b|cut\s+-d\s*=?\s*['"]?=['"]?\s+-f\s*1\b|grep\s+-[a-z]*o[a-z]*\s+['"]\^\[A-Z_/i;

export const CHEMIN_CLES = new RegExp(
  [
    String.raw`\.(key|pem)(?=$|\s|["';|)&>*])`,
    String.raw`(^|${SEP}|\s|["'=:])\.ssh(?=$|${SEP}|\s|["';|)&>])`,
  ].join('|'),
  'i',
);

// Programs that write to their output what they read. Everything else is assumed to use the file
// without printing it.
const AFFICHEURS = [
  'cat', 'tac', 'nl', 'head', 'tail', 'less', 'more', 'type', 'get-content', 'gc', 'bat',
  'sed', 'awk', 'gawk', 'cut', 'tr', 'sort', 'uniq', 'rev', 'diff',
  'grep', 'egrep', 'fgrep', 'rg', 'findstr', 'select-string', 'sls',
  'strings', 'xxd', 'od', 'hexdump', 'format-hex', 'base64', 'jq',
];
const AFFICHEUR = new RegExp(String.raw`(^|[\s;|&(\`"'/\\])(${AFFICHEURS.join('|')})(\.exe)?(?=$|\s|["')\`])`, 'gi');
const AFFICHEUR_EN_LIGNE = /git\s+show|node\s+(-e|--eval|-p|--print)\b|python3?\s+-c\b|ReadAll(Text|Lines|Bytes)|\$\(\s*</i;
// grep that outputs only a count, file names or an exit code. Case-sensitive: -C is context.
const GREP_SANS_VALEUR = /(^|\s)(-[A-Za-z]*[clqL][A-Za-z]*|--count|--files-with-matches|--files-without-match|--quiet|--silent)(?=\s|$)/;
const GREP_NOMS_DE_CHAMPS = /grep\s+-[A-Za-z]*o[A-Za-z]*\s+(['"])\^\[[A-Za-z0-9_-]+\][+*]=\1(\s|$)/;
const PROPAGE_PARTOUT = /\bfor\s+\w+\s+in\b|\bforeach\b|%\s*\{|\bxargs\b|-exec(dir)?\b|\bwhile\s+read\b/i;
const PROPAGE_SEGMENT = /^[\s({]*(cd|pushd|chdir|set-location|sl)\s|^\s*((export|local|readonly)\s+)?\$?\w+\s*=\s*("[^"]*"|'[^']*'|\S+)\s*$/i;

// Splits at command separators outside quotes: the | or ; of a sed script does not split.
function segmenter(c) {
  const segments = [];
  let courant = '';
  let guillemet = null;
  for (let i = 0; i < c.length; i += 1) {
    const ch = c[i];
    if (guillemet) {
      courant += ch;
      if (ch === guillemet) guillemet = null;
      else if (ch === '\\' && guillemet === '"' && i + 1 < c.length) courant += c[(i += 1)];
    } else if (ch === '"' || ch === "'") {
      guillemet = ch;
      courant += ch;
    } else if (ch === '\\' && i + 1 < c.length) {
      courant += ch + c[(i += 1)];
    } else if (ch === ';' || ch === '|' || ch === '&' || ch === '\n') {
      segments.push(courant);
      courant = '';
    } else {
      courant += ch;
    }
  }
  segments.push(courant);
  return segments;
}

function affiche(segment) {
  if (AFFICHEUR_EN_LIGNE.test(segment)) return true;
  const mots = [...segment.matchAll(AFFICHEUR)].map((m) => m[2].toLowerCase());
  if (mots.length === 0) return false;
  const seulGrep = mots.length === 1 && /^([ef]?grep|rg)$/.test(mots[0]);
  return !(seulGrep && (GREP_SANS_VALEUR.test(segment) || GREP_NOMS_DE_CHAMPS.test(segment)));
}

function afficheUneCle(segments, c) {
  const avecCle = segments.filter((s) => CHEMIN_CLES.test(s));
  if (avecCle.some(affiche)) return true;
  const propage = PROPAGE_PARTOUT.test(c) || avecCle.some((s) => PROPAGE_SEGMENT.test(s));
  return propage && segments.some(affiche);
}

const CONSEIL = "Read names only (ls, cut -d= -f1), or mask the values, for example: sed -E 's/[A-Za-z0-9_+/=.-]{16,}/<redacted>/g'.";
const RAISON_CLES =
  '[garde-secrets] command that prints the content of a key file (*.key, *.pem, .ssh). A mask is not enough here: ' +
  "a file holding a bare value comes out whole. Read names and metadata only (ls -la, stat, wc -l, grep -c), or pass the path " +
  'as an argument to a program that does not print it.';

/** A reason string, or null. */
export function analyser(outil, e = {}) {
  const nom = String(outil ?? '');
  if (nom === 'Read') {
    const p = String(e.file_path ?? '');
    return CHEMIN_SECRET.test(p) ? `[garde-secrets] raw read of a secrets file (${path.basename(p)}). ${CONSEIL}` : null;
  }
  if (nom === 'Grep') {
    const cible = `${e.path ?? ''} ${e.glob ?? ''}`;
    return CHEMIN_SECRET.test(cible) && String(e.output_mode ?? 'files_with_matches') === 'content'
      ? `[garde-secrets] Grep in content mode on a secrets file. ${CONSEIL}`
      : null;
  }
  if (nom === 'Bash' || nom === 'PowerShell') {
    let c = String(e.command ?? '');
    if (CHEMIN_CLES.test(c)) {
      const segments = segmenter(c);
      if (afficheUneCle(segments, c)) return RAISON_CLES;
      // The rest of the command (a .env elsewhere, say) follows the general rule, mask included.
      c = segments.filter((s) => !CHEMIN_CLES.test(s)).join(' ; ');
    }
    // A segment that only prints its own arguments (echo "never cat the .env file") reads no file.
    // It is dropped, unless it runs a substitution: echo $(cat .env) does read one.
    c = segmenter(c).filter((s) => !(MOTS_SEULEMENT.test(s) && !/\$\(|`/.test(s))).join(' ; ');
    if (!CHEMIN_SECRET.test(c)) return null;
    if (MASQUE.test(c)) return null;
    if (!LECTEUR_BRUT.test(c)) return null;
    const segments = c.split(/\|\||&&|[;|\n]/);
    const brut = segments.some((s) => CHEMIN_SECRET.test(s) && LECTEUR_BRUT.test(s) && !NOMS_SEULEMENT.test(s));
    const bouclesBrutes = /for\s+\w+\s+in\b[^;]*/.test(c) && CHEMIN_SECRET.test(c) && LECTEUR_BRUT.test(c);
    return brut || bouclesBrutes ? `[garde-secrets] command that reads a secrets file in clear. ${CONSEIL}` : null;
  }
  return null;
}

if (process.argv[1] && path.resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase()) {
  try {
    const entree = lireEntree();
    const raison = entree ? analyser(String(entree.tool_name ?? ''), entree.tool_input ?? {}) : null;
    emettre(raison ? sortiePreToolUse(raison, 'bloquer') : null);
  } catch { process.exitCode = 0; }
}
