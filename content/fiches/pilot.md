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
  - fichier: /projets/pilot/rapport-audit.png
    legende: "Rapport d'audit posté par la boucle dans une PR du bac à sable, avant mon merge : ce qui est prouvé, ce que je dois juger, les décisions à trancher."
  - fichier: /projets/pilot/historique.png
    legende: "Historique git d'une livraison du bac à sable : un commit de test rouge, puis le code qui le fait passer."
---

# PILOT — workflow agentique

**En bref.** Un workflow agentique, ma méthode d'agentic engineering : six agents IA spécialisés
cadrent, produisent, vérifient et corrigent le code, pilotés par Linear et GitHub, et celui qui
écrit le code n'est jamais celui qui le vérifie.
Éprouvé sur un bac à sable, sur ce site et sur deux projets réels : 8 défauts attrapés par l'audit
derrière des tests verts, 0,66 h de session là où mon barème en prévoyait 2,44. Méthode publique,
sous licence libre ; remplace FORGE, ma première version (avril 2026).

## Problème

Avec des agents de code, écrire n'est plus le goulot. Vérifier l'est. Sur mon bac à sable, une
feature estimée à 2,44 h avec mon barème d'avant est sortie en 0,66 h de session. Le temps
restant, c'est le mien : lire, valider, merger.

Un agent laissé seul a trois travers :
- il tranche en chemin des décisions de fond (une règle de sécurité, un choix d'architecture)
  qui me reviennent ;
- il écrit les tests après le code, et des tests écrits après confirment au lieu de chercher ;
- il se relit lui-même, et ne voit pas ce qu'un relecteur extérieur voit.

Ma première réponse, FORGE (avril 2026), était un rituel de documents que Claude exécutait seul,
en produisant, relisant et livrant lui-même. Il manquait un tableau de bord, un relecteur
indépendant et la preuve que le test précède le code.

## Ce que j'ai construit

Un circuit en cinq étapes. J'interviens à des moments fixes, et jamais entre :
1. **Cadrer** : les décisions produit et un contrat de 10 à 30 phrases « ce qui devra être vrai »,
   dont des refus. Je valide.
2. **Découper** : des livraisons qui ne touchent pas les mêmes fichiers, chaque phrase du contrat
   affectée à l'une d'elles. Je valide la liste avant toute création dans Linear.
3. **Produire** : la boucle d'agents tourne sans moi.
4. **Merger** : je lis le rapport d'audit, je merge, je tranche les décisions remontées.
5. **Apprendre** : chaque défaut trouvé à l'audit devient une règle dans le `CLAUDE.md` du dépôt.

Trois règles ne se négocient pas : je merge chaque livraison moi-même ; les décisions de fond me
remontent, l'agent prend l'option la plus réversible et la signale dans la PR ; pas de code sans
test préalable, prouvé par l'historique git (un commit pour le test rouge, un pour le code).

La boucle de production :
- un **producteur** (`tdd-writer`) par livraison, seul dans sa copie du dépôt (git worktree),
  avec un ordre de mission : périmètre strict, « tu ne tranches pas », arrêt après la PR ;
- deux **contrôleurs** qui n'ont pas écrit le code, en lecture seule : `verifier` lit le diff
  (sécurité, idiomes du projet, couverture du contrat, ordre test → code), `testeur` ouvre
  l'application et joue le cahier de recette ;
- un **correcteur** avec une liste fermée, en un seul aller-retour.

Au cadrage, deux agents de plus : le `decoupeur` propose les livraisons, le `contradicteur`
cherche ce qui manque. Chaque agent a ses outils limités et le modèle qui fait le mieux son poste,
choisi sur épreuve : Opus produit et corrige, Fable audite et juge le cadrage, Sonnet fait la
passe visuelle.

Le tout tient dans du Markdown et quelques scripts : une skill `pilot` à 8 commandes, six fiches
de poste, un gabarit de mission, une liste de commandes autorisées. Le code de la tâche Linear
voyage dans le nom de la branche et le titre de la PR : c'est ce qui fait avancer le tableau de
bord tout seul. `next` lit Linear et dit quoi faire ensuite, sans fichier d'état à entretenir.

## Preuves

État au 14/10/2026 : méthode rodée sur un bac à sable, branchée sur deux projets réels et sur ce
site ; publiée le 09/10/2026.

Bac à sable : « Carnet », un CRM léger en HTML/JS, produit du 22 au 28 août 2026 uniquement par
cette méthode.

- **Ça marche ?** 6 features livrées et « Terminées » dans Linear, soit 23 livraisons et
  67 tâches ; 269 tests verts sur `main` (vérifié le 29/08/2026 sur un clone propre). Les statuts
  automatiques (PR mergée → tâche terminée) tournent aussi sur deux projets réels depuis le
  24 août.
- **C'est solide ?** L'agent d'audit, qui n'a pas écrit le code, a attrapé 8 défauts bloquants
  ou importants derrière des tests verts (échappement HTML, permissions, injection dans un
  export CSV…), tous corrigés avant la PR. Trois producteurs en parallèle, sans conflit.
- **C'est utilisable ?** Une feature de 5 livraisons et 13 tâches produite en une seule
  instruction `run` : ~1,4 h de session, 0 bloquant. Une itération complète (production, audit,
  corrections, PR) prend 18 à 25 minutes par livraison.
- **Le goulot, mesuré** : 0,66 h de session pour la première feature, là où mon barème, calibré
  sur 344 PR de deux projets antérieurs, prévoyait 2,44 h. Le barème vient de projets réels, la
  mesure d'un bac à sable : l'écart dit surtout que mon temps de lecture domine.
- **Un modèle par poste** (bancs des 09 et 10/09/2026) : en audit, Fable relève deux défauts
  réels de plus que Sonnet pour le même temps ; en production, Opus couvre le contrat aussi bien
  que Fable avec 40 % de jetons en moins.

Ce qui reste à prouver : toutes les boucles ont tourné écran ouvert, pas encore deux chantiers
lancés écran fermé ; le choix du modèle par poste est à confirmer en run réel. Le bac à sable
reste privé.

## Ce que j'en ai appris

- **Des tests verts ne disent pas que c'est sûr.** La valeur est dans le relecteur indépendant,
  pas dans la plomberie.
- **Ce qui n'est pas dans la fiche n'existe pas.** L'interface du bac à sable était laide parce
  qu'aucune fiche n'avait demandé du beau. D'où le `testeur`, qui regarde l'écran.
- **Chaque « Terminé quand » contient un refus.** Les décisions remontées et les défauts d'audit
  avaient un point commun : des cas négatifs que la fiche ne disait pas.
- **Le parallèle se décide au découpage.** Trois producteurs ont tourné ensemble parce que
  j'avais découpé des livraisons disjointes ; un système qui découpe seul se marche dessus.
- **Le modèle le plus fort n'est pas le meilleur partout.** Là où l'agent juge, il voit plus ;
  là où il exécute un contrat, un modèle moins cher fait le même travail.
- **FORGE → PILOT.** J'ai gardé les pauses de validation de FORGE et remplacé sa production par
  la boucle producteur ≠ vérificateur, sans mode autonome. FORGE est archivé depuis le 27/08/2026.

## Artefacts

- Méthode PILOT (le circuit, la boucle agents, la skill et les six agents, prêts à installer) :
  https://github.com/cedricgicquiaud/pilot-method
- Schéma du circuit (page HTML) :
  https://github.com/cedricgicquiaud/pilot-method/blob/main/circuit-linear-github-claude.html
- Méthode v1, archivée : https://github.com/cedricgicquiaud/FORGE
