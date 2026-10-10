import { readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { fingerprint } from "../../scripts/check-output.mjs";

// PFO-96 (10/10) : Nexus cité par son nom, avec l'accord de l'associé ; code privé.
const CONTENT = path.join(__dirname, "../../content");
const read = (f: string) => readFileSync(path.join(CONTENT, f), "utf8");
const forbidden = () => new Set(read("forbidden.txt").split("\n").map((l) => l.trim()).filter(Boolean));

describe("Fiche Nexus (PFO-96)", () => {
  it("cite le nom, code privé, en cours, rôle de cofondateur, juste après Coach", () => {
    const { data, content } = matter(read("fiches/nexus.md"));
    expect(data.nom).toBe("Nexus");
    expect(data.visibilite).toBe("prive");
    expect(data.statut).toBe("en cours");
    expect(data.role).toMatch(/^cofondateur technique, en binôme avec un associé/);
    expect(data.ordre).toBe(2);
    expect(content).toMatch(/^# Nexus — /m);
  });

  it("« nexus » n'est plus un mot interdit du site", () => {
    expect(forbidden().has(fingerprint("nexus"))).toBe(false);
  });

  it("aucun mot de la fiche n'est interdit : ni associé, ni client, ni financeur, ni domaine", () => {
    const words = Array.from(read("fiches/nexus.md").matchAll(/\p{L}+/gu), ([w]) => w);
    const set = forbidden();
    expect(Array.from(new Set(words.filter((w) => set.has(fingerprint(w)))))).toEqual([]);
    // Les noms liés au projet qui ne doivent jamais sortir (associé, client, partenaires, domaine) : empreintes seules.
    for (const h of [
      "0d2c690e7dd5f94780383e9dfa1f4def044319104ad16ab15e45eeb2a8dfc81b",
      "dfef5e53f9848472560a3e680a310d097ecc75919740646df38d31cab7aa07ac",
      "6297862854aad53ca564c194fe063758136350c3955f531b4f26b995e2688c65",
      "8f0fc08915b27c29736f02ff3c57f20b2f86212feba734af0c5f35bb7a7612ed",
      "bb74713c18d0c1132f2402b9ce7fa9916bae93fc82e60a657001924b01cec6f0",
      "dc4af45b888447abed8ddebab44ac9ad7a830eb646f344ccbd16110ed090b966",
      "477699ffe4b5f6ae0cee3f8c95d9d299ded982fcf3792e1cc850733a9de300b7",
    ])
      expect(set.has(h), h).toBe(true);
  });

  it("le corps suit les règles des fiches", () => {
    const { content } = matter(read("fiches/nexus.md"));
    expect(content).toMatch(/^État au 10\/10\/2026/m);
    expect(content).not.toMatch(/humain/i);
    expect(content).not.toMatch(/faille|corrigé|finalisé/i);
    expect(content).not.toMatch(/\d+\s+tests?\b/i);
    expect(content).not.toMatch(/fusion|tablo|M€|millions/i);
  });
});
