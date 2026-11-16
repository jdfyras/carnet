// `decouper` tests. The property that matters most is conservation: whatever
// the input looks like, every line comes out exactly once, and the source is
// never touched.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { decouper, ecrire, fichierJournal, rapport } from '../lib/decouper.mjs';

const EXEMPLE = [
  '# State',
  '',
  'Intro line.',
  '',
  '## Session A',
  '',
  '- 28/10 09:00 (tool) : first entry',
  '  continuation of the first entry',
  '- 06/11 16:15 (tool) : second entry',
  '- an undated bullet that is still state',
  '',
  '## Commitments',
  '',
  '| Who | What | When |',
  '|---|---|---|',
  '| the client | sample file | 15/11 |',
  '- 15/11 : deadline for the sample file',
  '',
  '## Session B',
  '',
  '- 2026-11-07 10:00 — iso entry',
  '* 07/11/2026 star bullet entry',
  '- 99/99 not a date',
  'Prose mentioning 06/11 16:15 in the middle.',
  '',
].join('\n');

test('dated entries go to the journal by month, everything else stays, and nothing is lost', () => {
  const r = decouper(EXEMPLE, { annee: 2026 });
  assert.equal(r.preuve.conserve, true);
  assert.deepEqual([...r.journal.keys()].sort(), ['2026-10', '2026-11']);
  const octobre = r.journal.get('2026-10').flatMap((b) => b.lignes);
  assert.deepEqual(octobre, ['- 28/10 09:00 (tool) : first entry', '  continuation of the first entry'], 'an entry keeps its continuation lines');
  const novembre = r.journal.get('2026-11').flatMap((b) => b.lignes);
  assert.equal(novembre.length, 4);
  assert.ok(novembre.includes('* 07/11/2026 star bullet entry') && novembre.includes('- 2026-11-07 10:00 — iso entry'));
  for (const garde of ['- an undated bullet that is still state', '- 99/99 not a date', 'Prose mentioning 06/11 16:15 in the middle.', '| the client | sample file | 15/11 |', '## Session A']) {
    assert.ok(r.reste.includes(garde), `stays in the state: ${garde}`);
  }
  assert.equal(r.mesures.entrees, 5);
});

test('a section named as state keeps its dated bullets: a deadline is not history', () => {
  const sans = decouper(EXEMPLE, { annee: 2026 });
  assert.equal(sans.reste.includes('- 15/11 : deadline for the sample file'), false);
  const avec = decouper(EXEMPLE, { annee: 2026, sectionsEtat: ['commitments'] });
  assert.ok(avec.reste.includes('- 15/11 : deadline for the sample file'));
  assert.equal(avec.mesures.entrees, 4);
  assert.equal(avec.preuve.conserve, true);
});

test('--garder leaves the most recent entries of each section in the state', () => {
  const r = decouper(EXEMPLE, { annee: 2026, garder: 1 });
  assert.ok(r.reste.includes('- 06/11 16:15 (tool) : second entry'), 'most recent of Session A stays');
  assert.equal(r.reste.includes('- 28/10 09:00 (tool) : first entry'), false);
  assert.equal(r.preuve.conserve, true);
});

test('conservation holds on awkward inputs', () => {
  const cas = [
    '',
    '\n',
    'no heading, no entry',
    '- 01/01 only an entry',
    '- 01/01 a\n- 01/01 a\n- 01/01 a\n', // duplicates must be counted, not merged
    '## T\r\n- 05/11 crlf entry\r\n  more\r\n\r\ntext\r\n',
    `## Long\n- 06/11 ${'x'.repeat(5000)}\n`,
    '- 06/11 entry\n\n  indented after a blank line is not a continuation\n',
  ];
  for (const texte of cas) {
    const r = decouper(texte, { annee: 2026 });
    assert.equal(r.preuve.conserve, true, JSON.stringify(texte.slice(0, 40)));
    assert.equal(r.preuve.lignes_entree, r.preuve.lignes_sortie);
  }
  const doublons = decouper('- 01/01 a\n- 01/01 a\n- 01/01 a\n', { annee: 2026 });
  assert.equal(doublons.mesures.entrees, 3);
  const apresVide = decouper('- 06/11 entry\n\n  indented after a blank line is not a continuation\n', { annee: 2026 });
  assert.ok(apresVide.reste.includes('  indented after a blank line is not a continuation'));
});

test('a year is required, and the report says when the remainder is still over budget', () => {
  assert.throws(() => decouper(EXEMPLE, {}), /default year is required/);
  assert.throws(() => decouper(EXEMPLE, { annee: NaN }), /default year is required/);
  const r = decouper(EXEMPLE, { annee: 2026 });
  assert.match(rapport(r, 10), /still \d+\.\dx the state budget/);
  assert.match(rapport(r, 100000), /fits the state budget/);
  assert.match(rapport(r, 100000), /Conservation: \d+\/\d+ lines, identical fingerprint/);
});

test('writing: new files only, the source untouched, a second run refused, CRLF preserved', () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'carnet-decouper-'));
  const source = path.join(d, 'ETAT.md');
  const texte = EXEMPLE.replace(/\n/g, '\r\n');
  fs.writeFileSync(source, texte);
  const r = decouper(fs.readFileSync(source, 'utf8'), { annee: 2026 });
  const sortie = path.join(d, 'decoupe');
  const ecrits = ecrire(r, sortie, 'ETAT.md');
  assert.equal(fs.readFileSync(source, 'utf8'), texte, 'the source is never edited');
  assert.deepEqual(ecrits.map((p) => path.relative(sortie, p).replace(/\\/g, '/')), ['ETAT.reste.md', 'journal/2026-10.md', 'journal/2026-11.md']);
  const reste = fs.readFileSync(path.join(sortie, 'ETAT.reste.md'), 'utf8');
  assert.ok(reste.includes('\r\n') && !/[^\r]\n/.test(reste), 'line endings preserved');
  assert.throws(() => ecrire(r, sortie, 'ETAT.md'), /already exists: nothing written/);
  const journal = fichierJournal('2026-11', r.journal.get('2026-11'), 'ETAT.md');
  assert.match(journal, /^# Journal 2026-11\n/);
  assert.match(journal, /## Session A\n\n- 06\/11 16:15/);
  assert.match(journal, /## Session B\n\n- 2026-11-07/);
});
