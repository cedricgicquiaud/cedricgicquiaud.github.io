---
nom: Facturation automatique (GiveMe5)
statut: livré
periode: 2025 → aujourd'hui
role: conception, construction et mise en service, seul, pour GiveMe5
stack: Make, Pipedrive, Qonto, Gmail
visibilite: prive
depot:
demo:
ordre: 11
visuel: /projets/facturation-giveme5/scenario.webp
---

# Facturation automatique (GiveMe5) — de la vente à la facture envoyée

**En bref.** Une vente enregistrée dans le CRM crée le client et la facture à la banque, puis
l'envoie par e-mail au client. Plus aucune facture faite à la main pour GiveMe5. Scénario privé.

## Problème

Chaque vente de plaque demandait le même enchaînement : créer le client à la banque, faire la
facture, lui donner un numéro, l'envoyer. Répétitif, avec à la clé des doublons et des oublis.

## Ce que j'ai construit

Un scénario Make déclenché par chaque vente dans Pipedrive :
- il récupère le produit, la quantité, le prix et le client ;
- il cherche le client dans Qonto et le crée s'il n'existe pas encore ;
- il crée la facture avec le numéro suivant, puis envoie au client un e-mail avec le lien de
  téléchargement.

Décision qui a compté :
- **Vérifier avant de créer.** Le client est toujours recherché avant d'être créé : jamais de
  doublon dans la comptabilité.

## Preuves

État au 28/10/2026 : en production depuis 2025.

- Toutes les ventes de GiveMe5 passent par ce scénario.

## Ce que j'en ai appris

- **Automatiser d'abord ce qu'on refait à chaque vente**, pas ce qui impressionne.

## Artefacts

- Capture du scénario (ci-dessus).
- Fiche du produit : https://cedricgicquiaud.github.io/projets/giveme5/
