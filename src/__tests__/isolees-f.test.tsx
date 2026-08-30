import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");
const source = (rel: string) => readFileSync(path.join(root, rel), "utf8");

describe("Pied de page retiré (PFO-54)", () => {
  it("components/footer.tsx n'existe plus et app/layout.tsx ne rend plus <Footer/>", () => {
    expect(existsSync(path.join(root, "components", "footer.tsx"))).toBe(false);
    const layout = source("app/layout.tsx");
    expect(layout).not.toContain("Footer");
    expect(layout).not.toContain("<footer");
  });
});

describe("Ancres de menu sans contact (PFO-54)", () => {
  it("content/site.json n'expose plus que about, experience et projects dans sections", () => {
    const site = JSON.parse(source("content/site.json"));
    expect(Object.keys(site.sections)).toEqual(["about", "experience", "projects"]);
  });
});
