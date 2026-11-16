// Installer tests: fresh target, relaunch, update with backup, path with a
// space, a link left alone. Skipped when no usable bash is on the PATH (on
// Windows, `bash` may resolve to the WSL launcher with no distribution).

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bashUtilisable = spawnSync('bash', ['-c', 'echo ok'], { encoding: 'utf8' }).stdout?.trim() === 'ok';
const versPosix = (p) => p.replace(/\\/g, '/').replace(/^([A-Za-z]):/, (_, l) => `/${l.toLowerCase()}`);

function installer(...args) {
  const r = spawnSync('bash', [versPosix(path.join(RACINE, 'installer.sh')), ...args], { encoding: 'utf8' });
  return { code: r.status, sortie: r.stdout + r.stderr };
}

const SKILLS = ['carnet-cloture', 'carnet-erreur', 'carnet-init', 'carnet-reprise'];

test('installer: simulation writes nothing, a real run adds, a relaunch changes nothing', { skip: !bashUtilisable }, () => {
  const cible = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'carnet inst ')), 'skills');
  const sim = installer('--simulation', '--cible', versPosix(cible));
  assert.equal(sim.code, 0, sim.sortie);
  assert.match(sim.sortie, /Simulation: nothing written/);
  assert.equal(fs.existsSync(cible), false);

  const reel = installer('--cible', versPosix(cible));
  assert.equal(reel.code, 0, reel.sortie);
  assert.deepEqual(fs.readdirSync(cible).sort(), SKILLS);
  assert.equal(
    fs.readFileSync(path.join(cible, 'carnet-init', 'SKILL.md'), 'utf8'),
    fs.readFileSync(path.join(RACINE, 'skills', 'carnet-init', 'SKILL.md'), 'utf8'),
    'copied as is, not rewritten',
  );

  const relance = installer('--cible', versPosix(cible));
  assert.equal(relance.code, 0);
  assert.equal((relance.sortie.match(/already up to date/g) ?? []).length, SKILLS.length);
  assert.equal(fs.existsSync(path.join(path.dirname(cible), 'sauvegardes')), false, 'no backup when nothing changed');
});

test('installer: an edited skill is backed up outside the skills folder, then replaced', { skip: !bashUtilisable }, () => {
  const cible = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'carnet-maj-')), 'skills');
  installer('--cible', versPosix(cible));
  fs.writeFileSync(path.join(cible, 'carnet-init', 'SKILL.md'), 'edited by hand\n');
  const r = installer('--cible', versPosix(cible));
  assert.equal(r.code, 0, r.sortie);
  const sauvegardes = path.join(path.dirname(cible), 'sauvegardes');
  const [horodatage] = fs.readdirSync(sauvegardes);
  assert.equal(fs.readFileSync(path.join(sauvegardes, horodatage, 'carnet-init', 'SKILL.md'), 'utf8'), 'edited by hand\n');
  assert.notEqual(fs.readFileSync(path.join(cible, 'carnet-init', 'SKILL.md'), 'utf8'), 'edited by hand\n');
  assert.deepEqual(fs.readdirSync(cible).sort(), SKILLS, 'the backup is not inside the scanned folder');
});

test('installer: refuses to guess a target, and an unknown option', { skip: !bashUtilisable }, () => {
  assert.equal(installer().code, 1);
  assert.equal(installer('--tout').code, 1);
  assert.equal(installer('--profil').code, 1);
});

test('installer: a target that is a link is left alone and reported by the exit code', { skip: !bashUtilisable }, (t) => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'carnet-lien-'));
  const cible = path.join(base, 'skills');
  const ailleurs = path.join(base, 'ailleurs');
  fs.mkdirSync(cible);
  fs.mkdirSync(ailleurs);
  fs.writeFileSync(path.join(ailleurs, 'temoin.txt'), 'untouched\n');
  try {
    fs.symlinkSync(ailleurs, path.join(cible, 'carnet-init'), 'junction');
  } catch {
    return t.skip('cannot create a link here');
  }
  const r = installer('--cible', versPosix(cible));
  assert.equal(r.code, 3, r.sortie);
  assert.match(r.sortie, /carnet-init: a link/);
  assert.deepEqual(fs.readdirSync(ailleurs), ['temoin.txt'], 'nothing was written through the link');
});
