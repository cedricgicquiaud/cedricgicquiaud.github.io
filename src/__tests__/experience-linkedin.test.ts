import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { contentDir, loadExperience } from "../../lib/content";
import { fingerprint } from "../../scripts/check-output.mjs";

// PFO-100 (12/10) : la section Expérience reprend les postes du profil LinkedIn, entreprises nommées.
// PFO-101 (12/10) : le CDD Maison Epigenetic affiche sa fin, janv. 2027.
const forbidden = () =>
  new Set(readFileSync(path.join(contentDir, "forbidden.txt"), "utf8").split("\n").map((l) => l.trim()).filter(Boolean));

describe("Expérience alignée sur LinkedIn (PFO-100)", () => {
  it("sept postes, du plus récent au plus ancien, chacun avec son entreprise", () => {
    const { blocs } = loadExperience(contentDir);
    expect(blocs.map((b) => [b.role, b.secteur.split(" · ")[0]])).toEqual([
      ["Product builder IA", "Maison Epigenetic"],
      ["Product builder IA", "Indépendant"],
      ["Fondateur", "GiveMe5"],
      ["Consultant digital freelance", "EXEDIGIT"],
      ["Conseiller immobilier et manager réseau", "I@D France"],
      ["Chef de projets, banque et assurance", "Sopra Steria"],
      ["Concepteur-développeur, banque", "VIVEO Banking & Finance Consulting"],
    ]);
    expect(new Set(blocs.map((b) => b.periode)).size).toBe(7);
  });

  it("les dates et les chiffres sont ceux de LinkedIn", () => {
    const { blocs } = loadExperience(contentDir);
    expect(blocs.map((b) => b.periode)).toEqual([
      "janv. 2026 → janv. 2027",
      "oct. 2026 → aujourd'hui",
      "août 2023 → aujourd'hui",
      "oct. 2023 → déc. 2025",
      "févr. 2013 → sept. 2023",
      "juil. 2007 → déc. 2012",
      "févr. 2000 → juil. 2007",
    ]);
    const text = blocs.map((b) => b.description).join("\n");
    for (const s of [/150 clients/, /dix conseillers/, /quinze personnes/, /Evolan Capital Market/, /49 €/, /diagnostiqueur immobilier/])
      expect(text).toMatch(s);
  });

  it("le poste Maison Epigenetic dit « je développe et implémente » (PFO-101)", () => {
    const [premier] = loadExperience(contentDir).blocs;
    expect(premier.description).toMatch(/^Je développe et implémente une application mobile de santé/);
    expect(premier.description).not.toMatch(/mène seul côté technique/);
  });

  it("le poste indépendant dit « Réalisations au forfait », sans « petites » (PFO-101)", () => {
    const independant = loadExperience(contentDir).blocs[1];
    expect(independant.description).toMatch(/^Réalisations au forfait pour des TPE\./);
  });

  it("le poste Sopra Steria dit la TMA et l'encadrement jusqu'à quinze personnes (PFO-101)", () => {
    const sopra = loadExperience(contentDir).blocs[5];
    expect(sopra.description).toBe(
      "Pilotage de projets en TMA pour des clients grands comptes du secteur bancaire. Pilotage du progiciel interne Evolan Capital Market. Encadrement d'équipe jusqu'à quinze personnes : recueil du besoin, spécifications fonctionnelles, développement, qualification, mise en production, support.",
    );
  });

  it("les deux employeurs publics sur LinkedIn ne sont plus interdits ; le nom de l'application l'est toujours", () => {
    const set = forbidden();
    expect(set.has(fingerprint("epigenetic"))).toBe(false);
    expect(set.has(fingerprint("exedigit"))).toBe(false);
    expect(set.has("6aafbd2b3f430155014edea9e4605bd7da97330739b845038828ddc4851b3ba5")).toBe(true);
  });
});
