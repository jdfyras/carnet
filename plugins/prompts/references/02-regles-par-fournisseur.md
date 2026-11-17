# Règles de prompting par fournisseur et par génération de modèle

> **Base de référence embarquée dans le plugin prompts.** Pages consultées le **2026-11-09** ; à relire avant le **2026-12-07**. Un fait propre à un modèle (effort, thinking, paramètres, formulations) se relit sur la page officielle du modèle visé avant d'être affirmé : ce fichier dit où lire, pas ce qui est vrai aujourd'hui. Les renvois `→ NN` désignent les autres fichiers de ce dossier (même préfixe numérique) ; les notes de recherche citées ne sont pas publiées.


> **Ce que ce fichier est.** Le fichier qu'on ouvre pour répondre à : *quelle est la règle pour CE modèle, et qu'est-ce qui la prouve ?* Organisé par fournisseur, puis par génération. Chaque ligne porte sa source, sa date de consultation et la génération visée.
>
> **Notes de recherche lues, et jusqu'où.**
>
> | Note source | Taille | Lue | Fin atteinte |
> |---|---|---|---|
> | `research_notes/01-anthropic-officiel.md` | 723 lignes / ~100 Ko | lignes 1 → 723, en continu | **oui** |
> | `research_notes/02-autres-fournisseurs.md` | 295 lignes / ~48 Ko | lignes 1 → 295, en continu | **oui** |
>
> **Date de rédaction de ce fichier : 2026-11-09.** Toutes les pages citées ont été consultées par les chercheurs le **2026-11-09** ; la colonne « Source » répète cette date par ligne, comme exigé.
>
> **Rien dans ce fichier ne vient d'ailleurs que de ces deux notes.** Aucune recherche web n'a été faite ici. Ce qui n'est pas soutenu par les notes n'y figure pas. Les marqueurs **« à vérifier »** posés par les chercheurs sont reportés tels quels, en section 8, et ne sont jamais promus en affirmation.
>
> ### Avertissement de rang de source, à lire avant de citer
>
> - **Note 01 (Anthropic)** : pages ouvertes avec WebFetch, citations ≤ 15 mots. Trois URL per-technique historiques — `prefill-claudes-response`, `chain-prompts`, `long-context-tips` — **n'ont pas été testées** ; leur redirection vers la page consolidée est probable par analogie mais **à vérifier** (note 01, en-tête).
> - **Note 02 (autres fournisseurs)** : les pages ont été lues via WebFetch, « qui restitue la page à travers un modèle de résumé ». Les citations courtes **n'ont pas été recoupées caractère par caractère contre le HTML brut**. Pour un usage où le libellé engage (slide citée, document contractuel), rouvrir la page et recopier la phrase. **Seules deux sources de la note 02 sont de rang 1 (artefact)** : la model card Hugging Face Qwen3 et les formats de tokens Llama 4. Tout le reste est de rang 2 (doc éditeur). Aucun blog tiers, Reddit, Stack Overflow ni résumé d'IA.
> - Les notes n'emploient pas d'étiquettes littérales `[texte brut]` / `[extraction]` / `[claim fournisseur]` ligne par ligne : la provenance est portée par le rang ci-dessus, par les parenthèses `(…)` qui signalent une **paraphrase et non une citation**, et par la mention « constat de lecture » / « constat de fetch » là où les chercheurs l'ont écrite. Ces mentions sont reproduites ici, pas réinventées.
> - Plusieurs lignes de la note 02 n'ont **pas** de citation textuelle : leur colonne Citation porte une paraphrase entre parenthèses ou `—`. Aucune citation n'a été fabriquée pour combler une case.

---

## Sommaire

1. [Anthropic / Claude](#1--anthropic--claude)
2. [OpenAI](#2--openai)
3. [Google / Gemini](#3--google--gemini)
4. [Open-weight : Meta, Mistral, Qwen, DeepSeek](#4--open-weight--meta-mistral-qwen-deepseek)
5. [**Formulations à retirer**](#5--formulations-à-retirer)
6. [**Inversions entre générations**](#6--inversions-entre-générations)
7. [**Ruptures d'API qui cassent du code**](#7--ruptures-dapi-qui-cassent-du-code)
8. [Contradictions non arbitrées](#8--contradictions-non-arbitrées)
9. [**À vérifier**](#9--à-vérifier)

---

## 1 — Anthropic / Claude

### 1.0 Avant toute règle : la doc per-technique n'existe plus

Point d'architecture documentaire, pas de génération. Il conditionne la lecture de tout le reste.

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Les **sept** URL per-technique testées (`be-clear-and-direct`, `multishot-prompting`, `chain-of-thought`, `use-xml-tags`, `system-prompts`, `prompt-improver`, `prompting-tools`) redirigent toutes vers la même page consolidée | — (architecture doc) | [Prompting best practices][bp], 2026-11-09 (constat de fetch) | (constat de redirection, pas de citation) |
| La page consolidée est la référence unique et vivante | — | [Prompt engineering overview][pe-overview], 2026-11-09 | « That's the living reference; start there. » |
| Ordre de la doc : model-specific d'abord, techniques communes ensuite, migration en dernier — **pas** par efficacité décroissante | Fable 5.1 → Haiku 4.5 | [Prompting best practices][bp], 2026-11-09 | « Model-specific guidance first… Migration considerations last » |
| Chaque modèle courant a **sa propre** page de prompting, à lire **avant** les techniques générales | Fable 5.1, Fable 5, Sonnet 5.5, Sonnet 5, Opus 5.5, Opus 5, Opus 4.8, Haiku 5.5 | [Prompting best practices][bp], 2026-11-09 | « Read the one for your model first, then the techniques that follow. » |
| La page couvre explicitement 14 modèles nommés | Fable 5.1, Mythos 5.1, Fable 5, Mythos 5, Opus 5.5, Opus 5, Opus 4.8, Opus 4.7, Opus 4.6, Sonnet 5.5, Sonnet 5, Sonnet 4.6, Haiku 5.5, Haiku 4.5 | [Prompting best practices][bp], 2026-11-09 | « This is the reference for prompt engineering with current Claude models » |
| Une technique mesurée sur un modèle ne se transpose pas sans re-évaluation | toutes | [Prompting best practices][bp] §General principles, 2026-11-09 | « re-check it against your own evals before applying it to another » |
| Les noms de niveaux d'effort **ne correspondent pas** à la même quantité de thinking d'un modèle à l'autre | toutes (avertissement répété sur presque toutes les pages par modèle) | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « effort level names don't correspond to the same amount of thinking across models » |
| Le tutoriel interactif GitHub est daté Claude 3 et subordonné à la page best-practices | **historique** (écrit pour Claude 3) | [Prompt engineering overview][pe-overview], 2026-11-09 | « It was written for Claude 3 models » |

### 1.1 Règles valables sur toutes les générations courantes

Rien ici n'est model-specific. La note 01 porte ces lignes comme « toutes » ou « toutes générations courantes ».

**Clarté et contexte**

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Analogie du nouvel employé brillant mais sans contexte | toutes générations courantes | [Prompting best practices][bp] §Be clear and direct, 2026-11-09 | « Think of Claude as a brilliant but new employee who lacks context » |
| Test de validation par un collègue (le « key test », remplace l'ancienne « golden rule ») | toutes | [Prompting best practices][bp] §Be clear and direct, 2026-11-09 | « If they'd be confused, Claude will be too. » |
| Demander explicitement le surplus plutôt que de l'espérer | toutes | [Prompting best practices][bp], 2026-11-09 | « explicitly request it rather than relying on the model to infer » |
| Étapes séquentielles en listes numérotées quand l'ordre ou la complétude comptent | toutes | [Prompting best practices][bp], 2026-11-09 | « Provide instructions as sequential steps using numbered lists or bullet points » |
| Donner le *pourquoi*, pas seulement la règle : Claude généralise depuis l'explication | toutes | [Prompting best practices][bp] §Add context, 2026-11-09 | « Claude can generalize from the explanation. » |
| Prérequis avant de prompt-engineer : critères de succès + évals + brouillon de prompt | toutes | [Prompt engineering overview][pe-overview], 2026-11-09 | « A clear definition of the success criteria for your use case » |
| Le prompt engineering n'est pas la réponse à tout (latence/coût → changer de modèle) | toutes | [Prompt engineering overview][pe-overview], 2026-11-09 | « you can sometimes improve latency and cost more easily by choosing a different model » |

**Examples (few-shot)**

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Nombre recommandé : **3 à 5** examples | toutes générations courantes | [Prompting best practices][bp] §Use examples effectively, 2026-11-09 | « Include 3–5 examples for best results. » |
| Trois critères : Relevant, Diverse, Structured | toutes | [Prompting best practices][bp], 2026-11-09 | « Relevant… Diverse… Structured » |
| Diversité = éviter que le modèle apprenne un pattern parasite | toutes | [Prompting best practices][bp], 2026-11-09 | « vary enough that Claude doesn't pick up unintended patterns » |
| Balisage : `<example>` par example, `<examples>` autour de l'ensemble | toutes | [Prompting best practices][bp], 2026-11-09 | « Wrap examples in `<example>` tags (multiple examples in `<examples>` tags) » |
| Levier le plus fiable sur format / ton / structure | toutes | [Prompting best practices][bp], 2026-11-09 | « one of the most reliable ways to steer Claude's output format » |
| On peut faire auditer ou étendre son propre jeu d'examples par Claude | toutes | [Prompting best practices][bp], 2026-11-09 | « ask Claude to evaluate your examples for relevance and diversity » |
| Les examples fonctionnent **avec** le thinking (problème / méthode / réponse attendue) | 4.6+ et 5.x | [Prompting best practices][bp] §Leverage thinking, 2026-11-09 | « Worked examples in your prompt shape how Claude approaches similar problems » |

**XML tags**

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Objectif : parsing non ambigu quand le prompt mélange instructions, contexte, examples, inputs | toutes générations courantes | [Prompting best practices][bp] §Structure prompts with XML tags, 2026-11-09 | « XML tags help Claude parse complex prompts unambiguously » |
| Un tag par type de contenu réduit la mauvaise interprétation | toutes | [Prompting best practices][bp], 2026-11-09 | « Wrapping each type of content in its own tag… reduces misinterpretation » |
| Noms de tags cohérents et descriptifs d'un prompt à l'autre | toutes | [Prompting best practices][bp], 2026-11-09 | « Use consistent, descriptive tag names across your prompts. » |
| Imbrication quand la hiérarchie est naturelle | toutes | [Prompting best practices][bp], 2026-11-09 | « Nest tags when content has a natural hierarchy » |
| Pas de vocabulaire canonique imposé ; exemples cités : `<instructions>`, `<context>`, `<input>`, `<document>`, `<document_content>`, `<source>`, `<example>`, `<answer>`, `<quotes>` | toutes | [Prompting best practices][bp] (+ §Long context, §Thinking), 2026-11-09 | « for example, `<instructions>`, `<context>`, `<input>` » |
| Les tags servent aussi d'**indicateurs de format de sortie** | toutes | [Prompting best practices][bp] §Control the format of responses, 2026-11-09 | « Write the prose sections of your response in \<smoothly_flowing_prose_paragraphs> tags. » |

**System prompt et rôle**

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Le rôle va dans le **system prompt** ; une phrase suffit à faire une différence | toutes générations courantes | [Prompting best practices][bp] §Give Claude a role, 2026-11-09 | « Setting a role in the system prompt focuses Claude's behavior and tone » |
| Exemple canonique de system minimal | Opus 5.5 (`claude-opus-5-5` dans l'exemple) | [Prompting best practices][bp], 2026-11-09 | « You are a helpful coding assistant specializing in Python. » |
| Bloc system fourni pour l'identité du modèle en production | Opus 5.5 (exemple) | [Prompting best practices][bp] §Model self-knowledge, 2026-11-09 | « The assistant is Claude, created by Anthropic. » |

**Long context**

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Seuil déclencheur : inputs de 20k tokens et plus | toutes générations courantes | [Prompting best practices][bp] §Long context prompting, 2026-11-09 | « large documents or data-rich inputs (20k+ tokens) » |
| Documents **en haut** du prompt, au-dessus de la question, des instructions et des examples | toutes (« across all models ») | [Prompting best practices][bp], 2026-11-09 | « Place your long documents and inputs near the top of your prompt » |
| Gain mesuré de la question placée à la fin : **jusqu'à 30 %** | toutes | [Prompting best practices][bp], 2026-11-09 | « can improve response quality by up to 30 percent in tests » |
| Structure multi-documents : `<documents>` / `<document index="n">` / `<source>` / `<document_content>` | toutes | [Prompting best practices][bp], 2026-11-09 | « wrap each document in `<document>` tags with `<document_content>` and `<source>` » |
| Grounding par citation : faire extraire les passages pertinents **avant** la tâche | toutes | [Prompting best practices][bp], 2026-11-09 | « ask Claude to quote relevant parts of the documents first » |
| Effet attendu du grounding : focaliser et ignorer le reste | toutes | [Prompting best practices][bp], 2026-11-09 | « helps Claude focus on the relevant content and ignore the rest » |

**Format de sortie**

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Dire ce qu'il faut faire, pas ce qu'il ne faut pas faire | toutes générations courantes | [Prompting best practices][bp] §Control the format of responses, 2026-11-09 | « Tell Claude what to do instead of what not to do » |
| Faire correspondre le style du prompt au style de sortie voulu | toutes | [Prompting best practices][bp], 2026-11-09 | « removing markdown from your prompt can reduce the volume of markdown » |

**Chaining**

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Reste utile pour inspecter les sorties intermédiaires ou imposer un pipeline | toutes | [Prompting best practices][bp] §Chain complex prompts, 2026-11-09 | « when you need to inspect intermediate outputs or enforce a specific pipeline structure » |
| Pattern le plus courant : self-correction (draft → review contre critères → refine), un appel API par étape | toutes | [Prompting best practices][bp], 2026-11-09 | « generate a draft → have Claude review it against criteria → have Claude refine » |

### 1.2 Génération 4.6+ et 5.x : ce qui change par rapport aux générations antérieures

**Prefill — supprimé**

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Le prefill du dernier tour assistant n'est plus supporté | **à partir de 4.6** + Mythos Preview | [Prompting best practices][bp] §Migrating away from prefilled responses, 2026-11-09 | « prefilled responses… are no longer supported » |
| Une requête avec prefill renvoie une **erreur 400** | 4.6+ | [Prompting best practices][bp], 2026-11-09 | « Requests with prefilled assistant messages to these models return a 400 error. » |
| Les modèles antérieurs continuent de l'accepter ; un message assistant ailleurs dans la conversation reste valide | **historique** : ≤ 4.5 | [Prompting best practices][bp], 2026-11-09 | « Earlier models continue to support prefills » |
| Justification officielle | 4.6+ | [Prompting best practices][bp], 2026-11-09 | « most use cases of prefill no longer require it » |
| Substitut pour forcer un format (JSON/YAML, classification) : structured outputs, ou un tool avec champ enum | 4.6+ | [Prompting best practices][bp], 2026-11-09 | « The structured outputs feature is designed specifically to constrain Claude's responses » |
| Substitut pour supprimer le préambule : instruction system directe, XML tags, tool calling, ou post-traitement | 4.6+ | [Prompting best practices][bp], 2026-11-09 | « Respond directly without preamble. » |
| Substitut pour éviter les refus abusifs : plus besoin de prefill | 4.6+ | [Prompting best practices][bp], 2026-11-09 | « Claude is much better at appropriate refusals now. » |
| Substitut pour les continuations : déplacer la continuation dans le message **user**, en citant le texte interrompu | 4.6+ | [Prompting best practices][bp], 2026-11-09 | « Move the continuation to the user message » |
| Substitut pour l'hydratation de contexte : injecter dans le tour user, ou passer par des tools / la compaction | 4.6+ | [Prompting best practices][bp], 2026-11-09 | « inject what were previously prefilled-assistant reminders into the user turn » |

**Chain of thought — rétrogradé en fallback**

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Le CoT manuel n'est plus la technique de référence, c'est un **fallback** quand le thinking est coupé | 4.6+ / 5.x | [Prompting best practices][bp] §Leverage thinking, 2026-11-09 | « Manual chain-of-thought (CoT) prompting as a fallback. » |
| Forme du fallback : raisonner avant de répondre, réponse finale dans `<answer>` | modèles où le thinking est off | [Prompting best practices][bp], 2026-11-09 | « put the final answer in `<answer>` tags so you can extract it » |
| Demander au modèle d'écrire son raisonnement **peut être refusé** | Fable 5.1, Fable 5, Opus 5.5, Opus 5, Sonnet 5.5 | [Prompting best practices][bp], 2026-11-09 | « may be declined » |
| Sur ces modèles : s'appuyer sur le thinking, à effort plus bas si coût/latence | Fable 5.1, Fable 5, Opus 5.5, Opus 5, Sonnet 5.5 | [Prompting best practices][bp], 2026-11-09 | « rely on thinking instead, at a lower effort level » |
| Préférer les instructions générales aux plans d'étapes écrits à la main | 4.6+ / 5.x | [Prompting best practices][bp], 2026-11-09 | « A prompt such as "think thoroughly" often produces better reasoning » |
| Le raisonnement du modèle dépasse souvent ce qu'un humain prescrirait | 4.6+ / 5.x | [Prompting best practices][bp], 2026-11-09 | « Claude's reasoning frequently exceeds what a human would prescribe. » |
| Demander l'auto-vérification avant de finir | 4.6+ / 5.x, **sauf Opus 5** | [Prompting best practices][bp], 2026-11-09 | « Before you finish, verify your answer against [test criteria]. » |
| **Opus 5 est l'exception** : retirer les instructions de vérification héritées, ne pas les réécrire | **Opus 5 uniquement** | [Prompting best practices][bp], 2026-11-09 | « On Claude Opus 5, remove these instructions rather than rewriting them. » |
| Quand le thinking est désactivé, Opus 4.5 est hypersensible au mot « think » | **Opus 4.5 uniquement** | [Prompting best practices][bp] (Note), 2026-11-09 | « Consider using alternatives such as "consider," "evaluate," or "reason through" » |
| Le chaînage explicite n'est plus nécessaire pour le raisonnement multi-étapes | 4.6+ / 5.x | [Prompting best practices][bp] §Chain complex prompts, 2026-11-09 | « Claude handles most multistep reasoning internally. » |

**Configuration du thinking**

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Syntaxe adaptive : `thinking: {"type": "adaptive"}` avec `output_config: {"effort": "high"}` | 4.6+ / 5.x | [Thinking][thinking], 2026-11-09 | « thinking: {type: "adaptive"} » |
| Le modèle décide quand et combien penser, calibré par l'effort **et** la complexité | 4.6+ / 5.x | [Prompting best practices][bp] §Leverage thinking, 2026-11-09 | « Claude dynamically determines when and how much to think » |
| Sur les requêtes faciles, pas de bloc thinking | 4.6+ / 5.x | [Prompting best practices][bp], 2026-11-09 | « the model responds directly » |
| Migration recommandée vers l'adaptive, sur la base d'évals internes | 4.6+ / 5.x | [Prompting best practices][bp], 2026-11-09 | « adaptive thinking reliably drives better performance than extended thinking » |
| `display` contrôle la restitution du texte de thinking ; défaut `"omitted"` | Claude 5+ et Mythos Preview | [Thinking][thinking], 2026-11-09 | « `display` defaults to `"omitted"` on these models » |
| `display: "omitted"` réduit la latence, **pas** le coût | 5.x | [Thinking][thinking], 2026-11-09 | « You're still charged for the full thinking tokens. » |
| Ne pas ajouter de paramètre `thinking` si on ne veut pas de thinking | toutes | [Prompting best practices][bp], 2026-11-09 | « you don't need to add a `thinking` parameter » |
| Si le modèle pense trop souvent (gros system prompt), un prompt de frein est fourni | 4.6+ / 5.x | [Prompting best practices][bp], 2026-11-09 | « When in doubt, respond directly. » |
| Ne pas sélectionner les blocs de contenu par position : le thinking peut ouvrir la réponse | Opus 5, Sonnet 5.5, Sonnet 5, Haiku 5.5 | [Prompting best practices][bp], 2026-11-09 | « Select content blocks by `type` rather than by position » |

**Matrice de thinking par modèle** — `enabled` + `budget_tokens` renvoie 400 partout sauf Mythos Preview, Opus 4.6 et Sonnet 4.6. Source : [Thinking][thinking], consultée 2026-11-09. Précision de lecture reportée de la note : « “at `high` effort or below” means the request works at `low`, `medium`, and `high` effort ».

| Modèle | Sans champ `thinking` | `"adaptive"` | `"enabled"` + `budget_tokens` | `"between_tools"` | `"disabled"` |
|---|---|---|---|---|---|
| Opus 5.5 | adaptive | adaptive | **400** | **400** | **400** |
| Sonnet 5.5 | adaptive | adaptive | **400** | off up-front à effort ≤ high | **400** |
| Haiku 5.5 | adaptive | adaptive | **400** | **400** | off à effort ≤ high |
| Fable 5.1 / Mythos 5.1 | adaptive | adaptive | **400** | **400** | **400** |
| Fable 5 / Mythos 5 | adaptive | adaptive | **400** | **400** | **400** |
| Opus 5 | adaptive | adaptive | **400** | **400** | off à effort ≤ high |
| Sonnet 5 | adaptive | adaptive | **400** | **400** | off |
| Opus 4.8 / Opus 4.7 | **off** | adaptive | **400** | **400** | off |
| Mythos Preview | adaptive | adaptive | extended thinking | **400** | **400** |
| Opus 4.6 / Sonnet 4.6 | **off** | adaptive | extended thinking (**deprecated**) | **400** | off |
| Opus 4.5 / Sonnet 4.5 / Haiku 4.5 | **off** | **400** | extended thinking | **400** | off |

**Effort — le remplaçant du budget**

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| 5 niveaux : `low`, `medium`, `high`, `xhigh`, `max` ; via `output_config.effort` | Fable 5.1 → Opus 4.5 | [Effort][effort], 2026-11-09 | « Set `output_config.effort` on the request. » |
| Voie **recommandée** pour contrôler la profondeur du thinking | là où l'adaptive existe | [Effort][effort], 2026-11-09 | « effort is the recommended way to control thinking depth » |
| Ce n'est **pas** un budget de tokens strict | toutes | [Effort][effort], 2026-11-09 | « Effort is a behavioral signal, not a strict token budget. » |
| Agit sur **tous** les tokens de sortie, thinking et texte, et sur les tool calls | toutes | [Effort][effort], 2026-11-09 | « Lower effort also means fewer and terser tool calls. » |
| Défaut `high` partout **sauf** Opus 5.5 et Haiku 5.5 → `medium` | voir lineup §1.4 | [Effort][effort], 2026-11-09 | « Claude Opus 5.5 and Claude Haiku 5.5 default to medium » |
| Passer l'effort à sa valeur par défaut == l'omettre | toutes | [Effort][effort], 2026-11-09 | « produces exactly the same behavior as omitting the `effort` parameter entirely » |
| Fable 5.1 : partir de `high`, monter à `xhigh`/`max` pour l'agentique sensible, descendre après évals | **Fable 5.1** | [Effort][effort], 2026-11-09 | « Start with `high`, the default. » |
| Opus 4.7 / 4.8 : partir de **`xhigh`** pour coding et agentique | **Opus 4.7, Opus 4.8** | [Effort][effort], 2026-11-09 | « Start with `xhigh` for coding and agentic use cases » |
| `max` : réservé aux problèmes frontière ; peut provoquer de l'overthinking sur les sorties structurées | Opus 4.7+ | [Effort][effort], 2026-11-09 | « Reserve for frontier problems. » |
| À `xhigh`/`max`, prévoir un `max_tokens` large (départ suggéré : 64k) | Opus 4.7, Opus 4.8, Opus 5 | [Effort][effort], 2026-11-09 | « Starting at 64k tokens and tuning from there is a reasonable default. » |
| Opus 4.7 respecte l'effort plus strictement : si raisonnement superficiel, **monter l'effort** | **Opus 4.7** | [Effort][effort], 2026-11-09 | « raise effort rather than prompting around it » |
| Sur Opus 5, l'effort ne contrôle pas la longueur visible de réponse | **Opus 5** | [Effort][effort], 2026-11-09 | « changing effort does not reliably shorten responses » |
| Effort mid-conversation (per-message `output_config`) : **beta**, préserve le cache | Fable 5.1, Sonnet 5.5, Haiku 5.5, Opus 5 (pas sur Bedrock) | [Effort][effort], 2026-11-09 | « which preserves the prompt cache » |
| Utiliser `max_tokens` comme plafond dur, pas un budget de thinking | 4.7+ | [Prompting best practices][bp] §Overthinking, 2026-11-09 | « using `max_tokens` as a hard limit with adaptive thinking » |

**Style, verbosité, formatage par génération**

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Style par défaut des modèles récents : plus direct, plus conversationnel, **moins verbeux** | « Claude's latest models » | [Prompting best practices][bp] §Communication style, 2026-11-09 | « Less verbose: Might skip detailed summaries for efficiency unless prompted otherwise » |
| **Opus 5 est l'exception verbosité** : réponses plus longues, et l'effort ne raccourcit pas de façon fiable | **Opus 5 uniquement** | [Prompting best practices][bp], 2026-11-09 | « Prompt explicitly for conciseness instead. » |
| **Fable 5.1 a la tendance inverse** : moins d'updates user-facing en agentique ; retirer les consignes de brièveté | **Fable 5.1 uniquement** | [Prompting best practices][bp], 2026-11-09 | « remove any instruction telling it to keep that text brief » |
| Le bloc anti-markdown fourni par la doc peut **nuire** sur Fable 5.1, qui formate déjà peu | **Fable 5.1 uniquement** | [Prompting best practices][bp], 2026-11-09 | « a block like this can suppress structure the content needs » |
| Les modèles récents passent par défaut en **LaTeX** pour les maths ; un bloc est fourni pour le texte brut | « Claude's latest models » | [Prompting best practices][bp] §LaTeX output, 2026-11-09 | « default to LaTeX for mathematical expressions » |

**Tool use et systèmes agentiques**

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Les modèles 4.5/4.6 sont **plus** sensibles au system prompt : les formules agressives sur-déclenchent | Opus 4.5, Opus 4.6 | [Prompting best practices][bp] §Tool usage, 2026-11-09 | « The fix is to soften any aggressive language. » |
| Remplacer « CRITICAL: You MUST use this tool when… » par « Use this tool when… » | Opus 4.5, Opus 4.6 | [Prompting best practices][bp], 2026-11-09 | « you can use more normal prompting such as "Use this tool when…" » |
| « Can you suggest… » produit des suggestions ; pour une action, formuler à l'impératif | « Claude's latest models » | [Prompting best practices][bp] §Tool usage, 2026-11-09 | « For Claude to take action, be more explicit » |
| Deux blocs system opposés fournis : `<default_to_action>` et `<do_not_act_before_instructions>` | « Claude's latest models » | [Prompting best practices][bp], 2026-11-09 | « By default, implement changes rather than only suggesting them. » |
| Parallélisme des tool calls déjà natif, mais promptable à ~100 % via `<use_parallel_tool_calls>` | « Claude's latest models » | [Prompting best practices][bp] §Optimize parallel tool calling, 2026-11-09 | « you can boost this to about 100 percent » |
| Sur Fable 5.1 en boucle longue : instruction de parallélisme en **system message turn-scoped** après chaque round | **Fable 5.1 uniquement** | [Prompting best practices][bp], 2026-11-09 | « send the parallel-calls instruction as a turn-scoped system message » |
| Opus 4.6 sur-explore : remplacer les défauts absolus par des instructions ciblées, retirer le sur-prompting, baisser l'effort | **Opus 4.6** | [Prompting best practices][bp] §Overthinking, 2026-11-09 | « Instructions such as "If in doubt, use [tool]" cause overtriggering. » |
| Prompt fourni contre la ré-délibération | Opus 4.6 | [Prompting best practices][bp], 2026-11-09 | « choose an approach and commit to it » |
| Bloc fourni pour exiger confirmation avant actions destructrices / irréversibles / visibles par d'autres | **Opus 4.6** | [Prompting best practices][bp] §Balancing autonomy and safety, 2026-11-09 | « for actions that are hard to reverse… ask the user before proceeding » |
| Les subagents sont orchestrés nativement, sans instruction explicite ; surveiller la **sur-utilisation** | Opus 4.6, Opus 5 | [Prompting best practices][bp] §Subagent orchestration, 2026-11-09 | « Claude delegates appropriately without explicit instruction. » |
| Bloc anti-over-engineering fourni (scope, documentation, defensive coding, abstractions) | **Opus 4.5, Opus 4.6** | [Prompting best practices][bp] §Overeagerness, 2026-11-09 | « Avoid over-engineering. Only make changes that are directly requested » |
| Bloc anti-hardcoding / anti-« faire passer les tests » fourni | « Claude » (non daté par modèle dans la source) | [Prompting best practices][bp], 2026-11-09 | « Tests are there to verify correctness, not to define the solution. » |
| Bloc `<investigate_before_answering>` contre l'hallucination en coding agentique | « Claude's latest models » | [Prompting best practices][bp], 2026-11-09 | « Never speculate about code you have not opened. » |
| Workflows multi-context-window : premier context window différent, tests en JSON, scripts de setup, git comme état | « Claude's latest models » | [Prompting best practices][bp] §Agentic systems, 2026-11-09 | « It is unacceptable to remove or edit tests » |
| Context awareness (suivi du budget de tokens restant) limité à une liste nommée | **Sonnet 5, Sonnet 4.6, Sonnet 4.5 (deprecated), Haiku 4.5** | [Prompting best practices][bp], 2026-11-09 | « which lets the model track its remaining context window » |
| Bloc fourni pour empêcher l'arrêt prématuré sous contrainte de contexte | Sonnet 5, Sonnet 4.6, Sonnet 4.5, Haiku 4.5 | [Prompting best practices][bp], 2026-11-09 | « Never artificially stop any task early regardless of the context remaining. » |
| Bloc `<frontend_aesthetics>` contre l'esthétique « AI slop » | **Opus 4.5, Opus 4.6** | [Prompting best practices][bp] §Frontend design, 2026-11-09 | « In frontend design, this creates what users call the "AI slop" aesthetic. » |
| Tool de crop / zoom : uplift mesuré sur les évaluations image | **Opus 4.5, Opus 4.6** | [Prompting best practices][bp] §Improved vision, 2026-11-09 | « Testing has shown consistent uplift on image evaluations » |
| Blocs `<medical_guidance>` **différents par modèle**, à recopier exactement | blocs distincts : (Fable 5.1 / Fable 5 / Opus 5.5 / Opus 5 / Opus 4.8 / Opus 4.7 / Opus 4.6 / Sonnet 5.5 / Sonnet 5), puis Haiku 5.5, Sonnet 4.6, Haiku 4.5 | [Prompting best practices][bp] §Medication dosing, 2026-11-09 | « add the block below for the model your application calls… exactly as written » |

### 1.3 Prompt caching — ce qui dépend de la génération

**Minimum cacheable, par génération** ([Prompt caching][caching], 2026-11-09) :

| Minimum | Modèles |
|---|---|
| **512 tokens** | Fable 5.1, Mythos 5.1, Opus 5.5, Opus 5, Sonnet 5.5, Fable 5, Mythos 5, Haiku 5.5 |
| **1 024 tokens** | Opus 4.8, Sonnet 5, Sonnet 4.6, Sonnet 4.5, Opus 4.1, Opus 4, Sonnet 4 |
| **2 048 tokens** | Mythos Preview, Opus 4.7 |
| **4 096 tokens** | Opus 4.6, Opus 4.5, Haiku 4.5 |

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Activation par `cache_control` top-level (automatique) ou par bloc de contenu (explicite) | tous modèles actifs | [Prompt caching][caching], 2026-11-09 | `{ "cache_control": { "type": "ephemeral" } }` |
| Maximum **4** breakpoints ; le caching automatique en consomme un | tous modèles actifs | [Prompt caching][caching], 2026-11-09 | « You can define up to 4 cache breakpoints. » |
| Au plus **20 positions** testées par breakpoint | tous modèles actifs | [Prompt caching][caching], 2026-11-09 | « The system checks at most 20 positions for each breakpoint. » |
| TTL par défaut **5 minutes**, rafraîchi gratuitement à chaque usage | tous modèles actifs | [Prompt caching][caching], 2026-11-09 | « By default, the cache has a 5-minute lifetime. » |
| TTL alternatif **1 heure**, à 2× le prix d'entrée de base | tous modèles actifs | [Prompt caching][caching], 2026-11-09 | « You can specify a 1-hour TTL at 2x the base input token price. » |
| Écriture 5 min : **1,25×** le prix d'entrée de base | tous modèles actifs | [Prompt caching][caching], 2026-11-09 | « are 1.25 times the base input tokens price » |
| Lecture : **0,1×** le prix d'entrée de base, avec exceptions ci-dessous | tous modèles actifs | [Prompt caching][caching], 2026-11-09 | « are 0.1 times the base input tokens price » |
| Exception lecture : **0,025×** | **Fable 5.1, Mythos 5.1** | [Prompt caching][caching] + [Models overview][models], 2026-11-09 | « 2.5% on Claude Fable 5.1 and Claude Mythos 5.1 » |
| Exception lecture : **0,05×** | **Opus 5.5, Sonnet 5.5** | [Prompt caching][caching], 2026-11-09 | « 5% on Claude Opus 5.5 and Claude Sonnet 5.5 » |
| Cache reads Fable 5.1 : 0,25 $/MTok, soit 2,5 % du prix d'entrée | Fable 5.1 | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « 2.5 percent of the input price » |
| Les breakpoints en eux-mêmes ne coûtent rien | tous | [Prompt caching][caching], 2026-11-09 | « Cache breakpoints add no cost. » |
| Hiérarchie de préfixe `tools` → `system` → `messages` ; un changement invalide ce niveau et tous les suivants | tous | [Prompt caching][caching], 2026-11-09 | « A change at one level invalidates that level and every level after it. » |
| Hash cumulatif : tout changement au niveau du breakpoint ou avant invalide | tous | [Prompt caching][caching], 2026-11-09 | « since the hash is cumulative » |
| Le TTL démarre au **début** de la requête : une génération longue consomme la fenêtre | tous | [Prompt caching][caching], 2026-11-09 | « The lifetime starts when the request starts » |
| Un prompt trop court est traité sans cache, **sans erreur** | tous | [Prompt caching][caching], 2026-11-09 | « Shorter prompts are processed without caching and no error is returned. » |
| Vérifier le hit via `cache_creation_input_tokens` et `cache_read_input_tokens` | tous | [Prompt caching][caching], 2026-11-09 | « Check `cache_creation_input_tokens` and `cache_read_input_tokens` » |
| Placer le breakpoint sur le dernier bloc identique entre requêtes | tous | [Prompt caching][caching], 2026-11-09 | « Put the breakpoint on the last block that stays identical across requests. » |
| **Un seul breakpoint en fin de contenu statique suffit dans la plupart des cas** | tous modèles actifs | [Prompt caching][caching] §FAQ, 2026-11-09 | « a single cache breakpoint at the end of your static content is sufficient » |
| Les écritures n'ont lieu qu'au bloc marqué | tous | [Prompt caching][caching] §FAQ, 2026-11-09 | « Cache writes occur only at the block you mark. » |
| Confidentialité : représentations KV et hachages en mémoire seulement, jamais au repos | tous | [Prompt caching][caching] §FAQ, 2026-11-09 | « held in memory only and are not stored at rest » |
| Isolation entre organisations, et entre workspaces (Claude API, Claude Platform on AWS, Microsoft Foundry) | tous | [Prompt caching][caching] §FAQ, 2026-11-09 | « Cache entries are isolated between organizations » |
| Durée de vie minimale garantie ; suppression « prompte mais pas immédiate » | tous | [Prompt caching][caching] §FAQ, 2026-11-09 | « promptly, though not immediately, deleted » |
| `total_input_tokens = cache_read + cache_creation + input_tokens` | tous | [Prompt caching][caching] §FAQ, 2026-11-09 | « Tokens **after the last cache breakpoint** that aren't cached » |
| Cette décomposition gouverne **aussi** la consommation de rate limit | tous | [Prompt caching][caching] §FAQ, 2026-11-09 | « critical for understanding both your costs and rate limit usage » |
| Fenêtre utile pour un follow-up = durée de vie **moins** le temps de génération | tous | [Prompt caching][caching] §FAQ, 2026-11-09 | « the lifetime minus the generation time » |
| Changer les paramètres de thinking invalide les préfixes de messages, et **peut** invalider system et tools | tous | [Prompt caching][caching] §FAQ, 2026-11-09 | « because the thinking configuration is rendered into the prompt » |
| `output_config.effort` se comporte exactement de la même manière | tous | [Prompt caching][caching] §FAQ, 2026-11-09 | « The `output_config.effort` value behaves the same way. » |
| Changer la présence d'images ou les réglages de tool use casse le cache | tous | [Prompt caching][caching] §FAQ, 2026-11-09 | « modifying tool use settings breaks the cache » |
| Architecture à 3 segments (tools / instructions / documents RAG) : mettre à jour les documents RAG sans invalider le reste | tous | [Prompt caching][caching] §FAQ, 2026-11-09 | « without invalidating the tools or instructions cache » |

**Ce qui invalide le cache** ([Prompt caching][caching], 2026-11-09) — ✘ = invalide à ce niveau :

| Changement | tools | system | messages |
|---|---|---|---|
| Définitions de tools (noms, descriptions, paramètres) | ✘ | ✘ | ✘ |
| Activation/désactivation web search | — | ✘ | ✘ |
| Activation/désactivation citations | — | ✘ | ✘ |
| Réglage de vitesse (`fast` vs standard) | — | ✘ | ✘ |
| `tool_choice` | — | — | ✘ |
| Ajout/retrait d'images n'importe où | — | — | ✘ |
| Paramètres de thinking | model-specific | model-specific | ✘ |
| `output_config.effort` (valeur non par défaut) | model-specific | model-specific | ✘ |
| Blocs thinking abandonnés (non préservés) | — | — | ✘ (**Claude 5.1+**) |

Autres causes citées textuellement : ordre de clés JSON instable dans les blocs `tool_use` (« Unstable JSON key ordering in `tool_use` blocks ») et requêtes émises après expiration du TTL. Modèles supportés : « all active Claude models », avec la liste explicite `claude-fable-5-1`, `claude-mythos-5-1`, `claude-fable-5`, `claude-mythos-5`, `claude-mythos-preview`, `claude-opus-5-5`, `claude-opus-5`, `claude-opus-4-8`, `claude-opus-4-7`, `claude-opus-4-6`, `claude-opus-4-5-20251101`, `claude-sonnet-5-5`, `claude-sonnet-5`, `claude-sonnet-4-6`, `claude-sonnet-4-5-20250929`, `claude-haiku-5-5`, `claude-haiku-4-5-20251001` ([Prompt caching][caching], 2026-11-09).

### 1.4 Lineup, IDs, cycle de vie

**Modèles courants** ([Models overview][models], 2026-11-09). Cutoff de connaissance fiable et cutoff d'entraînement : **juin 2026** pour les quatre.

| Modèle | API ID | Contexte | Max output | Thinking | Effort par défaut | Prix in/out (MTok) | Retirement pas avant |
|---|---|---|---|---|---|---|---|
| Claude Fable 5.1 | `claude-fable-5-1` | 1M | 128K | Adaptive (always on) | `high` | 10 $ / 50 $ | 1 sept. 2027 |
| Claude Opus 5.5 | `claude-opus-5-5` | 1M | 128K | Adaptive (always on) | `medium` | 4 $ / 20 $ | 22 sept. 2027 |
| Claude Sonnet 5.5 | `claude-sonnet-5-5` | 1M | 128K | Adaptive | `high` | 2 $ / 10 $ | 28 sept. 2027 |
| Claude Haiku 5.5 | `claude-haiku-5-5` | 1M | 128K | Adaptive | `medium` | dès 0,10 $ / dès 0,50 $ | 7 oct. 2027 |

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Point de départ recommandé par défaut | Opus 5.5 | [Models overview][models], 2026-11-09 | « start with Claude Opus 5.5 for most workloads » |
| Quand monter sur Fable 5.1 | Fable 5.1 | [Models overview][models], 2026-11-09 | « when your evals on Claude Opus 5.5 at higher effort still fall short » |
| **Les IDs sans date sont des snapshots épinglés**, pas des alias flottants | 4.6 et suivants | [Models overview][models], 2026-11-09 | « Every Claude model ID is a pinned snapshot, including the dateless IDs » |
| Avant 4.6, l'alias est un pointeur vers l'ID daté | **≤ 4.5** | [Models overview][models], 2026-11-09 | « the alias is a convenience pointer that resolves to the dated ID » |
| L'extended thinking manuel est déprécié sur 4.6 et refusé ensuite | 4.6 / après | [Models overview][models], 2026-11-09 | « deprecated on Claude Opus 4.6 and Claude Sonnet 4.6 and not accepted on later models » |
| Nouveau tokenizer : 1M tokens ≈ 555k mots (contre ~750k avant) | tokenizer depuis **Opus 4.7** | [Models overview][models], 2026-11-09 | « introduced with Claude Opus 4.7 » |
| Batch API : 50 % de remise ; jusqu'à 300k tokens de sortie avec header beta | Opus 5.5, Opus 5, Sonnet 5.5, Sonnet 5, Haiku 5.5, Opus 4.8, Opus 4.7, Opus 4.6, Sonnet 4.6 | [Models overview][models], 2026-11-09 | « with the output-300k-2026-03-24 beta header » |
| Interroger les capacités par programme via la Models API | toutes | [Models overview][models], 2026-11-09 | « You can query model capabilities and token limits programmatically » |
| Lire `line` au lieu de l'inférer de l'`id` | toutes | [Models overview][models], 2026-11-09 | « Read `line` instead of inferring it from the model's `id`. » |
| Les 4 taxons officiels du cycle de vie | toutes | [Model deprecations][deprec], 2026-11-09 | « Active… Legacy… Deprecated… Retired » |
| Préavis minimum avant retrait | toutes | [Model deprecations][deprec], 2026-11-09 | « at least 60 days' notice before model retirement » |

**Modèles legacy, toujours disponibles** — énumération textuelle de [Models overview][models] (2026-11-09) : Claude Fable 5, Claude Opus 5, Claude Opus 4.8, Claude Opus 4.7, Claude Opus 4.6, Claude Opus 4.5, Claude Sonnet 5, Claude Sonnet 4.6, Claude Haiku 4.5. Citation : « Legacy models (still available) ». **Ces neuf modèles sont donnés « Active » par la page Model deprecations — contradiction non arbitrée, voir §8.**

**Statut Mythos** — tranché par la page Model deprecations. Leur absence de la table « Compare models » de *Models overview* ne signifie pas qu'ils n'existent pas.

| Modèle | Statut | Déprécié le | Retrait | Source (URL, date de consultation) |
|---|---|---|---|---|
| `claude-mythos-5-1` | **Active** | N/A | pas avant le 1er sept. 2027 | [Model deprecations][deprec], 2026-11-09 |
| `claude-mythos-5` | **Active** | N/A | pas avant le 9 juin 2027 | [Model deprecations][deprec], 2026-11-09 |
| `claude-mythos-preview` | **Deprecated** | 9 juin 2026 | « To be announced » | [Model deprecations][deprec], 2026-11-09 |

| Fait complémentaire | Génération | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Mythos 5.1 est couvert par la **même** page de prompting que Fable 5.1 | Mythos 5.1 | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « patterns for Claude Fable 5.1 and Claude Mythos 5.1 » |
| Mythos 5 est couvert par la même page que Fable 5 | Mythos 5 | [Prompting Claude Fable 5][f5], 2026-11-09 | « specific to Claude Fable 5 and Claude Mythos 5 » |

**Modèles déjà retirés** ([Model deprecations][deprec], 2026-11-09) : `claude-opus-4-1-20250805` (retiré 5 août 2026), `claude-opus-4-20250514` et `claude-sonnet-4-20250514` (15 juin 2026), `claude-3-7-sonnet-20250219` et `claude-3-5-haiku-20241022` (19 fév. 2026), `claude-3-haiku-20240307` (20 avr. 2026), `claude-3-opus-20240229` (5 janv. 2026), `claude-3-5-sonnet-*` (28 oct. 2025), `claude-2.0`, `claude-2.1`, `claude-3-sonnet-20240229` (21 juil. 2025), `claude-1.x` et `claude-instant-1.x` (6 nov. 2024). `claude-sonnet-4-5-20250929` est **Deprecated**, retrait le 30 nov. 2026, remplacement recommandé `claude-sonnet-5-5`. **Toute la génération Claude 3 et antérieure est retirée** : aucune règle de prompting la concernant n'a plus d'objet opérationnel (constat de lecture de la note 01).

**Pages officielles de migration**

| Page | Portée | Source (URL, date de consultation) |
|---|---|---|
| Migration guides (index) | pointe vers 4 guides : Fable 5.1 & Mythos 5.1, Opus 5.5, Sonnet 5.5, Haiku 5.5 | [Migration guides][migr-index], 2026-11-09 |
| Claude Sonnet 5.5 migration guide | « the breaking changes for code written for Claude Sonnet 5 », et les étapes depuis Sonnet 4.6 dont « the removal of manual extended thinking (`budget_tokens`) » — **cité indirectement** depuis la page best-practices, page elle-même non ouverte | `/docs/en/models/sonnet-5-5/migration-guide` (référencé, **non ouvert**), via [Prompting best practices][bp], 2026-11-09 |
| Release notes | mises à jour API | [release-notes/overview](https://platform.claude.com/docs/en/release-notes/overview) (référencé, **non ouvert**) |

**« Migration considerations » — liste officielle** ([Prompting best practices][bp], 2026-11-09) :

| # | Changement prescrit | Génération concernée | Citation (≤15 mots) |
|---|---|---|---|
| 1 | Être spécifique sur le comportement voulu | générations antérieures (la page dit « from earlier generations », sans nommer 3.x) | « Consider describing exactly what you'd like to see in the output. » |
| 2 | Encadrer avec des modificateurs de qualité/détail | idem, non spécifié | « Go beyond the basics to create a fully-featured implementation. » |
| 3 | Demander explicitement animations et éléments interactifs | idem, non spécifié | « Ask explicitly for animations and interactive elements when you want them. » |
| 4 | Mettre à jour la configuration de thinking : adaptive au lieu de `budget_tokens` | **4.6+**, 400 dès **4.7** | « On Claude 4.7 and later models, setting `budget_tokens` returns a 400 error. » |
| 5 | Abandonner les prefills | **4.6+** et Mythos Preview | « Prefilled responses on the last assistant turn are no longer supported » |
| 6 | **Réduire** le prompting anti-paresse hérité | **4.6** | « Claude 4.6 models are more proactive and might overtrigger » |
| 7 | Renvoyer les blocs thinking inchangés, historique append-only | **5.1+** | « Pass thinking blocks back unchanged and keep history append-only » |

### 1.5 Prompt improver officiel — statut historique

Les deux outils (prompt improver Console, prompt generator / metaprompt) existent, mais **aucun n'est documenté dans la doc vivante de 2026** : les URL `prompt-improver` et `prompting-tools` redirigent vers la page best-practices, qui ne les mentionne pas (constat de fetch, note 01). La seule source officielle lue pour l'improver est son billet d'annonce du **14 octobre 2024**, mesuré **sur Claude 3 Haiku** — donc **historique**.

**Les étapes de l'improver contre la doc actuelle** — c'est directement « ce qu'il faut retirer » d'un prompt produit par cet outil :

| Étape du prompt improver (2024-10-14) | Statut au 2026-11-09 | Génération concernée | Source du conflit (URL, date) |
|---|---|---|---|
| 1. Chain-of-thought reasoning (section de raisonnement dédiée) | **Contredit** : CoT manuel rétrogradé en fallback, et écrire son raisonnement « may be declined » | Fable 5.1, Fable 5, Opus 5.5, Opus 5, Sonnet 5.5 | [Prompting best practices][bp] §Leverage thinking, 2026-11-09 |
| 2. Example standardization (format XML cohérent) | **Toujours valide** | toutes générations courantes | [Prompting best practices][bp] §Use examples effectively, 2026-11-09 — « Wrap examples in `<example>` tags » |
| 3. Example enrichment (examples enrichis de raisonnement) | **Toujours valide** | 4.6+ / 5.x | [Prompting best practices][bp], 2026-11-09 — « Worked examples in your prompt shape how Claude approaches similar problems » |
| 4. Rewriting (clarification de structure, grammaire) | **Toujours valide** | toutes | [Prompting best practices][bp] §Be clear and direct, 2026-11-09 |
| 5. **Prefill addition** (préremplir le message Assistant) | **Mort — erreur 400** | **4.6+** | [Prompting best practices][bp] §Migrating away from prefilled responses, 2026-11-09 — « Requests with prefilled assistant messages to these models return a 400 error. » |

| Fait sur l'improver / le generator | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Un prompt generator officiel existe, sous forme de recette metaprompt du Cookbook | non spécifiée | [Prompt engineering overview][pe-overview], 2026-11-09 | « Generate one with the metaprompt recipe from the Claude Cookbook. » |
| Usage déclaré : produire un premier brouillon | non spécifiée | [Prompt engineering overview][pe-overview], 2026-11-09 | « Don't have a first draft prompt? » |
| Emplacement annoncé de l'artefact : `misc/metaprompt.ipynb` dans `anthropics/claude-cookbooks` | — | [Prompt engineering overview][pe-overview] (URL du lien Colab), 2026-11-09 | `claude-cookbooks/blob/main/misc/metaprompt.ipynb` |
| L'improver existe comme produit Console, documenté par son billet d'annonce | **historique** (mesuré sur **Claude 3 Haiku**) | [claude.com/blog/prompt-improver][improver], publié 2024-10-14, consulté 2026-11-09 | « ideal for adapting prompts that were originally written for other AI models » |
| Cinq étapes revendiquées, dont **prefill addition** | **historique** | [claude.com/blog/prompt-improver][improver], 2024-10-14 / consulté 2026-11-09 | « Prefills the Assistant message to direct Claude's actions » |
| Gain revendiqué : **+30 % d'exactitude** sur un test de classification multilabel | **historique**, testé sur Claude 3 Haiku | [claude.com/blog/prompt-improver][improver], 2024-10-14 / consulté 2026-11-09 | « Accuracy: +30% » |
| Détail du test : 500 articles et titres Wikipédia — **pas de benchmark nommé** | **historique** | [claude.com/blog/prompt-improver][improver], 2024-10-14 / consulté 2026-11-09 | « using 500 Wikipedia articles and titles » |
| Second gain : **100 %** de respect du nombre de mots (dix articles Wikipédia) | **historique** | [claude.com/blog/prompt-improver][improver], 2024-10-14 / consulté 2026-11-09 | « Word count adherence: 100% » |
| Entrées acceptées : prompt existant (même écrit pour un autre modèle), examples optionnels, feedback en langage naturel | **historique** | [claude.com/blog/prompt-improver][improver], 2024-10-14 / consulté 2026-11-09 | « users can give feedback on what isn't working and repeat the process » |
| Le billet **ne déclare aucune limite** ; les deux tests sont petits et spécifiques | **historique** | [claude.com/blog/prompt-improver][improver], 2024-10-14 / consulté 2026-11-09 (constat de lecture) | — |
| `anthropic.com/news/prompt-improver` redirige en **308** vers `claude.com/blog/prompt-improver` | — | constat de fetch, 2026-11-09 | (redirection suivie) |
| Dépôt cookbook confirmé : `anthropics/claude-cookbooks`, branche `main`, répertoire `misc` présent | — | [github.com/anthropics/claude-cookbooks](https://github.com/anthropics/claude-cookbooks), 2026-11-09 | (lecture d'arborescence) |
| Notebooks nommés dans le README : `misc/building_evals.ipynb`, `misc/prompt_caching.ipynb` ; **aucune mention d'un notebook metaprompt** | — | [github.com/anthropics/claude-cookbooks](https://github.com/anthropics/claude-cookbooks), 2026-11-09 | « Use Claude to automate the prompt evaluation process. » |
| Autres outils officiels référencés : tutoriel interactif GitHub, tutoriel Google Sheets, Claude Console | — | [Prompt engineering overview][pe-overview] + [Models overview][models], 2026-11-09 | « Craft and test prompts directly in your browser. » |
| Recette officielle de crop tool dans le cookbook | Opus 4.5, Opus 4.6 | [Prompting best practices][bp] §Improved vision, 2026-11-09 | « Anthropic has created a recipe for the crop tool. » |
| Skill officielle frontend-design publiée dans le dépôt claude-code | Opus 4.5, Opus 4.6 | [Prompting best practices][bp] §Frontend design, 2026-11-09 | « You can also refer to the full skill definition. » |

> **Avertissement de la note 01, reporté.** Les chiffres de l'improver (+30 %, 100 %) sont datés de 2024 et mesurés sur Claude 3 Haiku, modèle qui n'apparaît dans aucune liste courante ni legacy lue. Ils ne doivent pas être présentés comme valides pour les générations 4.x/5.x. Le « up to 30 percent » de la mise en tête des documents longs (§1.1) est une **mesure différente** : ne pas les confondre.

### 1.6 Paramètres de sampling supprimés (Anthropic)

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| `temperature`, `top_p`, `top_k` **supprimés** de l'API version `2026-10-21` → 400 | toutes, via la version d'API | [Model deprecations][deprec] §API parameter deprecations, 2026-11-09 | « Removed in API version 2026-10-21 » |
| Sur les versions antérieures, 400 dès Claude 4.7 si valeur non par défaut | **Claude 4.7+** et Mythos Preview | [Model deprecations][deprec], 2026-11-09 | « when set to a non-default value on Claude 4.7 and later models » |
| Le remplacement officiel est le **prompting**, pas un autre paramètre | toutes | [Model deprecations][deprec], 2026-11-09 | « Omit and use prompting to guide model behavior. » |
| Contrainte signalée comme **nouvelle pour la classe Sonnet** | **Sonnet 5** | [Prompting Claude Sonnet 5][s5], 2026-11-09 | « This constraint is new for Sonnet-class models. » |
| Conséquence : la variété stylistique ne s'obtient plus par `temperature` | Sonnet 5, Opus 4.8 | [Prompting Claude Sonnet 5][s5], 2026-11-09 | « this approach is the recommended way to produce meaningfully different design directions » |

### 1.7 Les huit pages de prompting par modèle

> Les **8** pages ont été ouvertes et lues intégralement le 2026-11-09, sans erreur ni redirection. Ne sont reprises ici que les règles **spécifiques à un modèle** et absentes de la page consolidée. Aucune page de prompting dédiée n'existe, dans le tableau « Model-specific guidance », pour Opus 4.7, Opus 4.6, Opus 4.5, Sonnet 4.6 ni Haiku 4.5 (voir §9).

#### Claude Fable 5.1 (et Mythos 5.1)

| Règle spécifique | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Les prompts Fable 5 fonctionnent sans changement ; la page est un catalogue de symptômes → section | Fable 5.1, Mythos 5.1 | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « should perform well on Claude Fable 5.1 without changes » |
| Effort : défaut `high` ; à `medium` les résultats « roughly match Claude Fable 5 » pour moins cher | Fable 5.1 | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « step down to medium or low where your evals show quality holds » |
| À `low`, souvent meilleur score que Opus/Sonnet à coût par tâche comparable | Fable 5.1 | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « often competitive with Claude Opus and Claude Sonnet models on cost per task » |
| **Écrit moins d'updates user-facing que Fable 5** ; s'aggrave à effort élevé et en chaînes longues | Fable 5.1 | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « Users see the agent go quiet for minutes at a time » |
| **Retirer** les lignes du type « hold all findings for the final response » | Fable 5.1 | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « Remove lines like that before adding anything. » |
| Si l'UI masque la sortie des tools, le dire au modèle | Fable 5.1 | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « Only you see that command's output » |
| Batching : exception en boucles coding/computer-use où les appels suivants sont implicites → un appel par tour | Fable 5.1 | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « it might issue them one in each turn instead » |
| Correctif : nudge en **turn-scoped system message** (`clear_at: "next_user_message"`, beta `mid-conversation-system-clear-at-2026-08-21`) | Fable 5.1 | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « First privately list what you need next » |
| Les copies antérieures du nudge se laissent **byte-for-byte** ; les supprimer est une édition des tours antérieurs | Fable 5.1 | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « Deleting or rewriting them is an edit to earlier turns » |
| Un bloc thinking n'est valide que si **tout** ce qui précède est inchangé : system, liste de tools, chaque message | Fable 5.1 | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « only while everything before it is unchanged » |
| Contrôle du mismatch : `thinking.block_binding.prefix_mismatch_behavior` (beta `thinking-binding-controls-2026-08-01`) | Fable 5.1 | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « the API rejects the request with a 400 error » |
| Compaction côté client : un message de résumé + le nouveau tour user, sans rejouer le reste | Fable 5.1 | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « No thinking blocks carry over, so nothing fails » |
| Compacter tôt pour économiser peut être le mauvais arbitrage | Fable 5.1 | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « Compacting early to save cost can be the wrong tradeoff » |
| Prose **plus dense** que Fable 5 ; instruction anti-« mannered prose » fournie | Fable 5.1 | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « Please remove all mannered prose. » |
| **Formate moins** que les modèles antérieurs → retirer les règles anti-formatage héritées | Fable 5.1 | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « it uses bold less and is less likely to reach for headers » |
| Reproduit plus volontiers des passages sources **sans les marquer comme citations** | Fable 5.1 | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « without marking them as quotations » |
| Finir la tâche : deux ajouts system ; la phrase d'ouverture porte l'essentiel de l'effet | Fable 5.1 | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « You are operating autonomously. » |
| Résumés de compaction : 6 items à préserver, pondérer la voix de l'utilisateur plus que son propre raisonnement | Fable 5.1 | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « keep what the user said… close to their own words » |
| Limiter changements et tests aux demandes : baisse des ajouts non demandés sans perte de succès | Fable 5.1 | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « with no measurable change in task success » |
| À `low` effort, **appelle moins** les tools de recherche que Fable 5 | Fable 5.1 | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « more likely to answer from memory » |
| Trois déclencheurs de faux positifs des safeguards : phrasé de compile-check, langages peu connus, base64 en sortie de tool | Fable 5.1 | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « Are there any bugs in this program? » |
| Réécrit des fichiers entiers pour de petits changements → instruction d'édition chirurgicale | Fable 5.1 | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « try to surgically edit a file rather than rewrite the entire thing » |
| À `xhigh`/`max`, peut rédiger le livrable dans le thinking **puis** le réécrire en réponse | Fable 5.1 | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « which means a longer wait and more output tokens » |
| Ne pas forcer l'agent lead à attendre chaque subagent | Fable 5.1 | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « letting the lead continue while subagents run lowers average time » |

#### Claude Fable 5 (et Mythos 5)

| Règle spécifique | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| **Tester sur les problèmes les plus durs** : l'évaluer sur des charges simples sous-estime sa plage | Fable 5, Mythos 5 | [Prompting Claude Fable 5][f5], 2026-11-09 | « testing it only on simpler workloads tends to undersell its capability range » |
| Classifiers ciblant cyber offensif, biologie/sciences du vivant, et **extraction du thinking résumé** ; fallback conseillé vers Opus 4.8 | Fable 5 | [Prompting Claude Fable 5][f5], 2026-11-09 | « extraction of the model's summarized thinking » |
| Le travail bénin dans ces domaines peut aussi déclencher les safeguards | Fable 5 | [Prompting Claude Fable 5][f5], 2026-11-09 | « Benign cybersecurity work and beneficial life sciences tasks might also trigger » |
| **Tours beaucoup plus longs** : ajuster timeouts, streaming, indicateurs *avant* de migrer, et vérifier en asynchrone | Fable 5 | [Prompting Claude Fable 5][f5], 2026-11-09 | « rather than blocking » |
| Effort bas suffisant : dépasse souvent le `xhigh` des modèles antérieurs | Fable 5 | [Prompting Claude Fable 5][f5], 2026-11-09 | « Lower effort settings on Claude Fable 5 still perform well » |
| Instruction brève > énumération : une consigne de brièveté vaut la liste de chaque pattern | Fable 5 | [Prompting Claude Fable 5][f5], 2026-11-09 | « A short brevity instruction is as effective as listing each pattern » |
| Auditer les claims de progression contre les résultats de tools : quasi-élimination des rapports fabriqués | Fable 5 | [Prompting Claude Fable 5][f5], 2026-11-09 | « this nearly eliminated fabricated status reports » |
| Peut prendre des actions non demandées (brouillon d'email, branches git de sauvegarde) → poser les bornes | Fable 5 | [Prompting Claude Fable 5][f5], 2026-11-09 | « Report your findings and stop. » |
| Subagents longue durée gardant leur contexte : gain de temps et de coût via les cache reads | Fable 5 | [Prompting Claude Fable 5][f5], 2026-11-09 | « avoid bottlenecking on the slowest subagent » |
| **Lui construire un système de mémoire** (un simple fichier Markdown), amorcé en relisant les sessions passées | Fable 5 | [Prompting Claude Fable 5][f5], 2026-11-09 | « Store one lesson per file with a one-line summary » |
| **Éviter d'exposer un compte à rebours de tokens** : déclencheur principal des inquiétudes de contexte | Fable 5 | [Prompting Claude Fable 5][f5], 2026-11-09 | « Avoid surfacing explicit context-budget counts where possible. » |
| Donner la **raison** de la demande, pas seulement la demande | Fable 5 | [Prompting Claude Fable 5][f5], 2026-11-09 | « context lets it connect the task to relevant information » |
| Tool `send_to_user` : les entrées de tool ne sont jamais résumées, le contenu arrive intact | Fable 5 | [Prompting Claude Fable 5][f5], 2026-11-09 | « Tool inputs are never summarized » |
| Définir le tool ne suffit pas : sans instruction system, il ne l'appelle presque jamais | Fable 5 | [Prompting Claude Fable 5][f5], 2026-11-09 | « Claude Fable 5 rarely calls it » |
| Des **subagents vérificateurs à contexte neuf** battent l'auto-critique | Fable 5 | [Prompting Claude Fable 5][f5], 2026-11-09 | « fresh-context verifier subagents tend to outperform self-critique » |
| **Les skills écrites pour les modèles antérieurs sont souvent trop prescriptives et dégradent la sortie** | Fable 5 | [Prompting Claude Fable 5][f5], 2026-11-09 | « can degrade output quality » |
| Ne pas demander de reproduire son raisonnement → `reasoning_extraction` ; le fallback serveur **ne rejoue pas** ce refus | Fable 5 | [Prompting Claude Fable 5][f5], 2026-11-09 | « that refusal is returned to you » |
| Auditer skills et system prompts à la recherche de consignes « show your thinking » avant migration | Fable 5 | [Prompting Claude Fable 5][f5], 2026-11-09 | « Audit existing skills and system prompts for reflection » |

#### Claude Sonnet 5.5

| Règle spécifique | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Niveaux d'effort **recalibrés** vs Sonnet 5 → refaire le sweep | Sonnet 5.5 | [Prompting Claude Sonnet 5.5][s55], 2026-11-09 | « Run a fresh sweep against your own evals » |
| Départs recommandés : `high` par défaut ; `medium` pour coding agentique bien spécifié ; `medium`/`low` en chat | Sonnet 5.5 | [Prompting Claude Sonnet 5.5][s55], 2026-11-09 | « start at medium for well-specified tasks » |
| Coding agentique : `max_tokens` à **128 000** (le maximum) et streaming | Sonnet 5.5 | [Prompting Claude Sonnet 5.5][s55], 2026-11-09 | « set max_tokens to 128,000, the model's maximum » |
| **Demander au modèle de moins penser ne marche pas** : baisser l'effort | Sonnet 5.5 | [Prompting Claude Sonnet 5.5][s55], 2026-11-09 | « Asking the model in the system prompt to think less doesn't reliably reduce its thinking. » |
| `between_tools` est le réglage de thinking le plus bas, accepté à effort ≤ `high` ; refusé à `xhigh`/`max` | Sonnet 5.5 | [Prompting Claude Sonnet 5.5][s55], 2026-11-09 | « a request with between_tools returns a 400 error » |
| Avec `between_tools`, **retirer toute consigne disant de ne pas penser** | Sonnet 5.5 | [Prompting Claude Sonnet 5.5][s55], 2026-11-09 | « more likely that the model writes internal XML tags » |
| `between_tools` n'accepte aucun autre champ : `display`, `budget_tokens` ou `block_binding` → 400 | Sonnet 5.5 | [Prompting Claude Sonnet 5.5][s55], 2026-11-09 | « takes no other field » |
| JSON + raisonnement : une ligne en **fin** de system prompt amène l'exactitude de `high` près de `xhigh` | Sonnet 5.5 | [Prompting Claude Sonnet 5.5][s55], 2026-11-09 | « Think the problem through before you answer. » |
| Sans structured outputs : **parser la dernière valeur JSON**, pas du premier `{` au dernier `}` | Sonnet 5.5 | [Prompting Claude Sonnet 5.5][s55], 2026-11-09 | « The model occasionally writes a draft before its final JSON » |
| Traiter tout `stop_reason: "max_tokens"` comme un échec, même avec du JSON valide | Sonnet 5.5 | [Prompting Claude Sonnet 5.5][s55], 2026-11-09 | « Treat any response whose stop_reason is "max_tokens" as failed » |
| Retirer « only use tools when strictly necessary » / « minimize tool calls » | Sonnet 5.5 | [Prompting Claude Sonnet 5.5][s55], 2026-11-09 | « check your prompt for language that discourages tool use » |
| **Ne jamais mettre du texte utilisateur dans un bloc `tool_result`** | Sonnet 5.5 | [Prompting Claude Sonnet 5.5][s55], 2026-11-09 | « The model misreads that placement most often. » |
| Ne pas ajouter son propre compte à rebours après les tool results en session interactive | Sonnet 5.5 | [Prompting Claude Sonnet 5.5][s55], 2026-11-09 | « don't add your own token or budget countdown after tool results » |
| À `xhigh`/`max`, le prompt d'arrêt de revue a **réduit le coût de session d'environ un tiers** sans perte de qualité | Sonnet 5.5 | [Prompting Claude Sonnet 5.5][s55], 2026-11-09 | « cut session cost by about a third, with no change in quality » |
| Ajoute spontanément tests, docs et fichiers de support à tous les niveaux d'effort | Sonnet 5.5 | [Prompting Claude Sonnet 5.5][s55], 2026-11-09 | « even when you don't ask for them » |
| Appelle parfois un tool avec une **casse erronée** (`bash` pour `Bash`) → harness tolérant ou `is_error` nommant le nom exact | Sonnet 5.5 | [Prompting Claude Sonnet 5.5][s55], 2026-11-09 | « Accept the call when the match is unambiguous » |
| Sur les graphiques, **outiller bat monter l'effort** : avec tools à `high` > sans tools à `max` | Sonnet 5.5 | [Prompting Claude Sonnet 5.5][s55], 2026-11-09 | « at a fraction of the cost » |
| 5 catégories de refus ; fallback serveur rejoue `cyber` et `frontier_llm` sur Sonnet 5, **pas** `bio`, `reasoning_extraction`, `general_harms` | Sonnet 5.5 | [Prompting Claude Sonnet 5.5][s55], 2026-11-09 | « It doesn't retry bio, reasoning_extraction, or general_harms declines. » |

#### Claude Opus 5.5

| Règle spécifique | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Plus de **30 % plus rapide** en génération que Opus 5, et moins de tokens pour la même tâche | Opus 5.5 | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « more than 30 percent faster than Claude Opus 5 » |
| Démarrer à `medium` (défaut ; Opus 5 défaut `high`) et le poser **explicitement** | Opus 5.5 | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « Start at medium, the default on Claude Opus 5.5 » |
| À `medium`, égale ou dépasse Opus 5 à `high` sur coding et knowledge work | Opus 5.5 | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « matches or exceeds Claude Opus 5 at high » |
| À niveau égal, **pense plus par tour** que Opus 5, surtout `xhigh`/`max` | Opus 5.5 | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « expect longer turns and more output tokens » |
| Baisser l'effort est plus fiable que prompter pour réduire le thinking | Opus 5.5 | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « more reliably than prompt instructions do » |
| `thinking: {"type": "disabled"}` → **400** (alors que Opus 5 l'acceptait à effort ≤ `high`) | Opus 5.5 | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « Claude Opus 5.5 returns a 400 error for it » |
| Si l'intégration tournait thinking off : partir de `low` et mesurer | Opus 5.5 | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « Answer directly without deliberating. » |
| **Retirer la règle « ne pas penser »** dans tous les cas | Opus 5.5 | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « remove the no-thinking rule either way » |
| Agents non supervisés : une fin de tour sans tool call est un **rapport**, pas une preuve d'achèvement | Opus 5.5 | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « Treat a text-only end of turn as a report » |
| S'arrêter après deux ou trois continuations automatiques sur la même tâche | Opus 5.5 | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « so that a run that is genuinely stuck ends » |
| L'ajout system doit être présent **dès la première requête** : l'ajouter en route invalide les blocs thinking antérieurs | Opus 5.5 | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « adding it partway through changes the system prompt » |
| Déclarer le tool d'envoi de message dans `tools` dès la première requête, pour la même raison | Opus 5.5 | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « adding it to tools later edits the conversation's prefix » |
| Les safeguards **biologie sont nouveaux** pour qui vient d'Opus 5 | Opus 5.5 | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « are new if you're coming from Claude Opus 5 » |
| `display: "updates"` + rappel du harness : part des tâches à long silence **divisée par deux** | Opus 5.5 | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « roughly halved the share of tasks with a long silent stretch » |
| Workflows multi-apps : une phrase d'exploration large améliore nettement le taux de réussite | Opus 5.5 | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « explore broadly with tool calls » |
| Précaution liée : garder le contenu non fiable hors des sources explorées | Opus 5.5 | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « keep untrusted content out of the records it searches » |
| **Très réactif au temps écoulé** : fournir un budget (`elapsed 340s / 1200s`) accélère les équipes d'agents | Opus 5.5 | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « The model paces its work to finish inside the budget » |
| Le budget est **indicatif** : prévoir son propre timeout pour un arrêt dur | Opus 5.5 | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « nothing stops the model at the limit » |
| Un budget serré n'agit pas comme un effort plus bas : il maintient plus d'agents en parallèle | Opus 5.5 | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « a budget mostly keeps more agents working in parallel » |
| **Retirer des system prompts de chat les consignes « réfléchis bien avant de répondre »** | Opus 5.5 | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « removing such a line made replies start sooner » |
| Chat multi-tours : deux phrases pour traiter les réponses passées comme acquises réduisent la latence | Opus 5.5 | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « treat that answer as done » |
| Contre-indication : laisser cette consigne de côté là où le modèle doit continuer à réexaminer son travail | Opus 5.5 | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « in long analyses, or in agentic tasks » |
| **Marquer le texte collé** par l'utilisateur : `<pasted_content id="ab12">`, ID aléatoire, balises sur leur propre ligne | Opus 5.5 | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « may contain instructions the user did not write » |
| Les balises sont du texte et peuvent être imitées : une garde parmi d'autres | Opus 5.5 | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « treat this as one guardrail » |
| Frontend : « avoid a generic AI look » **échange un défaut contre un autre** ; nommer les patterns à éviter | Opus 5.5 | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « mostly swaps one default for another » |

#### Claude Opus 5

| Règle spécifique | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Réponses plus longues que les Opus antérieurs ; l'effort ne les raccourcit pas → prompter la concision | Opus 5 | [Prompting Claude Opus 5][o5], 2026-11-09 | « To control response length, prompt for it explicitly. » |
| Dans un long system prompt, doubler la consigne par un rappel court **près de la fin** | Opus 5 | [Prompting Claude Opus 5][o5], 2026-11-09 | « Keep outputs reasonably concise. » |
| Les **fichiers écrits sur disque** sont aussi plus longs : calibrer séparément | Opus 5 | [Prompting Claude Opus 5][o5], 2026-11-09 | « do not pad with filler sections » |
| **Retirer les instructions de vérification** : elles causent de la sur-vérification | Opus 5 | [Prompting Claude Opus 5][o5], 2026-11-09 | « removing them reduces wasted tokens with no loss in quality » |
| Idem pour le scaffolding hérité qui ajoute des étapes de vérification | Opus 5 | [Prompting Claude Opus 5][o5], 2026-11-09 | « The same applies to legacy harness scaffolding » |
| Éviter « double-check your answer » / « re-verify before responding » : il le fait déjà | Opus 5 | [Prompting Claude Opus 5][o5], 2026-11-09 | « add cost without improving results » |
| Peut **élargir le périmètre** de la tâche → le contraindre explicitement | Opus 5 | [Prompting Claude Opus 5][o5], 2026-11-09 | « Deliver what was asked, at the scope intended. » |
| Délègue aux subagents plus volontiers ; plafonds déterministes disponibles | Opus 5 | [Prompting Claude Opus 5][o5], 2026-11-09 | `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` |
| Claude Code n'ajoute sa consigne de délégation **que** avec le preset `claude_code` | Opus 5 | [Prompting Claude Opus 5][o5], 2026-11-09 | « add a delegation instruction such as the example in this section yourself » |
| Mettre à jour Claude Code et le SDK épinglé **avant** de pointer le harness sur Opus 5 | Opus 5 | [Prompting Claude Opus 5][o5], 2026-11-09 | « Older versions of Claude Code don't have them » |
| Narre ses corrections plus que les modèles antérieurs → limiter aux corrections qui changent quelque chose | Opus 5 | [Prompting Claude Opus 5][o5], 2026-11-09 | « make the fix and move on without noting it » |
| Thinking off seulement à effort ≤ `high` ; `xhigh`/`max` → 400 | Opus 5 | [Prompting Claude Opus 5][o5], 2026-11-09 | « returns a 400 error » |
| **Thinking on à `low` effort bat thinking off à coût comparable** | Opus 5 | [Prompting Claude Opus 5][o5], 2026-11-09 | « thinking enabled at low effort performs better than thinking disabled » |
| Artefact 1 avec thinking off : écrit un **tool call en texte**, qui ne s'exécute jamais et pollue l'historique | Opus 5 | [Prompting Claude Opus 5][o5], 2026-11-09 | « the leaked text stays in the conversation history » |
| Artefact 2 : balises `<thinking>` visibles ; une règle « ne pas penser » **augmente** la fuite | Opus 5 | [Prompting Claude Opus 5][o5], 2026-11-09 | « that kind of instruction increases tag leakage » |
| Nommer les balises explicitement est **moins** efficace que la forme générale | Opus 5 | [Prompting Claude Opus 5][o5], 2026-11-09 | « so avoid naming them specifically » |
| Code review : « only report high-severity issues » est suivi **littéralement** → demander tout, filtrer ensuite | Opus 5 | [Prompting Claude Opus 5][o5], 2026-11-09 | « ask it to report everything and filter in a separate pass instead » |
| Fenêtre de 1M tokens par défaut **et** maximum, avec tenue des capacités sur toute la fenêtre | Opus 5 | [Prompting Claude Opus 5][o5], 2026-11-09 | « stay consistent throughout the window » |

#### Claude Sonnet 5

| Règle spécifique | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Calibre la longueur sur la complexité plutôt qu'une verbosité fixe | Sonnet 5 | [Prompting Claude Sonnet 5][s5], 2026-11-09 | « rather than defaulting to a fixed verbosity » |
| Les **exemples positifs** battent les consignes négatives pour le style | Sonnet 5 | [Prompting Claude Sonnet 5][s5], 2026-11-09 | « tend to be more effective than negative examples » |
| Correspondance inter-modèles : Sonnet 5 `medium` ≈ Sonnet 4.6 `high` ; Sonnet 5 `high` ≈ Sonnet 4.6 `max` | Sonnet 5 / Sonnet 4.6 | [Prompting Claude Sonnet 5][s5], 2026-11-09 | « Claude Sonnet 5 at medium is comparable… to Claude Sonnet 4.6 at high » |
| Pour comparer, se calibrer sur la **longueur de thinking observée**, pas sur le nom du niveau | Sonnet 5 | [Prompting Claude Sonnet 5][s5], 2026-11-09 | « match by observed thinking length rather than effort name » |
| Respecte strictement l'effort ; si raisonnement superficiel, **monter l'effort** | Sonnet 5 | [Prompting Claude Sonnet 5][s5], 2026-11-09 | « raise effort to high or xhigh rather than prompting around it » |
| **Changement vs Sonnet 4.6** : adaptive thinking actif par défaut sans champ `thinking` | Sonnet 5 (vs Sonnet 4.6) | [Prompting Claude Sonnet 5][s5], 2026-11-09 | « This is a change from Claude Sonnet 4.6 » |
| Revoir `max_tokens` pour les charges qui tournaient sans thinking sur 4.6 | Sonnet 5 | [Prompting Claude Sonnet 5][s5], 2026-11-09 | « max_tokens is a hard limit on total output » |
| `budget_tokens` → 400 : déprécié sur Sonnet 4.6, désormais retiré | Sonnet 5 | [Prompting Claude Sonnet 5][s5], 2026-11-09 | « is not supported on Claude Sonnet 5 and returns a 400 error » |
| **Nouveau tokenizer : ~30 % de tokens en plus pour le même texte** → les `max_tokens` calés sur 4.6 tronquent | Sonnet 5 | [Prompting Claude Sonnet 5][s5], 2026-11-09 | « approximately 30 percent more tokens for the same text » |
| Symptôme de budget trop serré : réponse presque entièrement thinking, puis réponse tronquée | Sonnet 5 | [Prompting Claude Sonnet 5][s5], 2026-11-09 | « followed by a truncated answer and stop_reason: "max_tokens" » |
| Plus agentique que 4.6 ; avec thinking off, **moins** enclin à appeler des tools | Sonnet 5 | [Prompting Claude Sonnet 5][s5], 2026-11-09 | « add an explicit nudge in the system prompt » |
| Retirer le scaffolding « After every 3 tool calls, summarize progress » | Sonnet 5 | [Prompting Claude Sonnet 5][s5], 2026-11-09 | « try removing it » |
| Instruction suivie **littéralement** : ne généralise pas d'un item à l'autre → énoncer la portée | Sonnet 5 | [Prompting Claude Sonnet 5][s5], 2026-11-09 | « Apply this formatting to every section, not just the first one » |
| `temperature`, `top_p`, `top_k` → 400 | Sonnet 5 | [Prompting Claude Sonnet 5][s5], 2026-11-09 | « returns a 400 error on Claude Sonnet 5 » |
| Design : les consignes génériques déplacent vers une autre palette fixe, sans produire de variété | Sonnet 5 | [Prompting Claude Sonnet 5][s5], 2026-11-09 | « tend to shift the model to a different fixed palette » |
| Deux approches fiables : spécifier une alternative concrète, ou faire **proposer 4 directions** avant de construire | Sonnet 5 | [Prompting Claude Sonnet 5][s5], 2026-11-09 | « Ask the user to pick one, then implement only that direction. » |
| Coding interactif : viser `xhigh`/`high`, un mode auto, et **moins** d'allers-retours humains | Sonnet 5 | [Prompting Claude Sonnet 5][s5], 2026-11-09 | « reduce the number of human interactions required » |
| Spécifier tâche, intention et contraintes **dès le premier tour** | Sonnet 5 | [Prompting Claude Sonnet 5][s5], 2026-11-09 | « ambiguous or underspecified prompts… reduce token efficiency » |
| Baisse de recall en code review = **effet de harness**, pas régression de capacité | Sonnet 5 | [Prompting Claude Sonnet 5][s5], 2026-11-09 | « This is likely a harness effect, not a capability regression. » |
| Computer use : `computer_toolset_20260801` / `computer_20251124`, max 2576px / 3,75 MP, 1080p bon compromis | Sonnet 5 | [Prompting Claude Sonnet 5][s5], 2026-11-09 | « sending images at 1080p provides a good balance » |

#### Claude Opus 4.8

| Règle spécifique | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Démarrer à `xhigh` pour coding/agentique, **minimum `high`** pour tout ce qui est intelligence-sensible | Opus 4.8 | [Prompting Claude Opus 4.8][o48], 2026-11-09 | « use a minimum of high effort for most intelligence-sensitive use cases » |
| **L'effort compte plus ici que sur tout Opus antérieur** | Opus 4.8 | [Prompting Claude Opus 4.8][o48], 2026-11-09 | « more important for this model than for any prior Opus » |
| Thinking **off** tant que `thinking: {type: "adaptive"}` n'est pas posé | Opus 4.8 | [Prompting Claude Opus 4.8][o48], 2026-11-09 | « thinking is off unless you explicitly set » |
| À `max`/`xhigh`, budget de sortie large : partir de 64k | Opus 4.8 | [Prompting Claude Opus 4.8][o48], 2026-11-09 | « Start at 64k tokens and tune from there. » |
| **Privilégie le raisonnement sur les tool calls** ; monter l'effort est le levier pour plus de tools | Opus 4.8 | [Prompting Claude Opus 4.8][o48], 2026-11-09 | « a tendency to favor reasoning over tool calls » |
| Style par défaut : direct, tranché, peu de validation, emoji rares | Opus 4.8 | [Prompting Claude Opus 4.8][o48], 2026-11-09 | « minimal validation-forward phrasing and sparing emoji use » |
| **Spawn moins de subagents par défaut** — comportement inverse d'Opus 4.6 et Opus 5 | Opus 4.8 | [Prompting Claude Opus 4.8][o48], 2026-11-09 | « tends to spawn fewer subagents by default » |
| Style maison par défaut identifiable et **persistant** : fonds crème ~`#F4F1EA`, serif display (Georgia, Fraunces, Playfair), accents italiques, terracotta/ambre | Opus 4.8 | [Prompting Claude Opus 4.8][o48], 2026-11-09 | « This default is persistent. » |
| Inadapté aux dashboards, dev tools, fintech, santé, enterprise ; apparaît aussi dans les slides | Opus 4.8 | [Prompting Claude Opus 4.8][o48], 2026-11-09 | « but is a poor fit for dashboards, dev tools » |
| Demande **moins** de prompting frontend que les modèles antérieurs | Opus 4.8 | [Prompting Claude Opus 4.8][o48], 2026-11-09 | « generates distinctive, creative front ends with more minimal prompting guidance » |
| Consomme **plus** de tokens en contexte interactif, parce qu'il raisonne davantage après les tours user | Opus 4.8 | [Prompting Claude Opus 4.8][o48], 2026-11-09 | « primarily because it reasons more after user turns » |

#### Claude Haiku 5.5

| Règle spécifique | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| **Premier Haiku avec des niveaux d'effort** ; l'effort remplace `budget_tokens`, sans réglage à reporter | Haiku 5.5 | [Prompting Claude Haiku 5.5][h55], 2026-11-09 | « there's no old setting to carry over » |
| `medium` est le défaut et le point de départ, coding agentique inclus | Haiku 5.5 | [Prompting Claude Haiku 5.5][h55], 2026-11-09 | « Start here for most work » |
| À `low`, plus de risque de sauter une recherche, de s'arrêter tôt, de sauter une vérification | Haiku 5.5 | [Prompting Claude Haiku 5.5][h55], 2026-11-09 | « more likely to skip a search, stop early, or skip a check » |
| `high` pour le knowledge work et le **suivi strict d'instructions** | Haiku 5.5 | [Prompting Claude Haiku 5.5][h55], 2026-11-09 | « longer agent tasks, and strict instruction following » |
| À `xhigh`/`max`, comparer aussi avec Sonnet 5.5 sur coût et vitesse | Haiku 5.5 | [Prompting Claude Haiku 5.5][h55], 2026-11-09 | « also run your evals on Claude Sonnet 5.5 and compare » |
| **Demander de répondre directement n'arrête pas le thinking** | Haiku 5.5 | [Prompting Claude Haiku 5.5][h55], 2026-11-09 | « telling the model to answer directly didn't stop it from thinking » |
| `disabled` accepté seulement à `low`/`medium`/`high` ; `xhigh`/`max` → 400 | Haiku 5.5 | [Prompting Claude Haiku 5.5][h55], 2026-11-09 | « the request returns a 400 error » |
| À `xhigh` en chat multi-tours : écrit parfois **toute** sa réponse dans le thinking et finit sans texte visible | Haiku 5.5 | [Prompting Claude Haiku 5.5][h55], 2026-11-09 | « check each response for an empty reply » |
| **Donner la date du jour** avec un tool de recherche ; la rendre une seule fois en début de conversation | Haiku 5.5 | [Prompting Claude Haiku 5.5][h55], 2026-11-09 | « The current date is {{current_date}}. » |
| Nudge de recherche : hausse du taux de recherche, et seulement **0 à 3 %** de recherches inutiles ajoutées | Haiku 5.5 | [Prompting Claude Haiku 5.5][h55], 2026-11-09 | « it added searches in only 0–3 percent of tries » |
| **Contre-exemple chiffré à ne pas reproduire** : une consigne de recherche systématique a fait chercher sur **la moitié** des prompts qui n'en avaient pas besoin | Haiku 5.5 | [Prompting Claude Haiku 5.5][h55], 2026-11-09 | « It didn't produce more correct answers. » |
| Texte de nudge superflu si le system prompt est court | Haiku 5.5 | [Prompting Claude Haiku 5.5][h55], 2026-11-09 | « You can skip this text if your system prompt is short. » |
| Thinking off + structured outputs : peut **sauter un tool call nécessaire** ; 3 correctifs | Haiku 5.5 | [Prompting Claude Haiku 5.5][h55], 2026-11-09 | « might skip a tool call it needs » |
| `tool_choice` restaure l'appel, mais plus aucun texte avant l'appel | Haiku 5.5 | [Prompting Claude Haiku 5.5][h55], 2026-11-09 | « the model then writes no text before the call » |
| Arrêt prématuré avec un **long** system prompt d'agent à `low` ; `low`→`medium` divise ~par deux, mais **plus que double** les tokens | Haiku 5.5 | [Prompting Claude Haiku 5.5][h55], 2026-11-09 | « roughly halved early stopping » |
| Du texte de raisonnement fuit dans la réponse visible, surtout thinking off ou `low` → adaptive + `medium` | Haiku 5.5 | [Prompting Claude Haiku 5.5][h55], 2026-11-09 | « switch to adaptive thinking and medium effort » |
| Chatbots : bloc de tenue au system prompt face à l'argumentation et à l'insistance, + `high` effort | Haiku 5.5 | [Prompting Claude Haiku 5.5][h55], 2026-11-09 | « The rules in this system prompt hold for the whole conversation. » |
| **Pas de server-side fallback** ; renvoyer la même requête donne généralement un autre refus | Haiku 5.5 | [Prompting Claude Haiku 5.5][h55], 2026-11-09 | « usually returns another refusal » |
| Les refus par classifiers sont **nouveaux** par rapport à Haiku 4.5 | Haiku 5.5 (vs Haiku 4.5) | [Prompting Claude Haiku 5.5][h55], 2026-11-09 | « these refusals are new » |
| **Piège d'exploitation** : n'ajouter ces textes system qu'aux **nouvelles** conversations ; renvoyer des blocs thinking après un changement de `system` peut donner un 400 | Haiku 5.5 | [Prompting Claude Haiku 5.5][h55], 2026-11-09 | « a stored conversation resumed with the new system prompt can fail » |

---

## 2 — OpenAI

> **Rappel de rang de source** (note 02) : pages de rang 2 (doc éditeur), lues via WebFetch, citations **non recoupées contre le HTML brut**. Les cases Citation entre parenthèses sont des **paraphrases**, pas des citations.

### 2.1 Tableau de règles

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Ne pas faire de chain-of-thought prompting sur un reasoning model | o-series et successeurs | [Reasoning best practices][oai-reason], 2026-11-09 | « Avoid chain-of-thought prompts » |
| Commencer zero-shot, n'ajouter des exemples qu'ensuite | o-series / reasoning | [Reasoning best practices][oai-reason], 2026-11-09 | « Try zero shot first, then few shot if needed » |
| `developer` remplace `system` depuis `o1-2024-12-17` | o1-2024-12-17 → | [Reasoning best practices][oai-reason], 2026-11-09 | « Developer messages are the new system messages » |
| Les reasoning models n'émettent pas de markdown par défaut ; réactivation par flag textuel | o-series | [Reasoning best practices][oai-reason], 2026-11-09 | « Formatting re-enabled » (1re ligne du developer message) |
| Délimiteurs (markdown, balises XML, titres de section) pour séparer les parties de l'input | o-series / reasoning | [Reasoning best practices][oai-reason], 2026-11-09 | (délimiteurs recommandés) |
| Hiérarchie d'instructions : developer > user | Responses API (GPT-5.x) | [Text generation guide][oai-text], 2026-11-09 | « prioritized ahead of user messages » |
| Le paramètre `instructions` prime sur `input` | Responses API | [Text generation guide][oai-text], 2026-11-09 | « take priority over a prompt in the `input` parameter » |
| Les instructions passées par `instructions` ne persistent pas via `previous_response_id` | Responses API | [Text generation guide][oai-text], 2026-11-09 | (scope = requête courante uniquement) |
| **Pinner `reasoning_effort`** à la migration pour éviter les défauts de thinking | GPT-5.2 | [GPT-5.2 prompting guide][oai-g52], 2026-11-09 | « Pin reasoning_effort » / « provider-default 'thinking' traps » |
| Les instructions contradictoires coûtent des reasoning tokens — auditer le prompt | GPT-5 | [GPT-5 prompting guide][oai-g5], 2026-11-09 | (le modèle dépense du raisonnement à réconcilier) |
| `verbosity` pilote la longueur de la réponse finale, pas celle du thinking | GPT-5 | [GPT-5 prompting guide][oai-g5], 2026-11-09 | (paramètre API + override en langage naturel) |
| Ne pas utiliser de préfixes `maximize_` pour pousser la rigueur | GPT-5 | [GPT-5 prompting guide][oai-g5], 2026-11-09 | (ont causé un usage excessif d'outils) |
| Responses API obligatoire pour les flux agentiques (réutilisation du reasoning) | GPT-5 | [GPT-5 prompting guide][oai-g5], 2026-11-09 | (`previous_response_id` reporte les reasoning items) |
| Donner des contraintes de longueur chiffrées | GPT-5.2 | [GPT-5.2 prompting guide][oai-g52], 2026-11-09 | « Give clear and concrete length constraints » |
| Découper les tâches séparables en tours d'agent distincts, un par tâche | GPT-5 | [GPT-5 prompting guide][oai-g5], 2026-11-09 | (un tour par tâche) |

### 2.2 Reasoning effort — valeurs et dérive des défauts

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| `reasoning_effort` accepte `none`, `minimal`, `low`, `medium`, `high`, `xhigh` | GPT-5, 5.1, 5.2 | [GPT-5.2 prompting guide][oai-g52], 2026-11-09 | (six valeurs documentées) |
| **GPT-5 défaut `medium` ; GPT-5.1 et GPT-5.2 défaut `none`** | GPT-5 vs GPT-5.1 / 5.2 | [GPT-5.2 prompting guide][oai-g52], 2026-11-09 | (dérive de défaut entre générations) |
| Mapping de migration : GPT-4o et GPT-4.1 → GPT-5.2 à `none` ; GPT-5 `minimal` → `none` ; GPT-5.1 garde sa valeur | GPT-4o, GPT-4.1, GPT-5, GPT-5.1 → GPT-5.2 | [GPT-5.2 prompting guide][oai-g52], 2026-11-09 | (table de mapping) |
| Baisser `reasoning_effort` réduit la portée agentique | GPT-5 | [GPT-5 prompting guide][oai-g5], 2026-11-09 | « Switch to a lower `reasoning_effort` » |
| L'augmenter réduit les questions de clarification | GPT-5 | [GPT-5 prompting guide][oai-g5], 2026-11-09 | « we recommend increasing `reasoning_effort` » |
| À `minimal`, les résultats varient plus selon le prompt | GPT-5 | [GPT-5 prompting guide][oai-g5], 2026-11-09 | « can vary more drastically depending on prompt » |
| Mode `none` : aucun reasoning token ; comportement proche de GPT-4.1/4o ; hosted tools fonctionnent quand même | GPT-5.1 | [GPT-5.1 prompting guide][oai-g51], 2026-11-09 | « `none` forces the model to never use reasoning tokens » |
| Même sans reasoning tokens, prompter un plan avant chaque appel de fonction améliore la précision | GPT-5.1 | [GPT-5.1 prompting guide][oai-g51], 2026-11-09 | (plan avant appel) |

### 2.3 Eagerness, preambles, markdown

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Moins d'eagerness : budget d'appels d'outils fixe + escape hatch | GPT-5 | [GPT-5 prompting guide][oai-g5], 2026-11-09 | « an absolute maximum of 2 tool calls » |
| Escape hatch cité | GPT-5 | [GPT-5 prompting guide][oai-g5], 2026-11-09 | « even if it might not be fully correct » |
| Plus d'eagerness : langage de persistance | GPT-5 | [GPT-5 prompting guide][oai-g5], 2026-11-09 | « please keep going until the user's query is completely resolved » |
| Idem, deuxième formule | GPT-5 | [GPT-5 prompting guide][oai-g5], 2026-11-09 | « Never stop or hand back to the user when you encounter uncertainty » |
| Seuils de confirmation plus hauts pour les outils conséquents (checkout, suppression de fichier) | GPT-5 | [GPT-5 prompting guide][oai-g5], 2026-11-09 | (seuils relevés) |
| Fréquence, style et contenu des preambles pilotables par prompt | GPT-5 | [GPT-5 prompting guide][oai-g5], 2026-11-09 | « Always begin by rephrasing the user's goal » |
| Plan amont, puis updates, puis résumé distinct du plan initial | GPT-5 | [GPT-5 prompting guide][oai-g5], 2026-11-09 | « distinct from your upfront plan » |
| À reasoning `minimal`, des preambles fournis **améliorent** la performance agentique | GPT-5 | [GPT-5 prompting guide][oai-g5], 2026-11-09 | (amélioration mesurée) |
| Par défaut l'API ne rend pas de markdown ; l'activer « only where semantically correct », backticks pour fichiers/fonctions/classes | GPT-5 | [GPT-5 prompting guide][oai-g5], 2026-11-09 | « only where semantically correct » |
| Si l'adhérence markdown décroche en conversation longue, **réinjecter l'instruction tous les 3-5 messages utilisateur** | GPT-5 | [GPT-5 prompting guide][oai-g5], 2026-11-09 | (réinjection périodique) |
| Les specs XML structurées (`<[instruction]_spec>`) améliorent l'adhérence et permettent le cross-référencement | GPT-5 | [GPT-5 prompting guide][oai-g5], 2026-11-09 | (specs XML nommées) |

### 2.4 Ce que les docs OpenAI disent explicitement de NE PAS faire

| Interdiction | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Pas de chain-of-thought prompting ; demander « think step by step » peut **dégrader** la performance | o-series | [Reasoning best practices][oai-reason], 2026-11-09 | « Avoid chain-of-thought prompts » |
| Ne pas faire confirmer ou clarifier les hypothèses par l'humain | GPT-5 | [GPT-5 prompting guide][oai-g5], 2026-11-09 | « Do not ask the human to confirm or clarify assumptions » |
| Ne presque jamais demander à l'utilisateur de valider un plan | GPT-5 | [GPT-5 prompting guide][oai-g5], 2026-11-09 | « you should almost never ask the user whether to proceed with a plan » |
| Biais contre la demande d'aide | GPT-5 | [GPT-5 prompting guide][oai-g5], 2026-11-09 | « Bias towards not asking the user for help » |
| Ne pas déléguer tout le raisonnement aux appels d'outils | GPT-5 | [GPT-5 prompting guide][oai-g5], 2026-11-09 | « DO NOT do this entire process by making function calls only » |
| Ne pas répondre à l'utilisateur en même temps qu'un tool call (prompt Tau-Bench) | GPT-5 | [GPT-5 prompting guide][oai-g5], 2026-11-09 | « you should not respond to the user at the same time » |
| Pas de code-golf ni de one-liners trop astucieux | GPT-5 | [GPT-5 prompting guide][oai-g5], 2026-11-09 | « Do not produce code-golf or overly clever one-liners » |
| Ne pas exposer la rubrique interne | GPT-5 | [GPT-5 prompting guide][oai-g5], 2026-11-09 | « do not show this to the user » |
| **Ne jamais fabriquer de chiffres exacts ni de références externes** | GPT-5.2 | [GPT-5.2 prompting guide][oai-g52], 2026-11-09 | « Never fabricate exact figures or external references » |
| Ne pas narrer les appels d'outils de routine ; ne pas élargir la tâche ; pas de longs paragraphes narratifs ; ne pas reformuler la demande sauf si cela change le sens ; traiter les items compactés comme opaques | GPT-5.2 | [GPT-5.2 prompting guide][oai-g52], 2026-11-09 | (cinq interdits énumérés) |
| Pas de narration de process/outillage sauf demande ou blocage | GPT-5.1 | [GPT-5.1 prompting guide][oai-g51], 2026-11-09 | « Do not include process/tooling narration » |
| Ne pas s'engager sur des vérifications optionnelles qu'on ne fera pas | GPT-5.1 | [GPT-5.1 prompting guide][oai-g51], 2026-11-09 | « Do not commit to optional checks » |
| Ne pas faire passer un item de pending à completed sans in_progress | GPT-5.1 | [GPT-5.1 prompting guide][oai-g51], 2026-11-09 | « Do not jump an item from pending to completed » |
| Ne pas compléter plusieurs items après coup | GPT-5.1 | [GPT-5.1 prompting guide][oai-g51], 2026-11-09 | « Do not batch-complete multiple items after the fact » |
| Ne pas coder les couleurs en dur quand un design system existe | GPT-5.1 | [GPT-5.1 prompting guide][oai-g51], 2026-11-09 | « Do not hard-code colors » |
| Pas d'accusés de réception stéréotypés sauf si le ton de l'utilisateur l'invite | GPT-5.1 | [GPT-5.1 prompting guide][oai-g51], 2026-11-09 | (accusés de réception) |

### 2.5 GPT-5.1 et GPT-5.2 : spécificités

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Biais de brièveté à corriger : insister sur la persistance et la complétude | GPT-5.1 | [GPT-5.1 prompting guide][oai-g51], 2026-11-09 | « can sometimes err on the side of being excessively concise » |
| Bloc `<solution_persistence>` : agent « extremely biased for action » ; laisser l'utilisateur en attente est « very bad » | GPT-5.1 | [GPT-5.1 prompting guide][oai-g51], 2026-11-09 | « extremely biased for action » |
| Bloc `<output_verbosity_spec>` : exemple plafonnant à deux phrases | GPT-5.1 | [GPT-5.1 prompting guide][oai-g51], 2026-11-09 | « at most 2 concise sentences » |
| Bloc `<user_updates_spec>` : updates « at least every 6 execution steps or 8 tool calls », récap final en checklist Done/Closed | GPT-5.1 | [GPT-5.1 prompting guide][oai-g51], 2026-11-09 | « at least every 6 execution steps or 8 tool calls » |
| Bloc `<user_update_immediacy>` | GPT-5.1 | [GPT-5.1 prompting guide][oai-g51], 2026-11-09 | « explain what you're doing in a commentary message FIRST » |
| Parallélisme : activer et encourager les appels parallèles dans les descriptions d'outils | GPT-5.1 | [GPT-5.1 prompting guide][oai-g51], 2026-11-09 | « Parallelize tool calls whenever possible » |
| Blocs nommés documentés : `<final_answer_formatting>`, `<output_verbosity_spec>`, `<user_updates_spec>`, `<user_update_immediacy>`, `<solution_persistence>`, `<plan_tool_usage>`, `<design_system_enforcement>` | GPT-5.1 | [GPT-5.1 prompting guide][oai-g51], 2026-11-09 | (liste de blocs) |
| Verbosité globalement plus basse mais toujours prompt-sensible | GPT-5.2 | [GPT-5.2 prompting guide][oai-g52], 2026-11-09 | « Generally lower verbosity » |
| Prend plus d'actions d'outils que GPT-5.1 en interactif (réductible par prompt) | GPT-5.2 | [GPT-5.2 prompting guide][oai-g52], 2026-11-09 | (plus d'actions d'outils) |
| Nouvel endpoint `/responses/compact` pour compresser l'état conversationnel long | GPT-5.2 | [GPT-5.2 prompting guide][oai-g52], 2026-11-09 | (nouvel endpoint) |
| Continuité annoncée avec la guidance GPT-5 / 5.1 | GPT-5.2 | [GPT-5.2 prompting guide][oai-g52], 2026-11-09 | « Existing GPT-5 / GPT-5.1 prompting guidance largely carries over and remains applicable » |
| Blocs réutilisables nommés : `<user_updates_spec>`, `<solution_persistence>`, `<design_system_enforcement>` | GPT-5.2 | [GPT-5.2 prompting guide][oai-g52], 2026-11-09 | (blocs réutilisables) |

### 2.6 Reasoning vs non-reasoning, et Structured Outputs

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Ni famille n'est meilleure : GPT pour vitesse/coût et tâches bien définies, o-series pour précision et multi-étapes | GPT vs o-series | [Reasoning best practices][oai-reason], 2026-11-09 | « One model family isn't better than the other—they're just different » |
| `"strict": true` dans `text.format` avec `"type": "json_schema"` | GPT-4o+ | [Structured Outputs guide][oai-so], 2026-11-09 | « ensures the model will always generate responses that adhere to your supplied JSON Schema » |
| JSON mode et Structured Outputs produisent tous deux du JSON valide, mais seul le second garantit le schéma | GPT-4o+ | [Structured Outputs guide][oai-so], 2026-11-09 | « only Structured Outputs ensure schema adherence » |
| Recommandation explicite | GPT-4o+ | [Structured Outputs guide][oai-so], 2026-11-09 | « always using Structured Outputs instead of JSON mode when possible » |
| Restriction reconnue : sous-ensemble de JSON Schema | GPT-4o+ | [Structured Outputs guide][oai-so], 2026-11-09 | « some features are unavailable either for performance or technical reasons » |
| **Refusals** : tester le champ `refusal` **avant** de parser, et le statut `"incomplete"` | GPT-4o+ | [Structured Outputs guide][oai-so], 2026-11-09 | (refus possiblement hors schéma) |
| Support : à partir de GPT-4o ; `json_schema` exige `gpt-4o-2024-08-06` / `gpt-4o-mini-2024-07-18` ou plus récent ; `gpt-4-turbo` retombe sur JSON mode | GPT-4o → ; **historique** : gpt-4-turbo | [Structured Outputs guide][oai-so], 2026-11-09 | (matrice de support) |
| Latence : seule la **première** requête avec un schéma neuf est plus lente | GPT-4o+ | [Structured Outputs guide][oai-so], 2026-11-09 | (traitement du schéma) |
| Partage des rôles : function calling pour brancher les outils ; `text.format` pour la structure de la réponse à l'utilisateur | GPT-4o+ | [Structured Outputs guide][oai-so], 2026-11-09 | (séparation des rôles) |
| Changement de schéma en cours de conversation : item `configuration_update`, qui **remplace tout le format** | **GPT-6+** supportés en mode standard single-agent | [Structured Outputs guide][oai-so], 2026-11-09 | (n'accepte que `json_schema` ou `text`) |

---

## 3 — Google / Gemini

> **Rappel de rang de source** (note 02) : pages de rang 2, lues via WebFetch, citations non recoupées contre le HTML brut.

### 3.1 Tableau de règles

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Inclure des few-shot examples ; sans eux le prompt est moins efficace | Gemini (général) | [Prompting strategies][g-strat], 2026-11-09 | « are likely to be less effective » |
| Ne pas multiplier les exemples (risque d'overfit) | Gemini | [Prompting strategies][g-strat], 2026-11-09 | (quelques exemples suffisent) |
| Structure identique entre exemples (tags, espaces, séparateurs) | Gemini | [Prompting strategies][g-strat], 2026-11-09 | (formatage incohérent = sortie incohérente) |
| Contraintes, persona et format de sortie dans la system instruction ou au tout début | Gemini | [Prompting strategies][g-strat], 2026-11-09 | « essential behavioral constraints, role definitions (persona), and output format requirements » |
| Contexte d'abord, question **en dernier** | Gemini | [Prompting strategies][g-strat] ; [Long context][g-long], 2026-11-09 | « put your query / question at the end of the prompt » |
| **Retirer `temperature`, `top_p`, `top_k` des configs** | **Gemini 4 et Gemini 3.6+** | [Prompting strategies][g-strat], 2026-11-09 | (valeurs custom ignorées) |
| Garder ces params aux défauts sur les Gemini 3 antérieurs | **Gemini 3 (antérieurs)** | [Prompting strategies][g-strat], 2026-11-09 | « degraded reasoning performance » |
| Ne pas demander un raisonnement pas-à-pas dans la réponse | **Gemini 2.5 et 3** | [Prompting strategies][g-strat], 2026-11-09 | (ils raisonnent déjà en interne) |
| Éviter le langage trop persuasif ou inutile | **Gemini 3** | [Prompting strategies][g-strat], 2026-11-09 | (prompts Gemini 3) |
| Pour les schémas JSON complexes, utiliser Structured Output, pas le prompt | Gemini | [Prompting strategies][g-strat], 2026-11-09 | (plutôt que formatage prompt-only) |
| Thinking activé par défaut ; piloté par `thinking_level` | Gemini 2.5 / 3 / 3.6 | [Thinking][g-think], 2026-11-09 | `"thinking_level": "low"` dans `generation_config` |
| En stateless, renvoyer les blocs `thought` inchangés | Gemini thinking | [Thinking][g-think], 2026-11-09 | « You **MUST** always resend all `thought` blocks exactly as they were received » |
| Le grounding laisse l'affichage des sources au développeur | Gemini | [Grounding with Google Search][g-search], 2026-11-09 | « complete control over how you display sources » |

### 3.2 Prompt design, thinking, long contexte, grounding

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Délimiteurs cohérents (balises XML ou titres Markdown), un seul format par prompt | Gemini | [Prompting strategies][g-strat], 2026-11-09 | (un seul format) |
| **Prefixes / completion** : amorcer la sortie soi-même (début de plan, accolade JSON ouvrante) et laisser le modèle poursuivre | Gemini | [Prompting strategies][g-strat], 2026-11-09 | (préfixe de réponse type « Output: ») |
| Si les exemples sont assez clairs, on peut supprimer les instructions redondantes | Gemini | [Prompting strategies][g-strat], 2026-11-09 | (instructions redondantes) |
| Nuance : pour les problèmes à raisonnement lourd, demander de « penser soigneusement » peut aider, **au prix de plus de thinking tokens** | Gemini | [Prompting strategies][g-strat], 2026-11-09 | (nuance au contre-indiqué ci-dessus) |
| Stop sequences : chaînes improbables dans la sortie ; `max_output_tokens` ≈ 100 tokens pour 60-80 mots | Gemini | [Prompting strategies][g-strat], 2026-11-09 | (réglages de sortie) |
| Face à un repli de filtre de sécurité, la page suggère d'**augmenter** la temperature | Gemini | [Prompting strategies][g-strat], 2026-11-09 | (**en tension** avec le retrait de `temperature`, voir §8) |
| Supports par modèle : `gemini-2.5-flash-lite` off par défaut (low/medium/high) ; `gemini-3.6-flash` défaut `medium` (minimal→high) ; `gemini-3-pro-preview` **seulement** low et high | Gemini 2.5 / 3 / 3.6 | [Thinking][g-think], 2026-11-09 | (matrice de support) |
| La page documente **`thinking_level` uniquement** — elle ne mentionne pas `thinking_budget` | Gemini thinking | [Thinking][g-think], 2026-11-09 (constat de lecture) | — |
| `max_output_tokens` plafonne **thinking + output combinés** | Gemini thinking | [Thinking][g-think], 2026-11-09 | (plafond combiné) |
| Thought signature = état de raisonnement chiffré ; en stateful (`store: true` + `previous_interaction_id`) le serveur gère les signatures | Gemini thinking | [Thinking][g-think], 2026-11-09 | « An encrypted representation of the model's internal reasoning state » |
| Thought summaries via `thinking_summaries` ; par défaut seule la sortie finale est renvoyée ; résumés possiblement vides | Gemini thinking | [Thinking][g-think], 2026-11-09 | « Pricing is based on the full thought tokens the model needs to generate » |
| Conseil de coût | Gemini thinking | [Thinking][g-think], 2026-11-09 | « Prompt the model to think less for lengthy outputs to save tokens » |
| `gemini-4-argon` : fenêtre 1M **partagée** entre input, thinking et output ; input + `max_output_tokens` plafonné à 1 048 576 | **Gemini 4** | [Long context][g-long], 2026-11-09 | « shared across input, thinking, and output tokens » |
| Gemini 3 et 2.5 : budgets séparés | **Gemini 3, 2.5** | [Long context][g-long], 2026-11-09 | « separate 1M input and 64K output budgets » |
| Limite de fiabilité : récupération single-needle forte, précision qui **baisse avec plusieurs needles** | Gemini long contexte | [Long context][g-long], 2026-11-09 | « Performance can vary to a wide degree depending on the context » |
| Context caching comme levier de coût principal ; input caché facturé au stockage/heure ; latence croissante avec la longueur | Gemini long contexte | [Long context][g-long], 2026-11-09 | « longer queries will have higher latency » |
| Réponses groundées exposées via `steps` et `annotations` — la page **n'emploie pas** `groundingMetadata` | Gemini | [Grounding with Google Search][g-search], 2026-11-09 (constat de lecture) | — |
| Chaque annotation `url_citation` lie un segment de texte à une URL, délimité par `start_index` / `end_index` | Gemini | [Grounding with Google Search][g-search], 2026-11-09 | « links a text segment … to a source URL » |
| Le step `google_search_result` contient un snippet HTML de suggestions ; obligations d'usage renvoyées aux ToS | Gemini | [Grounding with Google Search][g-search], 2026-11-09 | « search_suggestions, an HTML snippet for rendering search suggestions » |
| La page **n'énonce aucune règle d'affichage obligatoire** et ne prescrit aucun format de citation | Gemini | [Grounding with Google Search][g-search], 2026-11-09 (constat de lecture) | — |

---

## 4 — Open-weight : Meta, Mistral, Qwen, DeepSeek

> **Rang de source** : la model card Hugging Face Qwen3 et les formats de tokens Llama 4 sont les **deux seules sources de rang 1 (artefact)** de la note 02. Le reste est de rang 2 (doc éditeur), lu via WebFetch.

### 4.1 Meta / Llama 4

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Tokens de rôle `<\|header_start\|>` / `<\|header_end\|>`, fin de tour `<\|eot\|>` | Llama 4 | [Llama 4 prompt format][llama4], 2026-11-09 (**rang 1**) | « End of turn » |
| Les définitions de fonctions vont dans le **system message** | Llama 4 | [Llama 4 prompt format][llama4], 2026-11-09 | (system placé en premier) |
| La sortie d'outil utilise le rôle `ipython`, **pas** `tool` | Llama 4 | [Llama 4 prompt format][llama4], 2026-11-09 | (rôle nommé `ipython`) |
| System prompt recommandé, à personnaliser | Llama 4 | [Llama 4 prompt format][llama4], 2026-11-09 | « You are an expert conversationalist who responds to the best of your ability » |
| Le system prompt suggéré est un template à adapter ; objectif déclaré : réduire les faux refus et le ton moralisateur, ne pas refuser les prompts politiques ; annonce un knowledge cutoff **août 2024** | Llama 4 | [Llama 4 prompt format][llama4], 2026-11-09 | « should be customized for specific needs or use cases » |
| `<\|begin_of_text\|>` en tête ; `<\|end_of_text\|>` **généré uniquement par les modèles pretrained** | Llama 4 | [Llama 4 prompt format][llama4], 2026-11-09 | « Model will cease to generate more tokens » |
| Template multi-tours documenté (system → user → assistant, séparés par `<\|eot\|>`) | Llama 4 | [Llama 4 prompt format][llama4], 2026-11-09 | (template cité intégralement dans la note) |
| Tokens image (`<\|image_start\|>`, `<\|patch\|>`, `<\|tile_x_separator\|>`…) peuplés automatiquement à l'inférence | Llama 4 | [Llama 4 prompt format][llama4], 2026-11-09 | (peuplés automatiquement) |
| **Aucun reasoning tag mentionné** sur la page Llama 4 | Llama 4 | [Llama 4 prompt format][llama4], 2026-11-09 (constat de lecture) | — |
| Les sauts de ligne du prompt doivent être présents à la tokenisation | Llama (général) | [Model cards overview][llama-idx], 2026-11-09 | « newlines must be present in the prompt sent to the tokenizer » |
| Depuis 3.1, le chat template vit dans la **config du tokenizer**, pas dans la doc | Llama 3.1 → | [Model cards overview][llama-idx], 2026-11-09 | « incorporated into the tokenizer configuration » |
| Générations listées dans la navigation : Llama 4, Llama Guard 4, Llama 3.3, « Other models » | Llama 4, 3.3 | [Model cards overview][llama-idx], 2026-11-09 | (liste de navigation) |

### 4.2 Mistral

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| System = contexte général, en début de conversation ; user = contexte du tour | Mistral (général) | [Prompting capabilities][mistral], 2026-11-09 | « provided at the beginning of the conversation » |
| Si le system prompt n'est pas contrôlable, concaténer dans le message user | Mistral | [Prompting capabilities][mistral], 2026-11-09 | (fallback documenté) |
| Few-shot soit dans le prompt, soit en faux tours d'historique | Mistral | [Prompting capabilities][mistral], 2026-11-09 | « artificial interactions between the user and model » |
| Délimiteurs recommandés : Markdown et/ou balises XML | Mistral | [Prompting capabilities][mistral], 2026-11-09 | « Markdown and/or XML-style tags » |
| Organiser les instructions hiérarchiquement, en sections claires ; le prompt doit suffire à une personne sans contexte | Mistral | [Prompting capabilities][mistral], 2026-11-09 | (hiérarchie d'instructions) |
| Pour des réponses parsables : imposer un format JSON et renvoyer vers la doc Structured Outputs | Mistral | [Prompting capabilities][mistral], 2026-11-09 | (renvoi vers Structured Outputs) |
| La page montre les deux formes (messages séparés ; message unique concaténé) **sans les présenter comme un template formel** | Mistral | [Prompting capabilities][mistral], 2026-11-09 (constat de lecture) | — |

### 4.3 Qwen3 / Qwen3-2507

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Format ChatML avec tokens de contrôle de tour | Qwen3 | [Key concepts][qwen-concepts], 2026-11-09 | `<\|im_start\|>{{role}}` … `<\|im_end\|>` |
| **Aucun system message par défaut** | Qwen3 | [Key concepts][qwen-concepts], 2026-11-09 | « Starting with Qwen3, no default system messages are used » |
| Rôles : `user` en entrée, `assistant` en sortie ; `system` porte les méta-instructions (ton, style, comportement) | Qwen3 | [Key concepts][qwen-concepts], 2026-11-09 | (répartition des rôles) |
| Séparation raisonnement / réponse par les tokens `<think>` et `</think>` | Qwen3 | [Key concepts][qwen-concepts], 2026-11-09 | (tokens `<think>`) |
| Le bloc de thinking ne doit figurer que dans le dernier tour | Qwen3 | [Key concepts][qwen-concepts], 2026-11-09 | « thinking block should only be included in the final round » |
| Exception documentée à cette règle : les **appels d'outils multi-étapes** | Qwen3 | [Key concepts][qwen-concepts], 2026-11-09 | (exception tool calls) |
| Thinking / non-thinking dans un seul modèle (hybrid) | Qwen3 | [Key concepts][qwen-concepts] ; [Qwen docs index][qwen-idx], 2026-11-09 | « without changing models » |
| Qwen3-2507 sépare Instruct-only et Thinking-only | Qwen3-2507 | [Qwen docs index][qwen-idx], 2026-11-09 | (modèles distincts) |
| **Ne jamais utiliser le greedy decoding** | Qwen3 (thinking) | [Model card Qwen3-235B-A22B][qwen-card], 2026-11-09 (**rang 1, artefact**) | « DO NOT use greedy decoding » |
| Sampling thinking : Temperature **0.6**, TopP **0.95**, TopK **20**, MinP **0** | Qwen3 (thinking) | [Model card Qwen3-235B-A22B][qwen-card], 2026-11-09 (**rang 1**) | (valeurs prescrites) |
| Sampling non-thinking : Temperature **0.7**, TopP **0.8**, TopK **20**, MinP **0** | Qwen3 (non-thinking) | [Model card Qwen3-235B-A22B][qwen-card], 2026-11-09 (**rang 1**) | (valeurs prescrites) |
| `enable_thinking` : thinking **activé par défaut** ; `enable_thinking=False` passé à `apply_chat_template` supprime tout bloc `<think>` | Qwen3 | [Model card Qwen3-235B-A22B][qwen-card], 2026-11-09 (**rang 1**) | (`/think`, `/no_think` actifs seulement si `True`) |
| Soft switches `/think` et `/no_think` : dans le prompt user ou le system message, changent le mode tour par tour, le modèle suit la **dernière** instruction ; ignorés si `enable_thinking=False` | Qwen3 | [Model card Qwen3-235B-A22B][qwen-card], 2026-11-09 (**rang 1**) | (soft switches) |
| L'historique assistant ne garde que la sortie finale ; c'est le template Jinja2 qui l'applique, et **tout framework qui le contourne doit l'imposer lui-même** | Qwen3 | [Model card Qwen3-235B-A22B][qwen-card], 2026-11-09 (**rang 1**) | « should only include the final output part » |

### 4.4 DeepSeek V4.1

> **Point à ne pas sur-lire.** La note 02 est explicite : la page `guides/reasoning_model` ouverte le 2026-11-09 **ne mentionne plus `deepseek-reasoner`** et ne traite **ni system prompt, ni few-shot, ni temperature, ni `reasoning_content`**. Les chercheurs n'ont donc **aucune règle de prompting DeepSeek lue** sur ces quatre points pour la génération courante, et **ne les affirment dans aucun sens** — ni que les règles « style R1 » tiennent, ni qu'elles ont été retirées. Voir §9.

| Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|
| Thinking activé par champ dédié + `reasoning_effort` | DeepSeek V4.1 | [API docs][deepseek], 2026-11-09 | `"thinking": {"type": "enabled"}` |
| Modèles courants : `deepseek-flash` et `deepseek-v4-pro` | DeepSeek V4.1 | [API docs][deepseek], 2026-11-09 | « Use `deepseek-flash` as the model name » |
| Noms legacy acceptés mais retirés, redirigés vers V4.1-Flash | DeepSeek V4.1 | [API docs][deepseek], 2026-11-09 | (`deepseek-v4-flash` → V4.1-Flash-1017) |
| Base URL `https://api.deepseek.com` (format OpenAI) ou `https://api.deepseek.com/anthropic` (format Anthropic) | DeepSeek V4.1 | [API docs][deepseek], 2026-11-09 | (deux formats) |
| Les exemples envoient un message de rôle `system` ; en Python, `thinking` passe par `extra_body` | DeepSeek V4.1 | [API docs][deepseek], 2026-11-09 | « You are a helpful assistant. » |
| `deepseek-flash` est servi par **DeepSeek-V4.1-Flash-1017** | DeepSeek V4.1 | [API docs][deepseek], 2026-11-09 | (mapping de service) |

### 4.5 Là où un fournisseur non-Anthropic contredit un autre

Reproduit de la note 02. **Aucun éditeur ne commente la guidance d'un concurrent** : ces contradictions sont des juxtapositions établies par les chercheurs, pas des désaccords revendiqués (constat de la note 02).

| Sujet | Fournisseur A — règle | Fournisseur B — règle | Génération(s) |
|---|---|---|---|
| **Few-shot examples** | OpenAI : « Try zero shot first, then few shot if needed » — [Reasoning best practices][oai-reason], 2026-11-09 | Google : les prompts sans exemples « are likely to be less effective » — [Prompting strategies][g-strat], 2026-11-09 | OpenAI o-series/reasoning vs Gemini (général) |
| **System prompt par défaut** | Meta : system prompt recommandé, long, anti-refus — « You are an expert conversationalist who responds to the best of your ability » — [Llama 4][llama4], 2026-11-09 | Qwen : « Starting with Qwen3, no default system messages are used » — [Key concepts][qwen-concepts], 2026-11-09 | Llama 4 vs Qwen3 |
| **Nom du rôle de sortie d'outil** | Meta : rôle `ipython` — [Llama 4][llama4], 2026-11-09 | OpenAI : rôles documentés `developer`, `user`, `assistant` — [Text generation][oai-text], 2026-11-09 | Llama 4 vs Responses API (GPT-5.x) |
| **Nom du rôle d'instruction haute priorité** | OpenAI : « Developer messages are the new system messages » — [Reasoning best practices][oai-reason], 2026-11-09 | Mistral : `system` porte le contexte général, « provided at the beginning of the conversation » — [Prompting capabilities][mistral], 2026-11-09 ; Qwen (`system` dans ChatML) ; DeepSeek (exemples avec rôle `system`) — [API docs][deepseek], 2026-11-09 | GPT-5.x / o-series vs Mistral, Qwen3, DeepSeek V4.1 |
| **Réglage de temperature / top_p sur un modèle à thinking** | Google : valeurs custom **ignorées**, « remove them from request configurations » — [Prompting strategies][g-strat], 2026-11-09 | Qwen : valeurs **prescrites et différentes selon le mode**, et « DO NOT use greedy decoding » — [Model card Qwen3-235B-A22B][qwen-card], 2026-11-09 | Gemini 4 / 3.6+ vs Qwen3 |
| **Sortie déterministe (temperature 0 / greedy)** | Google : « A value of 0 always picks the most probable token » — [Prompting strategies][g-strat], 2026-11-09 | Qwen : interdit en thinking — « DO NOT use greedy decoding » — [Model card Qwen3-235B-A22B][qwen-card], 2026-11-09 | Gemini (modèles acceptant temperature) vs Qwen3 thinking |
| **Raisonnement pas-à-pas — CONVERGENCE, pas contradiction** | OpenAI : « Avoid chain-of-thought prompts » — [Reasoning best practices][oai-reason], 2026-11-09 | Google : ne pas demander de raisonnement pas-à-pas, les modèles raisonnent déjà en interne — [Prompting strategies][g-strat], 2026-11-09 | o-series/GPT-5 et Gemini 2.5/3 : **même règle** |
| **Persistance du reasoning entre tours** | Google : « You **MUST** always resend all `thought` blocks exactly as they were received » — [Thinking][g-think], 2026-11-09 | OpenAI : réutilisation par `previous_response_id`, pas par renvoi du contenu — [GPT-5 prompting guide][oai-g5], 2026-11-09 ; Qwen : bloc de thinking **seulement** au dernier tour — [Key concepts][qwen-concepts], 2026-11-09 | Gemini thinking vs GPT-5.x vs Qwen3 |

> **Inférence de la note 02, étiquetée comme telle.** La contradiction la plus coûteuse en pratique est celle sur la persistance du raisonnement : un même code d'historique de conversation ne peut pas être correct pour les trois fournisseurs ; c'est le point où un wrapper multi-fournisseur casse silencieusement.
>
> **Deuxième inférence de la note 02.** La contradiction few-shot n'est peut-être pas un désaccord de fond mais une différence de périmètre (la page OpenAI lue parle des **reasoning models**, la page Google couvre Gemini en général). Les chercheurs n'ont lu **ni** page OpenAI déconseillant le few-shot sur les modèles non-reasoning, **ni** page Google restreignant sa recommandation aux modèles non-thinking : en l'état des sources lues, la contradiction est réelle au niveau des textes.
>
> **Troisième inférence.** La contradiction `system` vs `developer` est nominale, pas fonctionnelle : tous les fournisseurs lus maintiennent un canal d'instruction de priorité supérieure. Le risque est de portabilité de code, pas de stratégie de prompt.
>
> **Quatrième inférence.** Le rôle `ipython` de Llama 4 et le rôle `tool` des APIs OpenAI-compatibles ne sont pas interchangeables : servir Llama 4 derrière une couche OpenAI-compatible implique une traduction de rôle, sinon le template de tool output est hors distribution. Tirée du format documenté, **non** d'une mise en garde explicite de Meta.

---

## 5 — Formulations à retirer

> **Ce que ce tableau est.** Le matériau le plus directement exploitable des notes : chaque ligne est une formulation que la documentation officielle demande de **retirer** d'un prompt existant, ou de ne pas écrire, avec le ou les modèles concernés et l'effet documenté.
>
> **Deux avertissements de provenance.** (1) Le tableau de synthèse de la note 01 ne porte **pas** d'URL ligne par ligne : il dit « Toutes les sources sont les pages par modèle lues le 2026-11-09 ». La colonne Source ci-dessous rétablit le lien en mappant chaque modèle nommé vers sa page de prompting, ou vers la page consolidée / Model deprecations pour les lignes qui en viennent (§1.2, §1.6). (2) Quand un modèle est nommé dans la ligne de synthèse mais **n'a pas de ligne propre** dans sa page par modèle, la citation est laissée à `—` plutôt que d'emprunter la citation d'un autre modèle.

| Formulation à retirer / éviter | Modèle(s) concerné(s) | Effet documenté | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|---|
| « hold all findings for the final response » | Fable 5.1, Sonnet 5.5, Opus 5.5 | supprime les updates dont on se plaint ensuite | [Prompting Claude Fable 5.1][f51] ; [Sonnet 5.5][s55] ; [Opus 5.5][o55], 2026-11-09 | « Remove lines like that before adding anything. » (Fable 5.1) ; — (Sonnet 5.5, Opus 5.5) |
| Toute règle « ne pense pas » / « ne raisonne pas » | Opus 5 (thinking off), Opus 5.5, Sonnet 5.5 (`between_tools`) | **augmente** la fuite de balises XML internes | [Prompting Claude Opus 5][o5] ; [Opus 5.5][o55] ; [Sonnet 5.5][s55], 2026-11-09 | « that kind of instruction increases tag leakage » (Opus 5) ; « remove the no-thinking rule either way » (Opus 5.5) ; « more likely that the model writes internal XML tags » (Sonnet 5.5) |
| Consignes demandant d'écrire / transcrire son raisonnement | Fable 5.1, Fable 5, Opus 5.5, Opus 5, Sonnet 5.5, Haiku 5.5 | refus `reasoning_extraction` | [Prompting best practices][bp] §Leverage thinking ; [Fable 5][f5], 2026-11-09 | « may be declined » (best-practices) ; « Audit existing skills and system prompts for reflection » (Fable 5) |
| « think carefully before answering » dans un system prompt de chat | Opus 5.5 | latence inutile, sans gain de qualité | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « removing such a line made replies start sooner » |
| Demander de « penser moins » pour réduire le thinking | Sonnet 5.5, Haiku 5.5, Opus 5.5 | sans effet fiable ; baisser l'effort à la place | [Prompting Claude Sonnet 5.5][s55] ; [Haiku 5.5][h55] ; [Opus 5.5][o55], 2026-11-09 | « Asking the model in the system prompt to think less doesn't reliably reduce its thinking. » (Sonnet 5.5) ; « telling the model to answer directly didn't stop it from thinking » (Haiku 5.5) ; « more reliably than prompt instructions do » (Opus 5.5) |
| « double-check your answer », « re-verify before responding », « include a final verification step » | **Opus 5** | sur-vérification, coût sans gain | [Prompting Claude Opus 5][o5] ; [Prompting best practices][bp], 2026-11-09 | « add cost without improving results » (Opus 5) ; « On Claude Opus 5, remove these instructions rather than rewriting them. » (best-practices) |
| « only report high-severity issues », « be conservative », « don't nitpick » | Opus 5, Opus 4.8, Sonnet 5 | suivi littéralement → recall en baisse | [Prompting Claude Opus 5][o5] ; [Opus 4.8][o48] ; [Sonnet 5][s5], 2026-11-09 | « ask it to report everything and filter in a separate pass instead » (Opus 5) ; — (Opus 4.8) ; « This is likely a harness effect, not a capability regression. » (Sonnet 5, recall en code review) |
| « only use tools when strictly necessary », « minimize tool calls » | Sonnet 5.5 | réponses depuis la mémoire au lieu d'une recherche | [Prompting Claude Sonnet 5.5][s55], 2026-11-09 | « check your prompt for language that discourages tool use » |
| « If in doubt, use [tool] », « Default to using [tool] » | Opus 4.6 | sur-déclenchement | [Prompting best practices][bp] §Overthinking, 2026-11-09 | « Instructions such as "If in doubt, use [tool]" cause overtriggering. » |
| « CRITICAL: You MUST use this tool when… » | Opus 4.5, Opus 4.6 | sur-déclenchement ; adoucir | [Prompting best practices][bp] §Tool usage, 2026-11-09 | « you can use more normal prompting such as "Use this tool when…" » |
| Consigne de recherche systématique quelle que soit la confiance | Haiku 5.5 | recherches inutiles sur **la moitié** des prompts | [Prompting Claude Haiku 5.5][h55], 2026-11-09 | « It didn't produce more correct answers. » |
| « After every 3 tool calls, summarize progress » | Sonnet 5, Opus 4.8 | scaffolding devenu inutile | [Prompting Claude Sonnet 5][s5] ; [Opus 4.8][o48], 2026-11-09 | « try removing it » (Sonnet 5) ; — (Opus 4.8) |
| Règles anti-formatage héritées (anti-bullets, anti-markdown) | **Fable 5.1** | supprime une structure dont le contenu a besoin | [Prompting Claude Fable 5.1][f51] ; [Prompting best practices][bp], 2026-11-09 | « it uses bold less and is less likely to reach for headers » (Fable 5.1) ; « a block like this can suppress structure the content needs » (best-practices) |
| « avoid a generic AI look » (générique) | Opus 5.5, Sonnet 5, Opus 4.8 | échange un défaut esthétique contre un autre | [Prompting Claude Opus 5.5][o55] ; [Sonnet 5][s5] ; [Opus 4.8][o48], 2026-11-09 | « mostly swaps one default for another » (Opus 5.5) ; « tend to shift the model to a different fixed palette » (Sonnet 5) ; — (Opus 4.8) |
| Nommer explicitement les balises `<thinking>` dans une interdiction | Opus 5 | moins efficace que la forme générale | [Prompting Claude Opus 5][o5], 2026-11-09 | « so avoid naming them specifically » |
| Compte à rebours de tokens exposé au modèle | Fable 5, Sonnet 5.5 | arrêts prématurés ; lectures en prompt injection | [Prompting Claude Fable 5][f5] ; [Sonnet 5.5][s55], 2026-11-09 | « Avoid surfacing explicit context-budget counts where possible. » (Fable 5) ; « don't add your own token or budget countdown after tool results » (Sonnet 5.5) |
| Skills très prescriptives héritées de modèles antérieurs | Fable 5 | **dégradent** la qualité de sortie | [Prompting Claude Fable 5][f5], 2026-11-09 | « can degrade output quality » |
| `budget_tokens` | 4.7+, Sonnet 5, Haiku 5.5 | **erreur 400** — voir §7 | [Prompting best practices][bp] §Overthinking ; [Sonnet 5][s5] ; [Haiku 5.5][h55], 2026-11-09 | « setting `budget_tokens` returns a 400 error » (best-practices) ; « is not supported on Claude Sonnet 5 and returns a 400 error » (Sonnet 5) |
| `temperature`, `top_p`, `top_k` | API `2026-10-21` ; 4.7+ si valeur non par défaut | **erreur 400** — voir §7 | [Model deprecations][deprec] §API parameter deprecations ; [Sonnet 5][s5], 2026-11-09 | « Removed in API version 2026-10-21 » ; « returns a 400 error on Claude Sonnet 5 » |
| Prefill du dernier tour assistant | 4.6+ | **erreur 400** — voir §7 | [Prompting best practices][bp] §Migrating away from prefilled responses, 2026-11-09 | « Requests with prefilled assistant messages to these models return a 400 error. » |

### 5.1 À retirer côté non-Anthropic

Même logique, pour les autres fournisseurs. Toutes ces lignes viennent de la note 02 (rang 2 sauf mention).

| Formulation à retirer / éviter | Fournisseur / génération | Effet documenté | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|---|
| Chain-of-thought scaffolding, « think step by step » | OpenAI, o-series et successeurs | le modèle raisonne déjà en interne ; peut **dégrader** la performance | [Reasoning best practices][oai-reason], 2026-11-09 | « Avoid chain-of-thought prompts » |
| Préfixes `maximize_` pour pousser la rigueur | OpenAI, GPT-5 | usage excessif d'outils | [GPT-5 prompting guide][oai-g5], 2026-11-09 | (ont causé un usage excessif d'outils) |
| Instructions contradictoires laissées dans le prompt | OpenAI, GPT-5 | coûtent des reasoning tokens à réconcilier | [GPT-5 prompting guide][oai-g5], 2026-11-09 | (auditer le prompt) |
| Demande de raisonnement pas-à-pas dans la réponse | Google, Gemini 2.5 et 3 | ils raisonnent déjà en interne | [Prompting strategies][g-strat], 2026-11-09 | (contre-indiqué) |
| Langage trop persuasif ou inutile | Google, Gemini 3 | — | [Prompting strategies][g-strat], 2026-11-09 | (à éviter) |
| `temperature`, `top_p`, `top_k` dans les configs | Google, **Gemini 4 et 3.6+** | valeurs **ignorées silencieusement** — voir §7 | [Prompting strategies][g-strat], 2026-11-09 | (« remove them from request configurations ») |
| Multiplication des exemples few-shot | Google, Gemini | risque d'overfit | [Prompting strategies][g-strat], 2026-11-09 | (quelques exemples suffisent) |
| Formatage prompt-only pour les schémas JSON complexes | Google, Gemini | préférer Structured Output | [Prompting strategies][g-strat], 2026-11-09 | (plutôt que formatage prompt-only) |
| JSON mode quand Structured Outputs est disponible | OpenAI, GPT-4o+ | seul Structured Outputs garantit le schéma | [Structured Outputs guide][oai-so], 2026-11-09 | « always using Structured Outputs instead of JSON mode when possible » |
| Greedy decoding | Qwen3 (thinking) | interdit explicitement | [Model card Qwen3-235B-A22B][qwen-card], 2026-11-09 (**rang 1**) | « DO NOT use greedy decoding » |
| Garder le bloc `<think>` dans les tours assistant antérieurs | Qwen3 | l'historique ne doit garder que la sortie finale | [Model card Qwen3-235B-A22B][qwen-card], 2026-11-09 (**rang 1**) | « should only include the final output part » |

---

## 6 — Inversions entre générations

> **Pourquoi cette section ne peut pas être aplatie.** Les règles ci-dessous **se contredisent d'une génération à l'autre**. Il n'existe pas de formulation unique qui soit vraie des deux côtés. Un fichier de règles qui ne colonne pas par génération énoncerait donc des règles fausses pour une partie du lineup — c'est l'**inférence** de la note 01 — un fichier de règles non colonné par génération « énoncera donc des règles fausses » — et la raison d'être de cette section.
>
> **Statut épistémique à respecter.** Le *cadrage* en « inversion » est une inférence des chercheurs. Chaque **côté** de chaque inversion est, lui, un *cited finding* avec sa source. Les deux côtés sont donnés ; aucun n'est arbitré.

### 6.1 Anti-formatage : aide jusqu'à Fable 5, **nuit** sur Fable 5.1

| Côté | Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|---|
| **A — ajouter** | La doc fournit un bloc anti-markdown ; retirer le markdown du prompt réduit le markdown en sortie | « Claude's latest models » / toutes générations courantes | [Prompting best practices][bp] §Control the format of responses, 2026-11-09 | « removing markdown from your prompt can reduce the volume of markdown » |
| **A — ajouter** | Sur Fable 5, une **instruction brève** de brièveté vaut la liste de chaque pattern à éviter | Fable 5 | [Prompting Claude Fable 5][f5], 2026-11-09 | « A short brevity instruction is as effective as listing each pattern » |
| **B — retirer** | Fable 5.1 **formate déjà moins** : retirer les règles anti-formatage héritées | **Fable 5.1** | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « it uses bold less and is less likely to reach for headers » |
| **B — retirer** | Le bloc anti-markdown fourni par la doc peut **nuire** sur Fable 5.1 | **Fable 5.1** | [Prompting best practices][bp], 2026-11-09 | « a block like this can suppress structure the content needs » |
| **B — retirer** | Fable 5.1 écrit déjà moins d'updates user-facing : retirer les consignes de brièveté | **Fable 5.1** | [Prompting best practices][bp], 2026-11-09 | « remove any instruction telling it to keep that text brief » |

### 6.2 Spawning de subagents : trop sur Opus 4.6 et Opus 5, **pas assez** sur Opus 4.8

| Côté | Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|---|
| **A — freiner** | Les subagents sont orchestrés nativement, sans instruction explicite ; surveiller la **sur-utilisation** | Opus 4.6, Opus 5 | [Prompting best practices][bp] §Subagent orchestration, 2026-11-09 | « Claude delegates appropriately without explicit instruction. » |
| **A — freiner** | Opus 5 délègue aux subagents plus volontiers ; plafonds déterministes disponibles | Opus 5 | [Prompting Claude Opus 5][o5], 2026-11-09 | `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` |
| **B — relancer** | Opus 4.8 **spawn moins de subagents par défaut** — comportement explicitement inverse d'Opus 4.6 et Opus 5 | **Opus 4.8** | [Prompting Claude Opus 4.8][o48], 2026-11-09 | « tends to spawn fewer subagents by default » |

### 6.3 Instructions de vérification : recommandées 4.6+/5.x, **à retirer** sur Opus 5

| Côté | Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|---|
| **A — ajouter** | Demander l'auto-vérification avant de finir | 4.6+ / 5.x, **sauf Opus 5** | [Prompting best practices][bp] §Leverage thinking, 2026-11-09 | « Before you finish, verify your answer against [test criteria]. » |
| **B — retirer** | **Opus 5 est l'exception** : retirer les instructions héritées, ne pas les réécrire | **Opus 5 uniquement** | [Prompting best practices][bp], 2026-11-09 | « On Claude Opus 5, remove these instructions rather than rewriting them. » |
| **B — retirer** | Les retirer réduit les tokens gaspillés sans perte de qualité | **Opus 5** | [Prompting Claude Opus 5][o5], 2026-11-09 | « removing them reduces wasted tokens with no loss in quality » |
| **B — retirer** | Idem pour le scaffolding de harness hérité qui ajoute des étapes de vérification | **Opus 5** | [Prompting Claude Opus 5][o5], 2026-11-09 | « The same applies to legacy harness scaffolding » |

### 6.4 Autres inversions sourcées des deux côtés

Ces inversions ne font pas partie des trois nommées par la note 01 mais sont, elles aussi, documentées de part et d'autre.

**Prompting anti-paresse / insistance : aidait avant, dégrade sur 4.5-4.6**

| Côté | Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|---|
| **A — insister** | Être spécifique, encadrer avec des modificateurs de qualité, demander explicitement animations et interactivité | « from earlier generations » (non nommées par la page) | [Prompting best practices][bp] §Migration considerations, 2026-11-09 | « Go beyond the basics to create a fully-featured implementation. » |
| **B — réduire** | **Réduire** le prompting anti-paresse hérité : ces modèles sur-déclenchent | **Opus 4.6 / Sonnet 4.6** | [Prompting best practices][bp] §Migration considerations, 2026-11-09 | « Claude 4.6 models are more proactive and might overtrigger » |
| **B — adoucir** | Les formules agressives (« CRITICAL: You MUST ») sur-déclenchent | Opus 4.5, Opus 4.6 | [Prompting best practices][bp] §Tool usage, 2026-11-09 | « The fix is to soften any aggressive language. » |

> **Inférence de la note 01, étiquetée comme telle** : « Ce n'est pas une optimisation à faire, c'est une régression à défaire. »

**`thinking: {"type": "disabled"}` : accepté sur Opus 5 à effort ≤ `high`, refusé sur Opus 5.5**

| Côté | Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|---|
| **A — accepté** | Thinking off seulement à effort ≤ `high` ; `xhigh`/`max` → 400 | Opus 5 | [Prompting Claude Opus 5][o5], 2026-11-09 | « returns a 400 error » (pour `xhigh`/`max`) |
| **A — accepté** | `disabled` accepté seulement à `low`/`medium`/`high` | Haiku 5.5 | [Prompting Claude Haiku 5.5][h55], 2026-11-09 | « the request returns a 400 error » (pour `xhigh`/`max`) |
| **B — refusé** | `thinking: {"type": "disabled"}` → **400 à tout effort**, alors que Opus 5 l'acceptait | **Opus 5.5** | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « Claude Opus 5.5 returns a 400 error for it » |
| **B — refusé** | Matrice : `disabled` → 400 sur Opus 5.5, Fable 5.1 / Mythos 5.1, Fable 5 / Mythos 5, Sonnet 5.5, Mythos Preview | Opus 5.5, Fable 5.1, Mythos 5.1, Fable 5, Mythos 5, Sonnet 5.5, Mythos Preview | [Thinking][thinking], 2026-11-09 | (matrice §1.2) |

**Thinking par défaut : off sur Sonnet 4.6, adaptive sur Sonnet 5**

| Côté | Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|---|
| **A — off** | Sans champ `thinking`, le thinking est **off** | Opus 4.8, Opus 4.7, Opus 4.6, Sonnet 4.6, Opus 4.5, Sonnet 4.5, Haiku 4.5 | [Thinking][thinking], 2026-11-09 | (matrice §1.2) |
| **A — off** | Opus 4.8 : thinking off tant que `adaptive` n'est pas posé | Opus 4.8 | [Prompting Claude Opus 4.8][o48], 2026-11-09 | « thinking is off unless you explicitly set » |
| **B — on** | Sur Sonnet 5, l'adaptive thinking est actif par défaut sans champ `thinking` — **changement explicite** vs Sonnet 4.6 | **Sonnet 5** | [Prompting Claude Sonnet 5][s5], 2026-11-09 | « This is a change from Claude Sonnet 4.6 » |

**Google, `temperature` : garder aux défauts sur Gemini 3 antérieurs, retirer sur Gemini 3.6+ / 4**

| Côté | Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|---|
| **A — garder** | Garder `temperature`, `top_p`, `top_k` **aux défauts** ; les changer dégrade le raisonnement | **Gemini 3 (antérieurs)** | [Prompting strategies][g-strat], 2026-11-09 | « degraded reasoning performance » |
| **B — retirer** | Les **retirer** des configs : valeurs custom ignorées | **Gemini 4 et Gemini 3.6+** | [Prompting strategies][g-strat], 2026-11-09 | (« remove them from request configurations ») |

**Verbosité : moins verbeux par défaut sur les modèles récents, sauf Opus 5 (plus long) et Fable 5.1 (trop silencieux)**

| Côté | Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|---|
| **A — défaut concis** | Style par défaut plus direct, plus conversationnel, **moins verbeux** | « Claude's latest models » | [Prompting best practices][bp] §Communication style, 2026-11-09 | « Less verbose: Might skip detailed summaries for efficiency unless prompted otherwise » |
| **B — plus long** | Opus 5 : réponses **plus longues**, l'effort ne raccourcit pas de façon fiable → prompter la concision | **Opus 5** | [Prompting best practices][bp] ; [Prompting Claude Opus 5][o5], 2026-11-09 | « Prompt explicitly for conciseness instead. » |
| **C — trop silencieux** | Fable 5.1 : **moins** d'updates user-facing ; retirer les consignes de brièveté | **Fable 5.1** | [Prompting best practices][bp] ; [Fable 5.1][f51], 2026-11-09 | « Users see the agent go quiet for minutes at a time » |

**OpenAI, défaut de `reasoning_effort` : `medium` sur GPT-5, `none` sur GPT-5.1 et 5.2**

| Côté | Règle | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|---|
| **A** | Défaut `medium` | **GPT-5** | [GPT-5.2 prompting guide][oai-g52], 2026-11-09 | (défaut documenté) |
| **B** | Défaut `none` | **GPT-5.1, GPT-5.2** | [GPT-5.2 prompting guide][oai-g52], 2026-11-09 | (défaut documenté) |
| **Correctif prescrit** | Pinner `reasoning_effort` explicitement à la migration | GPT-5.2 | [GPT-5.2 prompting guide][oai-g52], 2026-11-09 | « Pin reasoning_effort » |

> **Inférence de la note 02, étiquetée comme telle** : la guidance OpenAI est devenue **versionnée et non cumulative** — un prompt écrit pour GPT-5 tourne par défaut en `none` sur 5.1/5.2, ce qui change le comportement à prompt identique.

> **Inférence transversale de la note 01, étiquetée comme telle** : la génération 3/4 se réglait en **ajoutant** des instructions ; la génération 5 « se règle largement en retirant celles héritées ». Le tableau §5 compte une vingtaine de formulations à supprimer contre une poignée à ajouter.

---

## 7 — Ruptures d'API qui cassent du code

> **Distinction qui gouverne cette section** : certaines ruptures **lèvent une erreur 400** (le code s'arrête, on le voit), d'autres sont **silencieuses** (la valeur est ignorée, le comportement change sans erreur). Les secondes sont les plus coûteuses.

### 7.1 Ruptures qui lèvent une erreur

| Rupture | Fournisseur | Génération concernée | Effet | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|---|---|
| **Prefill du dernier tour assistant supprimé** | Anthropic | **4.6+** et Mythos Preview | **400** | [Prompting best practices][bp] §Migrating away from prefilled responses, 2026-11-09 | « Requests with prefilled assistant messages to these models return a 400 error. » |
| Prefill toujours accepté sur les modèles antérieurs | Anthropic | **historique** : ≤ 4.5 | fonctionne | [Prompting best practices][bp], 2026-11-09 | « Earlier models continue to support prefills » |
| **`budget_tokens` : déprécié** | Anthropic | **Opus 4.6, Sonnet 4.6** | fonctionne mais déprécié | [Prompting best practices][bp] §Overthinking, 2026-11-09 | « is still functional on Opus 4.6 and Sonnet 4.6 but is deprecated » |
| **`budget_tokens` : supprimé** | Anthropic | **Claude 4.7 et suivants** | **400** | [Prompting best practices][bp] §Overthinking, 2026-11-09 | « setting `budget_tokens` returns a 400 error » |
| `budget_tokens` sur Sonnet 5 | Anthropic | Sonnet 5 | **400** | [Prompting Claude Sonnet 5][s5], 2026-11-09 | « is not supported on Claude Sonnet 5 and returns a 400 error » |
| `budget_tokens` : l'effort le remplace sans réglage à reporter | Anthropic | Haiku 5.5 | — | [Prompting Claude Haiku 5.5][h55], 2026-11-09 | « there's no old setting to carry over » |
| Extended thinking manuel : déprécié sur 4.6, refusé ensuite | Anthropic | 4.6 / après | **400** après 4.6 | [Models overview][models], 2026-11-09 | « deprecated on Claude Opus 4.6 and Claude Sonnet 4.6 and not accepted on later models » |
| **`temperature`, `top_p`, `top_k` supprimés de l'API** | Anthropic | **API version `2026-10-21`**, toutes générations | **400** | [Model deprecations][deprec] §API parameter deprecations, 2026-11-09 | « Removed in API version 2026-10-21 » |
| Idem, sur versions d'API antérieures | Anthropic | **Claude 4.7+** et Mythos Preview, si valeur non par défaut | **400** | [Model deprecations][deprec], 2026-11-09 | « when set to a non-default value on Claude 4.7 and later models » |
| Idem, constat par modèle | Anthropic | Sonnet 5 | **400** | [Prompting Claude Sonnet 5][s5], 2026-11-09 | « returns a 400 error on Claude Sonnet 5 » |
| Remplacement officiel : le **prompting**, pas un autre paramètre | Anthropic | toutes | — | [Model deprecations][deprec], 2026-11-09 | « Omit and use prompting to guide model behavior. » |
| **`thinking: {"type": "disabled"}`** | Anthropic | **Opus 5.5** (et Fable 5.1 / Mythos 5.1, Fable 5 / Mythos 5, Sonnet 5.5, Mythos Preview par la matrice) | **400** | [Prompting Claude Opus 5.5][o55] ; [Thinking][thinking], 2026-11-09 | « Claude Opus 5.5 returns a 400 error for it » |
| `disabled` à `xhigh`/`max` | Anthropic | Opus 5, Haiku 5.5 | **400** | [Prompting Claude Opus 5][o5] ; [Haiku 5.5][h55], 2026-11-09 | « returns a 400 error » |
| **`between_tools` hors effort ≤ `high`** | Anthropic | Sonnet 5.5 | **400** | [Prompting Claude Sonnet 5.5][s55], 2026-11-09 | « a request with between_tools returns a 400 error » |
| `between_tools` avec `display`, `budget_tokens` ou `block_binding` | Anthropic | Sonnet 5.5 | **400** | [Prompting Claude Sonnet 5.5][s55], 2026-11-09 | « takes no other field » |
| `adaptive` non supporté | Anthropic | **Opus 4.5, Sonnet 4.5, Haiku 4.5** | **400** | [Thinking][thinking], 2026-11-09 | (matrice §1.2) |
| `thinking.block_binding.prefix_mismatch_behavior: "error"` sur mismatch de préfixe | Anthropic | Fable 5.1 (beta `thinking-binding-controls-2026-08-01`) | **400** (ou `drop_block` → abandon) | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « the API rejects the request with a 400 error » |
| Renvoyer des blocs thinking après un changement de `system` | Anthropic | Haiku 5.5 | peut donner un **400** | [Prompting Claude Haiku 5.5][h55], 2026-11-09 | « a stored conversation resumed with the new system prompt can fail » |

### 7.2 Ruptures silencieuses — pas d'erreur, comportement changé

| Rupture | Fournisseur | Génération concernée | Effet | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|---|---|
| **`temperature`, `top_p`, `top_k` ignorés** | **Google** | **Gemini 4 et Gemini 3.6+** | valeurs custom **ignorées**, à retirer des requêtes — **pas d'erreur** | [Prompting strategies][g-strat], 2026-11-09 | (« remove them from request configurations ») |
| **Dérive du défaut de `reasoning_effort`** : `medium` → `none` | **OpenAI** | GPT-5 → GPT-5.1 / GPT-5.2 | à prompt identique, le comportement change | [GPT-5.2 prompting guide][oai-g52], 2026-11-09 | « Pin reasoning_effort » / « provider-default 'thinking' traps » |
| Mapping de migration prescrit : GPT-4o et GPT-4.1 → `none` ; GPT-5 `minimal` → `none` ; GPT-5.1 garde sa valeur | OpenAI | GPT-4o, GPT-4.1, GPT-5, GPT-5.1 → GPT-5.2 | — | [GPT-5.2 prompting guide][oai-g52], 2026-11-09 | (table de mapping) |
| **Rôle `system` → `developer`** | **OpenAI** | depuis `o1-2024-12-17` ; Responses API | la page Text generation **ne documente plus `system` du tout** ; son acceptation en compatibilité est **à vérifier** (§9) | [Reasoning best practices][oai-reason] ; [Text generation guide][oai-text], 2026-11-09 | « Developer messages are the new system messages » |
| Les instructions passées par `instructions` **ne persistent pas** via `previous_response_id` | OpenAI | Responses API | scope = requête courante uniquement | [Text generation guide][oai-text], 2026-11-09 | (scope de requête) |
| **Nouveau tokenizer** : 1M tokens ≈ 555k mots (contre ~750k avant) | Anthropic | depuis **Opus 4.7** | les calculs de capacité calés sur l'ancien tokenizer sont faux | [Models overview][models], 2026-11-09 | « introduced with Claude Opus 4.7 » |
| **~30 % de tokens en plus pour le même texte** → les `max_tokens` calés sur 4.6 **tronquent** | Anthropic | Sonnet 5 | troncature, `stop_reason: "max_tokens"` | [Prompting Claude Sonnet 5][s5], 2026-11-09 | « approximately 30 percent more tokens for the same text » |
| Thinking actif par défaut sans champ `thinking` | Anthropic | Sonnet 5 (changement vs Sonnet 4.6) | les charges qui tournaient sans thinking changent de profil ; revoir `max_tokens` | [Prompting Claude Sonnet 5][s5], 2026-11-09 | « This is a change from Claude Sonnet 4.6 » |
| Sélection des blocs de contenu **par position** | Anthropic | Opus 5, Sonnet 5.5, Sonnet 5, Haiku 5.5 | le thinking peut ouvrir la réponse → sélectionner par `type` | [Prompting best practices][bp], 2026-11-09 | « Select content blocks by `type` rather than by position » |
| Un prompt trop court pour le cache est traité **sans erreur** | Anthropic | tous | pas de caching, aucun signal | [Prompt caching][caching], 2026-11-09 | « Shorter prompts are processed without caching and no error is returned. » |
| Ordre de clés JSON instable dans les blocs `tool_use` | Anthropic | tous | casse le cache sans ressembler à une modification du prompt | [Prompt caching][caching], 2026-11-09 | « Unstable JSON key ordering in `tool_use` blocks » |
| **Refus Structured Outputs hors schéma** | OpenAI | GPT-4o+ | tester `refusal` **avant** de parser, et le statut `"incomplete"` | [Structured Outputs guide][oai-so], 2026-11-09 | (champ `refusal`) |
| `configuration_update` **remplace tout le format** | OpenAI | **GPT-6+** supportés en mode standard single-agent | un update partiel écrase le reste | [Structured Outputs guide][oai-so], 2026-11-09 | (n'accepte que `json_schema` ou `text`) |

### 7.3 Persistance des blocs de raisonnement — quatre règles incompatibles

C'est la rupture la plus structurante pour un wrapper multi-fournisseur : **une même implémentation d'historique de conversation ne peut pas être correcte pour les quatre.**

| Fournisseur | Règle de persistance | Génération concernée | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|---|
| **Anthropic** | Renvoyer les blocs thinking **inchangés** ; historique **append-only** | **Claude 5.1 et suivants** (invalidation stricte) | [Prompting best practices][bp] §Migration + [Thinking][thinking], 2026-11-09 | « pass them unchanged » |
| **Anthropic** | Éditer un message antérieur, reconstruire `system`/`tools` ou résumer en place **invalide tous les blocs thinking ultérieurs** | **Claude 5.1+** | [Prompting best practices][bp] §Migration considerations, 2026-11-09 | « invalidates every later thinking block » |
| **Anthropic** | Un bloc thinking n'est valide que si **tout** ce qui précède est inchangé : system, liste de tools, chaque message | Fable 5.1 | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « only while everything before it is unchanged » |
| **Anthropic** | Les blocs thinking abandonnés invalident le cache au niveau messages | **Claude 5.1+** | [Prompt caching][caching], 2026-11-09 | (table d'invalidation §1.3) |
| **Google** | **Renvoyer tous les blocs `thought` à l'identique** en mode stateless | Gemini thinking | [Thinking][g-think], 2026-11-09 | « You **MUST** always resend all `thought` blocks exactly as they were received » |
| **Google** | En mode stateful (`store: true` + `previous_interaction_id`), le serveur gère les signatures | Gemini thinking | [Thinking][g-think], 2026-11-09 | « An encrypted representation of the model's internal reasoning state » |
| **OpenAI** | Réutilisation du reasoning par **référence serveur** (`previous_response_id`), pas par renvoi du contenu | GPT-5.x, Responses API | [GPT-5 prompting guide][oai-g5], 2026-11-09 | (`previous_response_id` reporte les reasoning items) |
| **OpenAI** | Traiter les items compactés comme **opaques** | GPT-5.2 | [GPT-5.2 prompting guide][oai-g52], 2026-11-09 | (items compactés opaques) |
| **Qwen** | Le bloc de thinking ne doit figurer que dans le **dernier** tour | Qwen3 | [Key concepts][qwen-concepts], 2026-11-09 | « thinking block should only be included in the final round » |
| **Qwen** | Exception : les appels d'outils multi-étapes | Qwen3 | [Key concepts][qwen-concepts], 2026-11-09 | (exception documentée) |
| **Qwen** | L'historique assistant ne garde que la sortie finale ; un framework qui contourne le template Jinja2 doit l'imposer lui-même | Qwen3 | [Model card Qwen3-235B-A22B][qwen-card], 2026-11-09 (**rang 1**) | « should only include the final output part » |

> **Inférence de la note 02, étiquetée comme telle** : un même code d'historique de conversation ne peut pas être correct pour les trois — « c'est le point où un wrapper multi-fournisseur casse silencieusement ».
>
> **Inférence de la note 01, étiquetée comme telle** : les trois mécanismes d'invalidation Anthropic (changer `system`, changer `tools`, éditer un tour antérieur) convergent vers une seule règle d'ingénierie : l'historique est append-only, et tout rappel temporaire doit passer par un **turn-scoped system message**. « C'est une contrainte d'architecture de harness, pas une astuce de prompt. »
>
> **À ne pas affirmer** : la disparition de `thinking_budget` des docs Gemini (présent sur Gemini 2.5 dans les versions antérieures des docs, absent de la page Thinking lue le 2026-11-09). Savoir s'il est déprécié ou simplement déplacé reste **à vérifier** (§9).

### 7.4 Effet collatéral : ce qui casse le prompt cache

| Rupture | Fournisseur | Génération concernée | Effet | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|---|---|---|
| Changer les paramètres de thinking | Anthropic | tous | invalide les préfixes de messages, et **peut** invalider system et tools | [Prompt caching][caching] §FAQ, 2026-11-09 | « because the thinking configuration is rendered into the prompt » |
| Faire varier `output_config.effort` | Anthropic | tous | même comportement que le thinking | [Prompt caching][caching] §FAQ, 2026-11-09 | « The `output_config.effort` value behaves the same way. » |
| Effort per-message (beta) | Anthropic | Fable 5.1, Sonnet 5.5, Haiku 5.5, Opus 5 (pas sur Bedrock) | **seul chemin** qui ne casse pas le cache | [Effort][effort], 2026-11-09 | « which preserves the prompt cache » |
| Ajouter un ajout system ou un tool **en cours de route** | Anthropic | Opus 5.5 | invalide les blocs thinking antérieurs → le poser dès la première requête | [Prompting Claude Opus 5.5][o55], 2026-11-09 | « adding it to tools later edits the conversation's prefix » |
| Supprimer ou réécrire les nudges turn-scoped antérieurs | Anthropic | Fable 5.1 | c'est une édition des tours antérieurs | [Prompting Claude Fable 5.1][f51], 2026-11-09 | « Deleting or rewriting them is an edit to earlier turns » |

---

## 8 — Contradictions non arbitrées

> **Règle appliquée ici** : là où les notes signalent deux pages officielles qui se contredisent, la contradiction est **rapportée avec ses deux sources** et n'est **pas** tranchée. Les chercheurs ont demandé explicitement de les signaler au rédacteur plutôt que de les arbitrer.

| # | Contradiction | Source A (URL, date) | Source B (URL, date) | Génération(s) concernée(s) |
|---|---|---|---|---|
| 1 | **« Legacy » contre « Active » pour les mêmes neuf modèles.** *Models overview* range Fable 5, Opus 5, Opus 4.8, Opus 4.7, Opus 4.6, Opus 4.5, Sonnet 5, Sonnet 4.6 et Haiku 4.5 en « Legacy models (still available) » ; *Model deprecations* les donne tous **« Active »**. Les deux pages emploient « legacy » différemment : l'une au sens commercial (hors lineup recommandé), l'autre au sens du cycle de vie formel. | [Models overview][models], 2026-11-09 — « Legacy models (still available) » | [Model deprecations][deprec], 2026-11-09 — statut « Active » | Fable 5, Opus 5, Opus 4.8, Opus 4.7, Opus 4.6, Opus 4.5, Sonnet 5, Sonnet 4.6, Haiku 4.5 |
| 2 | **Google, `temperature` : retirer ou augmenter ?** La page Prompting strategies dit de **retirer** `temperature` sur Gemini 4 / 3.6+ (valeurs ignorées), et **la même page** conseille d'**augmenter** la temperature face à une réponse de repli d'un filtre de sécurité. Aucune page arbitrant les deux n'a été trouvée. | [Prompting strategies][g-strat], 2026-11-09 — « remove them from request configurations » | [Prompting strategies][g-strat], 2026-11-09 — (augmenter la temperature en cas de repli de filtre) | Gemini 4 / Gemini 3.6+ |
| 3 | **`misc/metaprompt.ipynb` : doc vivante contre arborescence du dépôt.** La page overview le désigne explicitement via son lien Colab ; le dépôt a bien la branche `main` et le répertoire `misc`, mais le contenu de `misc` n'était pas déplié sur la page lue et le README **ne mentionne aucun notebook metaprompt**. Présence effective **non confirmée**. | [Prompt engineering overview][pe-overview], 2026-11-09 — `claude-cookbooks/blob/main/misc/metaprompt.ipynb` | [github.com/anthropics/claude-cookbooks](https://github.com/anthropics/claude-cookbooks), 2026-11-09 — README silencieux | — |
| 4 | **Few-shot : zero-shot d'abord (OpenAI) contre exemples nécessaires (Google).** Contradiction au niveau des textes, avec la nuance de périmètre notée en §4.5 (la page OpenAI parle des reasoning models, la page Google de Gemini en général) — nuance qui est une **inférence** des chercheurs, pas un arbitrage. | [Reasoning best practices][oai-reason], 2026-11-09 — « Try zero shot first, then few shot if needed » | [Prompting strategies][g-strat], 2026-11-09 — « are likely to be less effective » | OpenAI o-series/reasoning vs Gemini (général) |
| 5 | **Prompt improver officiel contre doc vivante.** L'étape 5 de l'improver (prefill addition) produit aujourd'hui une **erreur 400** sur 4.6+, et son étape 1 (CoT) est contredite sur 5.x. Voir le tableau complet en §1.5. | [claude.com/blog/prompt-improver][improver], 2024-10-14 / consulté 2026-11-09 | [Prompting best practices][bp], 2026-11-09 | improver : **historique** (Claude 3 Haiku) vs 4.6+ / 5.x |
| 6 | **Les trois modèles Mythos** étaient traités comme supportés par Thinking, Effort, Prompt caching et best-practices, mais absents de la table de comparaison **et** de la liste « Legacy » de *Models overview*. **Contradiction résolue** par la page Model deprecations (§1.4) : ils sont hors de la table « Compare models » tout en étant des modèles de cycle de vie à part entière. La note de cohérence résiduelle est la contradiction n° 1 ci-dessus. | [Models overview][models], 2026-11-09 (absence) | [Model deprecations][deprec], 2026-11-09 (Active / Active / Deprecated) | Mythos 5.1, Mythos 5, Mythos Preview |

---

## 9 — À vérifier

> **Règle appliquée ici** : chaque point ouvert des deux notes est reporté **tel que les chercheurs l'ont posé**. Aucun n'est promu en affirmation, aucun n'est résolu ici. Les points que les notes ont elles-mêmes refermés en cours de session sont signalés comme **« refermé »** plutôt que supprimés, pour que la trace du travail reste lisible.

### 9.1 Anthropic — points ouverts

| # | Point à vérifier | Portée / génération | Où chercher (URL) |
|---|---|---|---|
| 1 | Les trois URL per-technique historiques — `prefill-claudes-response`, `chain-prompts`, `long-context-tips` — **n'ont pas été testées**. Leur redirection vers la page consolidée est probable par analogie mais **non vérifiée**. | architecture doc | les trois URL elles-mêmes |
| 2 | **Premier gap restant selon la note 01** : les **4 guides de migration par modèle** (`fable-5-1/migration-guide`, `opus-5-5/migration-guide`, `sonnet-5-5/migration-guide`, `haiku-5-5/migration-guide`) ne sont **pas ouverts**. Les pages par modèle les citent nommément : « the five breaking API changes when migrating from Claude Sonnet 5 » et « the four breaking API changes when migrating from Claude Opus 5 ». **Le détail de ces 5 et 4 changements est à vérifier.** | Fable 5.1, Opus 5.5, Sonnet 5.5, Haiku 5.5 | [Migration guides][migr-index] et les 4 guides |
| 3 | La page Opus 4.8 renvoie, pour ses propres changements de paramètres, vers le guide de migration **d'Opus 5.5** (sections « Migrating from Claude Opus 4.8 » et « from Claude Opus 4.7 »). Il n'existe donc **pas** de guide propre à Opus 4.8 (constat de lecture), mais la liste exacte de ces changements est **à vérifier** dans ce guide. | Opus 4.8, Opus 4.7 | guide de migration Opus 5.5 |
| 4 | La page **release-notes** n'a pas été ouverte. | API | [release-notes/overview](https://platform.claude.com/docs/en/release-notes/overview) |
| 5 | Pages citées en appui mais **non ouvertes** : `whats-new-*` par modèle, `preserved-thinking`, `mid-conversation-system-messages`, `compaction`, `context-editing`, `refusals-and-fallback`, `structured-outputs`, `task-budgets`. | toutes générations courantes | doc Anthropic |
| 6 | La page **thinking-troubleshooting** et sa table « supported models » par configuration : **non ouverte** → les **messages d'erreur exacts** sont à vérifier. | 4.6+ / 5.x | [thinking-troubleshooting](https://platform.claude.com/docs/en/build-with-claude/thinking-troubleshooting) |
| 7 | La page **thinking-steering-and-cost** (« Steering thinking ») : **non lue**. Susceptible de contenir d'autres interdictions explicites. | 4.6+ / 5.x | [thinking-steering-and-cost](https://platform.claude.com/docs/en/build-with-claude/thinking-steering-and-cost) |
| 8 | La page **refusals-and-fallback#keep-reasoning-in-thinking-blocks**, citée comme source du refus de raisonnement hors blocs thinking, n'a **pas** été lue : le **mécanisme** du refus est à vérifier. La page best-practices n'affirme que le **fait**. | Fable 5.1, Fable 5, Opus 5.5, Opus 5, Sonnet 5.5 | [refusals-and-fallback](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback) |
| 9 | Aucune page lue ne donne de **page de prompting dédiée pour Opus 4.7, Opus 4.6, Opus 4.5, Sonnet 4.6 ou Haiku 4.5**. Leur guidance est dispersée dans la page consolidée et, pour Opus 4.7, dans la page Effort. Les chercheurs **ne peuvent pas affirmer que ces pages n'existent pas**, seulement qu'elles ne sont pas listées dans le tableau « Model-specific guidance ». | Opus 4.7, Opus 4.6, Opus 4.5, Sonnet 4.6, Haiku 4.5 | doc Anthropic |
| 10 | La page **Pricing** n'a pas été ouverte : les **prix absolus** par million de tokens pour les écritures/lectures de cache sont à vérifier. Seuls les multiplicateurs et les prix de base ont été lus. | tous | [about-claude/pricing](https://platform.claude.com/docs/en/about-claude/pricing) |
| 11 | Le billet de blog officiel **best-practices-for-prompt-engineering**, lié depuis la page overview, n'a pas été lu. | — | [claude.com/blog/best-practices-for-prompt-engineering](https://claude.com/blog/best-practices-for-prompt-engineering) |
| 12 | La « golden rule of clear prompting » des anciennes pages n'apparaît plus sous ce nom ; elle **semble** remplacée par le « Key test » du collègue. Les chercheurs **ne peuvent pas affirmer** qu'elle a été retirée plutôt que déplacée. | historique | un historique de la doc |
| 13 | **Limites déclarées du prompt improver** (« meilleur sur les tâches complexes », « sortie plus longue et plus lente ») : ces formulations **ne figurent pas** dans le billet d'annonce lu, qui ne déclare aucune limite. Elles venaient de l'ancienne page de doc, aujourd'hui redirigée. | **historique** | une copie encore servie, p. ex. `docs.claude.com/en/docs/build-with-claude/prompt-engineering/prompt-improver` |
| 14 | Le billet d'annonce du **prompt generator** (`anthropic.com/news/prompt-generator`) n'a pas été ouvert : ses revendications propres sont à vérifier. Par analogie avec l'improver, il redirige probablement vers `claude.com/blog/prompt-generator`, **non testé**. | **historique** | `claude.com/blog/prompt-generator` |
| 15 | **Présence effective de `misc/metaprompt.ipynb` non confirmée** — à trancher par un fetch de `github.com/anthropics/claude-cookbooks/tree/main/misc`. Voir contradiction n° 3 (§8). | — | [github.com/anthropics/claude-cookbooks/tree/main/misc](https://github.com/anthropics/claude-cookbooks/tree/main/misc) |
| 16 | **Rien trouvé sur les modèles antérieurs à Claude 3** : ils n'apparaissent dans aucune page lue. La catégorie « historique » se réduit, dans les sources lues, au tutoriel GitHub écrit pour Claude 3 et aux modèles Claude 4 / Sonnet 4 / Opus 4.1 mentionnés seulement dans la table des minima de cache. | **historique** | — |

**Gaps refermés en cours de session (reportés pour la trace, pas des points ouverts)**

| Gap initial | Résolution |
|---|---|
| Les **8 pages de prompting par modèle** n'avaient pas été ouvertes (gap Q1 de la note 01, déclaré « le plus important »). | **Refermé** : les 8 pages ont été ouvertes et lues intégralement le 2026-11-09, sans erreur ni redirection (§1.7). |
| Le statut des modèles **Mythos** était déclaré incohérent et à vérifier. | **Refermé** par la page Model deprecations (§1.4). Il reste la contradiction « Legacy » / « Active » (§8, n° 1), qui est **distincte** et non arbitrée. |
| La page **Model deprecations** n'avait pas été ouverte : les dates de retrait effectives des modèles legacy étaient à vérifier. | **Refermé** : la page a été lue le 2026-11-09 (§1.4, liste des modèles retirés). |
| La page **Prompt caching** n'avait été lue que sur ses 100 000 premiers caractères (sur 164 327). | **Refermé** : reprise avec `offset: 100000` et lue jusqu'au bout. **Constat explicite** : aucune limite de concurrence propre au cache, aucune interaction spécifique au Batch API, et **aucun moyen documenté de vider manuellement un cache** n'y figurent. |

### 9.2 OpenAI — points ouverts

| # | Point à vérifier | Portée / génération | Où chercher (URL) |
|---|---|---|---|
| 1 | **Structured Outputs, liste précise des features non supportées.** La page (144 785 caractères) n'a été lue que sur ses **100 000 premiers caractères** : la section **« Supported schemas »** tombe dans la partie non lue. Les règles couramment citées (tous les champs `required`, `additionalProperties: false` obligatoire) apparaissent dans **tous les exemples** de la page lue mais n'y sont **pas énoncées comme règles formelles**. | GPT-4o+ | [Structured Outputs guide][oai-so] avec `offset: 100000` |
| 2 | L'interaction entre **Structured Outputs et `reasoning_effort`** n'est pas documentée sur la portion lue. | GPT-5.x | idem |
| 3 | Un guide **Codex-Max** séparé existe (`gpt-5-1-codex-max_prompting_guide`) — **non lu** → spécificités Codex (`apply_patch`, `shell`) à vérifier. | GPT-5.1 Codex-Max | `developers.openai.com/cookbook/examples/gpt-5/gpt-5-1-codex-max_prompting_guide` |
| 4 | **Le rôle `system`** : la page Text generation **ne le documente plus du tout** (seulement developer/user/assistant). Aucune page lue ne dit explicitement si `system` reste accepté **en compatibilité** dans la Responses API. | Responses API | doc OpenAI |
| 5 | La page `api/docs/guides/latest-model` (« prompting guide » par modèle) n'a pas été ouverte. | GPT-5.x | `developers.openai.com/api/docs/guides/latest-model` |

### 9.3 Google — points ouverts

| # | Point à vérifier | Portée / génération | Où chercher (URL) |
|---|---|---|---|
| 1 | **Contradiction interne non résolue** : retirer `temperature` sur Gemini 4 / 3.6+ **vs** augmenter la temperature face à un repli de filtre de sécurité, sur la **même page**. Aucune page arbitrant les deux n'a été trouvée. Voir §8, n° 2. | Gemini 4 / 3.6+ | doc Google |
| 2 | L'historique du paramétrage **`thinking_budget`** (documenté sur Gemini 2.5 dans les versions antérieures des docs) n'apparaît plus sur la page Thinking lue. Savoir s'il est **déprécié ou simplement déplacé** est à vérifier. | Gemini 2.5 / 3 | [Thinking][g-think] et versions antérieures |
| 3 | Les **règles d'affichage obligatoires du grounding** (Search Suggestions) sont renvoyées aux Terms of Service, **non lus**. Nature contractuelle, pas technique. | Gemini grounding | ToS Google |
| 4 | Aucune page **« Gemini 4 prompting guide »** dédiée n'a été ouverte ; la guidance Gemini 4 lue est celle de la page générique Prompting strategies. | Gemini 4 | doc Google |

### 9.4 Open-weight — points ouverts

| # | Fournisseur | Point à vérifier | Portée / génération |
|---|---|---|---|
| 1 | **DeepSeek** | **Point le plus net.** La page `guides/reasoning_model` ouverte le 2026-11-09 **ne mentionne plus** `deepseek-reasoner`, ni system prompt, ni few-shot, ni temperature, ni `reasoning_content`. Les règles « style R1 » souvent attribuées à DeepSeek (« pas de system prompt », « éviter le few-shot », « ne pas renvoyer `reasoning_content` dans l'historique ») sont **à vérifier** : aucune page DeepSeek lue **ne les énonce ni ne les retire**, et les chercheurs **ne les affirment dans aucun sens**. Sources à ouvrir : model card DeepSeek sur Hugging Face, et `api-docs.deepseek.com/guides/`. | DeepSeek V4.1 |
| 2 | **Qwen** | Les paramètres de sampling et `enable_thinking` sont sourcés au niveau artefact (model card HF Qwen3-235B-A22B). Reste à vérifier **si ces valeurs sont identiques** pour les variantes **Qwen3-2507 Instruct-only / Thinking-only**, dont la model card n'a pas été ouverte. | Qwen3-2507 |
| 3 | **Qwen** | **Génération courante** : les docs lues parlent de Qwen3 et Qwen3-2507. Aucune génération plus récente n'a été trouvée dans les pages ouvertes, mais **aucune page de release notes n'a été lue**. | Qwen |
| 4 | **Mistral** | **Magistral (reasoning)** : la page Prompting capabilities **ne couvre pas** les reasoning models ni de template formel → doc Magistral / model card **non lue**. | Mistral reasoning |
| 5 | **Meta** | **Llama 4 reasoning** : aucune page Meta lue ne documente de balise de reasoning. Les chercheurs **ne peuvent pas conclure qu'il n'en existe pas ailleurs** (model card HF, Llama Guard). | Llama 4 |
| 6 | **Meta** | **Chat templates exacts** : Meta renvoie à la config du tokenizer depuis Llama 3.1 ; aucun `tokenizer_config.json` n'a été lu au tag → les templates **ne sont pas vérifiés au niveau artefact**. | Llama 3.1 → |

### 9.5 Comparaisons inter-fournisseurs — points ouverts

| # | Point à vérifier | Portée |
|---|---|---|
| 1 | **Aucune contradiction directe trouvée sur le grounding / les citations** : seul Google documente le sujet parmi les pages ouvertes. Les obligations d'affichage renvoient à des ToS non lus → **pas de comparaison possible**. | Google vs autres |
| 2 | Contradiction **potentielle** sur **Structured Outputs** (contraintes de schéma OpenAI vs Google vs Mistral) : **non évaluable**, aucune des trois pages dédiées n'a été ouverte de ce côté-là. | OpenAI / Google / Mistral |
| 3 | Contradiction **potentielle** sur le **few-shot pour reasoning models open-weight** (DeepSeek R1 déconseillait historiquement le few-shot) : **non vérifiable**, la page DeepSeek courante ne traite plus le sujet. | DeepSeek |
| 4 | **Aucune page d'éditeur lue ne commente la guidance d'un concurrent** : toutes les contradictions de §4.5 sont des **juxtapositions établies par les chercheurs**, pas des désaccords revendiqués par les éditeurs. | tous |

### 9.6 Fiabilité du libellé des citations (note 02)

| # | Point à vérifier | Portée |
|---|---|---|
| 1 | Les citations de la **note 02** ont été restituées par WebFetch à travers un modèle de résumé et **n'ont pas été recoupées caractère par caractère contre le HTML brut**. Pour tout usage où le libellé exact engage (slide citée, document contractuel), **rouvrir la page et recopier la phrase**. Exception : les deux sources de rang 1 (model card HF Qwen3, formats de tokens Llama 4). | OpenAI, Google, Meta, Mistral, DeepSeek |

---

*Fin du fichier. Deux notes sources, lues intégralement ; rédigé le 2026-11-09 ; aucune affirmation ajoutée au-delà de ce que ces notes soutiennent.*


---

<!-- Définitions de liens : chaque libellé court des tableaux résout vers l'URL complète. -->

[bp]: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
[pe-overview]: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview
[thinking]: https://platform.claude.com/docs/en/build-with-claude/thinking
[effort]: https://platform.claude.com/docs/en/build-with-claude/effort
[caching]: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
[models]: https://platform.claude.com/docs/en/models/overview
[deprec]: https://platform.claude.com/docs/en/about-claude/model-deprecations
[migr-index]: https://platform.claude.com/docs/en/about-claude/models/migration-guide
[improver]: https://claude.com/blog/prompt-improver
[f51]: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1
[f5]: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5
[s55]: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5
[s5]: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5
[o55]: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5
[o5]: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5
[o48]: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8
[h55]: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5
[oai-reason]: https://developers.openai.com/api/docs/guides/reasoning-best-practices
[oai-text]: https://developers.openai.com/api/docs/guides/text
[oai-so]: https://developers.openai.com/api/docs/guides/structured-outputs
[oai-g5]: https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide
[oai-g51]: https://developers.openai.com/cookbook/examples/gpt-5/gpt-5-1_prompting_guide
[oai-g52]: https://developers.openai.com/cookbook/examples/gpt-5/gpt-5-2_prompting_guide
[g-strat]: https://aistudio.google.com/docs/prompting-strategies
[g-think]: https://aistudio.google.com/docs/thinking
[g-long]: https://aistudio.google.com/docs/long-context
[g-search]: https://aistudio.google.com/docs/google-search
[llama4]: https://dev.meta.ai/llama/docs/model-cards-and-prompt-formats/llama4/
[llama-idx]: https://dev.meta.ai/llama/docs/model-cards-and-prompt-formats/
[mistral]: https://docs.mistral.ai/guides/prompting_capabilities/
[qwen-concepts]: https://qwen.readthedocs.io/en/latest/getting_started/concepts.html
[qwen-idx]: https://qwen.readthedocs.io/en/latest/
[qwen-card]: https://huggingface.co/Qwen/Qwen3-235B-A22B
[deepseek]: https://api-docs.deepseek.com/
