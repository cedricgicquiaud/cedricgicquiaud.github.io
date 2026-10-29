---
nom: Chatbot du service client (GiveMe5)
statut: livré
periode: 2025 → aujourd'hui
role: conception, construction et mise en service, seul, pour GiveMe5
stack: n8n, OpenAI (GPT-4o-mini), Google Drive
visibilite: prive
depot:
demo: https://hello.giveme5xxxxx.fr
ordre: 12
visuel: /projets/chatbot-giveme5/agent.webp
---

# Chatbot du service client (GiveMe5) — il répond à partir des documents, et seulement d'eux

**En bref.** Un assistant qui répond aux questions des commerçants à partir des documents de
GiveMe5, et refuse poliment tout ce qui sort du sujet. En service sur le site de vente.

## Problème

Les commerçants posaient toujours les mêmes questions : prix, fonctionnement, installation. Il
fallait répondre vite, y compris le soir, sans y passer mes journées.

## Ce que j'ai construit

Un agent IA dans n8n, en deux parties :
- **La base de connaissances.** Les documents de GiveMe5, rangés dans Google Drive, sont
  découpés et indexés pour une recherche par le sens, pas par le mot exact.
- **L'agent.** À chaque question, il cherche dans cette base avant de répondre, garde en mémoire
  les cinq derniers échanges et répond court et affirmatif.

Décision qui a compté :
- **Limiter le sujet.** L'agent ne répond qu'aux questions sur GiveMe5 et ses produits ; pour le
  reste, une réponse type. Il n'invente pas et ne dérape pas.

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
