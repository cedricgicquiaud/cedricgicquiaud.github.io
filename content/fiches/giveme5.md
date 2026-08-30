---
nom: GiveMe5
statut: livré
periode: août 2023 → juillet 2026
role: idée, produit physique, développement, automatisations, déploiement, vente — seul ; 2023 avec ChatGPT, 2025 en n8n/Make, 2026 avec Claude Code
stack: Python/Django 5.2, MySQL, Google Drive API, Google Places API, n8n, Make, Airtable, Pipedrive, Qonto, OpenAI (GPT-4o-mini), HTML/CSS/JS sans build, Stripe Payment Link, GitHub Actions, PythonAnywhere, Coolify/nginx
visibilite: vitrine
depot: https://github.com/cedricgicquiaud/GM5_landing
demo: à confirmer (le README donne hello.giveme5xxxxx.fr, domaine à vérifier)
ordre: 6
---

# GiveMe5 — une plaque sur le comptoir, un avis Google en trente secondes

**En bref.** Des plaques et cartes NFC / QR code vendues aux commerçants : le client approche
son téléphone et arrive directement sur le formulaire d'avis Google de la boutique. Mon premier
produit, vendu 49 € pièce, avec un backoffice Django, trois automatisations n8n/Make et une
landing Stripe — écrit en 2023, outillé en 2025, remis à jour en 2026. Landing publique ;
backoffice privé.

## Problème

Un commerçant vit de sa note Google. Un client satisfait ne laisse presque jamais d'avis :
il faudrait chercher la fiche, se connecter, écrire. Demander à l'oral ne marche pas, et
envoyer un lien par SMS suppose d'avoir le numéro.

Il fallait un objet posé sur le comptoir qui enlève toutes les étapes : pas d'application,
pas de compte à créer sur place, pas de recherche. Le client scanne ou approche son téléphone,
il est déjà sur la bonne page, il note.

Contrainte côté vendeur : chaque plaque doit pouvoir être liée à n'importe quelle boutique
après fabrication, sans intervention technique. On fabrique en série, on associe plus tard.

## Ce que j'ai construit

Trois temps, un produit physique.

**2023 — le backoffice (privé, Django).** Trois applications : les données (`GM5_BDD`), la
génération de produits (`GM5_PRODUCTS`), la page vue par le client (`GM5_IHM`).
- Chaque plaque reçoit une URL unique construite sur un horodatage à la microseconde.
  Un formulaire dans l'admin génère N plaques d'un type donné en une fois ; le QR code est
  produit en SVG et déposé sur Google Drive pour l'impression.
- **Première activation par le commerçant lui-même.** Au premier scan, la plaque affiche un
  champ de recherche Google Places : le commerçant tape le nom de sa boutique, choisit, et
  l'adresse de son formulaire d'avis Google est enregistrée. À partir de là, tout scan
  redirige vers cette page. Aucune configuration à faire côté vendeur.
- Django parce que l'admin est fourni : gérer les plaques, voir celles qui sont activées,
  sans écrire d'écran.

**2025 — les automatisations autour du produit (n8n / Make).** Le but : vendre et servir
sans y passer mes soirées.
- **Service client** : un chatbot (« Aline ») qui répond aux questions des commerçants.
  Il cherche la réponse dans une base de connaissances stockée sur Google Drive
  (recherche vectorielle, c'est-à-dire par sens et non par mot exact) et la formule avec
  GPT-4o-mini.
- **Facturation** : une nouvelle vente dans Pipedrive (le CRM) déclenche une vérification,
  la création du client et de la facture dans Qonto (la banque), puis l'envoi par Gmail.
  Plus de facture faite à la main.
- **Communication** : des posts Facebook générés depuis un tableau Airtable, par un scénario
  Make et ChatGPT.

**2026 — la landing (publique) et la remise à niveau.** Trois pages : la présentation
complète (vidéo, arguments, simulateur du nombre d'avis, témoignages, FAQ), un tunnel court
`/commande/` envoyé par SMS après un appel téléphonique, les mentions légales.
- **Statique, sans build.** HTML/CSS/JS à la main, images et vidéos hébergées avec le site.
  Une seule dépendance externe hors polices : Stripe. Rien à compiler, rien à casser.
- **Stripe Payment Link** plutôt qu'un tunnel maison : un lien, un paiement unique,
  pas de code de paiement à maintenir.
- Déploiement par push sur `main` (Coolify, nginx). Côté backoffice, déploiement automatique
  sur PythonAnywhere à chaque push (GitHub Actions, `git pull --ff-only` : le déploiement
  échoue plutôt que d'écraser une modification faite sur le serveur).

**La plaque.** Objet physique NFC + QR code (plaque ou carte), imprimé à partir des SVG
générés, vendu 49 € sans abonnement.

## Preuves

État au 30/08/2026 : Produit vendu, en maintenance.


- Produit vendu à de vraies boutiques, plaques en service (pas de chiffres de vente ici).
- Backoffice : 3 applications Django, 2 tables métier (`ProductType`, `Product`),
  3 routes utiles (génération, activation, redirection), Django 5.2 LTS / Python 3.12
  après mise à niveau depuis 4.2 en juillet 2026 ; `manage.py check` sans erreur
  (vérifié le 29/08/2026 sur un clone propre).
- Landing : 3 pages, 944 lignes de HTML au total, 6 boutons vers le même lien de paiement
  Stripe, un simulateur d'avis à deux curseurs (avis par jour × mois × 20 jours d'ouverture),
  4 questions de FAQ, 3 témoignages. Aucun fichier JavaScript externe.
- Automatisations : 3 workflows (service client, facturation, posts). Ils vivent dans
  n8n et Make, pas dans un dépôt : pas de chiffre vérifiable ici tant qu'ils ne sont pas
  exportés.

État honnête :
- **Zéro test automatisé** dans le backoffice : les trois `tests.py` sont vides
  (`manage.py test` : « Ran 0 tests »). Le code 2023 a été vérifié à la main.
- **Le dépôt backoffice ne peut pas devenir public** : une base SQLite de développement est
  commitée, le `settings.py` est suivi malgré le `.gitignore` (clé secrète Django en clair),
  et une clé d'API Google Maps est écrite en dur dans un gabarit. À nettoyer avant toute
  ouverture, avec rotation des clés.
- Des fichiers en double (`views1.py`, `qrcode_generator1.py`) traînent depuis 2023.
- L'adresse de mise à jour du lien d'avis ne vérifie pas qui l'appelle.
- Le chatbot n'est pas intégré à la landing publiée en juillet 2026 : le code ne contient
  aucun widget. Il tourne à côté.

## Ce que j'en ai appris

- **2023 : ça marche, mais je ne sais pas pourquoi.** Le premier code est sorti de
  conversations avec ChatGPT, collé et ajusté jusqu'à ce que ça tourne. L'historique le
  montre : deux semaines de commits « test », « retour arrière », « ddd », puis trois ans où
  presque chaque commit ne touche que `requirements.txt`. Le produit vivait, le code ne
  bougeait plus, parce que je n'osais pas y toucher.
- **2025 : automatiser ce qui coûte du temps, pas ce qui est joli.** Les trois workflows
  ont été choisis sur un critère : la tâche que je refaisais à chaque vente. La facturation
  d'abord, le service client ensuite. Sans code, en quelques soirées.
- **2026 : on rouvre avec une méthode.** Avec Claude Code, en un jour : Dependabot activé,
  dépendances vulnérables remontées, migration Django 4.2 → 5.2 et Python 3.12, déploiement
  automatique, le tout en branches et pull requests. Le code métier n'a pas changé ; c'est
  l'outillage autour qui manquait.
- **Vendre avant d'industrialiser.** Un lien Stripe et trois pages HTML suffisent pour
  encaisser. Le tunnel `/commande/` est né d'un besoin concret : après un appel, envoyer
  par SMS une page qui tient sur un écran de téléphone.
- **Ce que je ferais autrement** : ne jamais commiter une base ni une clé, même sur un dépôt
  privé ; écrire les trois tests qui protègent le cœur (génération, activation, redirection)
  avant la prochaine évolution ; exporter les workflows n8n/Make dans un dépôt pour qu'ils
  soient montrables.

## Artefacts

- Landing publique (code) : https://github.com/cedricgicquiaud/GM5_landing
- Site en ligne : à confirmer (domaine à vérifier)
- Photo de la plaque : `1_Plaque.jpg` (dans le dépôt privé, à publier ici)
- Backoffice : dépôt privé, non montrable en l'état (voir « État honnête »)
- Workflows n8n/Make : à exporter (JSON anonymisé) et à publier
- Manque : une courte vidéo du scan jusqu'à la page d'avis, une capture de l'écran
  d'activation, une capture du chatbot
