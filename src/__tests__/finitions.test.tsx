import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { Portrait } from "../../components/portrait";

const root = path.resolve(__dirname, "../..");

afterEach(cleanup);

describe("portrait bi-ton (PFO-12)", () => {
  it("rend une image avec un texte alternatif non vide", () => {
    render(<Portrait />);
    const img = screen.getByRole("img");
    expect(img.getAttribute("alt")?.trim()).toBeTruthy();
  });
});

describe("portrait bi-ton : filtre et fusion (PFO-12)", () => {
  it("applique grayscale + contraste à l'image et la fusionne sur un fond bleu token", () => {
    render(<Portrait />);
    const img = screen.getByRole("img");
    expect(img.className).toMatch(/\bgrayscale\b/);
    expect(img.className).toMatch(/\bcontrast-110\b/);
    expect(img.className).toMatch(/\bmix-blend-multiply\b/);
    expect(img.className).toMatch(/\bdark:mix-blend-screen\b/);
    expect(img.parentElement?.className).toMatch(/\bbg-primary\b/);
  });
});

describe("portrait : repli tant que la photo n'est pas fournie (PFO-12)", () => {
  it("sans public/portrait.jpg, affiche le cadre provisoire SVG", () => {
    render(<Portrait photoExists={false} />);
    expect(screen.getByRole("img").getAttribute("src")).toBe("/portrait-placeholder.svg");
    expect(existsSync(path.join(root, "public", "portrait-placeholder.svg"))).toBe(true);
  });

  it("avec public/portrait.jpg, affiche la photo", () => {
    render(<Portrait photoExists />);
    expect(screen.getByRole("img").getAttribute("src")).toBe("/portrait.jpg");
  });

  it("par défaut, décide d'après la présence réelle de public/portrait.jpg", () => {
    const onDisk = existsSync(path.join(root, "public", "portrait.jpg"));
    render(<Portrait />);
    const src = screen.getByRole("img").getAttribute("src");
    expect(src).toBe(onDisk ? "/portrait.jpg" : "/portrait-placeholder.svg");
  });
});

describe("image Open Graph (PFO-13) — lit out/ produit par npm run build", () => {
  const out = path.join(root, "out");
  const ogPng = path.join(out, "opengraph-image.png");

  /** Le test du socle lance `next build` dans un autre worker : on attend la fin de l'export. */
  async function waitFor(file: string, ms: number): Promise<boolean> {
    const deadline = Date.now() + ms;
    while (!existsSync(file)) {
      if (Date.now() > deadline) return false;
      await new Promise((r) => setTimeout(r, 500));
    }
    return true;
  }

  beforeAll(async () => {
    expect(await waitFor(path.join(out, "index.html"), 150_000), "out/index.html absent").toBe(true);
    await waitFor(ogPng, 5_000);
  }, 160_000);

  it("out/opengraph-image.png existe", () => {
    expect(existsSync(ogPng)).toBe(true);
  });

  it("out/index.html référence l'image dans og:image", () => {
    const html = readFileSync(path.join(out, "index.html"), "utf8");
    const content = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
    expect(content, "balise og:image absente").toBeDefined();
    expect(content).toMatch(/\/opengraph-image\.png(\?|$)/);
  });
});
