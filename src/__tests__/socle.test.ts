import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");

describe("build statique", () => {
  it("produit out/index.html", () => {
    expect(existsSync(path.join(root, "out", "index.html"))).toBe(true);
  });
});
