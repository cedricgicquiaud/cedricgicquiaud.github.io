import { copyFileSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { cleanup, render } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Projects } from "../../components/projects";
import { buildLlms } from "../../lib/llms";

afterEach(cleanup);

// PFO-116 : llms.txt, le sommaire du site au format llmstxt.org.
const CONTENT = path.join(__dirname, "../../content");

/** Un dossier content/ temporaire avec cet `about.md` ; l'expérience est celle du site. */
function contentDir(about: string): string {
  const dir = mkdtempSync(path.join(tmpdir(), "llms-content-"));
  writeFileSync(path.join(dir, "about.md"), about);
  copyFileSync(path.join(CONTENT, "experience.md"), path.join(dir, "experience.md"));
  return dir;
}

/** Une fiche Markdown minimale, avec son En bref en trois phrases. */
function ficheMd(nom: string, ordre: number, enBref: string): string {
  const front = [`nom: ${nom}`, "statut: en cours", "periode: 2026", "role: conception", "stack: TypeScript", "visibilite: public", `ordre: ${ordre}`];
  return ["---", ...front, "---", "", `# ${nom}`, "", `**En bref.** ${enBref}`, ""].join("\n");
}

/** Un dossier de fiches temporaire : `{ "alpha.md": "…", "archives/x.md": "…" }`. */
function fichesDir(fichiers: Record<string, string>): string {
  const dir = mkdtempSync(path.join(tmpdir(), "llms-fiches-"));
  for (const [nom, contenu] of Object.entries(fichiers)) {
    mkdirSync(path.dirname(path.join(dir, nom)), { recursive: true });
    writeFileSync(path.join(dir, nom), contenu);
  }
  return dir;
}

/** Les blocs du texte, séparés par une ligne vide. */
const blocs = (texte: string): string[] => texte.split("\n\n");

describe("buildLlms — l'en-tête (PFO-116)", () => {
  it("commence par le nom en titre, puis le titre du site en citation", () => {
    expect(blocs(buildLlms()).slice(0, 2)).toEqual([
      "# Cédric Gicquiaud",
      "> Je transforme un besoin métier en application opérationnelle, en faisant coder des agents IA sous contrôle.",
    ]);
  });

  it("donne ensuite le premier paragraphe d'À propos seul, en texte brut, liens absolus", () => {
    const about = ["---", "titre: À propos", "---", "", "Je suis **builder** : voir [Alpha](/projets/alpha/).", "", "Second paragraphe."].join("\n");
    const texte = buildLlms({ contentDir: contentDir(about) });
    expect(blocs(texte)[2]).toBe("Je suis builder : voir Alpha (https://cedricgicquiaud.github.io/projets/alpha/).");
    expect(texte).not.toContain("Second paragraphe");
  });

  it("refuse dans le paragraphe À propos du site tout gras, tout lien Markdown et toute balise", () => {
    const paragraphe = blocs(buildLlms())[2];
    expect(paragraphe).toMatch(/^Je suis product builder IA/);
    for (const marque of ["**", "](/projets/", "<"]) expect(paragraphe).not.toContain(marque);
  });
});

describe("buildLlms — les projets (PFO-116)", () => {
  it("donne une ligne par fiche, dans l'ordre des cartes, avec le lien absolu de sa page et son En bref", () => {
    const dir = fichesDir({
      "alpha.md": ficheMd("Alpha", 2, "Un outil de suivi. 3 clients. Code public."),
      "beta.md": ficheMd("Beta", 1, "Une app mobile. 500 essais. Démo en ligne."),
    });
    expect(blocs(buildLlms({ fichesDir: dir }))).toContain(
      [
        "- [Beta](https://cedricgicquiaud.github.io/projets/beta/) : Une app mobile. 500 essais. Démo en ligne.",
        "- [Alpha](https://cedricgicquiaud.github.io/projets/alpha/) : Un outil de suivi. 3 clients. Code public.",
      ].join("\n"),
    );
  });

  it("donne les fiches des cartes de l'accueil, dans le même ordre, chacune avec l'URL absolue de sa page", () => {
    const { container } = render(createElement(Projects));
    const cartes = Array.from(container.querySelectorAll("h3 a")).map((a) => `https://cedricgicquiaud.github.io${a.getAttribute("href")}`);
    const liens = Array.from(buildLlms().matchAll(/^- \[[^\]]+\]\(([^)]+)\) : /gm), (m) => m[1]);
    expect(cartes).toHaveLength(8);
    expect(liens).toEqual(cartes);
  });
});
