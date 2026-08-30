import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { Experience } from "../../components/experience";
import { Badge } from "../../components/ui/badge";

afterEach(cleanup);

const root = path.resolve(__dirname, "../..");
const source = (rel: string) => readFileSync(path.join(root, rel), "utf8");

/** Le contenu d'un bloc CSS `selector { ... }` (premier niveau d'accolades). */
function cssBlock(css: string, selector: string): string {
  const start = css.indexOf(selector);
  expect(start, `bloc « ${selector} » introuvable`).toBeGreaterThanOrEqual(0);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  throw new Error(`bloc « ${selector} » non fermé`);
}

describe("Token --cyber dans globals.css (PFO-51)", () => {
  const css = source("app/globals.css");

  it("clair : #0f766e ; sombre système et sombre forcé : #5eead4", () => {
    expect(cssBlock(css, ":root {")).toMatch(/--cyber:\s*#0f766e;/);
    expect(cssBlock(css, ":root:not([data-theme=\"light\"]) {")).toMatch(/--cyber:\s*#5eead4;/);
    expect(cssBlock(css, ":root[data-theme=\"dark\"] {")).toMatch(/--cyber:\s*#5eead4;/);
  });

  it("expose --color-cyber dans @theme inline pour les classes text-cyber et bg-cyber", () => {
    expect(cssBlock(css, "@theme inline {")).toMatch(/--color-cyber:\s*var\(--cyber\);/);
  });
});

describe("Badge : variante cyber (PFO-51)", () => {
  it("rend un fond cyber à 10 % et un texte cyber, toujours en pilule", () => {
    render(<Badge variant="cyber">TypeScript</Badge>);
    const badge = screen.getByText("TypeScript");
    expect(badge).toHaveClass("bg-cyber/10", "text-cyber", "rounded-4xl");
    expect(badge).not.toHaveClass("bg-primary", "bg-secondary");
  });
});

describe("Experience : pastilles et titre en bleu cyber (PFO-51)", () => {
  it("chaque compétence est une pastille cyber ; le titre passe en text-cyber au survol et au focus, plus jamais en text-primary", () => {
    const { container } = render(<Experience />);
    const articles = within(container.querySelector("ol") as HTMLElement).getAllByRole("article");
    expect(articles.length).toBeGreaterThan(0);
    for (const article of articles) {
      const tags = within(within(article).getByRole("list")).getAllByRole("listitem");
      expect(tags.length).toBeGreaterThan(0);
      for (const tag of tags) {
        const badge = tag.firstElementChild as HTMLElement;
        expect(badge).toHaveClass("bg-cyber/10", "text-cyber");
        expect(badge).not.toHaveClass("bg-secondary");
      }
      const title = within(article).getByRole("heading", { level: 3 });
      expect(title).toHaveClass("group-hover/item:text-cyber", "group-focus-within/item:text-cyber");
      expect(title.className).not.toMatch(/text-primary/);
    }
  });
});
