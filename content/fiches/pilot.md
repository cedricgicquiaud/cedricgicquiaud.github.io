---
nom: PILOT
statut: en cours
periode: avril 2026 (FORGE) → aujourd'hui ; PILOT depuis le 22 août 2026
role: conception de la méthode, écriture des documents, de la skill et des fiches de poste des agents, expérimentation — seul
stack: Linear, GitHub, Claude Code, skills et agents en Markdown, git worktrees, Python (API Linear)
visibilite: public
depot: https://github.com/cedricgicquiaud/pilot-method
demo:
ordre: 4
visuel: /projets/pilot/circuit.png
---

# PILOT — workflow agentique

**En bref.** Un workflow agentique, ma méthode d'agentic engineering : PILOT fait avancer un
projet en cinq étapes ; je décide aux moments clés et, entre deux décisions, Claude et six agents
IA travaillent seuls. Je l'utilise sur mes projets réels, dont ce site (67 livraisons depuis fin
août). Méthode publique, sous licence libre.

## Problème

Un agent IA comme Claude Code écrit du code très vite. La difficulté n'est plus d'écrire : c'est
de savoir si ce qui est écrit est juste, et de garder le fil d'un projet qui dure des semaines.

Laissé seul, un agent fait trois choses que je ne veux pas :
- **il décide à ma place.** Exemple : qui a le droit de voir une facture. C'est une décision
  produit, elle me revient ;
- **il écrit les tests après le code.** Un test, c'est un petit programme qui vérifie que le
  code fait ce qu'on attend. Écrit après coup, il confirme le code au lieu de le contrôler ;
- **il se relit lui-même**, et ne voit donc pas ses propres erreurs.

PILOT répond à ces trois défauts : je garde les décisions, le test vient toujours avant le code,
et celui qui écrit le code n'est jamais celui qui le vérifie.

## Ce que j'ai construit

**Le principe.** PILOT fait avancer un projet en cinq étapes. Je décide aux moments clés. Entre
deux décisions, Claude et ses agents travaillent seuls.

**Les trois outils.**
- **Linear** est le tableau de bord : les tâches, dans l'ordre, et où on en est.
- **GitHub** est l'atelier : c'est là que vit le code.
- **Claude** est le chef d'atelier. Il lit le tableau, fait le travail ou le confie à ses agents,
  puis met le tableau à jour.

Chaque tâche a un code, par exemple KIN-12. Ce code est écrit sur tout ce qui la concerne dans
GitHub. C'est ce fil qui permet au tableau de se mettre à jour tout seul.

Pour illustrer les étapes, prenons une application de prise de rendez-vous pour un kiné.

**Étape 1 — Comprendre le projet (`init`).** Elle n'a lieu qu'une fois, au démarrage.
1. Claude se renseigne d'abord. Il cherche ce qui existe déjà : les logiciels de rendez-vous
   connus, les règles à respecter (les données de santé, par exemple).
2. Il m'interroge en quelques séries de questions. Pour chacune, il propose une réponse : « Les
   patients peuvent-ils annuler en ligne ? Je propose : oui, jusqu'à 24 h avant. »
3. Il écrit une page qui décrit le produit : pour qui, quel problème, ce qui entre dans la
   première version et ce qui n'y entre pas.
4. Si l'application a des écrans, il me demande des exemples d'interfaces que j'aime. Il en tire
   une direction visuelle.
5. Je valide. Ensuite il prépare le tableau Linear et le dépôt de code.

**Étape 2 — Faire la liste des fonctionnalités (`roadmap`).**
1. Claude propose toutes les grandes fonctionnalités, dans l'ordre. Exemple : « Prendre
   rendez-vous », « Annuler », « Rappel par SMS », « Agenda du kiné ».
2. Le contradicteur relit la liste. C'est un agent dont le seul travail est de chercher ce qui
   manque. Il demande par exemple : « Rien n'est prévu quand le kiné est malade et doit tout
   décaler ? » Il pose des questions, il ne répond pas à ma place.
3. Je valide la liste. Claude la crée dans Linear et la place sur un calendrier.
4. Si l'application a des écrans, Claude prépare aussi le système de design : les couleurs, les
   polices et les composants communs. Je le valide.

**Étape 3 — Préparer une fonctionnalité (`feature`).** Elle a lieu une fois par fonctionnalité,
en deux temps. Je valide à la fin de chacun.

*Temps 1 — dire ce qui devra être vrai.*
1. Claude pose ses dernières questions.
2. Il écrit les décisions prises et une liste de 10 à 30 phrases vérifiables. Par exemple :
   « Un patient voit les créneaux libres de la semaine. » « On ne peut pas réserver un créneau
   déjà pris. » « On ne peut pas réserver dans le passé. » Au moins un tiers de ces phrases
   disent ce qui doit être impossible. C'est souvent là que les bugs se cachent.
3. Le contradicteur relit encore : « Que se passe-t-il si deux patients cliquent sur le même
   créneau à la même seconde ? »
4. Je valide. Cette liste de phrases s'appelle le contrat. Tout le reste sera jugé dessus.

*Temps 2 — découper le travail.*
1. Le découpeur est un agent qui partage la fonctionnalité en morceaux livrables. Deux morceaux
   ne touchent jamais le même fichier, donc ils ne se gênent pas. On peut alors les fabriquer en
   même temps. Exemple : morceau A « choisir un créneau », morceau B « recevoir la confirmation ».
2. Chaque morceau reçoit ses tâches et ses phrases du contrat. Chaque phrase doit être attribuée
   à un morceau.
3. Je valide le découpage. Claude crée les tâches dans Linear.

![Une tâche réelle de ce site dans Linear](/projets/pilot/linear.png)

*Une tâche réelle de ce site dans Linear : le problème, ce qu'on fait, et la liste « Terminé
quand », refus compris, que les agents doivent tenir.*

**Étape 4 — Fabriquer (`run`).** C'est la seule étape qui tourne entièrement sans moi.
1. Chaque morceau a sa propre copie du projet. Chaque agent travaille dans sa copie, sans voir
   les autres.
2. Le tdd-writer fabrique, à raison d'un par morceau. Il suit une règle stricte : d'abord le
   test, ensuite le code. Il écrit le test (« réserver un créneau pris doit être refusé »), vérifie
   qu'il échoue, puisque le code n'existe pas encore, puis écrit juste assez de code pour qu'il
   passe, et le met au propre. Il enregistre chaque étape à part : l'historique prouve donc que
   le test est venu avant le code. À la fin, il ouvre une demande d'intégration (une « PR ») et
   s'arrête. S'il tombe sur une question que sa mission ne règle pas, il ne tranche pas : il
   prend l'option la plus facile à défaire et la signale.
3. Deux relecteurs regardent le morceau en même temps. Aucun des deux ne l'a fabriqué, et aucun
   ne le modifie. Le verifier lit le code, relance lui-même les tests, vérifie que chaque test a
   précédé son code et que chaque phrase du contrat a son test. Il classe ce qu'il trouve en
   trois niveaux : bloquant, important, à considérer. Le testeur ouvre l'application comme le
   ferait un utilisateur, prend des captures d'écran et relève ce qui cloche : un bouton
   invisible sur téléphone, une page qui plante.
4. Le correcteur répare, s'il le faut. Il reçoit la liste des défauts et ne touche à rien
   d'autre. Il ne passe qu'une fois. Pour chaque défaut, il écrit d'abord un test qui le montre,
   puis il le corrige.
5. Un rapport s'écrit dans chaque PR : ce qui a été fait, les preuves, les captures d'écran, les
   questions laissées ouvertes. Puis tout s'arrête.

![Le chef d'atelier et les six agents](/projets/pilot/agents.png)

*Le chef d'atelier et les six agents : le rôle de chacun, et ce qu'il a le droit de faire. Seuls
deux agents modifient le code.*

**Étape 5 — Décider et apprendre (merge, puis `sync`).**
1. Je relis la PR et je décide de l'intégrer. C'est toujours moi qui le fais, jamais un agent :
   un verrou technique les en empêche. C'est aussi le moment où je réponds aux questions que les
   agents ont refusé de trancher.
2. Claude remet le tableau à jour : statuts et dates.
3. Il tire les leçons. Chaque erreur qui pourrait revenir devient une règle écrite, que les agents
   liront la fois suivante. Exemple : au merge, je fais remarquer qu'un bouton d'annulation doit
   toujours demander confirmation ; la remarque devient une règle du projet, et je n'ai plus à la
   refaire.

![La PR qui livre la tâche Linear](/projets/pilot/pr.png)

*La PR qui livre cette tâche, écrite par l'agent : le code de la tâche dans le titre, ce qui
change expliqué en clair, acceptée par moi.*

**Au quotidien : `next`.** Je n'ai pas à retenir l'ordre des étapes. Je tape `/pilot next`. Claude
lit le tableau, résume en cinq lignes où on en est et propose l'étape suivante. Je réponds oui
ou non. Pour une petite correction hors fonctionnalité, `/pilot fix` suffit : une tâche, un test,
une PR, sans toute la chaîne.

**Ce qui compose la méthode.** Le tout tient dans des fichiers texte et quelques programmes,
installés dans chaque projet en une commande.

| Élément | Nombre | Ce que c'est concrètement | Rôle |
|---|---|---|---|
| Agents | 6 | Un fichier `.md` par agent, dans `.claude/agents/`. L'en-tête donne son nom, son modèle, sa limite d'échanges et les outils qu'il a le droit d'utiliser. Le corps est sa consigne : qui il est, ce qu'il fait, ce qu'il ne fait jamais, et la forme exacte de son rapport. | Faire chacun une seule partie du travail, sans déborder sur celle des autres |
| Commandes | 9 | Aucune n'a de fichier à elle. Chacune est une entrée du sommaire de `SKILL.md`, et son pas-à-pas est dans une fiche de référence. On les tape sous la forme `/pilot <commande>`. | Me donner un mot à taper pour chaque situation |
| Skills | 6 | Un dossier par skill, avec un fichier `SKILL.md`. En tête, une description dit à Claude quand l'utiliser ; dessous vient la marche à suivre. | Donner à Claude un savoir-faire qu'il charge quand la situation le demande |
| Fiches de référence | 19 | Des fichiers `.md` rangés dans `skills/pilot/reference/`. Chacun commence par dire qui le lit et quand. | Garder la skill courte : le détail ne se lit qu'au moment du geste |
| Outils | 3 | De vrais programmes, en Python ou en JavaScript, dans `.claude/tools/`. Deux sont branchés sur Claude Code par des « hooks » (des déclencheurs automatiques). | Faire ce qu'une machine fait mieux qu'un texte : mesurer, photographier, bloquer |
| Scripts Linear | 4 | Des programmes Python qui parlent directement à Linear. | Faire ce que la connexion habituelle à Linear ne sait pas faire : créer la structure d'un tableau, dater, mesurer |

**Les six skills.**

| Skill | Ce qu'il y a dedans |
|---|---|
| `pilot` | Le principe, le vocabulaire, les 7 invariants, les statuts et le sommaire des 9 commandes (134 lignes). S'y ajoutent les 19 fiches de référence, les 4 scripts Linear et un jeu d'épreuves qui vérifie que la skill se déclenche au bon moment. |
| `diagnosing-bugs` | La marche à suivre pour un bug qui ne se reproduit pas du premier coup : le reproduire, formuler des hypothèses, les tester une à une, corriger avec un test qui le prouve. Importée de Matt Pocock. |
| `resolving-merge-conflicts` | Comment débloquer un merge sans perdre le travail d'un côté ni de l'autre. Importée de Matt Pocock. |
| `to-questionnaire` | Transforme une question que seul le client peut trancher en un document à lui envoyer. Importée de Matt Pocock. |
| `research-assistant` | Comment mener une recherche sur un sujet et en tirer une synthèse. `init` l'utilise avant l'entretien. |
| `rendu-fonctionnel` | Le format de mes comptes rendus : d'abord ce qui change pour moi, ensuite les détails techniques. |

**Les 19 fiches de référence.**

| Fiche | Ce qu'elle contient |
|---|---|
| *Pas-à-pas des commandes (5)* | |
| `init.md` | La recherche, l'entretien, la page produit, la direction visuelle, le branchement de Linear, la mise en place du dépôt |
| `roadmap.md` | Proposer les fonctionnalités, les créer et les dater dans Linear, préparer le système de design |
| `feature.md` | Le cadrage avec son contrat, puis le découpage en morceaux et en tâches |
| `produire.md` | Les copies du projet, le lancement des agents, les relectures, la correction et le modèle du rapport de PR |
| `suivre.md` | Les étapes de `next`, `fix`, `sync` et `benchmark`, dont la façon de transformer mes remarques de merge en règles |
| *Règles d'un geste (8)* | |
| `entretien.md` | Comment poser les questions d'un cadrage : par séries numérotées, toujours avec une réponse proposée |
| `fiches.md` | Comment on écrit une fiche Linear, et comment on lui donne une taille, une date et une priorité |
| `git.md` | Le nommage des branches, le modèle de PR, le fonctionnement du verrou |
| `linear.md` | Les limites de la connexion à Linear et la façon de les contourner |
| `domaine.md` | Le glossaire du produit et les décisions durables : quand en écrire une, et sous quelle forme |
| `tests.md` | Ce qu'est un bon test, les trois mauvais à refuser, et ce qu'on a le droit de simuler |
| `smells.md` | Les douze « odeurs » de code (des signes qu'un code va mal vieillir) et le remède de chacune. Le verifier la lit. |
| `design-agents.md` | Ce que les agents font du système de design quand il existe : couleurs, polices, composants |
| *Modèles à remplir (6)* | |
| `template-feature.md` | Le formulaire d'une fiche feature : problème, ce que l'utilisateur pourra faire, décisions produit, contrat |
| `template-tache.md` | Le formulaire d'une tâche : problème, ce qu'on fait, cases « Terminé quand », cas de test |
| `template-bug.md` | Le formulaire d'un bug : comment le reproduire pas à pas, ce qui est attendu, ce qui arrive |
| `MISSION.template.md` | L'ordre de mission d'un morceau livrable : ses fichiers, ses phrases du contrat, ses décisions |
| `AGENT.template.md` | Comment s'écrit une fiche d'agent, pour en créer une ou en modifier une |
| `section-pilot.md` | Le bloc à coller dans le `CLAUDE.md` d'un projet pour le déclarer piloté |

**Les trois outils.**

| Outil | Ce que c'est |
|---|---|
| `cout-agents` | Un programme Python qui lit les journaux des agents. Il donne, pour chaque morceau livrable, le temps passé et les jetons consommés. Un petit script ouvre un panneau de suivi en direct dès qu'un agent démarre. |
| `passe-visuelle` | Un programme JavaScript qui ouvre l'application dans un navigateur invisible, prend les captures d'écran et mesure les défauts. Le testeur s'en sert. |
| `verrou-git` | Un programme Python appelé avant chaque commande. Il refuse tout merge, tout envoi direct sur la branche principale et tout envoi forcé. Il a ses propres tests. |

**Les règles qui la font tenir.**

| Règle | Nombre | Rôle | Détail |
|---|---|---|---|
| Invariants | 7 | Fixer les règles qui tiennent quelle que soit la commande | dont 3 jamais négociés : merge humain, décisions remontées, test avant code |
| Validations par projet | 2, plus 2 avec des écrans | Vérifier que le produit et son plan sont les bons avant de construire | la page produit et la liste des fonctionnalités ; avec des écrans, la direction visuelle et le système de design |
| Validations par fonctionnalité | 4 | Garder la main là où une erreur coûte cher, et nulle part ailleurs | le contrat, le découpage, le merge, les règles à retenir |
| Phrases du contrat | 10 à 30 | Dire avant le code ce qui devra être vrai, pour juger le résultat dessus | dont au moins un tiers de refus |
| PR par morceau livrable | 1 | Livrer par petits morceaux, faciles à relire et à défaire | |
| Passages du correcteur | 1 | Empêcher une boucle de corrections sans fin, qui coûte sans aboutir | jamais de deuxième tour |
| Niveaux de gravité | 3 | Montrer d'un coup d'œil ce qui bloque et ce qui peut attendre | bloquant, important, à considérer |
| Statuts d'une fonctionnalité | 6 | Dire où en est chaque fonctionnalité ; c'est Claude qui les pose | À cadrer, Planifiée, En développement, En revue, Terminée, Rétro faite |
| Statuts d'une tâche | 5 | Dire où en est chaque tâche ; c'est GitHub qui les met à jour | plus Bloquée et Annulée |

**Les six agents.** La limite est le nombre maximal d'échanges d'un agent ; au-delà, il est
arrêté. Fable sert à juger, Opus à fabriquer, Sonnet à exécuter.

| Agent | Quand | Ce qu'il fait | Ce qu'il ne fait jamais | Modèle | Limite |
|---|---|---|---|---|---|
| contradicteur | Liste des fonctionnalités, préparation d'une fonctionnalité | Cherche ce qui manque ou se contredit | Répondre à ma place | Fable | 50 |
| découpeur | Préparation d'une fonctionnalité | Partage le travail en morceaux qui ne se gênent pas | Décider seul | Fable | 70 |
| tdd-writer | Fabrication | Écrit le test, puis le code, puis ouvre la PR | Sortir de son morceau | Opus | 150 |
| verifier | Après la fabrication | Relit le code et vérifie les preuves | Corriger | Fable | 50 |
| testeur | Après la fabrication | Utilise l'application et prend des captures | Corriger | Sonnet | 60 |
| correcteur | Après les relectures | Répare la liste des défauts, une seule fois | Toucher à autre chose | Opus | 80 |

## Preuves

État au 15/10/2026 : utilisée tous les jours sur mes projets ; publiée le 09/10/2026.

- **Ce site.** 67 livraisons depuis le 29/08/2026, chacune avec sa tâche Linear et sa PR relue
  avant d'être acceptée.
- **Un projet client**, un assistant téléphonique qui prend les rendez-vous d'un diagnostiqueur
  immobilier, et **une application mobile de santé** : pilotés avec PILOT, tableau Linear mis à
  jour automatiquement à chaque livraison acceptée.
- **Le banc d'essai.** Avant de la brancher sur ces projets, je l'ai rodée sur un projet complet
  produit uniquement par cette méthode, un petit logiciel de gestion clients (23 livraisons). Le
  verifier y a attrapé 8 défauts sérieux que les tests ne voyaient pas, dont une fuite de
  données entre comptes, tous corrigés avant que je les voie. Une fonctionnalité que j'estimais à
  2,44 h de travail est sortie en 0,66 h.

Ce qui reste à prouver : je suis toujours devant l'écran pendant que les agents travaillent ; le
mode « je lance deux chantiers et je reviens le soir » n'est pas encore fait.

## Ce que j'en ai appris

- **Des tests qui passent ne disent pas que le code est sûr.** Ce qui attrape les vrais défauts,
  c'est un relecteur qui n'a pas écrit le code.
- **Ce qui n'est pas demandé n'est pas fait.** Les agents n'avaient pas soigné l'apparence parce
  que personne ne l'avait demandé. C'est ce qui m'a fait ajouter le testeur, qui regarde l'écran.
- **Le contrat doit dire ce qui est interdit, pas seulement ce qui est attendu.** La plupart des
  défauts venaient de cas négatifs que personne n'avait écrits.
- **Le modèle le plus puissant n'est pas le meilleur partout.** Pour juger, il voit plus. Pour
  exécuter une consigne précise, un modèle moins cher fait le même travail.

## Artefacts

- Méthode PILOT, prête à installer : https://github.com/cedricgicquiaud/pilot-method
- Schéma du circuit (page HTML) :
  https://github.com/cedricgicquiaud/pilot-method/blob/main/circuit-linear-github-claude.html
