import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");
const source = (rel: string) => readFileSync(path.join(root, rel), "utf8");

describe("Pied de page retiré (PFO-54)", () => {
  it("components/footer.tsx n'existe plus et app/layout.tsx ne rend plus <Footer/>", () => {
    expect(existsSync(path.join(root, "components", "footer.tsx"))).toBe(false);
    const layout = source("app/layout.tsx");
    expect(layout).not.toContain("Footer");
    expect(layout).not.toContain("<footer");
  });
});

describe("Ancres de menu sans contact (PFO-54)", () => {
  it("content/site.json n'expose plus que about, experience et projects dans sections", () => {
    const site = JSON.parse(source("content/site.json"));
    expect(Object.keys(site.sections)).toEqual(["about", "experience", "projects"]);
  });
});

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

describe("Thème sombre seul : tokens (PFO-55)", () => {
  const css = source("app/globals.css");

  it(":root porte la palette sombre (#0b1220 / #e6eaf2 / cyber #5eead4) et color-scheme: dark", () => {
    const root = cssBlock(css, ":root {");
    expect(root).toMatch(/--background:\s*#0b1220;/);
    expect(root).toMatch(/--foreground:\s*#e6eaf2;/);
    expect(root).toMatch(/--cyber:\s*#5eead4;/);
    expect(root).toMatch(/color-scheme:\s*dark;/);
  });

  it("un seul bloc de tokens : ni data-theme, ni prefers-color-scheme, une seule déclaration de --background", () => {
    expect(css).not.toContain("data-theme");
    expect(css).not.toContain("prefers-color-scheme");
    expect(css.match(/--background:/g)).toHaveLength(1);
    expect(css.match(/color-scheme:/g)).toHaveLength(1);
  });
});
