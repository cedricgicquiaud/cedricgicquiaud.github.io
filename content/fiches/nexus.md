---
nom: Nexus
statut: en cours
periode: mai 2026 → aujourd'hui
role: cofondateur technique, en binôme avec un associé ; architecture, infrastructure, sécurité et RGPD, connecteurs
stack: Python/FastAPI, React, TypeScript, Vite, Supabase (Postgres, Auth), Neo4j, Graphiti, Mistral, pg_cron, Docker, mypy
visibilite: prive
depot:
demo:
ordre: 2
---

# Nexus — assistant IA pour PME, chaîne européenne

**En bref.** Un assistant IA pour PME, branché sur une quinzaine d'outils du quotidien, qui repère les signaux de revenus et audite le CRM. Le code détecte et décide, l'IA explique : 21 règles métier écrites en code, une chaîne de modèles 100 % européenne. Projet cofondé, code privé, démonstration en entretien.

## Problème

Une PME a ses données commerciales éparpillées : CRM, messagerie, agenda, facturation. Un
client qui ne répond plus, un devis oublié, une fiche CRM à moitié remplie passent inaperçus.

Les assistants IA généralistes savent répondre, mais un chiffre inventé suffit à perdre la
confiance d'un dirigeant. Et beaucoup de PME ne veulent pas que leurs données sortent
d'Europe.

Le besoin : un assistant qui lit ces outils, signale ce qui compte, et dont chaque chiffre
et chaque action se vérifient. Nous sommes partis à deux : mon associé côté marché, moi côté
technique.

## Ce que j'ai construit

Une application web et son serveur, branchés sur une quinzaine d'outils. Le dirigeant pose
une question ou lance un audit ; l'assistant répond avec les chiffres de son entreprise.

Les décisions qui ont compté :
- **Le code détecte et décide, l'IA explique.** 6 règles de revenus et 15 règles d'hygiène du
  CRM sont écrites en code, avec un score de maturité. Le modèle de langage ne calcule rien :
  il met en mots ce que le code a trouvé.
- **Proposer, puis confirmer.** Toute action qui écrit dans un outil du client passe par une
  carte de confirmation. C'est le code qui l'impose, pas la consigne donnée au modèle.
- **Une trace qu'on peut relire.** Chaque action entre dans un registre d'audit inaltérable.
  Un rapport d'audit est figé à sa date et s'exporte en PDF.
- **Une mémoire qui connaît les dates.** L'assistant sait ce qui était vrai, et quand : un
  contact qui a changé de poste n'efface pas son historique.
- **Un seul mécanisme pour tous les connecteurs.** Ajouter un outil revient à le décrire, pas à
  réécrire l'authentification.
- **Les automatisations vivent dans la base.** Une relance planifiée tourne sans outil
  d'automatisation tiers.
- **Européen et accessible par construction.** Chaîne de modèles 100 % Mistral. Le contrôle
  d'accessibilité RGAA bloque l'intégration continue, comme le typage strict.

## Preuves

État au 10/10/2026 : en développement ; pas encore déployé, pas encore d'utilisateurs.

- **Ça marche ?** Banc de justesse des requêtes générées sur les données : 8 sur 8 en
  conditions réelles. Mémoire temporelle validée de bout en bout en conditions réelles, réponse
  en 16,4 s.
- **C'est solide ?** Les chiffres d'un audit viennent du code, jamais du modèle : la même
  base donne le même score. Typage strict et accessibilité vérifiés à chaque changement.
- **C'est utilisable ?** Un audit produit un rapport figé, lisible par un dirigeant sans
  ouvrir l'outil.

Prochaine porte : un premier déploiement chez un hébergeur européen, puis des PME pilotes.

## Ce que j'en ai appris

- **Un modèle de langage ne doit pas compter.** Les chiffres viennent du code, le modèle les
  explique. C'est ce qui rend une réponse vérifiable.
- **La confiance se construit dans le code, pas dans la consigne.** Une règle écrite dans un
  prompt reste une demande ; une carte de confirmation imposée par le code est une garantie.
- **Cofonder, c'est écrire ses choix.** Je rédige mes décisions techniques pour que mon
  associé puisse trancher sans lire le code.
- **Choisir l'Europe se mesure.** Une chaîne 100 % européenne limite le choix des modèles ; les
  bancs d'essai disent si le compromis tient.

## Artefacts

- Code privé (projet cofondé) : démonstration de l'application en entretien.
