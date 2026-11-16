// Initialisation: detect, plan, then write only what the plan says.
//
// Three promises, each covered by a test:
//   1. Nothing existing is overwritten. A file that conflicts gets a sibling
//      `<name>.propose`; the user merges it or not.
//   2. Running it twice changes nothing the second time.
//   3. The plan printed by the simulation is exactly what `appliquer` writes.
//
// Codex receives the same skill text as Claude, copied, never rewritten: a
// mechanical "Claude -> Codex" substitution is how copies end up pointing at
// folders that do not exist.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOSSIER, LOCAL, FICHIER_CONFIG, ErreurCarnet } from './racine.mjs';
import { maintenant } from './heure.mjs';

const NOYAU = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GABARITS = path.join(NOYAU, 'gabarits');
export const MARQUE_DEBUT = '<!-- carnet:debut -->';
const LIGNE_IGNORE = `${LOCAL}/`;

const gabarit = (nom) => fs.readFileSync(path.join(GABARITS, nom), 'utf8');
const lire = (chemin) => { try { return fs.readFileSync(chemin, 'utf8'); } catch { return null; } };

function versionNoyau() {
  try { return JSON.parse(fs.readFileSync(path.join(NOYAU, 'package.json'), 'utf8')).version; } catch { return null; }
}

export function normaliserOptions(options = {}) {
  const agents = (Array.isArray(options.agents) ? options.agents : String(options.agents ?? 'claude').split(','))
    .map((a) => a.trim().toLowerCase()).filter(Boolean);
  for (const a of agents) if (!['claude', 'codex'].includes(a)) throw new ErreurCarnet(`Unknown agent "${a}" (claude, codex).`);
  const gardes = options.gardes ?? 'avertir';
  if (!['avertir', 'bloquer'].includes(gardes)) throw new ErreurCarnet('--gardes must be "avertir" or "bloquer".');
  const fuseau = options.fuseau || Intl.DateTimeFormat().resolvedOptions().timeZone;
  maintenant(fuseau); // refuses an unknown zone before anything is planned
  return { agents, gardes, fuseau, tickets: options.tickets || null, skills: options.skills ?? path.join(NOYAU, 'skills') };
}

/** What `init` would do in `cible`. Reads only. */
export function planifier(cible, options = {}, instant = new Date()) {
  const o = normaliserOptions(options);
  const racine = path.resolve(cible);
  if (!fs.existsSync(racine)) throw new ErreurCarnet(`${racine} does not exist.`, 2);
  const actions = [];
  const creerOuAdopter = (relatif, contenu) => {
    const existe = fs.existsSync(path.join(racine, relatif));
    actions.push(existe ? { chemin: relatif, action: 'adopter' } : { chemin: relatif, action: 'creer', contenu });
  };

  const config = {
    version: 1,
    noyau: versionNoyau(),
    initialise_le: maintenant(o.fuseau, instant).date,
    fuseau: o.fuseau,
    gardes: o.gardes,
    tickets: o.tickets,
    agents: o.agents,
  };
  creerOuAdopter(`${DOSSIER}/${FICHIER_CONFIG}`, `${JSON.stringify(config, null, 2)}\n`);
  creerOuAdopter(`${DOSSIER}/ETAT.md`, gabarit('ETAT.md'));
  creerOuAdopter(`${DOSSIER}/erreurs/familles.json`, gabarit('familles.json'));
  creerOuAdopter(`${DOSSIER}/regles-apprises.md`, gabarit('regles-apprises.md'));
  creerOuAdopter(`${DOSSIER}/decisions/a-trancher.md`, gabarit('a-trancher.md'));

  const bloc = gabarit('AGENTS.bloc.md');
  const agents = lire(path.join(racine, 'AGENTS.md'));
  if (agents === null) {
    actions.push({ chemin: 'AGENTS.md', action: 'creer', contenu: `# ${path.basename(racine)}\n\n${bloc}` });
  } else if (agents.includes(MARQUE_DEBUT)) {
    actions.push({ chemin: 'AGENTS.md', action: 'adopter' });
  } else {
    actions.push({
      chemin: 'AGENTS.md', action: 'conflit', contenu: bloc,
      raison: 'exists without the carnet block: the block to add is written next to it',
    });
  }

  if (o.agents.includes('claude')) {
    const claude = lire(path.join(racine, 'CLAUDE.md'));
    if (claude === null) {
      actions.push({ chemin: 'CLAUDE.md', action: 'creer', contenu: '@AGENTS.md\n' });
    } else if (/^@AGENTS\.md\s*$/m.test(claude)) {
      actions.push({ chemin: 'CLAUDE.md', action: 'adopter' });
    } else {
      actions.push({
        chemin: 'CLAUDE.md', action: 'conflit', contenu: '@AGENTS.md\n',
        raison: 'exists and does not import AGENTS.md: the line to add is written next to it',
      });
    }
  }

  const ignore = lire(path.join(racine, '.gitignore'));
  if (ignore === null) {
    actions.push({ chemin: '.gitignore', action: 'creer', contenu: `${LIGNE_IGNORE}\n` });
  } else if (ignore.split(/\r?\n/).some((l) => l.trim() === LIGNE_IGNORE || l.trim() === LOCAL)) {
    actions.push({ chemin: '.gitignore', action: 'adopter' });
  } else {
    actions.push({ chemin: '.gitignore', action: 'completer', contenu: `${ignore.endsWith('\n') || ignore === '' ? '' : '\n'}${LIGNE_IGNORE}\n`, raison: `one line added: ${LIGNE_IGNORE}` });
  }

  if (o.agents.includes('codex') && fs.existsSync(o.skills)) {
    for (const nom of fs.readdirSync(o.skills).sort()) {
      const source = path.join(o.skills, nom);
      if (!fs.statSync(source).isDirectory()) continue;
      for (const fichier of listerFichiers(source)) {
        const relatif = `.agents/skills/${nom}/${fichier}`;
        const contenu = fs.readFileSync(path.join(source, fichier), 'utf8');
        const existant = lire(path.join(racine, relatif));
        if (existant === null) actions.push({ chemin: relatif, action: 'creer', contenu });
        else if (existant === contenu) actions.push({ chemin: relatif, action: 'adopter' });
        else actions.push({ chemin: relatif, action: 'conflit', contenu, raison: 'differs from the core text: the core version is written next to it' });
      }
    }
  }

  return { racine, git: fs.existsSync(path.join(racine, '.git')), options: o, actions };
}

function listerFichiers(dossier, prefixe = '') {
  return fs.readdirSync(dossier).sort().flatMap((nom) => {
    const complet = path.join(dossier, nom);
    const relatif = prefixe ? `${prefixe}/${nom}` : nom;
    return fs.statSync(complet).isDirectory() ? listerFichiers(complet, relatif) : [relatif];
  });
}

/** Writes the plan. Returns the paths written. Existing files are never replaced. */
export function appliquer(plan) {
  const ecrits = [];
  for (const a of plan.actions) {
    const chemin = path.join(plan.racine, a.chemin);
    if (a.action === 'creer') {
      if (fs.existsSync(chemin)) throw new ErreurCarnet(`${a.chemin} appeared since the plan: nothing overwritten, run init again.`, 2);
      fs.mkdirSync(path.dirname(chemin), { recursive: true });
      fs.writeFileSync(chemin, a.contenu);
      ecrits.push(a.chemin);
    } else if (a.action === 'conflit') {
      fs.writeFileSync(`${chemin}.propose`, a.contenu);
      ecrits.push(`${a.chemin}.propose`);
    } else if (a.action === 'completer') {
      fs.appendFileSync(chemin, a.contenu);
      ecrits.push(a.chemin);
    }
  }
  return ecrits;
}

export function rapportPlan(plan) {
  const lignes = [`Project: ${plan.racine}`];
  if (!plan.git) lignes.push('Not a git repository: run `git init` first (project skills are only offered inside one, and the notebook is meant to be versioned).');
  const libelle = { creer: 'create ', adopter: 'keep   ', conflit: 'CONFLICT', completer: 'append ' };
  for (const a of plan.actions) lignes.push(`${libelle[a.action]} ${a.chemin}${a.raison ? `  (${a.raison})` : ''}`);
  const n = (x) => plan.actions.filter((a) => a.action === x).length;
  lignes.push(`${n('creer')} to create, ${n('adopter')} kept as is, ${n('conflit')} conflict(s), ${n('completer')} to append.`);
  return lignes.join('\n');
}

/** Diagnostic without writing: what an initialised project is missing. */
export function verifier(cible, options = {}) {
  const plan = planifier(cible, options);
  return plan.actions.filter((a) => a.action !== 'adopter');
}
