import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");
const source = (rel: string) => readFileSync(path.join(root, rel), "utf8");

describe("police Inter (PFO-33)", () => {
  it("app/layout.tsx charge Inter via next/font/google (plus Geist) et pose sa variable sur <html>", () => {
    const layout = source("app/layout.tsx");
    expect(layout).toMatch(/import \{ Inter \} from "next\/font\/google"/);
    expect(layout).not.toMatch(/Geist/);
    // Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" })
    const call = layout.match(/const (\w+) = Inter\(\{([^}]*)\}\)/);
    expect(call, "appel Inter({...}) introuvable").not.toBeNull();
    const [, name, options] = call!;
    expect(options).toMatch(/subsets:\s*\[\s*["']latin["']\s*\]/);
    expect(options).toMatch(/variable:\s*["']--font-sans["']/);
    expect(options).toMatch(/display:\s*["']swap["']/);
    const htmlTag = layout.slice(layout.indexOf("<html"), layout.indexOf(">", layout.indexOf("<html")));
    expect(htmlTag).toContain(`${name}.variable`);
  });
});
