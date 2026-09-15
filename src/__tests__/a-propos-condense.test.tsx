import { render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { About } from "../../components/about";
import { contentDir, loadAbout } from "../../lib/content";

const body = () => readFileSync(path.join(contentDir, "about.md"), "utf8").split("---").slice(2).join("---");
const words = (s: string) => s.match(/[\p{L}\p{N}]+/gu) ?? [];

describe("« À propos » condensé, informations clés en gras (PFO-70)", () => {
  it("tient en 150 mots au plus et 5 paragraphes au plus", () => {
    expect(words(body()).length).toBeLessThanOrEqual(150);
    expect(body().split(/\n\s*\n/).filter((p) => p.trim()).length).toBeLessThanOrEqual(5);
  });

  it("garde le métier, l'app santé, la méthode, l'ESN, le chef de projet et l'indépendant", () => {
    const text = body();
    for (const key of [/product builder IA/i, /application mobile de santé/, /agentic engineering/, /ESN/, /chef de projet/, /indépendant/]) {
      expect(text).toMatch(key);
    }
  });

  it("met en gras de 4 à 8 segments courts (7 mots au plus), pas des phrases entières", () => {
    const strongs = [...loadAbout(contentDir).html.matchAll(/<strong>(.*?)<\/strong>/g)].map((m) => m[1]);
    expect(strongs.length).toBeGreaterThanOrEqual(4);
    expect(strongs.length).toBeLessThanOrEqual(8);
    for (const s of strongs) expect(words(s).length, s).toBeLessThanOrEqual(7);
  });

  it("le gras ressort : il prend la couleur du texte principal, pas le gris des paragraphes", () => {
    const { container } = render(<About />);
    const prose = container.querySelector("section#a-propos [class*='text-muted-foreground']")!;
    expect(prose.className).toContain("[&_strong]:text-foreground");
    expect(prose.querySelectorAll("strong").length).toBeGreaterThanOrEqual(4);
  });

  it("refus : jamais « production » dans « À propos »", () => {
    expect(body()).not.toMatch(/production/i);
  });
});
