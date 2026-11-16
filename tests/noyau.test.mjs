// Core library tests. Each guard is broken on purpose at least once: a check
// that has never refused has proved nothing, and one that refuses everything
// has proved nothing either.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { DEFAUTS, ErreurCarnet, lireConfig, trouverRacine } from '../lib/racine.mjs';
import { joursEntre, maintenant } from '../lib/heure.mjs';
import { compterQuestions, mesurer } from '../lib/budget.mjs';
import { COPIES_GARDEES, ecrireEtat, noter } from '../lib/etat.mjs';
import { ajouter, ajouterFamille, compter, marquerRegle, normaliserNom } from '../lib/erreurs.mjs';
import { marquerRevue, sante } from '../lib/sante.mjs';
import { appliquer, planifier } from '../lib/init.mjs';

const T0 = new Date('2026-11-16T10:00:00Z');
const jour = (n) => new Date(T0.getTime() + n * 86400000);

function projet(options = {}) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'carnet avec espace '));
  appliquer(planifier(d, { fuseau: 'Europe/Paris', agents: 'claude', ...options }, T0));
  return { d, config: lireConfig(d) };
}

function instantane(dossier) {
  const sortie = {};
  const parcourir = (courant) => {
    for (const nom of fs.readdirSync(courant).sort()) {
      const complet = path.join(courant, nom);
      if (fs.statSync(complet).isDirectory()) parcourir(complet);
      else sortie[path.relative(dossier, complet)] = fs.readFileSync(complet, 'utf8');
    }
  };
  parcourir(dossier);
  return sortie;
}

// ---------------------------------------------------------------- racine, heure

test('root is found from a nested folder, and absent outside a project', () => {
  const { d } = projet();
  const profond = path.join(d, 'a', 'b');
  fs.mkdirSync(profond, { recursive: true });
  assert.equal(trouverRacine(profond), d);
  assert.equal(trouverRacine(os.tmpdir()), null);
});

test('a malformed config is an error, never a silent default', () => {
  const { d } = projet();
  fs.writeFileSync(path.join(d, '.carnet', 'carnet.json'), '{ not json');
  assert.throws(() => lireConfig(d), ErreurCarnet);
  fs.writeFileSync(path.join(d, '.carnet', 'carnet.json'), '{"gardes":"parfois"}');
  assert.throws(() => lireConfig(d), /avertir/);
});

test('time is computed in the given zone, and an unknown zone is refused', () => {
  const p = maintenant('Europe/Paris', new Date('2026-11-16T00:30:00Z'));
  assert.deepEqual([p.date, p.heure, p.jour], ['2026-11-16', '01:30', 'Monday']);
  // Same instant, another zone, another calendar day: the zone is really used.
  assert.equal(maintenant('America/Los_Angeles', new Date('2026-11-16T00:30:00Z')).date, '2026-11-15');
  assert.throws(() => maintenant('Mars/Olympus'), /Unknown time zone/);
  assert.equal(joursEntre('2026-11-10', '2026-11-16'), 6);
});

// ---------------------------------------------------------------- budget, état

test('budget: 14 KB passes, 16 KB is refused and nothing is written', () => {
  const { d, config } = projet();
  ecrireEtat(d, config, `# State\n\n${'a'.repeat(14000)}\n`, T0);
  const avant = fs.readFileSync(path.join(d, '.carnet', 'ETAT.md'), 'utf8');
  assert.throws(() => ecrireEtat(d, config, `# State\n\n${'a'.repeat(16000)}\n`, T0), /budget 15000/);
  assert.equal(fs.readFileSync(path.join(d, '.carnet', 'ETAT.md'), 'utf8'), avant, 'refused write left the file untouched');
});

test('budget report flags a file grown by hand past its budget', () => {
  const { d, config } = projet();
  assert.equal(mesurer(d, config).some((r) => r.depasse), false);
  fs.writeFileSync(path.join(d, '.carnet', 'ETAT.md'), 'x'.repeat(DEFAUTS.budgets.etat_octets + 1));
  const etat = mesurer(d, config).find((r) => r.fichier.endsWith('ETAT.md'));
  assert.equal(etat.depasse, true);
  fs.writeFileSync(path.join(d, 'AGENTS.md'), 'ligne\n'.repeat(201));
  assert.equal(mesurer(d, config).find((r) => r.fichier === 'AGENTS.md' && r.mesure === 'lines').depasse, true);
});

test('open questions are counted by heading, and the count is budgeted', () => {
  assert.equal(compterQuestions('# To decide\n\ntext with ## inline\n\n## One\n\n## Two\n'), 2);
  const { d, config } = projet();
  fs.appendFileSync(path.join(d, '.carnet', 'decisions', 'a-trancher.md'), '\n## Q\n'.repeat(16));
  assert.equal(mesurer(d, config).find((r) => r.mesure === 'open questions').depasse, true);
});

test('state is rewritten, stamped, and previous copies stay bounded', () => {
  const { d, config } = projet();
  for (let i = 0; i < COPIES_GARDEES + 5; i += 1) {
    ecrireEtat(d, config, `# State\n\nversion ${i}\n`, new Date(T0.getTime() + i * 1000));
  }
  const contenu = fs.readFileSync(path.join(d, '.carnet', 'ETAT.md'), 'utf8');
  assert.match(contenu, /^<!-- carnet: updated 2026-11-16 11:00 \(Europe\/Paris\) -->\n# State/);
  assert.match(contenu, /version 14/);
  assert.doesNotMatch(contenu, /version 13/, 'rewritten, not appended');
  assert.equal(fs.readdirSync(path.join(d, '.carnet.local', 'copies')).length, COPIES_GARDEES);
  // Rewriting what was just read back does not stack stamps.
  ecrireEtat(d, config, contenu, jour(1));
  assert.equal(fs.readFileSync(path.join(d, '.carnet', 'ETAT.md'), 'utf8').match(/carnet: updated/g).length, 1);
});

test('journal: the tool sets the date, a typed date is refused, months rotate by file', () => {
  const { d, config } = projet();
  assert.equal(noter(d, config, 'first note', T0).ligne, '- 2026-11-16 11:00 — first note');
  assert.throws(() => noter(d, config, '2026-11-16 something', T0), /must not start with a date/);
  assert.throws(() => noter(d, config, '16/11 quelque chose', T0), /must not start with a date/);
  assert.throws(() => noter(d, config, '   ', T0), /Empty/);
  noter(d, config, 'next month', new Date('2026-12-02T10:00:00Z'));
  assert.deepEqual(fs.readdirSync(path.join(d, '.carnet', 'journal')).sort(), ['2026-11.md', '2026-12.md']);
});

// ---------------------------------------------------------------- erreurs

test('families: closed list, variants resolve, a free label is refused', () => {
  const { d, config } = projet();
  assert.equal(normaliserNom('Preuve Non_rejouée'), 'preuve-non-rejouee');
  assert.equal(ajouter(d, config, { famille: 'proof-not-replayed', titre: 'A' }, T0).famille, 'preuve-non-rejouee');
  assert.throws(() => ajouter(d, config, { famille: 'autre: truc', titre: 'B' }, T0), /Unknown family/);
  assert.throws(() => ajouter(d, config, { famille: 'preuve-non-rejouee', titre: ' ' }, T0), /title is required/);
  assert.equal(ajouterFamille(d, 'Nouvelle Famille', 'something new'), 'nouvelle-famille');
  assert.throws(() => ajouterFamille(d, 'nouvelle famille', 'again'), /already exists/);
});

test('thresholds: two occurrences propose a rule; back after the rule changes the form; three is red', () => {
  const { d, config } = projet();
  const f = 'affirmation-sans-source';
  const action = () => compter(d).familles.find((x) => x.nom === f)?.action ?? null;
  ajouter(d, config, { famille: f, titre: 'one' }, jour(0));
  assert.equal(action(), null, 'one occurrence asks for nothing');
  ajouter(d, config, { famille: f, titre: 'two' }, jour(1));
  assert.equal(action(), 'propose-a-rule');
  marquerRegle(d, config, f, null, jour(2));
  assert.equal(action(), null, 'entries dated before the rule do not count against it');
  ajouter(d, config, { famille: f, titre: 'same day as the rule' }, jour(2));
  assert.equal(action(), null, 'the day of the rule is not after the rule');
  ajouter(d, config, { famille: f, titre: 'three' }, jour(3));
  assert.equal(action(), 'change-the-form');
  ajouter(d, config, { famille: f, titre: 'four' }, jour(4));
  ajouter(d, config, { famille: f, titre: 'five' }, jour(5));
  assert.equal(action(), 'red');
});

test('an entry with an unknown family is reported, not silently skipped', () => {
  const { d, config } = projet();
  ajouter(d, config, { famille: 'secret-affiche', titre: 'ok' }, T0);
  fs.writeFileSync(path.join(d, '.carnet.local', 'erreurs', 'z-main.md'), '---\nid: z\ndate: 2026-11-16\nfamille: invente\n---\n');
  fs.writeFileSync(path.join(d, '.carnet.local', 'erreurs', 'z-sans-entete.md'), 'no frontmatter');
  const compte = compter(d);
  assert.deepEqual(compte.inconnues, ['z-main.md', 'z-sans-entete.md']);
  assert.equal(compte.familles.find((x) => x.nom === 'secret-affiche').occurrences, 1);
});

test('entries are private: written under the git-ignored folder only', () => {
  const { d, config } = projet();
  const r = ajouter(d, config, { famille: 'secret-affiche', titre: 'private' }, T0);
  assert.ok(r.chemin.includes(`${path.sep}.carnet.local${path.sep}erreurs${path.sep}`));
  assert.match(fs.readFileSync(path.join(d, '.gitignore'), 'utf8'), /^\.carnet\.local\/$/m);
  assert.equal(fs.existsSync(path.join(d, '.carnet', 'erreurs', path.basename(r.chemin))), false);
});

// ---------------------------------------------------------------- santé

test('health: an overdue review, an exceeded budget and a threshold each raise an alert', () => {
  const { d, config } = projet();
  assert.deepEqual(sante(d, config, jour(1)).alertes, [], 'a fresh project has no alert');
  assert.match(sante(d, config, jour(9)).alertes.join('\n'), /Review overdue by 2 day/);
  marquerRevue(d, config, 'looked at it', jour(9));
  assert.deepEqual(sante(d, config, jour(10)).alertes, [], 'a recorded review resets the clock');
  fs.writeFileSync(path.join(d, '.carnet', 'ETAT.md'), 'x'.repeat(20000));
  ajouter(d, config, { famille: 'tache-de-fond', titre: 'a' }, jour(10));
  ajouter(d, config, { famille: 'tache-de-fond', titre: 'b' }, jour(10));
  const alertes = sante(d, config, jour(10)).alertes.join('\n');
  assert.match(alertes, /ETAT\.md is over budget/);
  assert.match(alertes, /tache-de-fond seen 2 times with no rule/);
});

// ---------------------------------------------------------------- init

test('init on an empty folder: a second run changes nothing', () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'carnet-init-'));
  const ecrits = appliquer(planifier(d, { fuseau: 'Europe/Paris' }, T0));
  assert.ok(ecrits.includes('.carnet/carnet.json') && ecrits.includes('AGENTS.md') && ecrits.includes('CLAUDE.md'));
  assert.equal(fs.readFileSync(path.join(d, 'CLAUDE.md'), 'utf8'), '@AGENTS.md\n');
  const avant = instantane(d);
  const plan2 = planifier(d, { fuseau: 'Europe/Paris' }, jour(3));
  assert.ok(plan2.actions.every((a) => a.action === 'adopter'));
  assert.deepEqual(appliquer(plan2), []);
  assert.deepEqual(instantane(d), avant, 'idempotent: byte-identical tree');
});

test('init on an existing project overwrites nothing and proposes next to conflicts', () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'carnet-existant-'));
  fs.writeFileSync(path.join(d, 'AGENTS.md'), '# Mine\n\nMy own rules.\n');
  fs.writeFileSync(path.join(d, 'CLAUDE.md'), 'My Claude notes.\n');
  fs.writeFileSync(path.join(d, '.gitignore'), 'node_modules');
  const avant = instantane(d);
  const plan = planifier(d, { fuseau: 'Europe/Paris' }, T0);
  const parChemin = Object.fromEntries(plan.actions.map((a) => [a.chemin, a.action]));
  assert.equal(parChemin['AGENTS.md'], 'conflit');
  assert.equal(parChemin['CLAUDE.md'], 'conflit');
  assert.equal(parChemin['.gitignore'], 'completer');
  assert.deepEqual(instantane(d), avant, 'planning reads only');
  appliquer(plan);
  assert.equal(fs.readFileSync(path.join(d, 'AGENTS.md'), 'utf8'), avant['AGENTS.md']);
  assert.equal(fs.readFileSync(path.join(d, 'CLAUDE.md'), 'utf8'), avant['CLAUDE.md']);
  assert.match(fs.readFileSync(path.join(d, 'AGENTS.md.propose'), 'utf8'), /carnet:debut/);
  assert.equal(fs.readFileSync(path.join(d, '.gitignore'), 'utf8'), 'node_modules\n.carnet.local/\n');
  // Once the user has merged the block and the import, the conflicts are gone.
  fs.appendFileSync(path.join(d, 'AGENTS.md'), fs.readFileSync(path.join(d, 'AGENTS.md.propose'), 'utf8'));
  fs.appendFileSync(path.join(d, 'CLAUDE.md'), '@AGENTS.md\n');
  const plan2 = planifier(d, { fuseau: 'Europe/Paris' }, T0);
  assert.ok(plan2.actions.every((a) => a.action === 'adopter'));
});

test('init for Codex copies the same skill text, without rewriting a word', () => {
  const source = fs.mkdtempSync(path.join(os.tmpdir(), 'carnet-skills-'));
  fs.mkdirSync(path.join(source, 'reprise', 'references'), { recursive: true });
  const texte = '---\nname: reprise\ndescription: x\n---\nClaude and Codex both read this. ~/.claude stays ~/.claude.\n';
  fs.writeFileSync(path.join(source, 'reprise', 'SKILL.md'), texte);
  fs.writeFileSync(path.join(source, 'reprise', 'references', 'a.md'), 'ref\n');
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'carnet-codex-'));
  appliquer(planifier(d, { fuseau: 'Europe/Paris', agents: 'claude,codex', skills: source }, T0));
  assert.equal(fs.readFileSync(path.join(d, '.agents', 'skills', 'reprise', 'SKILL.md'), 'utf8'), texte);
  assert.equal(fs.readFileSync(path.join(d, '.agents', 'skills', 'reprise', 'references', 'a.md'), 'utf8'), 'ref\n');
  // A local edit is a conflict, not something to overwrite.
  fs.writeFileSync(path.join(d, '.agents', 'skills', 'reprise', 'SKILL.md'), 'edited by hand\n');
  const plan = planifier(d, { fuseau: 'Europe/Paris', agents: 'claude,codex', skills: source }, T0);
  assert.equal(plan.actions.find((a) => a.chemin.endsWith('reprise/SKILL.md')).action, 'conflit');
  appliquer(plan);
  assert.equal(fs.readFileSync(path.join(d, '.agents', 'skills', 'reprise', 'SKILL.md'), 'utf8'), 'edited by hand\n');
});

test('init refuses bad options before planning anything', () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'carnet-opt-'));
  assert.throws(() => planifier(d, { fuseau: 'Nowhere/Land' }), /Unknown time zone/);
  assert.throws(() => planifier(d, { agents: 'claude,gemini' }), /Unknown agent/);
  assert.throws(() => planifier(d, { gardes: 'parfois' }), /avertir/);
  assert.deepEqual(fs.readdirSync(d), []);
});
