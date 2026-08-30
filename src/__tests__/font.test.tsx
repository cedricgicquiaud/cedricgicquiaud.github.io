import { execSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

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

  it("app/globals.css : --font-sans avec repli système, titres resserrés, corps en 400", () => {
    const css = source("app/globals.css");
    expect(css).toMatch(/--font-sans:\s*var\(--font-sans,\s*ui-sans-serif,\s*system-ui,\s*sans-serif\)\s*;/);
    const base = css.slice(css.indexOf("@layer base"));
    expect(base).toMatch(/h1,\s*h2,\s*h3\s*\{[^}]*letter-spacing:\s*-0\.02em/);
    expect(base).toMatch(/body\s*\{[^}]*font-weight:\s*400/);
  });
});

describe("police Inter (PFO-33) — lit out/ produit par npm run build", () => {
  const indexHtml = path.join(root, "out", "index.html");
  const sources = ["app/layout.tsx", "app/globals.css"].map((f) => path.join(root, f));

  function outIsStale(): boolean {
    if (!existsSync(indexHtml)) return true;
    const built = statSync(indexHtml).mtimeMs;
    return sources.some((f) => statSync(f).mtimeMs > built);
  }

  // Même logique que finitions.test.tsx : on reconstruit seulement si out/ manque ou est
  // plus vieux que les sources (fichiers de tests en série, cf. vitest.config.ts).
  beforeAll(() => {
    if (outIsStale()) execSync("npm run build", { cwd: root, stdio: "pipe", timeout: 120_000 });
    expect(existsSync(indexHtml), "out/index.html absent après npm run build").toBe(true);
  }, 150_000);

  it("out/index.html précharge une police auto-hébergée (woff2 sous /_next/static/media)", () => {
    const html = readFileSync(indexHtml, "utf8");
    const preload = html.match(/<link[^>]*rel="preload"[^>]*as="font"[^>]*>/g) ?? [];
    expect(preload.length).toBeGreaterThan(0);
    for (const tag of preload) expect(tag).toMatch(/href="\/_next\/static\/media\/[^"]+\.woff2"/);
  });

  it("refus : aucune URL fonts.googleapis.com ni fonts.gstatic.com", () => {
    const html = readFileSync(indexHtml, "utf8");
    expect(html).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com/);
  });
});
