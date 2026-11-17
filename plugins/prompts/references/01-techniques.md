# 01 — Taxonomie des techniques de prompting : catalogue des types et preuve par type

> **Base de référence embarquée dans le plugin prompts.** Pages consultées le **2026-11-09** ; à relire avant le **2027-02-09**. Un fait propre à un modèle (effort, thinking, paramètres, formulations) se relit sur la page officielle du modèle visé avant d'être affirmé : ce fichier dit où lire, pas ce qui est vrai aujourd'hui. Les renvois `→ NN` désignent les autres fichiers de ce dossier (même préfixe numérique) ; les notes de recherche citées ne sont pas publiées.


**Note source lue :** `research_notes/Prompt engineering référence 2026/03-academique-et-hubs.md`
**Lue jusqu'à la fin** (dernière ligne : item 7 de la section *Gaps — majeurs, pour l'ensemble de la note*).
**Date : 2026-11-09.** Toutes les sources de cette note ont été consultées le 2026-11-09 ; la date est
répétée par ligne dans le tableau central.
**Périmètre :** ce fichier ne contient rien qui ne soit dans la note 03. Aucune recherche nouvelle.

---

## Marqueurs de provenance employés ici

Ce sont ceux de la note source, repris tels quels. Rien n'est promu d'un niveau au niveau supérieur.

| Marqueur | Ce qu'il veut dire |
|---|---|
| `abstract lu` | Seule la page d'abstract arXiv a été ouverte. Les chiffres absents de l'abstract ne sont pas affirmables. |
| `HTML complet lu` / `HTML lu` | Le HTML du papier a été ouvert (parfois par tranches, cf. lacunes). |
| `Opinion de praticien` | Page de hub pédagogique, pas un résultat mesuré. |
| `Fait vérifié à la source` | Affirmation factuelle lue directement sur la page de l'éditeur. |
| `à vérifier` | La note ne l'a **pas** établi. À ne jamais reprendre comme une assertion. |
| `Inférence de la note` | Raisonnement de l'auteur de la note, pas une affirmation de la source. |

### Caveat de précision — valable pour tous les chiffres de ce fichier

WebFetch fait passer chaque page par un petit modèle de résumé. **Les chiffres et citations ci-dessous
sont des extractions de ce modèle à partir de la page réelle, non une lecture caractère par caractère** ;
les valeurs de tables n'ont pas été relues cellule par cellule sur le PDF. Chaque chiffre est cité avec
sa source (et son numéro de table quand il y en a un) pour être revérifiable. **Un chiffre qui porte une
décision se relit sur le PDF.** Un cas concret s'est produit dans la session d'origine : la première
extraction de la taxonomie du Prompt Report donnait un décompte approximatif, corrigé par une seconde
lecture ciblée des intitulés littéraux.

### Caveat de génération de modèle — valable pour tout le fichier

La très grande majorité des résultats canoniques listés ici a été mesurée sur des modèles de **2021–2023**
(GPT-2, GPT-3 `text-davinci-002` / `code-davinci-002`, PaLM 540B, LLaMA-2, Flan-T5, Claude-1.3,
GPT-3.5-Turbo). **Aucune de ces mesures ne vaut telle quelle pour un modèle frontier de 2026 sans nouvelle
mesure.** Deux sources documentent explicitement cette non-transférabilité : le *Prompting Science
Report 2* (CoT) et *Mind Your Step* (CoT sur o1-preview). **Aucune source lue ne mesure une technique de
prompting sur un modèle frontier 2026** (Claude Opus/Sonnet 2026, GPT-5.x, Gemini 3.x) : la strate la plus
récente lue est août 2025.

---

## 1. La taxonomie académique, telle que la source l'énonce

Source unique : *The Prompt Report* (Schulhoff et al.), [arXiv:2406.06608](https://arxiv.org/abs/2406.06608),
version courante **v6 du 26 février 2025** (historique : v1 2024-06-06, v2 2024-06-17, v3 2024-07-15,
v4 2024-12-23, v5 2024-12-30, v6 2025-02-26) — `abstract lu`, consulté 2026-11-09.

> **Précision de statut, ajoutée le 09/11/2026.** Les dates de versions ci-dessus ne figurent **pas**
> dans l'abstract : sur une notice arXiv elles vivent dans le bloc **« Submission history »** de la même
> page — structure vérifiée ce jour sur `arxiv.org/abs/2307.03172`, **la notice 2406.06608 n'ayant pas
> été rouverte**.
> C'est le cas où **une seule URL suffit** : sur arXiv, la page de la notice **est** le registre des
> versions, donc la page où l'on cherche et la page qui fait foi sont la même. *À ne pas « corriger »
> en y ajoutant une seconde URL : il n'y en a pas d'autre à citer.* La règle des deux URL vaut quand
> l'absence est constatée ailleurs que là où l'éditeur publie — ce qui est le cas de la révision MCP
> (voir `README §5.3`), pas celui-ci.

### Les cinq familles de techniques textuelles

Intitulés **littéraux** des sous-sections de la section 2.2 (*Text-Based Techniques*), relus dans une
seconde passe ciblée du HTML v6 — [arXiv:2406.06608v6, `HTML lu`, intitulés 2.2.1–2.2.5](https://arxiv.org/html/2406.06608v6),
consulté 2026-11-09 :

| § | Intitulé littéral | Compte de techniques (approximatif) |
|---|---|---|
| 2.2.1 | **In-Context Learning (ICL)** | ≈ 14 — few-shot et zero-shot, dont *role prompting*, *style prompting*, *emotion prompting* |
| 2.2.2 | **Thought Generation** | ≈ 11 — CoT et ses variantes zero-shot / few-shot |
| 2.2.3 | **Decomposition** | 9 |
| 2.2.4 | **Ensembling** | 10 |
| 2.2.5 | **Self-Criticism** | 6 |

**Il y en a cinq, et non six.** Le **zero-shot n'est pas une famille autonome** : il est traité à
l'intérieur d'ICL. *(La note d'origine a corrigé ici une hypothèse de six familles qui ne correspond pas
au papier — suivre les intitulés ci-dessus, pas une mémoire de six familles.)*

### Trois caveats à ne pas détacher de cette taxonomie

- **« 58 techniques » est une revendication de l'abstract**, pas un décompte vérifié section par section.
  L'abstract annonce « 33 vocabulary terms » et une taxonomie de 58 techniques de prompting textuel pour
  LLM, plus 40 techniques pour d'autres modalités — [arXiv:2406.06608, `abstract lu`](https://arxiv.org/abs/2406.06608).
- **Les comptes par sous-section sont approximatifs** : estimés depuis la table des matières par
  l'extraction automatique, non recomptés un à un. Total ≈ 50 contre 58 annoncés ; **l'écart n'est pas
  résolu par le texte lu** — [arXiv:2406.06608v6, `HTML lu`](https://arxiv.org/html/2406.06608v6). **À vérifier.**
- **La section *Limitations* formelle du Prompt Report n'a pas été lue.** Deux lectures par offset
  (250 000 et 350 000 caractères) sont tombées sur les références et les annexes. Tout caveat formel
  (accord inter-annotateurs, protocole PRISMA, limites du benchmark de techniques) est **à vérifier**.

### Scope déclaré du review

Limité aux *prefix prompts*, aux *hard (discrete) prompts* et aux techniques *task-agnostic* ; les méthodes
à base de gradient (fine-tuning) sont **exclues** —
[arXiv:2406.06608v6, `HTML lu`, « Scope of Study »](https://arxiv.org/html/2406.06608v6).

### Caveats du corpus (datasheet, annexe)

Le dataset contient 1 565 papiers de recherche en PDF ; la déduplication était automatique et des doublons
pourraient subsister ; la collecte semi-automatisée a pu faire entrer des papiers non pertinents et en
manquer de pertinents ; tous les papiers collectés étaient en anglais, certains ayant pu être exclus faute
de traduction — [arXiv:2406.06608v6, `HTML lu`, annexe datasheet](https://arxiv.org/html/2406.06608v6).

---

## 2. Tableau central — par technique : source, modèles, effet, conditions de nuisance

**Rappel du caveat de précision** : valeurs extraites par un modèle de résumé depuis les pages, non relues
cellule par cellule.

| Technique | Papier source (URL, date de consultation) | Modèles testés | Effet mesuré | Quand ça nuit |
|---|---|---|---|---|
| **Few-shot / ICL — instabilité** | [arXiv:2102.09690](https://arxiv.org/abs/2102.09690) *Calibrate Before Use*, ICML 2021 — `abstract lu`, 2026-11-09 | GPT-2, GPT-3 | Le format du prompt, le choix et l'**ordre** des exemples font varier l'accuracy du quasi-hasard au quasi état de l'art ; la *contextual calibration* gagne jusqu'à **+30,0 points absolus** en moyenne et réduit la variance | La technique elle-même est la source du risque : un mauvais tirage d'exemples ramène au hasard ; biais du modèle vers les réponses en fin de prompt et vers celles fréquentes en pré-entraînement |
| **Few-shot — ordre des exemples** | [arXiv:2104.08786](https://arxiv.org/abs/2104.08786) *Fantastically Ordered Prompts* — `abstract lu`, 2026-11-09 | Famille GPT, toutes tailles disponibles à l'époque (noms/paramètres non lus) ; 11 tâches de classification de texte | L'ordre seul « can make the difference between near state-of-the-art and random guess » ; la sélection d'ordres par entropie donne **≈ +13 % relatif** | L'effet **ne dépend pas** d'un sous-ensemble d'exemples et **ne transfère pas** d'un modèle à l'autre : un ordre optimisé pour un modèle est sans valeur pour un autre |
| **Format / séparateurs / template** | [arXiv:2310.11324](https://arxiv.org/abs/2310.11324) *FormatSpread* — `abstract lu`, 2026-11-09 | « several widely used open-source LLMs » ; LLaMA-2-13B nommé | Les auteurs décrivent plusieurs LLM open-source répandus comme « extremely sensitive to subtle changes in prompt formatting » en few-shot ; écarts d'accuracy **jusqu'à 76 points** sur LLaMA-2-13B ; la sensibilité **persiste** quand la taille augmente, quand on ajoute des exemples, et après instruction tuning | Rapporter une seule accuracy pour un format unique est trompeur : les auteurs recommandent de rapporter un **intervalle** sur les formats plausibles |
| **Template / in-context learning** | [arXiv:2401.06766](https://arxiv.org/abs/2401.06766) — `abstract lu`, 2026-11-09 | **21 modèles de 770M à 70B**, 4 datasets de classification standard | Un mauvais template fait tomber même les meilleurs modèles « to a random guess level » ; le meilleur template **ne transfère pas** entre setups ni même entre modèles d'une même famille ; les *Template Ensembles* relèvent la moyenne | Choisir et figer un template « optimal » est un piège : la pratique d'évaluation qui ignore le template produit des résultats trompeurs |
| **Chain-of-Thought (few-shot)** | [arXiv:2201.11903](https://arxiv.org/abs/2201.11903) Wei et al., soumis janvier 2022, v6 janvier 2023 — `abstract lu`, 2026-11-09 | « three large language models » (non nommés dans l'abstract) ; un modèle **540B** avec 8 exemplars CoT | État de l'art sur **GSM8K** avec le 540B + 8 exemplars, dépassant un GPT-3 fine-tuné avec vérificateur ; tâches : arithmétique, commonsense, symbolique. **Aucun pourcentage dans l'abstract** | L'abstract conditionne l'effet à des modèles « sufficiently large » : rien n'est promis aux petits modèles |
| **Zero-shot CoT (« Let's think step by step »)** | [arXiv:2205.11916](https://arxiv.org/abs/2205.11916) Kojima et al., NeurIPS 2022 — `abstract lu`, 2026-11-09 | **InstructGPT `text-davinci-002`** et **PaLM 540B** | `text-davinci-002` : **MultiArith 17,7 % → 78,7 %** ; **GSM8K 10,4 % → 40,7 %** ; ordres de grandeur similaires rapportés sur PaLM 540B. Bancs : MultiArith, GSM8K, AQUA-RAT, SVAMP, Last Letter, Coin Flip, Date Understanding, Shuffled Objects | Mesuré uniquement sur des tâches arithmétiques / symboliques / logiques, sur des modèles de 2022 ; voir § 3 pour les dégradations |
| **Self-consistency** | [arXiv:2203.11171](https://arxiv.org/abs/2203.11171) — `abstract lu`, 2026-11-09 | « pre-trained large language models » ; les notes de version indiquent l'ajout de **PaLM** (v2) et **UL2** (v3) | Gains sur CoT : **GSM8K +17,9 %**, **SVAMP +11,0 %**, **AQuA +12,2 %**, **StrategyQA +6,4 %**, **ARC-challenge +3,9 %** | Le gain décroît nettement hors arithmétique (ARC +3,9 points contre GSM8K +17,9) ; coût multiplié par le nombre de chemins échantillonnés (non chiffré dans l'abstract) |
| **Least-to-most (décomposition)** | [arXiv:2205.10625](https://arxiv.org/abs/2205.10625) — `abstract lu`, 2026-11-09 | **GPT-3 `code-davinci-002`**, 14 exemplars | **≥ 99 % sur SCAN**, tous les splits dont le *length split*, contre **16 % pour le CoT** dans les mêmes conditions ; à comparer aux modèles neuro-symboliques entraînés sur > 15 000 exemples | Démontré sur un benchmark de généralisation compositionnelle très structuré ; l'abstract ne donne pas les chiffres pour les tâches symboliques et mathématiques |
| **ReAct (raisonnement + action)** | [arXiv:2210.03629](https://arxiv.org/abs/2210.03629) — `abstract lu`, 2026-11-09 | Non nommés dans l'abstract ; 1 à 2 exemples in-context | **ALFWorld : +34 points** de success rate absolu sur l'imitation learning ; **WebShop : +10 points** sur le RL ; réduit l'hallucination et la propagation d'erreur par rapport au CoT via une API Wikipedia | Les chiffres HotpotQA et Fever ne sont **pas** dans l'abstract — **à vérifier** ; bénéfice conditionné à l'existence d'un outil de récupération fiable |
| **Reflexion / self-critique** | [arXiv:2303.11366](https://arxiv.org/abs/2303.11366) — `abstract lu`, 2026-11-09 | GPT-4 cité comme état de l'art antérieur ; le modèle des agents Reflexion n'est pas nommé dans l'abstract | **HumanEval pass@1 : 91 %** contre **80 %** pour GPT-4 | Les chiffres AlfWorld et HotPotQA ne figurent pas dans l'abstract — **à vérifier** ; la boucle suppose un **signal de feedback** exploitable (tests unitaires sur HumanEval) : sans oracle, la base empirique du gain disparaît |
| **Retrieval-augmented generation (RAG)** | [arXiv:2005.11401](https://arxiv.org/abs/2005.11401) Lewis et al. — `abstract lu`, 2026-11-09 | Un seq2seq pré-entraîné + un retriever neuronal dense + index vectoriel Wikipedia (**aucun nom de modèle dans l'abstract**) | État de l'art sur **trois tâches de QA open-domain** ; langage plus spécifique, divers et factuel qu'une baseline paramétrique seule | **Aucun dataset nommé ni aucune valeur de métrique dans l'abstract** — les chiffres sont **à vérifier** dans le PDF |
| **Ensembling** | Famille identifiée dans la taxonomie du Prompt Report (10 techniques) — [arXiv:2406.06608v6, `HTML lu`](https://arxiv.org/html/2406.06608v6) ; instance mesurée : *Template Ensembles*, [arXiv:2401.06766](https://arxiv.org/abs/2401.06766), 2026-11-09 | 21 modèles 770M–70B | Les *Template Ensembles* (agrégation sur plusieurs templates, en test-time augmentation) **relèvent la moyenne** et sont robustes au tirage aléatoire des templates (pas de chiffre dans l'abstract) | Coût multiplié par le nombre de membres de l'ensemble ; magnitude non chiffrée dans ce qui a été lu |
| **Zero-shot (baseline)** | Pas de « papier canonique » unique : la famille *zero-shot* est une sous-section d'ICL dans la taxonomie — [arXiv:2406.06608v6, `HTML lu`](https://arxiv.org/html/2406.06608v6), 2026-11-09 | — | Sert de baseline à toutes les mesures ci-dessus (ex. GSM8K 10,4 % en zero-shot direct sur `text-davinci-002`, [arXiv:2205.11916](https://arxiv.org/abs/2205.11916)) | — |

### Inférences de la note sur ce tableau

- **Gradient de solidité.** Le plus solide est le résultat *négatif* sur la sensibilité (ordre, format,
  template), mesuré sur 21 modèles et 11–4 datasets, avec des amplitudes énormes et une
  non-transférabilité explicite. Le plus fragile est le résultat *positif* sur les techniques agentiques
  (ReAct, Reflexion), dont les abstracts ne nomment même pas les modèles.
- Les gains CoT / self-consistency sont **concentrés sur l'arithmétique**. La comparaison interne de
  self-consistency (GSM8K +17,9 contre ARC-challenge +3,9), dans un seul papier et sur un seul modèle, est
  la démonstration la plus propre de cette concentration.
- **Gabarit honnête pour toute affirmation « technique X donne +N % »** (formulation de l'auteur de la
  note, pas une citation) : `+N % mesuré sur <modèle>, <date>, <classe de tâche> ; non reproduit sur un
  modèle frontier 2026 à ma connaissance`.

### Lacunes de ce tableau

- **Label balance en few-shot** : aucun papier mesurant spécifiquement l'effet de la distribution des
  labels dans les exemples n'a été lu. *Calibrate Before Use* mentionne le biais vers les réponses
  fréquentes, mais l'abstract lu ne chiffre pas la distribution des labels — **à vérifier** (chercher
  Min et al. 2022, *Rethinking the Role of Demonstrations*).
- **Décomposition** au sens large : la famille compte 9 techniques, mais une seule source canonique
  mesurée a été lue (least-to-most).
- Chiffres manquants exigeant la lecture des PDF : HotpotQA/Fever de ReAct, AlfWorld/HotPotQA de
  Reflexion, datasets et métriques de RAG, pourcentages de Wei et al.

---

## 3. Ce qui s'effondre à la mesure

C'est la zone la mieux documentée, et celle qui contredit le plus directement les hubs de praticiens.

### 3.1 Persona / role prompting — n'améliore pas l'accuracy factuelle

- Les auteurs concluent qu'« adding personas in system prompts does not improve model performance » sur un
  éventail de questions, comparé à un contrôle sans persona —
  [arXiv:2311.10054 *When "A Helpful Assistant" Is Not Really Helpful*, Zheng et al., v3, Findings of
  EMNLP 2024, lu](https://arxiv.org/abs/2311.10054), consulté 2026-11-09.
- Échelle : **162 personas** (6 types de relations interpersonnelles, 8 domaines d'expertise),
  **2 410 questions factuelles**, **4 familles de LLM populaires** (non nommées sur la page lue) —
  [arXiv:2311.10054](https://arxiv.org/abs/2311.10054).
- Le genre, le type et le domaine du persona peuvent affecter l'accuracy, mais **identifier
  automatiquement le meilleur persona est difficile** et les prédictions ne font souvent pas mieux qu'une
  sélection aléatoire ; les auteurs concluent que l'effet d'un persona donné est **largement aléatoire** —
  [arXiv:2311.10054](https://arxiv.org/abs/2311.10054).
- **Divergence la plus franche avec les hubs** : le *role prompting* figure dans la taxonomie du Prompt
  Report comme technique d'ICL ([`HTML lu`](https://arxiv.org/html/2406.06608v6)), il est massivement
  enseigné, et la mesure la plus large lue conclut qu'il n'améliore pas l'accuracy.

### 3.2 Menaces et pourboires — aucun effet significatif

- Testés sur **GPQA** et **MMLU-Pro** : « generally no significant effect on benchmark performance ». Les
  auteurs testaient explicitement la déclaration de Sergey Brin selon laquelle les modèles font mieux quand
  on les menace. En revanche, **les variations de prompt changent significativement les réponses question
  par question**, et les auteurs écrivent qu'il est difficile de savoir à l'avance si une approche de
  prompting donnée aidera ou nuira —
  [arXiv:2508.00614 *Prompting Science Report 3: I'll pay you or I'll kill you*, Meincke, Mollick, Mollick
  & Shapiro, août 2025, `abstract lu`](https://arxiv.org/abs/2508.00614), consulté 2026-11-09.
- **Modèles testés non nommés** sur la page lue, et **ni tailles d'effet ni p-values** : seul le
  qualificatif « no significant effect ». **À vérifier** dans le PDF.

### 3.3 « Tips » et formules magiques — l'attribution ne survit pas à la vérification

**Attribution n° 1, non vérifiable sur la page lue — « Take a deep breath » attribuée à OPRO.**
La formule « Take a deep breath and work on this problem step-by-step » est popularisée par OPRO.
**La page d'abstract d'OPRO lue ne mentionne pas cette phrase.** Ce que la page énonce réellement : les
meilleurs prompts optimisés par OPRO dépassent les prompts conçus par des humains « up to 8% on GSM8K » et
jusqu'à 50 % sur des tâches Big-Bench Hard, « across a variety of LLMs » ; **aucun modèle n'est nommé, et
aucune baseline n'est donnée** — [arXiv:2309.03409 *Large Language Models as Optimizers*,
`abstract lu`](https://arxiv.org/abs/2309.03409), consulté 2026-11-09.
→ Ce qu'on peut dire : OPRO rapporte un gain d'optimisation automatique de prompt, sans modèle nommé.
Ce qu'on ne peut pas dire : qu'OPRO établit l'efficacité de cette phrase.

**Attribution n° 2, démentie par la page lue — « le CoT fait chuter l'accuracy de 36,3 points ».**
Le chiffre existe, mais il ne mesure pas ce qu'on lui fait dire. *Mind Your Step (by Step)* rapporte que
sur trois des six tâches issues de la psychologie cognitive où la délibération dégrade la performance
humaine, les modèles de pointe régressent significativement, **la chute maximale étant mesurée pour
OpenAI o1-preview comparé à GPT-4o** — [arXiv:2410.21333, `abstract lu`](https://arxiv.org/abs/2410.21333),
consulté 2026-11-09. C'est **une comparaison entre modèles, et non un delta avec/sans CoT à modèle
constant**. La page lue ne permet pas d'isoler la part attribuable au CoT lui-même : **à vérifier dans le
PDF.** Sur les trois autres tâches, l'effet est positif, neutre ou négatif. Les auteurs posent eux-mêmes le
caveat que modèles et humains ne raisonnent pas en parallèle parfait. Les six tâches ne sont pas nommées
sur la page lue.

**À ne pas reprendre** (snippets non ouverts, cf. § 6) : « +15 % grâce au formatage XML » ;
Llama-3.1-70B-Instruct passant de 85,6 % à 77,3 % sous CoT ; « sur ~25 recommandations des guides, 4
seulement comportent un critère quantifiable ».

### 3.4 CoT : là où il n'aide pas, et là où il coûte sans payer

- Méta-analyse de **plus de 100 papiers** utilisant le CoT + évaluations propres sur **20 datasets et 14
  modèles** : les gains sont « strong performance benefits primarily on tasks involving math or logic »,
  avec « much smaller gains on other types of tasks » —
  [arXiv:2409.12183 *To CoT or not to CoT?*, `abstract lu`](https://arxiv.org/abs/2409.12183), consulté
  2026-11-09. Les modèles ne sont **pas nommés** dans l'abstract.
- Sur **MMLU**, répondre directement sans CoT est presque aussi précis que le CoT, **sauf** si la question
  ou la réponse contient un signe égal, que les auteurs lisent comme un marqueur de raisonnement
  symbolique — [arXiv:2409.12183, `abstract lu`](https://arxiv.org/abs/2409.12183).
- En séparant planification et exécution, l'essentiel du gain du CoT vient d'une **meilleure exécution
  symbolique** ; le CoT reste en dessous d'un solveur symbolique —
  [arXiv:2409.12183, `abstract lu`](https://arxiv.org/abs/2409.12183).
- **Modèles non-reasoning** : le CoT explicite améliore la performance moyenne « by a small amount »,
  surtout si le modèle ne raisonne pas pas-à-pas par défaut ; il **ajoute de la variabilité** et peut
  provoquer des erreurs sur des questions correctement répondues autrement ; il demande généralement
  beaucoup plus de tokens, donc plus de coût et de temps, que les réponses directes —
  [arXiv:2506.07142 *Prompting Science Report 2: The Decreasing Value of Chain of Thought*, Meincke,
  Mollick, Mollick & Shapiro, soumis 2025-06-08, `abstract lu`](https://arxiv.org/abs/2506.07142),
  consulté 2026-11-09.
- **Beaucoup de modèles récents font déjà une forme de CoT sans qu'on le demande**, donc la demande
  explicite change peu de chose pour eux —
  [arXiv:2506.07142, `abstract lu`](https://arxiv.org/abs/2506.07142).
- **Reasoning models** : le CoT explicite donne « only marginal, if any, gains in answer accuracy » tout en
  augmentant significativement le temps et les tokens —
  [arXiv:2506.07142, `abstract lu`](https://arxiv.org/abs/2506.07142). Le titre du rapport est la thèse.
- **Modèles exacts testés par les rapports Wharton (Reports 2 et 3) : non nommés sur les pages
  d'abstract lues. À vérifier** — c'est précisément la question de la génération de modèle.

### 3.5 Le résultat négatif que les auteurs de la taxonomie documentent eux-mêmes

Étude de cas du Prompt Report (annexe A.7) — **notes informelles d'un seul prompt engineer** sur une tâche
de détection d'« entrapment » : l'ajout de raisonnements générés par AutoCoT n'a pas amélioré les résultats
(« performance didnt really improve ») et l'ajout de shots sans raisonnement a dégradé
(« bad results ») ; en revanche donner des exemples **avec** raisonnement a semblé aider —
[arXiv:2406.06608v6, `HTML lu`, annexe A.7](https://arxiv.org/html/2406.06608v6), consulté 2026-11-09.
C'est le meilleur élément pour désamorcer la lecture « une technique = un gain » : les auteurs du catalogue
documentent une technique du catalogue qui n'a pas aidé.

### 3.6 Ce que les hubs omettent (opinion de praticien, pas un fait)

- `Opinion de praticien.` promptingguide.ai enseigne **18 techniques** (Zero-shot, Few-shot,
  Chain-of-Thought, Meta Prompting, Self-Consistency, Generate Knowledge Prompting, Prompt Chaining, Tree
  of Thoughts, Retrieval Augmented Generation, Automatic Reasoning and Tool-use, Automatic Prompt Engineer,
  Active-Prompt, Directional Stimulus Prompting, Program-Aided Language Models, ReAct, Reflexion,
  Multimodal CoT, Graph Prompting) — [promptingguide.ai/techniques, lu](https://www.promptingguide.ai/techniques),
  consulté 2026-11-09. Sur la page d'index : **aucune citation de papier, aucun caveat** sur les tailles
  d'effet ni les générations de modèles.
- `Opinion de praticien.` Sur sa page CoT, le guide **cite bien** Wei et al. (2022), Kojima et al. (2022),
  Zhang et al. (2022), mais **ne nomme aucun modèle** (« sufficiently large language models ») et **ne
  mentionne pas** que le CoT peut ne pas aider hors math/logique ; ses exemples sont arithmétiques. Il
  signale en revanche que les chaînes générées automatiquement peuvent contenir des erreurs —
  [promptingguide.ai/techniques/cot, lu](https://www.promptingguide.ai/techniques/cot), consulté 2026-11-09.
- `Opinion de praticien.` learnprompting.org : guide gratuit open-source visant surtout un public non
  technique ; sa page d'introduction **ne rapporte aucun gain de performance mesuré** ; son chiffre de
  « ~50 % des autres cours utilisent notre contenu » est une estimation déclarée —
  [learnprompting.org/docs/introduction, lu](https://learnprompting.org/docs/introduction), consulté 2026-11-09.
- `Fait vérifié à la source.` **Sander Schulhoff** est à la fois premier auteur de *The Prompt Report* et
  dirigeant de LearnPrompting — [learnprompting.org/docs/introduction, lu](https://learnprompting.org/docs/introduction).
- `Inférence de la note` : **il n'y a pas deux mondes séparés.** La divergence hub/littérature n'est pas un
  conflit de camps mais une **perte d'information dans la traduction** du papier vers la page pédagogique,
  qui porte sur trois omissions systématiques : (1) la **classe de tâches** mesurée, (2) la **génération de
  modèles**, (3) les **conditions d'échec**.
- **Limite de ce constat** : il est établi sur la page d'index et la page CoT de promptingguide.ai, **pas**
  sur les 17 autres pages de technique. Ne pas le généraliser à tout le site sans vérification.

---

## 4. Le confondant de premier ordre : la sensibilité au format du prompt

La sensibilité au formatage est le résultat le mieux établi et le plus reproduit du domaine, **avec des
amplitudes qui dépassent les gains de presque n'importe quelle « technique » du catalogue**.

| Dimension | Amplitude mesurée | Modèles / échelle | Source (consultée 2026-11-09) |
|---|---|---|---|
| **Format / séparateurs** (few-shot) | **jusqu'à 76 points** d'écart d'accuracy | LLaMA-2-13B ; « several widely used open-source LLMs » | [arXiv:2310.11324](https://arxiv.org/abs/2310.11324), `abstract lu` |
| **Template** | un mauvais template ramène les meilleurs modèles « to a random guess level » | **21 modèles de 770M à 70B**, 4 datasets de classification | [arXiv:2401.06766](https://arxiv.org/abs/2401.06766), `abstract lu` |
| **Ordre des exemples** | du quasi-hasard au quasi état de l'art ; sélection par entropie **≈ +13 % relatif** | famille GPT, 11 tâches de classification | [arXiv:2104.08786](https://arxiv.org/abs/2104.08786), `abstract lu` |
| **Calibration du biais de format/ordre** | *contextual calibration* : **jusqu'à +30,0 points absolus** en moyenne | GPT-2, GPT-3 | [arXiv:2102.09690](https://arxiv.org/abs/2102.09690), `abstract lu` |
| **Position dans le contexte long** | jusqu'à **−22,0 points** (voir détail ci-dessous) | GPT-3.5-Turbo, Claude-1.3, LongChat, MPT-30B | [arXiv:2307.03172v3](https://arxiv.org/html/2307.03172v3), `HTML complet lu` |

### Dégradation positionnelle, chiffrée

Multi-document QA, 20 documents, meilleure position index 0 contre pire position index 9 —
[arXiv:2307.03172v3, `HTML complet lu`](https://arxiv.org/html/2307.03172v3), consulté 2026-11-09.
**Ces valeurs sont des extractions du modèle de résumé depuis le HTML, non relues cellule par cellule :**
à recontrôler sur le PDF si un chiffre porte une décision.

| Modèle | Delta | Détail |
|---|---|---|
| GPT-3.5-Turbo | **−22,0 points** | 75,8 % → 53,8 % |
| GPT-3.5-Turbo 16K | **≈ −22,6 points** | 75,7 % → 54,1 % |
| LongChat-13B 16K | **−16,1 points** | 68,6 % → 52,5 % |
| MPT-30B-Instruct | **−4,5 points** | 56,3 % → 51,8 % |
| Claude-1.3 | **−4,2 points** | 60,1 % → 55,9 % |

Qualitativement, la performance « can degrade significantly when changing the position of relevant
information » ; elle est « often highest when relevant information occurs at the beginning or end » et se
dégrade au milieu, « even for explicitly long-context models » —
[arXiv:2307.03172, Liu et al., v3 novembre 2023, TACL 2023, `abstract lu`](https://arxiv.org/abs/2307.03172).
Modèles testés : MPT-30B-Instruct, LongChat-13B 16K, GPT-3.5-Turbo et GPT-3.5-Turbo 16K, Claude-1.3 et
Claude-1.3 100K ; plus, sur un sous-ensemble, GPT-4 8K, Llama-2 7B/13B/70B, Flan-T5-XXL et Flan-UL2 —
[arXiv:2307.03172v3, `HTML complet lu`](https://arxiv.org/html/2307.03172v3).

### La conséquence

- `Inférence de la note` : les amplitudes de sensibilité (76 points de formatage, 22 points de position)
  sont **plus grandes que les gains revendiqués par presque toutes les techniques du catalogue**. La
  variance de formatage est donc un **confondant de premier ordre**, et **tout gain de technique rapporté
  sans intervalle sur les formats plausibles est suspect**. C'est aussi la recommandation explicite des
  auteurs de FormatSpread : rapporter un **intervalle**, pas une valeur unique
  ([arXiv:2310.11324](https://arxiv.org/abs/2310.11324)).
- **La sensibilité ne disparaît ni avec l'échelle ni avec l'instruction tuning** : elle persiste quand la
  taille augmente et après instruction tuning ([arXiv:2310.11324](https://arxiv.org/abs/2310.11324)).
  C'est un contre-argument mesuré à l'idée que « les modèles récents sont assez bons pour que le format
  n'importe plus ».
- `Inférence de la note` : l'ampleur très inégale de l'effet de position entre modèles (−22 pour
  GPT-3.5-Turbo contre −4,2 pour Claude-1.3, **dans la même étude**) est un argument direct contre la
  généralisation d'un effet de prompting d'un modèle à l'autre, **même à la même date**.
- **Les optima ne transfèrent pas** : un ordre d'exemples optimisé pour un modèle ne se transporte pas à un
  autre ([arXiv:2104.08786](https://arxiv.org/abs/2104.08786)) ; le meilleur template ne transfère ni entre
  setups ni entre modèles d'une même famille ([arXiv:2401.06766](https://arxiv.org/abs/2401.06766)).

### Ce que cette section ne couvre pas

- **Placement de l'instruction** (avant vs après le contexte) : **aucune source mesurant cela n'a été
  lue.** **À vérifier.**
- **Séparateurs au sens strict** (`###`, XML, délimiteurs Markdown) : non isolés par les sources lues ;
  arXiv:2401.06766 porte sur le template global et son abstract ne décrit pas le choix de séparateur. Le
  chiffre « +15 % grâce au formatage XML » qui circule vient d'un snippet renvoyant vers un résumé non
  vérifié — **à vérifier, ne pas reprendre.**
- *Lost in the Middle* est mesuré sur des modèles de 2023. **Aucune source lue ne mesure l'effet de
  position sur un modèle frontier 2025-2026. À vérifier.**

---

## 5. Non réconcilié

Conflits réels de la littérature, présentés comme non tranchés. **Ne pas arbitrer.**

### 5.1 Les appels émotionnels

| Résultat | Stimulus | Bancs | Modèles | Source |
|---|---|---|---|---|
| **Gain** : +8,00 % relatif sur Instruction Induction, **+115 % sur BIG-Bench**, +10,9 % en moyenne dans une étude humaine à 106 participants (performance, véracité, responsabilité) sur les tâches génératives | EmotionPrompt (stimuli émotionnels) | 45 tâches ; Instruction Induction, BIG-Bench | **6 modèles de 2023** : Flan-T5-Large, Vicuna, Llama 2, BLOOM, ChatGPT, GPT-4 | [arXiv:2307.11760](https://arxiv.org/abs/2307.11760), `abstract lu`, 2026-11-09 |
| **Aucun effet significatif** | menaces, pourboires | GPQA, MMLU-Pro | **non nommés** sur la page lue (2025) | [arXiv:2508.00614](https://arxiv.org/abs/2508.00614), `abstract lu`, 2026-11-09 |
| **Effet dépendant de la langue** : « impolite prompts often result in poor performance », mais la politesse excessive ne garantit pas de meilleurs résultats ; le niveau optimal dépend de la langue (anglais, chinois, japonais), relié par les auteurs à des différences culturelles | politesse | tâches en anglais, chinois, japonais | **non nommés** sur la page lue | [arXiv:2402.14531 *Should We Respect LLMs?*, v2 octobre 2024](https://arxiv.org/abs/2402.14531), `abstract lu`, 2026-11-09 |

**Pourquoi ce n'est pas réconciliable avec ce qui a été lu** : les trois résultats ne portent ni sur les
mêmes stimuli, ni sur les mêmes modèles, ni sur les mêmes bancs.
`Inférence de la note, hypothèse non testée` : l'hypothèse la plus économique est que les gains émotionnels
mesurés en 2023 sur des modèles faibles ont disparu sur les modèles plus récents et sur des bancs plus
difficiles — **mais aucune source lue ne teste cette hypothèse directement.** Elle reste une hypothèse.

**Le point le plus opérationnel du *Report 3*** n'est pas « ça ne marche pas » mais « **ça bouge question
par question sans qu'on puisse le prévoir** » : c'est un argument mesuré en faveur de l'évaluation plutôt
que de la recette — [arXiv:2508.00614](https://arxiv.org/abs/2508.00614).

### 5.2 Self-enhancement bias du juge LLM — traité ailleurs

Ce conflit (Zheng et al. refusant de conclure contre arXiv:2410.21819 concluant à un biais significatif)
**n'appartient pas à la note 03** : il est documenté dans la note 05. Pour ne pas importer dans ce fichier
une affirmation absente de sa source, il est traité dans
[`05-evals-prompt-ops.md`](./05-evals-prompt-ops.md), section LLM-as-judge.

### 5.3 Ligne de fracture proposée par la note (inférence, pas un résultat)

`Inférence de la note` : la ligne n'est pas « technique utile / technique inutile » mais **« technique qui
change le calcul » contre « technique qui change le ton »**. Les familles qui survivent à la mesure (CoT sur
math/logique, décomposition, self-consistency, RAG, outils) modifient ce que le modèle **calcule**. Les
familles qui s'effondrent (persona, menaces, pourboires) ne modifient que l'**enrobage social**.

---

## 6. À vérifier

Repris de la note 03 sans promotion. Aucun de ces points n'est une assertion.

### Lacunes majeures de la note

1. **Aucune mesure lue sur un modèle frontier 2026.** Toute la note décrit l'état de la preuve au mieux à
   août 2025. **Toute extrapolation à 2026 est à vérifier.**
2. La section ***Limitations* du Prompt Report n'a pas été lue** (offsets 250 000 et 350 000 sont tombés
   sur les références et annexes). Accord inter-annotateurs, protocole PRISMA, limites du benchmark de
   techniques : à vérifier.
3. Les **modèles testés par les rapports Wharton (Reports 2 et 3)** et par ***To CoT or not to CoT*** ne
   sont pas nommés sur les pages lues.
4. **Placement de l'instruction** (avant/après le contexte) : aucune source mesurée trouvée.
5. **Label balance en few-shot** : aucune source mesurée lue.
6. **r/PromptEngineering et Latent Space** : aucune page ouverte, tout ce qui les concerne est à vérifier.
7. Chiffres détaillés exigeant la lecture des PDF : ReAct (HotpotQA, Fever), Reflexion (AlfWorld,
   HotPotQA), RAG (datasets et métriques), Wei et al. (pourcentages).

### Points précis

- Écart **58 techniques annoncées vs ≈ 50 dénombrées** dans la table des matières : non expliqué par ce qui
  a été lu.
- Détail du **benchmark de techniques** du Prompt Report (quel modèle, quelle tâche, quels gains comparés) :
  non lu.
- **Tailles d'effet et p-values du Report 3** : absentes de la page lue.
- ***Prompting Science Report 1*** (politesse) : non ouvert ; son contenu n'apparaît que dans un snippet.
- Les **six tâches de *Mind Your Step*** ne sont pas nommées sur la page lue ; la part du delta attribuable
  au CoT lui-même (et non à la différence o1-preview / GPT-4o) n'est pas isolable depuis la page lue.
- **arXiv:2505.11423 (*When Thinking Fails*)** : le chiffre Llama-3.1-70B-Instruct 85,6 % → 77,3 % vient
  d'un résumé secondaire, pas du papier. **Ne pas reprendre tel quel.**
- **arXiv:2502.08235 (*The Danger of Overthinking*) et arXiv:2507.00711** : snippets non ouverts.
- **Latent Space**, épisode *The Ultimate Guide to Prompting* (septembre 2024, invité Sander Schulhoff,
  description annonçant « why role-based prompting doesn't work ») : page de l'épisode et transcription
  **non ouvertes**.
- **r/PromptEngineering** : seule information, un snippet mentionnant un post d'avril 2024
  « 6 Reasons Why I Think Most Prompt Engineering Tips Are BS ». **Ne rien affirmer sans ouvrir des fils.**
- « Sur ~25 recommandations des guides, 4 seulement comportent un critère quantifiable » : snippet
  renvoyant à des blogs et à un log de recherche généré par IA — **source non ouverte, non fiable, à ne pas
  reprendre.**
- Les pages individuelles des **17 autres techniques de promptingguide.ai** n'ont pas été lues : le constat
  « pas de tailles d'effet » n'est pas généralisable à tout le site.
