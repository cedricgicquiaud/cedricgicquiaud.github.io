---
nom: Facturation GiveMe5
statut: livré
periode: 2025 → aujourd'hui
role: conception, construction et mise en service, seul, pour GiveMe5
stack: Make, Pipedrive, Qonto, Gmail
stack_detail:
  - categorie: Automatisation
    outils: Make (webhook, routeur, stockage de données)
  - categorie: CRM
    outils: Pipedrive
  - categorie: Banque et facturation
    outils: Qonto
  - categorie: Envoi
    outils: Gmail
visibilite: prive
depot:
demo:
ordre: 11
visuel: /projets/facturation-giveme5/scenario.webp
---

# Facturation GiveMe5

**En bref.** Une vente enregistrée dans le CRM crée le client et la facture à la banque, puis
l'envoie par e-mail au client. Plus aucune facture faite à la main pour GiveMe5. Scénario privé.

## Problème

Chaque vente de plaque demandait le même enchaînement : créer le client à la banque, faire la
facture, lui donner un numéro, l'envoyer. Répétitif, avec à la clé des doublons et des oublis.

## Livrables

- Un scénario Make en production, déclenché par chaque vente enregistrée dans Pipedrive.
- La création automatique du client à la banque, s'il n'existe pas encore.
- Une facture numérotée à la suite, envoyée au client par e-mail avec son lien de
  téléchargement.

## Architecture

Une vente dans Pipedrive appelle le scénario. Il lit l'affaire et ses produits (quantité, prix),
puis cherche le client dans Qonto.

Un routeur sépare alors deux chemins :
- **client connu** : la facture est créée directement ;
- **nouveau client** : le client est d'abord créé dans Qonto, puis la facture.

Le dernier numéro de facture est gardé dans un stockage de données de Make. Il est lu avant la
création, puis augmenté de un. Gmail envoie enfin le lien de la facture au client.

## Décisions

### Vérifier avant de créer

Le client est toujours recherché avant d'être créé : jamais de doublon dans la comptabilité.

### Un compteur de factures tenu par le scénario

Le numéro suivant est lu puis incrémenté à chaque passage. Les factures se suivent sans
numéro tapé à la main.

## Preuves

État au 28/10/2026 : en production depuis 2025.

- Toutes les ventes de GiveMe5 passent par ce scénario.

## Ce que j'en ai appris

- **Automatiser d'abord ce qu'on refait à chaque vente**, pas ce qui impressionne.

## Artefacts

- Capture du scénario (ci-dessus).
- Fiche du produit : https://cedricgicquiaud.github.io/projets/giveme5/
