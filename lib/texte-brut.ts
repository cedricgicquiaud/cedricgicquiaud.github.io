import { marked, type Token } from "marked";

/** Un chemin du site (`/projets/…`) devient une URL absolue ; une URL complète reste telle quelle. */
const absolue = (href: string, site: string): string => (href.startsWith("/") ? site + href : href);

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
      return "tokens" in t && t.tokens ? inline(t.tokens, site) : "text" in t ? t.text : "";
    })
    .join("");
}

/** Texte d'un bloc Markdown. */
function block(t: Token, site: string): string {
  return "tokens" in t && t.tokens ? inline(t.tokens, site) : "";
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
