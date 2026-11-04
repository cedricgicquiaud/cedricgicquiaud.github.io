---
nom: Documentation de workflows n8n
statut: livré
periode: 2025
role: conception et construction, seul, pour mon instance n8n
stack: n8n, OpenAI, API n8n
stack_detail:
  - categorie: Automatisation
    outils: n8n, API n8n
  - categorie: Modèle
    outils: OpenAI
  - categorie: Script
    outils: JavaScript (nœud Code de n8n)
visibilite: prive
depot:
demo:
ordre: 10
visuel: /projets/documentation-workflows/workflow.webp
---

# Documentation de workflows n8n

**En bref.** Chaque nuit, l'IA relit les workflows n8n modifiés dans la journée et colle à côté
de chacun une note qui explique ce qu'il fait. La documentation existe sans que personne ne
l'écrive. Workflow privé.

## Problème

Construire un workflow allait vite ; le documenter ne se faisait jamais. Quelques semaines plus
tard, il fallait tout relire pour comprendre ce qu'il faisait et pourquoi.

## Livrables

- Un workflow n8n qui tourne chaque nuit sur mon instance.
- Une note de documentation posée à côté de chaque workflow modifié : objectif, chemin des
  données, rôle de chaque étape, accès nécessaires.

## Architecture

Un déclencheur planifié lance le workflow chaque nuit. Il récupère par l'API de n8n la liste de
tous les workflows, puis ne garde que ceux modifiés dans les dernières 24 heures.

Une boucle les traite un par un. Pour chacun, OpenAI rédige la documentation en Markdown. Un
script calcule où placer la note sur le canevas et la met en forme. Le workflow est enfin
réenregistré par l'API, avec sa nouvelle note.

## Décisions

### La documentation à côté du workflow, pas dans un autre outil

On la lit au moment où l'on ouvre le workflow ; un document rangé ailleurs, personne ne va le
chercher.

### Seulement ce qui a changé

Le filtre des 24 heures limite le travail aux workflows touchés dans la journée : la
documentation suit les modifications, sans tout réécrire chaque nuit.

## Preuves

État au 28/10/2026 : livré en 2025.

- Le workflow a documenté chaque nuit les workflows modifiés de mon instance n8n, lui compris :
  la note visible sur la capture a été écrite par l'IA.

## Ce que j'en ai appris

- **Une documentation que personne n'écrit doit s'écrire seule.** Même idée dans mes projets
  actuels : la trace se produit pendant le travail, pas après.

## Artefacts

- Capture du workflow et de sa note (ci-dessus).
- Workflow (JSON) : privé.
