# Barème de charge

Source : AlanZien/SLICE, weme-studio/Nexus — 344 PR mergées.

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

| Dépôt | PR | Période | Jours actifs | Heures / jour actif | Jours actifs / semaine |
|---|---|---|---|---|---|
| AlanZien/SLICE | 44 | 2026-05-25 → 2026-07-22 | 9 | 6.3 | 1.1 |
| weme-studio/Nexus | 300 | 2026-06-10 → 2026-08-19 | 45 | 7.1 | 4.5 |

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
