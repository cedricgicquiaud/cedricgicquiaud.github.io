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

  // PFO-90 (10/10) : corps à la première personne, sans faille racontée ni détail de sécurité.
  it("le corps ne raconte ni faille, ni mécanisme de sécurité, ni travail restant", () => {
    const { content } = matter(readFileSync(path.join(CONTENT, "fiches", "coach.md"), "utf8"));
    expect(content).not.toMatch(/humain/i);
    expect(content).not.toMatch(/État honnête/);
    expect(content).not.toMatch(/faille|trop permissif|corrigé/i);
    expect(content).not.toMatch(/jeton|journal|huit parcours/i);
    expect(content).not.toMatch(/à produire|à anonymiser/);
    expect(content).toMatch(/^État au 10\/10\/2026/m);
    expect(content).not.toMatch(/volt|epigenetic/i);
  });

  // PFO-91 (10/10) : maquettes neutres aux couleurs du portfolio, jamais les vrais écrans du client.
  it("montre six maquettes annoncées comme telles (PFO-93)", () => {
    const { data } = matter(readFileSync(path.join(CONTENT, "fiches", "coach.md"), "utf8"));
    expect(data.visuel).toBe("/projets/coach/accueil.webp");
    const fichiers = (data.captures ?? []).map((c: { fichier: string }) => c.fichier);
    // PFO-93 : six écrans dans l'ordre d'un parcours.
    expect(fichiers).toEqual([
      "/projets/coach/forme.webp",
      "/projets/coach/coach-ia.webp",
      "/projets/coach/programme.webp",
      "/projets/coach/resultats.webp",
      "/projets/coach/boutique.webp",
      "/projets/coach/profil.webp",
    ]);
    for (const c of data.captures) expect(c.legende).toMatch(/[Mm]aquette/);
    for (const f of [data.visuel, ...fichiers]) expect(existsSync(path.join(PUBLIC, f))).toBe(true);
  });

  // PFO-92 (10/10) : le contexte décrit l'activité réelle du client sans le rendre identifiable.
  it("le contexte parle de santé préventive et de protocoles par objectif, sans indice sur le client", () => {
    const { content } = matter(readFileSync(path.join(CONTENT, "fiches", "coach.md"), "utf8"));
    const probleme = content.split("## Problème")[1].split("\n## ")[0];
    expect(probleme).toMatch(/santé préventive haut de gamme/);
    expect(probleme).toMatch(/performance, récupération, qualité de la peau, longévité/);
    expect(probleme).toMatch(/prolonge le centre au quotidien/);
    expect(content).not.toMatch(/épigén|epigen|Paris|Cannes|Miami|juin/i);
  });

  it("« À propos » pointe vers la nouvelle adresse", () => {
    const about = readFileSync(path.join(CONTENT, "about.md"), "utf8");
    expect(about).toContain("/projets/coach/");
    expect(about).not.toContain("/projets/app-sante/");
  });
});
