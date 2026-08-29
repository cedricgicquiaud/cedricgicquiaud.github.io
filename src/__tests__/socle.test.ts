import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");

const SKIPPED_DIRS = new Set(["node_modules", ".next", "out", ".git", "src"]);

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      return SKIPPED_DIRS.has(name) ? [] : sourceFiles(full);
    }
    return /\.tsx?$/.test(name) ? [full] : [];
  });
}

describe("build statique", () => {
  it("produit out/index.html", () => {
    expect(existsSync(path.join(root, "out", "index.html"))).toBe(true);
  });

  it("refuse tout dossier app/api (aucune API route)", () => {
    expect(existsSync(path.join(root, "app", "api"))).toBe(false);
  });
});

describe("thème", () => {
  it("refuse toute couleur en dur hors app/globals.css", () => {
    const hardcoded = /#[0-9a-f]{3,8}\b|rgba?\(/i;
    const offenders = sourceFiles(root).filter((file) =>
      hardcoded.test(readFileSync(file, "utf8")),
    );
    expect(offenders.map((f) => path.relative(root, f))).toEqual([]);
  });
});
