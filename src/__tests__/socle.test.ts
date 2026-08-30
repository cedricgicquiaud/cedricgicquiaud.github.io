import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { compile } from "@tailwindcss/node";
import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";

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
  it("produit out/index.html", { timeout: 120_000 }, () => {
    execFileSync("npx", ["next", "build"], { cwd: root, stdio: "pipe" });
    expect(existsSync(path.join(root, "out", "index.html"))).toBe(true);
  });

  it("refuse tout dossier app/api (aucune API route)", () => {
    expect(existsSync(path.join(root, "app", "api"))).toBe(false);
  });
});

const css = () => readFileSync(path.join(root, "app", "globals.css"), "utf8");

type Tokens = Record<string, string>;

function tokensOf(selector: string): Tokens {
  const start = css().lastIndexOf(selector);
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

  async function compiledCss(candidates: string[]): Promise<string> {
    const compiler = await compile(css(), {
      base: path.join(root, "app"),
      onDependency: () => {},
    });
    return compiler.build(candidates);
  }

  /** Règles CSS de `selector` situées dans un bloc `@media (prefers-color-scheme: dark)`. */
  function rulesUnderDarkMedia(compiled: string, selector: string): string[] {
    const found: string[] = [];
    const media = /@media \(prefers-color-scheme: dark\)\s*\{/g;
    for (const match of compiled.matchAll(media)) {
      let depth = 1;
      let i = match.index + match[0].length;
      const start = i;
      while (depth > 0 && i < compiled.length) {
        if (compiled[i] === "{") depth++;
        else if (compiled[i] === "}") depth--;
        i++;
      }
      const block = compiled.slice(start, i);
      if (block.includes(selector)) found.push(block);
    }
    return found;
  }

  it("applique la variante dark: en préférence système sombre, sauf data-theme=light", async () => {
    const compiled = await compiledCss(["dark:bg-background"]);
    const blocks = rulesUnderDarkMedia(compiled, ".dark\\:bg-background");
    expect(blocks.length, "aucune règle dark: sous @media (prefers-color-scheme: dark)").toBeGreaterThan(0);
    expect(blocks.join("\n")).toContain(':not([data-theme="light"])');
  });

  it("applique la variante dark: sous data-theme=dark", async () => {
    const compiled = await compiledCss(["dark:bg-background"]);
    expect(compiled).toMatch(/\.dark\\:bg-background[^{]*\[data-theme="dark"\]/);
  });

  it("déclare color-scheme par état : light, dark (système), dark (forcé), light (forcé)", async () => {
    const compiled = await compiledCss([]);
    const declaration = (selector: string) => {
      const start = compiled.indexOf(selector);
      expect(start, `bloc introuvable : ${selector}`).toBeGreaterThan(-1);
      const body = compiled.slice(start).split("{")[1].split("}")[0];
      return body.match(/color-scheme:\s*([^;]+);/)?.[1].trim();
    };
    expect(declaration(":root {")).toBe("light");
    expect(declaration(':root[data-theme="light"]')).toBe("light");
    expect(declaration(':root[data-theme="dark"]')).toBe("dark");
    const systemDark = rulesUnderDarkMedia(compiled, ':root:not([data-theme="light"])').join("\n");
    expect(systemDark).toMatch(/color-scheme:\s*dark;/);
    expect(compiled).not.toMatch(/color-scheme:\s*light dark/);
  });

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

describe("déploiement GitHub Pages", () => {
  type Step = { name?: string; uses?: string; run?: string };
  const workflowPath = path.join(root, ".github", "workflows", "deploy.yml");

  function steps(): Step[] {
    const workflow = parseYaml(readFileSync(workflowPath, "utf8"));
    return Object.values<{ steps: Step[] }>(workflow.jobs).flatMap((job) => job.steps);
  }

  it("existe et se déclenche sur push vers main", () => {
    expect(existsSync(workflowPath)).toBe(true);
    const workflow = parseYaml(readFileSync(workflowPath, "utf8"));
    expect(workflow.on.push.branches).toContain("main");
  });

  it("a les permissions pages: write et id-token: write", () => {
    const workflow = parseYaml(readFileSync(workflowPath, "utf8"));
    expect(workflow.permissions).toMatchObject({ pages: "write", "id-token": "write" });
  });

  it("enchaîne Guard, install, test, build, upload de out/ puis deploy Pages", () => {
    const all = steps();
    const indexOf = (pred: (s: Step) => boolean) => all.findIndex(pred);
    const order = [
      indexOf((s) => s.name === "Guard"),
      indexOf((s) => /npm ci/.test(s.run ?? "")),
      indexOf((s) => /npm test/.test(s.run ?? "")),
      indexOf((s) => /npm run build/.test(s.run ?? "")),
      indexOf((s) => /^actions\/upload-pages-artifact@/.test(s.uses ?? "")),
      indexOf((s) => /^actions\/deploy-pages@/.test(s.uses ?? "")),
    ];
    expect(order.every((i) => i >= 0), `étape manquante : ${order}`).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(all.some((s) => /^actions\/configure-pages@/.test(s.uses ?? ""))).toBe(true);
    const upload = all.find((s) => /^actions\/upload-pages-artifact@/.test(s.uses ?? ""));
    expect((upload as { with?: { path?: string } }).with?.path).toBe("out");
  });

  it("Guard échoue si PLAN.md, REPOS.md ou AUDIT.md est présent", () => {
    const guard = steps().find((s) => s.name === "Guard");
    for (const name of ["PLAN.md", "REPOS.md", "AUDIT.md"]) {
      expect(guard?.run).toContain(name);
    }
    expect(guard?.run).toMatch(/exit 1/);
  });
});

describe("ids des sections (attendus par le menu)", () => {
  const EXPECTED: Record<string, string> = {
    about: "a-propos",
    experience: "experience",
    intro: "intro",
    footer: "contact",
    projects: "projets",
  };

  for (const [file, id] of Object.entries(EXPECTED)) {
    it(`components/${file}.tsx porte id="${id}"`, () => {
      const source = readFileSync(path.join(root, "components", `${file}.tsx`), "utf8");
      expect(source).toContain(`id="${id}"`);
    });
  }
});

describe("ordre des sections dans app/page.tsx", () => {
  it("rend <Projects /> après <Experience />, en dernière section (le pied de page vit dans le layout)", () => {
    const source = readFileSync(path.join(root, "app", "page.tsx"), "utf8");
    const at = (tag: string) => source.indexOf(tag);
    expect(at("<Projects />")).toBeGreaterThan(-1);
    expect(at("<Experience />")).toBeLessThan(at("<Projects />"));
    expect(at("<Projects />")).toBeLessThan(at("</main>"));
  });
});

describe("bouton Thème dans app/layout.tsx", () => {
  it("est fixe en haut à droite en mobile seulement (en desktop il vit dans la colonne gauche, PFO-30)", () => {
    const source = readFileSync(path.join(root, "app", "layout.tsx"), "utf8");
    const wrapper = source.match(/<div className="([^"]*)">\s*<ThemeToggle \/>/);
    expect(wrapper, "conteneur du bouton Thème absent").not.toBeNull();
    const classes = wrapper![1].split(/\s+/);
    expect(classes).toContain("fixed");
    expect(classes).toContain("right-4");
    expect(classes).toContain("top-4");
    expect(classes).toContain("lg:hidden");
  });
});

describe("section Projets (PFO-14)", () => {
  it("porte le conteneur de mise en page commun aux sections de contenu", () => {
    const src = readFileSync(path.join(root, "components", "projects.tsx"), "utf8");
    expect(src).toMatch(/<section id="projets" className="py-16">/);
    expect(src).toMatch(/className="w-full"/);
  });
});
