import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import site from "../../content/site.json";
import { loadFiches } from "../../lib/fiches";

const root = path.resolve(__dirname, "../..");
const contentDir = path.join(root, "content", "fiches");
const read = (rel: string) => readFileSync(path.join(root, rel), "utf8");

describe("Positionnement « product builder IA » (PFO-69)", () => {
  it("la phrase du site parle d'une application produite par des agents IA, plus de « Je branche »", () => {
    expect(site.title).toMatch(/application/);
    expect(site.title).toMatch(/agents IA/);
    expect(site.title).not.toMatch(/Je branche/);
  });

  it("« À propos » nomme le métier, et le bloc 2026 d'« Expérience » porte le rôle « Product builder IA »", () => {
    expect(read("content/about.md")).toMatch(/product builder IA/i);
    expect(read("content/experience.md")).toMatch(/role: Product builder IA/);
  });

  it("la fiche app santé est la première carte, en visibilité anonyme", () => {
    const [first] = loadFiches(contentDir);
    expect(first.slug).toBe("app-sante");
    expect(first.frontmatter.visibilite).toBe("anonyme");
  });

  it("aucun bloc « En bref » ne met un nombre de tests en accroche", () => {
    for (const f of loadFiches(contentDir)) {
      const enBref = `${f.enBref.quoi} ${f.enBref.chiffre} ${f.enBref.lien}`;
      expect(enBref, f.slug).not.toMatch(/\d[\d\s  ]*tests?\b/i);
    }
  });

  it("refus : la fiche app santé ne dit ni « production » ni « publiée » (l'app n'est pas sortie)", () => {
    expect(read("content/fiches/app-sante.md")).not.toMatch(/production|publiée/i);
  });
});
