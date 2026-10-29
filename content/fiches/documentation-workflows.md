---
nom: Documentation automatique des workflows
statut: livré
periode: 2025
role: conception et construction, seul, pour mon instance n8n
stack: n8n, OpenAI, API n8n
visibilite: prive
depot:
demo:
ordre: 10
visuel: /projets/documentation-workflows/workflow.webp
---

# Documentation automatique des workflows — la note s'écrit seule, chaque nuit

**En bref.** Chaque nuit, l'IA relit les workflows n8n modifiés dans la journée et colle à côté
de chacun une note qui explique ce qu'il fait. La documentation existe sans que personne ne
l'écrive. Workflow privé.

## Problème

Construire un workflow allait vite ; le documenter ne se faisait jamais. Quelques semaines plus
tard, il fallait tout relire pour comprendre ce qu'il faisait et pourquoi.

## Ce que j'ai construit

- Chaque nuit, le workflow récupère par l'API de n8n tous les workflows modifiés dans les
  dernières 24 heures.
- Pour chacun, l'IA rédige une documentation : objectif, chemin des données, rôle de chaque
  étape, accès nécessaires.
- Un script la place dans une note, à côté du workflow, et enregistre le tout.

Décision qui a compté :
- **La documentation à côté du workflow, pas dans un autre outil.** On la lit au moment où l'on
  ouvre le workflow ; un document rangé ailleurs, personne ne va le chercher.

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
