import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { Portrait } from "../../components/portrait";
import { ensureBuild } from "./helpers/build";

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
    expect(img.className).toMatch(/\bmix-blend-screen\b/);
    expect(img.className).not.toMatch(/multiply|dark:/);
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

  it("par défaut, affiche la photo si public/portrait.jpg existe, sinon le cadre provisoire", () => {
    // Le composant regarde `process.cwd()/public/portrait.jpg` : on le pointe vers un dossier temporaire.
    const tmp = mkdtempSync(path.join(os.tmpdir(), "pfo12-"));
    const cwd = vi.spyOn(process, "cwd").mockReturnValue(tmp);
    try {
      render(<Portrait />);
      expect(screen.getByRole("img").getAttribute("src")).toBe("/portrait-placeholder.svg");
      cleanup();

      mkdirSync(path.join(tmp, "public"));
      writeFileSync(path.join(tmp, "public", "portrait.jpg"), "");
      render(<Portrait />);
      expect(screen.getByRole("img").getAttribute("src")).toBe("/portrait.jpg");
    } finally {
      cwd.mockRestore();
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe("image Open Graph (PFO-13) — lit out/ produit par npm run build", () => {
  const out = path.join(root, "out");
  const ogPng = path.join(out, "opengraph-image.png");

  // Sources dont un changement rend `out/` périmé pour ce test (voir helpers/build.ts).
  beforeAll(() => ensureBuild(["public/opengraph-image.png", "app/layout.tsx"]), 250_000);

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
