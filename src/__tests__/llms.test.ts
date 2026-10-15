import { describe, expect, it } from "vitest";
import { buildLlms } from "../../lib/llms";

// PFO-116 : llms.txt, le sommaire du site au format llmstxt.org.

describe("buildLlms — l'en-tête (PFO-116)", () => {
  it("commence par le nom en titre, puis le titre du site en citation", () => {
    expect(buildLlms().split("\n\n").slice(0, 2)).toEqual([
      "# Cédric Gicquiaud",
      "> Je transforme un besoin métier en application opérationnelle, en faisant coder des agents IA sous contrôle.",
    ]);
  });
});
