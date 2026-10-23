import { cleanup, render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { About } from "../../components/about";
import { contentDir, loadAbout } from "../../lib/content";
import { loadFiches } from "../../lib/fiches";

const body = () => readFileSync(path.join(contentDir, "about.md"), "utf8").split("---").slice(2).join("---");
const paragraphs = () => body().split(/\n\s*\n/).filter((p) => p.trim());
const words = (s: string) => s.replace(/\]\([^)]*\)/g, "]").match(/[\p{L}\p{N}]+/gu) ?? [];
const proseClass = () => {
  const { container } = render(<About />);
  return container.querySelector("section#a-propos [class*='text-muted-foreground']")!;
};

describe("« À propos » dense, à la manière du modèle (PFO-71)", () => {
  // Deux rendus laissés dans le document dupliquent l'id de section : jsdom trouverait le premier.
  afterEach(cleanup);

  // PFO-120 (23/10) : un cinquième paragraphe dit ce que je garde pour moi face à l'IA ; plafond porté à 310 mots.
  it("tient en 3 à 5 paragraphes d'au moins 35 mots chacun, 310 mots au plus", () => {
    const paras = paragraphs();
    expect(paras.length).toBeGreaterThanOrEqual(3);
    expect(paras.length).toBeLessThanOrEqual(5);
    for (const p of paras) expect(words(p).length, p.slice(0, 40)).toBeGreaterThanOrEqual(35);
    expect(words(body()).length).toBeLessThanOrEqual(310);
  });

  it("garde le métier, l'app santé, la méthode, la banque, le chef de projets, l'indépendant et le principe des preuves", () => {
    const text = body();
    for (const key of [/product builder IA/i, /application mobile de santé/, /je développe et implémente seul/, /agentic engineering/, /informatique bancaire/, /chef de projets/, /indépendant/, /ce qui fonctionne et ce qui reste à faire/]) {
      expect(text).toMatch(key);
    }
  });

  it("met en valeur de 3 à 8 segments courts (6 mots au plus)", () => {
    const strongs = [...loadAbout(contentDir).html.matchAll(/<strong>(.*?)<\/strong>/g)].map((m) => m[1]);
    expect(strongs.length).toBeGreaterThanOrEqual(3);
    expect(strongs.length).toBeLessThanOrEqual(8);
    for (const s of strongs) expect(words(s).length, s).toBeLessThanOrEqual(6);
  });

  it("mots clés et liens en couleur du texte principal, graisse moyenne ; plus de gras appuyé", () => {
    const cls = proseClass().className;
    for (const c of ["[&_strong]:font-medium", "[&_strong]:text-foreground", "[&_a]:font-medium", "[&_a]:text-foreground"]) expect(cls).toContain(c);
    expect(cls).not.toContain("font-semibold");
  });

  it("les projets cités sont des liens vers leur fiche, visibles au survol et au clavier", () => {
    const prose = proseClass();
    const hrefs = [...prose.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(expect.arrayContaining(["/projets/coach/", "/projets/pilot/", "/projets/giveme5/"]));
    for (const c of ["[&_a]:hover:text-cyber", "[&_a]:focus-visible:outline-2", "[&_a]:focus-visible:outline-ring"]) expect(prose.className).toContain(c);
  });

  it("refus : chaque lien /projets/<slug>/ désigne une fiche existante", () => {
    const slugs = new Set(loadFiches().map((f) => f.slug));
    const linked = [...loadAbout(contentDir).html.matchAll(/href="\/projets\/([^/"]+)\/"/g)].map((m) => m[1]);
    expect(linked.length).toBeGreaterThan(0);
    for (const slug of linked) expect(slugs.has(slug), slug).toBe(true);
  });

  it("dit ce que je ne confie pas à l'IA et comment je valide une PR (PFO-120)", () => {
    const text = body().replace(/\s+/g, " ");
    for (const key of [/décisions produit ni le modèle de données/, /Je valide chaque PR au niveau fonctionnel/, /si une erreur est récurrente, ça devient une règle/]) {
      expect(text).toMatch(key);
    }
  });

  it("refus : jamais « production » dans « À propos »", () => {
    expect(body()).not.toMatch(/production/i);
  });
});

// PFO-102 (12/10) : le texte reprend le « À propos » LinkedIn.
describe("« À propos » aligné sur LinkedIn (PFO-102)", () => {
  it("cite les employeurs et les chiffres du profil LinkedIn", () => {
    const text = body().replace(/\s+/g, " ");
    for (const key of [
      /VIVEO/,
      /Sopra Steria/,
      /quinze personnes/,
      /150 clients/,
      /dix conseillers/,
      /8 défauts cachés derrière des tests verts/,
      /freelance/,
      /TPE/,
    ])
      expect(text).toMatch(key);
  });

  // PFO-104 (12/10) : pas de phrase de recherche de poste.
  it("refus : le texte ne dit pas que je cherche un poste", () => {
    expect(body()).not.toMatch(/je cherche|Suisse|télétravail/i);
  });

  it("refus : ni le nom interne de l'application, ni « ESN »", () => {
    expect(body()).not.toMatch(/volt/i);
    expect(body()).not.toMatch(/\bESN\b/);
  });
});
