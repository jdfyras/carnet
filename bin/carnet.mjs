#!/usr/bin/env node
// carnet: one entry point for the project notebook. Node only, no dependency.
//
// Exit codes: 0 success, 1 usage / validation / budget exceeded, 2 environment.

import fs from 'node:fs';
import { ErreurCarnet, exigerRacine, lireConfig } from '../lib/racine.mjs';
import { fuseauEffectif, maintenant, phrase } from '../lib/heure.mjs';
import { mesurer, rapport } from '../lib/budget.mjs';
import { cheminEtat, ecrireEtat, noter } from '../lib/etat.mjs';
import { ajouter, ajouterFamille, compter, lireFamilles, marquerRegle, rapportCompte } from '../lib/erreurs.mjs';
import { enregistrer, marquerRevue, rapportSante, sante } from '../lib/sante.mjs';
import { appliquer, planifier, rapportPlan, verifier } from '../lib/init.mjs';
import { decouper, ecrire as ecrireDecoupage, rapport as rapportDecoupage } from '../lib/decouper.mjs';
import { DEFAUTS } from '../lib/racine.mjs';

const AIDE = `carnet <command>

  init [--appliquer] [--verifier] [--fuseau <IANA>] [--agents claude,codex]
       [--tickets <url>] [--gardes avertir|bloquer]
                         plan what init would do (default), or write it
  heure                  the current date and time, from the tool
  etat [<file>|-]        rewrite .carnet/ETAT.md from a file or stdin; no argument: show its size
  noter "<line>"         append one dated line to this month's journal
  budget                 check size budgets; exit 1 if one is exceeded
  erreur familles        the closed list of families
  erreur ajouter --famille <f> --titre "<t>" [--corps <file>] [--recidive]
  erreur compter         counts per family and the action each threshold calls for
  erreur regle <f> [--forme "<what enforces it>"]   record that a family has a rule
  erreur famille <name> "<description>"             add a family (user's decision)
  sante [--json]         budgets, overdue review, families past a threshold
  revue [--notes <file>] record that a review happened today
  decouper <file> --annee <YYYY> [--garder <n>] [--etat "Commitments,Questions"] [--sortie <new folder>]
                         split an oversized state file into state and monthly journal;
                         simulation unless --sortie; the source is never edited
`;

function lireTexte(source) {
  const brut = source === '-' ? fs.readFileSync(0, 'utf8') : fs.readFileSync(source, 'utf8');
  return brut.replace(/^﻿/, '');
}

/** { _: positionals, name: value | true } */
function analyser(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const cle = a.slice(2);
      const suivant = argv[i + 1];
      if (suivant !== undefined && !suivant.startsWith('--')) { o[cle] = suivant; i += 1; } else o[cle] = true;
    } else o._.push(a);
  }
  return o;
}

function principal(argv) {
  const [commande, ...reste] = argv;
  const o = analyser(reste);
  if (!commande || commande === 'aide' || commande === '--help' || commande === '-h') return console.log(AIDE);

  if (commande === 'init') {
    const options = { fuseau: o.fuseau, agents: o.agents, tickets: o.tickets, gardes: o.gardes };
    const cible = o._[0] ?? process.cwd();
    if (o.verifier) {
      const manques = verifier(cible, options);
      console.log(manques.length ? manques.map((a) => `${a.action} ${a.chemin}`).join('\n') : 'Nothing missing.');
      return manques.length ? process.exit(1) : undefined;
    }
    const plan = planifier(cible, options);
    console.log(rapportPlan(plan));
    if (!o.appliquer) return console.log('\nSimulation: nothing written. Run again with --appliquer to write this plan.');
    const ecrits = appliquer(plan);
    return console.log(`\nWritten: ${ecrits.length ? ecrits.join(', ') : 'nothing (already initialised)'}.`);
  }

  if (commande === 'decouper') {
    // Works on any file, inside or outside an initialised project: it is how an old state file migrates.
    const source = o._[0];
    if (!source) throw new ErreurCarnet('Usage: carnet decouper <file> --annee <YYYY> [--garder <n>] [--sortie <new folder>]');
    const annee = Number(o.annee);
    const resultat = decouper(lireTexte(source), {
      annee: Number.isInteger(annee) && annee > 1999 ? annee : NaN,
      garder: Number(o.garder ?? 0),
      sectionsEtat: typeof o.etat === 'string' ? o.etat.split(',').map((s) => s.trim()) : [],
    });
    console.log(rapportDecoupage(resultat, DEFAUTS.budgets.etat_octets));
    if (typeof o.sortie !== 'string') return console.log('\nSimulation: nothing written. Add --sortie <new folder> to write the remainder and the journal there.');
    const ecrits = ecrireDecoupage(resultat, o.sortie, source);
    return console.log(`\nWritten (the source is untouched): ${ecrits.join(', ')}`);
  }

  if (commande === 'heure') {
    let config = {};
    try { config = lireConfig(exigerRacine()); } catch { /* outside a project: the machine's zone */ }
    return console.log(phrase(maintenant(fuseauEffectif(config))));
  }

  const racine = exigerRacine();
  const config = lireConfig(racine);

  switch (commande) {
    case 'etat': {
      if (!o._[0]) {
        const m = mesurer(racine, config).find((x) => x.fichier.endsWith('ETAT.md'));
        return console.log(m ? `${cheminEtat(racine)}: ${m.valeur} bytes (budget ${m.budget})` : 'No ETAT.md yet.');
      }
      const r = ecrireEtat(racine, config, lireTexte(o._[0]));
      return console.log(`State written: ${r.taille} bytes (budget ${r.budget}), ${r.parties.date} ${r.parties.heure}.`);
    }
    case 'noter': {
      const texte = o.depuis ? lireTexte(o.depuis) : o._.join(' ');
      return console.log(noter(racine, config, texte).ligne);
    }
    case 'budget': {
      const resultats = mesurer(racine, config);
      console.log(rapport(resultats) || 'Nothing to measure yet.');
      return resultats.some((r) => r.depasse) ? process.exit(1) : undefined;
    }
    case 'erreur': {
      const [sous, ...args] = o._;
      if (sous === 'familles') {
        return console.log(lireFamilles(racine).familles
          .map((f) => `- ${f.nom}: ${f.description}${f.regle_depuis ? ` [rule since ${f.regle_depuis}${f.forme ? `, form: ${f.forme}` : ''}]` : ''}`).join('\n'));
      }
      if (sous === 'ajouter') {
        const r = ajouter(racine, config, {
          famille: o.famille, titre: o.titre, corps: o.corps ? lireTexte(o.corps) : '', recidive: Boolean(o.recidive),
        });
        console.log(`Entry ${r.id} (family ${r.famille}).`);
        return console.log(rapportCompte(compter(racine)));
      }
      if (sous === 'compter') {
        const compte = compter(racine);
        console.log(rapportCompte(compte));
        return compte.inconnues.length ? process.exit(1) : undefined;
      }
      if (sous === 'regle') {
        const f = marquerRegle(racine, config, args[0] ?? '', typeof o.forme === 'string' ? o.forme : null);
        return console.log(`Family ${f.nom}: rule since ${f.regle_depuis}${f.forme ? `, form: ${f.forme}` : ''}.`);
      }
      if (sous === 'famille') return console.log(`Family added: ${ajouterFamille(racine, args[0] ?? '', args.slice(1).join(' '))}.`);
      throw new ErreurCarnet(`Unknown: carnet erreur ${sous ?? ''}\n${AIDE}`);
    }
    case 'sante': {
      const etat = sante(racine, config);
      enregistrer(racine, etat);
      return console.log(o.json ? JSON.stringify(etat, null, 2) : rapportSante(etat));
    }
    case 'revue':
      return console.log(`Review recorded: ${marquerRevue(racine, config, o.notes ? lireTexte(o.notes) : '')}`);
    default:
      throw new ErreurCarnet(`Unknown command "${commande}".\n${AIDE}`);
  }
}

try {
  principal(process.argv.slice(2));
} catch (e) {
  if (!(e instanceof ErreurCarnet)) throw e;
  console.error(e.message);
  process.exit(e.codeSortie);
}
