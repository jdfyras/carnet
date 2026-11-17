# 05 — Evals et prompt operations : savoir si un prompt marche, le versionner, l'optimiser

> **Base de référence embarquée dans le plugin prompts.** Pages consultées le **2026-11-09** ; à relire avant le **2027-02-09**. Un fait propre à un modèle (effort, thinking, paramètres, formulations) se relit sur la page officielle du modèle visé avant d'être affirmé : ce fichier dit où lire, pas ce qui est vrai aujourd'hui. Les renvois `→ NN` désignent les autres fichiers de ce dossier (même préfixe numérique) ; les notes de recherche citées ne sont pas publiées.


**Note source lue :** `research_notes/Prompt engineering référence 2026/05-evals-prompt-ops.md`
**Lue jusqu'à la fin** (dernière ligne : item final des *Gaps* de Q5, sur la re-validation OpenAI).
**Date : 2026-11-09.** Toutes les sources de ce fichier ont été consultées le 2026-11-09 ; la date est
répétée par affirmation.
**Périmètre :** ce fichier ne contient rien qui ne soit dans la note 05. Aucune recherche nouvelle.

---

## Marqueurs de provenance employés ici

Ceux de la note source, repris tels quels. Rien n'est promu d'un niveau au niveau supérieur.

| Marqueur | Ce qu'il veut dire |
|---|---|
| `abstract lu` | Seule la page d'abstract a été ouverte. |
| `HTML lu` / `HTML Table N` | HTML du papier ouvert ; la table est nommée pour être revérifiable. |
| `doc éditeur lue` | Page officielle du fournisseur ou de l'outil, ouverte dans la session. |
| `artefact lu` | Fichier du dépôt ou index de paquet lu directement (`package.json`, PyPI JSON, doc à la branche). |
| `Inférence de la note` | Raisonnement de l'auteur de la note, pas une affirmation de la source. |
| `à vérifier` | La note ne l'a **pas** établi. À ne jamais reprendre comme une assertion. |

### Caveat de précision — valable pour tous les chiffres de tables de ce fichier

Les valeurs de tables (GEPA Tables 1–2 et budgets de rollouts ; tables de biais de Zheng et al.) ont été
**extraites par le modèle de résumé de WebFetch à partir du HTML des papiers, et non recoupées cellule par
cellule sur le PDF**. Elles sont citées avec leur numéro de table pour être revérifiables. **Un chiffre qui
sert à décider se recontrôle sur la table.**

### Avertissement de fraîcheur

Deux produits first-party censés être au cœur des prompt ops sont **en cours de dépréciation** à la date de
consultation : la plateforme *OpenAI Evals* et les *reusable prompt objects* d'OpenAI. Tout contenu
antérieur à 2026 sur ces sujets est obsolète. Détail au § 4.

---

## 1. Ce que les fournisseurs prescrivent — et le trou méthodologique qu'ils laissent

### 1.1 Anthropic — définir le succès

- Les critères doivent être *Specific, Measurable, Achievable, Relevant* : « Accurate sentiment
  classification » plutôt que « good performance » ; les cibles se basent sur des benchmarks industriels,
  des expériences antérieures ou l'expertise métier — [Anthropic, *Define success criteria*, `doc éditeur
  lue`, consulté 2026-11-09](https://platform.claude.com/docs/en/test-and-evaluate/define-success)
- Critères chiffrés donnés par Anthropic : « Less than 0.1% of outputs out of 10,000 trials flagged for
  toxicity » ; un F1 d'au moins 0,85 sur un held-out test set de 10 000 posts Twitter divers, soit 5 %
  d'amélioration sur la baseline courante — [ibid.](https://platform.claude.com/docs/en/test-and-evaluate/define-success)
- **Critère multidimensionnel (le modèle à copier)** : F1 ≥ 0,85 **et** 99,5 % d'outputs non toxiques
  **et** 90 % des erreurs de type « inconvénient » plutôt que « erreur grave » **et** 95 % des réponses
  sous 200 ms — [ibid.](https://platform.claude.com/docs/en/test-and-evaluate/define-success)
- Métriques listées comme admissibles : F1, BLEU, perplexity, accuracy, precision, recall, response time
  (ms), uptime (%) ; côté qualitatif, échelles de Likert (ex. cohérence 1–5) et rubriques d'experts —
  [ibid.](https://platform.claude.com/docs/en/test-and-evaluate/define-success)

### 1.2 Anthropic — construire les tests et les graders

- Arbitrage volume/qualité, posé explicitement : **plus de questions avec un signal un peu plus faible en
  grading automatique vaut mieux que moins de questions notées à la main par des humains** —
  [Anthropic, *Develop tests*, `doc éditeur lue`, consulté 2026-11-09](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
- Trois familles de grading prescrites :
  - **code-based** — exact match après normalisation casse/espaces, cosine similarity d'embeddings
    Sentence-BERT, ROUGE-L en F1 ;
  - **LLM-based** — échelle de Likert 1–5 avec consigne « Output only the number », classification binaire
    oui/non (ex. détection de PHI) ;
  - **human** — rubriques d'experts, feedback utilisateur.
  — [ibid.](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
- Règle anti-auto-complaisance : « evaluate with a different model from the one used » pour produire la
  sortie — [ibid.](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
- Le grading humain est présenté comme plus coûteux, à utiliser **avec parcimonie, principalement pour
  valider les graders automatiques** — [ibid.](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
- **Edge cases obligatoires** : input non pertinent ou manquant, input très long, input utilisateur hostile
  ou de mauvaise qualité, cas ambigus où des humains seraient aussi en désaccord (sarcasme, sentiment
  mixte, typos, titres trompeurs, PHI implicite) — [ibid.](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
- **Held-out test set** explicitement recommandé « to avoid overfitting prompts to the evaluation data » —
  [ibid.](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
- **Tailles d'échantillon : par l'exemple, pas par règle** — 1 000 tweets (exact match) ; 50 groupes de
  questions paraphrasées (cosine similarity) ; 200 articles (ROUGE-L) ; 100 demandes clients (Likert de
  ton) ; 500 requêtes patients simulées (classification binaire PHI) ; 10 000 posts pour le held-out set du
  critère chiffré — [Anthropic, *Define success criteria* / *Develop tests*, `doc éditeur lue`, consulté
  2026-11-09](https://platform.claude.com/docs/en/test-and-evaluate/define-success)

### 1.3 OpenAI — mécanique de graders

Quatre types documentés, avec leurs noms exacts — [OpenAI, *Graders guide*, `doc éditeur lue`, consulté
2026-11-09](https://developers.openai.com/api/docs/guides/graders) :

| Grader | Ce qu'il fait |
|---|---|
| `string_check` | Renvoie 1 ou 0 ; opérations `eq` (exact, sensible à la casse), `neq`, `like` (containment sensible à la casse), `ilike` (insensible). **Incohérence dans la doc elle-même** : le JSON schema de la page écrit l'opérateur de non-correspondance `ne`, le texte écrit `neq`. |
| `text_similarity` | Métriques : `fuzzy_match` (rapidfuzz), `bleu`, `gleu`, `meteor`, `cosine` (embeddings `text-embedding-3-large`, evals uniquement), `rouge_1` à `rouge_5`, `rouge_l`. |
| `score_model` | Un modèle juge note la sortie sur une plage donnée et renvoie un `result` + des `steps` de raisonnement ; **une sortie non numérique vaut 0 par défaut**. |
| `python` | Fonction `grade(sample, item)` qui doit renvoyer un float ; exception ou valeur invalide ⇒ marqué invalide et noté 0. |

- Cette même page indique qu'OpenAI **déprécie les graders** dans ses workflows evals et fine-tuning —
  [ibid.](https://developers.openai.com/api/docs/guides/graders)
- Mécanique de dataset : fichier JSONL uploadé avec `purpose: "evals"`, chaque ligne enveloppant ses champs
  dans un objet `item`, conforme à l'`item_schema` du `data_source_config` ; dans l'exemple officiel chaque
  item porte un `ticket_text` et un `correct_label` **fourni par un humain** comme ground truth —
  [OpenAI, *Evals guide*, `doc éditeur lue`, consulté 2026-11-09](https://developers.openai.com/api/docs/guides/evals)

### 1.4 Le trou méthodologique — à nommer explicitement

> **NI Anthropic NI OpenAI ne donne de guidance statistique : aucune formule ou valeur minimale de taille
> d'échantillon, aucun test de significativité.**

- Côté Anthropic, les tailles d'échantillon n'existent **que sous forme d'exemples** (1 000 tweets, 200
  articles, 50 groupes…), jamais comme règle ni comme calcul de puissance —
  [Anthropic, *Define success criteria* / *Develop tests*, consulté 2026-11-09](https://platform.claude.com/docs/en/test-and-evaluate/define-success)
- Côté OpenAI, la page qualifie son fichier de trois lignes de « a small test case sample » et dit seulement
  que les evals réelles demandent « more criteria, different prompts, and different data sets », **sans
  chiffre ni méthode statistique** — [OpenAI, *Evals guide*, consulté 2026-11-09](https://developers.openai.com/api/docs/guides/evals)
- `Inférence de la note` : avec 50 cas et un écart de 4 points entre deux prompts, **aucune des deux docs ne
  dit si l'écart est du bruit**. C'est au praticien d'importer la statistique — intervalles de confiance,
  bootstrap, test de McNemar sur les paires appariées. **Rien de tel n'est prescrit par les vendeurs.**
- `Inférence de la note` : les deux fournisseurs convergent sur un point structurel — **la vérité terrain
  est fournie par un humain au moment de la construction du dataset**, pas par le modèle (`correct_label`
  chez OpenAI, held-out set labellisé chez Anthropic).
- `Inférence de la note` : le couple « volume > qualité » + « grader avec un autre modèle » implique en
  pratique un **LLM-as-judge industrialisé** — donc les biais du § 2. Anthropic prescrit l'outil **sans en
  documenter les biais** sur cette page.

**Nuance obligatoire sur ce trou** : les **52 950 derniers caractères** de *define-success* /
*develop-tests* n'ont pas été lus (limite de WebFetch). **Une guidance statistique pourrait y figurer — à
vérifier.** Le trou est établi sur ce qui a été lu, pas sur la totalité des pages.

### 1.5 Lacunes du § 1

- **La page Console / Evaluation tool d'Anthropic n'a pas pu être lue** :
  `platform.claude.com/docs/en/test-and-evaluate/eval-tool` renvoie le contenu de *define-success* (152 950
  caractères, tronqué). Les détails Console (génération de cas de test par Claude, échelle de notation 5
  points, comparaison côte à côte, import CSV) n'apparaissent que dans des blogs tiers — **non retenus,
  à vérifier.**
- Pas de source lue sur ce que fait exactement **OpenAI Datasets**, le remplaçant annoncé. **À vérifier.**

---

## 2. LLM-as-judge : biais mesurés, mitigations mesurées, et ce qui transfère

### 2.1 Fiabilité globale

- GPT-4 atteint « over 80% agreement » avec les préférences humaines, « roughly on par with how often
  humans agree » entre eux — [Zheng et al., *Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena*,
  arXiv:2306.05685, `abstract lu`, consulté 2026-11-09](https://arxiv.org/abs/2306.05685)
- L'abstract nomme trois biais — « position, verbosity, and self-enhancement biases » — plus une capacité
  de raisonnement limitée du juge — [ibid.](https://arxiv.org/abs/2306.05685)
- `Inférence de la note` : cet accord > 80 % porte sur des **préférences** (A vs B) sur MT-Bench, **pas** sur
  du scoring absolu d'une tâche métier. Le transférer en « mon juge est fiable à 80 % sur mon rubric » est
  un abus.

### 2.2 Position bias — `HTML Table 2`, prompt par défaut

*Consistency* = part des cas où le juge rend le même verdict quand on échange les deux réponses.

| Juge (génération 2023) | Consistency | Biaisé vers la 1re position | Biaisé vers la 2e |
|---|---|---|---|
| Claude-v1 | **23,8 %** | 75,0 % | 0,0 % |
| GPT-3.5 | **46,2 %** | 50,0 % | 1,2 % |
| GPT-4 | **65,0 %** | 30,0 % | 5,0 % |

— [Zheng et al., arXiv:2306.05685, `HTML Table 2`, consulté 2026-11-09](https://arxiv.org/html/2306.05685)

- La majorité des juges favorisent la **première** position, et **seul GPT-4 est cohérent dans plus de 60 %
  des cas** — [ibid.](https://arxiv.org/html/2306.05685)
- Claude-v1 montre en plus un **biais de nom** vers « Assistant A » sous le prompt « rename » (consistency
  56,2 %, 28,7 % biaisé vers la seconde) — [ibid.](https://arxiv.org/html/2306.05685)

### 2.3 Verbosity bias — `HTML Table 3`, attaque « repetitive list », 23 réponses testées

Taux d'échec = part des cas où le juge préfère la réponse rallongée par du remplissage.

| Juge (génération 2023) | Taux d'échec |
|---|---|
| Claude-v1 | **91,3 %** |
| GPT-3.5 | **91,3 %** |
| GPT-4 | **8,7 %** |

— [Zheng et al., arXiv:2306.05685, `HTML Table 3`, consulté 2026-11-09](https://arxiv.org/html/2306.05685)

*Incohérence interne du papier, à connaître* : le texte renvoie à « Table 4 » pour ce résultat alors que les
chiffres sont en Table 3 — [ibid.](https://arxiv.org/html/2306.05685)

### 2.4 Self-enhancement bias — le désaccord non tranché

- **Zheng et al. refusent de conclure.** Pas de chiffre exact d'inflation ; seulement des valeurs
  **approximatives lues sur la Figure 2(b)**, par rapport aux humains : GPT-4 **≈ +10 %** de win rate sur
  ses propres sorties, Claude-v1 **≈ +25 %**, GPT-3.5 ne se favorise pas. **Les auteurs disent explicitement
  ne pas pouvoir déterminer si le biais de self-enhancement existe**, faute de données suffisantes et vu la
  petitesse des écarts — [ibid.](https://arxiv.org/html/2306.05685) *(À opposer aux affirmations
  catégoriques courantes sur le self-preference.)*
- **Un papier dédié conclut l'inverse** : GPT-4 « exhibits a significant degree of self-preference bias ».
  Mécanisme attribué à la **perplexité** — les LLM juges notent significativement plus haut les sorties de
  faible perplexité que ne le font les évaluateurs humains, **que ces sorties aient été auto-générées ou
  non** : donc un biais de familiarité du texte, pas de paternité —
  [*Self-Preference Bias in LLM-as-a-Judge*, arXiv:2410.21819, `abstract lu`, consulté 2026-11-09](https://arxiv.org/abs/2410.21819)
- **À présenter comme un désaccord de littérature, pas comme un fait établi.**
- `Inférence de la note` : si la conclusion « perplexité » tient, alors **changer de juge ne suffit pas** —
  un juge d'une autre famille préférera quand même le texte le plus fluide, qui n'est pas forcément le plus
  correct. La mitigation d'Anthropic (« un autre modèle ») traite la paternité, pas le mécanisme identifié.
- Valeurs exactes de la métrique de self-preference d'arXiv:2410.21819 : seul l'abstract a été lu, qui ne
  donne **aucune magnitude. À vérifier** dans le PDF/HTML.

### 2.5 Mitigations mesurées, avec leur coût

| Mitigation | Effet mesuré | Coût | Source |
|---|---|---|---|
| **Swap de positions** (conservateur : gagnant déclaré seulement s'il est préféré dans les deux ordres, sinon match nul) | **Aucun chiffre de récupération publié** pour cette technique seule, bien que le papier l'emploie dans ses expériences | non chiffré dans la note source | [Zheng et al., `HTML lu`](https://arxiv.org/html/2306.05685) |
| **Few-shot judge** (`HTML Table 13`) | Consistency : GPT-4 65,0 % → **77,5 %** ; GPT-3.5 46,2 % → **55,0 %** (son biais se déplace de la 1re vers la 2e position, 16,2 % vs 28,7 %) ; Claude-v1 23,8 % → **63,7 %** | **~4× plus par appel API**, et **l'accord avec les humains reste comparable au zero-shot** | [ibid., `HTML Table 13`](https://arxiv.org/html/2306.05685) |
| **Chain-of-thought** (`HTML Table 4`, taux d'échec en maths) | 70 % (14/20) → **30 %** (6/20) | non chiffré dans la note source | [ibid., `HTML Table 4`](https://arxiv.org/html/2306.05685) |
| **Reference-guided judge** (on donne au juge une réponse de référence ; `HTML Table 4`, même taux d'échec maths) | 70 % → **15 %** (3/20) — **la mitigation la plus efficace mesurée** | exige qu'une référence existe | [ibid., `HTML Table 4`](https://arxiv.org/html/2306.05685) |
| **Juge fine-tuné Vicuna-13B** (`HTML Table 16`) | Consistency 16,2 % → **65,0 %**, 0 % d'erreur ; accord 56,8 % sur trois labels et **85,5 % hors matchs nuls** (baselines aléatoires 33 % et 50 % ; GPT-4 : 66 % et 87 %) | non chiffré dans la note source | [ibid., `HTML Table 16`](https://arxiv.org/html/2306.05685) |
| **Grader avec un autre modèle** (prescrit par le vendeur, non chiffré) | aucune magnitude publiée | — | [Anthropic, *Develop tests*, `doc éditeur lue`, consulté 2026-11-09](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests) |

### 2.6 Ce qui transfère et ce qui ne transfère pas — avertissement central

> **Les chiffres ci-dessus portent sur Claude-v1, GPT-3.5 et GPT-4, c'est-à-dire des juges de 2023.**
> Aucune mesure équivalente sur les juges de 2025-2026 n'a été lue. **Les magnitudes ne sont pas
> transférables telles quelles ; ce qui se transfère est la méthode de mesure** — consistency sous swap,
> attaque de verbosité. **À vérifier** s'il existe une réplication récente.

### 2.7 Inférences de la note

- **Le choix du modèle juge pèse plus que le choix du rubric.** Entre Claude-v1 (23,8 % de cohérence,
  91,3 % de chute sur l'attaque de verbosité) et GPT-4 (65,0 % et 8,7 %) sur les mêmes tâches, l'écart est
  d'un ordre de grandeur. Transposé à 2026 : un juge pris dans une classe « cheap » pour économiser des
  tokens peut rendre une eval entière non informative. **La première chose à mesurer sur un juge, avant de
  l'utiliser, est sa consistency sous swap sur quelques dizaines de paires.**
- **Le reference-guided judge est la mitigation à adopter par défaut** quand une référence existe :
  70 % → 15 % contre 70 % → 30 % pour le CoT, pour un coût moindre que le few-shot (~4×). La mitigation la
  plus efficace consiste donc à **rendre le juge moins libre**.
- Le few-shot judge illustre un arbitrage mal connu : il corrige massivement la cohérence (Claude-v1 ×2,7)
  **sans améliorer l'accord avec les humains**. Il rend le juge reproductible, pas plus juste.
  **Cohérence et justesse sont deux propriétés à mesurer séparément.**
- Interprétation **non affirmée par la source** : le fait qu'OpenAI fasse renvoyer au `score_model` des
  `steps` en plus du `result`, et force toute sortie non numérique à 0, peut se lire comme une mitigation
  structurelle (note auditable, pas d'interprétation d'une sortie malformée). **La doc ne le présente pas
  comme une réponse aux biais** — [OpenAI, *Graders guide*, consulté 2026-11-09](https://developers.openai.com/api/docs/guides/graders)

### 2.8 Lacunes du § 2

- Chiffres vus **uniquement en snippets de recherche, donc non retenus** (et à traiter comme non sourcés si
  quelqu'un les ressort) : « préférences pairwise qui basculent dans ~35 % des cas contre 9 % pour les
  scores absolus » (blog) ; « kappa du meilleur juge 0,78–0,82 contre baseline humaine 0,80 » (blog) ;
  « robustesse positionnelle sous 0,5 avec 3–4 options » (agrégateur). **Un snippet n'est pas une source lue.**
- ***Length-controlled win rates*** (Dubois et al. 2024), cités par des sources secondaires comme correction
  post-hoc du biais de longueur : **non lus à la source, aucun chiffre affirmable. À vérifier.**
- **Aucune documentation officielle Anthropic ou OpenAI lue ne reconnaît ni ne chiffre les biais de ses
  propres juges.** C'est un angle mort des docs vendeurs.

---

## 3. Outillage, à sa version documentée — ce que chaque outil fait et ne fait pas

### 3.1 Versions établies, et versions non établies

| Outil | Version | Comment elle a été établie | Réserve |
|---|---|---|---|
| **promptfoo** | **0.125.1** | `"version": "0.125.1"` dans `package.json` de la branche `main` — [`artefact lu`, consulté 2026-11-09](https://raw.githubusercontent.com/promptfoo/promptfoo/main/package.json) | **Lu à la branche, pas à un tag de release** : `main` peut être en avance sur la dernière version publiée |
| **DeepEval** | **4.3.3** | `"version": "4.3.3"` sur l'index PyPI — [`artefact lu`, consulté 2026-11-09](https://pypi.org/pypi/deepeval/json) | Aucun numéro de version affiché dans la doc (il faut `pip show deepeval`) |
| **Langfuse** | **version non établie** | `langfuse.com/changelog` renvoie **404** | Les affirmations Langfuse ci-dessous sont **datées 2026-11-09 mais non attachées à une version**. **À vérifier** via les releases GitHub |
| **DSPy** | **version non établie** | Doc lue à la branche `main` du dépôt, **pas à un tag** ; le `current` de l'URL `dspy.ai/current/...` est un segment de chemin, pas une version | **À vérifier** par `pip show dspy` |

### 3.2 promptfoo 0.125.1 — comparaison de prompts et assertions en CI

**Ce qu'il fait** — « promptfoo produces matrix views that let you quickly evaluate outputs across many
prompts » ; comparaison côte à côte prompts × inputs ; utilisable en CLI, en librairie ou en CI/CD (GitHub
Action fournie) ; red teaming / pentest automatisé avec rapports de vulnérabilité —
[promptfoo, *Intro*, `doc éditeur lue`, consulté 2026-11-09](https://www.promptfoo.dev/docs/intro/)

Assertions, telles que listées — [promptfoo, *Assertions & metrics*, `doc éditeur lue`, consulté
2026-11-09](https://www.promptfoo.dev/docs/configuration/expected-outputs/) :

- **Déterministes** : `equals`, `contains`, `icontains`, `regex`, `starts-with`, `contains-any`,
  `contains-all`, `icontains-any`, `icontains-all`, `is-json`, `contains-json`, `is-html`, `contains-html`,
  `is-sql`, `contains-sql`, `is-xml`, `contains-xml`, `is-refusal`, `javascript`, `python`, `ruby`,
  `webhook`, `rouge-l`, `rouge-n`, `rouge-s`, `bleu`, `gleu`, `meteor`, `levenshtein`, `latency`, `cost`,
  `perplexity`, `perplexity-score`, `is-valid-function-call`, `is-valid-openai-function-call`,
  `is-valid-openai-tools-call`, `tool-call-f1`, `guardrails`.
- **Sur trajectoires d'agent** (notable pour 2026) : `trace-span-count`, `trace-span-duration`,
  `trace-error-spans`, `skill-used`, `trajectory:tool-used`, `trajectory:tool-args-match`,
  `trajectory:tool-sequence`, `trajectory:step-count`.
- **Model-graded** : `llm-rubric`, `g-eval`, `model-graded-closedqa`, `pi`, `factuality` (alias
  `model-graded-factuality`), `answer-relevance`, `context-faithfulness`, `context-recall`,
  `context-relevance`, `conversation-relevance`, `trajectory:goal-success`, `similar`, `classifier`,
  `moderation`, `select-best`, `max-score`.
- Configuration du juge : la propriété `provider` choisit le LLM pour les assertions qui en ont besoin
  (`similar`, `llm-rubric`, `model-graded-*`) ; `rubricPrompt` porte le prompt du grader ; `config` passe
  des valeurs aux assertions JS/Python/Ruby custom.

**Ce qu'il ne fait pas** — la page *Intro* mentionne le partage et un web viewer pour la collaboration, mais
**ne mentionne ni versioning, ni stockage des prompts, ni historique de prompt**. Aucune page de limitations
déclarées — [promptfoo, *Intro*, consulté 2026-11-09](https://www.promptfoo.dev/docs/intro/)

### 3.3 DeepEval 4.3.3 — métriques et tests type pytest

- Modèle de fonctionnement : on écrit des test cases, chaque métrique renvoie une valeur **entre 0 et 1**,
  et chaque test passe ou échoue contre un `threshold` — [DeepEval, *Getting started*, `doc éditeur lue`,
  consulté 2026-11-09](https://deepeval.com/docs/getting-started)
- Métriques visibles sur la page de démarrage : `GEval` (critères custom), `JevEval`,
  `ConversationalGEval`, `TaskCompletionMetric` (note la **trajectoire complète** d'un agent) —
  [ibid.](https://deepeval.com/docs/getting-started)
- Test runner : « plugs into Pytest » — `deepeval test run` collecte et exécute les fichiers d'eval comme
  pytest ; côté TypeScript, intégration Vitest — [ibid.](https://deepeval.com/docs/getting-started)
- Datasets : `EvaluationDataset` contient des `Golden` (inputs) ; `evals_iterator()` boucle dessus et
  capture **une trace par golden** pour les evals d'agent ; résultats cachés localement, dossier
  configurable par `DEEPEVAL_RESULTS_FOLDER` — [ibid.](https://deepeval.com/docs/getting-started)
- Tracing : décorateur `@observe` + intégrations framework (LangChain, OpenAI…) pour évaluer la trajectoire
  entière **et** les composants individuels — [ibid.](https://deepeval.com/docs/getting-started)
- Plateforme : *Confident AI* est **optionnelle** ; une fois connecté, `deepeval view` affiche les runs, et
  en production elle peut faire tourner des collections de métriques sur traces/spans/threads et promouvoir
  les traces en échec en nouveaux test cases — [ibid.](https://deepeval.com/docs/getting-started)

**Ce qu'il ne fait pas** — la page de démarrage ne décrit **aucune gestion ni versioning de prompts** —
[ibid.](https://deepeval.com/docs/getting-started)

### 3.4 Langfuse (version non établie) — le seul à faire du prompt management versionné

- Les prompts sont **stockés, versionnés et récupérés centralement** plutôt que codés en dur ; les équipes
  non techniques éditent dans l'UI et l'application récupère la version sans redéploiement :
  « prompt updates deploy instantly » — [Langfuse, *Prompt management overview*, `doc éditeur lue`,
  consulté 2026-11-09](https://langfuse.com/docs/prompt-management/overview)
- Versioning : chaque modification crée une nouvelle version **immuable** (1, 2, 3…) — « Versions provide an
  immutable history of every change » ; le versioning porte sur **l'objet prompt entier**, pas sur ses
  parties — [Langfuse, *Prompt management data model*, `doc éditeur lue`, consulté 2026-11-09](https://langfuse.com/docs/prompt-management/data-model)
- **Labels = le mécanisme de déploiement** : `production` (label par défaut des apps en prod), `latest`
  (pointe toujours sur la plus récente), plus des labels custom (staging, testing, tenants, **A/B tests**).
  Déployer = déplacer le label `production` sur une nouvelle version ; **rollback = réassigner le label à
  une version antérieure, sans changer le code** — [ibid.](https://langfuse.com/docs/prompt-management/data-model)
- Types : un prompt est soit `text` (chaîne unique) soit `chat` (tableau de messages par rôle) ; **le type
  ne peut pas être changé après création** — [ibid.](https://langfuse.com/docs/prompt-management/data-model)
- Tags : regroupent les prompts **à travers les versions** pour le filtrage ; ils **ne sélectionnent pas**
  de version — [ibid.](https://langfuse.com/docs/prompt-management/data-model)
- **Caching, et son piège** : les SDK cachent les prompts côté client, et la doc affirme « Langfuse Prompt
  Management adds no latency to your application » ; conséquence documentée — **une app en prod peut servir
  une version cachée pendant un certain temps** après un changement, le caching étant désactivable ou son
  TTL réductible — [Langfuse, overview + data model, consulté 2026-11-09](https://langfuse.com/docs/prompt-management/data-model)
- Lien prompts ↔ observabilité : les prompts peuvent être liés aux traces pour analyser la performance
  **par version de prompt** — [Langfuse, overview, consulté 2026-11-09](https://langfuse.com/docs/prompt-management/overview)

### 3.5 Où ils ne se recouvrent pas

| | Comparaison de prompts | Assertions / seuils en CI | Trajectoire d'agent | Versioning des prompts | Rollback sans déploiement |
|---|---|---|---|---|---|
| **promptfoo 0.125.1** | oui (matrix views) | oui (déterministes + model-graded, GitHub Action) | oui (`trajectory:*`, `skill-used`) | **non mentionné dans la doc lue** | **non mentionné dans la doc lue** |
| **DeepEval 4.3.3** | non décrit | oui (`threshold`, `deepeval test run`) | oui (`TaskCompletionMetric`, `@observe`) | **non décrit dans la doc lue** | **non mentionné dans la doc lue** |
| **Langfuse** (version non établie) | non (ce n'est pas un harnais d'eval) | non | lien aux traces | **oui** (versions immuables) | **oui** (labels) |

- `Inférence de la note` : **les trois outils ne se recouvrent presque pas.** Une pratique complète en 2026
  demande **deux outils au moins** (un runner d'eval + un registre de prompts), ou un seul (Langfuse) plus git.
- **Avertissement de forme** : les « ce qu'il ne fait pas » ci-dessus sont des **absences constatées dans la
  doc lue**, **pas des déclarations des éditeurs**. Aucune page de limitations déclarées n'a été trouvée
  pour promptfoo ni Langfuse.
- `Inférence de la note` : la recommandation git d'OpenAI (§ 4) et le modèle label de Langfuse résolvent le
  même problème par deux routes opposées — git donne l'audit et la revue mais exige un déploiement ; les
  labels donnent le rollback instantané sans déploiement mais **sortent le prompt de la revue de code**.
  C'est un arbitrage gouvernance vs vélocité, pas une question d'outil.
- `Inférence de la note` : le **caching client de Langfuse** est le piège opérationnel à documenter — un
  rollback « instantané » ne l'est que si le TTL est court. Après un rollback, l'ancienne version peut
  continuer à servir : source de régression invisible.
- `Inférence de la note` : l'apparition d'assertions de **trajectoire** (promptfoo 0.125.1) et du
  `TaskCompletionMetric` (DeepEval 4.3.3) marque le déplacement du sujet : **en 2026 on n'évalue plus une
  réponse mais un parcours d'agent.**

### 3.6 Lacunes du § 3

- **Prompt versioning first-party Anthropic : non établi à la source.** La page `test-and-evaluate/eval-tool`
  n'a pas pu être lue (§ 1.5), et aucune doc officielle décrivant un versioning de prompts dans la Console
  Anthropic n'a été lue. Les mentions de « prompt versions » viennent de blogs tiers — **à vérifier, ne pas
  affirmer.**
- **Le prompt improver d'Anthropic : page introuvable à son ancienne URL.**
  `platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompt-improver` redirige vers
  *Prompting best practices*. Le gain historiquement annoncé n'a donc **pas pu être confirmé ni daté. À vérifier.**
- promptfoo : **le juge par défaut quand `provider` est omis n'est pas indiqué** sur la page lue. **À vérifier.**
- **Ce que faisaient réellement les reusable prompt objects d'OpenAI** (IDs de version, épinglage d'une
  version depuis une requête API, comparaison dans le dashboard) : la page *Prompting* le mentionne seulement
  pour renvoyer vers un guide de migration et une page de dépréciations, **non lus**. On sait que la
  fonctionnalité disparaît sans avoir pu décrire à la source le mécanisme qu'elle offrait. **À vérifier.**

---

## 4. Dépréciations avec leurs dates — imminentes et actionnables

| Ce qui disparaît | Jalon | Date | Source (consultée 2026-11-09) |
|---|---|---|---|
| **Plateforme OpenAI Evals** | lecture seule pour les utilisateurs existants | **31 octobre 2026** | [OpenAI, *Evals guide*, `doc éditeur lue`](https://developers.openai.com/api/docs/guides/evals) |
| **Plateforme OpenAI Evals** | arrêt ; la page oriente vers *Datasets* pour les nouveaux travaux | **30 novembre 2026** | [ibid.](https://developers.openai.com/api/docs/guides/evals) |
| **Reusable prompt objects OpenAI** — « OpenAI is deprecating reusable prompt objects in the API. » | création dé-emphasée | **3 juin 2026** | [OpenAI, *Prompting guide*, `doc éditeur lue`](https://developers.openai.com/api/docs/guides/prompting) |
| **Reusable prompt objects OpenAI** | arrêt de `v1/prompts` | **30 novembre 2026** | [ibid.](https://developers.openai.com/api/docs/guides/prompting) |
| **Graders OpenAI** dans les workflows evals et fine-tuning | « déprécie » — **date non relevée dans la note source** ; **à vérifier** | — | [OpenAI, *Graders guide*, `doc éditeur lue`](https://developers.openai.com/api/docs/guides/graders) |
| **`temperature`, `top_p`, `top_k` (Anthropic)** | **retirés** en API version `2026-10-21` (erreur 400) ; dans les versions d'API antérieures, ces paramètres renvoient une erreur dès qu'ils sont mis à une valeur non par défaut sur Claude 4.7 et au-delà. Remplacement recommandé : les omettre et **guider le comportement par le prompt** | **version d'API `2026-10-21`** | [Anthropic, *Model deprecations*, `doc éditeur lue`](https://platform.claude.com/docs/en/about-claude/model-deprecations) |

**Remplacement prescrit par OpenAI** : garder les prompts **dans le code**, pas comme objets API — un helper
versionné par prompt, dont les messages générés sont passés à la Responses API via `input` et `instructions` ;
et pour le versioning, utiliser « git history, PR review, release tags, and feature flags » pour revoir,
livrer, comparer et rollback les changements de prompt — [OpenAI, *Prompting guide*, `doc éditeur lue`,
consulté 2026-11-09](https://developers.openai.com/api/docs/guides/prompting)

---

## 5. Optimisation automatique de prompts — avec, pour chaque gain, qui l'a mesuré

### 5.1 DSPy — les 11 optimiseurs documentés

Lus dans l'artefact de doc à la **branche `main`** (pas à un tag ; version DSPy **non établie**) —
[`dspy/docs/docs/learn/optimization/optimizers.md`, main, `artefact lu`, consulté 2026-11-09](https://raw.githubusercontent.com/stanfordnlp/dspy/main/docs/docs/learn/optimization/optimizers.md) :

1. `LabeledFewShot` — construit des démos few-shot en échantillonnant k exemples labellisés du trainset.
2. `BootstrapFewShot` — un programme *teacher* (par défaut le programme lui-même) génère des démos, et
   **seules celles qui passent la métrique sont conservées**.
3. `BootstrapFewShotWithRandomSearch` — répète le précédent en random search et renvoie le meilleur programme.
4. `KNNFewShot` — prend les exemples d'entraînement les plus proches de chaque input comme trainset de
   BootstrapFewShot.
5. `COPRO` — génère et raffine des **instructions** par coordinate ascent (hill-climbing sur la métrique).
6. `MIPROv2` — propose **instructions et exemples few-shot ensemble**, en explorant l'espace par
   optimisation bayésienne.
7. `SIMBA` — échantillonne des mini-batches pour trouver les exemples à forte variabilité de sortie, puis
   fait réfléchir le LM sur ses échecs pour écrire des règles d'amélioration ou ajouter des démos.
8. `GEPA` — fait réfléchir des LM sur les **trajectoires** du programme pour proposer de meilleurs prompts,
   et peut exploiter un feedback textuel spécifique au domaine.
9. `BootstrapFinetune` — distille un programme à base de prompts en **poids finetunés**, à étapes inchangées.
10. `Ensemble` — combine plusieurs programmes en un seul (tous, ou un sous-ensemble aléatoire).
11. `BetterTogether` — méta-optimiseur qui chaîne optimisation de prompt et fine-tuning de poids dans des
    séquences configurables.

**Règles de choix officielles, par taille de données** : « If you have very few examples (around 10), start
with `BootstrapFewShot` » ; avec plus de données (50 exemples ou plus), essayer
`BootstrapFewShotWithRandomSearch` ; MIPROv2 configuré en 0-shot pour l'optimisation d'instructions seules ;
MIPROv2 pour les **longs runs (~40+ trials) avec ~200+ exemples** afin de limiter l'overfitting ; après un
grand LM (~7B+), finetuner un petit LM avec `BootstrapFinetune` —
[ibid.](https://raw.githubusercontent.com/stanfordnlp/dspy/main/docs/docs/learn/optimization/optimizers.md)

`Inférence de la note` : cette règle « 10 ⇒ BootstrapFewShot, 50+ ⇒ RandomSearch, 200+ et 40 trials ⇒
MIPROv2 » est **la seule guidance officielle lue reliant taille de dataset et méthode dans tout le dossier**,
y compris côté fournisseurs de modèles.

### 5.2 Les gains revendiqués, et qui les a mesurés

> **Tous les chiffres de cette section sont mesurés par les auteurs de la méthode. Aucune évaluation tierce
> n'a été trouvée et lue : il n'existe, dans ce qui a été lu, aucune réplication indépendante de GEPA,
> MIPROv2 ni APE. À vérifier.**

**GEPA — mesuré par les auteurs de GEPA.**
Algorithme : GEPA mute itérativement les prompts en faisant **réfléchir un LLM en langage naturel sur les
traces d'exécution et d'évaluation**, maintient une **frontière de Pareto** des candidats meilleurs sur au
moins une instance d'entraînement, et échantillonne stochastiquement sur cette frontière pour choisir le
parent suivant — [GEPA, arXiv:2507.19457v2, `HTML lu`, consulté 2026-11-09](https://arxiv.org/html/2507.19457v2)

- **Six** tâches (pas quatre) : AIME-2025, LiveBench-Math, HotpotQA, IFBench, HoVer, PUPA — [ibid.](https://arxiv.org/html/2507.19457v2)
- Modèles : **Qwen3 8B** (ouvert) et **GPT-4.1 Mini** (propriétaire) ; **GRPO n'a été lancé que sur
  Qwen3 8B** — [ibid.](https://arxiv.org/html/2507.19457v2)

| Agrégat Qwen3 8B (`HTML Table 1`), baseline 45.23 | Score | Delta |
|---|---|---|
| **GEPA** | 54.85 | **+9.62** |
| GEPA+Merge | 52.40 | +7.17 |
| GRPO | 48.91 | +3.68 |
| MIPROv2 | 47.84 | +2.61 |

| Agrégat GPT-4.1 Mini (`HTML Table 2`) | Score | Delta |
|---|---|---|
| **GEPA+Merge** | 66.36 | **+13.33** |
| GEPA | 65.22 | +12.19 |
| MIPROv2 | 58.67 | +5.64 |

- Budgets de rollouts : **GRPO 24 000 rollouts par tâche** ; GEPA(+Merge) sur Qwen3 8B — 6 871 (HotpotQA),
  3 593 (IFBench), 7 051 (HoVer), 2 426 (PUPA), 1 839 (AIME-2025 et LiveBench-Math) — [ibid.](https://arxiv.org/html/2507.19457v2)
- Le papier affirme atteindre le niveau GRPO avec **jusqu'à 35× moins de rollouts** — [ibid.](https://arxiv.org/html/2507.19457v2)
- L'abstract annonce « about 6% higher on average » vs GRPO et « more than 10% higher » vs MIPROv2, avec
  **+12 % d'accuracy sur AIME-2025** comme exemple — [GEPA abstract, arXiv:2507.19457, `abstract lu`,
  consulté 2026-11-09](https://arxiv.org/abs/2507.19457)
- `Inférence de la note` : GEPA est à la fois un optimiseur de première classe **dans** DSPy et une méthode
  publiée avec ses propres chiffres — le gain est **auto-mesuré, dans le cadre où GEPA est natif**, contre un
  MIPROv2 présent dans le même écosystème. **C'est le cas favorable, pas une réplication indépendante.**
  (Les affiliations des auteurs de GEPA n'ont pas été lues — **à vérifier** si le lien institutionnel avec
  DSPy importe pour l'argument.)
- **Les 80 998 derniers caractères du HTML de GEPA n'ont pas été lus** (ablations, résultats par tâche).
  **À vérifier.**

**MIPROv2 — mesuré par les auteurs de MIPRO.**
Gain annoncé : MIPRO dépasse les « baseline optimizers » « by as high as 13% accuracy », sur **sept**
programmes LM multi-étapes, avec **Llama-3-8B**, en gagnant sur **5 des 7** programmes —
[Opsahl-Ong et al., arXiv:2406.11695, `abstract lu`, consulté 2026-11-09](https://arxiv.org/abs/2406.11695).
Nom des sept programmes et valeurs par programme : pas dans l'abstract, tables non lues. **À vérifier.**

**APE — mesuré par les auteurs d'APE.**
Méthode : APE traite **l'instruction comme le programme** ; un LLM propose un pool de candidats
d'instructions, et chaque candidat est noté par la **performance zero-shot d'un autre LLM qui la suit**,
l'objectif étant de maximiser une fonction de score choisie — [Zhou et al., *Large Language Models Are
Human-Level Prompt Engineers*, arXiv:2211.01910, `abstract lu`, consulté 2026-11-09](https://arxiv.org/abs/2211.01910).
Résultats annoncés : les instructions générées dépassent la baseline LLM antérieure « by a large margin » et
atteignent une performance « better or comparable » à celle d'annotateurs humains sur **19 des 24 tâches**
NLP — [ibid.](https://arxiv.org/abs/2211.01910). **Chiffres exacts (par tâche, modèles exacts, baseline
nommée) : absents de l'abstract. À vérifier** dans `arxiv.org/html/2211.01910v2`.

**Les prompt improvers d'éditeurs.** **Prompt improvers des éditeurs** (Anthropic prompt improver,
OpenAI « Optimize ») : **aucun gain chiffré n'a pu être lu à la source**, page Anthropic disparue (§ 3.6).
**À vérifier — ne rien écrire sur leurs gains.**

### 5.3 Inférences de la note sur l'arbitrage

- Le chiffre à retenir pour arbitrer n'est pas le gain mais le **ratio gain/budget** : GEPA obtient +9.62
  avec ~2 000–7 000 rollouts là où GRPO obtient +3.68 avec 24 000. Pour une équipe qui paie ses rollouts en
  tokens, **l'écart de budget pèse plus que l'écart de score**.
- Les gains MIPROv2 portent sur **Llama-3-8B** et ceux d'APE sur des modèles non nommés, d'une génération
  antérieure : **rien ne garantit leur transfert aux modèles de 2026.**
  `Hypothèse non sourcée, à traiter comme telle` : un gain d'optimisation de prompt obtenu sur un petit
  modèle pourrait se réduire quand le modèle de base s'améliore — **à vérifier, aucune source lue ne
  l'établit. À ne pas citer comme attente de gain actuelle.**

---

## 6. Régresser sans changer de modèle

Un prompt peut régresser alors qu'aucun identifiant de modèle n'a bougé. Deux dimensions documentées.

### 6.1 Dimension version d'API

- `temperature`, `top_p`, `top_k` ont été **retirés en API version `2026-10-21`** (erreur 400). Dans les
  versions d'API antérieures, ces paramètres renvoient une erreur dès qu'ils sont mis à une valeur non par
  défaut **sur Claude 4.7 et au-delà**. Remplacement recommandé : les omettre et **guider le comportement
  par le prompt** — [Anthropic, *Model deprecations*, `doc éditeur lue`, consulté 2026-11-09](https://platform.claude.com/docs/en/about-claude/model-deprecations)
- `Inférence de la note` : ce retrait **démontre qu'un prompt peut régresser sans qu'aucun modèle ne
  change** — la surface d'API est elle aussi une source de régression. **Une discipline de régression qui ne
  surveille que l'identifiant de modèle est incomplète : il faut épingler aussi la version d'API.**

### 6.2 Dimension plateforme

- Les dates de dépréciation publiées **ne valent que pour les plateformes opérées par Anthropic** : Claude
  API, Claude Platform on AWS, Claude Models on Google Cloud *Anthropic managed*, Microsoft Foundry.
  **Amazon Bedrock et Google-managed fixent leurs propres calendriers**, donc le statut d'un modèle peut
  différer selon la plateforme — [Anthropic, *Model deprecations*, `doc éditeur lue`, consulté 2026-11-09](https://platform.claude.com/docs/en/about-claude/model-deprecations)
- `Inférence de la note` : le même prompt peut donc tourner sur **deux variantes de cycle de vie** selon le
  déploiement.

### 6.3 La matrice de régression

> `Inférence de la note` : **la matrice est modèle × plateforme × version d'API**, pas modèle seul.

### 6.4 Ce que les fournisseurs donnent — et ce qu'ils ne donnent pas

**Cycle de vie Anthropic** — [Anthropic, *Model deprecations*, `doc éditeur lue`, consulté 2026-11-09](https://platform.claude.com/docs/en/about-claude/model-deprecations) :

- Quatre états : **Active / Legacy / Deprecated / Retired**. Un modèle *legacy* « will no longer receive
  updates and might be deprecated » ; une requête vers un modèle *retired* **échoue**.
- Avertissement explicite : « Deprecated models are likely to be less reliable than active models ».
- Guidance de re-validation : Anthropic invite à **tester soigneusement les applications avec les nouveaux
  modèles bien avant la date de retrait**, pour mesurer la performance des modèles de remplacement sur ses
  propres tâches.
- Best practices listées : vérifier régulièrement la doc sur les dépréciations ; tester tôt ; mettre le code
  à jour dès que possible ; contacter le support.
- Préavis contractuel : Anthropic notifie les clients ayant des déploiements actifs et donne **au moins
  60 jours de préavis** avant le retrait d'un modèle publiquement disponible.
- **Outil d'audit d'usage (le point le plus actionnable)** : page *Usage* de la Console → **Export** → le
  CSV donne l'usage **ventilé par clé API et par modèle**, pour localiser les endroits qui appellent encore
  un modèle déprécié.
- Il existe des **guides de migration par modèle** (Fable 5.1 / Mythos 5.1, Opus 5.5, Sonnet 5.5,
  Haiku 5.5) ; la page d'index renvoie en plus vers l'API overview, les model capabilities « for performance
  comparisons » et les release notes — [Anthropic, *Migration guides*, `doc éditeur lue`, consulté
  2026-11-09](https://platform.claude.com/docs/en/about-claude/models/migration-guide)
- Le guide de prompting actuel est structuré en trois parties dont la dernière est explicitement
  « Migration considerations last, for prompts moving from earlier generations », et il nomme les modèles
  couverts : Fable 5.1, Mythos 5.1, Fable 5, Mythos 5, Opus 5.5, Opus 5, Opus 4.8, Opus 4.7, Opus 4.6,
  Sonnet 5.5, Sonnet 5, Sonnet 4.6, Haiku 5.5, Haiku 4.5 — [Anthropic, *Claude prompting best practices*,
  `doc éditeur lue`, consulté 2026-11-09](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)

**OpenAI — la réponse git** : pour versionner, comparer et rollback les changements de prompt, utiliser
« git history, PR review, release tags, and feature flags » — [OpenAI, *Prompting guide*, `doc éditeur lue`,
consulté 2026-11-09](https://developers.openai.com/api/docs/guides/prompting)

**Briques outillées disponibles** :

| Brique | Ce qu'elle apporte | Source (consultée 2026-11-09) |
|---|---|---|
| Held-out test set | éviter l'overfitting du prompt aux données d'eval | [Anthropic, *Develop tests*](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests) |
| promptfoo | CLI en CI/CD avec GitHub Action ; vues matricielles pour comparer des sorties sur de nombreux prompts | [promptfoo, *Intro*](https://www.promptfoo.dev/docs/intro/) |
| DeepEval | métrique 0–1 et test passe/échoue contre un `threshold` via `deepeval test run` — **porte de régression binaire exécutable en CI** | [DeepEval, *Getting started*](https://deepeval.com/docs/getting-started) |
| Langfuse | performance analysable **par version de prompt** via les traces ; rollback par réassignation de label, sans déploiement | [Langfuse, overview + data model](https://langfuse.com/docs/prompt-management/data-model) |

**Le trou, nommé** — `Inférence de la note` : il n'existe, dans tout ce qui a été lu, **aucune prescription
officielle de protocole de régression inter-modèles**. Ce que les fournisseurs offrent, c'est un calendrier
(60 jours), un audit d'inventaire (CSV par clé API et modèle) et l'injonction « testez tôt ». La méthode —
rejouer le held-out set sur l'ancien et le nouveau modèle, comparer par paires appariées, fixer un seuil
d'échec — est **à la charge du praticien**. C'est le trou le plus net de ce dossier.

- `Inférence de la note` : **on ne peut pas re-valider les prompts qu'on ne sait pas inventorier.** L'ordre
  correct est **inventaire → held-out set → rejeu sur les deux modèles → seuil**, et non l'inverse.
- `Inférence de la note`, **combinaison outillée réaliste, déduite des capacités lues et non prescrite par
  aucun vendeur** : held-out set versionné dans git + assertions déterministes et model-graded dans
  promptfoo exécutées par la GitHub Action + seuils durs côté DeepEval + prompt épinglé par label Langfuse
  avec rollback sans déploiement, et **rejeu complet déclenché à chaque changement d'identifiant de modèle
  OU de version d'API**.

---

## 7. À vérifier

Repris de la note 05 sans promotion. Aucun de ces points n'est une assertion.

### Providers et evals

- **Page Console / Evaluation tool d'Anthropic** (`test-and-evaluate/eval-tool`) : non lisible, renvoie
  *define-success* tronqué. Détails Console (génération de cas de test, échelle 5 points, comparaison côte à
  côte, import CSV) connus seulement par des blogs tiers — **non retenus.**
- **52 950 derniers caractères** de *define-success* / *develop-tests* non lus : **une guidance statistique
  pourrait y figurer.**
- **OpenAI Datasets** (remplaçant annoncé des Evals) : aucune source lue sur ce qu'il fait exactement.
- **Graders OpenAI** : dépréciation annoncée, **date non relevée dans la note source**.

### LLM-as-judge

- Magnitudes 2023 (Claude-v1, GPT-3.5, GPT-4) : **aucune réplication sur juges 2025-2026 lue.**
- ***Length-controlled win rates*** (Dubois et al. 2024) : non lus à la source.
- Valeurs exactes de la métrique de self-preference d'**arXiv:2410.21819** : seul l'abstract lu.
- Chiffres de snippets **non retenus** : bascule pairwise ~35 % vs 9 %, kappa 0,78–0,82 vs 0,80, robustesse
  positionnelle < 0,5 à 3–4 options.
- **Aucune doc vendeur** ne reconnaît ni ne chiffre les biais de ses propres juges.

### Outillage

- **Version Langfuse non établie** (`/changelog` → 404) — à vérifier via les releases GitHub.
- **Version DSPy non établie** (doc lue à `main`, pas à un tag) — à vérifier par `pip show dspy`.
- **promptfoo 0.125.1 lu à la branche `main`, pas à un tag** : `main` peut être en avance sur la release.
- **Juge par défaut de promptfoo** quand `provider` est omis : non indiqué.
- **Prompt versioning first-party Anthropic** : non établi à la source — ne pas affirmer.
- **Prompt improver d'Anthropic** : page disparue, gain non confirmable ni datable.
- **Mécanisme réel des reusable prompt objects d'OpenAI** : guide de migration et page de dépréciations non
  lus.
- Les « ce qu'il ne fait pas » sont des **absences dans la doc lue**, pas des déclarations d'éditeur.

### Optimisation

- **Aucune réplication indépendante lue** pour GEPA, MIPROv2 ni APE.
- **Sept programmes de MIPROv2** : noms et valeurs par programme non lus.
- **Chiffres exacts d'APE** : absents de l'abstract.
- **80 998 derniers caractères du HTML de GEPA** non lus (ablations, résultats par tâche).
- **Affiliations des auteurs de GEPA** non lues.
- **Gains des prompt improvers d'éditeurs** (Anthropic, OpenAI « Optimize ») : aucun chiffre à la source.

### Régression

- **Aucun guide de migration par modèle n'a été lu individuellement** (Opus 5.5, Sonnet 5.5, Fable 5.1 /
  Mythos 5.1…) : la page d'index ne fait que les lister. **Lacune la plus importante à combler** — ces guides
  contiennent peut-être la guidance de re-validation de prompt qui manque à la page de dépréciations.
- La partie **« Migration considerations »** du guide de prompting Anthropic n'a pas été lue (page de
  72,8 Ko, aperçu seul).
- **Aucune guidance officielle lue**, ni Anthropic ni OpenAI, sur la **fréquence** de rejeu des evals, le
  **seuil de régression** acceptable, ou un **test statistique** pour conclure qu'un écart entre deux modèles
  est réel — **probablement inexistant.**
- **Épinglage prompt ↔ version de modèle** dans un outil tiers : aucune source lue (le `config` de Langfuse
  pourrait le porter, mais la page lue renvoie seulement un lien sans décrire le contenu).
- **OpenAI** : aucune page lue sur la re-validation de prompts lors d'un changement de modèle (snapshots
  `gpt-*-YYYY-MM-DD`, politique de dépréciation).
