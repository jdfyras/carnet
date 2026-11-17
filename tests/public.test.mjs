// This repository is public. These checks run on every file git would publish (tracked, or new and
// not ignored) and fail before anything personal, machine-specific or long-quoted gets pushed.
//
// An optional deny list of names (people, clients, channels) is read from outside the repository:
// CARNET_REFUS, or ~/.config/carnet/refus.txt, one term per line. The list itself is never committed:
// it would publish the very names it protects. Without it, that part of the check is skipped and says so.

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BINAIRE = /\.(png|jpe?g|gif|ico|pdf|zip|gz|woff2?)$/i;

function publies() {
  const sortie = execFileSync('git', ['ls-files', '-co', '--exclude-standard', '-z'], { cwd: RACINE, encoding: 'utf8' });
  return sortie.split('\0').filter(Boolean).filter((f) => !BINAIRE.test(f) && fs.existsSync(path.join(RACINE, f)));
}

const lire = (f) => fs.readFileSync(path.join(RACINE, f), 'utf8');
const ICI = path.relative(RACINE, fileURLToPath(import.meta.url)).split(path.sep).join('/');

// Patterns are built from pieces so this file does not match itself.
const MOTIFS = [
  ['a Windows user folder', new RegExp(['[A-Za-z]:', '[\\\\/]+Users[\\\\/]+(?!First Last|<|\\.\\.\\.|USERNAME|you\\b)'].join(''), 'i')],
  ['a Git Bash user folder', new RegExp(['/c/', 'Users/(?!<)'].join(''), 'i')],
  ['a Slack member id', new RegExp(['\\bU0', '[A-Z0-9]{8,}\\b'].join(''))],
  ['a private key', new RegExp(['-----BEGIN ', '[A-Z ]*PRIVATE KEY-----'].join(''))],
  ['a token', new RegExp(['\\b(ghp_|github_pat_|sk-ant-|xox[abpr]-|AKIA)', '[A-Za-z0-9_-]{10,}'].join(''))],
];
const COURRIEL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const COURRIELS_PERMIS = /@(example\.(com|org|invalid)|users\.noreply\.github\.com|anthropic\.com)$/i;

test('no machine path, member id, key or token in a published file', () => {
  const trouves = [];
  for (const f of publies()) {
    if (f === ICI) continue;
    const texte = lire(f);
    for (const [nom, re] of MOTIFS) {
      const m = re.exec(texte);
      if (m) trouves.push(`${f}: ${nom} (line ${texte.slice(0, m.index).split('\n').length})`);
    }
  }
  assert.deepEqual(trouves, []);
});

test('no e-mail address in a published file, except example and noreply domains', () => {
  const trouves = [];
  for (const f of publies()) {
    for (const m of lire(f).matchAll(COURRIEL)) {
      if (!COURRIELS_PERMIS.test(m[0])) trouves.push(`${f}: ${m[0]}`);
    }
  }
  assert.deepEqual(trouves, []);
});

test('no term of the private deny list in a published file', (t) => {
  const liste = process.env.CARNET_REFUS || path.join(os.homedir(), '.config', 'carnet', 'refus.txt');
  if (!fs.existsSync(liste)) { t.skip(`no deny list at ${liste}: names were not checked`); return; }
  const termes = fs.readFileSync(liste, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  const trouves = [];
  for (const f of publies()) {
    const texte = lire(f).toLowerCase();
    for (const terme of termes) if (texte.includes(terme.toLowerCase())) trouves.push(`${f}: term #${termes.indexOf(terme) + 1}`);
  }
  // Report the term by its position in the list, never by its value: the test output is public in CI.
  assert.deepEqual(trouves, []);
});

test('no quotation longer than 25 words in the reference base', () => {
  const longues = [];
  for (const f of publies().filter((x) => x.startsWith('plugins/prompts/references/'))) {
    const texte = lire(f);
    for (const m of texte.matchAll(/«\s*([^»]{1,3000}?)\s*»|“([^”]{1,3000})”/g)) {
      const q = m[1] ?? m[2];
      if (q.split(/\s+/).length > 25) longues.push(`${f}: line ${texte.slice(0, m.index).split('\n').length}`);
    }
  }
  assert.deepEqual(longues, []);
});

test('the deny-list check fires on a planted term (decoy)', () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'carnet-refus-'));
  try {
    const liste = path.join(d, 'refus.txt');
    fs.writeFileSync(liste, 'planted-term-xyz\n');
    const r = execFileSync(process.execPath, ['-e', `
      const t = require('fs').readFileSync(${JSON.stringify(liste)}, 'utf8').trim();
      process.stdout.write(String('a line with Planted-Term-XYZ inside'.toLowerCase().includes(t)));`], { encoding: 'utf8' });
    assert.equal(r, 'true');
    for (const [nom, re] of MOTIFS) assert.ok(!re.test('plain text with nothing personal'), nom);
    assert.ok(MOTIFS[0][1].test(['C:', '\\Users\\someone\\x'].join('')), 'a Windows user folder is caught');
    assert.ok(!MOTIFS[0][1].test(['C:', '\\Users\\First Last\\x'].join('')), 'the generic placeholder passes');
    assert.ok(MOTIFS[2][1].test(['U0', 'ABCDEFGH1'].join('')), 'a member id is caught');
  } finally { fs.rmSync(d, { recursive: true, force: true }); }
});
