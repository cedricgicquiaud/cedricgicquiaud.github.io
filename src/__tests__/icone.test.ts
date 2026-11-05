import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

// next/font ne tourne pas sous Vitest : la police est simulée pour lire les métadonnées du layout.
vi.mock("next/font/google", () => ({ Inter: () => ({ variable: "font-inter" }) }));

// PFO-151 (05/11) : icône d'onglet en monogramme « CG », comme le portfolio de référence, à la place du globe.
const ICONE = path.join(__dirname, "../../app/icon.svg");

describe("Icône d'onglet (PFO-151)", () => {
  it("un SVG carré aux couleurs du site (PFO-154) : fond bleu nuit arrondi, lettres CG turquoise en gras", () => {
    expect(existsSync(ICONE)).toBe(true);
    const svg = readFileSync(ICONE, "utf8");
    const css = readFileSync(path.join(__dirname, "../../app/globals.css"), "utf8");
    const fond = css.match(/--background:\s*(#[0-9a-f]{6})/i)![1];
    const accent = css.match(/--cyber:\s*(#[0-9a-f]{6})/i)![1];
    expect(svg).toMatch(/viewBox="0 0 64 64"/);
    expect(svg).toMatch(new RegExp(`<rect[^>]*rx="\\d+"[^>]*fill="${fond}"`));
    expect(svg).toMatch(new RegExp(`<text[^>]*fill="${accent}"[^>]*font-weight="700"[^>]*>CG</text>`));
  });
});

// PFO-151 : le titre d'onglet change selon la page, comme le portfolio de référence.
describe("Titre d'onglet de l'accueil (PFO-151)", () => {
  it("« Cédric Gicquiaud, Product builder IA », repris par l'aperçu de partage", async () => {
    const { metadata } = await import("../../app/layout");
    expect(metadata.title).toBe("Cédric Gicquiaud, Product builder IA");
    expect(metadata.openGraph?.title).toBe("Cédric Gicquiaud, Product builder IA");
  });
});
