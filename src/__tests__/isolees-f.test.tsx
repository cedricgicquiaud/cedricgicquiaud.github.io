import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { token } from "../../scripts/theme-tokens.mjs";

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

/** Fichiers .ts/.tsx/.css d'un dossier (récursif), chemins relatifs à la racine. */
function filesUnder(dir: string): string[] {
  return readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) return filesUnder(rel);
    return /\.(tsx?|css)$/.test(entry.name) ? [rel] : [];
  });
}

describe("Thème sombre seul : plus de bascule (PFO-55)", () => {
  it("components/theme-toggle.tsx n'existe plus ; app/layout.tsx n'a ni bouton de thème, ni script inline, ni suppressHydrationWarning", () => {
    expect(existsSync(path.join(root, "components", "theme-toggle.tsx"))).toBe(false);
    const layout = source("app/layout.tsx");
    expect(layout).not.toContain("ThemeToggle");
    expect(layout).not.toContain("<script");
    expect(layout).not.toContain("dangerouslySetInnerHTML");
    expect(layout).not.toContain("suppressHydrationWarning");
    expect(layout).not.toMatch(/\bfixed\b/);
  });

  it("aucun data-theme, prefers-color-scheme ni localStorage dans app/ et components/", () => {
    const offenders: string[] = [];
    for (const file of [...filesUnder("app"), ...filesUnder("components")]) {
      const text = source(file);
      for (const word of ["data-theme", "prefers-color-scheme", "localStorage"]) {
        if (text.includes(word)) offenders.push(`${file}: ${word}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("Thème sombre seul : bi-ton et classes dark: (PFO-55)", () => {
  it("portrait et carte projet fondent le visuel en mix-blend-screen seul (plus de multiply)", () => {
    for (const file of ["components/portrait.tsx", "components/project-card.tsx"]) {
      const text = source(file);
      expect(text, file).toContain("mix-blend-screen");
      expect(text, file).not.toContain("mix-blend-multiply");
    }
  });

  it("aucune classe dark: dans portrait, project-card, fiche et ui/badge", () => {
    for (const file of ["components/portrait.tsx", "components/project-card.tsx", "components/fiche.tsx", "components/ui/badge.tsx"]) {
      expect(source(file), file).not.toMatch(/\bdark:/);
    }
  });
});

/** Couleur `#rrggbb` du pixel (0,0) d'un PNG 8 bits RGB/RGBA non entrelacé (le premier pixel d'une ligne n'a pas de voisin : le filtre PNG le laisse brut). */
function cornerPixel(file: string): string {
  const png = readFileSync(file);
  expect(png.subarray(1, 4).toString("ascii"), `${file} n'est pas un PNG`).toBe("PNG");
  expect(png[24], "profondeur 8 bits attendue").toBe(8);
  expect(png[28], "PNG non entrelacé attendu").toBe(0);
  const idat: Buffer[] = [];
  for (let offset = 8; offset < png.length; ) {
    const length = png.readUInt32BE(offset);
    const type = png.subarray(offset + 4, offset + 8).toString("ascii");
    if (type === "IDAT") idat.push(png.subarray(offset + 8, offset + 8 + length));
    offset += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(idat));
  return "#" + [1, 2, 3].map((i) => raw[i].toString(16).padStart(2, "0")).join("");
}

describe("Thème sombre seul : images générées (PFO-55)", () => {
  it("public/opengraph-image.png est régénérée : son fond est le --primary de :root", () => {
    expect(cornerPixel(path.join(root, "public", "opengraph-image.png"))).toBe(token("primary"));
  });

  it("scripts/project-visuals.mjs sort un visuel sur fond sombre (--background #0b1220)", { timeout: 30_000 }, () => {
    const dir = mkdtempSync(path.join(tmpdir(), "isolees-f-"));
    const fiches = path.join(dir, "fiches");
    const pub = path.join(dir, "public");
    mkdirSync(fiches);
    mkdirSync(pub);
    writeFileSync(path.join(fiches, "alpha.md"), "---\nnom: Alpha\nstatut: en cours\nvisibilite: public\n---\n\n# Alpha\n\n**En bref.** Un outil. 12 tests. Code public.\n");
    execFileSync("node", [path.join(root, "scripts", "project-visuals.mjs"), fiches, pub], { cwd: root, stdio: "pipe" });
    expect(token("background")).toBe("#0b1220");
    expect(cornerPixel(path.join(pub, "projets", "generated", "alpha.png"))).toBe("#0b1220");
  });
});
