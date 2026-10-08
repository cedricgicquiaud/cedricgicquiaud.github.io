import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

// PFO-81 (08/10) : le Dashboard devient Tablo, dépôt public ; l'ancienne adresse renvoie vers la nouvelle.
const CONTENT = path.join(__dirname, "../../content");
const PUBLIC = path.join(__dirname, "../../public");

describe("Fiche Tablo (PFO-81)", () => {
  it("la fiche s'appelle tablo.md, plus dashboard.md", () => {
    const fiches = readdirSync(path.join(CONTENT, "fiches"));
    expect(fiches).toContain("tablo.md");
    expect(fiches).not.toContain("dashboard.md");
  });

  it("la fiche est publique et lie le dépôt", () => {
    const { data } = matter(readFileSync(path.join(CONTENT, "fiches", "tablo.md"), "utf8"));
    expect(data.nom).toBe("Tablo");
    expect(data.visibilite).toBe("public");
    expect(data.depot).toBe("https://github.com/cedricgicquiaud/tablo");
  });

  it("/projets/dashboard/ renvoie vers /projets/tablo/", () => {
    const page = path.join(PUBLIC, "projets", "dashboard", "index.html");
    expect(existsSync(page)).toBe(true);
    const html = readFileSync(page, "utf8");
    expect(html).toMatch(/<meta http-equiv="refresh" content="0; url=\/projets\/tablo\/">/);
    expect(html).toMatch(/<link rel="canonical" href="https:\/\/cedricgicquiaud\.github\.io\/projets\/tablo\/">/);
  });
});
