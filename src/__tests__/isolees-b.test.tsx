import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { checkOutput } from "../../scripts/check-output.mjs";
import { interFonts } from "../../scripts/theme-tokens.mjs";
import { Fiche } from "../../components/fiche";
import { ProjectCard } from "../../components/project-card";
import type { Fiche as FicheData } from "../../lib/fiches";
import { ensureBuild } from "./helpers/build";

afterEach(cleanup);

const MENTION = "Projet anonymisé : code et client non publiés";

/** Une fiche factice complète ; chaque test ne surcharge que le frontmatter qu'il observe. */
function fiche(over: Partial<FicheData["frontmatter"]> = {}): FicheData {
  return {
    slug: "alpha",
    titre: "Alpha — un titre",
    frontmatter: {
      nom: "Alpha",
      statut: "en cours",
      periode: "2026",
      role: "conception",
      stack: ["TypeScript"],
      visibilite: "public",
      depot: "https://github.com/x/alpha",
      depotNote: "https://github.com/x/alpha",
      demo: "https://alpha.example.test/",
      demoNote: "https://alpha.example.test/",
      ...over,
    },
    enBref: { quoi: "Un outil.", chiffre: "120 tests.", lien: "" },
    sections: [],
    visuel: "/projets/generated/alpha.png",
  };
}

const anonyme = () => fiche({ visibilite: "anonyme", depot: "", depotNote: "", demo: "", demoNote: "" });

describe("PFO-39 — mention « projet anonymisé » sur la carte", () => {
  it("affiche la mention en text-muted-foreground pour une fiche anonyme", () => {
    render(<ProjectCard fiche={anonyme()} />);
    expect(screen.getByText(MENTION)).toHaveClass("text-muted-foreground");
  });

  it("n'affiche jamais la mention sur une fiche public ou vitrine", () => {
    render(<ProjectCard fiche={fiche({ visibilite: "public" })} />);
    render(<ProjectCard fiche={fiche({ visibilite: "vitrine", depot: "", depotNote: "à venir" })} />);
    expect(screen.queryByText(MENTION)).toBeNull();
  });

  it("n'affiche aucun lien Code ni Démo avec la mention, même si la fiche porte des URL", () => {
    render(<ProjectCard fiche={fiche({ visibilite: "anonyme" })} />);
    expect(screen.getByText(MENTION)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Code" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Démo" })).toBeNull();
  });
});

describe("PFO-39 — mention « projet anonymisé » sur la page fiche", () => {
  it("affiche la mention en text-muted-foreground pour une fiche anonyme, sans lien Code ni Démo", () => {
    render(<Fiche fiche={fiche({ visibilite: "anonyme" })} />);
    expect(screen.getByText(MENTION)).toHaveClass("text-muted-foreground");
    expect(screen.queryByRole("link", { name: "Code" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Démo" })).toBeNull();
  });

  it("n'affiche jamais la mention sur une fiche public ou vitrine", () => {
    render(<Fiche fiche={fiche({ visibilite: "public" })} />);
    render(<Fiche fiche={fiche({ visibilite: "vitrine" })} />);
    expect(screen.queryByText(MENTION)).toBeNull();
    expect(screen.getAllByRole("link", { name: "Code" })).toHaveLength(2);
  });
});

describe("PFO-42 — check-output refuse Google Fonts", () => {
  it.each(["fonts.googleapis.com", "fonts.gstatic.com"])("signale un domaine tiers pour %s", (host) => {
    const dir = mkdtempSync(path.join(tmpdir(), "check-fonts-"));
    try {
      writeFileSync(path.join(dir, "index.html"), `<link rel="stylesheet" href="https://${host}/css2?family=Inter">`);
      const problems = checkOutput(dir, []);
      expect(problems).toHaveLength(1);
      expect(problems[0]).toContain(`domaine tiers « ${host} »`);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

const root = path.resolve(__dirname, "../..");

describe("PFO-19 — script npm og", () => {
  it("package.json expose « og » : node scripts/og-image.mjs", () => {
    const { scripts } = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
    expect(scripts.og).toBe("node scripts/og-image.mjs");
  });

  it("og-image.mjs échoue avec un message clair quand content/site.json manque", () => {
    // Copie du script dans un dossier temporaire sans content/ ; node_modules lié pour résoudre react et next.
    const tmp = mkdtempSync(path.join(tmpdir(), "og-sans-site-"));
    try {
      for (const d of ["scripts", "app", "public"]) mkdirSync(path.join(tmp, d));
      for (const f of ["scripts/og-image.mjs", "scripts/theme-tokens.mjs", "app/globals.css", "package.json"]) {
        copyFileSync(path.join(root, f), path.join(tmp, f));
      }
      symlinkSync(path.join(root, "node_modules"), path.join(tmp, "node_modules"));
      const run = spawnSync("node", ["scripts/og-image.mjs"], { cwd: tmp, encoding: "utf8" });
      expect(run.status).not.toBe(0);
      expect(run.stderr).toContain("content/site.json");
      expect(run.stderr).not.toContain("ENOENT");
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("README.md documente la commande npm run og", () => {
    expect(readFileSync(path.join(root, "README.md"), "utf8")).toMatch(/npm run og/);
  });
});

describe("PFO-43 — image OG et visuels en Inter, sans réseau", () => {
  const scripts = ["og-image.mjs", "project-visuals.mjs"].map((f) => [f, readFileSync(path.join(root, "scripts", f), "utf8")] as const);

  it("theme-tokens.mjs charge Inter 400 et 600 depuis @fontsource/inter (fichiers locaux)", () => {
    const source = readFileSync(path.join(root, "scripts", "theme-tokens.mjs"), "utf8");
    expect(source).toContain("@fontsource/inter");
    expect(source).toMatch(/name:\s*"Inter"/);
    expect(source).toMatch(/weight:\s*400/);
    expect(source).toMatch(/weight:\s*600/);
  });

  it.each(scripts)("%s passe les polices Inter à ImageResponse et n'utilise plus sans-serif", (_file, source) => {
    expect(source).toMatch(/fonts:\s*interFonts\(\)/);
    expect(source).toMatch(/fontFamily:\s*"Inter"/);
    expect(source).not.toMatch(/fontFamily:\s*"sans-serif"/);
  });

  it("interFonts() renvoie deux polices « Inter » dont les données sont des Buffer non vides (smoke)", () => {
    const fonts = interFonts();
    expect(fonts).toHaveLength(2);
    for (const font of fonts) {
      expect(font.name).toBe("Inter");
      expect(Buffer.isBuffer(font.data)).toBe(true);
      expect(font.data.length).toBeGreaterThan(0);
    }
  });

  it.each(scripts)("%s ne contient aucune URL http (aucune requête réseau à la génération)", (_file, source) => {
    expect(source).not.toMatch(/https?:\/\//);
    expect(source).not.toContain("experimental-network-imports");
  });
});

describe("PFO-44 — helper ensureBuild partagé par les tests qui lisent out/", () => {
  it.each(["finitions", "spotlight", "font", "visuals"])("%s.test.tsx importe ensureBuild depuis ./helpers/build", (name) => {
    const source = readFileSync(path.join(root, "src", "__tests__", `${name}.test.tsx`), "utf8");
    expect(source).toMatch(/import \{ ensureBuild \} from "\.\/helpers\/build"/);
    // Plus aucun lancement du build en propre : seul le helper le fait.
    expect(source).not.toMatch(/exec(File)?Sync\([^)]*build/);
  });

  it("vitest ne prend pas helpers/ pour des tests", () => {
    const config = readFileSync(path.join(root, "vitest.config.ts"), "utf8");
    expect(config).toMatch(/include: \["src\/__tests__\/\*\*\/\*\.test\.\{ts,tsx\}"\]/);
  });
});

describe("PFO-44 — ensureBuild reconstruit si le marker manque", () => {
  /** Une racine temporaire avec un `out/index.html` frais. */
  function fakeRoot() {
    const dir = mkdtempSync(path.join(tmpdir(), "ensure-build-"));
    mkdirSync(path.join(dir, "out"));
    writeFileSync(path.join(dir, "out", "index.html"), "<html></html>");
    return dir;
  }

  const marker = "out/projets/generated/slice.png";

  it("lance le build quand le marker est absent de out/, même si out/index.html est frais", () => {
    const dir = fakeRoot();
    // Faux build : ne lance rien, fabrique seulement le fichier attendu.
    const run = vi.fn(() => {
      mkdirSync(path.dirname(path.join(dir, marker)), { recursive: true });
      writeFileSync(path.join(dir, marker), "png");
    });
    ensureBuild([], { marker, root: dir, run });
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("ne lance rien quand le marker est présent et out/index.html frais", () => {
    const dir = fakeRoot();
    mkdirSync(path.dirname(path.join(dir, marker)), { recursive: true });
    writeFileSync(path.join(dir, marker), "png");
    const run = vi.fn();
    ensureBuild([], { marker, root: dir, run });
    expect(run).not.toHaveBeenCalled();
  });

  it("lève une erreur explicite quand une dépendance n'existe pas, au lieu de l'ignorer", () => {
    const dir = fakeRoot();
    const run = vi.fn();
    expect(() => ensureBuild(["scripts/nope.mjs"], { root: dir, run })).toThrow("scripts/nope.mjs");
    expect(run).not.toHaveBeenCalled();
  });
});
