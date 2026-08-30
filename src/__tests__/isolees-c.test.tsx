import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fingerprint } from "../../scripts/check-output.mjs";
import { About } from "../../components/about";
import { Experience } from "../../components/experience";
import { Fiche } from "../../components/fiche";
import { Footer } from "../../components/footer";
import { Nav } from "../../components/nav";
import { Projects } from "../../components/projects";
import { loadFiches } from "../../lib/fiches";

// site.json de test : mêmes champs que le vrai, ancres différentes. Le mock vaut pour
// tout le fichier ; le test de forme lit le vrai fichier via le système de fichiers.
vi.mock("../../content/site.json", () => ({
  default: {
    name: "Nom Test",
    title: "Titre test.",
    email: "test@example.com",
    links: { github: "https://github.com/x", linkedin: "https://www.linkedin.com/in/x/", repo: "https://github.com/x/y" },
    sections: { about: "x-about", experience: "x-exp", projects: "x-proj", contact: "x-contact" },
  },
}));

afterEach(cleanup);

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

  it("le menu et les sections suivent les ids de site.json (mock)", () => {
    render(<Nav />);
    const hrefs = Array.from(screen.getByRole("navigation").querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["/#x-about", "/#x-exp", "/#x-proj"]);
    cleanup();
    const { container } = render(
      <>
        <About />
        <Experience />
        <Projects fiches={[]} />
        <Footer />
        <Fiche fiche={loadFiches()[0]} />
      </>,
    );
    expect(Array.from(container.querySelectorAll("section[id]")).map((s) => s.id).slice(0, 3)).toEqual([
      "x-about",
      "x-exp",
      "x-proj",
    ]);
    expect(container.querySelector("footer")).toHaveAttribute("id", "x-contact");
    expect(screen.getByRole("link", { name: "← Projets" })).toHaveAttribute("href", "/#x-proj");
  });

  it("aucun littéral d'ancre dans components/ (hors import de site.json)", () => {
    const dir = path.join(root, "components");
    const files = readdirSync(dir).filter((n) => n.endsWith(".tsx"));
    const literal = /["'`](a-propos|experience|projets|contact)["'`]|#(a-propos|experience|projets|contact)\b/;
    const offenders: string[] = [];
    for (const name of files) {
      read(path.join("components", name))
        .split("\n")
        .forEach((line, i) => {
          if (/^\s*import\b.*site\.json/.test(line)) return;
          if (literal.test(line)) offenders.push(`${name}:${i + 1}: ${line.trim()}`);
        });
    }
    expect(offenders).toEqual([]);
  });
});

describe("Serveur de dev par PID (PFO-45)", () => {
  const script = path.join(root, "scripts", "dev-serve.sh");

  it("scripts/dev-serve.sh existe, est exécutable et passe bash -n", () => {
    expect(existsSync(script)).toBe(true);
    expect(statSync(script).mode & 0o111, "bit exécutable absent").not.toBe(0);
    expect(() => execFileSync("bash", ["-n", script])).not.toThrow();
  });

  it("stop refuse un fichier PID corrompu (exit 1, « fichier PID corrompu ») sans tuer quoi que ce soit", () => {
    const port = "3998";
    const pidfile = path.join(process.env.TMPDIR ?? "/tmp", `watido-dev-${port}.pid`);
    writeFileSync(pidfile, "abc\n");
    try {
      let code = 0;
      let stderr = "";
      try {
        execFileSync(script, ["stop", port], { cwd: root, encoding: "utf8", stdio: "pipe" });
      } catch (e) {
        code = (e as { status: number }).status;
        stderr = (e as { stderr: string }).stderr;
      }
      expect(code).toBe(1);
      expect(stderr).toContain("fichier PID corrompu");
    } finally {
      rmSync(pidfile, { force: true });
    }
  });

  // Lance un vrai `next dev` : un seul à la fois, sur un port réservé au test.
  describe.sequential("start / stop sur le port 3999", () => {
    const port = "3999";
    const pidfile = path.join(process.env.TMPDIR ?? "/tmp", `watido-dev-${port}.pid`);
    const run = (cmd: string) => execFileSync(script, [cmd, port], { cwd: root, encoding: "utf8" });
    const status = async () => {
      try {
        return (await fetch(`http://localhost:${port}/`)).status;
      } catch {
        return null;
      }
    };
    // Sans DEV_SERVE_E2E=1 (posé par `npm test`), le test est sauté : il lance un vrai `next dev`.
    const e2e = process.env.DEV_SERVE_E2E === "1" ? it : it.skip;
    afterAll(() => {
      try {
        run("stop");
      } catch {
        // déjà arrêté
      } finally {
        // `next dev` réécrit CLAUDE.md (bloc nextjs-agent-rules) et tsconfig.json : on les restaure.
        execFileSync("git", ["checkout", "--", "CLAUDE.md", "tsconfig.json"], { cwd: root });
      }
    });

    e2e("start répond 200 et écrit le PID ; stop libère le port et retire le fichier (DEV_SERVE_E2E=1 requis)", async () => {
      expect(await status(), "le port 3999 doit être libre avant le test").toBeNull();
      const started = run("start");
      expect(started).toMatch(/lancé \(PID \d+\)/);
      expect(existsSync(pidfile)).toBe(true);
      const pid = Number(readFileSync(pidfile, "utf8").trim());
      expect(pid).toBeGreaterThan(0);
      expect(await status()).toBe(200);
      expect(run("status")).toContain(`PID ${pid}`);

      expect(run("stop")).toContain("arrêté");
      expect(existsSync(pidfile)).toBe(false);
      expect(run("status").trim()).toBe("arrêté");
      expect(await status()).toBeNull();
    }, 120_000);
  });
});

describe("Barème anonymisé (PFO-15)", () => {
  it(".pilot/calibration.md ne cite ni organisation ni dépôt tiers, seulement des mentions génériques", () => {
    // Aucun nom en clair ici : chaque mot du barème est haché et comparé aux empreintes
    // de content/forbidden.txt (même fonction que check-output).
    const md = read(".pilot/calibration.md");
    const forbidden = new Set(read("content/forbidden.txt").split("\n").map((l) => l.trim()).filter(Boolean));
    const words = Array.from(md.matchAll(/\p{L}+/gu), ([w]) => w);
    const hits = Array.from(new Set(words.filter((w) => forbidden.has(fingerprint(w)))));
    expect(hits).toEqual([]);
    expect(md).toContain("un projet personnel");
    expect(md).toContain("un projet client");
  });
});
