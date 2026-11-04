---
nom: Chatbot GiveMe5
statut: livré
periode: 2025 → aujourd'hui
role: conception, construction et mise en service, seul, pour GiveMe5
stack: n8n, OpenAI (GPT-4o-mini), Google Drive
stack_detail:
  - categorie: Automatisation
    outils: n8n (agent IA, mémoire de conversation)
  - categorie: Modèles
    outils: OpenAI GPT-4o-mini, embeddings OpenAI
  - categorie: Documents
    outils: Google Drive
visibilite: prive
depot:
demo: https://hello.giveme5xxxxx.fr
ordre: 12
visuel: /projets/chatbot-giveme5/agent.webp
---

# Chatbot GiveMe5

**En bref.** Un assistant qui répond aux questions des commerçants à partir des documents de
GiveMe5, et refuse poliment tout ce qui sort du sujet. En service sur le site de vente.

## Problème

Les commerçants posaient toujours les mêmes questions : prix, fonctionnement, installation. Il
fallait répondre vite, y compris le soir, sans y passer mes journées.

## Livrables

- Un assistant de discussion en service sur le site de vente de GiveMe5.
- Une base de connaissances construite à partir des documents de GiveMe5, rangés dans Google
  Drive.
- Une réponse type pour toute question hors sujet.

## Architecture

Deux workflows n8n.

- **L'indexation.** Les documents sont téléchargés depuis Google Drive, découpés en morceaux,
  puis transformés en vecteurs par les embeddings d'OpenAI. Le résultat va dans une base
  vectorielle, qui permet de chercher par le sens et non par le mot exact.
- **La conversation.** Chaque message reçu déclenche un agent IA (GPT-4o-mini). Il dispose d'un
  outil de recherche dans cette base et d'une mémoire des cinq derniers échanges. Il cherche
  avant de répondre, puis répond court et affirmatif.

## Décisions

### Limiter le sujet

L'agent ne répond qu'aux questions sur GiveMe5 et ses produits ; pour le reste, une réponse
type. Il n'invente pas et ne dérape pas.

### Chercher avant de répondre

La réponse s'appuie sur les documents de GiveMe5, pas sur ce que le modèle croit savoir. Mettre
un document à jour, puis relancer l'indexation, suffit à changer la réponse.

## Preuves

État au 28/10/2026 : en production depuis 2025.

- En service sur le site de vente de GiveMe5.

## Ce que j'en ai appris

- **Un bon assistant tient à ses limites plus qu'à son modèle.** Lui interdire le hors-sujet a
  plus compté que le choix du modèle.

## Artefacts

- Capture du workflow (ci-dessus).
- Site de vente : https://hello.giveme5xxxxx.fr
- Fiche du produit : https://cedricgicquiaud.github.io/projets/giveme5/
