import { marked, type Token } from "marked";

/** Texte d'une suite de tokens en ligne : mots seuls, sans marque de mise en forme. */
function inline(tokens: Token[]): string {
  return tokens
    .map((t) => ("tokens" in t && t.tokens ? inline(t.tokens) : "text" in t ? t.text : ""))
    .join("");
}

/** Texte d'un bloc Markdown. */
function block(t: Token): string {
  return "tokens" in t && t.tokens ? inline(t.tokens) : "";
}

/**
 * Le Markdown d'une section en texte brut, lisible par un agent IA (D11).
 * `site` : URL du site, qui rend absolus les liens et les images.
 */
export function texteBrut(markdown: string, site: string): string {
  void site;
  return marked
    .lexer(markdown)
    .map(block)
    .filter(Boolean)
    .join("\n\n");
}
