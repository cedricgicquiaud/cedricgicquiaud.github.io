# Barème de charge

Source : un projet personnel (44 PR) et un projet client (300 PR) — 344 PR mergées.

## Paramètres (utilisés par `roadmap` et `sync`)

```yaml
# heures de session par feature, selon sa taille
feature_hours_S: 0.22
feature_hours_M: 0.65   # médiane projet PFO, 3 livraisons M (29/08)
feature_hours_L: 1.94
feature_hours_XL: 3.27
feature_overhead_hours: 0.5   # validation du découpage + relecture de PR, hypothèse initiale recalibrée par sync
hours_per_active_day: 6.7
days_per_week: observed   # remplacer par un nombre (ex. 2) pour forcer la capacité
```

## Observations

| Taille | Diff (lignes) | Livraisons | Temps médian par livraison (h) | Heures par feature (× facteur) |
|---|---|---|---|---|
| S | 1–150 | 117 | 0.22 | 0.22 (×1) |
| M | 151–600 | 139 | 0.34 | 0.69 (×2) |
| L | 601–2000 | 74 | 0.65 | 1.94 (×3) |
| XL | > 2000 | 14 | 0.65 | 3.27 (×5) |

| Projet | PR | Période | Jours actifs | Heures / jour actif | Jours actifs / semaine |
|---|---|---|---|---|---|
| un projet personnel | 44 | 2026-05-25 → 2026-07-22 | 9 | 6.3 | 1.1 |
| un projet client | 300 | 2026-06-10 → 2026-08-19 | 45 | 7.1 | 4.5 |

## Comment lire

- Avec Claude Code, une PR est mergée en quelques minutes : le temps d'attente humaine ne
  mesure rien. Ce qui compte est le **temps de session** par livraison et le **nombre de
  jours** où l'humain travaille sur le projet.
- Temps par livraison = intervalle entre deux merges d'une même session (< 4 h).
- Heures par feature = temps par livraison × facteur (S=1, M=2, L=3, XL=5), car une
  feature regroupe plusieurs tâches et des validations. Point de départ, recalibré par `sync`.
- Fenêtre d'une feature = heures cumulées ÷ heures par jour actif ÷ jours actifs par semaine.

## Historique des features (rempli par `next` et `sync`)

| Feature | Taille | Tâches | Début | PR ouverte | Mergée | Heures réelles |
|---|---|---|---|---|---|---|

## Historique du projet Portfolio (PFO)

| Feature | Taille | Livraisons | Tâches | Début | PR ouvertes | Heures de session | Mergée |
|---|---|---|---|---|---|---|---|
| Le site présente qui je suis | L | 4 (M, M, M, S) | 13 | 2026-08-29 17:28 | 2026-08-29 17:31 / 17:43 / 17:55 / 18:03 ; corrections jusqu'à 18:22 | 0,9 h de production (17:28 → 18:22, tuilage) ; 1,0 h d'attente de merge (18:22 → 19:11, 4 merges + rebases) | mergée 29/08 |

Mesure par livraison (session, PR ouverte → prête après audit/recette/corrections) : L1 M 0,85 h ; L2 M 0,65 h ; L3 M 0,60 h ; L4 S 0,45 h.
Barème M global 0,69 h : réel médian 0,65 h (3 mesures) → `feature_hours_M` du projet = 0,65. S : 1 mesure, barème global conservé.
Ce que la boucle a attrapé : audit 1 bloquant + 5 importants (2 dus au cadrage : ancres incohérentes, liste en clair) ; recette 3 cases refusées (2 corrigées, 1 dépendante du contenu). Aucune régression après merge.
| Le visiteur explore mes projets | M | 3 (M, S, M) | 8 | 2026-08-30 04:42 | 04:52 / 04:58 / 05:14 | 0,9 h de production ; 0,4 h d'attente de merge | mergée 30/08 |
| Le site se lit comme le modèle | M | 3 (M, S, S) | 5 | 2026-08-30 06:10 | 06:21 / 06:22 / 06:24 | 0,45 h de production (interruption comprise) ; 1,1 h d'attente | mergée 30/08 |
| Le site a le grain du modèle | M | 3 (S, S, M) | 4 | 2026-08-30 07:45 | 07:53 / 07:54 / 07:59 | 1,4 h (production, audits, recettes, corrections) ; 0,2 h d'attente | mergée 30/08 |

Après 4 features : barème M (2,0 h avec validation) tient ; réel 0,9–1,4 h de production par feature M à 3 livraisons en parallèle. `feature_hours_M` inchangé à 0,65.
Ce que la boucle attrape par feature : 0 bloquant depuis F2 ; 3–4 importants par feature (moitié issus de l'ordre de mission) ; recettes : 1–2 refus réels par feature, toujours corrigés avant merge.
| Tâches isolées A–D (PFO-37..49, 4 PR) | — | 4 PR de 3 à 5 tâches | 15 | 2026-08-30 09:20 | 09:38 / 09:41 / 11:57 / 11:57 | ≈ 2,5 h au total (production, audits, recettes, corrections, merges) | mergées 30/08 |

Tâches isolées groupées par fichiers disjoints : 3 à 5 tâches par PR, ≈ 0,6 h par PR tout compris. La boucle a attrapé 1 fuite de noms en clair (test + UAT), 3 défauts réels à la recette (focus invisible, colonne coupée à 720 px, débordement du pied de page à 375 px).
| Chaque projet a un visuel — livraison 1/4 « Fiche : captures et vidéo déclarées » (PFO-56..59) | M (feature M, 4 livraisons M, M, M, S, 13 tâches) | 1 sur 4 | 4 | 2026-09-04 21:02 | 21:14 | 0,4 h de session (21:02 → 21:27 : production 12 min, audit + recette + correction 13 min) ; agents : 0,6 h, 327 échanges, 1,9 M jetons écrits / 16 M relus | mergée 04/09 22:01 ; attente de merge 0,6 h (21:27 → 22:01) |

Cadrage de la feature (contradicteur ×2, découpeur, 13 fiches créées) : 20:15 → 20:55, 0,7 h. La boucle a attrapé sur L1 : 1 important (chemin `//hôte` non refusé), 2 mineurs corrigés ; recette : 0 défaut (aucun écran livré). Testeur au-dessus des seuils (65 échanges, 3 M relus) : passe de non-régression sur deux dossiers (avant/après) et installation des dépendances de l'outil dans le worktree.
| Chaque projet a un visuel — livraisons 2/4 « Le build refuse un fichier absent ou lourd » (PFO-60..62) et 3/4 « Page de fiche : galerie, vidéo, image OG » (PFO-63..66) | M + M | 2 sur 4, tuilées | 3 + 4 | 2026-09-05 17:29 | L2 17:43 ; L3 18:04 | 0,75 h de session (17:29 → 18:13) pour les deux ; agents : 0,8 h (1,4 h cumulées sur la feature), 351 échanges | PR #30 et #31 ouvertes, en attente de merge |

Tuilage L2/L3 : le producteur de L3 a démarré à l'ouverture de la PR de L2 (fichiers disjoints, deux worktrees depuis `main`). La boucle a attrapé : L2 → 0 bloquant, 0 important, 3 mineurs (dossier déclaré en `visuel` → trace EISDIR ; constantes dupliquées ; fixture sans vidéo) ; L3 → 1 important (tests OG figés sur la donnée SLICE, corrigé), 1 mineur (snapshot fragile), recette : 1 défaut antérieur (effet bi-ton illisible sur visuels générés, décision V6 remontée). Testeur L3 à 42 échanges (seuil 40) : amorce de recette à poser et retirer.
