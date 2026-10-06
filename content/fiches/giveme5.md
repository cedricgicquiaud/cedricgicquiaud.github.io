---
nom: GiveMe5
statut: livré
periode: août 2023 → aujourd'hui
role: idée, produit physique, développement, automatisations, déploiement, vente — seul ; 2023 avec ChatGPT, 2025 en n8n/Make, 2026 avec Claude Code
stack: Python/Django, MySQL, Google Places API, HTML/CSS/JS, Stripe, n8n/Make
visibilite: public
depot: https://github.com/cedricgicquiaud/giveme5
demo: https://hello.giveme5xxxxx.fr
ordre: 7
visuel: /projets/giveme5/accueil.png
captures:
  - fichier: /projets/giveme5/mobile.webp
    legende: La page de vente sur téléphone, là où arrivent la plupart des commerçants.
  - fichier: /projets/giveme5/commande.webp
    legende: La page de commande courte, envoyée par SMS après un appel.
  - fichier: /projets/giveme5/simulateur.webp
    legende: Le simulateur estime les avis à attendre selon le rythme de la boutique.
chiffres:
  - valeur: "200+"
    libelle: commerces équipés
  - valeur: "1"
    libelle: scan du comptoir au formulaire d'avis Google
  - valeur: "3 ans"
    libelle: de plaques en service, depuis 2023
---

# GiveMe5 — avis Google en un scan

**En bref.** Une plaque sur le comptoir, un avis Google en un scan : le client approche son
téléphone et arrive directement sur le formulaire d'avis de la boutique. Plus de 200 commerces
équipés, à 49 € sans abonnement. Site de vente public, backoffice privé.

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

Un produit physique et trois briques logicielles : un backoffice qui fabrique et redirige les
plaques, des automatisations autour de la vente, un site de vente.

**Le trajet d'une plaque.**
- **Fabrication.** Dans l'admin, on choisit un type (plaque ou carte) et une quantité. Chaque
  plaque reçoit une adresse unique ; son QR code part sur Google Drive pour l'impression, et
  la même adresse est écrite dans la puce NFC.
- **Premier scan, par le commerçant.** La plaque n'est liée à aucune boutique : elle affiche
  une recherche Google Places. Le commerçant tape le nom de sa boutique, Google renvoie
  l'identifiant de l'établissement, et l'adresse du formulaire d'avis est enregistrée.
- **Tous les scans suivants.** Le serveur redirige directement vers le formulaire d'avis
  Google de la boutique, sans page intermédiaire.

**Les automatisations (2025, n8n et Make).** Le but : vendre et servir sans y passer mes
soirées.
- **Facturation** : une vente dans le CRM déclenche la création du client et de la facture
  à la banque, puis l'envoi par e-mail. Plus de facture faite à la main.
- **Service client** : un chatbot qui répondait aux questions des commerçants à partir d'une
  base de connaissances, en cherchant par le sens et non par le mot exact.

**Le site de vente (2026).** La présentation complète avec un simulateur d'avis, une page de
commande courte envoyée par SMS après un appel, et un suivi des parrains : un lien
`?ref=marie` rattache la vente à Marie dans Stripe.

Décisions qui ont compté :
- **Lier la plaque après fabrication.** La plaque porte une adresse, pas une boutique. On
  imprime en série, on vend à n'importe qui, et c'est le commerçant qui l'active.
- **Rediriger sur le serveur, pas dans la plaque.** La puce et le QR code ne contiennent que
  l'adresse de la plaque. Une plaque activée est verrouillée : sa destination ne peut plus
  être changée, et seul un formulaire d'avis Google est accepté.
- **Django pour l'admin fourni** : gérer les plaques et voir celles qui sont activées, sans
  écrire d'écran.
- **Un site statique et un lien de paiement.** HTML écrit à la main, images et vidéos
  hébergées avec le site, Stripe Payment Link plutôt qu'un tunnel maison. Rien à compiler,
  pas de code de paiement à maintenir.
- **Automatiser ce que je refaisais à chaque vente**, la facturation d'abord, sans code.

## Preuves

État au 06/10/2026 : En production, maintenu.

- **Plus de 200 commerces équipés**, plaques en service.
- Backoffice : Django 5.2 LTS et Python 3.12 depuis juillet 2026, déploiement automatique à
  chaque merge. Depuis le 06/10/2026, 14 tests automatisés (activation, verrou, accès à la
  génération) et une CI qui installe les dépendances et génère un QR code sur chaque PR.
- Toutes les alertes de sécurité des dépendances sont fermées.
- Site de vente : trois pages statiques, un seul lien de paiement Stripe, un suivi des
  parrains vérifié en ligne.

## Ce que j'en ai appris

- **2023 : ça marche, mais je ne sais pas pourquoi.** Le premier code est sorti de
  conversations avec ChatGPT, collé et ajusté jusqu'à ce que ça tourne. Puis trois ans où
  presque chaque commit ne touche que les dépendances. Le produit vivait, le code ne bougeait
  plus, parce que je n'osais pas y toucher.
- **2025 : automatiser ce qui coûte du temps, pas ce qui est joli.** Les workflows
  ont été choisis sur un critère : la tâche que je refaisais à chaque vente.
- **2026 : on rouvre avec une méthode.** Avec Claude Code : Dependabot, migration vers
  Django 5.2, déploiement automatique, tests, le tout en branches et pull requests.
- **Un voyant vert ne voit que ce qu'il teste.** Une mise à jour de Django passait tous les
  tests, mais aurait empêché le site de démarrer en production : les tests tournent sur une
  autre base. Je l'ai refusée, et Dependabot ne la propose plus.
- **Vendre avant d'industrialiser.** Un lien Stripe et trois pages HTML suffisent pour
  encaisser.

## Artefacts

- Site de vente (code) : https://github.com/cedricgicquiaud/giveme5
- Site en ligne : https://hello.giveme5xxxxx.fr
- Backoffice : dépôt privé
- Workflows n8n/Make : à exporter (JSON anonymisé) et à publier
