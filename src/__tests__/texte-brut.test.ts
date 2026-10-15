import { describe, expect, it } from "vitest";
import { texteBrut } from "../../lib/texte-brut";

// PFO-111 : le Markdown d'une section, lisible par un agent IA (D11).
const SITE = "https://cedricgicquiaud.github.io";

describe("texteBrut (PFO-111)", () => {
  it("retire le gras et garde les mots", () => {
    expect(texteBrut("Un **outil** qui marche.", SITE)).toBe("Un outil qui marche.");
  });

  it("écrit un lien relatif en « texte (URL absolue) »", () => {
    expect(texteBrut("Voir [l'app santé](/projets/coach/).", SITE)).toBe(
      "Voir l'app santé (https://cedricgicquiaud.github.io/projets/coach/).",
    );
  });

  it("écrit une URL nue une seule fois", () => {
    expect(texteBrut("Dépôt : https://github.com/cedricgicquiaud/slice", SITE)).toBe(
      "Dépôt : https://github.com/cedricgicquiaud/slice",
    );
  });

  it("écrit une image en « Image : légende (URL absolue) »", () => {
    expect(texteBrut("![Le tableau Linear](/projets/pilot/linear.png)", SITE)).toBe(
      "Image : Le tableau Linear (https://cedricgicquiaud.github.io/projets/pilot/linear.png)",
    );
  });

  it("écrit un tableau en titre puis une ligne « - cellule — cellule » par rangée", () => {
    const tableau = ["| Agent | Rôle |", "|---|---|", "| verifier | Relit le **code** |", "| testeur | Prend des captures |"].join("\n");
    expect(texteBrut(tableau, SITE)).toBe(["Agent — Rôle", "- verifier — Relit le code", "- testeur — Prend des captures"].join("\n"));
  });

  it("omet les cellules vides d'une rangée", () => {
    const tableau = ["| Fiche | Contenu |", "|---|---|", "| *Modèles à remplir (6)* | |"].join("\n");
    expect(texteBrut(tableau, SITE)).toBe(["Fiche — Contenu", "- Modèles à remplir (6)"].join("\n"));
  });

  it("écrit une liste à puces en lignes « - … »", () => {
    expect(texteBrut("- **Linear** est le tableau de bord.\n- GitHub est l'atelier.", SITE)).toBe(
      "- Linear est le tableau de bord.\n- GitHub est l'atelier.",
    );
  });
});
