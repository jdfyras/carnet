# Context engineering et systèmes agentiques — quelle couche pour quelle consigne

> **Base de référence embarquée dans le plugin prompts.** Pages consultées le **2026-11-09** ; à relire avant le **2027-02-09**. Un fait propre à un modèle (effort, thinking, paramètres, formulations) se relit sur la page officielle du modèle visé avant d'être affirmé : ce fichier dit où lire, pas ce qui est vrai aujourd'hui. Les renvois `→ NN` désignent les autres fichiers de ce dossier (même préfixe numérique) ; les notes de recherche citées ne sont pas publiées.


> **Note source** : `research_notes/Prompt engineering référence 2026/04-context-engineering-agents.md`, **lue jusqu'à la ligne 588** (fin du fichier, dernier Gap de la section « Complément : pratiques rendues inutiles, sécurité des hooks, standard Agent Skills » incluse).
> **Date de consultation de toutes les sources : 2026-11-09.**
>
> **Convention de provenance, reprise de la note** — chaque constat porte son étiquette :
> - `[texte brut]` = page récupérée en texte intégral, **citation verbatim fiable** ;
> - `[extraction]` = page récupérée via WebFetch avec résumé par un modèle. La citation est **rapportée, pas garantie verbatim** : à ne pas présenter comme une citation mot à mot.
> - `[opinion de praticien]` = **aucune source de ce type n'a été consultée**. Ce fichier est entièrement éditeur.
>
> **Citations bornées à 15 mots.** Ce qui dépasse est paraphrasé hors guillemets.
>
> **Versions** — Les docs Claude Code (`code.claude.com/docs`) sont des pages vivantes **non versionnées** ; elles mentionnent en interne les seuils `v2.1.211`, `v2.1.233`, `v2.1.239`, `v2.1.277`, `v2.1.283`, `v2.1.285`. Les articles Anthropic Engineering sont datés individuellement. La spec MCP a deux révisions lues : `2025-06-18` et la courante `2026-07-28`. Les pages agentskills.io **n'affichent ni version ni date de révision**.
>
> **Péremption** — `building-effective-agents` date du **2024-12-19** et signale elle-même que l'outillage décrit a changé. Source la plus ancienne du corpus.
>
> **Portée** — trois ordres distingués partout : **général** (doctrine Anthropic Engineering, tout agent), **Claude Code** (mécanique d'un produit), **MCP** (normatif protocolaire). Les bannières de portée de la note sont conservées telles quelles : une mécanique produit n'est jamais présentée comme un principe général.

---

## 1. L'axe qui structure tout : déterministe vs non déterministe

C'est l'axe à poser avant l'architecture en couches, parce qu'il la traverse. La doc Claude Code classe **toute** instruction en deux familles `[texte brut]` :

- **Non déterministe** — on écrit l'instruction, le modèle la lit : « This can be your prompt, `CLAUDE.md`, or a skill », puis décide quoi en faire, **sans garantie** de la suivre.
- **Déterministe** — on configure, et le harness « *has* to execute this » : « This can be a hook, a deny rule, or a managed setting », appliqué chaque fois, quoi qu'ait décidé le modèle.
— [best-practices](https://code.claude.com/docs/en/best-practices) `[texte brut]`

**Conséquence directe : un prompt, un memory file et une skill laissent la décision au modèle. Seuls les mécanismes exécutés par le harness garantissent l'exécution.** La page le dit du côté produit : pour une chose qui ne doit jamais arriver ou qui doit toujours arriver, « A prompt alone can't guarantee either of those » — [best-practices](https://code.claude.com/docs/en/best-practices) `[texte brut]`. Et côté memory : les deux mécanismes persistants (CLAUDE.md et auto memory) sont traités « as context, not enforced configuration » — [memory](https://code.claude.com/docs/en/memory) `[texte brut]`.

### La règle de triage officielle, verbatim

> « make it a hook, a deny rule, or a managed setting »
> — [best-practices](https://code.claude.com/docs/en/best-practices) `[texte brut]` (10 mots)

Énoncée pour le cas « si quelque chose doit arriver à chaque fois ». Son **test d'application**, de la même page `[texte brut]` : « a hook is for a rule with *zero* exceptions ». Le contre-exemple fourni : « `Prefer named exports` has plenty », donc celle-là reste dans CLAUDE.md.

Motif donné pour le refus symétrique : « `CLAUDE.md` is for guidelines, and Claude is allowed to decide » qu'une guideline ne s'applique pas. Illustration : une ligne « Always typecheck before you finish » marche « most of the time, not every time » — [best-practices](https://code.claude.com/docs/en/best-practices) `[texte brut]`.

### Le tableau officiel par dimension `[texte brut]`

| Dimension | Non déterministe | Déterministe |
| - | - | - |
| *Quoi faire* | prompt, CLAUDE.md, skills que Claude prend lui-même | hooks, skills que seul l'utilisateur démarre |
| *Ce qu'il peut toucher* | classifieur du mode auto | deny rules, sandbox strict, managed settings |
| *Quand c'est fini* | demande de preuve, `/goal`, `/code-review` | tests, typecheck, hook `Stop`, CI |
| *Combien ça dépense* | niveau d'effort, rythme propre de Claude | `--max-turns`, `--max-budget-usd`, spend limit |
| *Qui a le dernier mot* | résumé de Claude | « Branch protection, a person who approves the merge » |

— [best-practices](https://code.claude.com/docs/en/best-practices) `[texte brut]`

### Trois faux déterminismes, nommés par l'éditeur `[texte brut]`

1. **Un hook `prompt` ou `agent`** fait décider *un autre modèle*, donc « isn't deterministic either. For real enforcement, use a `command` or `http` hook ». `onFailure: "block"` bloque aussi l'action quand le hook crashe ou expire.
2. **Le mode auto est un classifieur**, pas une règle dure : comme tout jugement « it can be wrong » ; les règles « never » appartiennent aux deny rules ou aux hooks.
3. **Le hook `Stop` a un plafond** : huit blocages consécutifs sans appel d'outil entre eux, puis Claude Code outrepasse le blocage suivant et termine le tour. Relevable via `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP`.
— [best-practices](https://code.claude.com/docs/en/best-practices) `[texte brut]`

Les deny rules ont elles-mêmes des limites énoncées : la règle `Read` attrape `cat .env`, mais « It won't catch a script that opens the file » ; une deny rule `WebFetch` sur un domaine « does nothing about `curl` to that same domain », sauf sandbox activé — [best-practices](https://code.claude.com/docs/en/best-practices) `[texte brut]`.

### Et le défaut revendiqué n'est pas le déterminisme

« Most of the time, you want Claude to decide. Almost every guideline has exceptions ». Discipline de volume : « Whatever the scope, keep the enforced set small » — si l'on en arrive à quarante règles appliquées, « most are probably preferences » que Claude aurait pu arbitrer seul — [best-practices](https://code.claude.com/docs/en/best-practices) `[texte brut]`.

---

## 2. Architecture en couches

Chaque couche se définit par **quand elle entre dans le contexte** et **par qui elle est appliquée**. Les deux axes — coût permanent/différé, déterministe/non déterministe — tranchent presque tous les arbitrages.

### Couche 1 — System prompt de l'agent · *portée : **général*** (Anthropic Engineering)

- **Y va** : « the minimal set of information that fully outlines your expected behavior », à la « right altitude », format structuré par sections. *Minimal ne veut pas dire court.*
- **N'y va pas** : la logique if-else fragile codée en dur ; le vague qui présuppose un contexte partagé ; les listes de règles de cas limites — celles-là vont dans des exemples canoniques.
- **Méthode** : partir d'un prompt minimal sur le meilleur modèle disponible, puis ajouter **uniquement sur échec observé**.
- La « right altitude » est décrite comme « the Goldilocks zone between two common failure modes ».
— [Anthropic Engineering, 2025-09-29](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) `[extraction]`

Few-shot : **maintenu** comme pratique de base, à condition de curer « a set of diverse, canonical examples » plutôt que d'empiler des règles de cas limites — [idem](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) `[extraction]`.

### Couche 2 — Memory files (CLAUDE.md / AGENTS.md / auto memory) — **coût permanent** · *portée : **Claude Code***

- **Y va** : des « facts Claude should hold in every session » — commandes de build, conventions, layout du projet, règles « always do X » — formulés « concrete enough to verify ». Exemples opposés de la page : « Use 2-space indentation » plutôt que « Format code properly » ; « Run `npm test` before committing » plutôt que « Test your changes » — [memory](https://code.claude.com/docs/en/memory) `[texte brut]`
- **N'y va pas, et où ça part** (règle de triage officielle) : une procédure multi-étapes, ou ce qui ne concerne qu'une partie du codebase — « move it to a skill or a path-scoped rule instead » — [idem](https://code.claude.com/docs/en/memory) `[texte brut]`
- **N'y va pas non plus** : les règles à zéro exception (→ couche 7), ni l'architecture et le layout du dépôt (voir §4, ligne 7 de la table officielle).
- **Taille** : « target under 200 lines per CLAUDE.md file ». Motif : les fichiers plus longs consomment plus de contexte « and reduce adherence » — [idem](https://code.claude.com/docs/en/memory) `[texte brut]`
- **Déclencheurs d'ajout** : Claude refait la même erreur une deuxième fois ; une code review attrape quelque chose qu'il aurait dû savoir ; on retape la même correction que la session précédente ; un nouvel arrivant aurait besoin du même contexte — [idem](https://code.claude.com/docs/en/memory) `[texte brut]`
- **Cohérence** : si deux instructions se contredisent, « Claude may pick one arbitrarily ». `/doctor prompt-audit` (v2.1.283+) audite CLAUDE.md, CLAUDE.local.md, AGENTS.md, rules, skills, commands, subagents, output styles — [idem](https://code.claude.com/docs/en/memory) `[texte brut]`
- **Auto memory**, portée distincte : écrite par Claude (apprentissages, préférences, corrections), chargée à hauteur des « first 200 lines or 25KB », portée « per repository, shared across worktrees » — [idem](https://code.claude.com/docs/en/memory) `[texte brut]`

**Mécanique de chargement** `[texte brut]` — quatre portées, du plus large au plus spécifique : managed policy (`C:\Program Files\ClaudeCode\CLAUDE.md` sous Windows ; `/etc/claude-code/CLAUDE.md` sous Linux/WSL) → user (`~/.claude/CLAUDE.md`) → project (`./CLAUDE.md` ou `./.claude/CLAUDE.md`) → local (`./CLAUDE.local.md`, à gitignorer). Tous les fichiers découverts sont **concaténés**, pas écrasés ; l'ordre va de la racine du système de fichiers vers le working directory, de sorte que les instructions les plus proches du lancement « are read last ». Les fichiers des **sous-répertoires** ne chargent pas au lancement : chacun « load[s] on demand » quand Claude lit, écrit ou édite un fichier de ce sous-répertoire — un `cat` ou `head` compte comme une lecture. Les commentaires HTML de bloc (`<!-- … -->`) sont retirés avant injection : notes pour mainteneurs humains sans coût en tokens. `claudeMdExcludes` ignore les CLAUDE.md d'autres équipes dans un monorepo — [memory](https://code.claude.com/docs/en/memory).

**AGENTS.md — deux niveaux à ne pas confondre.**

- *La convention* `agents.md` est **inter-éditeurs** : portée par l'Agentic AI Foundation sous la Linux Foundation, issue d'une collaboration OpenAI Codex / Amp / Jules (Google) / Cursor / Factory. Décrite comme « a README for agents ». **Aucun champ requis** : markdown standard, « Use any headings you like. » Sections suggérées : project overview, build and test commands, code style, testing instructions, security considerations. Monorepos : « The closest AGENTS.md to the edited file wins ». **La page ne mentionne pas CLAUDE.md** — [agents.md](https://agents.md/) `[extraction]`
  → **Aucune exigence normative** : pas de MUST/SHOULD, pas de référence BCP 14. Il n'y a donc **pas de « spec » au sens RFC** à citer ; « la spec AGENTS.md exige… » serait faux.
- *La règle de résolution* est **Claude Code**, et elle est **exclusive par défaut** `[texte brut]` :

| Situation | Ce que Claude lit |
| - | - |
| un `AGENTS.md`, aucun `CLAUDE.md`/`CLAUDE.local.md` dans le working dir ou au-dessus | « Your `AGENTS.md` » |
| un `AGENTS.md` **et** un `CLAUDE.md` ou `CLAUDE.local.md` dans le working dir ou au-dessus | « Your `CLAUDE.md` files only » |
| un `CLAUDE.md` qui importe déjà `AGENTS.md` | le CLAUDE.md, « with `AGENTS.md` included through the import » |

— [memory](https://code.claude.com/docs/en/memory) `[texte brut]`

  **Comptent** pour cette bascule (et font ignorer AGENTS.md) : `CLAUDE.md`, `.claude/CLAUDE.md`, `CLAUDE.local.md` dans le working directory ou au-dessus. **Ne comptent pas** (et continuent de charger à côté d'AGENTS.md) : `~/.claude/CLAUDE.md`, le CLAUDE.md managé de l'organisation, les fichiers `.claude/rules/`. **Non lus du tout** : `AGENTS.local.md`, `AGENTS.override.md`, tout ce qui est sous `.agents/`. Piège documenté : ajouter un `CLAUDE.local.md` pour ses instructions non committées « stops Claude from reading `AGENTS.md` for you » — remède, régler **Project instructions** sur `claude-md-and-agents-md`. Quatre valeurs du réglage `/config` → Project instructions : `claude-md-or-agents-md` (défaut), `claude-md-and-agents-md`, `claude-md`, `managed-only`. **Prérequis de version** : lire `AGENTS.md` directement « requires Claude Code v2.1.277 or later » — [memory](https://code.claude.com/docs/en/memory) `[texte brut]`.

### Couche 2b — Rules path-scoped (`.claude/rules/`) — **coût conditionnel** · *portée : **Claude Code***

- **Y va** : ce qui ne concerne qu'une partie du codebase, avec un frontmatter `paths` en globs ; la règle charge quand Claude fait Read, Write ou Edit sur un fichier correspondant. Un fichier par sujet, découverts récursivement.
- **N'y va pas** : les instructions spécifiques à une tâche qui n'ont pas besoin d'être en contexte en permanence — « use skills instead ».
- **Attention** : une rule **sans** `paths` est « loaded at launch with the same priority as `.claude/CLAUDE.md` » — donc coût permanent, pas conditionnel.
— [memory](https://code.claude.com/docs/en/memory) `[texte brut]`

### Couche 3 — Skills — **coût différé**, procédures · *mécanique **Claude Code**, modèle en trois niveaux **général***

- **Y va** : procédures multi-étapes, checklists, matériel de référence long. Déclencheur de création : « when a section of CLAUDE.md has grown into a procedure rather than a fact » — [skills](https://code.claude.com/docs/en/skills) `[extraction]`
- **Économie de la couche — progressive disclosure en trois niveaux** : niveau 1, `name` + `description` préchargés — « just enough information for Claude to know when each skill should be used » ; niveau 2, le `SKILL.md` complet si la skill paraît pertinente ; niveau 3+, fichiers liés au besoin. D'où un volume porté « effectively unbounded » — [Anthropic Engineering, 2025-10-16, màj 2025-12-18](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) `[extraction]`
- **Va dans la `description`** : le cas d'usage en premier et les formulations déclencheuses. Budget : `description` + `when_to_use` « is truncated at 1,536 characters in the skill listing » — [skills](https://code.claude.com/docs/en/skills) `[extraction]`
- **Va dans le corps** : quoi faire. « State what to do rather than narrating how or why. » Sous 500 lignes, le reste dans des fichiers séparés — [idem](https://code.claude.com/docs/en/skills) `[extraction]`
- **N'y va pas comme garde-fou** : `allowed-tools` **ne restreint rien** — ce sont les outils utilisables sans demande de permission pendant le tour qui invoque, le grant s'effaçant au message suivant ; « every tool remains callable, and your permission settings still govern » les autres — [idem](https://code.claude.com/docs/en/skills) `[extraction]`
- **Coût caché** : une fois chargé, le contenu entre dans la conversation comme un message unique « and stays there across later turns ». Invoquer une grosse skill tôt la fait payer tout le reste de la session — [idem](https://code.claude.com/docs/en/skills) `[extraction]`
- **Garde-fou d'approbation au niveau skill** : `disable-model-invocation: true` pour les workflows à effets de bord — exemples `/commit`, `/deploy`, `/send-slack-message` — car « You don't want Claude deciding to deploy » parce que le code a l'air prêt. `user-invocable: false` est réservé « for background knowledge that isn't actionable as a command » — [idem](https://code.claude.com/docs/en/skills) `[extraction]`
- Les skills **sont** les slash commands dans le modèle actuel : invocation directe « with `/skill-name` », `name` étant « Command name; defaults to the directory name » — [idem](https://code.claude.com/docs/en/skills) `[extraction]`
- **Emplacements et collisions** : enterprise (managed settings) > personal `~/.claude/skills/` > project `.claude/skills/` ; nested `<subdir>/.claude/skills/` ; plugin `<plugin>/skills/` exposé en `/plugin-name:skill-name`. « Enterprise over personal, and personal over project. » — [idem](https://code.claude.com/docs/en/skills) `[extraction]`
- **Budget du listing, chiffré** `[texte brut]` : le listing contient toujours tous les *noms*, mais Claude Code laisse tomber des descriptions pour tenir un budget de caractères. « The budget scales at 1% of the model's context window. » Les descriptions sont supprimées « starting with the skills you invoke least ». `/doctor` estime le coût en contexte et les plus gros contributeurs ; `/skill-doctor` repère les skills à désactiver ; `skillListingBudgetFraction` ou `SLASH_COMMAND_TOOL_CHAR_BUDGET` relèvent le budget ; `skillOverrides` à `"name-only"` libère du budget ; le plafond de 1 536 caractères par entrée s'applique « regardless of budget » et se configure via `skillListingMaxDescChars` — [skills](https://code.claude.com/docs/en/skills)

### Couche 4 — Tool descriptions : le contrat avec l'environnement · *portée : **général** + **MCP***

- **Y va** : le contexte implicite rendu explicite — formats de requête, terminologie de niche — l'usage d'exemple, les cas limites, les exigences de format d'entrée, les frontières avec les autres outils, et la **durée de vie des handles d'état** (exemple MCP non normatif : « baskets expire after 24 hours of inactivity ») — [writing-tools](https://www.anthropic.com/engineering/writing-tools-for-agents) `[extraction]` ; [building-effective-agents](https://www.anthropic.com/engineering/building-effective-agents) `[extraction]` ; [MCP 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/server/tools) `[texte brut]`
- **Y va aussi, et c'est contre-intuitif** : le texte des **messages d'erreur**, à prompt-engineerer comme des instructions actionnables — voir §7.
- **N'y va pas** : le chevauchement fonctionnel. « Too many tools or overlapping tools can also distract agents » ; préférer « a few thoughtful tools targeting specific high-impact workflows » — [writing-tools](https://www.anthropic.com/engineering/writing-tools-for-agents) `[extraction]`
- **Ne doit pas y être cru** : « clients **MUST** consider tool annotations to be untrusted » sauf serveur de confiance — [MCP 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/server/tools) `[texte brut]`

### Couche 5 — Retrieval / contexte chargé au runtime · *portée : **général***

- **Y va** : des identifiants légers — chemins, requêtes, liens — chargés à la demande, aidés par des métadonnées de navigation : hiérarchie de dossiers, nommage, timestamps.
- **N'y va pas** : le « pre-processing all relevant data up front ». Arbitrage assumé : l'exploration runtime est plus lente et demande de bons outils ; les approches **hybrides**, avec un peu de retrieval en amont, sont souvent les meilleures.
- **Trois techniques long-horizon**, une par régime de travail : **compaction** (résumer près de la limite, maximiser d'abord le rappel ; la forme la plus légère est « the safest lightest touch forms of compaction is tool result clearing ») pour l'aller-retour ; **structured note-taking** (notes « persisted to memory outside of the context window », type `NOTES.md`) pour les jalons itératifs ; **sous-agents** pour la recherche parallèle.
— [Anthropic Engineering, 2025-09-29](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) `[extraction]`

- **Contrainte de volume côté outils** : pagination, sélection de plage, filtrage, troncature avec défauts raisonnables — réponses d'outils limitées à **25 000 tokens par défaut dans Claude Code**. En cas de troncature, orienter vers plusieurs recherches ciblées plutôt qu'une large — [writing-tools](https://www.anthropic.com/engineering/writing-tools-for-agents) `[extraction]`
- Côté Claude Code, la compaction est **automatique** : « your conversation is compacted automatically before the context window fills ». Un hook `PreCompact` existe — [best-practices](https://code.claude.com/docs/en/best-practices) `[texte brut]` ; [hooks](https://code.claude.com/docs/en/hooks) `[extraction]`

### Couche 6 — Briefs de sous-agents : la couche qui ne reçoit rien en héritage · *contenu **général**, isolement **Claude Code***

- **Y va, obligatoirement** : un objectif, un format de sortie, des indications sur outils et sources, des frontières de tâche claires. Chaque sous-agent « needs an objective, an output format ». Les briefs vagues ont produit du travail dupliqué et des trous — [multi-agent](https://www.anthropic.com/engineering/multi-agent-research-system) `[extraction]`
- **Y va aussi, parce que rien ne s'y propage** : les règles qu'on croyait globales — voir §3.
- **N'y va pas** : le détail long, qui va dans le system prompt du sous-agent. Au-delà de **15 000 tokens** de descriptions cumulées, Claude Code affiche un avertissement au démarrage ; remède prescrit : « Move detail into each subagent's system prompt » — [sub-agents](https://code.claude.com/docs/en/sub-agents) `[extraction]`
- **Ce qui remonte** : seulement « a condensed, distilled summary of its work » — [context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) `[extraction]`
- **Quand ne pas créer la couche** : contexte nécessairement partagé, fortes dépendances inter-agents (« not a good fit for multi-agent systems today »), la plupart des tâches de code, les tâches de faible valeur, la coordination temps réel — [multi-agent](https://www.anthropic.com/engineering/multi-agent-research-system) `[extraction]`
- **L'argument économique** : les agents consomment environ 4× les tokens d'un chat ; « multi-agent systems use about 15× more tokens than chats ». Sur BrowseComp, l'usage de tokens seul explique **80 %** de la variance de performance ; avec le nombre d'appels d'outils et le choix de modèle, **95 %** — [idem](https://www.anthropic.com/engineering/multi-agent-research-system) `[extraction]`
- **Mécanique produit** : chaque sous-agent « runs in its own context window with a custom system prompt ». Fichiers markdown + frontmatter YAML, le corps devenant le system prompt ; `name` et `description` requis, `tools` et `model` optionnels. Restriction d'outils : `tools` en allowlist, `disallowedTools` en denylist — « If both are set, `disallowedTools` is applied first » — [sub-agents](https://code.claude.com/docs/en/sub-agents) `[extraction]`

### Couche 7 — Enforcement : hooks, permissions, sandbox, managed settings — hors contexte, hors jugement · *portée : **Claude Code** ; équivalent de principe côté **MCP** via le consentement d'invocation*

- **Y va** : tout ce qui a **zéro exception**. La condition de fin vérifiable (hook `Stop`, exit 2) ; le blocage de chemin (`PreToolUse`, exit 2) ; l'action systématique (`PostToolUse` après chaque Edit ou Write) ; le secret (`deny` rule, qui tient « in every permission mode, including auto and `bypassPermissions` ») ; le plafond de dépense (`--max-turns`, `--max-budget-usd`) ; la politique d'organisation (managed settings, dont « no personal settings file can override them ») — [best-practices](https://code.claude.com/docs/en/best-practices) `[texte brut]`
- **N'y va pas** : les préférences à exceptions. Et la discipline générale : « keep the enforced set small ».
- **Portée des fichiers de settings** : `.claude/settings.local.json` et `~/.claude/settings.json` sont personnels ; `.claude/settings.json` appartient au dépôt — ses deny rules s'appliquent immédiatement, ses `allow` attendent le trust dialog de chacun — [idem](https://code.claude.com/docs/en/best-practices) `[texte brut]`
- **Isolement OS** : le sandbox (`/sandbox`) confine les commandes shell sur macOS, Linux et WSL2 et reprend les deny rules `Read` et `WebFetch(domain:…)` ; « for anything security-related you want both ». Le **strict sandbox mode** supprime la possibilité de retry hors sandbox — [idem](https://code.claude.com/docs/en/best-practices) `[texte brut]`
- **Événements de hooks rapportés** : `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `Stop`, `SubagentStop`, `PreCompact`, `SessionEnd`, entre autres. `PreToolUse` : « Before a tool call executes. Can block it. » — décision dans `hookSpecificOutput.permissionDecision` + `permissionDecisionReason` ; exit 2 bloque ; exit 0 sans output signifie « no decision » et le flux de permission normal s'applique ; `updatedInput` peut réécrire les arguments. `Stop`/`SubagentStop` : exit 2 « Prevents Claude from stopping, continues the conversation » ; `additionalContext` renvoie du feedback ; un hook Stop peut lire `last_assistant_message`. `UserPromptSubmit` ne peut pas remplacer le prompt, seulement injecter `additionalContext` ; exit 2 « Blocks the prompt, so it never reaches Claude » — [hooks](https://code.claude.com/docs/en/hooks) `[extraction]`
- **Forme du texte injecté par un hook** — contrainte de prompting : un texte formulé comme des commandes système hors bande « can trigger Claude's prompt-injection defenses ». Écrire le contexte comme des **faits**, pas des commandes — [idem](https://code.claude.com/docs/en/hooks) `[extraction]`
- **Préférence énoncée** : « For instructions that never change, prefer CLAUDE.md. It loads without running a script. » — [idem](https://code.claude.com/docs/en/hooks) `[extraction]`

**Sécurité des hooks** `[texte brut]` — contenu de documentation rapporté ici, non exécuté :

- WARNING : « Command hooks execute shell commands with your full user permissions. » Ils peuvent modifier, supprimer ou lire tout fichier accessible au compte. Consigne : « Review and test all hook commands before adding them ».
- **Asymétrie du workspace trust, le point le plus actionnable** : en session interactive, Claude Code retient les hooks de *tous* les fichiers de settings, « including your own `~/.claude/settings.json` », jusqu'à acceptation du dialogue de confiance du dossier. En session `-p` ou SDK, « Claude Code never shows the dialog and treats the folder as trusted » — donc les hooks committés dans le `.claude/settings.json` d'un dépôt tournent dans un dossier jamais approuvé.
- Mitigations documentées avant de scripter `claude -p` sur un dépôt qu'on n'a pas écrit : relire ses fichiers `.claude/`, démarrer avec `--bare`, ou couper les hooks pour ce run avec `--settings '{"disableAllHooks": true}'`. Les hooks de frontmatter d'un subagent de projet suivent « a stricter rule than settings-file hooks ».
- **Cinq bonnes pratiques pour qui écrit un hook** : valider et assainir les entrées — « never trust input data blindly » ; toujours citer les variables shell — « use `"$VAR"` not `$VAR` » ; bloquer la traversée de chemin — « check for `..` in file paths » ; utiliser des chemins absolus, avec `${CLAUDE_PROJECT_DIR}` en forme exec ; éviter les fichiers sensibles — « avoid `.env`, `.git/`, keys, etc. ».
— [hooks](https://code.claude.com/docs/en/hooks) `[texte brut]`

### Règle de décision en deux questions

*(**Inférence** de la note, dérivée des citations ci-dessus — pas une formulation officielle.)*

1. **Est-ce vrai à chaque session ?** Oui → memory file. Non → skill ou rule path-scoped.
2. **Y a-t-il zéro exception ?** Oui → hook / deny rule / managed setting. Non → ça reste une instruction.

Échec prévisible n° 1 : écrire une règle de sécurité dans CLAUDE.md. La page memory dit que c'est du contexte, pas de la configuration ; la page best-practices dit que `.env` appartient aux deny rules.

---

## 3. Les ruptures de la couche mémoire

### Rupture 1 — le memory file ne descend pas dans les sous-agents

- **Mécanique** : les sous-agents ne reçoivent que leur system prompt et des détails d'environnement basiques, « not the Claude Code system prompt ». Un nouveau sous-agent ne voit ni l'historique de conversation, ni « the skills you've already invoked », ni les fichiers déjà lus. Conséquence énoncée, avec l'exemple d'ignorer le répertoire `vendor/` : il faut « restate it in the prompt you give Claude when delegating » — [sub-agents](https://code.claude.com/docs/en/sub-agents) `[extraction]`
- **Corroboration côté memory, en texte intégral** : les sous-agents qui démarrent sans project instructions démarrent aussi sans les fichiers `AGENTS.md` — [memory](https://code.claude.com/docs/en/memory) `[texte brut]`

**Donc : toute règle impérative doit être redite dans le brief.** Une règle qu'on croit « globale » parce qu'elle est dans CLAUDE.md ne l'est pas pour un sous-agent.

> **Lacune ouverte, à ne pas combler par inférence** — les sources lues **ne disent pas** comment garder synchronisés une règle de CLAUDE.md et sa recopie dans les briefs. `/doctor prompt-audit` couvre les contradictions entre fichiers d'instructions, mais rien de lu ne couvre la **dérive entre un invariant global et sa duplication dans un brief**. Lacune réelle de la doctrine officielle, signalée comme telle. **À vérifier** si une source ultérieure la traite.

### Rupture 2 — les imports n'économisent rien

- Les imports aident à organiser un fichier long « but don't reduce its context cost », les fichiers importés étant chargés avec le CLAUDE.md qui les importe — [memory](https://code.claude.com/docs/en/memory) `[texte brut]`
- Syntaxe `@path/to/import`, chemins relatifs résolus par rapport au fichier importateur, **profondeur maximale de quatre sauts**. Les code spans et blocs de code sont ignorés par le parseur, donc `` `@README` `` reste littéral — [idem](https://code.claude.com/docs/en/memory) `[texte brut]`
- Garde-fou sécurité : un import de fichier de mémoire projet dont le chemin résout **hors du working directory** est « external » et déclenche un dialogue d'approbation la première fois. Motif donné : protéger « from files other people commit to a shared project » — [idem](https://code.claude.com/docs/en/memory) `[texte brut]`

> **Inférence de la note** (pas une phrase officielle) : découper un gros CLAUDE.md en `@imports` pour « l'alléger » ne sert qu'à la lisibilité humaine. **Le seul mécanisme d'économie réel est le chargement différé** — skills, rules path-scoped, fichiers de sous-répertoires.

### Rupture 3 — la progressive disclosure économise le chargement, pas la rétention

*(**Inférence** de la note.)* Invoquer tôt une grosse skill dont le corps « stays there across later turns » la fait payer toute la session.

---

## 4. Pratiques rendues inutiles — la table officielle

**Pièce maîtresse de ce fichier.** Il s'agit de réflexes répandus que l'éditeur dit lui-même d'abandonner. La page best-practices a une section nommée **« What you can stop doing »**, qui « lists the advice that current models have made unnecessary ». Cadre posé par la page : chacune de ces pratiques était un bon conseil quand elle a été écrite ; la plupart étaient des contournements « for something the model couldn't reliably do yet », et les modèles ont rattrapé.

Toute cette section est `[texte brut]` — les citations sont donc verbatim fiables. Source unique : [best-practices](https://code.claude.com/docs/en/best-practices), consultée le 2026-11-09 (page vivante non versionnée ; ancre `#what-you-can-stop-doing` active).

| # | Pratique à cesser | Motif donné par l'éditeur | Ce qui reste valable |
| - | - | - | - |
| 1 | « The context window is your main constraint, manage it aggressively » | la plupart des modèles actuels ont une fenêtre de 1 M tokens et la compaction se fait seule, « so running out is rare » | `/clear` entre deux tâches, « because a focused context gets you better answers and costs less » |
| 2 | « Add IMPORTANT or ALL CAPS to instructions Claude keeps missing » | les modèles actuels suivent « a plainly worded line ». En empiler « mostly makes Claude over-apply the rule » — **contre-productif, pas seulement inutile** | si la règle ne peut pas plier, « turn it into a hook or a deny rule » ; si la ligne se perd dans un fichier long, « the file needs to be shorter » |
| 3 | « Use subagents to protect your context window » | manquer de contexte « is rarely the problem anymore » | les sous-agents restent bons pour le travail parallèle, pour tenir la sortie bruyante à l'écart et pour la relecture indépendante, « but each of those costs extra tokens » |
| 4 | « Delegate to a subagent for a better answer » | « Handing the same task to a subagent doesn't make the answer any better. » | un relecteur **frais** aide, parce qu'il n'a pas vu votre raisonnement — « which is a different thing from delegating » |
| 5 | « `think hard`, `think harder`, `be thorough` in the prompt » | l'effort est le contrôle prévu pour ça. Ces formules sont **« ordinary prompt text »** qui pousse Claude *à l'intérieur* de son réglage d'effort — **ce ne sont pas des mots-clés** qui l'élèvent | exception nommée : « `ultrathink` still works », pour un raisonnement plus profond sur ce seul tour, sans toucher au réglage d'effort |
| 6 | « Tell Claude to keep going, loop until done, don't be lazy » | les modèles actuels mènent d'ordinaire une tâche convenue à son terme sans qu'on le leur dise ; de telles lignes sont « more likely to cause over-work than fix a stall » — **contre-productif** | donner un check à faire passer. Si un run s'arrête court, dire `continue` ; pour les runs non surveillés, `/goal` ou un hook `Stop` « enforces it » |
| 7 | « Describe your architecture and file layout in `CLAUDE.md` » | « Claude reads the repo itself. Only write down what isn't in there. » | — |

### La clause de clôture, qui généralise la table

> si un autre conseil de la page finit par ressembler à du travail pour rien, « that's probably a sign it belongs in this table too »
> — [best-practices](https://code.claude.com/docs/en/best-practices) `[texte brut]`

### Ce que les deux distinctions impliquent

- **Mot-clé vs texte de prompt ordinaire** : la ligne 5 est la plus nette. `think hard` et ses variantes ne sont pas des leviers ; `ultrathink` en est un. Un document qui les mettrait sur le même plan serait **faux selon l'éditeur**.
- **Contre-productif vs simplement inutile** : les lignes 2 et 6 sont les deux seules où la page dit que la pratique produit un effet *négatif* (sur-application de la règle, sur-travail). Les lignes 1, 3, 4, 7 sont seulement devenues inutiles.
- **Ligne 7 boucle avec la règle de triage de la couche 2** : ce qui va dans CLAUDE.md n'est pas « le contexte du projet » en général, mais **le complément de ce qui n'est pas lisible dans le code**. Deux pages disent la même chose par deux chemins.

### Où les sources disent que le prompt engineering n'est plus le bon levier · *portée : **général***

La formulation la plus directe, 2025-09-29 : « Building with LLMs is becoming less about finding the right words » pour ses prompts. Mais le même article pose le context engineering comme « the natural progression of prompt engineering » — **pas comme son remplacement** — et maintient explicitement le few-shot « as a core practice » — [Anthropic Engineering, 2025-09-29](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) `[extraction]`.

Trois déplacements de levier, attestés séparément : vers la **curation du contexte** (2025-09-29) ; vers les **descriptions d'outils** — « Even small refinements to tool descriptions can yield dramatic improvements » (2025-09-11, `[extraction]`) ; vers le **code exécuté** plutôt que généré — « sorting a list via token generation is far more expensive » qu'exécuter un tri (2025-10-16, `[extraction]`).

> **Aucune source lue ne dit que le prompting est inutile.** La lecture forte est à écarter explicitement.

---

## 5. Écrire une skill

### Le standard ouvert agentskills.io `[texte brut]`

Gouvernance : le format « was originally developed by Anthropic », publié comme standard ouvert, et « open to contributions from the broader ecosystem ». Discussion sur GitHub (`agentskills/agentskills`) et Discord — [agentskills.io](https://agentskills.io).

Définition minimale : un dossier contenant un `SKILL.md`, lequel inclut des métadonnées — « `name` and `description`, at minimum » — et des instructions. Arborescence conventionnelle : `SKILL.md` **requis**, puis `scripts/`, `references/`, `assets/` **optionnels**, « Any additional files or directories » étant permis — [agentskills.io/specification](https://agentskills.io/specification).

**Frontmatter — deux champs requis seulement** :

| Champ | Statut | Contraintes |
| - | - | - |
| `name` | **requis** | 1 à 64 caractères ; minuscules alphanumériques et tirets seulement ; ni tiret initial ni final ; pas de tirets consécutifs ; « Must match the parent directory name » |
| `description` | **requis** | 1 à 1024 caractères, non vide ; doit décrire ce que fait la skill *et* quand l'utiliser ; « Should include specific keywords that help agents identify relevant tasks » |
| `license` | optionnel | — |
| `compatibility` | optionnel | max 500 caractères ; à n'inclure que si la skill a des exigences d'environnement |
| `metadata` | optionnel | map de chaînes vers chaînes |
| `allowed-tools` | optionnel | chaîne d'outils séparés par des espaces ; marqué « Experimental » |

— [agentskills.io/specification](https://agentskills.io/specification) `[texte brut]`

Exemples opposés fournis pour `description` — bon : une phrase qui liste les opérations puis « Use when working with PDF documents… » ; mauvais : « Helps with PDFs. »

**Budgets numériques de la progressive disclosure, chiffrés par le standard** :

| Niveau | Chargement | Budget |
| - | - | - |
| métadonnées | au démarrage, pour toutes les skills | « (~100 tokens) » |
| instructions | à l'activation | « (< 5000 tokens recommended) » |
| ressources | au besoin seulement | — |

Plus : « Keep your main `SKILL.md` under 500 lines. » Références de fichiers : chemins relatifs depuis la racine de la skill, « one level deep from `SKILL.md` », en évitant les chaînes de références profondément imbriquées. Corps : « There are no format restrictions. » Sections recommandées : instructions pas à pas, exemples d'entrées/sorties, cas limites. Avertissement : l'agent charge le fichier entier une fois la skill activée. Validation outillée : `skills-ref validate ./my-skill` vérifie le frontmatter et les conventions de nommage — [agentskills.io/specification](https://agentskills.io/specification) `[texte brut]`.

### Écart mesuré entre le standard et les extensions du produit

La doc Claude Code affirme suivre ce standard **et l'étendre** par l'invocation control, l'exécution en sous-agent et l'injection de contexte dynamique — [skills](https://code.claude.com/docs/en/skills) `[extraction]`.

| Élément | Standard agentskills.io `[texte brut]` | Claude Code |
| - | - | - |
| Champs requis | `name` et `description` | les deux marqués optionnels, `description` seulement « Recommended » `[extraction]` |
| Limite de `description` | 1024 caractères (contrainte du standard) | `description` + `when_to_use` tronqué à **1 536 caractères** dans le listing `[texte brut]` |
| `when_to_use` | absent du standard | extension Claude Code `[extraction]` |
| `disable-model-invocation`, `user-invocable`, `context`/`agent`, `paths`, `hooks`, `argument-hint` | absents du standard | extensions Claude Code — `[extraction]` pour le tableau de frontmatter, `[texte brut]` pour `argument-hint` |
| `license`, `compatibility`, `metadata` | définis par le standard | **non rencontrés** dans les pages Claude Code lues |
| `allowed-tools` | défini, marqué « Experimental » | présent, avec une sémantique précise : dispense de permission pour le tour `[extraction]` |

**Conséquence à énoncer explicitement** : le standard est plus **strict** là où il parle (deux champs requis, `name` contraint, 1024 caractères) ; Claude Code est plus **riche** (une douzaine de champs d'extension) tout en relâchant le requis. **Écrire une skill portable veut dire s'en tenir au sous-ensemble du standard** ; écrire une skill Claude Code veut dire accepter de ne plus être portable. Le choix est à poser, pas à subir.

### Caveat de citation — à conserver

> Le standard agentskills.io **n'emploie pas le vocabulaire BCP 14** (RFC 2119) : il écrit « must » et « should » en minuscules, dans des tableaux de contraintes. Il **ne doit pas être cité comme normatif au même rang qu'une spécification formelle**, contrairement à la spec MCP qui, elle, référence explicitement BCP 14.
>
> Et : **aucune version ni date de révision n'est affichée** sur les pages agentskills.io lues. Il n'y a pas de numéro de spec à citer, seulement la date de consultation **2026-11-09**. Lacune de la source elle-même, consignée comme telle plutôt que comblée.

### Évaluer une skill `[texte brut]`

- **Modes outillés via le skill-creator** : *baseline* qui rejoue la tâche « with a clean context » en enregistrant tokens et durée ; *grading* qui vérifie chaque assertion et écrit pass/fail avec preuve dans `grading.json` ; *benchmark* qui agrège taux de réussite, temps et tokens avec et sans la skill dans `benchmark.json`, pour « compare the pass-rate improvement against the token and time overhead » ; *comparaison de versions* en A/B aveugle ; *description tuning* qui génère des prompts should-trigger et should-not-trigger, mesure le taux de déclenchement et propose des retouches « when the skill activates on the wrong requests » ; *review viewer* HTML dont le retour qualitatif est relu à l'itération suivante.
- Pour une skill de plugin : écrire un cas d'éval avec un grader `tool_used: Skill` et lancer `claude plugin eval` « after each description change ».
- **Skill qui ne déclenche pas** : vérifier que la description contient « keywords users would naturally say » ; vérifier qu'elle apparaît dans « What skills are available? » ; reformuler la requête ; invoquer directement. Si le frontmatter YAML est malformé, Claude Code charge le corps avec des **métadonnées vides** — donc `/skill-name` marche encore mais Claude ne peut plus matcher la description ; `--debug` montre l'erreur de parsing ; `claude plugin validate` (v2.1.233+) trouve les frontmatters non parsables.
- **Skill qui déclenche trop** : rendre la description plus spécifique, ou ajouter `disable-model-invocation: true`.
— [skills](https://code.claude.com/docs/en/skills) `[texte brut]`

---

## 6. Pourquoi un agent décroche d'une consigne

Trois causes documentées, **trois remèdes distincts** — et ils recoupent exactement l'architecture en couches. Tout ce bloc est `[texte brut]`.

| Cause | Remède | Couche visée |
| - | - | - |
| **1. Claude a sauté une règle qui doit tenir chaque fois** | la déplacer dans un **hook**, que Claude Code exécute « every time its event occurs », suivie ou non de la skill. Pour garder la règle avec la skill : la définir dans le frontmatter `hooks` de celle-ci — ce hook s'applique alors de l'invocation jusqu'à la fin de la session | couche 7 (enforcement) |
| **2. Claude a sauté une consigne à appliquer avec jugement** | la **reformuler pour qu'elle porte sur toute la tâche** : « "Run the tests after every edit" rather than "Run the tests" ». Motif technique : le contenu de la skill est ajouté à la conversation à l'invocation, et Claude Code « doesn't re-read the file » aux tours suivants | couche 3 (corps de skill) |
| **3. La conversation a été compactée** | **réinvoquer la skill**. Après compaction, Claude Code « can keep only the start of an invoked skill » | couche 5 (gestion long-horizon) |

— [skills](https://code.claude.com/docs/en/skills) `[texte brut]`

### La contrainte d'ordre d'écriture qui découle de la compaction

Puisque seul le début d'une skill invoquée survit à la compaction :

> « put the most important instructions near the top of `SKILL.md` »
> — [skills](https://code.claude.com/docs/en/skills) `[texte brut]`

Cette contrainte n'apparaît nulle part ailleurs dans le corpus lu. Elle transforme la hiérarchie d'un fichier d'instructions en **décision de survie post-compaction**, pas en choix de lisibilité.

---

## 7. Outils, MCP et consentement

### Le design d'outils et de descriptions est un problème de prompting · *portée : **général***

- **Consolider** : un outil peut envelopper plusieurs appels API — un `schedule_event` au lieu de `list_users` + `list_events` + `create_event` — [writing-tools](https://www.anthropic.com/engineering/writing-tools-for-agents) `[extraction]`
- **Namespacing** : préfixes communs par service et ressource (`asana_search`, `asana_projects_search`). Le choix préfixe/suffixe change les résultats, donc « choose a naming scheme according to your own evaluations » — [idem](https://www.anthropic.com/engineering/writing-tools-for-agents) `[extraction]`
- **Réponses** : ne renvoyer que de l'information « high signal », privilégier « contextual relevance over flexibility ». Remplacer les identifiants opaques par des noms signifiants — résoudre les UUID en langage interprétable a réduit les hallucinations. Offrir un enum `response_format` (« concise » / « detailed ») pour que l'agent contrôle la verbosité — [idem](https://www.anthropic.com/engineering/writing-tools-for-agents) `[extraction]`
- **Descriptions** : décrire l'outil « as you would to a new hire » ; rendre explicite le contexte implicite ; nommer les paramètres sans ambiguïté — « `user_id` rather than `user` » ; contraindre entrées et sorties par des modèles de données stricts — [idem](https://www.anthropic.com/engineering/writing-tools-for-agents) `[extraction]`
- **Messages d'erreur comme instructions** : « prompt-engineer your error responses to clearly communicate specific and actionable improvements », plutôt que des codes opaques ou des tracebacks — [idem](https://www.anthropic.com/engineering/writing-tools-for-agents) `[extraction]`
- **ACI / poka-yoke** (2024-12-19) : juger si l'outil est évident depuis sa description et ses paramètres, au niveau de besoin d'un développeur junior ; inclure usage d'exemple, cas limites, exigences de format, frontières avec les autres outils ; rendre l'erreur difficile — exemple donné, l'agent SWE-bench exigeait des chemins absolus, que le modèle a ensuite utilisés fiablement — [building-effective-agents](https://www.anthropic.com/engineering/building-effective-agents) `[extraction]`
- **Évaluation** : tâches réalistes à nombreux appels d'outils, pas des cas de sandbox ; chaque prompt associé à un résultat vérifiable ; éviter les « overly strict verifiers » ; suivre exactitude, durée, nombre d'appels, tokens, erreurs d'outils ; lire les transcripts, car ce que les agents omettent « can often be more important » — [writing-tools](https://www.anthropic.com/engineering/writing-tools-for-agents) `[extraction]`

**Côté Claude Code**, une contrainte de forme analogue pour le texte injecté par un hook : formulé comme des commandes système hors bande, il « can trigger Claude's prompt-injection defenses » — écrire des faits, pas des commandes — [hooks](https://code.claude.com/docs/en/hooks) `[extraction]`.

### Les exigences normatives de la spec MCP qui portent sur la sûreté d'un agent · *portée : **MCP***

Spec `2026-07-28` (révision courante), `[texte brut]` :

- **Tool Safety** : « Tools represent arbitrary code execution and must be treated with appropriate caution. » Et : les descriptions de comportement d'outil telles que les annotations « should be considered untrusted, unless obtained from a trusted server ». S'y ajoutent « Hosts must obtain explicit user consent before invoking any tool » et « Users should understand what each tool does before authorizing » — [MCP specification](https://modelcontextprotocol.io/specification/latest)
- **User Consent and Control** : « Users must explicitly consent to and understand all data access », avec contrôle maintenu sur ce qui est partagé et fait. **Data Privacy** : consentement explicite avant d'exposer des données à un serveur — [idem](https://modelcontextprotocol.io/specification/latest)
- **Limite assumée du protocole** : MCP « cannot enforce these security principles at the protocol level » ; les implémenteurs **SHOULD** construire des flux de consentement et d'autorisation robustes — [idem](https://modelcontextprotocol.io/specification/latest)
- **WARNING sur les annotations** : « clients **MUST** consider tool annotations to be untrusted unless they come from trusted servers » — [MCP 2026-07-28 / server / tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)
- **Security Considerations** de la page Tools : serveurs **MUST** valider toutes les entrées, implémenter des contrôles d'accès, limiter le débit, assainir les sorties. Clients **SHOULD** : « Prompt for user confirmation on sensitive operations » ; montrer les entrées d'outil à l'utilisateur avant l'appel, « to avoid malicious or accidental data exfiltration » ; **« Validate tool results before passing to LLM »** ; implémenter des timeouts ; « Log tool usage for audit purposes » — [idem](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)
- **Erreurs : la distinction est un choix de prompting, et la spec l'assume.** Les protocol errors signalent des problèmes de structure « that models are less likely to be able to fix » ; les tool execution errors (`isError: true`) « contain actionable feedback that language models can use to self-correct » — exemple de la spec : « Invalid departure date: must be in the future. » Et : « Clients **SHOULD** provide tool execution errors to language models to enable self-correction. » — [idem](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)
- **Noms d'outils** (section nouvelle en 2026-07-28) : 1 à 128 caractères (SHOULD), sensibles à la casse, lettres ASCII, chiffres, `_`, `-`, `.` seulement, uniques dans un serveur. **Namespacing côté client, normatif** : les clients ou proxies qui agrègent plusieurs serveurs **MAY** rencontrer des collisions — exemple, deux serveurs exposant chacun un `search` — et **SHOULD** implémenter une désambiguïsation « such as prefixing tool names with a server identifier ». Le `name` du serveur « **SHOULD NOT** be relied upon for disambiguation » — [idem](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)
- **Durée de vie dans la description** (section non normative « Stateful Tools ») : la politique de rétention d'un handle devrait figurer dans la description de l'outil de création — « baskets expire after 24 hours of inactivity » — [idem](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)
- **Ordre déterministe des outils** recommandé, avec un motif de prompting explicite : il permet au client de cacher la liste de façon fiable « and improves LLM prompt cache hit rates » — [idem](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)
- **Exfiltration via `x-mcp-header`** : les développeurs de serveurs **SHOULD NOT** marquer ainsi des paramètres sensibles — « passwords, API keys, tokens, PII » — les valeurs d'en-têtes étant visibles des intermédiaires réseau — [idem](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)

Révision `2025-06-18`, lue aussi `[texte brut]` : les deux WARNING (humain dans la boucle avec capacité de refus ; annotations non fiables sauf serveur de confiance) sont **présents à l'identique**, et les Security Considerations y sont déjà les mêmes à la puce `$ref` près. Apparaissent en 2026-07-28 : « Tool Names », la désambiguïsation inter-serveurs, `x-mcp-header`, « Stateful Tools », `InputRequiredResult` / `resultType`, l'ordre déterministe. **Le socle sécurité est inchangé** — [MCP 2025-06-18 / server / tools](https://modelcontextprotocol.io/specification/2025-06-18/server/tools).

**Précision à tenir** : le `MUST` *littéral* de la page Tools ne nomme que les **annotations**. Le texte des principes dit « descriptions of tool behavior such as annotations » et emploie « should » en minuscules. La formulation couvre le vecteur « description d'outil malveillante », mais il faut citer avec cette précision plutôt qu'en généralisant.

### L'approval gate

- **MCP** : « there **SHOULD** always be a human in the loop », capable de refuser une invocation. Les applications **SHOULD** montrer clairement quels outils sont exposés au modèle, insérer des indicateurs visuels à l'invocation, et « Present confirmation prompts to the user for operations » — [MCP 2026-07-28 / server / tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools) `[texte brut]`
- **Serveur MCP local** : si un client supporte la configuration en un clic, il « **MUST** implement proper consent mechanisms prior to executing commands » — et le dialogue doit montrer la commande exacte « without truncation », l'identifier comme opération potentiellement dangereuse, exiger une approbation explicite et permettre l'annulation. Risques énumérés pour un serveur local non restreint : exécution de code arbitraire avec les privilèges du client, « No visibility » sur les commandes exécutées, obfuscation de commande, exfiltration, perte de données irrécupérable — [MCP 2026-07-28 / security best practices](https://modelcontextprotocol.io/specification/2026-07-28/basic/security_best_practices) `[texte brut]`
- **Claude Code**, niveau skill : `disable-model-invocation: true` comme gate sur les actions à effet de bord — `/commit`, `/deploy`, `/send-slack-message` — « You don't want Claude deciding to deploy » parce que le code a l'air prêt — [skills](https://code.claude.com/docs/en/skills) `[extraction]`
- **Claude Code**, gate humain final, dans la colonne déterministe de la dimension *qui a le dernier mot* : « Branch protection, a person who approves the merge » — [best-practices](https://code.claude.com/docs/en/best-practices) `[texte brut]`

### ABSENCE VÉRIFIÉE — « prompt injection » ne figure pas sur les pages MCP lues

Ce n'est **pas une lacune de recherche**, c'est une absence dans la source, vérifiée sur **deux pages distinctes** :

1. **`/specification/2026-07-28/server/tools`** — le terme n'a pas été trouvé ; la note le formule prudemment : la spec couvre la chose « sans la nommer », l'affirmation portant sur **les sections lues** — [MCP 2026-07-28 / server / tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools) `[texte brut]`
2. **`/specification/2026-07-28/basic/security_best_practices`** — page presque entièrement consacrée à l'OAuth et au transport. Attaques traitées : confused deputy, token passthrough, SSRF, state handle hijacking, compromission d'un serveur MCP local, validation des URL d'autorisation OAuth (XSS/RCE), transport `stdio` en architecture de proxy, mix-up attacks, usurpation de redirect URI localhost, politiques de confiance CIMD, minimisation des scopes. **Le terme « prompt injection » n'y apparaît pas**, ni aucune section sur l'instruction hostile cachée dans un résultat d'outil ou une description — [MCP 2026-07-28 / security best practices](https://modelcontextprotocol.io/specification/2026-07-28/basic/security_best_practices) `[texte brut]`

**Le seul rattachement officiel qui porte sur l'injection par résultat d'outil** est donc ce `SHOULD` unique :

> « Validate tool results before passing to LLM »
> — [MCP 2026-07-28 / server / tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools) `[texte brut]`

**Ne pas attribuer à la spec MCP un traitement nommé de l'injection.**

Quelques `MUST` citables tels quels de la page security best practices : les serveurs MCP « **MUST NOT** accept any tokens that were not explicitly issued » pour eux-mêmes ; « MCP servers **MUST NOT** treat possession of a state handle as authentication » ; les serveurs qui implémentent l'autorisation « **MUST** verify all inbound requests ». Objet déclaré de la page : compléter la spec MCP Authorization, à lire avec elle et avec RFC 9700 — [idem](https://modelcontextprotocol.io/specification/2026-07-28/basic/security_best_practices) `[texte brut]`.

**Minimisation des scopes** — le plus proche d'une doctrine de portée restreinte dans une source officielle : modèle progressif de moindre privilège, avec un jeu initial minimal (exemple donné : `mcp:tools-basic`) limité aux opérations de découverte et de lecture à faible risque, puis élévation ciblée par défi `WWW-Authenticate`. Erreurs nommées : publier tous les scopes possibles dans `scopes_supported`, et « Using wildcard or omnibus scopes (`*`, `all`, `full-access`) » — [idem](https://modelcontextprotocol.io/specification/2026-07-28/basic/security_best_practices) `[texte brut]`. *Attention* : cela porte sur des **jetons d'autorisation**, pas sur la portée d'un agent sur un dépôt. L'analogie est tentante ; elle doit être signalée comme analogie, pas comme citation.

---

## 8. Stop conditions et runs non surveillés

### Les cinq questions officielles à répondre avant un run non surveillé `[texte brut]`

1. **Sait-il à quoi ressemble « fini » ?** — condition de goal, fichier de spec, test rouge à rendre vert.
2. **Peut-il vérifier son propre travail ?** — suite de tests, hook `Stop`, étape de revue.
3. **À quoi a-t-il le droit de toucher ?** — permission rules, `dontAsk`, sandbox, worktree, la seule branche où il peut pousser.
4. **Qu'est-ce qui l'arrête ?** — `--max-turns`, `--max-budget-usd`, spend limit.
5. **Où va le résultat et qui signe ?** — une PR, un commentaire ou un résumé, puis une personne qui approuve le merge ou le déploiement.

Partage des rôles énoncé : « The parts that stay with you are starting it », définir « done » cette fois-là, et approuver le merge — [best-practices](https://code.claude.com/docs/en/best-practices) `[texte brut]`.

### Le diagnostic qui motive tout ça

« Claude stops when the work looks done. » Sans rien à exécuter qui dise si le travail *est* fait, « "looks done" is all it has to go on » — et, dit la page, « that makes you the test suite » — [best-practices](https://code.claude.com/docs/en/best-practices) `[texte brut]`.

### Quatre formes de condition d'arrêt, officiellement énumérées `[texte brut]`

| Forme | Qui juge | Note |
| - | - | - |
| **Dans le prompt** — « run the auth tests after, and keep going until they pass » | Claude lui-même | marche partout, aujourd'hui, sans setup |
| **Comme goal** — `/goal all tests in tests/auth pass and lint is clean` | « a separate model checks against the conversation after every turn » | utile surtout pour les runs longs en arrière-plan, où Claude termine parfois un tour sur un résumé de progression alors que des items sont ouverts, « and the goal sends it back » |
| **Comme hook `Stop`** | un script (exit 2 renvoie Claude au travail) | « This one is enforced by Claude Code (the harness) » — le tour ne finit pas avant que le check passe ou que le block limit soit atteint |
| **Par quelqu'un qui n'a pas écrit le code** — `/code-review` | un sous-agent frais | relit le diff « in a fresh subagent that never saw your conversation », donc non influencé par le raisonnement qui a produit ce code |

— [best-practices](https://code.claude.com/docs/en/best-practices) `[texte brut]`

### Exigence de preuve

Quelle que soit l'option, demander des **preuves** : « the command it ran and its output, or the screenshot ». « "All tests pass" on its own tells you very little », et pour une session non surveillée c'est de toute façon la seule preuve disponible — [best-practices](https://code.claude.com/docs/en/best-practices) `[texte brut]`.

### Scope lock sur les fichiers — la règle des zéro exception appliquée `[texte brut]`

La page prend trois règles qu'on pourrait avoir dans CLAUDE.md — « `Never read .env`, `Always run the formatter after editing`, `Don't touch the migrations folder` » — note que Claude les suivra presque chaque fois, et prescrit, pour les cas où « almost » ne suffit pas, de les sortir vers une configuration que le harness applique. Mise en œuvre correspondante :

| Règle | Mécanisme prescrit |
| - | - |
| `.env` | `deny` rule — elles tiennent « in every permission mode, including auto and `bypassPermissions` » |
| formateur après édition | hook `PostToolUse` après chaque Edit ou Write |
| dossier migrations | hook `PreToolUse` sortant en code 2 pour tout chemin sous `migrations/` |

— [best-practices](https://code.claude.com/docs/en/best-practices) `[texte brut]`

Exemple officiel de stop interne dans une skill de release : « Make sure you're on main with a clean tree. If not, stop and ask. » — [idem](https://code.claude.com/docs/en/best-practices) `[texte brut]`.

### Côté général, 2024-12-19 `[extraction]`

Inclure des limites telles qu'un nombre maximal d'itérations. Les agents peuvent « pause for human feedback at checkpoints » ou quand ils sont bloqués. Tests extensifs « in sandboxed environments » avant déploiement. L'agent devrait vérifier les résultats d'outils ou l'exécution de code à chaque étape pour évaluer sa progression — [building-effective-agents](https://www.anthropic.com/engineering/building-effective-agents) `[extraction]`.

### Rappel structurant

Le plafond de huit blocages du hook `Stop` est **un garde-fou contre le garde-fou** : même l'arrêt « déterministe » a une limite. Un pipeline qui s'appuie dessus doit savoir qu'il peut rendre la main avec le check encore rouge.

---

## 9. Vocabulaire

Employer un terme que les sources n'emploient pas est la voie par laquelle une affirmation non sourcée s'installe. Trois termes de praticien sont à étiqueter comme tels.

| Terme de praticien — **pas** du vocabulaire éditeur | Ce que disent réellement les sources |
| - | - |
| **« context pollution »** | Aucune source officielle lue ne définit ce terme. Le vocabulaire Anthropic est **« context rot »** (le rappel précis d'une information « decreases » à mesure que les tokens croissent) et **« distraction »** par trop d'outils (« Too many tools or overlapping tools can also distract agents ») — [context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) `[extraction]` ; [writing-tools](https://www.anthropic.com/engineering/writing-tools-for-agents) `[extraction]` |
| **« scope lock »** | Aucune source officielle lue n'emploie ce terme. Les **mécanismes** existent et sont nommés : `deny` rules, `paths` (rules et skills), `tools` / `disallowedTools` (sous-agents), sandbox et strict sandbox mode, `--max-turns`, `--max-budget-usd`. Côté MCP, l'équivalent le plus proche est la **minimisation des scopes** — mais sur des jetons d'autorisation, par analogie seulement |
| **« spec AGENTS.md »** | Il n'y a **pas de spec au sens RFC**. agents.md ne publie aucune exigence normative : pas de MUST/SHOULD, pas de référence BCP 14. « La spec AGENTS.md exige… » serait faux — [agents.md](https://agents.md/) `[extraction]` |

Deux autres précisions de vocabulaire :

- Le **standard agentskills.io** écrit « must » et « should » en minuscules et **ne référence pas BCP 14** : à ne pas citer au même rang normatif que la spec MCP, qui le référence explicitement.
- **« workflow » vs « agent »** est une distinction éditeur, pas un synonyme libre : workflows = LLM et outils « orchestrated through predefined code paths » ; agents = LLM qui « dynamically direct their own processes and tool usage » — [building-effective-agents](https://www.anthropic.com/engineering/building-effective-agents) `[extraction]`. Cinq patterns de workflow nommés : prompt chaining, routing, parallelization (sectioning / voting), orchestrator-workers, evaluator-optimizer.

---

## 10. À vérifier

### Lacunes **fermées** par le complément du 2026-11-09 — à ne pas rouvrir

- La section **« What you can stop doing »** : existe bien, était déjà dans la page récupérée en texte intégral (page de 634 lignes, section à la ligne 610 ; ancre `#what-you-can-stop-doing` active). Le premier grep l'avait manquée en cherchant des mots de contenu et non des titres. **Correction de méthode à retenir.**
- La **section sécurité de la page hooks** : lue cette fois, en texte brut (§2, couche 7).
- La **section évaluation de la page skills** : lue (§5).
- Le **standard agentskills.io** : récupéré en texte brut (§5).
- La page **MCP security best practices** : récupérée en texte brut (§7).

### Points **encore ouverts**

**Pages nommées mais non lues**

- `platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices` — désignée par la doc Claude Code comme la guidance d'écriture de skills valable « across Claude products ». Probablement la source la plus **générale** (non liée à Claude Code) sur l'écriture d'une skill. **À récupérer** pour toute prescription portable.
- `agentskills.io/skill-creation/evaluating-skills` — source du format de fichier d'éval et du workflow d'itération. **À vérifier** pour tout détail de format.
- `claude.com/blog/improving-skill-creator-test-measure-and-refine-agent-skills` — cité par la doc comme contexte des modes benchmark et comparaison. Non lu.
- `code.claude.com/docs/en/goal` — la mécanique exacte de `/goal` (comment le second modèle juge, ce qu'il voit) n'a pas été lue. **À vérifier** avant de la décrire.

**Vocabulaire à étiqueter — les deux réserves de la note, conservées telles quelles**

- « context pollution » : aucune source officielle lue ne définit ce terme propre. **Si le rapport veut employer « context pollution », il faut le présenter comme vocabulaire de praticien, pas comme terme Anthropic : à vérifier.** Voir §9.
- « scope lock » : aucune source officielle lue n'emploie ce terme ; les mécanismes existent mais le vocabulaire est de praticien. **À étiqueter comme tel dans le rapport.** Voir §9.

**Sections lues seulement partiellement — un « non mentionné » signifie « absent de la portion lue »**

- **Pages MCP `server/tools`** : l'affirmation « le terme *prompt injection* n'apparaît pas » porte sur **les sections lues**, non sur la page entière — voir §7, où il s'agit d'une **absence vérifiée, non d'une lacune de recherche** : la portée exacte de chacune des deux pages y est donnée. L'absence sur `security_best_practices` est, elle, constatée sur l'ensemble de la page.
- Le champ **`stop_hook_active`** n'a pas été lu dans le texte reçu. La mécanique de boucle Stop est connue par le plafond de huit blocages `[texte brut]`, pas par ce champ.
- Le champ **`permissionDecision`** est rapporté par l'extraction avec la valeur `defer` parmi les options ; **non confirmé en texte brut, à vérifier avant de l'écrire comme spec.**

**Provenance à consolider avant citation verbatim**

- Les citations des **quatre articles Anthropic Engineering** (context engineering, writing tools, building effective agents, multi-agent) proviennent d'**extractions WebFetch**, pas de texte brut. Avant toute publication verbatim, **re-vérifier chaque guillemet sur la page source**. Même règle pour les blocs `[extraction]` des pages `skills`, `sub-agents`, `hooks` et `agents.md`.

**Lacunes de doctrine, pas de recherche**

- **Dérive entre un invariant global et sa recopie dans un brief de sous-agent** : rien de lu ne la traite. `/doctor prompt-audit` couvre les contradictions entre fichiers d'instructions, pas cette dérive. **Lacune réelle de la doctrine officielle.**
- **Aucun budget de tokens cible par couche** n'est publié — par exemple, quelle part du contexte initial devrait aller à la mémoire contre aux descriptions d'outils. Les seuls chiffres lus sont des plafonds ponctuels : 200 lignes / 25 Ko (auto memory), sous 200 lignes (CLAUDE.md), sous 500 lignes (SKILL.md), 1 536 caractères (entrée de listing de skill), 1 % de la fenêtre (budget du listing), 1 024 caractères (`description`, standard), ~100 tokens (métadonnées, standard), < 5 000 tokens (instructions, standard), 15 000 tokens (descriptions de sous-agents cumulées), 25 000 tokens (réponse d'outil dans Claude Code), 4 sauts (profondeur d'import), 8 blocages (plafond du hook `Stop`).
- **Aucune quantification** du gain du context engineering contre le prompt engineering : pas d'A/B publié.
- **Aucune version ni date de révision** sur les pages agentskills.io : lacune de la source elle-même, consignée plutôt que comblée.

**Chiffres auto-déclarés, non vérifiés indépendamment**

- « over 60k open-source projects », et le décompte de 88 fichiers AGENTS.md dans le repo principal d'OpenAI, sont auto-déclarés par agents.md `[extraction]`.
- Les chiffres de l'article multi-agents (90,2 % de surperformance, réduction de temps jusqu'à 90 %, 40 % de réduction de temps de complétion via l'auto-amélioration des descriptions d'outils) sont des mesures internes non reproduites ici.

**Absence structurelle du corpus**

- **Aucune source non-éditeur n'a été consultée.** Il n'y a donc ici **aucune contre-expertise ni aucun avis de praticien** sur l'architecture en couches, sur la table des pratiques périmées, ni sur l'écart standard / produit. Si un livrable en veut, cela reste à chercher — et à étiqueter `[opinion de praticien]`.
