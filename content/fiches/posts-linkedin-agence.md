---
nom: Posts LinkedIn d'agence web
statut: livré
periode: 2025 → aujourd'hui
role: conception, construction et mise en service, seul, en mission freelance pour une agence web
stack: n8n, Make, OpenAI (GPT-4o), Google Sheets, API LinkedIn
visibilite: prive
depot:
demo:
ordre: 9
visuel: /projets/posts-linkedin-agence/workflows.webp
---

# Posts LinkedIn d'agence web

**En bref.** Chaque mois, les posts LinkedIn des clients d'une agence web s'écrivent et se
publient seuls : l'IA choisit les thèmes selon le métier du client, rédige, programme, publie.
L'agence pilote tout depuis un Google Sheet. Workflows privés : ils contiennent des données de
clients.

## Problème

L'agence vendait à ses clients une présence régulière sur LinkedIn. Chaque mois, il fallait
trouver des sujets adaptés au métier de chacun, écrire dans son ton, caler un calendrier, puis
publier. Le même travail, client par client, à la main.

## Ce que j'ai construit

Deux workflows n8n, puis une publication dans Make.
- **Les thèmes du mois.** Le premier workflow lit la liste des clients actifs dans un Google
  Sheet : métier, présentation, ton de rédaction. Pour chacun, l'IA propose les thèmes du mois,
  enregistrés dans l'onglet du client.
- **Les posts et le calendrier.** Le second rédige un post par thème, fixe sa structure et sa
  date de publication, puis met à jour le calendrier du client.
- **La publication.** Un scénario Make publie les posts sur la page LinkedIn du client, avec
  ou sans image, au rythme prévu par son contrat, et les marque comme publiés.

Décisions qui ont compté :
- **Le Google Sheet comme tableau de bord.** Ajouter un client, c'est ajouter une ligne.
  L'agence n'a jamais besoin d'ouvrir n8n.
- **Des étapes séparées.** Les thèmes sont enregistrés avant que les posts soient écrits :
  l'agence peut en corriger un avant la rédaction.

## Preuves

État au 28/10/2026 : en production depuis 2025.

- La chaîne tourne toujours en production pour les clients de l'agence : thèmes et posts une
  fois par mois, publication au rythme du contrat de chaque client.
- Une démonstration vidéo de 14 minutes existe, non publiée : elle montre des données de
  clients.

## Ce que j'en ai appris

- **Automatiser une tâche, c'est d'abord la décrire.** Avant le premier workflow, il a fallu
  écrire ce que l'agence faisait chaque mois, client par client. Je fais le même travail
  aujourd'hui avant chaque fonctionnalité.
- **Garder un point de contrôle humain.** La pause entre thèmes et rédaction annonce la
  validation à chaque livraison de ma méthode actuelle.

## Artefacts

- Capture des deux workflows n8n (ci-dessus).
- Workflows (JSON) : privés, données de clients.
