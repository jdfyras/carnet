# Base de référence : conventions, péremption, vérification

> Extrait des sections 2 à 5 du README de la base d'origine (rédigée le 2026-11-09). Les fichiers de
> ce dossier ont été renommés ; un renvoi à un fichier absent (08, 09, notes de recherche) désigne une
> partie non publiée. **Avant de s'appuyer sur un fait propre à un modèle, relire sa page officielle.**

Fichiers : `00-checklist.md` (la page qu'on garde ouverte), `00b-reference-rapide.md` (formulations à
retirer, couches d'instruction, evals), `01-techniques.md`, `02-regles-par-fournisseur.md`,
`03-context-engineering.md`, `04-donnees-et-sorties.md`, `05-evals.md`, `06-securite.md`, `07-mythes.md`.

## 2. La convention de citation

### 2.1 Les trois éléments obligatoires

Toute affirmation factuelle de la base porte :

1. **l'URL** de la page lue — l'URL finale, après redirection ;
2. **la date de consultation** — `2026-11-09` pour l'ensemble du corpus ;
3. **la génération de modèle, la version d'outil ou la version d'API** à laquelle elle s'applique.

Le troisième élément n'est pas décoratif. `[bp]` dit « re-check it against your own evals before
applying it to another » : une règle mesurée sur un modèle ne se transpose pas. Et `02 §6` documente
des **inversions** — des règles qui se contredisent d'une génération à l'autre. Une ligne sans
portée est donc fausse pour une partie du lineup, pas seulement imprécise.

Dans `00-checklist.md` et `00b-reference-rapide.md`, les trois éléments sont portés par une **clé**
(`[bp]`, `[o55]`, `[g-strat]`…) définie en bas de page : la clé vaut URL + date, la colonne portée vaut
le troisième élément. C'est le schéma de `02-regles-par-fournisseur.md`, repris tel quel.

⚠️ **Conséquence de la découpe du 09/11/2026 : la table des clés est dupliquée.** `00b` porte la table
**complète** ; `00-checklist.md` n'en garde que les **22 clés** que ses propres lignes utilisent, pour
rester lisible sans ouvrir l'autre fichier. **Une clé qui change doit changer dans les deux.** C'est le
prix payé pour que la page courte reste autonome, et il est écrit ici plutôt que découvert plus tard.

### 2.2 « À vérifier » veut dire : aucune source n'a été lue

**`à vérifier` n'est pas un doute sur la véracité d'une affirmation. C'est l'absence de source.**
Une affirmation marquée `à vérifier` peut parfaitement être vraie — simplement, personne dans cette
base ne l'a établie. Conséquences à tenir :

- `à vérifier` **ne se promeut jamais** en affirmation, ni en `folklore`. Dire « c'est faux » demande
  une source qui contredit ; `08` réserve pour ce cas une valeur distincte (**`non sourçable`** : la
  page **a été lue** et l'affirmation n'y figure pas, ou la page dit l'inverse).
- Une cellule vide, un `n.l.` ou un « non mentionné » **ne signifie pas « non supporté »** — seulement
  « absent de la portion lue ». `04` le dit explicitement de sa table de compatibilité ; `08` le dit
  de deux pages lues jusqu'à 100 000 caractères seulement.
- Une **absence vérifiée** est autre chose encore, et elle est signalée comme telle : `03 §7` établit
  sur deux pages distinctes que le terme « prompt injection » n'apparaît pas dans la spec MCP lue —
  ce n'est pas une lacune de recherche, c'est un constat sur la source.

### 2.3 Les étiquettes en usage — **une par fichier, jamais fusionnées**

Il n'y a pas un système d'étiquettes unique dans cette base, mais **six vocabulaires distincts**,
hérités des notes de recherche d'origine. Les fusionner serait une promotion déguisée. Ce que chacune
autorise :

| Fichiers | Étiquette | Ce qu'elle licencie |
|---|---|---|
| **01, 05** | `abstract lu` | Citer ce qui est **dans l'abstract**. Les chiffres absents de l'abstract ne sont pas affirmables |
| | `HTML lu` / `HTML complet lu` / `HTML Table N` | Citer la valeur **en nommant sa table**, pour qu'elle soit revérifiable |
| | `doc éditeur lue` | Citer la prescription du fournisseur comme prescription — pas comme mesure |
| | `artefact lu` | Rang le plus haut : `package.json`, index PyPI, doc lue à la branche. Une version établie par artefact est une version établie |
| | `Inférence de la note` | **Raisonnement de l'auteur de la note, pas une affirmation de la source.** Ne jamais citer comme un résultat |
| | `à vérifier` | Rien. Voir §2.2 |
| **02** | **rang 1 (artefact)** | Deux sources seulement dans tout le volume non-Anthropic : la model card Hugging Face Qwen3 et les formats de tokens Llama 4 |
| | **rang 2 (doc éditeur)** | Tout le reste. Lu via WebFetch, **citations non recoupées caractère par caractère contre le HTML brut** |
| | `(…)` entre parenthèses dans une colonne Citation | **Paraphrase, pas citation.** Aucune citation n'a été fabriquée pour combler une case ; les cases vides portent `—` |
| | « constat de fetch » / « constat de lecture » | Observation du chercheur sur le comportement de la page (redirection, absence), pas une phrase de l'éditeur |
| **03** | `[texte brut]` | Page récupérée en **texte intégral** : **citation verbatim fiable** |
| | `[extraction]` | Page passée par un modèle de résumé : citation **rapportée, pas garantie verbatim**. À re-vérifier avant toute publication verbatim |
| | `[opinion de praticien]` | **Aucune source de ce type n'a été consultée** dans ce fichier : il est entièrement éditeur |
| **04** | `[claim fournisseur]` | Affirmation du fournisseur **non mesurable par un tiers**. Ce n'est pas une mesure |
| | `n.l.` | Non lu sur la page de cette session → **à vérifier**, ne pas conclure à l'absence |
| **06** | `[MESURÉ]` | Chiffre issu d'une **évaluation publiée, lue à la source** |
| | `[RECOMMANDÉ]` | Prescription d'un standard ou d'un vendor **sans mesure publiée dans la source lue** — y compris quand elle est normative (`MUST`) |
| | `[PRATICIEN]` | Analyse d'un praticien, ni standard ni documentation vendor |
| **07** | `confirmé` | Une source lue soutient l'affirmation ; la génération concernée est nommée |
| | `périmé` | Une source lue la soutenait à une date antérieure ; le contrat d'API, le lineup ou la doc courante l'a dépassée |
| | `folklore` | Une source lue **contredit** l'affirmation. **Jamais appliqué à une affirmation simplement non mesurée** |
| | `non réconcilié` | Deux mesures lues pointent en sens opposés **sans partager modèles ni bancs**. Aucun arbitrage produit |
| | `à vérifier` | Voir §2.2 |
| **08** | `confirmé` / `périmé` / `à vérifier` | Mêmes règles que 07 ; `à vérifier` = **la page n'a pas pu être lue** (403, 404, non ouverte) |
| | **`non sourçable`** | **La page a été lue** et l'affirmation n'y figure pas, ou la page dit l'inverse, ou l'affirmation ne renvoie à aucune source vérifiable. **Distinct de `à vérifier` — ne pas confondre** |

Deux axes **orthogonaux**, à ne pas rabattre l'un sur l'autre : le **rang de source** (qui parle, et
à quel degré de fiabilité de lecture) et la **nature de la preuve** (mesure publiée, prescription,
opinion). Une prescription normative d'un standard est de rang élevé **et** `[RECOMMANDÉ]` sans
mesure : les deux à la fois.

### 2.4 La limite de précision, énoncée honnêtement

**Les pages ont majoritairement été récupérées via WebFetch, qui restitue la page à travers un petit
modèle de résumé.** Les chiffres et citations qui en viennent sont donc des **extractions
revérifiables par le numéro de table cité**, pas des lectures caractère par caractère. Précisément :

- **Passé par le modèle de résumé** : les valeurs de tables de `01` et `05` (tables GEPA, tables de
  biais de Zheng et al., deltas positionnels), **toutes les citations non-Anthropic de `02`**, les
  blocs `[extraction]` de `03` (les quatre articles Anthropic Engineering, et les pages `skills`,
  `sub-agents`, `hooks`, `agents.md`).
- **Récupéré en texte intégral**, donc verbatim fiable : les blocs `[texte brut]` de `03` — pages
  Claude Code `best-practices`, `memory`, section sécurité de `hooks`, standard agentskills.io, pages
  MCP.
- **Rang artefact** : `package.json` de promptfoo, index PyPI de DeepEval, doc DSPy à la branche,
  model card Qwen3, formats de tokens Llama 4.
- **Cas particulier à connaître** : sur le leaderboard BIRD, **l'alignement date ↔ modèle a été
  déduit de la mise en page par l'outil de fetch, pas affirmé par la page** (`04 §3.1`).

**Règle qui en découle, et qui est la seule à retenir : un chiffre qui porte une décision se relit
sur le PDF ou la table citée.** Pour tout usage où le libellé exact engage — une slide citée, un
document contractuel — rouvrir la page et recopier la phrase. Un cas concret s'est produit dans la
session d'origine : la première extraction de la taxonomie du *Prompt Report* donnait un décompte
approximatif, corrigé par une seconde lecture ciblée des intitulés littéraux.

---

## 3. Date de péremption par volet

Les huit fichiers ne vieillissent pas à la même vitesse. L'ordre ci-dessous est l'ordre de relecture.

### Périme en semaines — à relire en premier

| Volet | Pourquoi | Ce qui bouge concrètement |
|---|---|---|
| **`02` — règles par fournisseur** | Le fichier est organisé **par génération de modèle**, et c'est précisément ce qui change. Il nomme 14 modèles Anthropic, une page de prompting par modèle, les défauts d'effort, les matrices de thinking | Un nouveau modèle ajoute une page de prompting, un défaut d'effort et possiblement une **inversion** de règle. Les lignes « legacy » bougent sans préavis de contenu |
| **`05 §4` — dépréciations datées** | **Deux jalons tombent le 30 novembre 2026** : arrêt de la plateforme OpenAI Evals, et arrêt de `v1/prompts` (les reusable prompt objects). La plateforme Evals était déjà en **lecture seule depuis le 31 octobre 2026** à la date de consultation | Après le 30 nov. 2026, toute la section outillage OpenAI de `05` décrit des produits arrêtés |
| **`04 §5` + `02 §7` — paramètres et ruptures** | Dépendent de la **version d'API**, pas du modèle. `temperature`/`top_p`/`top_k` retirés en `2026-10-21`, minima de cache par modèle, seuils de tokenizer | Une nouvelle version d'API peut retirer ou ignorer un paramètre sans erreur |
| **`03` — pages vivantes non versionnées** | Les docs Claude Code (`code.claude.com/docs`) **n'affichent pas de version** ; elles mentionnent en interne les seuils `v2.1.211` → `v2.1.285`. Les pages agentskills.io n'affichent **ni version ni date de révision** | Une page vivante peut être réécrite sans trace. Les seuils de version internes sont le seul repère |

### Périme en mois

| Volet | Pourquoi |
|---|---|
| **`05 §3` — outillage** | Versions établies à des artefacts datés : promptfoo **0.125.1** (lue à la branche `main`, qui peut être en avance sur la release), DeepEval **4.3.3**, Langfuse **non établie** (`/changelog` → 404), DSPy **non établie** (branche, pas tag). Trois des quatre versions sont fragiles par construction |
| **`04 §1` — compatibilité JSON Schema** | Les sous-ensembles supportés évoluent avec les modèles et les API. Le **mode d'échec**, lui, est plus stable que la liste de mots-clés |
| **`04 §3` — text-to-SQL** | Leaderboards vivants : les entrées de tête de BIRD sont datées d'**août à octobre 2026**. Spider 1.0 est saturé ; le leaderboard Spider 2.0 **ne porte aucune date** sur la page lue, donc ses scores ne sont pas au même rang |

### Périme lentement

| Volet | Pourquoi | Ce qui périme quand même |
|---|---|---|
| **`01` et `07` — résultats académiques** | Un résultat mesuré en 2022 sur `text-davinci-002` reste vrai **de ce modèle à cette date**. Ce qui périme n'est pas la mesure, c'est **l'absence d'une mesure équivalente sur un modèle récent** | Le jour où une mesure sur modèle frontier 2026 existe, les sections `à vérifier` de `01 §6` se referment — et certaines conclusions changent peut-être |
| **`06` — standard de sécurité** | Le socle sécurité de la spec MCP est **inchangé** entre les révisions `2025-06-18` et `2026-07-28` (`03 §7`). L'enregistrement CVE-2025-32711 est figé | Les mitigations vendor bougent (system cards, billets) ; le cadrage et les obligations normatives, non. **Mais l'édition du Top 10 a bougé pendant la constitution de cette base** : voir la ligne ci-dessous |
| **`06 §1` — le cas d'école de péremption** | Rien : c'est l'exception de ce tableau. **Deux éditions du Top 10 coexistent** (`2025` et `2026`) et **l'éditeur se contredit sur laquelle est courante** — sa navigation et la page projet `owasp.org` désignent encore la liste 2025, alors que sa page de ressource annonce le 2026 « the latest community-driven guide ». Aucune phrase de supersession n'existe dans le PDF 2026 | **Tout le corps de `06` est établi contre les pages `:2025`** et n'est pas re-vérifié contre le texte 2026. À refaire avant tout usage de conformité. Un **Agent Control Standard** du même éditeur n'a pas été lu du tout |
| **`03 §1`, `§4` — doctrine** | La distinction déterministe / non déterministe et la table « What you can stop doing » sont **prescriptives**, pas descriptives : elles décrivent une façon de décider | Le contenu de la table bouge quand les modèles rattrapent un nouveau contournement. La page le dit elle-même : si un autre conseil « finit par ressembler à du travail pour rien », il « belongs in this table too » |

### Ordre de relecture recommandé

1. `02 §1.4` (lineup, IDs, cycle de vie) et `02 §7` (ruptures) — c'est là que du code casse.
2. `05 §4` (dépréciations) — jalons calendaires.
3. `04 §5` (paramètres, cache, batch) et `04 §1` (schémas).
4. `03` — relire les pages `[texte brut]` pour voir si elles ont été réécrites.
5. `01`, `07`, `06` — en dernier, et surtout pour voir si une mesure frontier 2026 est apparue.

---

## 4. Comment vérifier une ligne de cette base

Quatre gestes, dans cet ordre. La procédure vaut aussi pour les lignes du cheat-sheet.

1. **Ouvrir l'URL citée** — l'URL exacte de la ligne, pas une page voisine du même site. Les clés du
   cheat-sheet et les définitions de liens en bas de `02` donnent l'URL complète.
2. **Trouver la version concernée** — le modèle, la génération ou la version d'API que la ligne nomme
   dans sa colonne de portée. Une page de doc d'une autre version ne prouve rien pour celle-ci.
3. **Confronter la phrase exacte, pour cette version.** La question n'est pas « la page parle-t-elle
   du sujet » mais « la page dit-elle **cette** phrase, pour **ce** cas, à **cette** version ». Une
   page qui dit où se trouve un réglage ne dit pas sa valeur.
4. **En cas d'écart, dégrader la ligne en « à vérifier »** — avec la date de la nouvelle lecture et ce
   qui diffère. **Ne pas la corriger de mémoire, ne pas la supprimer.** Une ligne dégradée garde la
   trace du travail ; une ligne supprimée se réinvente ailleurs.

### 4.1 Cette procédure a déjà attrapé une erreur de cette base

Appliquée à six affirmations tirées au hasard le 2026-11-09, elle en a confirmé cinq mot à mot et
**invalidé la sixième** : `06 §1` affirmait que l'édition 2025 du Top 10 OWASP était « toujours la
courante » et qu'« aucune édition 2026 n'apparaît ». Une **édition 2026 existe**. Les deux fichiers
touchés (`06 §1` et le rapport narratif) portent leur correction, datée et signée comme telle.

Le défaut de méthode mérite d'être retenu, parce qu'il est le plus facile à reproduire :
**l'absence avait été conclue depuis la seule page où on l'attendait.** La page de liste 2025
n'annonce effectivement rien ; c'est la page d'accueil de l'éditeur qui annonçait le 2026. Lire la
page où une information *devrait* être ne suffit pas à prouver qu'elle n'existe pas — il faut aussi
lire la page où elle *serait publiée*. Formulé en règle utilisable : **une absence ne se constate que
sur la page qui aurait l'obligation de la contenir, et on nomme cette page.**

Trois écarts à traiter différemment :

- **La page a changé** → la ligne est `périmé`, et sa portée d'origine (« vrai au 2026-11-09 pour
  telle génération ») reste vraie. C'est une inversion de plus à documenter, pas une erreur.
- **La page dit l'inverse et l'a toujours dit** → la ligne est `non sourçable` au sens de `08`, et
  c'est une erreur de lecture à corriger.
- **La page ne répond plus (403, 404, redirection)** → `à vérifier`, et noter le code. Plusieurs
  lignes de la base sont dans cet état par construction (`06`, `08`).

Enfin : **une citation fait moins de 15 mots** dans toute la base, et cette règle tient dans les deux
sens — en relecture comme en écriture.

---

## 5. Limites — ce que cette base ne sait pas

### 5.1 Le trou transversal

**Aucune mesure sur un modèle frontier 2026 n'a été lue.** C'est la limite qui qualifie tout le reste :

- La strate académique la plus récente lue est **août 2025** (`01 §6`). Toute extrapolation à 2026 est
  `à vérifier`.
- Les résultats canoniques de `01` sont mesurés sur des modèles de **2021–2023** : GPT-2, GPT-3
  `text-davinci-002` / `code-davinci-002`, PaLM 540B, LLaMA-2, Flan-T5, Claude-1.3, GPT-3.5-Turbo.
  Deux sources documentent explicitement cette **non-transférabilité**.
- Les **modèles testés** par les *Prompting Science Reports* 2 et 3 et par *To CoT or not to CoT* **ne
  sont pas nommés** sur les pages d'abstract lues — c'est précisément la question de la génération.
- Les biais du LLM-as-judge de `05 §2` sont mesurés sur **Claude-v1, GPT-3.5 et GPT-4**, des juges de
  **2023**. **Les magnitudes ne sont pas transférables ; ce qui se transfère est la méthode de mesure.**
- L'effet de position (*Lost in the Middle*) porte sur des modèles de **2023**. L'étude long-context
  vs RAG est de **juillet–octobre 2024** et ne doit pas être présentée comme un résultat 2026.
- Les gains d'optimisation automatique (GEPA, MIPROv2, APE) sont **tous mesurés par les auteurs de la
  méthode** ; **aucune réplication indépendante n'a été lue**.

### 5.2 Ce que le corpus ne contient pas du tout

- **Aucune source non-éditeur dans `03`** : il n'y a donc **aucune contre-expertise ni avis de
  praticien** sur l'architecture en couches, la table des pratiques périmées, ou l'écart standard /
  produit.
- **Aucune évaluation indépendante** (non-vendor) des cinq couches de Google ni des safeguards
  d'Anthropic en sécurité (`06 §8`).
- **Aucune doc vendeur ne reconnaît ni ne chiffre les biais de ses propres juges** (`05 §2.8`) — angle
  mort des docs, pas de cette base.
- **Aucune guidance statistique** d'Anthropic ni d'OpenAI sur les evals : ni taille d'échantillon
  minimale, ni test de significativité (`05 §1.4`). Nuance : 52 950 derniers caractères des pages
  concernées non lus → `à vérifier`.
- **Aucun budget de tokens cible par couche** n'est publié (`03 §10`) ; seuls des plafonds ponctuels.
- **Aucune prescription officielle de protocole de régression inter-modèles** (`05 §6.4`) : les
  fournisseurs donnent un calendrier, un inventaire et l'injonction « testez tôt ».
- **r/PromptEngineering, Latent Space, l'attribution du slogan « le prompt engineering est mort »** :
  aucune page ouverte (X non fetchable) → `à vérifier` en bloc.

### 5.3 Deux écarts **entre fichiers**, non arbitrés

Ils viennent de notes de recherche distinctes, et cette base ne les tranche pas :

- **Révision de la spec MCP citée — tranché le 09/11/2026, à la source.** `03 §7` cite la révision
  **`2026-07-28`** (et la compare à `2025-06-18`) ; `06 §3.4` et `§4.4` citent une page dont « le
  contenu servi réfère la révision **`2025-11-25`** ». **La page de versioning dit : « The current
  protocol version is 2026-07-28 »** —
  [modelcontextprotocol.io/specification/versioning](https://modelcontextprotocol.io/specification/versioning),
  lue le 2026-11-09, de même que
  [/specification/](https://modelcontextprotocol.io/specification/), qui pointe le schéma
  `schema/2026-07-28/schema.ts`. Donc `03` a la révision courante, et les citations de `06` viennent
  d'une révision **antérieure**. Deux précisions qui empêchent d'en conclure trop :
  - la page de versioning **ne liste aucune révision** et **ne donne aucun statut** à `2025-11-25`
    (elle ne la mentionne que comme révision « handshake-based … and earlier ») : `2025-11-25` n'est
    donc **pas** établie comme obsolète, seulement comme non courante. Les catégories définies sont
    `Draft` / `Current` / `Final`, sans qu'aucune révision y soit rattachée sur la page lue ;
  - **cinq** des obligations citées par `06` se retrouvent **nommées à l'identique** sur
    `/specification/2026-07-28/basic/security_best_practices`, page lue et citée en `03 §7` —
    *confused deputy*, *token passthrough*, SSRF, serveur MCP local, minimisation des scopes : elles
    ne sont pas périmées. **La sixième ne se recoupe pas par son nom** : `06` cite « *session
    hijack* » / « MUST NOT use **sessions** for authentication », `03` cite « *state handle
    hijacking* » / « MUST NOT treat possession of a **state handle** as authentication ». Renommage
    plausible, **correspondance non lue : à vérifier** — et cette comparaison est faite **depuis les
    deux fichiers de cette base**, aucune des deux pages de la spec n'ayant été relue le 09/11.
    **Ce qui reste à faire pour les cinq autres est éditorial, pas factuel : faire voyager chaque
    citation avec sa révision**, et préférer la page `2026-07-28` quand on recite.
- **Statut de lecture de *Lost in the Middle* — tranché le 09/11/2026, et ce n'était pas la bonne
  question.** Le papier a été relu : [arXiv:2307.03172](https://arxiv.org/abs/2307.03172) (abstract,
  verbatim) et [arXiv:2307.03172v3](https://arxiv.org/html/2307.03172v3) (HTML, verbatim jusqu'à
  ≈39 400 caractères sur 78 344). `04 §4.1` est corrigé en conséquence : la justification empirique
  **existe**, mais elle soutient une **courbe en U** — « performance is often highest when relevant
  information occurs at the beginning or end » — et donc « **pas au milieu** », pas « en haut ». La
  règle Anthropic *Put long-form data at the top* retient l'une des deux positions que la mesure
  autorise, sans que le papier tranche entre les deux.
  **Sur le désaccord d'étiquette, aucun verdict** : `01 §4` porte `HTML complet lu`, et la même URL
  relue le 09/11 s'est tronquée à ≈39 400 sur 78 344 caractères. Deux fetchs ne rendent pas la même
  fenêtre : l'étiquette de `01` est **non reproduite aujourd'hui, pas infirmée**, et ses valeurs par
  modèle portent déjà leur propre réserve (extraites par un modèle de résumé, non relues cellule par
  cellule). **Ne pas la réécrire sur la foi de cette seconde passe.**

### 5.4 Contradictions **dans les sources**, rapportées et non résolues

Elles sont dans les fichiers avec leurs deux côtés. Les quatre les plus structurantes :

- **« Legacy » contre « Active » pour les mêmes neuf modèles** : *Models overview* les range en
  « Legacy models (still available) », *Model deprecations* les donne tous **Active**. Les deux pages
  emploient « legacy » différemment (`02 §8 n° 1`).
- **Google, `temperature`** : la **même page** dit de le **retirer** sur Gemini 4 / 3.6+ (valeurs
  ignorées) et d'**augmenter** la temperature face à un repli de filtre de sécurité (`02 §8 n° 2`).
- **Few-shot** : OpenAI « Try zero shot first, then few shot if needed » contre Google « are likely to
  be less effective » sans exemples. La nuance de périmètre (reasoning models vs Gemini en général)
  est une **inférence des chercheurs**, pas un arbitrage (`02 §8 n° 4`).
- **Le standard prescrit ce que les praticiens disent inefficace** : OWASP LLM01:2025 recommande de
  demander au modèle d'ignorer les tentatives de surcharge de ses instructions, **sans aucune mesure
  d'efficacité** ; la littérature praticienne nie l'efficacité de cette instruction comme barrière.
  **Aucune source lue ne tranche** (`06 §7`).

### 5.5 Ce que la base ne remplace pas

Elle établit **ce qui est documenté**, jamais **ce qu'il faut faire ici**. Un chiffre, une prescription
vendor et une inférence de chercheur ne décident pas d'un arbitrage de coût, de gouvernance ou de
produit. Les propositions d'application à un projet donné ne font pas partie de cette base publiée.

---

*Base constituée le 2026-11-09 à partir de huit notes de recherche. Les fichiers 01 à 08 ne contiennent
rien qui ne soit soutenu par une source citée ou explicitement marqué comme inférence ou comme
« à vérifier ».*
