#!/usr/bin/env node
// PreToolUse "estimated time": a time written in a published text comes from an
// output that was read (the `carnet heure` tool, an API timestamp), never from
// an estimate. Flags "around 14:30", "vers 14h30", "environ 14:30".
//
// A precise time without those words passes: it is assumed to come from an
// output. This guard looks at the form only, and at published texts only
// (issue and pull-request bodies and comments sent with `gh`).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { emettre, lireEntree, mode, sortiePreToolUse } from './commun.mjs';

export const RE_ESTIMEE = /\b(?:vers|environ|autour de|aux alentours de|around|about|roughly|approximately|approx\.?)\s+\d{1,2}\s*(?:[:h]\s*\d{2}|h\b|\s?[ap]\.?m\.?)/i;
const GH_TEXTE = /\bgh(?:\.exe)?\s+(?:pr\s+(?:create|edit|comment|review)|issue\s+(?:create|edit|comment))\b/;

/** The text that would be published, or null when the tool is not targeted. */
export function texteVise(outil, e = {}) {
  if (!/^(Bash|PowerShell)$/.test(outil)) return null;
  const cmd = String(e.command ?? '');
  if (!GH_TEXTE.test(cmd)) return null;
  const fichier = cmd.match(/--body-file\s+"([^"]+)"|--body-file\s+(\S+)/);
  if (fichier) { try { return fs.readFileSync(fichier[1] ?? fichier[2], 'utf8'); } catch { return cmd; } }
  return cmd;
}

/** A reason string, or null. */
export function verifier(entree) {
  const texte = texteVise(String(entree?.tool_name ?? ''), entree?.tool_input ?? {});
  if (!texte) return null;
  const m = RE_ESTIMEE.exec(texte.replace(/```[\s\S]*?```/g, ' '));
  if (!m) return null;
  const extrait = texte.slice(Math.max(0, m.index - 30), m.index + m[0].length + 20).replace(/\s+/g, ' ');
  return `[heure-estimee] Estimated time in a published text: "${extrait}". Take the time from an output ` +
    '(`carnet heure`, an API timestamp) and write it without "around", or date the fact instead.';
}

if (process.argv[1] && path.resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase()) {
  try {
    const entree = lireEntree();
    const raison = entree ? verifier(entree) : null;
    emettre(raison ? sortiePreToolUse(raison, mode(entree.cwd)) : null);
  } catch { process.exitCode = 0; }
}
