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

  it("tient en 3 ou 4 paragraphes d'au moins 35 mots chacun, 250 mots au plus", () => {
    const paras = paragraphs();
    expect(paras.length).toBeGreaterThanOrEqual(3);
    expect(paras.length).toBeLessThanOrEqual(4);
    for (const p of paras) expect(words(p).length, p.slice(0, 40)).toBeGreaterThanOrEqual(35);
    expect(words(body()).length).toBeLessThanOrEqual(250);
  });

  it("garde le métier, l'app santé, la méthode, l'ESN, le chef de projet, l'indépendant et le principe des preuves", () => {
    const text = body();
    for (const key of [/product builder IA/i, /application mobile de santé/, /seul côté technique/, /agentic engineering/, /ESN/, /chef de projet/, /indépendant/, /ce qui fonctionne et ce qui reste à faire/]) {
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
    expect(hrefs).toEqual(expect.arrayContaining(["/projets/app-sante/", "/projets/pilot/", "/projets/giveme5/"]));
    for (const c of ["[&_a]:hover:text-cyber", "[&_a]:focus-visible:outline-2", "[&_a]:focus-visible:outline-ring"]) expect(prose.className).toContain(c);
  });

  it("refus : chaque lien /projets/<slug>/ désigne une fiche existante", () => {
    const slugs = new Set(loadFiches().map((f) => f.slug));
    const linked = [...loadAbout(contentDir).html.matchAll(/href="\/projets\/([^/"]+)\/"/g)].map((m) => m[1]);
    expect(linked.length).toBeGreaterThan(0);
    for (const slug of linked) expect(slugs.has(slug), slug).toBe(true);
  });

  it("refus : jamais « production » dans « À propos »", () => {
    expect(body()).not.toMatch(/production/i);
  });
});
