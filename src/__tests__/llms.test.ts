import { copyFileSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildLlms } from "../../lib/llms";

// PFO-116 : llms.txt, le sommaire du site au format llmstxt.org.
const CONTENT = path.join(__dirname, "../../content");

/** Un dossier content/ temporaire avec cet `about.md` ; l'expérience est celle du site. */
function contentDir(about: string): string {
  const dir = mkdtempSync(path.join(tmpdir(), "llms-content-"));
  writeFileSync(path.join(dir, "about.md"), about);
  copyFileSync(path.join(CONTENT, "experience.md"), path.join(dir, "experience.md"));
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
