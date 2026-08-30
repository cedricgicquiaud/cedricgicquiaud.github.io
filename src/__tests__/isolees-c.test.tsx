import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "../..");
const read = (rel: string) => readFileSync(path.join(root, rel), "utf8");

describe("Ancres et ids de section depuis site.json (PFO-40)", () => {
  it("content/site.json expose un objet sections avec les quatre ancres", () => {
    const site = JSON.parse(read("content/site.json"));
    expect(site.sections).toEqual({
      about: "a-propos",
      experience: "experience",
      projects: "projets",
      contact: "contact",
    });
  });
});
