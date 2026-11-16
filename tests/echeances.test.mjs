// Deadline reading. The decoys matter as much as the hits: a tool that lists every dated line as
// late teaches its reader to ignore it.

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { datesDe, lire, rapport } from '../lib/echeances.mjs';
import { appliquer, planifier } from '../lib/init.mjs';

const J = '2026-11-16';
const etat = (lignes, titre = '## Commitments') => ['# State', '', '## In progress', '', '- shipped the fix on 2026-11-16', '- planned for 2026-11-30', '', titre, '', 'Promises, with who and by when.', '', ...lignes, '', '## Next', '', '- 2026-11-10: not a commitment'].join('\n');
const textes = (xs) => xs.map((e) => e.texte);

test('dates: ISO, day-first, with and without a year; impossible dates are ignored', () => {
  assert.deepEqual(datesDe('- due 2026-11-17, was 05/11/2026 then 18/11', J), ['2026-11-17', '2026-11-05', '2026-11-18']);
  assert.deepEqual(datesDe('- version 13/45, ratio 3/4/5, id 2026-13-40', J), []);
  assert.deepEqual(datesDe('- no date here, v1.2.3', J), []);
});

test('a date without a year takes the year closest to today, across new year', () => {
  assert.deepEqual(datesDe('- 28/12', '2027-01-03'), ['2026-12-28']);
  assert.deepEqual(datesDe('- 05/01', '2026-12-28'), ['2027-01-05']);
});

test('sorted into today, tomorrow, past, next seven days; beyond the horizon is left out', () => {
  const r = lire(etat(['- A to Sam by 2026-11-16', '- B by 17/11', '- C by 2026-11-10', '- D by 2026-11-14', '- E by 2026-11-20', '- F by 2026-12-25']), J);
  assert.deepEqual(textes(r.jour), ['A to Sam by 2026-11-16']);
  assert.deepEqual(textes(r.demain), ['B by 17/11']);
  assert.deepEqual(textes(r.depassees), ['D by 2026-11-14', 'C by 2026-11-10']);
  assert.deepEqual(textes(r.a_venir), ['E by 2026-11-20']);
  assert.equal(r.section, 'Commitments');
});

test('closed by how the line starts is not shown; "partly done" and "not done" stay open', () => {
  const r = lire(etat(['- [x] A by 2026-11-10', '- Done: B by 2026-11-10', '- ~~C by 2026-11-10~~', '- Tenu : D le 10/11', '- Annulé, E du 10/11',
    '- [ ] F by 2026-11-10', '- Not done: G by 2026-11-10', '- Partly done, H by 2026-11-10', '- Doneness review by 2026-11-10']), J);
  assert.equal(r.closes, 5);
  assert.equal(r.depassees.length, 4);
});

test('relative dates and undated items are listed apart, never guessed', () => {
  const r = lire(etat(['- A to Sam on Tuesday', '- B demain matin', '- C someday', '- (nothing yet)']), J);
  assert.deepEqual(textes(r.relatives), ['A to Sam on Tuesday', 'B demain matin']);
  assert.equal(r.sans_date.length, 2);
  assert.equal(r.jour.length + r.demain.length + r.depassees.length, 0);
});

test('outside the section: only mentions of today or tomorrow, never "late"', () => {
  const r = lire(etat(['- A by 2026-11-20']), J);
  assert.deepEqual(textes(r.mentions), ['shipped the fix on 2026-11-16']);
  assert.equal(r.depassees.length, 0); // "2026-11-10: not a commitment" under ## Next is not a deadline
});

test('the section is found in French, at any level, and ends at the next heading of its level', () => {
  const r = lire(etat(['- A pour le 14/11', '### Envers la cliente', '- B pour le 15/11'], '## Engagements et échéances'), J);
  assert.equal(r.depassees.length, 2);
  assert.equal(r.section, 'Engagements et échéances');
});

test('a table row counts as an item; its separator and header do not', () => {
  const r = lire(etat(['| To | What | By |', '|---|---|---|', '| Sam | the report | 2026-11-17 |']), J);
  assert.deepEqual(textes(r.demain), ['Sam | the report | 2026-11-17 |']);
  assert.equal(r.sans_date.length, 1); // the header row: undated, shown as such rather than hidden
});

test('no commitments heading: the report says so instead of printing zeros', () => {
  const r = lire('# State\n\n## Next\n\n- A by 2026-11-10\n', J);
  assert.equal(r.section, null);
  assert.match(rapport(r, 'ETAT.md'), /no heading names commitments/);
});

test('the report warns that a past date may only be cited, and that the file is not the fact', () => {
  const texte = rapport(lire(etat(['- Meeting cancelled on 13/11: to reschedule']), J), 'ETAT.md');
  assert.match(texte, /DATED IN THE PAST.*or only a date the line cites.*: 1/);
  assert.match(texte, /\(3 d ago\)/);
  assert.match(texte, /check each line above at its source/);
});

test('command line: reads the project state, takes --aujourdhui, refuses a malformed date', () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'carnet echeances '));
  appliquer(planifier(d, { fuseau: 'Europe/Paris', agents: 'claude' }));
  fs.writeFileSync(path.join(d, '.carnet', 'ETAT.md'), etat(['- A by 2026-11-17']));
  const carnet = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'bin', 'carnet.mjs');
  const sortie = execFileSync(process.execPath, [carnet, 'echeances', '--aujourdhui', J], { cwd: d, encoding: 'utf8' });
  assert.match(sortie, /TOMORROW: 1\n {2}L\d+ {2}A by 2026-11-17/);
  assert.throws(() => execFileSync(process.execPath, [carnet, 'echeances', '--aujourdhui', '16/11/2026'], { cwd: d, stdio: 'pipe' }), /YYYY-MM-DD/);
  fs.rmSync(d, { recursive: true, force: true });
});
