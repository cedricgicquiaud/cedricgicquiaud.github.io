/** Une décision affichée en grille (PFO-130) : son titre et son texte, tous deux en HTML (entités comprises). */
export type Decision = { titre: string; html: string };

/**
 * Découpe le HTML d'une section Décisions en décisions, ou renvoie `null` si le texte est libre.
 * Deux formats reconnus :
 * - nouveau : un `### Titre` par décision, suivi de son texte ;
 * - fiches actuelles : une liste à puces dont chaque élément commence par son titre en gras.
 */
export function decisionsDe(html: string): Decision[] | null {
  const source = html.trim();
  if (source.startsWith("<h3")) {
    return source
      .split(/<h3[^>]*>/)
      .slice(1)
      .map((bloc) => {
        const [titre, ...reste] = bloc.split("</h3>");
        return { titre: titre.trim(), html: reste.join("</h3>").trim() };
      });
  }
  const liste = source.match(/^<ul>([^]*)<\/ul>$/);
  if (!liste || /<ul|<ol/.test(liste[1])) return null;
  const items = liste[1]
    .split("</li>")
    .map((s) => s.replace(/^\s*<li>/, "").trim())
    .filter(Boolean);
  const decisions: Decision[] = [];
  for (const item of items) {
    const m = item.match(/^<strong>([^]*?)<\/strong>\s*:?\s*([^]*)$/);
    if (!m || !m[2].trim()) return null;
    decisions.push({ titre: m[1].trim().replace(/\s*[.:]$/, ""), html: `<p>${m[2].trim()}</p>` });
  }
  return decisions.length ? decisions : null;
}
