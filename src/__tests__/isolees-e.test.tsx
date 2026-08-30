import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

afterEach(cleanup);

const root = path.resolve(__dirname, "../..");
const source = (rel: string) => readFileSync(path.join(root, rel), "utf8");

/** Le contenu d'un bloc CSS `selector { ... }` (premier niveau d'accolades). */
function cssBlock(css: string, selector: string): string {
  const start = css.indexOf(selector);
  expect(start, `bloc « ${selector} » introuvable`).toBeGreaterThanOrEqual(0);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  throw new Error(`bloc « ${selector} » non fermé`);
}

describe("Token --cyber dans globals.css (PFO-51)", () => {
  const css = source("app/globals.css");

  it("clair : #0f766e ; sombre système et sombre forcé : #5eead4", () => {
    expect(cssBlock(css, ":root {")).toMatch(/--cyber:\s*#0f766e;/);
    expect(cssBlock(css, ":root:not([data-theme=\"light\"]) {")).toMatch(/--cyber:\s*#5eead4;/);
    expect(cssBlock(css, ":root[data-theme=\"dark\"] {")).toMatch(/--cyber:\s*#5eead4;/);
  });

  it("expose --color-cyber dans @theme inline pour les classes text-cyber et bg-cyber", () => {
    expect(cssBlock(css, "@theme inline {")).toMatch(/--color-cyber:\s*var\(--cyber\);/);
  });
});
