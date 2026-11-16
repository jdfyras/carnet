// The time comes from this tool, never from a guess typed by an agent.
//
// Computed with Intl.DateTimeFormat in the configured zone, not with the TZ
// variable nor the machine's local time. An unknown zone is refused instead of
// falling back to UTC: a silently wrong hour is worse than an error.

import { CODE_ENVIRONNEMENT, ErreurCarnet } from './racine.mjs';

const JOURS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function fuseauEffectif(config = {}) {
  return config.fuseau || process.env.CLAUDE_PLUGIN_OPTION_FUSEAU || Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** { date: 'YYYY-MM-DD', heure: 'HH:MM', secondes: 'SS', jour, fuseau, mois: 'YYYY-MM' } */
export function maintenant(fuseau, instant = new Date()) {
  let formateur;
  try {
    formateur = new Intl.DateTimeFormat('en-CA', {
      timeZone: fuseau,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hourCycle: 'h23', weekday: 'long',
    });
  } catch {
    throw new ErreurCarnet(`Unknown time zone "${fuseau}". Use an IANA name such as Europe/Paris.`, CODE_ENVIRONNEMENT);
  }
  const p = {};
  for (const { type, value } of formateur.formatToParts(instant)) p[type] = value;
  if (!JOURS.includes(p.weekday)) throw new ErreurCarnet(`Unreadable date parts: ${JSON.stringify(p)}`, CODE_ENVIRONNEMENT);
  return {
    date: `${p.year}-${p.month}-${p.day}`,
    mois: `${p.year}-${p.month}`,
    heure: `${p.hour}:${p.minute}`,
    secondes: p.second,
    jour: p.weekday,
    fuseau,
  };
}

export function phrase(parties) {
  return `${parties.jour} ${parties.date} ${parties.heure} (${parties.fuseau})`;
}

/** Whole days between two 'YYYY-MM-DD' dates (b - a). */
export function joursEntre(a, b) {
  const t = (s) => Date.UTC(Number(s.slice(0, 4)), Number(s.slice(5, 7)) - 1, Number(s.slice(8, 10)));
  return Math.round((t(b) - t(a)) / 86400000);
}
