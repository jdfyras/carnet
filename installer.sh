#!/usr/bin/env bash
# Installs the carnet skills into explicitly named places. There is no "all":
# a machine may hold profiles that belong to other people.
#
#   ./installer.sh --simulation --agents          show what would happen, write nothing
#   ./installer.sh --agents                       ~/.agents/skills   (Codex and others)
#   ./installer.sh --claude                       ~/.claude/skills   (without the plugin)
#   ./installer.sh --profil work                  ~/.claude-work/skills
#   ./installer.sh --cible /some/skills/folder
#
# With the Claude Code plugin you do not need this for Claude: the plugin carries the skills,
# the hooks and the `carnet` command. This script exists for agents that read plain skill folders.
#
# A previous version is copied to <parent>/sauvegardes/<timestamp>/ before being replaced, one
# level ABOVE the scanned skills folder so a backup is never read as a second skill.
# A target that is a link is left alone, and the script exits 3 when it skipped one.

set -u
SOURCE="$(cd "$(dirname "$0")" && pwd)/skills"
HORODATAGE="$(date +%Y-%m-%d-%H%M%S)"
SIMULATION=0
CIBLES=()
ECHECS=0

while [ $# -gt 0 ]; do
  case "$1" in
    --simulation) SIMULATION=1 ;;
    --claude) CIBLES+=("$HOME/.claude/skills") ;;
    --agents) CIBLES+=("$HOME/.agents/skills") ;;
    --profil) shift; [ $# -gt 0 ] || { echo "--profil needs a name" >&2; exit 1; }; CIBLES+=("$HOME/.claude-$1/skills") ;;
    --cible) shift; [ $# -gt 0 ] || { echo "--cible needs a path" >&2; exit 1; }; CIBLES+=("$1") ;;
    -h|--help) sed -n '2,17p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
  shift
done

[ ${#CIBLES[@]} -gt 0 ] || { echo "Name at least one target: --agents, --claude, --profil <name> or --cible <path>." >&2; exit 1; }
[ -d "$SOURCE" ] || { echo "Skills folder not found: $SOURCE" >&2; exit 2; }

faire() { if [ "$SIMULATION" -eq 1 ]; then echo "    would run: $*"; else "$@"; fi; }

for racine in "${CIBLES[@]}"; do
  echo "== $racine"
  for source in "$SOURCE"/*/; do
    nom="$(basename "$source")"
    cible="$racine/$nom"
    if [ -L "$cible" ]; then
      echo "  $nom: a link (to $(readlink "$cible" 2>/dev/null || echo '?')), left alone."
      ECHECS=$((ECHECS + 1))
      continue
    fi
    if [ -d "$cible" ]; then
      if diff -rq "$source" "$cible" >/dev/null 2>&1; then
        echo "  $nom: already up to date."
        continue
      fi
      garde="$(dirname "$racine")/sauvegardes/$HORODATAGE"
      echo "  $nom: update; previous version saved in $garde/$nom"
      faire mkdir -p "$garde"
      faire cp -r "$cible" "$garde/$nom"
      faire rm -rf "$cible"
    else
      echo "  $nom: add."
    fi
    faire mkdir -p "$racine"
    faire cp -r "$source" "$cible"
  done
done

echo
if [ "$SIMULATION" -eq 1 ]; then echo "Simulation: nothing written."; else echo "Done."; fi
[ "$ECHECS" -eq 0 ] || exit 3
