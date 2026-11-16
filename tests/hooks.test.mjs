// Hook tests: refused cases AND decoys that must pass, then the stdin/stdout
// contract of each script run as a real process.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { analyser as secrets } from '../hooks/garde-secrets.mjs';
import { verifier as heureEstimee } from '../hooks/heure-estimee.mjs';
import { analyser as apresArret } from '../hooks/etat-apres-arret.mjs';
import { PLAFOND, contexte } from '../hooks/session-start.mjs';
import { mode } from '../hooks/commun.mjs';
import { appliquer, planifier } from '../lib/init.mjs';
import { lireConfig } from '../lib/racine.mjs';
import { ajouter } from '../lib/erreurs.mjs';

const HOOKS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'hooks');
const T0 = new Date('2026-11-16T10:00:00Z');

function lancer(script, entree, env = {}) {
  const r = spawnSync(process.execPath, [path.join(HOOKS, script)], {
    input: typeof entree === 'string' ? entree : JSON.stringify(entree),
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_PLUGIN_OPTION_GARDES: '', ...env },
  });
  return { code: r.status, sortie: r.stdout.trim() ? JSON.parse(r.stdout) : null, brut: r.stdout };
}

function projet(options = {}) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'carnet-hook-'));
  appliquer(planifier(d, { fuseau: 'Europe/Paris', ...options }, T0));
  return d;
}

// ---------------------------------------------------------------- garde-secrets

test('secrets: raw reads are refused', () => {
  const refuses = [
    ['Read', { file_path: '/app/.env' }],
    ['Read', { file_path: 'C:\\app\\.env.production' }],
    ['Read', { file_path: '/srv/keys/.ssh/id_ed25519' }],
    ['Read', { file_path: 'infra/terraform.tfstate' }],
    ['Grep', { path: 'config/.env', pattern: 'KEY', output_mode: 'content' }],
    ['Bash', { command: 'cat .env' }],
    ['Bash', { command: 'cd app && head -5 .env.local' }],
    ['PowerShell', { command: 'Get-Content .env' }],
    ['Bash', { command: 'grep TOKEN service-credentials.json' }],
    // Key paths: a mask is not an exemption, the file holds a bare value.
    ['Bash', { command: "sed -E 's/.{16,}/<redacted>/' server.pem" }],
    ['Bash', { command: 'cat ~/.ssh/config | mask' }],
    ['Bash', { command: 'for f in *.key; do cat "$f"; done' }],
    // An echo that runs a substitution does read the file: the echo exemption must not cover it.
    ['Bash', { command: 'echo "$(cat .env)"' }],
    ['Bash', { command: 'echo `cat .env`' }],
    ['Bash', { command: 'echo start; cat .env' }],
  ];
  for (const [outil, entree] of refuses) assert.ok(secrets(outil, entree), `should refuse: ${outil} ${JSON.stringify(entree)}`);
});

test('secrets: decoys pass', () => {
  const passent = [
    ['Read', { file_path: '/app/.env.example' }],
    ['Read', { file_path: '/app/src/environment.ts' }],
    ['Read', { file_path: 'docs/keyboard.md' }],
    ['Grep', { path: 'config/.env', pattern: 'KEY' }], // files_with_matches by default
    ['Grep', { path: 'config/.env', pattern: 'KEY', output_mode: 'count' }],
    ['Bash', { command: 'ls -la .env' }],
    ['Bash', { command: 'wc -l .env' }],
    ['Bash', { command: "cut -d= -f1 .env" }],
    ['Bash', { command: "sed -E 's/=.*/=<redacted>/' .env" }],
    ['Bash', { command: 'ssh -i ~/.ssh/id_ed25519 host uptime' }],
    ['Bash', { command: 'sha256sum server.pem' }],
    ['Bash', { command: 'grep -c BEGIN server.pem' }],
    ['Bash', { command: 'cat README.md' }],
    ['Bash', { command: 'echo "never cat the .env file" >> NOTES.md' }],
    ['Write', { file_path: '/app/.env', content: 'A=1' }],
  ];
  for (const [outil, entree] of passent) assert.equal(secrets(outil, entree), null, `should pass: ${outil} ${JSON.stringify(entree)}`);
});

test('secrets: as a process it always denies, even in warn mode', () => {
  const r = lancer('garde-secrets.mjs', { tool_name: 'Bash', tool_input: { command: 'cat .env' }, cwd: os.tmpdir() }, { CLAUDE_PLUGIN_OPTION_GARDES: 'avertir' });
  assert.equal(r.code, 0);
  assert.equal(r.sortie.hookSpecificOutput.permissionDecision, 'deny');
  assert.match(r.sortie.hookSpecificOutput.permissionDecisionReason, /garde-secrets/);
  assert.equal(lancer('garde-secrets.mjs', { tool_name: 'Bash', tool_input: { command: 'ls' } }).sortie, null);
  assert.deepEqual(lancer('garde-secrets.mjs', 'not json'), { code: 0, sortie: null, brut: '' }, 'unreadable input lets the call pass');
});

// ---------------------------------------------------------------- heure-estimee

const gh = (corps) => ({ tool_name: 'Bash', tool_input: { command: `gh pr comment 12 --body "${corps}"` } });

test('estimated time: flagged in published text, in French and English', () => {
  for (const corps of ['déployé vers 14h30', 'deployed around 2:30', 'environ 14:30 hier', 'restarted at about 3 pm', 'autour de 14h']) {
    assert.match(heureEstimee(gh(corps)) ?? '', /heure-estimee/, corps);
  }
});

test('estimated time: decoys pass', () => {
  for (const corps of ['déployé à 14:32', 'deployed at 14:32:07Z', 'around 30 tests fail', 'vers la fin du sprint', 'about 3 files changed']) {
    assert.equal(heureEstimee(gh(corps)), null, corps);
  }
  // Not a published text: a local command, a code block, another tool.
  assert.equal(heureEstimee({ tool_name: 'Bash', tool_input: { command: 'echo "vers 14h30"' } }), null);
  assert.equal(heureEstimee(gh('log:\n```\nvers 14h30\n```\ndone')), null);
  assert.equal(heureEstimee({ tool_name: 'Read', tool_input: { file_path: 'vers 14h30' } }), null);
});

test('estimated time: warn by default, deny when the mode says block', () => {
  const entree = { ...gh('deployed around 2:30'), cwd: os.tmpdir() };
  const averti = lancer('heure-estimee.mjs', entree).sortie.hookSpecificOutput;
  assert.equal(averti.permissionDecision, undefined, 'warn mode does not decide');
  assert.match(averti.additionalContext, /^Warning \(not blocked\)/);
  const bloque = lancer('heure-estimee.mjs', entree, { CLAUDE_PLUGIN_OPTION_GARDES: 'bloquer' }).sortie.hookSpecificOutput;
  assert.equal(bloque.permissionDecision, 'deny');
});

test('mode: user option first, then the project file, then warn', () => {
  const d = projet({ gardes: 'bloquer' });
  const sauve = process.env.CLAUDE_PLUGIN_OPTION_GARDES;
  try {
    delete process.env.CLAUDE_PLUGIN_OPTION_GARDES;
    assert.equal(mode(d), 'bloquer');
    assert.equal(mode(os.tmpdir()), 'avertir');
    process.env.CLAUDE_PLUGIN_OPTION_GARDES = 'avertir';
    assert.equal(mode(d), 'avertir');
    process.env.CLAUDE_PLUGIN_OPTION_GARDES = 'nonsense';
    assert.equal(mode(d), 'bloquer', 'an invalid option falls back to the project');
  } finally {
    if (sauve === undefined) delete process.env.CLAUDE_PLUGIN_OPTION_GARDES; else process.env.CLAUDE_PLUGIN_OPTION_GARDES = sauve;
  }
});

// ---------------------------------------------------------------- etat-apres-arret

const saisie = { type: 'user', message: { content: 'go' } };
const texte = (t) => ({ type: 'assistant', message: { content: [{ type: 'text', text: t }] } });
const outil = (commande) => ({ type: 'assistant', message: { content: [{ type: 'tool_use', name: 'Bash', input: { command: commande } }] } });

test('after stop: a "stopped" claim without a process listing is flagged', () => {
  assert.match(apresArret([saisie, texte('Le script de fusion est arrêté.')]), /without listing live processes/);
  assert.match(apresArret([saisie, texte('The watcher process has been killed.')]), /without listing live processes/);
  assert.match(apresArret([saisie], 'I stopped the background task.'), /without listing live processes/);
  assert.match(apresArret([saisie, texte('The PR is still open.')]), /without reading it/);
  assert.match(apresArret([saisie, texte('Rien n’est fusionné.')]), /without reading it/);
});

test('after stop: decoys pass', () => {
  // The claim is backed by a reading in the same reply.
  assert.equal(apresArret([saisie, outil('ps -ef | grep fusion'), texte('Le script de fusion est arrêté.')]), null);
  assert.equal(apresArret([saisie, outil('Get-Process node'), texte('The watcher process has been killed.')]), null);
  assert.equal(apresArret([saisie, outil('gh pr view 12 --json state'), texte('The PR is still open.')]), null);
  // No claim at all.
  assert.equal(apresArret([saisie, texte('The tests pass and the file is written.')]), null);
  assert.equal(apresArret([saisie, texte('Stop words are filtered before indexing.')]), null);
  // A reading from an EARLIER reply does not count for this one.
  assert.match(apresArret([saisie, outil('ps -ef'), texte('ok'), saisie, texte('The script is stopped.')]), /without listing/);
  // One reading does not cover the other claim.
  assert.match(apresArret([saisie, outil('ps -ef'), texte('The job is stopped and the PR is still open.')]), /without reading it/);
});

test('after stop: as a process, warns by default, blocks on option, never loops', () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'carnet-stop-'));
  const transcript = path.join(d, 't.jsonl');
  fs.writeFileSync(transcript, [saisie, texte('The script is stopped.')].map((e) => JSON.stringify(e)).join('\n'));
  const entree = { transcript_path: transcript, cwd: d };
  assert.match(lancer('etat-apres-arret.mjs', entree).sortie.hookSpecificOutput.additionalContext, /Warning \(not blocked\)/);
  const bloque = lancer('etat-apres-arret.mjs', entree, { CLAUDE_PLUGIN_OPTION_GARDES: 'bloquer' }).sortie;
  assert.equal(bloque.decision, 'block');
  assert.ok(bloque.reason.length > 20);
  assert.equal(lancer('etat-apres-arret.mjs', { ...entree, stop_hook_active: true }, { CLAUDE_PLUGIN_OPTION_GARDES: 'bloquer' }).sortie, null);
  assert.equal(lancer('etat-apres-arret.mjs', { transcript_path: path.join(d, 'absent.jsonl') }).sortie, null, 'a missing transcript never breaks the stop');
});

// ---------------------------------------------------------------- session-start

test('session start: prints the state and the alerts, nothing outside a project', () => {
  const d = projet();
  const sortie = contexte(d, T0);
  assert.match(sortie, /\[carnet\] Project state \(\.carnet\/ETAT\.md\)/);
  assert.match(sortie, /## Heading/);
  assert.doesNotMatch(sortie, /alert\(s\)/, 'a fresh project has no alert');
  const config = lireConfig(d);
  ajouter(d, config, { famille: 'tache-de-fond', titre: 'a' }, T0);
  ajouter(d, config, { famille: 'tache-de-fond', titre: 'b' }, T0);
  assert.match(contexte(d, T0), /1 alert\(s\):\n- Family tache-de-fond seen 2 times/);
  const hors = lancer('session-start.mjs', { cwd: os.tmpdir(), source: 'startup' });
  assert.deepEqual([hors.code, hors.brut], [0, '']);
  const r = spawnSync(process.execPath, [path.join(HOOKS, 'session-start.mjs')], { input: JSON.stringify({ cwd: d }), encoding: 'utf8' });
  assert.match(r.stdout, /\[carnet\] Project state/);
});

test('session start: a state longer than the context cap is cut here, with a pointer', () => {
  const d = projet();
  fs.writeFileSync(path.join(d, '.carnet', 'ETAT.md'), `# State\n\n${'mot '.repeat(3500)}\nFIN-DU-FICHIER\n`);
  const sortie = contexte(d, T0);
  assert.ok(sortie.length <= 10000, `injected context is ${sortie.length} characters`);
  assert.ok(sortie.length <= PLAFOND + 600);
  assert.match(sortie, /read the file for the rest/);
  assert.doesNotMatch(sortie, /FIN-DU-FICHIER/);
});
