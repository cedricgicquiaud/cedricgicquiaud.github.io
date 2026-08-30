---
nom: BEN
statut: en cours (en pause depuis juin 2026 ; moteur et dashboard fonctionnels, alertes et calibration restantes)
periode: mars 2026 → juin 2026
role: conception, développement, tests, benchmark des modèles — seul, avec des agents de code
stack: Python, PyTorch, DINOv2, YOLOv8, NumPy, FastAPI, APScheduler, SQLite/SQLModel, SvelteKit, Tailwind, pytest
visibilite: anonyme
depot:
demo:
ordre: 7
---

# BEN — repérer une pièce précise dans un flux d'annonces, à partir de sa photo

**En bref.** Un outil de veille qui collecte des annonces de meubles à intervalles réguliers et
compare leurs photos à une liste d'images de référence, pour repérer des pièces de designers
avant les autres. 216 tests automatisés verts, 183 annonces réelles passées dans le pipeline,
un benchmark qui a fait changer de modèle en cours de route. Code privé : la collecte dépend
des conditions du site source.

## Problème

Un chineur professionnel cherche des pièces de designers précises (un fauteuil, une lampe, une
table). Elles apparaissent sur des sites d'annonces entre particuliers, noyées parmi des
milliers de meubles ordinaires. Le vendeur ne sait souvent pas ce qu'il vend : le titre dit
« fauteuil vintage », pas le nom du designer. Chercher par mots-clés ne sert donc à rien.

La seule information fiable, c'est la photo. Il faut regarder chaque photo de chaque nouvelle
annonce, la comparer à ce qu'on cherche, et le faire vite : la bonne pièce part en quelques
heures.

## Ce que j'ai construit

Un service qui tourne en continu. Toutes les 30 minutes, il récupère les nouvelles annonces
de deux catégories, télécharge les photos, calcule pour chacune une signature visuelle, la
compare à la liste de référence, et affiche les correspondances dans un dashboard web : photo
de référence et photo de l'annonce côte à côte, score, lien vers l'annonce.

Décisions qui ont compté :
- **Changer de modèle de vision après un benchmark.** Le prototype utilisait CLIP, le modèle
  le plus connu pour comparer des images. Sur de vraies photos de catalogue, il séparait mal
  les designers entre eux. Un benchmark contre DINOv2-large a montré un écart de séparation
  dix fois plus grand. J'ai jeté le prototype CLIP et reconstruit le moteur sur DINOv2.
- **Isoler le meuble avant de le comparer.** Une photo d'annonce est prise dans un salon
  encombré ; une photo de référence vient d'un catalogue sur fond blanc. Un détecteur d'objets
  (YOLOv8) découpe le meuble, puis un second modèle détoure son contour et le pose sur fond
  blanc, des deux côtés. Le score d'une vraie correspondance est passé de 0,74 à 0,88 ; celui
  d'un sosie est descendu de 0,55 à 0,50.
- **Pas de FAISS.** L'index de recherche vectorielle prévu au départ plantait sur ma machine
  et n'apportait rien pour une liste de moins de 200 références. Remplacé par un produit
  matriciel NumPy : plus simple, aucune dépendance binaire.
- **Passer par un service tiers pour la collecte.** Le site source bloque tout robot maison.
  Un service payant fournit les annonces sous forme structurée. J'ai donc construit un garde-fou
  de quota : chaque requête est comptée avant l'appel réseau, et le pipeline s'arrête proprement
  à 80 % du budget mensuel. La pagination s'arrête à la première annonce déjà vue, une liste
  noire de mots (enseignes de meubles industriels) écarte les annonces avant même de télécharger
  les photos.
- **Tout enregistrer pour calibrer plus tard.** Le seuil qui décide « c'est un match » ne peut
  pas être deviné. Le pipeline enregistre le meilleur score de chaque annonce, même sous le
  seuil, et le dashboard permet de confirmer ou rejeter à la main. Un script trace ensuite la
  courbe précision/rappel sur ces vraies données. Sous 0,40, l'annonce est archivée d'office :
  c'est du bruit.
- **Un seul processus.** Serveur web, planificateur et modèles chargés une fois en mémoire,
  dans le même processus Python, avec une base SQLite. Pas de file de messages, pas de Redis.
  Un test de concurrence garantit qu'une reconstruction de l'index pendant une comparaison ne
  renvoie jamais un résultat mélangé.

## Preuves

- 216 tests automatisés verts (vérifié le 29/08/2026 sur un clone propre, sans clé ni réseau).
  7 tests d'intégration supplémentaires exigent le téléchargement des modèles et n'ont pas été
  relancés.
- Benchmark CLIP contre DINOv2-large sur les photos de référence : séparation entre classes
  de 0,243 contre 0,025 (lu dans les notes de projet, non rejoué).
- Détourage : score d'une vraie correspondance de 0,74 à 0,88, sosie de 0,55 à 0,50 (lu dans
  l'historique du projet, non rejoué).
- 183 annonces réelles collectées et passées dans le pipeline de bout en bout, dédoublonnage
  vérifié en relançant sur les mêmes données : 0 doublon. Coût de la validation : 4 requêtes
  sur les 50 de l'essai gratuit.
- Catalogue de référence : 44 images, 4 designers.
- Aucune donnée personnelle de vendeur en base : le schéma n'a pas de colonne pour ça.

État honnête : l'outil n'a pas encore tourné en production sur la durée. Le seuil de décision
(0,78 par défaut) n'est pas calibré sur données réelles, et les notifications sont volontairement
bloquées tant qu'il ne l'est pas. Le développement est en pause depuis juin 2026. La collecte
dépend des conditions du site source ; le code n'est pas publié.

## Ce que j'en ai appris

- **Le modèle de référence n'est pas forcément le bon.** J'avais pris CLIP parce que tout le
  monde le cite. Un benchmark d'une journée a montré qu'il ne faisait pas le travail. Mesurer
  avant de construire dessus.
- **Un audit à mi-parcours a trouvé trois défauts que je n'avais pas vus** : un bug de
  concurrence entre le planificateur et l'API, des images de référence dont la transparence
  était posée sur fond noir (ce qui faussait toutes les signatures), et un seuil calibré sur
  ces signatures faussées. Une phase de durcissement a été insérée avant toute donnée réelle.
- **Le seuil est une donnée, pas une constante.** Le fixer d'avance était une erreur ; le
  produit doit d'abord enregistrer des scores et des retours humains, puis le seuil en découle.
- **Les outils lourds ne sont pas toujours nécessaires.** FAISS et l'accélération GPU ont
  été retirés : moins de plantages, même résultat.
- **La contrainte juridique se traite au début.** J'ai d'abord cru l'usage couvert par la
  jurisprudence ; en relisant les décisions, c'était faux. Le projet reste privé et ne republie
  rien.

## Artefacts

- Schéma du pipeline (collecte → découpe → signature → comparaison → dashboard) : à produire
- Captures du dashboard sur données fictives (feed, watchlist, réglages) : à produire
- Courbe précision/rappel du script de calibration sur un jeu anonymisé : à produire
