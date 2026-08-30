import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Spotlight } from "../../components/spotlight";

describe("halo souris (PFO-31) — rendu serveur", () => {
  it("ne rend rien côté serveur", () => {
    expect(renderToString(<Spotlight />)).toBe("");
  });
});
