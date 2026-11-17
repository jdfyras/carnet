# 00b — Référence rapide : le détail que le cheat-sheet ne porte pas

> **Base de référence embarquée dans le plugin prompts.** Pages consultées le **2026-11-09** ; à relire avant le **2026-12-07**. Un fait propre à un modèle (effort, thinking, paramètres, formulations) se relit sur la page officielle du modèle visé avant d'être affirmé : ce fichier dit où lire, pas ce qui est vrai aujourd'hui. Les renvois `→ NN` désignent les autres fichiers de ce dossier (même préfixe numérique) ; les notes de recherche citées ne sont pas publiées.


> **Ce fichier est né le 2026-11-09 de la découpe de `00-cheat-sheet.md`**, qui faisait 40 549 octets
> sur 318 lignes et n'était plus une page. Il garde tout ce qui ne se relit pas *pendant* le travail
> mais qu'on vient chercher : les formulations à retirer d'un prompt existant, le partage calcul / ton,
> les couches où placer une instruction, les evals, l'épinglage, la matrice de régression — **et la
> table complète des clés de citation**. La page courte est [`00-cheat-sheet.md`](00-cheat-sheet.md).
>
> **Les blocs ci-dessous sont déplacés tels quels, à l'octet près.** Seuls les titres sont renumérotés
> et les encadrés marqués **NOUVEAU** ont été écrits à la découpe.
>
> ⚠️ **Les deux fichiers portent chacun une table de clés** — complète ici, réduite aux clés utilisées
> dans la page courte. **Une clé modifiée doit l'être dans les deux.** C'est le prix de la découpe,
> assumé plutôt que caché.
>
> **Comment lire.** Mêmes conventions que la page courte : `[clé]` = URL + date (table en bas),
> la **portée**, et `→ NN` vers le fichier qui tient le détail. **Aucune étiquette n'est promue.**
> **Toutes les pages ont été consultées le 2026-11-09.** Convention complète : `README.md`.

---

## 1. Ce qui change le calcul vs ce qui change le ton

> La ligne de partage « technique qui change le calcul / technique qui change le ton » est une
> **`Inférence de la note`** (01 §5.3), pas un résultat. Les deux colonnes, elles, sont sourcées.

| Change le **calcul** (mesuré, avec sa classe de tâche) | Change le **ton / l'enrobage** (ou rien) |
|---|---|
| **CoT sur math/logique** : GSM8K 10,4 % → 40,7 % · `text-davinci-002`, 2022 — [arXiv:2205.11916](https://arxiv.org/abs/2205.11916) `abstract lu` → 01 | **Persona / rôle → justesse factuelle : folklore.** « adding personas in system prompts does not improve model performance » ; 162 personas, 2 410 questions, 4 familles — [arXiv:2311.10054](https://arxiv.org/abs/2311.10054) → 07 · 01 §3.1 |
| **Décomposition** : ≥ 99 % sur SCAN contre 16 % pour le CoT · `code-davinci-002` — [arXiv:2205.10625](https://arxiv.org/abs/2205.10625) `abstract lu` → 01 | **Persona / rôle → ton : confirmé**, claim vendor sans mesure. `[bp]` « Setting a role in the system prompt focuses Claude's behavior and tone » → 07 |
| **Self-consistency** : GSM8K +17,9 % mais ARC-challenge **+3,9 %** — [arXiv:2203.11171](https://arxiv.org/abs/2203.11171) `abstract lu` → 01 | **Menaces / pourboires : folklore.** « generally no significant effect on benchmark performance » sur GPQA et MMLU-Pro ; **modèles non nommés**, ni tailles d'effet ni p-values — [arXiv:2508.00614](https://arxiv.org/abs/2508.00614) `abstract lu` → 07 |
| **Outils plutôt que plus d'effort** (graphiques) : avec tools à `high` > sans tools à `max`, « at a fraction of the cost » · **Sonnet 5.5** `[s55]` → 02 §1.7 | **Appels émotionnels : non réconcilié.** +8,00 % / +115 % BIG-Bench sur 6 modèles **de 2023** ([arXiv:2307.11760](https://arxiv.org/abs/2307.11760)) contre aucun effet significatif en 2025 ([arXiv:2508.00614](https://arxiv.org/abs/2508.00614)). **Ni stimuli, ni modèles, ni bancs partagés — ne pas trancher** → 07 · 01 §5.1 |
| **Examples** : levier le plus fiable sur **format / ton / structure** `[bp]` · toutes → 02 §1.1 | **Politesse** : « impolite prompts often result in poor performance », mais « overly polite language does not guarantee better outcomes » ; optimum **dépendant de la langue** — [arXiv:2402.14531](https://arxiv.org/abs/2402.14531) `abstract lu`, modèles non nommés → 07 |
| **Reference-guided judge** : taux d'échec 70 % → **15 %** (`HTML Table 4`, juges 2023) — [arXiv:2306.05685](https://arxiv.org/html/2306.05685) → 05 §2.5 | **`think hard` / `think harder` / `be thorough`** : « ordinary prompt text », **pas des mots-clés**. Exception nommée : « `ultrathink` still works » `[cc-bp]` `[texte brut]` → 03 §4 L5 |
| **Descriptions d'outils** : « Even small refinements to tool descriptions can yield dramatic improvements » `[ant-tools]` `[extraction]` · général → 03 §4 | **Formatage** : « the exact formatting of prompts is likely becoming less important » — réserve bornée **au formatting**, mécanisme = mimétisme de style, **pas** la justesse `[ant-ctx]` → 07 |

**Le confondant de premier ordre reste la sensibilité au format** : 76 points (format, [arXiv:2310.11324](https://arxiv.org/abs/2310.11324)), template dégradé « to a random guess level » sur **21 modèles de 770M à 70B** ([arXiv:2401.06766](https://arxiv.org/abs/2401.06766)), −22,0 points de position sur GPT-3.5-Turbo contre **−4,2 sur Claude-1.3 dans la même étude** ([arXiv:2307.03172v3](https://arxiv.org/html/2307.03172v3), modèles **de 2023**). Et **les optima ne transfèrent pas** d'un modèle à l'autre ([arXiv:2104.08786](https://arxiv.org/abs/2104.08786), [arXiv:2401.06766](https://arxiv.org/abs/2401.06766)). → 01 §4 · 07

---

## 2. Formulations à SUPPRIMER d'un prompt existant

> **La section la plus rentable, et celle où la portée fait tout.** Une ligne sans sa colonne portée est
> fausse pour une partie du lineup : §6 de 02 documente les **inversions** entre générations.
> `Inférence de la note 01` : la génération 3/4 se réglait en **ajoutant**, la génération 5 « se règle
> largement en retirant celles héritées » → 02 §6.

| À retirer | Effet documenté | Portée **stricte** | Source | → |
|---|---|---|---|---|
| Toute règle « ne pense pas » / « ne raisonne pas » | **augmente** la fuite de balises XML internes | Opus 5 (thinking off), Opus 5.5, Sonnet 5.5 (`between_tools`) | `[o5]` « that kind of instruction increases tag leakage » ; `[o55]` « remove the no-thinking rule either way » ; `[s55]` | 02 §5 |
| Demander de « penser moins » pour réduire le thinking | sans effet fiable — **baisser l'effort** à la place | Sonnet 5.5, Haiku 5.5, Opus 5.5 | `[s55]` « Asking the model in the system prompt to think less doesn't reliably reduce its thinking. » ; `[h55]` ; `[o55]` | 02 §5 |
| « double-check your answer », « re-verify before responding », « include a final verification step » | sur-vérification, coût sans gain | **Opus 5 uniquement.** Sur le reste de 4.6+/5.x l'auto-vérification est au contraire **recommandée** — inversion, pas règle | `[o5]` « add cost without improving results » ; `[bp]` « On Claude Opus 5, remove these instructions rather than rewriting them. » | 02 §5 · §6.3 |
| « think carefully before answering » dans un system prompt de **chat** | latence sans gain de qualité | **Opus 5.5.** À l'inverse `[o48]` **donne** la formule — mais seulement pour tenir à `low` effort. Verdict de 07 : **confirmé sous condition stricte** | `[o55]` « removing such a line made replies start sooner » | 07 · 02 §5 |
| Consignes demandant d'**écrire / transcrire** son raisonnement | refus catégorie `reasoning_extraction` | Fable 5.1, Fable 5, Opus 5.5, Opus 5, Sonnet 5.5, Haiku 5.5 | `[bp]` « may be declined » ; `[f5]` « Audit existing skills and system prompts for reflection » | 02 §5 · 07 (**périmé**) |
| « only report high-severity issues », « be conservative », « don't nitpick » | suivi **littéralement** → recall en baisse | Opus 5, Opus 4.8, Sonnet 5 | `[o5]` « ask it to report everything and filter in a separate pass instead » ; `[s5]` | 02 §5 |
| « only use tools when strictly necessary », « minimize tool calls » | réponses depuis la mémoire au lieu d'une recherche | **Sonnet 5.5** | `[s55]` « check your prompt for language that discourages tool use » | 02 §5 |
| « If in doubt, use [tool] », « Default to using [tool] » | sur-déclenchement | **Opus 4.6** | `[bp]` « Instructions such as "If in doubt, use [tool]" cause overtriggering. » | 02 §5 |
| « CRITICAL: You MUST use this tool when… » | sur-déclenchement ; **adoucir** | Opus 4.5, Opus 4.6 | `[bp]` « you can use more normal prompting such as "Use this tool when…" » | 02 §5 |
| **IMPORTANT / ALL CAPS** sur une consigne manquée | **contre-productif** : « mostly makes Claude over-apply the rule ». Si la règle ne plie pas → hook ou deny rule ; si la ligne se perd → « the file needs to be shorter » | modèles actuels (page vivante Claude Code) | `[cc-bp]` `[texte brut]` | 03 §4 L2 |
| « keep going », « loop until done », « don't be lazy » | **contre-productif** : « more likely to cause over-work than fix a stall » | modèles actuels (page vivante) | `[cc-bp]` `[texte brut]` | 03 §4 L6 |
| « MUST over should. NEVER over avoid. » comme règle d'écriture | **périmé** : la doc dit l'inverse deux fois | Anthropic, doc courante | `[bp]` « The fix is to soften any aggressive language. » ; `[o48]` | 08 B.7 |
| « placer l'élément clé dans les **30 % premiers** du prompt » | **non sourçable / folklore** : le 30 % d'Anthropic est un **gain de qualité** pour la requête placée **en fin**, pas une zone ; *Lost in the Middle* parle de début/fin, pas de tiers | — | `[bp]` ; [arXiv:2307.03172](https://arxiv.org/abs/2307.03172) | 07 · 08 B.7 (L402, L442) |
| Règles **anti-formatage** héritées (anti-bullets, anti-markdown) | supprime une structure dont le contenu a besoin | **Fable 5.1 uniquement.** Ailleurs le bloc anti-markdown est fourni par la doc — inversion | `[f51]` « it uses bold less and is less likely to reach for headers » ; `[bp]` « a block like this can suppress structure the content needs » | 02 §5 · §6.1 |
| « hold all findings for the final response » | supprime les updates dont on se plaint ensuite | Fable 5.1 (citation) ; Sonnet 5.5, Opus 5.5 (**pas de citation propre, `—` dans 02**) | `[f51]` « Remove lines like that before adding anything. » | 02 §5 |
| « avoid a generic AI look » (générique) | échange un défaut esthétique contre un autre | Opus 5.5, Sonnet 5, Opus 4.8 | `[o55]` « mostly swaps one default for another » ; `[s5]` « tend to shift the model to a different fixed palette » | 02 §5 |
| « After every 3 tool calls, summarize progress » | scaffolding devenu inutile | Sonnet 5, Opus 4.8 | `[s5]` « try removing it » | 02 §5 |
| Compte à rebours de tokens **exposé au modèle** | arrêts prématurés ; lectures en prompt injection | Fable 5, Sonnet 5.5 | `[f5]` « Avoid surfacing explicit context-budget counts where possible. » ; `[s55]` | 02 §5 |
| Nommer explicitement les balises `<thinking>` dans une interdiction | **moins** efficace que la forme générale | Opus 5 | `[o5]` « so avoid naming them specifically » | 02 §5 |
| Consigne de recherche **systématique** quelle que soit la confiance | recherches inutiles sur **la moitié** des prompts ; « It didn't produce more correct answers. » Le nudge *ciblé*, lui, n'ajoute que **0–3 %** de recherches inutiles | Haiku 5.5 | `[h55]` | 02 §1.7 · §5 |
| Skills très **prescriptives** héritées de modèles antérieurs | **dégradent** la qualité de sortie | Fable 5 | `[f5]` « can degrade output quality » | 02 §5 |
| Décrire architecture et file layout dans `CLAUDE.md` | « Claude reads the repo itself. Only write down what isn't in there. » | Claude Code, page vivante | `[cc-bp]` `[texte brut]` | 03 §4 L7 |
| « Use subagents to protect your context window » / « delegate for a better answer » | devenu **inutile** (pas contre-productif) : manquer de contexte « is rarely the problem anymore » ; « Handing the same task to a subagent doesn't make the answer any better. » Reste valable : un relecteur **frais** | Claude Code, page vivante | `[cc-bp]` `[texte brut]` | 03 §4 L3-L4 |
| Chain-of-thought scaffolding, « think step by step » | « Avoid chain-of-thought prompts » ; « is unnecessary » ; « may not enhance performance (and can sometimes hinder it) » — **« actively degrades » surinterprète la source** | **OpenAI o-series** (génération o3 / o4-mini sur la page lue) ; **convergence** avec Gemini 2.5 et 3, même règle | `[oai-reason]` ; `[g-strat]` | 02 §5.1 · §4.5 · 07 · 08 B.3 |
| « Keep system prompts under 200 words » | **non sourçable** : longueur de system prompt **NOT MENTIONED** sur la page lue | — | `[oai-reason]` | 08 B.3 |
| **Six autres lignes non-Anthropic** : préfixes `maximize_`, instructions contradictoires laissées en place, raisonnement pas-à-pas demandé dans la réponse (avec sa nuance pour les problèmes lourds), langage trop persuasif, multiplication des exemples few-shot, JSON mode quand Structured Outputs existe, greedy decoding sur Qwen3 thinking | — | OpenAI GPT-5 · Gemini · Qwen3 | `[oai-g5]`, `[g-strat]`, `[oai-so]`, `[qwen-card]` (**rang 1**) | **02 §5.1** (tableau complet) |
| « /compact à ~50 % de contexte » · « new task = new session » comme règle | **non sourçable** pour le seuil (aucun seuil documenté). Le choix de repartir à neuf est, lui, sourcé ailleurs : `[bp]` « consider starting with a brand new context window rather than using compaction » | Claude Code | `[cc-slash]` (lue jusqu'à 100 000 caractères → « NOT MENTIONED » = absent de la portion lue) | 08 B.5 |
| Prefill du dernier tour assistant · `budget_tokens` · `temperature`/`top_p`/`top_k` | **erreur 400** — voir §4 | voir §4 | — | 02 §7 |

---

## 3. Paramètres et ruptures d'API qui cassent du code

> Les ruptures **silencieuses** sont dans la page courte, [`00-cheat-sheet.md §2`](00-cheat-sheet.md).
> Ici : celles qui renvoient une erreur visible, les quatre règles de persistance du raisonnement,
> et les comportements qui ne sont ni l'un ni l'autre.

### 3.1 Erreur 400 — visible

| Rupture | Portée | Source | → |
|---|---|---|---|
| Prefill du dernier tour assistant **supprimé** | Anthropic **4.6+** et Mythos Preview (≤ 4.5 continuent de l'accepter) | `[bp]` « Requests with prefilled assistant messages to these models return a 400 error. » | 02 §7.1 |
| `budget_tokens` : déprécié sur Opus/Sonnet 4.6, **400 dès 4.7** | Anthropic 4.7+ , Sonnet 5, Haiku 5.5 | `[bp]` « setting `budget_tokens` returns a 400 error » ; `[s5]` | 02 §7.1 |
| `temperature`, `top_p`, `top_k` **retirés** | Anthropic, **API version `2026-10-21`** ; sur versions antérieures, 400 dès **Claude 4.7** si valeur non par défaut. Remplacement officiel : **le prompting** | `[deprec]` « Removed in API version 2026-10-21 » + « Omit and use prompting to guide model behavior. » | 02 §1.6 · §7.1 · 05 §6.1 |
| `thinking: {"type": "disabled"}` → 400 **à tout effort** | **Opus 5.5** (alors qu'Opus 5 l'acceptait à effort ≤ `high`) ; aussi Fable 5.1/Mythos 5.1, Fable 5/Mythos 5, Sonnet 5.5, Mythos Preview | `[o55]` « Claude Opus 5.5 returns a 400 error for it » ; `[thinking]` (matrice) | 02 §6 · §7.1 |
| `between_tools` hors effort ≤ `high`, ou avec `display`/`budget_tokens`/`block_binding` | Sonnet 5.5 | `[s55]` « takes no other field » | 02 §7.1 |
| `adaptive` non supporté | Opus 4.5, Sonnet 4.5, Haiku 4.5 | `[thinking]` (matrice) | 02 §7.1 |
| **4 breakpoints de cache explicites + le breakpoint automatique** (qui consomme un des 4 slots) | Anthropic, tous | `[caching]` « You can define up to 4 cache breakpoints. » ; si 4 breakpoints explicites existent déjà, « the API returns a 400 error » | 04 §5.2 |
| Schéma hors sous-ensemble supporté | OpenAI : « Setting `strict: true` with an unsupported schema returns an error ». Anthropic : 400 avec détails, et 400 « Schema is too complex for compilation » | `[oai-so]` ; `[ant-struct]` | 04 §1 |

### 3.2 Persistance du raisonnement — **quatre règles incompatibles**

C'est « le point où un wrapper multi-fournisseur casse silencieusement » (`Inférence de la note 02`).

| Fournisseur | Règle | Source |
|---|---|---|
| **Anthropic** | renvoyer les blocs thinking **inchangés**, historique **append-only** ; éditer un tour antérieur, reconstruire `system`/`tools` ou résumer en place « invalidates every later thinking block » · **Claude 5.1+** | `[bp]` ; `[thinking]` ; `[f51]` « only while everything before it is unchanged » |
| **Google** | « You **MUST** always resend all `thought` blocks exactly as they were received » (stateless) ; en stateful, le serveur gère les signatures | `[g-think]` |
| **OpenAI** | réutilisation par **référence serveur** (`previous_response_id`), pas par renvoi de contenu ; items compactés **opaques** · GPT-5.2 | `[oai-g5]` ; `[oai-g52]` |
| **Qwen** | bloc de thinking **seulement au dernier tour** ; l'historique assistant ne garde que la sortie finale, et « tout framework qui contourne le template Jinja2 doit l'imposer lui-même » · rang 1 (artefact) | `[qwen-concepts]` ; `[qwen-card]` |

→ 02 §7.3

### 3.3 Comportements à connaître — **ni erreur 400, ni rupture de version**

> **NOUVEAU au 09/11/2026 : section créée à la découpe pour ne rien perdre.** Ces quatre lignes
> étaient dans le tableau des ruptures silencieuses. Elles en sortent parce qu'elles n'y sont pas à
> leur place : les deux premières sont des **propriétés permanentes** d'une API (un refus est visible
> par construction, un ordre de résultats n'a jamais été garanti), la troisième est une
> **recommandation**, la quatrième un **énoncé général** sur le déterminisme. Aucune n'est un
> changement qui casse du code marchant. Le contenu est **inchangé**.

| Comportement | Portée | Source | → |
|---|---|---|---|
| Refus **hors schéma** : OpenAI champ `refusal` + statut `"incomplete"` ; Anthropic `stop_reason: "refusal"` en **HTTP 200 et facturé** | GPT-4o+ ; Anthropic | `[oai-so]` ; `[ant-struct]` « because the refusal message takes precedence over schema constraints » | 04 §1.3 |
| Enums : **comparer sans casse**, éviter les valeurs qui ne diffèrent que par la capitalisation | Anthropic | `[ant-struct]` | 04 §1.3 |
| Ordre des résultats **batch non garanti** → corréler par `custom_id`. (Non énoncé sur la page Gemini lue → **à vérifier**) | Anthropic, OpenAI | `[ant-batch]` « Batch results can be returned in any order » ; `[oai-batch]` | 04 §5.5 |
| **Aucun fournisseur ne garantit un output identique** : « identical requests are not guaranteed to produce identical outputs » ; `seed` OpenAI = best-effort, sur une page **archivée** | OpenAI ; Gemini ne mentionne pas `seed` sur la page lue (**à vérifier**) ; Anthropic : aucune source lue (**à vérifier**) | `[oai-caching]` ; `[oai-seed]` | 04 §5.6 |

---

## 4. Où placer une instruction, et ce que chaque couche garantit

> Le tableau officiel déterministe / non déterministe est `[texte brut]` (03 §1). La **règle de décision en
> deux questions** qui en découle est une **`Inférence de la note`** (03 §2).

| Couche | Ce qui y va | Ce que ça **garantit** | Source · portée | → |
|---|---|---|---|---|
| **Prompt** | la tâche, l'intention, les contraintes du tour | **rien** : le modèle lit et décide | `[cc-bp]` `[texte brut]` · Claude Code | 03 §1 |
| **Memory file** (`CLAUDE.md`, `AGENTS.md`, auto memory) — **coût permanent** | des faits vrais à chaque session, « concrete enough to verify » ; **viser < 200 lignes** (au-delà : plus de contexte **et** « reduce adherence ») | **rien** : traité « as context, not enforced configuration ». Deux instructions contradictoires → « Claude may pick one arbitrarily » | `[cc-memory]` `[texte brut]` · Claude Code | 03 §2 |
| **Rule path-scoped** (`.claude/rules/`) — **coût conditionnel** | ce qui ne concerne qu'une partie du codebase, frontmatter `paths` en globs. ⚠️ une rule **sans** `paths` est chargée au lancement, **même priorité** que `.claude/CLAUDE.md` | rien de plus qu'un memory file | `[cc-memory]` `[texte brut]` | 03 §2b |
| **Skill** — **coût différé** | procédures multi-étapes, checklists, référence longue. Déclencheur : « when a section of CLAUDE.md has grown into a procedure rather than a fact ». < 500 lignes, **l'essentiel en haut** (seul le début survit à la compaction) | rien. Et **`allowed-tools` ne restreint rien** : « every tool remains callable, and your permission settings still govern ». Gate d'approbation au niveau skill : `disable-model-invocation: true` pour les workflows à effets de bord. Une skill peut aussi porter un **hook** dans son frontmatter, qui s'applique alors de l'invocation jusqu'à la fin de la session (03 §6) | `[cc-skills]` `[extraction]` + `[texte brut]` | 03 §2 · §5 · §6 |
| **Tool description** | contexte implicite rendu explicite, usage d'exemple, cas limites, frontières entre outils, durée de vie des handles, **et le texte des messages d'erreur** comme instructions actionnables | rien — et côté MCP : « clients **MUST** consider tool annotations to be untrusted » | `[ant-tools]` `[extraction]` ; `[mcp-tools]` `[texte brut]` | 03 §4 · §7 |
| **Brief de sous-agent** | **tout** ce qu'on croyait global : un sous-agent ne reçoit ni le system prompt Claude Code, ni l'historique, ni « the skills you've already invoked », ni les fichiers lus. Un sous-agent sans project instructions démarre aussi **sans les `AGENTS.md`** | rien, et **rien ne s'y propage** → toute règle impérative se **redit** dans le brief | `[cc-subagents]` `[extraction]` ; `[cc-memory]` `[texte brut]` | 03 §3 |
| **Hook / deny rule / managed setting** — hors contexte, hors jugement | ce qui a **zéro exception** : « a hook is for a rule with *zero* exceptions ». `.env` → `deny` rule, qui tient « in every permission mode, including auto and `bypassPermissions` » | **l'exécution** : le harness « *has* to execute this ». Et un managed setting : « no personal settings file can override them » | `[cc-bp]` `[texte brut]` | 03 §1 · §7 · §8 |

**Les faux déterminismes, nommés par l'éditeur** `[texte brut]`, `[cc-bp]` → 03 §1 :
un hook `prompt` ou `agent` fait décider **un autre modèle** → « isn't deterministic either. For real enforcement, use a `command` or `http` hook » ;
le **mode auto est un classifieur**, « it can be wrong » ;
le hook `Stop` a un **plafond de huit blocages** consécutifs, puis Claude Code outrepasse et termine le tour (`CLAUDE_CODE_STOP_HOOK_BLOCK_CAP`) ;
une deny rule `Read` attrape `cat .env` mais « It won't catch a script that opens the file » ; une deny rule `WebFetch` « does nothing about `curl` to that same domain », sauf sandbox.

**Deux disciplines de volume**, même page : « Most of the time, you want Claude to decide » et « Whatever the scope, keep the enforced set small » — à quarante règles appliquées, « most are probably preferences ».

**Un import n'économise rien** : les fichiers importés sont chargés avec le `CLAUDE.md` qui les importe, « but don't reduce its context cost » ; profondeur max **4 sauts** `[cc-memory]` `[texte brut]` → 03 §3. Le seul mécanisme d'économie réel est le **chargement différé** (`Inférence de la note`).

---

## 5. Trois choses avant de faire confiance à un prompt en production

### 5.1 Evals

| À faire | Source · statut | → |
|---|---|---|
| Critères **Specific, Measurable, Achievable, Relevant** ; exemple officiel multidimensionnel : F1 ≥ 0,85 **et** 99,5 % non toxiques **et** 95 % sous 200 ms | `[ant-success]` `doc éditeur lue` | 05 §1.1 |
| **Held-out test set** « to avoid overfitting prompts to the evaluation data » | `[ant-tests]` | 05 §1.2 |
| Arbitrage assumé : **plus de questions avec un signal plus faible en grading automatique** vaut mieux que moins de questions notées à la main | `[ant-tests]` | 05 §1.2 |
| Grader avec **un autre modèle** que celui qui produit la sortie — **aucune magnitude publiée** | `[ant-tests]` | 05 §1.2 · §2.5 |
| Edge cases **obligatoires** : input manquant, très long, hostile, cas ambigus | `[ant-tests]` | 05 §1.2 |
| **Première chose à mesurer sur un juge** : sa consistency sous swap. Juges **de 2023** : Claude-v1 23,8 % / GPT-3.5 46,2 % / GPT-4 65,0 % (`HTML Table 2`) ; attaque de verbosité : 91,3 % / 91,3 % / **8,7 %** (`HTML Table 3`) — [arXiv:2306.05685](https://arxiv.org/html/2306.05685). **Magnitudes non transférables aux juges 2025-2026 ; ce qui transfère est la méthode** | `Inférence de la note` pour la priorité | 05 §2.2 · §2.6 · §2.7 |
| Mitigation la plus efficace mesurée : **reference-guided judge**, 70 % → 15 % (contre 30 % pour le CoT, et few-shot = **~4× le coût sans améliorer l'accord humain**) | [arXiv:2306.05685](https://arxiv.org/html/2306.05685) `HTML Table 4`, `HTML Table 13` | 05 §2.5 |
| **Self-enhancement bias : désaccord non tranché.** Zheng et al. **refusent de conclure** ; [arXiv:2410.21819](https://arxiv.org/abs/2410.21819) conclut à « a significant degree of self-preference bias », mécanisme attribué à la **perplexité** (donc changer de juge ne suffirait pas) | à présenter comme désaccord de littérature | 05 §2.4 |
| **Le trou à combler soi-même** : ni Anthropic ni OpenAI ne donne de **guidance statistique** — aucune taille d'échantillon minimale, aucun test de significativité. (Nuance : 52 950 derniers caractères des pages Anthropic non lus → **à vérifier**) | `Inférence de la note` | 05 §1.4 |
| Outils, à leur version établie : **promptfoo 0.125.1** (matrix views, assertions en CI, `trajectory:*`) ; **DeepEval 4.3.3** (métrique 0–1 vs `threshold`, `TaskCompletionMetric`) ; **Langfuse version non établie** (`/changelog` → 404) = le seul à faire du **versioning de prompts**. Les trois ne se recouvrent presque pas | `[promptfoo]`, `[deepeval]`, `[langfuse-dm]` `artefact lu` / `doc éditeur lue` | 05 §3 |

### 5.2 Épinglage

| À faire | Source · portée | → |
|---|---|---|
| **Pinner `reasoning_effort`** à la migration — le défaut dérive `medium` → `none` | `[oai-g52]` · GPT-5 → 5.1/5.2 | 02 §2.2 |
| Épingler la **version d'API**, pas seulement le modèle : le retrait de `temperature`/`top_p`/`top_k` en `2026-10-21` démontre qu'un prompt régresse **sans qu'aucun modèle ne change** | `[deprec]` + `Inférence de la note` | 05 §6.1 |
| Les **IDs sans date sont déjà des snapshots épinglés** à partir de 4.6 ; avant, l'alias est un pointeur vers l'ID daté | `[models]` « Every Claude model ID is a pinned snapshot, including the dateless IDs » | 02 §1.4 |
| Lire `line` au lieu de l'inférer de l'`id` | `[models]` | 02 §1.4 |
| Versionner le prompt : **git history, PR review, release tags, feature flags** (OpenAI) **ou** labels Langfuse immuables avec rollback sans déploiement. Arbitrage **gouvernance vs vélocité** — les labels sortent le prompt de la revue de code | `[oai-prompting]` ; `[langfuse-dm]` ; `Inférence de la note` | 05 §3.5 · §6.4 |
| ⚠️ Piège Langfuse : les SDK **cachent côté client** — un rollback « instantané » ne l'est que si le TTL est court | `[langfuse-dm]` | 05 §3.5 |
| **Prompt versioning first-party Anthropic : non établi à la source — ne pas affirmer** | `à vérifier` | 05 §3.6 |

### 5.3 Matrice de régression

> **La matrice est `modèle × plateforme × version d'API`, pas modèle seul** — `Inférence de la note` (05 §6.3).
> Et : **il n'existe, dans tout ce qui a été lu, aucune prescription officielle de protocole de régression inter-modèles.**

| Dimension | Ce qui la rend nécessaire | Source | → |
|---|---|---|---|
| **Modèle** | 4 taxons (Active / Legacy / Deprecated / Retired) ; « Deprecated models are likely to be less reliable than active models » ; préavis **≥ 60 jours** | `[deprec]` | 05 §6.4 · 02 §1.4 |
| **Plateforme** | les dates de dépréciation **ne valent que** pour les plateformes opérées par Anthropic. **Amazon Bedrock et Google-managed fixent leurs propres calendriers** | `[deprec]` | 05 §6.2 |
| **Version d'API** | voir §4.1 et 7.2 | `[deprec]` | 05 §6.1 |
| **Inventaire d'abord** | « on ne peut pas re-valider les prompts qu'on ne sait pas inventorier » — ordre : **inventaire → held-out set → rejeu sur les deux modèles → seuil**. Outil officiel : Console → *Usage* → **Export** CSV, usage **ventilé par clé API et par modèle** | `[deprec]` (l'outil) + `Inférence de la note` (l'ordre) | 05 §6.4 |

**Dépréciations imminentes à surveiller** (`doc éditeur lue`, 2026-11-09) → 05 §4 :
plateforme **OpenAI Evals** — lecture seule **31 oct. 2026**, arrêt **30 nov. 2026** `[oai-evals]` ;
**reusable prompt objects** OpenAI — « OpenAI is deprecating reusable prompt objects in the API. », arrêt de `v1/prompts` **30 nov. 2026** `[oai-prompting]` ;
**graders** OpenAI dépréciés dans les workflows evals et fine-tuning — **date non relevée, à vérifier** `[oai-graders]`.

---

## Clés de citation — URL + date de consultation

Toutes consultées le **2026-11-09**. Une ligne qui porte une de ces clés satisfait l'exigence « URL + date ».

**Anthropic — doc plateforme**
`[bp]` https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices ·
`[pe-overview]` .../prompt-engineering/overview ·
`[thinking]` https://platform.claude.com/docs/en/build-with-claude/thinking ·
`[effort]` .../build-with-claude/effort ·
`[caching]` .../build-with-claude/prompt-caching ·
`[models]` https://platform.claude.com/docs/en/models/overview ·
`[deprec]` https://platform.claude.com/docs/en/about-claude/model-deprecations ·
`[ant-struct]` .../build-with-claude/structured-outputs ·
`[ant-citations]` .../build-with-claude/citations ·
`[ant-batch]` .../build-with-claude/batch-processing ·
`[ant-success]` https://platform.claude.com/docs/en/test-and-evaluate/define-success ·
`[ant-tests]` .../test-and-evaluate/develop-tests ·
`[ant-halluc]` .../test-and-evaluate/strengthen-guardrails/reduce-hallucinations

**Anthropic — pages par modèle** (toutes sous `platform.claude.com/docs/en/build-with-claude/prompt-engineering/`)
`[f51]` prompting-claude-fable-5-1 · `[f5]` prompting-claude-fable-5 · `[s55]` prompting-claude-sonnet-5-5 ·
`[s5]` prompting-claude-sonnet-5 · `[o55]` prompting-claude-opus-5-5 · `[o5]` prompting-claude-opus-5 ·
`[o48]` prompting-claude-opus-4-8 · `[h55]` prompting-claude-haiku-5-5

**Anthropic — Engineering et Claude Code**
`[ant-ctx]` https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents ·
`[ant-tools]` https://www.anthropic.com/engineering/writing-tools-for-agents ·
`[cc-bp]` https://code.claude.com/docs/en/best-practices ·
`[cc-memory]` https://code.claude.com/docs/en/memory ·
`[cc-skills]` https://code.claude.com/docs/en/skills ·
`[cc-subagents]` https://code.claude.com/docs/en/sub-agents ·
`[cc-hooks]` https://code.claude.com/docs/en/hooks ·
`[cc-security]` https://code.claude.com/docs/en/security ·
`[cc-model]` https://code.claude.com/docs/en/model-config ·
`[cc-slash]` https://code.claude.com/docs/en/slash-commands

**OpenAI**
`[oai-reason]` https://developers.openai.com/api/docs/guides/reasoning-best-practices ·
`[oai-text]` .../guides/text · `[oai-so]` .../guides/structured-outputs ·
`[oai-caching]` .../guides/prompt-caching · `[oai-batch]` .../guides/batch ·
`[oai-graders]` .../guides/graders · `[oai-evals]` .../guides/evals · `[oai-prompting]` .../guides/prompting ·
`[oai-g5]` https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide ·
`[oai-g51]` .../gpt-5-1_prompting_guide · `[oai-g52]` .../gpt-5-2_prompting_guide ·
`[oai-seed]` https://developers.openai.com/cookbook/examples/reproducible_outputs_with_the_seed_parameter (**page archivée**) ·
`[oai-agentcard]` https://deploymentsafety.openai.com/chatgpt-agent/promptinjection

**Google**
`[g-strat]` https://aistudio.google.com/docs/prompting-strategies · `[g-think]` .../docs/thinking ·
`[g-long]` .../docs/long-context · `[g-search]` .../docs/google-search ·
`[g-struct]` .../docs/structured-output · `[g-caching]` .../docs/caching ·
`[g-batch]` .../docs/batch-api · `[g-text]` .../docs/text-generation ·
`[goo-inj]` https://blog.google/security/mitigating-prompt-injection-attacks/ (billet du 2025-06-13)

**Open-weight**
`[llama4]` https://dev.meta.ai/llama/docs/model-cards-and-prompt-formats/llama4/ (**rang 1**) ·
`[mistral]` https://docs.mistral.ai/guides/prompting_capabilities/ ·
`[qwen-concepts]` https://qwen.readthedocs.io/en/latest/getting_started/concepts.html ·
`[qwen-card]` https://huggingface.co/Qwen/Qwen3-235B-A22B (**rang 1**) ·
`[deepseek]` https://api-docs.deepseek.com/

**Standards, sécurité, outillage**
`[mcp-tools]` https://modelcontextprotocol.io/specification/2026-07-28/server/tools ·
`[mcp-sec]` https://modelcontextprotocol.io/specification/2026-07-28/basic/security_best_practices
(06 cite la révision **servie 2025-11-25** de cette même page — écart non arbitré, cf. README) ·
`[agentskills]` https://agentskills.io/specification · `[agents-md]` https://agents.md/ ·
`[owasp-llm01]` https://genai.owasp.org/llmrisk/llm01-prompt-injection/ (édition « 2025 ») ·
`[willison]` https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/ (**[PRATICIEN]**) ·
`[invariant-tp]` https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks (2025-04-01) ·
`[promptfoo]` https://www.promptfoo.dev/docs/intro/ (**0.125.1**, lue à la branche `main`) ·
`[deepeval]` https://deepeval.com/docs/getting-started (**4.3.3**, PyPI) ·
`[langfuse-dm]` https://langfuse.com/docs/prompt-management/data-model (**version non établie**) ·
`[dspy-opt]` https://raw.githubusercontent.com/stanfordnlp/dspy/main/docs/docs/learn/optimization/optimizers.md (**branche `main`, pas un tag**)

---

**Le trou transversal de toute la base, à ne jamais masquer : aucune mesure lue sur un modèle frontier 2026.**
La strate académique la plus récente lue est **août 2025** ; les juges LLM mesurés sont **de 2023** ; *Lost in the
Middle* porte sur des modèles **de 2023** ; l'étude long-context vs RAG est **de 2024**. → 01 §6 · 05 §2.6 ·
04 §4.4 · 07