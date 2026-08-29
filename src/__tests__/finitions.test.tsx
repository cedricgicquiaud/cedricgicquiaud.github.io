import { execSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
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
  const indexHtml = path.join(out, "index.html");

  /** Sources dont un changement rend `out/` périmé pour ce test. */
  const sources = [path.join(root, "public", "opengraph-image.png"), path.join(root, "app", "layout.tsx")];

  function outIsStale(): boolean {
    if (!existsSync(indexHtml)) return true;
    const built = statSync(indexHtml).mtimeMs;
    return sources.some((f) => existsSync(f) && statSync(f).mtimeMs > built);
  }

  /** `next build` refuse de tourner deux fois en même temps (verrou) : on attend alors la fin de l'autre. */
  async function waitForFreshOut(since: number, ms: number): Promise<void> {
    const deadline = Date.now() + ms;
    while (!existsSync(indexHtml) || statSync(indexHtml).mtimeMs < since) {
      if (Date.now() > deadline) throw new Error("out/index.html non produit par le build concurrent");
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  beforeAll(async () => {
    if (outIsStale()) {
      const since = Date.now();
      try {
        execSync("npm run build", { cwd: root, stdio: "pipe", timeout: 120_000 });
      } catch (error) {
        const { stdout, stderr } = error as { stdout?: Buffer; stderr?: Buffer };
        const output = `${stdout ?? ""}${stderr ?? ""}${String(error)}`;
        if (!/Another next build process is already running/.test(output)) throw error;
        await waitForFreshOut(since, 120_000);
      }
    }
    expect(existsSync(indexHtml), "out/index.html absent après npm run build").toBe(true);
  }, 250_000);

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
