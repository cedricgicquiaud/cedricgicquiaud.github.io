import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");

const SKIPPED_DIRS = new Set(["node_modules", ".next", "out", ".git", "src"]);

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      return SKIPPED_DIRS.has(name) ? [] : sourceFiles(full);
    }
    return /\.tsx?$/.test(name) ? [full] : [];
  });
}

describe("build statique", () => {
  it("produit out/index.html", () => {
    expect(existsSync(path.join(root, "out", "index.html"))).toBe(true);
  });

  it("refuse tout dossier app/api (aucune API route)", () => {
    expect(existsSync(path.join(root, "app", "api"))).toBe(false);
  });
});

const css = () => readFileSync(path.join(root, "app", "globals.css"), "utf8");

type Tokens = Record<string, string>;

function tokensOf(selector: string): Tokens {
  const start = css().indexOf(selector);
  if (start === -1) throw new Error(`bloc introuvable : ${selector}`);
  const body = css().slice(start).split("{")[1].split("}")[0];
  const tokens: Tokens = {};
  for (const [, name, hex] of body.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})\s*;/gi)) {
    tokens[name] = hex;
  }
  return tokens;
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const PAIRS: [string, string][] = [
  ["foreground", "background"],
  ["muted-foreground", "background"],
  ["primary", "background"],
];

const THEMES: Record<string, string> = {
  clair: ":root {",
  "système sombre": ':root:not([data-theme="light"])',
  sombre: ':root[data-theme="dark"]',
};

describe("thème", () => {
  for (const [theme, selector] of Object.entries(THEMES)) {
    it(`garantit un contraste >= 4,5:1 sur les paires de tokens (${theme})`, () => {
      const tokens = tokensOf(selector);
      for (const [fg, bg] of PAIRS) {
        expect(tokens[fg], `token --${fg} absent`).toBeDefined();
        expect(tokens[bg], `token --${bg} absent`).toBeDefined();
        expect(contrast(tokens[fg], tokens[bg]), `${fg}/${bg}`).toBeGreaterThanOrEqual(4.5);
      }
    });
  }

  it("refuse toute couleur en dur hors app/globals.css", () => {
    const hardcoded = /#[0-9a-f]{3,8}\b|rgba?\(/i;
    const offenders = sourceFiles(root).filter((file) =>
      hardcoded.test(readFileSync(file, "utf8")),
    );
    expect(offenders.map((f) => path.relative(root, f))).toEqual([]);
  });
});

describe("dépôt public", () => {
  it("ne contient ni PLAN.md, ni REPOS.md, ni AUDIT.md à la racine", () => {
    const leaked = ["PLAN.md", "REPOS.md", "AUDIT.md"].filter((name) =>
      existsSync(path.join(root, name)),
    );
    expect(leaked).toEqual([]);
  });
});
