import "@testing-library/jest-dom/vitest";
import { cleanup, render } from "@testing-library/react";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { About } from "../../components/about";
import { Experience } from "../../components/experience";
import { loadAbout, loadExperience } from "../../lib/content";
import { checkOutput } from "../../scripts/check-output.mjs";

afterEach(cleanup);

const contentDir = path.resolve(__dirname, "../../content");

function tempContentDir(files: Record<string, string> = {}): string {
  const dir = mkdtempSync(path.join(tmpdir(), "content-"));
  for (const [name, body] of Object.entries(files)) {
    writeFileSync(path.join(dir, name), body);
  }
  return dir;
}

describe("lib/content — about", () => {
  it("lève une erreur explicite si about.md manque", () => {
    const dir = tempContentDir();
    expect(() => loadAbout(dir)).toThrow(/about\.md.*(manquant|introuvable)/i);
  });

  it("lève une erreur explicite si le frontmatter n'a pas de titre", () => {
    const dir = tempContentDir({ "about.md": "---\nauteur: x\n---\n\nUn paragraphe.\n" });
    expect(() => loadAbout(dir)).toThrow(/about\.md.*titre/i);
  });

  it("retourne le titre et le corps Markdown rendu en HTML", () => {
    const dir = tempContentDir({
      "about.md": "---\ntitre: À propos\n---\n\nPremier **paragraphe**.\n\nDeuxième.\n",
    });
    const about = loadAbout(dir);
    expect(about.titre).toBe("À propos");
    expect(about.html).toContain("<p>Premier <strong>paragraphe</strong>.</p>");
    expect(about.html.match(/<p>/g)).toHaveLength(2);
  });
});

describe("lib/content — experience", () => {
  it("lève une erreur explicite si experience.md manque ou n'a pas de titre", () => {
    expect(() => loadExperience(tempContentDir())).toThrow(/experience\.md.*(manquant|introuvable)/i);
    const dir = tempContentDir({ "experience.md": "---\nblocs: []\n---\n" });
    expect(() => loadExperience(dir)).toThrow(/experience\.md.*titre/i);
  });

  const experienceFile = (blocs: string) =>
    `---\ntitre: Expérience\nblocs:\n${blocs}---\n`;

  it("retourne les blocs avec période, rôle, secteur, description et tags", () => {
    const dir = tempContentDir({
      "experience.md": experienceFile(
        "  - periode: 2026\n    role: Constructeur\n    secteur: Logiciel\n    description: Des agents.\n    tags: [TypeScript, MCP]\n",
      ),
    });
    expect(loadExperience(dir).blocs).toEqual([
      {
        periode: "2026",
        role: "Constructeur",
        secteur: "Logiciel",
        description: "Des agents.",
        tags: ["TypeScript", "MCP"],
      },
    ]);
  });

  it("ignore un bloc sans période et le signale par console.warn", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const dir = tempContentDir({
      "experience.md": experienceFile(
        "  - role: Sans date\n    secteur: Logiciel\n    description: x\n    tags: [a]\n" +
          "  - periode: 2026\n    role: Constructeur\n    secteur: Logiciel\n    description: x\n    tags: [a]\n",
      ),
    });
    const { blocs } = loadExperience(dir);
    expect(blocs.map((b) => b.role)).toEqual(["Constructeur"]);
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/experience\.md.*période.*Sans date/i));
    warn.mockRestore();
  });

  it("ordonne les blocs du plus récent au plus ancien", () => {
    const bloc = (periode: string) =>
      `  - periode: "${periode}"\n    role: r\n    secteur: s\n    description: d\n    tags: [t]\n`;
    const dir = tempContentDir({
      "experience.md": experienceFile(bloc("2000–2013") + bloc("2026") + bloc("2013–2023")),
    });
    expect(loadExperience(dir).blocs.map((b) => b.periode)).toEqual(["2026", "2013–2023", "2000–2013"]);
  });
});

describe("content/ — textes réels", () => {
  it("about.md contient au moins trois paragraphes", () => {
    const { html } = loadAbout(contentDir);
    expect(html.match(/<p>/g)?.length ?? 0).toBeGreaterThanOrEqual(3);
  });

  it("experience.md contient au moins quatre blocs complets, avec au moins un tag", () => {
    const { blocs } = loadExperience(contentDir);
    expect(blocs.length).toBeGreaterThanOrEqual(4);
    for (const bloc of blocs) {
      for (const field of ["periode", "role", "secteur", "description"] as const) {
        expect(bloc[field].trim(), `${field} vide (${bloc.periode})`).not.toBe("");
      }
      expect(bloc.tags.length, `tags vides (${bloc.periode})`).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("<About />", () => {
  it("rend la section #a-propos avec son titre et au moins trois paragraphes", () => {
    const { container } = render(<About />);
    const section = container.querySelector("section#a-propos");
    expect(section).not.toBeNull();
    expect(section?.querySelector("h2")).toHaveTextContent("À propos");
    expect(section?.querySelectorAll("p").length).toBeGreaterThanOrEqual(3);
  });
});

describe("<Experience />", () => {
  it("rend au moins quatre blocs, du plus récent au plus ancien, chacun complet avec des badges", () => {
    const { blocs } = loadExperience(contentDir);
    const { container } = render(<Experience />);
    const section = container.querySelector("section#experience");
    expect(section?.querySelector("h2")).toHaveTextContent("Expérience");
    const items = Array.from(section?.querySelectorAll("article") ?? []);
    expect(items.length).toBeGreaterThanOrEqual(4);
    expect(items.length).toBe(blocs.length);
    items.forEach((item, i) => {
      const bloc = blocs[i];
      expect(item).toHaveTextContent(bloc.periode);
      expect(item).toHaveTextContent(bloc.role);
      expect(item).toHaveTextContent(bloc.secteur);
      expect(item).toHaveTextContent(bloc.description);
      const badges = Array.from(item.querySelectorAll('[data-slot="badge"]')).map((b) => b.textContent);
      expect(badges).toEqual(bloc.tags);
    });
  });
});

describe("scripts/check-output — contrôle du HTML généré", () => {
  const page = (body: string) => `<!doctype html><html><head></head><body>${body}</body></html>`;
  const outDir = (html: string) => tempContentDir({ "index.html": page(html) });
  const forbidden = ["finalisé", "Nexus"];

  it("accepte un HTML propre", () => {
    expect(checkOutput(outDir("<p>Projet livré en 2026.</p>"), forbidden)).toEqual([]);
  });

  it("refuse un mot interdit, sans tenir compte de la casse", () => {
    const problems = checkOutput(outDir("<p>Projet FINALISÉ.</p>"), forbidden);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/index\.html.*mot interdit.*finalisé/i);
  });

  it("refuse un emoji", () => {
    const problems = checkOutput(outDir("<p>Livr\u00e9 \u{1F680}</p>"), forbidden);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/index\.html.*emoji/i);
  });

  it("refuse un domaine tiers, mais accepte Google Fonts, GitHub, LinkedIn et le site", () => {
    const allowed = outDir(
      '<link href="https://fonts.googleapis.com/css2"><link href="https://fonts.gstatic.com/x">' +
        '<a href="https://github.com/cedricgicquiaud">a</a><a href="https://www.linkedin.com/in/x">b</a>' +
        '<a href="https://cedricgicquiaud.github.io/">c</a>',
    );
    expect(checkOutput(allowed, forbidden)).toEqual([]);
    const problems = checkOutput(outDir('<script src="https://cdn.example.com/x.js"></script>'), forbidden);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/index\.html.*domaine tiers.*cdn\.example\.com/i);
  });

  it("refuse un numéro de téléphone (0X XX XX XX XX ou +33)", () => {
    for (const phone of ["06 12 34 56 78", "0612345678", "+33 6 12 34 56 78"]) {
      const problems = checkOutput(outDir(`<p>Appelez le ${phone}</p>`), forbidden);
      expect(problems, phone).toHaveLength(1);
      expect(problems[0]).toMatch(/index\.html.*téléphone/i);
    }
    expect(checkOutput(outDir("<p>Tests : 1 234 passés en 2026, hash c0612345678d.</p>"), forbidden)).toEqual([]);
  });
});
