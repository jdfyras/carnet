# Data engineering avec des LLM : ce sur quoi on peut compter, fournisseur par fournisseur

> **Base de référence embarquée dans le plugin prompts.** Pages consultées le **2026-11-09** ; à relire avant le **2027-02-09**. Un fait propre à un modèle (effort, thinking, paramètres, formulations) se relit sur la page officielle du modèle visé avant d'être affirmé : ce fichier dit où lire, pas ce qui est vrai aujourd'hui. Les renvois `→ NN` désignent les autres fichiers de ce dossier (même préfixe numérique) ; les notes de recherche citées ne sont pas publiées.


> **Source de ce fichier.** Note de recherche unique : `research_notes/Prompt engineering référence 2026/07-data-engineering.md`, **lue en entier** (329 lignes, jusqu'à la dernière ligne du fichier). Date de rédaction de ce fichier : **2026-11-09**. Aucune recherche nouvelle n'a été faite : **rien ici n'est absent de la note source**.
>
> **Règles de lecture conservées de la note, à ne pas lisser :**
> - Toute affirmation porte **URL + date de consultation (2026-11-09) + API/version concernée**.
> - Les marqueurs **« à vérifier »** sont repris tels quels et ne sont jamais promus en affirmation.
> - **[claim fournisseur]** = affirmation du fournisseur non mesurable par un tiers. Ce n'est pas une mesure.
> - **Une limite ou un comportement constaté chez un fournisseur n'est jamais généralisé aux autres.** Chaque ligne nomme son fournisseur. Une cellule vide ou « non lu » ne veut **pas** dire « non supporté ».
> - Citations ≤ 15 mots.
> - ⚠️ **Seconde passe du 09/11/2026, postérieure à la rédaction ci-dessus.** Sept pages fournisseurs et le papier *Lost in the Middle* ont été relus à la source. **Quatre marqueurs « à vérifier » sont levés** et portés en ~~barré~~ + « Levé le 09/11/2026 » ; **sept autres sont bornés** à des pages nommées sans être levés ; `§4.1` est **corrigé**, pas seulement complété. Les fenêtres de lecture réellement obtenues sont en **`§6.2`**. **Tout le reste du fichier est inchangé et reste conforme à la note source** — mais la phrase « rien ici n'est absent de la note source » ne vaut plus que pour ce reste.
> - **`résumé d'outil`** = la section **existe** sur la page, mais son contenu n'est connu que par le résumé que l'outil de fetch produit sur la portion qu'il ne rend pas en texte. **Ce n'est pas une lecture** : le fait reste **« à vérifier »**, et aucune phrase ainsi obtenue n'est citée entre guillemets. *Marqueur ajouté le 09/11/2026, après une seconde passe qui a montré que toutes les pages fournisseurs dépassent la fenêtre verbatim de l'outil.*
>
> **Versions réellement observées sur les pages lues** (note source, ligne 10) : Anthropic — en-tête `anthropic-version: 2026-10-21` (exemple cURL de la page Citations), en-tête beta `structured-outputs-2025-11-13` (chemin déprécié `output_format`) ; OpenAI — API Responses (`text.format.type: "json_schema"`) ; Gemini — `generateContent` avec `response_format`. Partout où une page n'affiche aucune version, la citation signifie « doc courante au 2026-11-09, version non affichée sur la page ».
>
> **Redirections observées le 2026-11-09** (301/302) : OpenAI `platform.openai.com/docs/*` → `developers.openai.com/api/docs/*` ; Anthropic `docs.claude.com` → `platform.claude.com` ; Gemini `ai.google.dev/gemini-api/docs/*` → `aistudio.google.com/docs/*`. Les URL citées sont les URL **finales**.

---

## 1. Structured outputs — le tableau de compatibilité

### Le point à retenir

Les trois fournisseurs contraignent le schéma côté serveur, mais **les sous-ensembles de JSON Schema sont incompatibles entre eux**, et les **modes d'échec diffèrent** :

| Fournisseur | Schéma non supporté → | Conséquence pipeline |
|---|---|---|
| OpenAI | **erreur** : « Setting `strict: true` with an unsupported schema returns an error » | échec visible au déploiement |
| Anthropic | **400** : « If you use an unsupported feature, you'll receive a 400 error with details » | échec visible au déploiement |
| Gemini | **ignorance silencieuse** : l'API « strips and ignores them » pendant la normalisation, « rather than returning an error » | **un schéma accepté ne contraint pas ce qu'on croit** |

Sources : [OpenAI, Structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs) (2026-11-09, API Responses) ; [Anthropic, Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) (2026-11-09) ; [Gemini, Structured output](https://aistudio.google.com/docs/structured-output) (2026-11-09).

**Dans les trois cas, la validation applicative reste obligatoire.** Chez Gemini elle est non négociable, puisque le silence de l'API ne permet pas de détecter la perte d'une contrainte.

### 1.1 Mots-clés JSON Schema : supporté / interdit / ignoré

Légende : **OK** = supporté sur la page lue — **400/err** = rejeté explicitement — **IGNORÉ** = accepté puis retiré silencieusement — **n.l.** = *non lu sur la page de cette session → à vérifier, ne pas conclure à l'absence*.

| Mot-clé | OpenAI (Responses, `strict: true`) | Anthropic (`output_config.format` / `strict: true`) | Gemini (`response_format`) |
|---|---|---|---|
| types de base (string, number, integer, boolean, object, array) | OK | OK (« tous les types de base ») | OK |
| `null` | OK, via union de types `["string","null"]` | OK (type `null` supporté ; `enum` accepte des nulls) | OK, via tableau de types `{"type":["string","null"]}` |
| `enum` | OK — plafonds chiffrés, voir 1.2 | OK — « (strings, numbers, booleans, or nulls only, no complex types) » | OK sur string, number et integer |
| `const` | OK (compte dans le plafond de 120 000 caractères) | OK | n.l. |
| `required` | OK — **tous les champs doivent y figurer** | OK | OK |
| `additionalProperties` | **`false` obligatoire** sur les objets | OK « (must be set to `false` for objects) » ; ≠ `false` → non supporté | OK (mot-clé listé ; valeur imposée n.l.) |
| `$defs` / `$ref` | OK (`$defs` + `$ref`) | OK (`$ref`, `$def`, `definitions`) ; « external `$ref` not supported » | n.l. |
| **récursion** | **OK** (`#` ou `$ref` explicite) | **Non supportée** — « Recursive schemas » | guidance : rendre les `$ref` récursives optionnelles/nullables |
| `anyOf` | OK, **mais pas à la racine** (voir 1.3) | OK | n.l. (guidance : « simplifier les unions `anyOf` ») |
| `allOf` | **Non supporté, tous modèles** | **OK**, sauf « `allOf` with `$ref` not supported » | n.l. |
| `not` | **Non supporté, tous modèles** | n.l. | n.l. |
| `if` / `then` / `else` | **Non supportés, tous modèles** | n.l. | n.l. |
| `dependentRequired` / `dependentSchemas` | **Non supportés, tous modèles** | n.l. | n.l. |
| `pattern` (string) | **OK** — sauf **modèles fine-tunés**, où il est non supporté | Non listé comme mot-clé ; restrictions regex, voir 1.4 | n.l. |
| `format` (string) | OK : `date-time`, `time`, `date`, `duration`, `email`, `hostname`, `ipv4`, `ipv6`, `uuid` — non supporté sur **modèles fine-tunés** | OK : `date-time`, `time`, `date`, `duration`, `email`, `hostname`, **`uri`**, `ipv4`, `ipv6`, `uuid` | OK : `date-time`, `date`, `time` |
| `minLength` / `maxLength` | OK sauf **modèles fine-tunés** (non supportés) | **Non supportés** — « String constraints (`minLength`, `maxLength`) » | **IGNORÉS** silencieusement |
| `minimum` / `maximum` / `exclusive*` | OK — non supportés sur **modèles fine-tunés** | **Non supportés** — « Numerical constraints (such as `minimum`, `maximum`, `multipleOf`) » | OK sur number/integer |
| `multipleOf` | OK — non supporté sur **modèles fine-tunés** | **Non supporté** | n.l. |
| `patternProperties` | Non supporté sur **modèles fine-tunés** | n.l. | n.l. |
| `minItems` / `maxItems` (array) | OK — non supportés sur **modèles fine-tunés** | `minItems` **uniquement 0 et 1** ; au-delà : non supporté. `maxItems` non listé | **OK et appliqués** (contraste explicite avec les mots-clés ignorés) |
| `items` / `prefixItems` | n.l. | n.l. | OK (`items`, `prefixItems`) |
| `minProperties` / `maxProperties` | n.l. | n.l. | **IGNORÉS** silencieusement |
| `uniqueItems`, `contains`, `minContains`, `maxContains` | n.l. | n.l. | **IGNORÉS** silencieusement |
| `default` | n.l. | OK « for all supported types » | n.l. |
| `title` / `description` | n.l. comme mots-clés ; noter que le plafond de 120 000 caractères porte sur les noms de propriétés, les noms de définitions et les valeurs d'`enum`/`const`, **pas** sur les `description` | `name`/`description` modifiables sans invalider le cache de grammaire | OK (`title`, `description`) |

Sources de la table, ligne à ligne : [OpenAI, Structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs) (consulté 2026-11-09 ; API Responses, doc courante) ; [Anthropic, Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) (consulté 2026-11-09) ; [Gemini, Structured output](https://aistudio.google.com/docs/structured-output) (consulté 2026-11-09).

> **Le cas dangereux, isolé.** Chez Gemini, `minProperties`, `maxProperties`, `minLength`, `maxLength`, `uniqueItems`, `contains`, `minContains`, `maxContains` sont retirés pendant la normalisation de la requête **sans erreur**. `minItems`/`maxItems` sont, eux, appliqués. Un schéma « accepté » peut donc ne contraindre qu'une partie de ce qu'il déclare — [Gemini, Structured output](https://aistudio.google.com/docs/structured-output) (2026-11-09).

### 1.2 Limites numériques documentées, avec leur source

Chaque ligne nomme son fournisseur. **Aucune valeur n'est transposable d'une colonne à l'autre.**

| Limite | Valeur | Fournisseur / API | Source (consulté 2026-11-09) |
|---|---|---|---|
| Propriétés d'objet, total | **5 000** | OpenAI, Responses `json_schema` | [OpenAI Structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs) |
| Profondeur d'imbrication max | **10** | OpenAI | [idem](https://developers.openai.com/api/docs/guides/structured-outputs) |
| Noms de propriétés + noms de définitions + valeurs d'`enum` + valeurs de `const`, cumulés | **≤ 120 000 caractères** | OpenAI | [idem](https://developers.openai.com/api/docs/guides/structured-outputs) |
| Valeurs d'`enum`, total | **1 000** | OpenAI | [idem](https://developers.openai.com/api/docs/guides/structured-outputs) |
| Enum string de **plus de 250 valeurs** : longueur totale des valeurs | **≤ 15 000 caractères** | OpenAI | [idem](https://developers.openai.com/api/docs/guides/structured-outputs) |
| Strict tools par requête | **20** | Anthropic (`output_config.format` ou `strict: true`) | [Anthropic Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) |
| Paramètres optionnels par requête | **24** | Anthropic | [idem](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) |
| Paramètres à type union (`anyOf` ou tableau de types) par requête | **16** | Anthropic | [idem](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) |
| Au-delà des limites internes | 400 « Schema is too complex for compilation » | Anthropic | [idem](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) |
| **Timeout de compilation de grammaire** | **180 secondes** | Anthropic | [idem](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) |
| **Durée de vie du cache de grammaire compilée** | **24 h depuis la dernière utilisation** | Anthropic | [idem](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) |
| Limites de la machine à états (total states, branching paths, nesting depth) | **aucune valeur numérique sur la page** ; dépassement → `400 INVALID_ARGUMENT` ; « Very large or deeply nested schemas may be rejected » | Gemini | [Gemini Structured output](https://aistudio.google.com/docs/structured-output) |

> **Point d'attention.** Les limites Anthropic 20/24/16 et le timeout de 180 s sont citées depuis la page **structured-outputs**, et non depuis la page « strict tool use » dédiée, qui a renvoyé **HTTP 404** le 2026-11-09 (`platform.claude.com/docs/en/build-with-claude/tool-use/strict-tool-use`).
>
> **Anthropic : seule des trois docs lues à chiffrer la durée de vie du cache de grammaire** (24 h). Ne pas supposer un équivalent chez OpenAI ou Gemini.

### 1.3 Règles structurelles et d'exécution, par fournisseur

**OpenAI** — [Structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs) (2026-11-09, API Responses)

| Point | Contenu |
|---|---|
| Activation | `text: { format: { type: "json_schema", "strict": true, "schema": ... } }` |
| Modèles | « Structured Outputs is available in our latest large language models » ; la page recommande `gpt-6-astra` pour les nouveaux projets ; `gpt-4-turbo` « and earlier may use JSON mode instead » |
| Racine | **doit être un objet**, pas un `anyOf`. « A discriminated union, such as one produced by Zod » crée un `anyOf` racine « and is invalid » |
| Optionnalité | tous les champs dans `required` ; optionnel = union avec `null` |
| **Ordre des clés de sortie** | « Output keys follow the order of keys in the schema ». *Lecture data engineering : l'ordre des colonnes extraites est déterminé par le schéma, pas par le modèle.* |
| Latence | « the first request you make with any schema will have additional latency » ; « subsequent requests with the same schema will not have additional latency » |
| Refus | « the API response will include a new field called `refusal` » ; « Since a refusal does not necessarily follow the schema you have supplied » |
| `json_object` (JSON mode) | « only guarantees valid, parseable JSON », aucun schéma imposé, exige le mot « JSON » dans le contexte (sinon erreur API) ; sans cette instruction « the model may emit whitespace until it hits the token limit » |

**Anthropic** — [Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) (2026-11-09)

| Point | Contenu |
|---|---|
| Deux features coexistantes | JSON outputs via `output_config.format` ; contrainte de schéma sur les **inputs d'outil** via `strict: true` — « To enforce JSON Schema compliance on tool inputs with grammar-constrained sampling, see [Strict tool use] » |
| Headers | « beta headers are no longer required » pour `output_config.format` ; l'ancien `output_format` est **déprécié** et exige `structured-outputs-2025-11-13` — « Without it, the API returns a 400 error » |
| Piège SDK | « The Python SDK (v1.0 and later) does not accept `output_format={...}` … and raises a `TypeError` » |
| Compilation de grammaire | à la première utilisation d'un schéma donné, « there is additional latency while the grammar compiles » ; « Compiled grammars are cached for 24 hours from last use » ; invalidé par un changement de **structure** du schéma (ou du jeu d'outils), mais « Changing only `name` or `description` fields does not invalidate the cache » |
| Refus | « The response has `stop_reason: "refusal"` », **HTTP 200**, « You'll be billed for the tokens generated » ; la sortie peut ne pas suivre le schéma, « because the refusal message takes precedence over schema constraints » |
| Troncature | `stop_reason: "max_tokens"` → « The output might be incomplete and not match your schema » ; remède documenté = réessayer avec un `max_tokens` plus élevé |
| **Casse des enums** | « Compare enum values case-insensitively, and avoid enum values that differ only in capitalization ». *Impact direct sur un `CHECK` ou un mapping d'enum en base.* |
| Modèles listés supportés (métadonnée `supportedModels`) | `claude-fable-5-1`, `claude-mythos-5-1`, `claude-fable-5`, `claude-mythos-5`, `claude-mythos-preview`, `claude-opus-5-5`, `claude-opus-5`, `claude-sonnet-5-5`, `claude-sonnet-5`, `claude-haiku-5-5`, `claude-haiku-4-5-20251001`, `claude-opus-4-8`, `claude-opus-4-7`, `claude-opus-4-6`, `claude-sonnet-4-6`, `claude-opus-4-5-20251101`, `claude-sonnet-4-5-20250929` |

**Gemini** — [Structured output](https://aistudio.google.com/docs/structured-output) (2026-11-09, `generateContent`)

| Point | Contenu |
|---|---|
| Passage du schéma | par **`response_format`** : « The schema should be provided in the `schema` field ». La page **ne mentionne ni `responseSchema` ni `responseJsonSchema` ni `propertyOrdering`** |
| Guidance officielle de design de schéma (la plus explicite des trois docs lues) | déplacer les règles complexes dans les `description` et valider côté application ; aplatir les objets imbriqués ; rendre les `$ref` récursives optionnelles ou nullables et éviter de « recursing through required properties or arrays with `minItems` greater than zero » ; marquer les champs `required` quand c'est possible ; **réduire les grandes listes d'`enum`** ; simplifier les unions `anyOf` ; noms de propriétés concis ; retirer les bornes inutilisées |

### 1.4 Regex : restrictions Anthropic (fournisseur unique)

Non supportés chez **Anthropic** : backreferences, lookahead/lookbehind, word boundaries `\b`/`\B`, « Complex `{n,m}` quantifiers with large ranges » — [Anthropic, Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) (2026-11-09). **Aucune restriction regex équivalente n'a été lue chez OpenAI ni Gemini** dans cette session : ne pas transposer.

### 1.5 Ce qu'on en déduit (inférences, pas des citations)

- Le design de schéma a un effet **documenté sur la faisabilité et le coût**, pas seulement sur la qualité : les trois leviers que Gemini recommande (aplatir, raccourcir les noms, réduire les enums) sont exactement ceux qui réduisent la taille de la grammaire ; chez OpenAI ils déterminent si on reste sous 5 000 propriétés / profondeur 10 / 120 000 caractères ; chez Anthropic si la compilation tient sous 180 s.
- **Le « contrat de schéma » est asymétrique.** Un même schéma peut passer chez OpenAI (récursion OK, `pattern` OK), échouer en 400 chez Anthropic (récursion interdite, `minLength` interdit), ou passer chez Gemini en perdant silencieusement `maxLength`. Un pipeline multi-fournisseur doit **versionner un schéma par fournisseur**, ou se restreindre au plus petit dénominateur commun : types de base + `enum` string + `required` + `additionalProperties: false` + `minItems` ∈ {0,1}.
- **Trois modes d'échec distincts à gérer en code** : refus (OpenAI → champ `refusal` ; Anthropic → `stop_reason: "refusal"` en HTTP 200 **et facturé**), troncature (`max_tokens`), schéma rejeté (400). Aucun des trois ne garantit un parse réussi sans `try/except` côté pipeline.
- La latence de première requête est un coût de **démarrage de pipeline**, pas de steady state ; seule Anthropic chiffre la rétention du cache de grammaire (24 h depuis la dernière utilisation), ce qui compte pour un **job batch quotidien**.

### 1.6 À vérifier — structured outputs

Voir la section 6 pour le regroupement complet par fournisseur.

---

## 2. Extraction et classification

> **Avertissement de périmètre, repris de la note et non lissé.** **Aucune page OpenAI ni Gemini dédiée à l'extraction documentaire ou à la gestion de « unknown » n'a été lue dans cette session.** Les patterns anti-fabrication ci-dessous sont **Anthropic uniquement** et **ne doivent pas être présentés comme consensuels**. Les équivalents OpenAI / Gemini : **à vérifier**.

### 2.1 Classification : le mécanisme documenté est l'`enum`

| Fournisseur | Ce qui est documenté | Source (consulté 2026-11-09) |
|---|---|---|
| Anthropic | pour les tâches de classification, « use either tools with an enum field containing your valid labels » ou les structured outputs | [Anthropic, Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) |
| Anthropic — prefill déprécié pour ce rôle | les prefills « have been used to force specific output formats » (JSON/YAML, classification) ; migration proposée : demander d'abord la structure voulue, car « newer models can reliably match complex schemas when told to », surtout avec des retries. **[claim fournisseur]** sur la fiabilité des modèles récents | [idem](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) |
| Gemini | « enum lists a specific set of possible strings for classification » (strings) ; `enum` également supporté sur number/integer | [Gemini, Structured output](https://aistudio.google.com/docs/structured-output) |
| OpenAI | `enum` supporté avec plafonds chiffrés (1 000 valeurs ; 15 000 caractères au-delà de 250 valeurs) — **mais aucune page OpenAI de guidance « classification » n'a été lue** | [OpenAI, Structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs) |

### 2.2 Valeurs manquantes et « unknown » : la seule mécanique documentée est l'union avec `null`

| Fournisseur | Mécanique documentée | Source (consulté 2026-11-09) |
|---|---|---|
| OpenAI | tous les champs dans `required` ; « To make a field effectively optional, use a union with `null` » — p. ex. `{"type": ["string","null"]}` | [OpenAI, Structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs) |
| Gemini | même mécanique : `null` s'exprime en incluant `"null"` dans un tableau de types, `{"type": ["string", "null"]}` | [Gemini, Structured output](https://aistudio.google.com/docs/structured-output) |
| Anthropic | type `null` supporté ; `enum` accepte des nulls ; `default` supporté « for all supported types » | [Anthropic, Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) |

### 2.3 Anti-fabrication : guidance prompt-side — **Anthropic uniquement**

Toutes les lignes ci-dessous viennent d'**Anthropic**. Elles ne sont pas confirmées chez OpenAI ni Gemini dans cette session.

| Technique (nom officiel) | Contenu | Source (consulté 2026-11-09) |
|---|---|---|
| **Allow Claude to say "I don't know"** | donner explicitement la permission d'admettre l'incertitude ; selon la page, cela « can drastically reduce false information » | [Anthropic, Reduce hallucinations](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations) |
| **Use direct quotes for factual grounding** | sur documents longs (> 20k tokens), demander d'« extract word-for-word quotes first » avant d'exécuter la tâche | [idem](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations) |
| Clause de repli explicite (exemple officiel) | « Extract exact quotes … If you can't find relevant quotes, state "No relevant quotes found." » puis « Only base your analysis on the extracted quotes » | [idem](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations) |
| Retrait automatique des champs non étayés (exemple officiel) | pour chaque affirmation, trouver une citation directe ; sinon « remove that claim » et « mark where it was removed with empty [] brackets » | [idem](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations) |
| **External knowledge restriction** | n'utiliser que les documents fournis, « and not its general knowledge » | [idem](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations) |
| **Best-of-N verification** | rejouer le même prompt plusieurs fois et comparer ; « Inconsistencies across outputs could indicate hallucinations » | [idem](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations) |
| Limite assumée par le fournisseur | « although these techniques significantly reduce hallucinations, they don't eliminate them entirely » | [idem](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations) |

**Extraction documentaire multi-images, Anthropic** : Opus 4.5 et Opus 4.6 « have improved vision capabilities » et, dit la page, « perform better on image processing and data extraction tasks », en particulier quand plusieurs images sont présentes dans le contexte — [Anthropic, Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) (2026-11-09). **[claim fournisseur]**, sans benchmark cité sur la page.

### 2.4 Ce qu'on en déduit (inférences de la note, pas des citations)

- **La frontière documentée entre classification et génération est l'`enum`.** Dès que l'espace de sortie est une liste fermée, les trois fournisseurs offrent un mécanisme qui rend l'étiquette non négociable. Le critère de choix n'est pas « classification ou génération » mais **« puis-je énumérer les valeurs valides ? »**. *(Inférence de l'auteur de la note : aucune guidance officielle lue sur « quand classifier plutôt que générer ».)*
- **Conflit enum × volume.** Chez OpenAI : 1 000 valeurs d'enum au total, 15 000 caractères au-delà de 250 valeurs. Chez Gemini : la guidance officielle demande de réduire les grandes listes d'enum. Une taxonomie de plusieurs milliers de labels **ne tient pas dans un enum contraint** : hiérarchie en deux appels, ou retrieval de candidats puis enum réduit. *(Inférence, pas une affirmation de doc.)*
- **Deux couches distinctes contre les champs fabriqués, et il faut les deux.** La couche schéma empêche un champ *inventé* (`additionalProperties: false`) et rend l'absence exprimable (`null`), mais **n'empêche pas une valeur inventée** dans un champ requis. Seule la couche prompt (citer d'abord, retirer sans citation, autoriser « je ne sais pas ») adresse la valeur plausible mais fausse.
- Le pattern « quotes d'abord, puis extraction » est **le même** que pour le RAG (section 4) : c'est la même page de doc qui l'énonce pour les deux.

---

## 3. Text-to-SQL

### 3.1 Règle de datation appliquée

| Benchmark | Statut comme référence chiffrée |
|---|---|
| **BIRD** | benchmark **daté et vivant** → scores reportables |
| **Spider 1.0** | saturé ; parmi les entrées de tête lues, **aucune postérieure à novembre 2023** |
| **Spider 2.0** | benchmark dur, mais **le leaderboard public ne porte aucune date** sur la page lue → ses scores sont rapportés **non datés / à vérifier**, **pas au même rang que BIRD** |

⚠️ **Sur BIRD, l'alignement date ↔ modèle a été déduit de la mise en page par l'outil de fetch, pas affirmé par la page. À revérifier avant publication.** Cette qualification est conservée telle quelle sur chaque ligne concernée.

### 3.2 BIRD — ce qui est mesuré, par qui, et quand

| Point | Contenu | Source (consulté 2026-11-09) |
|---|---|---|
| Métrique principale | leaderboard titré « Leaderboard - Execution Accuracy (EX) » ; la page **ne définit pas la métrique** | [BIRD leaderboard](https://bird-bench.github.io/) |
| Métrique d'efficacité | le Reward-based Valid Efficiency Score (R-VES) sera « used as the efficiency metric for future test submissions » | [idem](https://bird-bench.github.io/) |
| Baseline humaine | ligne « Human Performance », « Data Engineers + DB Students », **EX 92.96**, R-VES 83.26 ; **la page ne précise pas à quel split se rapporte l'EX humain** | [idem](https://bird-bench.github.io/) |
| Composition du dataset (papier) | **12 751 paires text-to-SQL, 95 bases pour 33,4 GB, 37 domaines professionnels** ; défis : « dirty database contents » et « external knowledge between NL questions and database contents » ; ChatGPT atteint **40,08 %** d'execution accuracy contre **92,96 %** pour l'humain | [BIRD, arXiv:2305.03111](https://arxiv.org/abs/2305.03111) (v1 4 mai 2023, v3 révisée 15 nov. 2023, NeurIPS 2023) |

**Top 5 EX (Test %)** — *dates telles que lues ; **alignement date ↔ modèle déduit de la mise en page, à revérifier***, [BIRD leaderboard](https://bird-bench.github.io/) (2026-11-09) :

| # | Système | Partie mesurante / équipe | Dev | **Test** | Date (déduite de la mise en page) |
|---|---|---|---|---|---|
| 1 | **AskData** | AT&T CDO – DSAIR | 78.49 | **83.40** | 22 oct. 2026 |
| 2 | GrainSQL | Sarim Chaudhry (Purdue University) | 77.77 | 82.95 | 26 sept. 2026 |
| 3 | DataGallery-Text2SQL | Huawei 2012 Labs | 78.10 | 82.39 | 7 sept. 2026 |
| 4 | SiriusAI-SQL | Tencent Data Computing Platform Dept. | 77.77 | 82.28 | 22 août 2026 |
| 5 | Agentar-Scale-SQL | Ant Group | 74.90 | 81.67 | 25 sept. 2025 |

**Top R-VES (Test)**, même source et même réserve de datation : 1. GrainSQL **84.10** (26 sept. 2026) — 2. AskData **80.21** (22 oct. 2026) — 3. DataGallery-Text2SQL 77.64 — 4. Agentar-Scale-SQL 77.00.

**Piste « Single Trained Model »** (modèle unique entraîné, sans agent) : **Gemini-SQL2** (Google Research & Cloud), dev 74.12 / **test 80.04**, avec « Many » candidats de self-consistency, 3 juin 2026 — [idem](https://bird-bench.github.io/) (2026-11-09). *C'est le point de comparaison honnête pour un pipeline qui ne veut pas d'agent multi-tours.*

### 3.3 Spider 1.0 — ce qui est mesuré

| Point | Contenu | Source (consulté 2026-11-09) |
|---|---|---|
| Exact set match | l'évaluation ne compare pas les chaînes — « we decompose each SQL into several clauses, and conduct set comparison in each SQL clause » | [Spider, Yale LILY](https://yale-lily.github.io/spider) |
| Dataset | **10 181 questions, 5 693 requêtes SQL complexes uniques, 200 bases, 138 domaines** | [idem](https://yale-lily.github.io/spider) |
| Split cross-domain | « different complex SQL queries and databases appear in train and test sets » ; les systèmes doivent « generalize well to not only new SQL queries but also new database schemas » | [idem](https://yale-lily.github.io/spider) |

**Top « Execution with Values » (Test)** : 1. **MiniSeek** (Anonymous), 2 nov. 2023, **91.2** — 2. DAIL-SQL + GPT-4 + Self-Consistency (Alibaba Group), 20 août 2023, 86.6 — 3. DAIL-SQL + GPT-4 (Alibaba Group), 9 août 2023, 86.2.
**Top « Exact Set Match without Values » (Test)** : 1. MiniSeek **81.5** (dev 80.3), 2 nov. 2023 — 2. Graphix-3B + PICARD 74.0 (dev 77.1), 13 sept. 2022.
— [idem](https://yale-lily.github.io/spider) (2026-11-09).

⚠️ **Parmi les entrées de tête lues, aucune n'est postérieure à novembre 2023.** Le fetch n'a renvoyé que le **haut des deux tableaux**, pas la table complète : une soumission plus récente et moins bien classée peut exister.

### 3.4 Spider 2.0 — benchmark dur, **leaderboard non daté**

| Point | Contenu | Source (consulté 2026-11-09) |
|---|---|---|
| Nature | « evaluation framework comprising 632 real-world text-to-SQL workflow problems » ; bases d'entreprise « often containing over 1,000 columns » ; SQL « often exceeding 100 lines » | [Spider 2.0](https://spider2-sql.github.io/) |
| Variantes listées | **Spider 2.0-Snow** (547 exemples, Snowflake, « self-contained ») ; **Spider 2.0-DBT** (code agent, 68 exemples, DuckDB/DBT) ; **Spider 2.0-Lite** (547 exemples : BigQuery 214, Snowflake 198, SQLite 135). Le setting « Spider 2.0 » original a été retiré en mai 2025 (news daté 2025-05-22) | [idem](https://spider2-sql.github.io/) |
| Écart de difficulté énoncé par la page | « the success rate is only 10.1% on Spider 2.0 tasks », contre 86,6 % sur Spider 1.0 | [idem](https://spider2-sql.github.io/) |

⚠️ **Attribution non résolue sur le 10,1 % / 86,6 %** : l'outil de fetch a rattaché cette phrase à GPT-4o, mais 86,6 est exactement le score de DAIL-SQL + GPT-4 + Self-Consistency sur Spider 1.0. **Rapporter la phrase, pas l'attribution.**

**Entrées de leaderboard, SANS DATE sur la page** — donc **non utilisables comme « scores actuels »** au sens de la règle de source, et **pas au même rang que les chiffres BIRD datés** — [idem](https://spider2-sql.github.io/) (2026-11-09) :

| Variante | Entrée de tête | Score (non daté) |
|---|---|---|
| Spider 2.0-Snow | Genloop's Sentinel Agent v2 Pro (Genloop) | 96.70 |
| Spider 2.0-Snow | Native mini (usenative.ai) | 96.53 |
| Spider 2.0-Snow | QUVI-3 + Gemini-3-pro-preview (DAQUV) | 94.15 |
| Spider 2.0-Snow | TCDataAgent-SQL with Contextual Scaling Engine (Tencent Cloud Big Data) | 93.97 |
| Spider 2.0-Snow | Prism Swarm with Deepthink + Claude-Sonnet-4.5 (Paytm) | 90.49 |
| Spider 2.0-DBT | SignalPilot Agent (signalpilot.ai) | 65.6 |
| Spider 2.0-Lite | Tianqiong Data Agent + GLM 5.2 (Tencent, Data Computing Platform Dept.) | 76.23 |

### 3.5 Éléments de prompt dont l'effet est **mesuré** dans la littérature lue

| Papier | Ce qui est mesuré | Chiffres lus | Source (consulté 2026-11-09) |
|---|---|---|---|
| **DAIL-SQL** | compare systématiquement « question representation, example selection and example organization » ; les auteurs insistent sur l'**efficacité en tokens** comme critère de comparaison des approches de prompting | la solution proposée « refreshes the Spider leaderboard with 86.6% execution accuracy » | [arXiv:2308.15363](https://arxiv.org/abs/2308.15363) (v1 29 août 2023, v4 révisée 20 nov. 2023) |
| **DIN-SQL** | décomposition du problème de génération — « breaking down the generation problem into sub-problems » | nouveau SOTA Spider holdout **85.3** EX (SOTA précédent 79.9) ; **55,9 %** sur le holdout test de BIRD ; sur trois LLM, « consistently improves their simple few-shot performance by roughly 10% » et « beats many heavily fine-tuned models by at least 5% » | [arXiv:2304.11015](https://arxiv.org/abs/2304.11015), Pourreza & Rafiei (v1 21 avr. 2023, v3 2 nov. 2023, NeurIPS 2023) |
| **Rajkumar et al.** | exemples in-domain | « a small number of in-domain examples provided in the prompt enables Codex to perform better » que les modèles fine-tunés SOTA sur GeoQuery et Scholar ; « without any finetuning, Codex is a strong baseline on the Spider benchmark » | [arXiv:2204.00498](https://arxiv.org/abs/2204.00498) (soumis 15 mars 2022) |

### 3.6 Ce qu'on en déduit (inférences de la note)

- **Ce qu'un BIRD à 83,40 % test EX ne dit pas** : les entrées de tête sont des **systèmes agentiques nommés** (AskData, GrainSQL, DataGallery), pas des prompts simples. La piste « Single Trained Model » (Gemini-SQL2, 80.04 test) est le chiffre à citer pour un pipeline sans boucle d'agent — et elle utilise déjà « Many » candidats de self-consistency, donc du multi-échantillonnage. **Un prompt zero-shot mono-appel n'est représenté par aucun chiffre lu.**
- **Écart dev/test inversé sur BIRD** : les scores test sont **supérieurs** aux scores dev pour toutes les entrées de tête lues. C'est contre-intuitif : **ne pas transposer un chiffre dev en « performance attendue »**.
- **Pile de prompting mesurée, par ordre d'effet constaté dans les papiers lus** : (1) décomposition + auto-correction (DIN-SQL, ~+10 pts vs few-shot simple sur 3 LLM) ; (2) sélection/organisation des exemples few-shot (DAIL-SQL) ; (3) exemples in-domain (Rajkumar et al.). **Aucun chiffre lu n'isole l'effet du format de sérialisation du schéma ni de la spécification du dialecte.**
- **Spider 2.0 structure déjà la réponse « dialecte »** : le découpage par moteur (BigQuery / Snowflake / SQLite / DuckDB-DBT) montre que la communauté traite le dialecte comme une dimension d'évaluation. **Argument indirect, pas une mesure.**
- **BIRD est le benchmark à retenir pour un contexte data engineering réel** : 33,4 GB de bases, contenus « sales », nécessité de connaissances externes — le seul des trois dont la description lue correspond à un entrepôt de production.

---

## 4. RAG comme problème de prompting

> **Avertissement de périmètre, repris de la note.** **Aucune guidance officielle OpenAI ni Gemini sur le placement du contexte récupéré, le grounding ou l'abstention n'a été lue dans cette session.** Tout ce qui suit sur le placement et le grounding est **Anthropic uniquement** → ne pas généraliser. Équivalents OpenAI (p. ex. file search / Responses API) et Gemini (grounding, File Search) : **à vérifier**.

### 4.1 Placement du contexte — **claim fournisseur, pas une mesure**

| Point | Contenu | Statut | Source (consulté 2026-11-09) |
|---|---|---|---|
| Seuil | « When working with large documents or data-rich inputs (**20k+ tokens**), structure your prompt carefully » | règle de doc | [Anthropic, Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) |
| Règle **Put long-form data at the top** | placer les documents longs près du haut du prompt, **au-dessus** de la question, des instructions et des exemples. Justification de la page : cela « improves performance across all models » | **[claim fournisseur]** — « across all models » **n'est pas chiffré sur la page** | [idem](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) |

⚠️ **Relu à la source le 09/11/2026 — et le papier ne dit pas tout à fait ce que la règle en fait.** *Lost in the Middle* est désormais lu : [arXiv:2307.03172](https://arxiv.org/abs/2307.03172) (abstract, verbatim) et [arXiv:2307.03172v3](https://arxiv.org/html/2307.03172v3) (HTML, **verbatim jusqu'à ≈39 400 caractères sur 78 344** — abstract, introduction, §2, §3, §4 jusqu'à 4.3). Il mesure bien un effet de position, mais une **courbe en U** : « we observe a distinctive U-shaped performance curve », et la performance est « often highest when relevant information occurs at the beginning or end ».

**Ce que ça change pour la règle Anthropic ci-dessus.** Le papier soutient « **pas au milieu** ». Il ne classe **pas** le début au-dessus de la fin, et n'évalue **aucune** consigne de type « mettre le contexte en tête ». La règle *Put long-form data at the top* retient **l'une des deux positions** que la mesure autorise, et le papier ne tranche pas entre les deux. Le rejet du milieu est donc **adossé à une mesure** ; le choix du haut plutôt que du bas reste un **[claim fournisseur]**.

**Périmètre de la mesure, à ne pas étendre.** Modèles de **2023** : MPT-30B-Instruct, LongChat-13B 16K, GPT-3.5-Turbo 0613 (4K et 16K), Claude-1.3 (8K et 100K) ; GPT-4 8K sur un sous-ensemble seulement (annexe, `résumé d'outil`). Tâches : NaturalQuestions-Open (2 655 requêtes, 10/20/30 documents, un seul porteur de la réponse) et récupération clé-valeur **synthétique**. v3 du 20/11/2023 ; « Accepted for publication in Transactions of the Association for Computational Linguistics ». **Aucune mesure 2025-2026 de l'effet de position n'a été lue** → ne pas transposer aux modèles actuels. Le même §2.3 ajoute, verbatim, que « Extended-context models are not necessarily better at using input context » — les paires 4K/16K et 8K/100K y sont « nearly identical » quand l'entrée tient dans les deux fenêtres.

*Valeurs chiffrées par modèle : voir `01 §4`, qui les donne avec sa propre réserve (extraites par un modèle de résumé, non relues cellule par cellule).*

### 4.2 Grounding et abstention — Anthropic uniquement

| Technique | Contenu | Source (consulté 2026-11-09) |
|---|---|---|
| **Ground responses in quotes** | sur une tâche documentaire longue, demander de citer les passages pertinents **avant** d'exécuter la tâche ; effet annoncé : aider le modèle à « focus on the relevant content » et ignorer le reste | [Anthropic, Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) |
| Structure officielle en deux temps | trouver les citations et les « Place these in `<quotes>` tags », puis, **sur cette base seulement**, produire la réponse dans des balises `<info>` | [idem](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) |
| **Allow Claude to say "I don't know"** | la page annonce que cela « can drastically reduce false information » | [Anthropic, Reduce hallucinations](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations) |
| Abstention sur le retrieval lui-même | « If you can't find relevant quotes, state "No relevant quotes found." », puis « Only base your analysis on the extracted quotes » | [idem](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations) |
| **External knowledge restriction** | n'utiliser que les documents fournis, « and not its general knowledge » | [idem](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations) |
| Rétractation des affirmations non étayées | sans citation d'appui, « remove that claim » et marquer l'emplacement par des crochets vides | [idem](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations) |

### 4.3 Citations comme feature d'API — **Anthropic** (aucune feature équivalente lue chez OpenAI/Gemini)

Source commune : [Anthropic, Citations](https://platform.claude.com/docs/en/build-with-claude/citations) (consulté 2026-11-09 ; exemple cURL avec `anthropic-version: 2026-10-21`, modèle `claude-opus-5-5`).

| Point | Contenu |
|---|---|
| Objet | la feature « return[s] the exact passages that support each claim », pour vérifier les réponses et exposer les sources |
| Couverture | « All active models support citations » ; métadonnée `supportedModels` de `claude-fable-5-1` à `claude-sonnet-4-5-20250929` ; plateformes Claude API, AWS, Bedrock, Google Cloud, Microsoft Foundry |
| Granularité | trois types de localisation observés : `char_location`, `page_location`, `content_block_location`, chacun portant un `cited_text` |
| **Garantie de validité du pointeur** | l'API parse elle-même les citations et extrait `cited_text` directement, donc « **citations are guaranteed to contain valid pointers** » vers les documents fournis. ⚠️ **Garantie sur le *pointeur*, pas sur la pertinence de la citation pour l'affirmation.** |
| **Coût en tokens : nul sur le texte cité, dans les deux sens** | « The `cited_text` field is provided for convenience and **does not count toward output tokens** » ; « When passed back in subsequent conversation turns, `cited_text` is also **not counted toward input tokens** » |
| Économie vs prompt-side | si l'approche par prompt demande des citations littérales, la page annonce qu'on « might see cost savings » puisque `cited_text` ne compte pas dans les tokens de sortie |
| Streaming | les citations arrivent comme « a `citations_delta` delta type inside `content_block_delta` events » |
| ⚠️ **Exclusion mutuelle avec les structured outputs** | **« Citations cannot be used together with structured outputs »** — verbatim, relu le 09/11/2026. **Conséquence d'architecture, pas un détail** : dans un pipeline d'extraction, on ne peut pas obtenir dans le même appel une sortie contrainte par schéma **et** des citations vers les passages sources. Il faut deux appels, ou renoncer à l'un des deux. |
| ⚠️ **Tout ou rien sur les documents** | « citations must be enabled on all or none of the documents » — verbatim, 09/11/2026. Pas de citations sur un sous-ensemble des documents d'une même requête. |
| Bases d'indexation, par type | *plain text* → index de caractères **0-indexé** ; *PDF* → numéros de page **1-indexés** ; *custom content* → index de blocs **0-indexé** (09/11/2026). **Trois bases différentes dans la même feature** : source classique d'erreur de décalage en aval. |

### 4.4 Long context vs retrieval — une seule étude lue, datée 2024

| Résultat | Citation | Source (consulté 2026-11-09) |
|---|---|---|
| Qualité | « when resourced sufficiently, **LC consistently outperforms RAG** in terms of average performance » | [Li, Li, Zhang, Mei, Bendersky, arXiv:2407.16833](https://arxiv.org/abs/2407.16833) (v1 23 juil. 2024, v2 révisée 17 oct. 2024, EMNLP 2024 industry track) |
| Coût | « However, **RAG's significantly lower cost remains a distinct advantage** » | [idem](https://arxiv.org/abs/2407.16833) |
| Méthode hybride | **Self-Route**, « a simple yet effective method that routes queries to RAG or LC », sur la base de l'auto-réflexion du modèle ; « Self-Route significantly reduces the computation cost » à performance comparable au long contexte. **L'abstract ne donne pas de pourcentage de réduction de coût.** | [idem](https://arxiv.org/abs/2407.16833) |

⚠️ **Fragilité temporelle de cette conclusion** : l'étude est de juillet–octobre 2024 et porte sur des modèles de cette époque. **Elle ne doit pas être présentée comme un résultat 2026 sur les modèles actuels.** Aucune étude 2025-2026 sur long-context vs RAG n'a été lue → **à vérifier**.

### 4.5 Ce qu'on en déduit (inférences de la note)

- **Le RAG, vu comme prompting, se réduit à quatre décisions documentées** — toutes documentées côté Anthropic uniquement : (1) **où placer les chunks** — en haut, avant la question, à partir de ~20k tokens ; (2) **comment forcer l'ancrage** — citer avant de répondre, dans des balises séparées ; (3) **comment permettre l'abstention** — autoriser explicitement « je ne sais pas » et prévoir une valeur de repli (« No relevant quotes found ») ; (4) **comment rendre la réponse auditable** — API Citations plutôt que citations générées.
- **L'API Citations change le calcul économique du quote-first.** Le pattern « extraire les quotes puis répondre » coûte des tokens de sortie quand il est fait dans le prompt ; la feature Citations produit le même ancrage avec `cited_text` **hors comptage, à l'aller comme au retour**. Pour un pipeline qui rejoue des conversations multi-tours sur des documents, c'est une différence **structurelle** de coût, pas une préférence de style.
- **« Guaranteed valid pointers » ≠ « citation correcte ».** La garantie porte sur le fait que l'offset pointe bien dans le document fourni. Un pipeline qui veut une vraie vérification doit encore comparer l'affirmation au `cited_text` — ce que la doc Reduce hallucinations propose de faire par un second passage.
- **L'arbitrage long-context vs RAG est un arbitrage de coût, pas de qualité**, selon la seule étude lue (2024). Cela plaide pour une **politique par classe de requête**, pas un choix global.

---

## 5. Coût et déterminisme

### 5.1 Le point à retenir

**Aucun des trois fournisseurs ne garantit un cache hit ni un output identique.** Ce qui est garanti et chiffré, c'est le **tarif** et les **champs de comptage**. Le fait le plus structurant pour 2026 : **Gemini 4 et Gemini 3.6+ ignorent `temperature`, `top_p` et `top_k`** — le levier de déterminisme le plus classique **n'existe plus** chez ce fournisseur.

### 5.2 Prompt caching — Anthropic

Source commune : [Anthropic, Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) (consulté 2026-11-09).

| Point | Contenu |
|---|---|
| Mécanique | « Add a single `cache_control` field at the top level of your request » (le système « automatically applies the cache breakpoint to the last cacheable block »), ou `cache_control` sur un bloc précis. Seul type : « Currently, `ephemeral` is the only supported cache type, which by default has a 5-minute lifetime » |
| Portée du préfixe | le cache « references the entire prompt: `tools`, `system`, and `messages` », **dans cet ordre**, jusqu'au bloc désigné par `cache_control` inclus |
| **Tarifs** | write 5 min = « 1.25 times the base input tokens price » ; write 1 h = « 2 times the base input tokens price » ; read = « 0.1 times the base input tokens price ». **Exceptions** : hits sur Fable 5.1 et Mythos 5.1 « priced at 0.025x the base input price » ; sur Opus 5.5 et Sonnet 5.5 « priced at 0.05x the base input price » |
| TTL | les 5 minutes sont mesurées « from the start of the request that writes or reads the cache entry » et « refreshed for no additional cost each time the cached content is used » |
| Breakpoints | « You can define up to **4 cache breakpoints** » ; le breakpoint automatique consomme un des 4 slots ; si 4 breakpoints explicites existent déjà, « the API returns a 400 error » |
| Condition d'égalité | « **Cache hits require 100 percent identical prompt segments** » — texte et images compris, jusqu'au bloc marqué inclus |
| **Comptage** | `cache_creation_input_tokens` (« tokens written to the cache when creating a new entry »), `cache_read_input_tokens` (« tokens retrieved from the cache for this request »), `input_tokens` (« tokens after the last cache breakpoint ») ; identité documentée `total_input_tokens = cache_read_input_tokens + cache_creation_input_tokens + input_tokens` ; TTL mixtes → `cache_creation` se décompose en `ephemeral_5m_input_tokens` et `ephemeral_1h_input_tokens` |
| **Pas de garantie de hit** | « a cache entry only becomes available after the first response starts » (des requêtes parallèles peuvent manquer) ; la recherche « checks at most **20 positions** for each breakpoint », une entrée hors de cette fenêtre est manquée ; sous le minimum, pas d'erreur. Diagnostic suggéré : vérifier si `cache_creation_input_tokens` **et** `cache_read_input_tokens` sont tous deux à 0 |

**Minimum cacheable, par modèle (Anthropic)** :

| Minimum | Modèles |
|---|---|
| **512 tokens** | Fable 5.1, Mythos 5.1, Opus 5.5, Opus 5, Sonnet 5.5, Fable 5, Mythos 5, Haiku 5.5 |
| **1 024** | Opus 4.8, Sonnet 5, Sonnet 4.6, Sonnet 4.5, Opus 4.1, Opus 4, Sonnet 4 |
| **2 048** | Mythos Preview, Opus 4.7 |
| **4 096** | Opus 4.6, Opus 4.5, Haiku 4.5 |

⚠️ **Échec silencieux sous le minimum (Anthropic)** : « Shorter prompts cannot be cached, even if marked with `cache_control` » ; en dessous du seuil, les requêtes sont « **processed without caching, and no error is returned** ».

**Invalidation en cascade (Anthropic)** — un changement à un niveau invalide ce niveau et les suivants, dans l'ordre `tools` → `system` → `messages` :

| Changement | Effet |
|---|---|
| définitions d'outils (noms, descriptions, paramètres) | « invalidates the entire cache » |
| bascule web search / citations | invalide system + messages |
| bascule `speed: "fast"` ↔ standard | « invalidates system and message caches » |
| `tool_choice` | « only affect message blocks » |
| ajout / retrait d'images | « affects message blocks » |
| paramètres de thinking et `output_config.effort` | invalident toujours les message blocks |

> **Anthropic est le seul des trois à documenter des causes d'invalidation fines.** Pour un pipeline multi-outils, c'est la liste de contrôle la plus actionnable lue ; **ne pas supposer les mêmes règles chez OpenAI ou Gemini**.

### 5.3 Prompt caching — OpenAI

Source commune : [OpenAI, Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching) (consulté 2026-11-09).

| Point | Contenu |
|---|---|
| Activation | « Prompt caching is **enabled by default** for supported OpenAI models » |
| Minimum | « The minimum cacheable prompt length is **1,024 tokens for GPT-5.6 and later** » ; les modèles antérieurs varient selon les paramètres de requête |
| Remise | tokens d'entrée réutilisés « **discounted up to 95%** ». **[claim fournisseur]** — « up to », donc **plafond et non taux garanti** |
| Rétention | GPT-5.6+ : durée de vie minimale par défaut **30 minutes**, et `prompt_cache_options.ttl` permet **12 heures** dans l'API Responses. Modèles antérieurs : `prompt_cache_retention` avec `in_memory` « around 5 to 10 minutes of inactivity, up to one hour », ou `24h` « for up to 24 hours » |
| `prompt_cache_key` | optionnel sur GPT-5.6+, où il sert surtout à séparer la comptabilité du cache ; sur les modèles antérieurs, une clé stable aide le routage. « **Keys influence routing** » ; elles « **do not pin requests to a machine or guarantee a cache hit** » |
| Structure requise | « Cache reuse requires the entire rendered prefix to match » ; placer « stable developer instructions and shared reference material first » |
| Comptage | « `cached_tokens` counts billed reads and excludes tokens charged as writes » ; sur GPT-5.6+, le champ « reports the exact eligible boundary, excluding hidden tokens » |
| **Déterminisme** | « **identical requests are not guaranteed to produce identical outputs** » |

### 5.4 Caching — Gemini

Source commune : [Gemini, Caching](https://aistudio.google.com/docs/caching) (consulté 2026-11-09).

| Point | Contenu |
|---|---|
| Implicit caching | « **Implicit caching is enabled by default** for all Gemini 2.5 and newer models » |
| Explicit caching | **non** supporté dans l'Interactions API ni « for Gemini 4 Argon and onward » ; disponible « on supported Gemini 3 and 2.5 models » via `generateContent` |
| Minimums | Gemini 4 Argon **4 096** ; Gemini 3.8 Flash 4 096 ; Gemini 3.6 Flash 4 096 ; Gemini 3.1 Pro Preview 4 096 ; Gemini 2.5 Flash **2 048** ; Gemini 2.5 Pro 2 048 |
| **Économie** | **non chiffrée sur la page** — « We automatically pass on cost savings if your request hits caches ». → **ne pas écrire 75 % ni 90 %** |
| Comptage | champ `usage.total_cached_tokens` (Python et JavaScript) ; la page **ne mentionne pas** `cachedContentTokenCount` |
| Pas de garantie | la page donne des conseils pour « increase the chance of an implicit cache hit » |
| Spécificité Gemini 4+ | en multi-tours et boucles d'agent, le cache de la requête précédente **ne joue que si la nouvelle requête ajoute au moins 2 050 tokens** |

### 5.5 Batch APIs — remise, fenêtre, taille, et les caveats documentés

| Fournisseur | Remise | Fenêtre | Taille max | **Ordre des résultats** |
|---|---|---|---|---|
| **Anthropic** | « 50 percent of the standard API prices », « applies to input tokens, output tokens, and any special tokens » | « Batches expire if processing does not complete within 24 hours » ; résultats accessibles « when all messages have completed or after 24 hours, whichever comes first » | « limited to either **100,000 Message requests** or **256 MB** in size » — *relu verbatim le 09/11/2026* | **Non garanti** : « Batch results can be returned in any order … always use the `custom_id` field ». ⚠️ *Relecture du 09/11/2026 : cette phrase n'est retombée que dans le `résumé d'outil`, hors fenêtre verbatim. La citation de la note source est **conservée, pas infirmée** — deux fetchs ne rendent pas la même fenêtre.* Repère verbatim disponible aujourd'hui : l'appariement par `custom_id`, sans énoncé de garantie d'ordre |
| **OpenAI** | « 50% cost discount compared to synchronous APIs » | « Each batch completes within 24 hours » ; fenêtre réglable uniquement sur `24h` | « up to **50,000 requests** », fichier d'entrée « up to **200 MB** » ; `/v1/embeddings` plafonné à 50 000 inputs | **Non garanti** : « The output line order may not match the input line order » → utiliser `custom_id` |
| **Gemini** | « 50% of the standard cost » (50 % du coût interactif de l'équivalent) | « The target turnaround time is **24 hours** » | fichier d'entrée « maximum allowed file size … is **2GB** » ; requêtes inline < 20 MB ; **pas de nombre max de requêtes documenté → à vérifier** | **Non énoncé sur la page lue** ; la clé définie par l'utilisateur est renvoyée dans la réponse pour le rapprochement |

Sources : [Anthropic, Batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing) (2026-11-09) ; [OpenAI, Batch](https://developers.openai.com/api/docs/guides/batch) (2026-11-09) ; [Gemini, Batch API](https://aistudio.google.com/docs/batch-api) (2026-11-09).

**Caveats documentés, par fournisseur :**

| Point | Fournisseur | Contenu | Source (2026-11-09) |
|---|---|---|---|
| Délai annoncé | Anthropic | **[claim fournisseur]** « most batches finishing in less than 1 hour ». La même page nuance : « It is possible for a batch to expire and not complete within 24 hours » et « processing might be slowed down based on current demand and your request volume » | [Anthropic, Batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing) |
| Délai annoncé | Gemini | **[claim fournisseur]** « most jobs finish much sooner » | [Gemini, Batch API](https://aistudio.google.com/docs/batch-api) |
| Facturation des expirations | Anthropic | statut `expired` = le batch a atteint son expiration de 24 h avant que la requête n'atteigne le modèle ; dans ce cas, « **You will not be billed for these requests** » | [Anthropic, Batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing) |
| **Interaction batch × cache** | Anthropic | un batch pouvant dépasser 5 minutes, la page recommande d'« us[e] the 1-hour cache duration » pour de meilleurs taux de hit sur un contexte partagé. Et `max_tokens: 0` (pre-warming du cache) « is not supported inside a batch », car une entrée éphémère écrite pendant le traitement expirerait avant la requête suivante | [idem](https://platform.claude.com/docs/en/build-with-claude/batch-processing) |
| Rate limits | OpenAI | « Using the Batch API will not consume tokens from your standard per-model rate limits » | [OpenAI, Batch](https://developers.openai.com/api/docs/guides/batch) |
| Rate limits | Anthropic | « Usage of the Batches API does not affect rate limits in the Messages API », mais la Batches API a **ses propres** limites HTTP et sur le nombre de requêtes en attente | [Anthropic, Batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing) |
| **Rétention / conformité** | Anthropic | métadonnée de la page : ZDR **« not-eligible »**, « 29-day retention; async storage required ». *Point de conformité à ne pas manquer dans un pipeline.* | [idem](https://platform.claude.com/docs/en/build-with-claude/batch-processing) |
| Génération très longue | Anthropic | « A single 300k-token generation can take over an hour to complete » → dimensionner les soumissions en tenant compte de la fenêtre de 24 h | [idem](https://platform.claude.com/docs/en/build-with-claude/batch-processing) |

> **Interaction batch × caching chez OpenAI et Gemini — recherchée le 09/11/2026, toujours absente, et voici de quelles pages.** OpenAI : absente de [Batch](https://developers.openai.com/api/docs/guides/batch), **page lue d'un bout à l'autre** (21 087 caractères, aucune occurrence de cache), et de la portion verbatim de [Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching) (0–39 394 sur 56 540). Gemini : absente de [Caching](https://aistudio.google.com/docs/caching) **et** de sa variante `?generate-content=true`. **Ne pas transposer la recommandation Anthropic (TTL 1 h en batch) aux autres** — mais l'absence côté OpenAI porte désormais sur une page lue en entier, pas sur une page non ouverte.
>
> **Côté Anthropic, la recommandation est verbatim** et vaut d'être relue avant de câbler un pipeline : « consider using the 1-hour cache duration with prompt caching for better cache hit rates » sur un contexte partagé (page Batch processing, 09/11/2026).
>
> **Éligibilité conformité** : seule la métadonnée Anthropic (ZDR non éligible, rétention 29 jours, stockage asynchrone requis) a été lue. **Aucun équivalent OpenAI ou Gemini n'a été lu** → ne rien en conclure.

### 5.6 Température, seed, déterminisme — ce qui est réellement garanti

| Fournisseur | Ce que dit la page lue | Source (consulté 2026-11-09) |
|---|---|---|
| **Gemini — le fait le plus structurant** | Gemini 4 et Gemini 3.6+ « **ignore custom values for `temperature`, `top_p`, and `top_k`** », et la page conseille de **retirer ces paramètres de sampling des requêtes**. La page **ne mentionne pas `seed`** et **ne fait aucune affirmation de reproductibilité** | [Gemini, Text generation](https://aistudio.google.com/docs/text-generation) |
| Gemini — thinking par défaut | « enabled by default which allows the model to reason before responding to a request » ; chaque modèle supporte des configurations de thinking différentes, ce qui « gives you control over cost, latency, and intelligence ». En mode stateless, les étapes générées doivent être renvoyées « exactly as received, as they contain signatures required to continue the conversation ». La page **ne dit pas** comment le thinking affecte le contenu ou le déterminisme | [idem](https://aistudio.google.com/docs/text-generation) |
| **OpenAI — `seed` est best-effort** | le système fait « best effort to sample deterministically » ; « **Determinism is not guaranteed** » ; `system_fingerprint` « represents the backend configuration that the model runs with » ; et « There is a small chance that responses differ even when request parameters and `system_fingerprint` match ». ⚠️ **La page est marquée archivée** et référence le SDK « 1.3.3 at time of writing » : source OpenAI officielle mais **ancienne** | [OpenAI Cookbook, Reproducible outputs with the seed parameter](https://developers.openai.com/cookbook/examples/reproducible_outputs_with_the_seed_parameter) |
| OpenAI — confirmé par la doc courante | « identical requests are not guaranteed to produce identical outputs » | [OpenAI, Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching) |
| Anthropic — cache | **pas de garantie de hit**, et condition d'égalité à **100 %** du préfixe (voir 5.2) | [Anthropic, Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) |
| Anthropic — reproductibilité documentée côté **sortie structurée**, pas côté sampling | la contrainte de grammaire (`output_config.format`, `strict: true`) garantit la **forme**, pas le contenu ; et les enums peuvent varier en casse (« Compare enum values case-insensitively ») | [Anthropic, Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) |
| Détection de non-déterminisme comme méthode | rejouer le même prompt plusieurs fois et comparer les sorties : « Inconsistencies across outputs could indicate hallucinations » | [Anthropic, Reduce hallucinations](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations) |

### 5.7 Ce qui est garanti, une ligne par fournisseur (inférence de synthèse de la note)

| Fournisseur | Garanti / chiffré sur les pages lues | Explicitement **non** garanti |
|---|---|---|
| **Anthropic** | tarifs du cache (1.25× / 2× / 0.1×, exceptions 0.025× et 0.05×) ; plafond de **4 breakpoints** ; timeout de compilation **180 s** ; cache de grammaire **24 h** ; non-facturation des requêtes batch **expirées** ; validité des **pointeurs** de citations ; non-comptabilisation de `cited_text` (entrée et sortie) | cache hit ; output identique ; ordre des résultats batch |
| **OpenAI** | remise batch **50 %** ; plafonds **50 000 requêtes / 200 MB** ; exclusion des rate limits standards ; limites de schéma (**5 000** propriétés / profondeur **10** / **1 000** enums / **120 000** caractères) | cache hit (« Keys … do not … guarantee a cache hit ») ; **output identique** (dit explicitement) ; ordre des résultats batch |
| **Gemini** | remise batch **50 %** ; plafond fichier **2 GB** ; minimums de cache par modèle (4 096 / 2 048) ; seuil **2 050 tokens** pour le cache multi-tours Gemini 4+ | cache hit ; `temperature`/`top_p`/`top_k` **ignorés** sur Gemini 4 et 3.6+ ; économie de caching **non chiffrée** ; mots-clés de schéma **ignorés silencieusement** |

**Les trois autres inférences de la note, conservées :**

- **Le déterminisme n'est plus un paramètre, c'est une architecture.** Gemini a retiré l'effet de `temperature`/`top_p`/`top_k` sur ses modèles récents ; OpenAI qualifie `seed` de best-effort **depuis une page archivée** ; aucune doc lue n'offre de garantie. Un pipeline qui a besoin de reproductibilité doit l'obtenir **en aval** : contrainte de grammaire pour la forme, enums pour les valeurs catégorielles (**comparées sans casse**), validation + idempotence côté base, et versionnage de la paire (prompt, snapshot de modèle). *Inférence — elle découle des trois refus de garantie lus.*
- **Le cache est un contrat sur le préfixe, pas sur la requête.** Les trois convergent sur « préfixe identique, contenu stable d'abord ». La règle qui en découle — figer l'ordre `instructions → schéma → documents de référence → requête variable` — **entre en tension avec la règle de placement RAG d'Anthropic** (documents longs tout en haut). Quand les documents changent à chaque requête, ils ne doivent pas précéder la partie cachée. **Arbitrage à trancher par classe de requête ; aucune doc lue ne le tranche.**
- **Batch ≠ débit garanti.** Les trois annoncent 24 h comme fenêtre/cible, deux ajoutent un claim « souvent bien plus vite », et Anthropic documente explicitement l'expiration possible. **Planifier sur la fenêtre, pas sur le claim.** Le non-ordonnancement est explicite chez Anthropic et OpenAI, **non énoncé** chez Gemini : dans les trois cas, la clé de corrélation (`custom_id` / clé utilisateur) est le seul mécanisme sûr.

---

## 6. À vérifier

Tous les points ouverts de la note source, **regroupés par fournisseur / objet**. Aucun n'a été résolu dans cette session de curation : ce sont des **« à vérifier »**, pas des affirmations négatives.

### 6.1 Pages qui ont renvoyé une erreur

| Page | Statut | Conséquence |
|---|---|---|
| `platform.claude.com/docs/en/build-with-claude/tool-use/strict-tool-use` (Anthropic, « strict tool use » dédiée) | **HTTP 404** le 2026-11-09 | les limites **20 / 24 / 16** et le **timeout 180 s** proviennent donc de la page **structured-outputs**, pas de la page strict-tool-use |

### 6.2 Queues de pages non lues

| Page | Taille | Lu | Non lu |
|---|---|---|---|
| OpenAI structured-outputs | — | lue en deux passes (0–100 000, puis offset 100 000) → **complète** | — |
| **Anthropic structured-outputs** | 105 956 caractères | 0–100 000 (note source) ; **0–79 830 en verbatim** à la relecture du 09/11/2026 | la section **« Feature compatibility » existe** mais n'est connue que par `résumé d'outil` → **à vérifier** |
| **Anthropic prompt-caching** | 164 327 caractères | 0–100 000 (note source) ; **0–39 919 seulement** à la relecture du 09/11/2026 | **64 327 caractères non lus** au mieux, qui peuvent contenir les notes de bas de tableau de tarification citées indirectement en section 5 → **à vérifier**. *La couverture de la note source reste la meilleure.* |
| Anthropic référence Messages | **1 296 513 caractères** | ≈80 000 en verbatim (09/11/2026) | **94 % de la page non lue** : toute absence constatée sur cette page ne vaut presque rien → voir 6.5 |
| Gemini Batch API | 82 440 caractères | 0–39 412 en verbatim (09/11/2026) | fin de page en `résumé d'outil` → voir 6.3 |
| OpenAI function-calling | 77 171 caractères | 0–39 392 en verbatim (09/11/2026) | contraintes de schéma strict en `résumé d'outil` → voir 6.4 |
| **OpenAI Batch** | 21 087 caractères | **page entière** (09/11/2026) | — *la seule page fournisseur lue intégralement dans la seconde passe* |
| **Gemini Grounding with Google Search** | 18 945 caractères | **page entière** (09/11/2026) | — *idem ; c'est ce qui donne du poids à l'absence de guidance de placement, voir 6.3* |
| Spider 1.0 (leaderboards) | — | **haut des deux tableaux seulement** | table complète non renvoyée par le fetch : une soumission plus récente et moins bien classée peut exister → **à vérifier** |

### 6.3 Gemini

- **Aucune valeur numérique de limite** de schéma (profondeur, nombre de propriétés, budget de tokens de schéma) sur la page lue → **à vérifier**.
- **Gestion des refus sous structured output** non trouvée sur la page lue → **à vérifier**.
- **Latence de première requête / compilation** non documentée sur la page lue → **à vérifier**.
- **Pourcentage d'économie du caching non chiffré** sur la page lue → **à vérifier**. **Ne pas écrire 75 % ni 90 %.** *Relu le 09/11/2026 : toujours non chiffré sur les deux URL de caching ; la page y renvoie vers une page tarifs, **qui n'a pas été ouverte** — lien rapporté sous la forme `ai.google.dev/gemini-api/docs/pricing`, donc à résoudre via la redirection documentée en tête de fichier. C'est là qu'il faut aller chercher le chiffre, pas sur la page caching.*
- ~~**TTL par défaut du cache explicite** non trouvé sur la page lue.~~ **Levé le 09/11/2026** : « If not set, the TTL defaults to **1 hour**. » La même page ajoute « There are no minimum or maximum bounds on the TTL. » — [Gemini, Caching (`?generate-content=true`)](https://aistudio.google.com/docs/caching?generate-content=true). *Noter l'écart avec Anthropic, dont le défaut est de 5 minutes.*
- **Paramètre `seed`** — ni confirmé ni infirmé par la page lue → **à vérifier** ; **ne pas affirmer qu'il n'existe pas**.
- **Nombre max de requêtes par batch** non documenté sur la page lue → **à vérifier**. *Recherché à nouveau le 09/11/2026 : absent de la fenêtre verbatim de [Batch API](https://aistudio.google.com/docs/batch-api) (0–39 412 sur 82 440) ; la fin de page n'est connue que par `résumé d'outil`. Les seules limites verbatim restent 2 GB de fichier et 20 MB en inline.*
- **Ordre des résultats batch** non énoncé sur la page lue → **à vérifier** ; ne pas supposer qu'il est garanti ni qu'il ne l'est pas.
- **Guidance sur l'extraction documentaire / « unknown »** : aucune page lue → **à vérifier**.
- **Placement du contexte récupéré, grounding, abstention** → **page ouverte le 09/11/2026, et l'absence tient maintenant sur une lecture complète.** [Grounding with Google Search](https://aistudio.google.com/docs/google-search) a été lue **en entier** (18 945 caractères, aucune troncature) : elle décrit l'outil `google_search` — « Grounding with Google Search connects the Gemini model to real-time web content » — et des annotations `url_citation`, mais **ne dit rien du placement** du contexte récupéré dans le prompt, **ni de l'abstention**. Réserve : aucune page Gemini de *prompt design* n'a été ouverte, et c'est peut-être là que la guidance vivrait → **à vérifier là, pas ici**. **« File Search » n'apparaît sur aucune page lue : ne pas l'assimiler au grounding.**
- **Feature de citations** : aucune page lue → **à vérifier**. **Ne pas affirmer qu'il n'y en a pas.**
- **Interaction batch × caching** : recherchée le 09/11/2026 → **absente de [Caching](https://aistudio.google.com/docs/caching) et de sa variante `?generate-content=true`**. Reste **à vérifier** ailleurs. **Ne pas transposer la recommandation Anthropic.**

### 6.4 OpenAI

- ~~**« tool-use-as-schema »** : la page function-calling non lue.~~ **Page ouverte le 09/11/2026, et la question posée est tranchée** : `strict` **s'applique bien aux définitions de fonctions**. Cellule verbatim du tableau *Defining functions* : `strict` — « Whether to enforce strict mode for the function call » ; les exemples portent `"strict": true` et `"additionalProperties": false` dans chaque définition d'outil — [OpenAI, Function calling](https://developers.openai.com/api/docs/guides/function-calling). **Ce qui reste à vérifier est plus étroit** : le sous-ensemble exact de JSON Schema admis en mode strict n'est **pas** sur cette page, qui renvoie vers une page de schémas **non ouverte**. Les exigences « tous les champs dans `required` » et « optionnel = ajouter `null` au type » ne viennent que du `résumé d'outil` (page verbatim 0–39 392 sur 77 171) → **ne pas les citer comme lues**.
- **Existence et sémantique de `seed` dans l'API Responses courante** — la seule source lue est le **cookbook archivé**. La référence d'API n'a pas été lue → **à vérifier**. *Cherché à nouveau le 09/11/2026 : `seed` est **absent de trois pages** — [Function calling](https://developers.openai.com/api/docs/guides/function-calling), [Batch](https://developers.openai.com/api/docs/guides/batch) (lue en entier) et [Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching). **Aucune de ces trois n'a l'obligation de le porter** : la référence d'API et une éventuelle page « déterminisme » restent non ouvertes. **Ne pas conclure que `seed` a disparu.***
- **`system_fingerprint` dans l'API courante** — même réserve. Un fil communautaire (non primaire, **non retenu comme source**) conteste son utilité pratique ; **à ne pas citer comme fait**.
- **Guidance sur l'extraction documentaire / « unknown »** : aucune page lue → **à vérifier**.
- **Placement du contexte récupéré, grounding, abstention** : aucune page lue (p. ex. file search / Responses API) → **à vérifier**.
- **Feature de citations** : aucune page lue → **à vérifier**. **Ne pas affirmer qu'il n'y en a pas.**
- **Interaction batch × caching** : **absente de [Batch](https://developers.openai.com/api/docs/guides/batch), page lue d'un bout à l'autre** (21 087 caractères), et de la portion verbatim de [Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching) — relu le 09/11/2026. C'est l'absence la mieux bornée du fichier ; elle reste **à vérifier** sur la fin non lue de la page caching.

### 6.5 Anthropic

- **Section « Feature compatibility »** de la page structured-outputs : **la section existe**, confirmé le 09/11/2026 — mais son contenu n'est connu que par `résumé d'outil`, le verbatim s'arrêtant à 79 830 caractères sur 105 956. Donc **toujours « à vérifier »**, et rien de ce que ce résumé annonce (compatibilité batch / token counting / streaming / strict tool use, incompatibilité citations et prefilling) n'est cité ici comme lu. **Deux points verbatim seulement** : « JSON outputs and strict tool use solve different problems and work together » et « Structured outputs also work with streaming. »
- **Mode non strict non comparé** : la page « tool use overview » (`input_schema` sans `strict`) n'a pas été lue dans cette session. **Tout ce qui précède porte sur le mode contraint** → **à vérifier**.
- **Paramètre `seed`** → **à vérifier** ; **ne pas affirmer son absence**. *Cherché le 09/11/2026 sur la référence [Messages](https://platform.claude.com/docs/en/api/messages) : `seed` est absent de la liste de paramètres lue, mais cette page fait **1 296 513 caractères** et seuls ≈80 000 ont été rendus en verbatim — la liste lue s'arrête dans la description de `tools`. L'absence ne porte donc que sur 6 % de la page.* ⚠️ **Signal à ne pas sur-interpréter** : `temperature`, `top_p` et `top_k` sont eux aussi absents de cette fenêtre, alors qu'ils existent. **La fenêtre, pas l'API, est en cause.**
- ~~**Taille max d'un batch** (nombre de requêtes, octets) non extraite.~~ **Levé le 09/11/2026**, verbatim : « limited to either **100,000 Message requests** or **256 MB** in size » — [Anthropic, Batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing). Autres chiffres verbatim de la même passe : « most batches completing within 1 hour », « Batch results are available for **29 days** after creation », et `max_tokens: 0` « is not supported inside a batch ».
- **64 327 caractères non lus** de la page prompt-caching (voir 6.2) → **à vérifier**. ⚠️ *La relecture du 09/11/2026 a fait **moins bien**, pas mieux : verbatim de 0 à 39 919 sur 164 327, le reste en `résumé d'outil`. La couverture 0–100 000 de la note source **reste la meilleure lecture disponible** de cette page. Ne pas réécrire cette ligne à la baisse sur la foi de la seconde passe.*

### 6.6 Text-to-SQL

- **Format de sérialisation du schéma** (CREATE TABLE vs liste de colonnes, inclusion de lignes d'exemple, commentaires de colonnes) : **aucune mesure lue**. Les abstracts de Rajkumar et al. et de DAIL-SQL ne contiennent pas ces détails → **à vérifier dans le corps des papiers**.
- **Schema linking** : DIN-SQL est connu pour ce module, mais **l'abstract lu ne le nomme pas** (« breaking down the generation problem into sub-problems » seulement). **Ne pas attribuer à l'abstract une liste de modules non lue** → **à vérifier dans le corps du papier**.
- **Execution feedback / self-correction chiffré isolément** : non lu. DIN-SQL donne un gain global, pas la contribution du module de correction → **à vérifier**.
- **Spécification du dialecte dans le prompt** : aucune source lue ne la mesure → **à vérifier**.
- **Définitions formelles d'EX et de VES / R-VES** : la page BIRD renvoie au repo Mini-Dev pour la formule R-VES, et l'abstract du papier BIRD ne définit pas VES (« an efficiency analysis » seulement) → **à vérifier** (repo Mini-Dev / corps du papier).
- **Dates du leaderboard Spider 2.0** : **absentes**. Tant qu'elles manquent, ces scores **ne satisfont pas la règle de source** et **ne doivent pas figurer comme « scores actuels »**.
- **Split de l'EX humain BIRD (92,96)** : non précisé par la page → **à vérifier**.
- **Alignement date ↔ modèle sur BIRD** : **déduit de la mise en page** par l'outil de fetch, pas affirmé par la page → **à revérifier avant publication**.
- **Attribution du « 10.1 % / 86.6 % »** de la page Spider 2.0 : non résolue. **Rapporter la phrase, pas l'attribution.**

### 6.7 Transversal (toutes sections)

- **Aucune étude arXiv mesurant l'effet du design de schéma sur la qualité** (effet des `description`, de l'ordre des champs, de la profondeur sur l'exactitude) n'a été lue → **à vérifier**. Les affirmations de design en section 1 sont des **recommandations de fournisseur, non des résultats mesurés**.
- **Aucune guidance officielle lue sur « quand classifier plutôt que générer »**. Le critère « espace de sortie énumérable » est une **inférence de l'auteur de la note**, pas une recommandation citable.
- **Aucune mesure arXiv** sur l'effet du « unknown autorisé » sur le taux d'hallucination en extraction → **à vérifier**.
- **Confidence calibration / logprobs comme filtre d'extraction** : aucune source lue → **à vérifier**.
- **« Lost in the middle » (Liu et al.)** non lu → la justification empirique du placement en haut n'a **aucune source mesurée** ici, seulement le **[claim fournisseur]** Anthropic → **à vérifier**.
- **Taille / overlap de chunk, reranking, nombre optimal de chunks** : aucune source lue → **hors du périmètre documenté ici**.
- **Aucune étude 2025-2026** sur long-context vs RAG. L'étude citée est de **2024** → **à vérifier** pour une mise à jour.
- **Pourcentage de réduction de coût de Self-Route** : absent de l'abstract → **à vérifier dans le corps du papier**.
- **Comptage de tokens / tokenizers** : aucun endpoint `count_tokens` lu en détail dans cette session (seulement mentionné en passant dans la doc Anthropic structured outputs, à propos d'un `TypeError` du SDK Python). Règles de comptage comparées entre fournisseurs → **à vérifier**.
- **Prix absolus par modèle** : non lus (les pages de pricing n'ont pas été consultées). **Seuls les multiplicateurs et remises** ci-dessus sont sourcés.
