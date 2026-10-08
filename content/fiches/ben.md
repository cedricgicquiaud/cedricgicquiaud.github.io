---
nom: BEN
statut: livré
periode: mars 2026 → juin 2026
role: conception, développement, tests, benchmark des modèles — seul, avec des agents de code
stack: Python, PyTorch, DINOv2, YOLOv8, NumPy, FastAPI, APScheduler, SQLite/SQLModel, SvelteKit, Tailwind, pytest
visibilite: anonyme
depot:
demo:
ordre: 7
visuel: /projets/ben/accueil.png
captures:
  - fichier: /projets/ben/marche.webp
    legende: "Le marché : chaque annonce analysée, classée par ressemblance, avec la ligne de seuil. Photos et textes floutés."
  - fichier: /projets/ben/references.webp
    legende: La liste des pièces recherchées, photos de référence encodées à l'ajout. Noms et photos floutés.
  - fichier: /projets/ben/reglages.webp
    legende: Les réglages de la chasse et du seuil de similarité.
chiffres:
  - valeur: "× 10"
    libelle: séparation entre designers, DINOv2 contre CLIP
  - valeur: "0,74 → 0,88"
    libelle: score d'une vraie correspondance, une fois le meuble détouré
  - valeur: "183"
    libelle: annonces réelles passées de bout en bout, 0 doublon
---

# BEN — chasseur de design

**En bref.** Un chasseur de design : il collecte des annonces de meubles à intervalles réguliers et
compare leurs photos à une liste d'images de référence, pour repérer des pièces de designers
avant les autres. 183 annonces réelles passées dans le pipeline, et un benchmark qui a fait
changer de modèle en cours de route. Code privé : la collecte dépend des conditions du site source.

## Problème

Un chineur professionnel cherche des pièces de designers précises (un fauteuil, une lampe, une
table). Elles apparaissent sur des sites d'annonces entre particuliers, noyées parmi des
milliers de meubles ordinaires. Le vendeur ne sait souvent pas ce qu'il vend : le titre dit
« fauteuil vintage », pas le nom du designer. Chercher par mots-clés ne sert donc à rien.

La seule information fiable, c'est la photo. Il faut regarder chaque photo de chaque nouvelle
annonce, la comparer à ce qu'on cherche, et le faire vite : la bonne pièce part en quelques
heures.

## Ce que j'ai construit

Un service qui tourne en continu. À intervalle réglable, il récupère les nouvelles annonces de
deux catégories, télécharge les photos, calcule pour chacune une signature visuelle, la compare
à la liste de référence, et affiche les correspondances dans un tableau de bord web : photo de
référence et photo de l'annonce côte à côte, score, lien vers l'annonce.

**Le trajet d'une annonce.**
- **Collecter.** Les nouvelles annonces arrivent par un service tiers, sous forme structurée.
  La collecte s'arrête à la première annonce déjà vue.
- **Filtrer.** Une liste noire de mots écarte les meubles industriels avant même de
  télécharger les photos.
- **Isoler.** Un détecteur d'objets (YOLOv8) découpe le meuble, puis un second modèle le
  détoure et le pose sur fond blanc, comme une photo de catalogue.
- **Comparer.** Chaque photo devient une signature (DINOv2), comparée d'un coup à toute la
  liste de référence.
- **Trier.** Le tableau de bord classe les annonces par ressemblance. On valide ou on écarte ;
  chaque retour nourrit la calibration du seuil.

Décisions qui ont compté :
- **Changer de modèle de vision après un benchmark.** Le prototype utilisait CLIP, le modèle
  le plus connu pour comparer des images. Sur de vraies photos de catalogue, il séparait mal
  les designers entre eux. Un benchmark contre DINOv2-large a montré un écart de séparation
  dix fois plus grand. J'ai reconstruit le moteur sur DINOv2.
- **Isoler le meuble avant de le comparer.** Une photo d'annonce est prise dans un salon
  encombré ; une photo de référence vient d'un catalogue sur fond blanc. Détourer des deux
  côtés fait passer le score d'une vraie correspondance de 0,74 à 0,88, et descendre celui
  d'un sosie de 0,55 à 0,50.
- **Un produit matriciel plutôt qu'un index vectoriel.** Pour une liste de moins de 200
  références, NumPy suffit : plus simple, aucune dépendance binaire.
- **Un garde-fou de quota.** La collecte passe par un service payant. Chaque requête est
  comptée avant l'appel réseau, et le pipeline s'arrête proprement à 80 % du budget mensuel.
- **Tout enregistrer pour calibrer.** Le pipeline garde le meilleur score de chaque annonce,
  même sous le seuil. Les retours « vraie pièce / sosie » du tableau de bord alimentent un
  script qui trace la courbe précision/rappel ; les notifications attendent ce seuil calibré.
- **Un seul processus.** Serveur web, planificateur et modèles chargés une fois en mémoire,
  dans le même processus Python, sur une base SQLite. Un test de concurrence garantit qu'une
  reconstruction de l'index pendant une comparaison ne renvoie jamais un résultat mélangé.

## Preuves

État au 08/10/2026 : V1 livrée — collecte, comparaison et tableau de bord fonctionnels ; en
pause depuis juin 2026. Relancée en local le 08/10 pour les captures de cette fiche.

- **183 annonces réelles** collectées et passées dans le pipeline de bout en bout ;
  dédoublonnage vérifié en relançant sur les mêmes données : 0 doublon. Coût de la validation :
  4 requêtes sur les 50 de l'essai gratuit.
- **Benchmark CLIP contre DINOv2-large** sur les photos de référence : séparation entre
  designers de 0,243 pour DINOv2 contre 0,025 pour CLIP, consigné dans le journal de
  décisions du projet (21/03/2026).
- **Détourage** : score d'une vraie correspondance de 0,74 à 0,88, sosie de 0,55 à 0,50.
- **Liste de référence** : 37 pièces de 4 designers, encodées à l'ajout.
- **Aucune donnée personnelle de vendeur en base** : le schéma n'a pas de colonne pour ça.
- 216 tests automatisés.

## Ce que j'en ai appris

- **Mesurer avant de construire dessus.** CLIP est le modèle que tout le monde cite. Un
  benchmark d'une journée a montré que DINOv2 faisait mieux le travail.
- **Un audit avant la première donnée réelle.** Une phase de durcissement, insérée avant de
  brancher la collecte, coûte moins cher que des signatures à recalculer ensuite.
- **Le seuil est une donnée, pas une constante.** Le produit enregistre d'abord des scores et
  des retours humains ; le seuil en découle.
- **Les outils lourds ne sont pas toujours nécessaires.** Sans index vectoriel ni
  accélération GPU : moins de dépendances, même résultat.
- **La contrainte juridique se traite au début.** Les décisions de justice relues avant la
  collecte ont fixé le cadre : rien n'est republié, aucune donnée de vendeur n'est gardée, le
  code reste privé.

## Artefacts

- Schéma du pipeline et captures du tableau de bord : sur cette page
- Code privé : présentation du projet sur demande
