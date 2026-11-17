# 00 — Cheat-sheet : la page qu'on garde ouverte

> **Base de référence embarquée dans le plugin prompts.** Pages consultées le **2026-11-09** ; à relire avant le **2026-12-07**. Un fait propre à un modèle (effort, thinking, paramètres, formulations) se relit sur la page officielle du modèle visé avant d'être affirmé : ce fichier dit où lire, pas ce qui est vrai aujourd'hui. Les renvois `→ NN` désignent les autres fichiers de ce dossier (même préfixe numérique) ; les notes de recherche citées ne sont pas publiées.


> **Ce fichier a été découpé le 2026-11-09.** Il ne garde que ce qu'on relit *pendant* le travail :
> la checklist avant d'envoyer, les ruptures d'API qui cassent du code sans rien dire, et les cinq
> questions avant un run non surveillé. **Tout le reste est dans [`00b-reference-rapide.md`](00b-reference-rapide.md)**
> — formulations à supprimer d'un prompt, calcul vs ton, couches d'instruction, evals, épinglage,
> matrice de régression. Rien n'a été supprimé à la découpe : les blocs ont été déplacés tels quels.
>
> **Comment lire.** Chaque ligne factuelle porte `[clé]` (= URL + date de consultation, table en bas),
> la **portée** (modèle / génération / version d'API à laquelle elle s'applique), et `→ NN` (le fichier
> de la base qui tient le détail et les réserves). **Aucune étiquette n'est promue ici** : `à vérifier`,
> `non sourçable`, `folklore`, `[MESURÉ]`, `[RECOMMANDÉ]`, `[extraction]`, `Inférence` gardent leur
> valeur d'origine. Une ligne sans clé ni étiquette n'existe pas dans ce fichier.
> **Toutes les pages ont été consultées le 2026-11-09.** Convention complète : `README.md`.

---

## 1. Checklist avant d'envoyer un prompt

| # | À faire | Source · portée | → |
|---|---|---|---|
| 1 | Lire **la page de prompting du modèle visé avant** les techniques générales | `[bp]` « Read the one for your model first, then the techniques that follow. » · 14 modèles nommés | 02 §1.0 |
| 2 | Régler `effort` **explicitement** (`low`…`max`) ; ne pas prompter pour la profondeur | `[effort]` « effort is the recommended way to control thinking depth » · là où l'adaptive existe | 02 §1.2 |
| 3 | Vérifier le **défaut** d'effort : `high` partout **sauf** Opus 5.5 et Haiku 5.5 → `medium` | `[effort]` · lineup courant | 02 §1.2 |
| 4 | Ne pas transposer un niveau d'effort d'un modèle à l'autre | `[f51]` « effort level names don't correspond to the same amount of thinking across models » | 02 §1.0 |
| 5 | Front-loader tâche, intention et contraintes **au premier tour** | `[s5]` « ambiguous or underspecified prompts… reduce token efficiency » · Sonnet 5 ; `[o48]` · Opus 4.8 | 02 §1.7 |
| 6 | Donner le **pourquoi**, pas que la règle | `[bp]` « Claude can generalize from the explanation. » · toutes | 02 §1.1 |
| 7 | Dire quoi faire, pas quoi ne pas faire | `[bp]` « Tell Claude what to do instead of what not to do » · toutes ; `[s5]` « Positive examples… more effective than negative examples » | 02 §1.1 |
| 8 | 3–5 examples, dans `<example>` / `<examples>`, **divers** | `[bp]` « Include 3–5 examples for best results. » · toutes générations courantes. Google **refuse de chiffrer** et avertit de l'overfit `[g-strat]` | 02 §1.1 · 07 |
| 9 | Documents longs **en haut**, question **à la fin**, dès 20k tokens | `[bp]` « Place your long documents and inputs near the top of your prompt » + « can improve response quality by up to 30 percent in tests » — **protocole non publié** · toutes | 02 §1.1 · 07 · 04 §4.1 (`[claim fournisseur]`) |
| 10 | Un seul format de délimiteur par prompt | `[g-strat]` « Choose one format and use it consistently within a single prompt » · Gemini ; `[mistral]` Markdown et/ou XML | 07 · 02 §4.2 |
| 11 | Espace de sortie énumérable → `enum` ou structured outputs, pas du prompt | `[bp]` « use either tools with an enum field containing your valid labels » · Anthropic ; `[oai-so]` « always using Structured Outputs instead of JSON mode when possible » | 04 §2.1 |
| 12 | Test de relecture humaine | `[bp]` « If they'd be confused, Claude will be too. » · toutes | 02 §1.1 |
| 13 | Rappeler qu'un gain de technique **sans intervalle de formats** est suspect | [arXiv:2310.11324](https://arxiv.org/abs/2310.11324) `abstract lu`, LLaMA-2-13B / « several widely used open-source LLMs » : jusqu'à **76 points** d'écart ; les auteurs recommandent de rapporter un intervalle. `Inférence de la note` pour la conséquence | 01 §4 |

---

## 2. Ruptures **silencieuses** — pas d'erreur, comportement changé

> Les ruptures qui renvoient une **erreur 400** sont visibles au premier test : elles sont dans
> `00b §3.1`. Celles-ci ne disent rien. Quatre lignes qui étaient ici au 09/11/2026 en sont sorties
> parce qu'elles décrivent des **propriétés permanentes** ou des **recommandations**, pas des
> changements silencieux — elles sont dans `00b §3.3`, pas perdues.

| Rupture | Portée | Source | → |
|---|---|---|---|
| `temperature`, `top_p`, `top_k` **ignorés**, à retirer des requêtes | **Google Gemini 4 et 3.6+**. Sur les Gemini 3 antérieurs, la consigne inverse : les **garder aux défauts**, les changer dégrade le raisonnement — inversion | `[g-strat]` | 02 §7.2 · §6.4 · 04 §5.6 |
| Dérive du **défaut** `reasoning_effort` : `medium` (GPT-5) → **`none`** (GPT-5.1, GPT-5.2). Correctif prescrit : **pinner** | OpenAI | `[oai-g52]` « Pin reasoning_effort » | 02 §2.2 · §7.2 |
| Mots-clés de schéma **retirés pendant la normalisation, sans erreur** : `minProperties`, `maxProperties`, `minLength`, `maxLength`, `uniqueItems`, `contains`, `minContains`, `maxContains`. `minItems`/`maxItems` sont, eux, **appliqués** | Gemini | `[g-struct]` « strips and ignores them » | 04 §1.1 |
| Nouveau tokenizer : 1M tokens ≈ **555k mots** (contre ~750k) | Anthropic, depuis **Opus 4.7** | `[models]` « introduced with Claude Opus 4.7 » | 02 §7.2 |
| **~30 % de tokens en plus** pour le même texte → les `max_tokens` calés sur 4.6 **tronquent** | Sonnet 5 | `[s5]` « approximately 30 percent more tokens for the same text » | 02 §7.2 |
| Thinking **actif par défaut** sans champ `thinking` (changement vs Sonnet 4.6) | Sonnet 5. À l'inverse, Opus 4.8/4.7/4.6, Sonnet 4.6 et 4.5 sont **off** sans ce champ | `[s5]` « This is a change from Claude Sonnet 4.6 » ; `[o48]` ; `[thinking]` | 02 §6.4 · 08 B.2 |
| Sélection des blocs de contenu **par position** | Opus 5, Sonnet 5.5, Sonnet 5, Haiku 5.5 | `[bp]` « Select content blocks by `type` rather than by position » | 02 §7.2 |
| Prompt trop court pour le cache → **traité sans cache, sans erreur** | Anthropic, tous. Minima : 512 / 1 024 / 2 048 / 4 096 tokens selon modèle | `[caching]` « Shorter prompts are processed without caching and no error is returned. » | 02 §1.3 · 04 §5.2 |
| Ordre de clés JSON instable dans les blocs `tool_use` → casse le cache | Anthropic, tous | `[caching]` « Unstable JSON key ordering in `tool_use` blocks » | 02 §7.2 |
| Changer thinking **ou** `output_config.effort` invalide les préfixes de messages (et **peut** invalider system et tools). Seul chemin qui préserve le cache : effort **per-message** (beta) | Anthropic, tous ; beta sur Fable 5.1, Sonnet 5.5, Haiku 5.5, Opus 5 (**pas sur Bedrock**) | `[caching]` « because the thinking configuration is rendered into the prompt » ; `[effort]` « which preserves the prompt cache » | 02 §7.4 |
| `instructions` (Responses API) **ne persiste pas** via `previous_response_id` | OpenAI | `[oai-text]` | 02 §7.2 |
| **Rôle `system` → `developer`** ; la page Text generation ne documente plus `system` du tout. Son acceptation en compatibilité est **à vérifier** | OpenAI, depuis `o1-2024-12-17` / Responses API | `[oai-reason]` « Developer messages are the new system messages » ; `[oai-text]` | 02 §7.2 · §9.2 |

> ⚠️ **NOUVEAU au 09/11/2026, et à placer avant de câbler un pipeline d'extraction.**
> **Citations et structured outputs sont mutuellement exclusifs chez Anthropic** :
> « Citations cannot be used together with structured outputs » — `[ant-citations]`, relu verbatim
> le 09/11/2026. On **ne peut pas** obtenir dans le même appel une sortie contrainte par schéma
> **et** des citations vers les passages sources : il faut deux appels, ou renoncer à l'un des deux.
> La même page impose aussi le tout-ou-rien : « citations must be enabled on all or none of the
> documents ».
>
> **Ce qui n'est pas lu, et pourquoi cette ligne n'est pas dans le tableau ci-dessus** : la page
> énonce l'exclusion, **pas le comportement de l'API** quand on demande les deux. Un `400` est
> rapporté par `résumé d'outil` sur la page structured-outputs, **non vérifié verbatim** → donc
> **à vérifier** s'il s'agit d'une erreur visible ou d'un abandon silencieux. → 04 §4.3

---

## 3. Les cinq questions avant un run non surveillé

Liste officielle, `[cc-bp]` `[texte brut]`, Claude Code → 03 §8.

| # | Question | Mécanismes nommés par la page |
|---|---|---|
| 1 | **Sait-il à quoi ressemble « fini » ?** | condition de goal, fichier de spec, test rouge à rendre vert |
| 2 | **Peut-il vérifier son propre travail ?** | suite de tests, hook `Stop`, étape de revue |
| 3 | **À quoi a-t-il le droit de toucher ?** | permission rules, `dontAsk`, sandbox, worktree, la seule branche où pousser |
| 4 | **Qu'est-ce qui l'arrête ?** | `--max-turns`, `--max-budget-usd`, spend limit |
| 5 | **Où va le résultat et qui signe ?** | une PR, un commentaire ou un résumé, puis une personne qui approuve le merge |

Le diagnostic qui motive la liste : « Claude stops when the work looks done » — sans rien à exécuter qui dise si le travail *est* fait, « that makes you the test suite ». **Exiger la preuve** : « the command it ran and its output, or the screenshot » ; « "All tests pass" on its own tells you very little ».

**Quatre ajouts de sécurité, même ordre d'idée :**
- **Critère de refus sans instrumentation** — la *lethal trifecta* : données privées + contenu non fiable + capacité de communiquer vers l'extérieur. **`[PRATICIEN]`, règle de conception, aucune mesure** `[willison]` → 06 §4.5.
- Le meilleur argument chiffré pour refuser cette combinaison : **67 %** de robustesse sur l'*active data exfiltration* en navigateur visuel, `[MESURÉ]` mais « test only the model's behavior, not our full end-to-end stack » `[oai-agentcard]` · ChatGPT agent → 06 §4.2.
- Un gate d'approbation qui **tronque** ne protège de rien : démo Cursor, la clé SSH exfiltrée restait invisible à l'approbateur `[invariant-tp]` ; règle inverse du spec MCP, montrer la commande exacte « without truncation » `[mcp-sec]` → 06 §3.2 · §6.
- Anthropic écrit l'irrésolution dans sa **documentation produit** : « no system is completely immune to all attacks » `[cc-security]` → 06 §4.1.

---

## Clés de citation — les 22 utilisées sur cette page

Toutes consultées le **2026-11-09**. Une ligne qui porte une de ces clés satisfait l'exigence
« URL + date ». **Table complète** (toutes les clés de la base) :
[`00b-reference-rapide.md`](00b-reference-rapide.md). ⚠️ **Les deux tables doivent rester
d'accord** : une clé modifiée se modifie dans les deux fichiers.

`[ant-citations]` .../build-with-claude/citations ·
`[bp]` https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices ·
`[caching]` .../build-with-claude/prompt-caching ·
`[cc-bp]` https://code.claude.com/docs/en/best-practices ·
`[cc-security]` https://code.claude.com/docs/en/security ·
`[effort]` .../build-with-claude/effort ·
`[f51]` prompting-claude-fable-5-1 · `[f5]` prompting-claude-fable-5 · `[s55]` prompting-claude-sonnet-5-5 ·
`[g-strat]` https://aistudio.google.com/docs/prompting-strategies · `[g-think]` .../docs/thinking ·
`[g-struct]` .../docs/structured-output · `[g-caching]` .../docs/caching ·
`[invariant-tp]` https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks (2025-04-01) ·
`[mcp-sec]` https://modelcontextprotocol.io/specification/2026-07-28/basic/security_best_practices ·
`[mistral]` https://docs.mistral.ai/guides/prompting_capabilities/ ·
`[models]` https://platform.claude.com/docs/en/models/overview ·
`[o48]` prompting-claude-opus-4-8 · `[h55]` prompting-claude-haiku-5-5 ·
`[oai-agentcard]` https://deploymentsafety.openai.com/chatgpt-agent/promptinjection ·
`[oai-g51]` .../gpt-5-1_prompting_guide · `[oai-g52]` .../gpt-5-2_prompting_guide ·
`[oai-reason]` https://developers.openai.com/api/docs/guides/reasoning-best-practices ·
`[oai-text]` .../guides/text · `[oai-so]` .../guides/structured-outputs ·
`[oai-text]` .../guides/text · `[oai-so]` .../guides/structured-outputs ·
`[s5]` prompting-claude-sonnet-5 · `[o55]` prompting-claude-opus-5-5 · `[o5]` prompting-claude-opus-5 ·
`[thinking]` https://platform.claude.com/docs/en/build-with-claude/thinking ·
`[willison]` https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/ (**[PRATICIEN]**) ·

---

**Le trou transversal de toute la base, à ne jamais masquer : aucune mesure lue sur un modèle frontier 2026.**
La strate académique la plus récente lue est **août 2025** ; les juges LLM mesurés sont **de 2023** ; *Lost in the
Middle* porte sur des modèles **de 2023** ; l'étude long-context vs RAG est **de 2024**. → 01 §6 · 05 §2.6 ·
04 §4.4 · 07