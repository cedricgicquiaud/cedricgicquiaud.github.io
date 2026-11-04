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

const majuscule = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/** Le statut du bloc « Fiche » (PFO-145) : la phrase « État au … : » qui ouvre « Où en est le projet », sans la date. */
export function etatDe(html: string): string {
  const texte = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  const m = texte.match(/^État au [^:]+:\s*(.+)$/);
  if (!m) return "";
  const phrase = m[1].split(" — ")[0].split(/\.(\s|$)/)[0].trim();
  return majuscule(phrase);
}

const CODE: Record<string, string> = {
  public: "Public, sur GitHub",
  vitrine: "Non publié, démo en ligne",
  prive: "Privé",
  anonyme: "Privé, projet anonymisé",
};

/** La ligne Code du bloc « Fiche » selon la visibilité de la fiche (PFO-145). */
export function codeDe(visibilite: string): string {
  return CODE[visibilite] ?? "";
}

/** Une valeur du bloc « Fiche », avec sa majuscule. */
export const enCapitale = majuscule;
