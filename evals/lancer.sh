#!/usr/bin/env bash
# Runs the eval suite on a copy of the plugin that declares no dependency.
#
# Why a copy: measured on 2026-11-16 (Claude Code 2.1.325), `claude plugin eval .` on this plugin
# with `dependencies: ["arbitrage"]` in its manifest never called a carnet skill (0 of 9 runs),
# and the same case with that one line removed called it 3 times out of 3. The cause is not
# established; the likely one is that the eval's isolated run does not resolve the dependency, so
# the plugin does not load. Evaluating a manifest without the line measures the skills, which is
# what the suite is for. The working manifest is never edited: an installed copy may read it live.
#
#   evals/lancer.sh [--case '<glob>'] [--max-cost-usd 2] [any other `claude plugin eval` option]
#
# Results are written under evals/results/ of this repository.
set -euo pipefail
ici="$(cd "$(dirname "$0")/.." && pwd)"
copie="$(mktemp -d)"
trap 'rm -rf "$copie"' EXIT
(cd "$ici" && git ls-files -co --exclude-standard -z | grep -zv '^evals/results/' | xargs -0 -I{} cp --parents {} "$copie/")
node -e '
const fs = require("fs");
const f = process.argv[1] + "/.claude-plugin/plugin.json";
const m = JSON.parse(fs.readFileSync(f, "utf8"));
delete m.dependencies;
fs.writeFileSync(f, JSON.stringify(m, null, 2) + "\n");
' "$copie"
horodatage="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
mkdir -p "$ici/evals/results"
code=0
(cd "$copie" && claude plugin eval . --trust-plugin --scaffold --no-publish --json "$ici/evals/results/$horodatage.json" "$@") || code=$?
echo "Results: evals/results/$horodatage.json (exit code $code)"
exit "$code"
