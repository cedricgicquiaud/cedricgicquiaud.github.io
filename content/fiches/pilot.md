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
captures:
  - fichier: /projets/pilot/agents.png
    legende: "Les six agents de PILOT : leur rôle, et ce que chacun a le droit de faire. Seuls deux d'entre eux modifient le code."
  - fichier: /projets/pilot/linear.png
    legende: "Une tâche réelle de ce site dans Linear : le problème, ce qu'on fait, et la liste « Terminé quand », refus compris, que les agents doivent tenir."
  - fichier: /projets/pilot/pr.png
    legende: "La PR qui livre cette tâche, écrite par l'agent : le code de la tâche dans le titre, ce qui change expliqué en clair, acceptée par moi."
---

# PILOT — workflow agentique

**En bref.** Un workflow agentique, ma méthode d'agentic engineering : je décide quoi construire,
une équipe de six agents IA écrit le code, le relit et le corrige, et je valide chaque livraison
avant qu'elle parte. Je l'utilise sur mes projets réels, dont ce site (67 livraisons depuis fin août). Méthode
publique, sous licence libre.

## Problème

Un agent IA comme Claude Code écrit du code très vite. La difficulté n'est plus d'écrire : c'est
de savoir si ce qui est écrit est juste, et de garder le fil d'un projet qui dure des semaines.

Laissé seul, un agent fait trois choses que je ne veux pas :
- **il décide à ma place.** Exemple : qui a le droit de voir une facture. C'est une décision
  produit, elle me revient ;
- **il écrit les tests après le code.** Un test, c'est un petit programme qui vérifie que le
  code fait ce qu'on attend. Écrit après coup, il confirme le code au lieu de le contrôler ;
- **il se relit lui-même**, et ne voit donc pas ses propres erreurs.

PILOT répond aux deux problèmes : un tableau de bord pour savoir où en est le projet, et une
équipe d'agents où celui qui écrit le code n'est jamais celui qui le vérifie.

## Ce que j'ai construit

**Trois outils, un rôle chacun.**
- **Linear**, le tableau de bord : chaque fonctionnalité, ses tâches et leur état. C'est le
  seul écran que je regarde au quotidien.
- **GitHub**, l'atelier : le code, et une demande de modification (une « PR ») par livraison,
  que je relis avant de l'accepter.
- **Claude Code**, l'équipe : six agents IA, chacun avec un poste précis.

Le numéro de la tâche Linear figure dans le nom de chaque PR. Quand j'accepte une PR, Linear
coche la tâche tout seul : personne ne met le tableau à jour à la main.

**Le déroulé d'une fonctionnalité, en cinq étapes.**
1. **Cadrer.** Je décris ce que je veux. Avec les agents, j'écris la liste de ce qui devra être
   vrai à la fin, en 10 à 30 phrases vérifiables. Exemple : « une facture émise ne peut plus
   être modifiée ». Je valide.
2. **Découper.** La fonctionnalité est coupée en livraisons qui ne touchent pas les mêmes
   fichiers, pour pouvoir avancer en parallèle. Je valide.
3. **Produire.** Les agents écrivent, vérifient et corrigent, sans moi.
4. **Accepter.** Je lis le rapport des agents, je tranche les questions qu'ils me posent, et
   j'accepte la livraison.
5. **Apprendre.** Chaque erreur trouvée devient une règle écrite que les agents liront la fois
   suivante.

**Les six agents et leur rôle.**
- **Le contradicteur** relit le cadrage avant que je le valide. Il cherche ce qui manque : un
  cas oublié, une phrase impossible à vérifier, deux règles qui se contredisent. Il pose des
  questions, il ne répond pas à ma place. Il ne fait que lire.
- **Le découpeur** propose les livraisons. Il vérifie qu'aucune ne touche les fichiers d'une
  autre, et que chaque phrase du cadrage est rattachée à une livraison. Il ne fait que lire.
- **Le producteur** écrit le code, seul dans sa propre copie du projet. Il commence toujours
  par le test : il écrit un test qui échoue, puis le code qui le fait passer, et enregistre
  chaque étape séparément. Ainsi on peut prouver après coup que le test était là avant le code.
  S'il rencontre une décision qui n'est pas dans sa mission, il ne la tranche pas : il prend
  l'option la plus facile à défaire et me la signale.
- **Le vérificateur** relit le code sans l'avoir écrit : sécurité, respect des règles du projet,
  chaque phrase du cadrage couverte par un test, test écrit avant le code. Il relance lui-même
  les tests. Il ne modifie rien.
- **Le testeur** ouvre l'application dans un navigateur, sur ordinateur et sur mobile, et joue
  les scénarios prévus comme le ferait un utilisateur. Il signale ce qui cloche à l'écran. Il ne
  modifie rien.
- **Le correcteur** corrige uniquement les défauts relevés par le vérificateur et le testeur, en
  un seul passage. S'il en reste, la livraison m'arrive marquée « à ne pas accepter en l'état ».

Chaque agent a le modèle d'IA qui fait le mieux son poste, choisi par des essais comparés :
Opus écrit et corrige, Fable vérifie et relit le cadrage, Sonnet teste à l'écran.

**Trois règles qui ne bougent jamais.** J'accepte moi-même chaque livraison. Les décisions de fond
me reviennent. Pas de code sans test écrit avant.

Le tout tient dans des fichiers texte et quelques scripts, installés dans chaque projet en une
commande. Une commande, `next`, lit Linear et me dit quoi faire ensuite.

## Preuves

État au 14/10/2026 : utilisée tous les jours sur mes projets ; publiée le 09/10/2026.

- **Ce site.** 67 livraisons depuis le 29/08/2026, chacune avec sa tâche Linear et sa PR relue
  avant d'être acceptée.
- **Un projet client**, un assistant téléphonique qui prend les rendez-vous d'un diagnostiqueur
  immobilier, et **une application mobile de santé** : pilotés avec PILOT, tableau Linear mis à
  jour automatiquement à chaque livraison acceptée.
- **Le banc d'essai.** Avant de la brancher sur ces projets, je l'ai rodée sur un projet complet
  produit uniquement par cette méthode, un petit logiciel de gestion clients (23 livraisons). Le
  vérificateur y a attrapé 8 défauts sérieux que les tests ne voyaient pas, dont une fuite de
  données entre comptes, tous corrigés avant que je les voie. Une fonctionnalité que j'estimais à
  2,44 h de travail est sortie en 0,66 h.

Ce qui reste à prouver : je suis toujours devant l'écran pendant que les agents travaillent ; le
mode « je lance deux chantiers et je reviens le soir » n'est pas encore fait.

## Ce que j'en ai appris

- **Des tests qui passent ne disent pas que le code est sûr.** Ce qui attrape les vrais défauts,
  c'est un relecteur qui n'a pas écrit le code.
- **Ce qui n'est pas demandé n'est pas fait.** Les agents n'avaient pas soigné l'apparence parce
  que personne ne l'avait demandé. C'est ce qui m'a fait ajouter le testeur, qui regarde l'écran.
- **Le cadrage doit dire ce qui est interdit, pas seulement ce qui est attendu.** La plupart des
  défauts venaient de cas négatifs que personne n'avait écrits.
- **Le modèle le plus puissant n'est pas le meilleur partout.** Pour juger, il voit plus. Pour
  exécuter une consigne précise, un modèle moins cher fait le même travail.

## Artefacts

- Méthode PILOT, prête à installer : https://github.com/cedricgicquiaud/pilot-method
- Schéma du circuit (page HTML) :
  https://github.com/cedricgicquiaud/pilot-method/blob/main/circuit-linear-github-claude.html
