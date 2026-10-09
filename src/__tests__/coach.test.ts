import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

// PFO-89 (09/10) : l'app santé prend le nom de code « Coach », sans accord pour le vrai nom ;
// l'ancienne adresse renvoie vers la nouvelle.
const CONTENT = path.join(__dirname, "../../content");
const PUBLIC = path.join(__dirname, "../../public");

describe("Fiche Coach (PFO-89)", () => {
  it("la fiche s'appelle coach.md, plus app-sante.md", () => {
    const fiches = readdirSync(path.join(CONTENT, "fiches"));
    expect(fiches).toContain("coach.md");
    expect(fiches).not.toContain("app-sante.md");
  });

  it("titre court, nom de code annoncé, fiche toujours anonyme", () => {
    const { data, content } = matter(readFileSync(path.join(CONTENT, "fiches", "coach.md"), "utf8"));
    expect(data.nom).toBe("Coach");
    expect(data.visibilite).toBe("anonyme");
    expect(content).toMatch(/^# Coach — santé et longévité IA$/m);
    expect(content).toMatch(/\*\*En bref\.\*\*[^\n]*nom de code/);
  });

  it("/projets/app-sante/ renvoie vers /projets/coach/", () => {
    const page = path.join(PUBLIC, "projets", "app-sante", "index.html");
    expect(existsSync(page)).toBe(true);
    const html = readFileSync(page, "utf8");
    expect(html).toMatch(/<meta http-equiv="refresh" content="0; url=\/projets\/coach\/">/);
    expect(html).toMatch(/<link rel="canonical" href="https:\/\/cedricgicquiaud\.github\.io\/projets\/coach\/">/);
  });

  it("« À propos » pointe vers la nouvelle adresse", () => {
    const about = readFileSync(path.join(CONTENT, "about.md"), "utf8");
    expect(about).toContain("/projets/coach/");
    expect(about).not.toContain("/projets/app-sante/");
  });
});
