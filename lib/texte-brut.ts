import { marked, type Token, type Tokens } from "marked";

/** Un chemin du site (`/projets/…`) devient une URL absolue ; une URL complète reste telle quelle. */
const absolue = (href: string, site: string): string => (href.startsWith("/") ? site + href : href);

/** Un fragment HTML sans ses balises : `<strong>mot</strong>` donne `mot`. */
const sansBalise = (html: string): string => html.replace(/<[^>]*>/g, "");

/** Texte d'une suite de tokens en ligne : mots seuls, sans marque de mise en forme. */
function inline(tokens: Token[], site: string): string {
  return tokens
    .map((t) => {
      if (t.type === "link") {
        const texte = inline(t.tokens ?? [], site);
        const url = absolue(t.href, site);
        // URL nue (« https://… » dans le texte) : son texte est déjà l'adresse.
        return texte === url ? url : `${texte} (${url})`;
      }
      if (t.type === "image") return `Image : ${t.text} (${absolue(t.href, site)})`;
      if (t.type === "html") return sansBalise(t.text);
      return "tokens" in t && t.tokens ? inline(t.tokens, site) : "text" in t ? t.text : "";
    })
    .join("");
}

/** Cellules non vides d'une rangée, séparées par « — ». */
const rangee = (cells: Tokens.TableCell[], site: string): string =>
  cells.map((c) => inline(c.tokens, site)).filter(Boolean).join(" — ");

/** Texte d'un bloc Markdown ; un tableau donne son en-tête puis une ligne « - … » par rangée. */
function block(t: Token, site: string): string {
  if (t.type === "table") {
    const table = t as Tokens.Table;
    return [rangee(table.header, site), ...table.rows.map((r) => `- ${rangee(r, site)}`)].join("\n");
  }
  if (t.type === "list") {
    const list = t as Tokens.List;
    const debut = Number(list.start) || 1;
    return list.items
      .map((item, i) => {
        const puce = list.ordered ? `${debut + i}.` : "-";
        const [premier = "", ...suite] = item.tokens.map((b) => block(b, site)).filter(Boolean);
        // Ce qui suit la première ligne de l'élément (sous-liste, paragraphe) est décalé de deux espaces.
        return [`${puce} ${premier}`, ...suite.map((s) => s.replace(/^/gm, "  "))].join("\n");
      })
      .join("\n");
  }
  if (t.type === "html") return sansBalise(t.text).trim();
  // Paragraphe, titre : une ligne, même si le Markdown coupait la phrase.
  return "tokens" in t && t.tokens ? inline(t.tokens, site).replace(/\s*\n\s*/g, " ") : "";
}

/**
 * Le Markdown d'une section en texte brut, lisible par un agent IA (D11).
 * `site` : URL du site, qui rend absolus les liens et les images.
 */
export function texteBrut(markdown: string, site: string): string {
  return marked
    .lexer(markdown)
    .map((t) => block(t, site))
    .filter(Boolean)
    .join("\n\n");
}
