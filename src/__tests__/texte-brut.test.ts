import { describe, expect, it } from "vitest";
import { loadFiches } from "../../lib/fiches";
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

  it("garde les numéros d'une liste numérotée", () => {
    expect(texteBrut("1. Je relis la PR.\n2. Claude remet le tableau à jour.", SITE)).toBe(
      "1. Je relis la PR.\n2. Claude remet le tableau à jour.",
    );
  });

  it("décale de deux espaces une liste dans une liste", () => {
    const md = ["2. Le tdd-writer fabrique.", "   - Il écrit le test.", "   - Il écrit le code."].join("\n");
    expect(texteBrut(md, SITE)).toBe(["2. Le tdd-writer fabrique.", "  - Il écrit le test.", "  - Il écrit le code."].join("\n"));
  });

  it("recolle une phrase coupée sur deux lignes dans le Markdown", () => {
    expect(texteBrut("La difficulté n'est plus d'écrire : c'est\nde savoir si c'est juste.", SITE)).toBe(
      "La difficulté n'est plus d'écrire : c'est de savoir si c'est juste.",
    );
  });

  it("retire les balises HTML et garde leur texte", () => {
    expect(texteBrut("Un <strong>mot</strong> clé.<br>\n\n<div>Bloc</div>", SITE)).toBe("Un mot clé.\n\nBloc");
  });

  it("écrit le code sans accents graves, un paramètre `<nom>` entre guillemets", () => {
    expect(texteBrut("On tape `/pilot <commande>` dans `SKILL.md`.", SITE)).toBe("On tape /pilot «commande» dans SKILL.md.");
  });

  it("sépare deux paragraphes par une ligne vide", () => {
    expect(texteBrut("Premier.\n\nSecond.", SITE)).toBe("Premier.\n\nSecond.");
  });
});

describe("Les fiches de content/fiches/ en texte brut (PFO-111)", () => {
  // Restes de Markdown ou de HTML qu'un agent lirait mal ; `(/` = lien resté relatif.
  const RESTES = [/<[a-z]/i, /\*\*/, /\]\(/, /\|-{3}/, /\(\//];

  for (const fiche of loadFiches()) {
    it(`${fiche.slug} : cinq sections non vides, sans balise, gras, lien Markdown ni tableau`, () => {
      const textes = fiche.sections.map((s) => texteBrut(s.markdown ?? "", SITE));
      expect(textes.filter(Boolean)).toHaveLength(5);
      for (const texte of textes) for (const reste of RESTES) expect(texte).not.toMatch(reste);
    });
  }
});

describe("La fiche PILOT en texte brut (PFO-111)", () => {
  const pilot = loadFiches().find((f) => f.slug === "pilot");
  const construit = texteBrut(pilot?.sections.find((s) => s.id === "construit")?.markdown ?? "", SITE);

  it("écrit le tableau des agents en titre puis une ligne par agent", () => {
    expect(construit).toContain(
      [
        "Agent — Quand — Ce qu'il fait — Ce qu'il ne fait jamais — Modèle — Limite",
        "- contradicteur — Liste des fonctionnalités, préparation d'une fonctionnalité — Cherche ce qui manque ou se contredit — Répondre à ma place — Fable — 50",
      ].join("\n"),
    );
    expect(construit).toContain("- correcteur — Après les relectures — Répare la liste des défauts, une seule fois — Toucher à autre chose — Opus — 80");
  });

  it("écrit ses trois images en « Image : légende (URL absolue) »", () => {
    expect(construit).toContain(
      "Image : Une tâche réelle de l'application mobile de santé dans Linear (https://cedricgicquiaud.github.io/projets/pilot/linear.png)",
    );
    expect(construit).toContain("Image : Le chef d'atelier et les six agents (https://cedricgicquiaud.github.io/projets/pilot/agents.png)");
    expect(construit).toContain("Image : Une PR réelle de ce site, écrite par l'agent (https://cedricgicquiaud.github.io/projets/pilot/pr.png)");
  });

  it("écrit ses sous-titres ### en lignes simples", () => {
    expect(construit).toContain("\n\nÉtape 1 — Comprendre le projet (init)\n\n");
  });
});
