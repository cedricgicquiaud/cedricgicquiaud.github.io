// En-tête de page projet (PFO-142) : le nom en grand, l'année à droite, le sous-titre dessous.

/** L'année affichée à droite du nom : « 2026 », « 2024–2025 », ou « Depuis 2025 » pour un projet en cours. */
export function anneeDe(periode: string): string {
  const annees = [...new Set(periode.match(/\b(19|20)\d{2}\b/g) ?? [])];
  if (!annees.length) return "";
  if (/aujourd/.test(periode)) return `Depuis ${annees[0]}`;
  return annees.length > 1 ? `${annees[0]}–${annees[annees.length - 1]}` : annees[0];
}

/** Le titre de la fiche coupé au tiret long : le nom avant, le sous-titre après. */
export function decoupeTitre(titre: string): { nom: string; sousTitre: string } {
  const i = titre.indexOf(" — ");
  if (i < 0) return { nom: titre.trim(), sousTitre: "" };
  return { nom: titre.slice(0, i).trim(), sousTitre: titre.slice(i + 3).trim() };
}
