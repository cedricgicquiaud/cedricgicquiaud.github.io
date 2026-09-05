import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Fiche } from "../../components/fiche";
import { ProjectCard } from "../../components/project-card";
import type { Fiche as FicheData } from "../../lib/fiches";

afterEach(cleanup);

/** Fiche factice complète, sans captures ni vidéo ; chaque test ne surcharge que ce qu'il observe. */
function fakeFiche(over: Partial<FicheData> = {}): FicheData {
  return {
    slug: "factice",
    titre: "Factice — un titre de fiche",
    frontmatter: {
      nom: "Factice",
      statut: "en cours",
      periode: "2026",
      role: "conception",
      stack: ["TypeScript"],
      visibilite: "public",
      depot: "https://github.com/x/factice",
      depotNote: "https://github.com/x/factice",
      demo: "",
      demoNote: "",
    },
    enBref: { quoi: "Un service factice.", chiffre: "12 tests verts.", lien: "" },
    sections: [
      { id: "probleme", titre: "Problème", html: "<p>Texte du problème.</p>" },
      { id: "construit", titre: "Ce que j'ai construit", html: "<p>Texte de la construction.</p>" },
      { id: "preuves", titre: "Preuves", html: "<p>Texte des preuves.</p>" },
      { id: "appris", titre: "Ce que j'en ai appris", html: "<p>Texte des leçons.</p>" },
      { id: "artefacts", titre: "Artefacts", html: "<p>Texte des artefacts.</p>" },
    ],
    visuel: "/projets/generated/factice.png",
    ...over,
  };
}

describe("Page de fiche sans captures ni vidéo — rendu figé avant la galerie (PFO-63, refus)", () => {
  it("garde le corps actuel : une seule image, aucune figure, aucun lecteur, aucune ancre video", () => {
    const { container } = render(<Fiche fiche={fakeFiche()} />);
    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(container.querySelector("figure")).toBeNull();
    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector("#video")).toBeNull();
    expect(container.innerHTML).toMatchInlineSnapshot(`"<article class="px-6 py-16 lg:px-16"><div class="mx-auto w-full max-w-3xl"><a class="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" href="/#projets">← Projets</a><h1 class="mt-6 text-4xl font-bold tracking-tight">Factice — un titre de fiche</h1><img alt="" width="1200" height="750" class="mt-6 aspect-[16/10] w-full rounded-lg border border-border object-cover" src="/projets/generated/factice.png"><dl class="mt-6 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]"><dt class="text-muted-foreground">Statut</dt><dd>en cours</dd><dt class="text-muted-foreground">Période</dt><dd>2026</dd><dt class="text-muted-foreground">Rôle</dt><dd>conception</dd><dt class="text-muted-foreground">Stack</dt><dd><ul class="flex flex-wrap gap-2"><li><span data-slot="badge" data-variant="cyber" class="group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/40 [&amp;>svg]:pointer-events-none [&amp;>svg]:size-3! bg-cyber/10 text-cyber [a]:hover:bg-cyber/20">TypeScript</span></li></ul></dd><dt class="text-muted-foreground">Visibilité</dt><dd>public</dd></dl><p class="mt-4 flex gap-4 text-sm"><a href="https://github.com/x/factice" class="underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">Code</a></p><p class="mt-8 border-l-2 border-primary pl-4 text-base leading-relaxed"><strong>En bref.</strong> Un service factice. 12 tests verts.</p><section id="probleme" class="mt-12"><h2 class="mb-4 text-sm font-bold uppercase tracking-widest">Problème</h2><div class="space-y-4 text-base leading-relaxed [&amp;_ul]:list-disc [&amp;_ul]:space-y-1 [&amp;_ul]:pl-6 [&amp;_ol]:list-decimal [&amp;_ol]:pl-6 [&amp;_a]:underline [&amp;_a]:underline-offset-4 [&amp;_a:hover]:text-foreground [&amp;_a]:break-words [&amp;_strong]:font-semibold [&amp;_code]:rounded [&amp;_code]:bg-muted [&amp;_code]:px-1 [&amp;_code]:text-sm"><p>Texte du problème.</p></div></section><section id="construit" class="mt-12"><h2 class="mb-4 text-sm font-bold uppercase tracking-widest">Ce que j'ai construit</h2><div class="space-y-4 text-base leading-relaxed [&amp;_ul]:list-disc [&amp;_ul]:space-y-1 [&amp;_ul]:pl-6 [&amp;_ol]:list-decimal [&amp;_ol]:pl-6 [&amp;_a]:underline [&amp;_a]:underline-offset-4 [&amp;_a:hover]:text-foreground [&amp;_a]:break-words [&amp;_strong]:font-semibold [&amp;_code]:rounded [&amp;_code]:bg-muted [&amp;_code]:px-1 [&amp;_code]:text-sm"><p>Texte de la construction.</p></div></section><section id="preuves" class="mt-12"><h2 class="mb-4 text-sm font-bold uppercase tracking-widest">Preuves</h2><div class="space-y-4 text-base leading-relaxed [&amp;_ul]:list-disc [&amp;_ul]:space-y-1 [&amp;_ul]:pl-6 [&amp;_ol]:list-decimal [&amp;_ol]:pl-6 [&amp;_a]:underline [&amp;_a]:underline-offset-4 [&amp;_a:hover]:text-foreground [&amp;_a]:break-words [&amp;_strong]:font-semibold [&amp;_code]:rounded [&amp;_code]:bg-muted [&amp;_code]:px-1 [&amp;_code]:text-sm"><p>Texte des preuves.</p></div></section><section id="appris" class="mt-12"><h2 class="mb-4 text-sm font-bold uppercase tracking-widest">Ce que j'en ai appris</h2><div class="space-y-4 text-base leading-relaxed [&amp;_ul]:list-disc [&amp;_ul]:space-y-1 [&amp;_ul]:pl-6 [&amp;_ol]:list-decimal [&amp;_ol]:pl-6 [&amp;_a]:underline [&amp;_a]:underline-offset-4 [&amp;_a:hover]:text-foreground [&amp;_a]:break-words [&amp;_strong]:font-semibold [&amp;_code]:rounded [&amp;_code]:bg-muted [&amp;_code]:px-1 [&amp;_code]:text-sm"><p>Texte des leçons.</p></div></section><section id="artefacts" class="mt-12"><h2 class="mb-4 text-sm font-bold uppercase tracking-widest">Artefacts</h2><div class="space-y-4 text-base leading-relaxed [&amp;_ul]:list-disc [&amp;_ul]:space-y-1 [&amp;_ul]:pl-6 [&amp;_ol]:list-decimal [&amp;_ol]:pl-6 [&amp;_a]:underline [&amp;_a]:underline-offset-4 [&amp;_a:hover]:text-foreground [&amp;_a]:break-words [&amp;_strong]:font-semibold [&amp;_code]:rounded [&amp;_code]:bg-muted [&amp;_code]:px-1 [&amp;_code]:text-sm"><p>Texte des artefacts.</p></div></section></div></article>"`);
  });
});

const CAPTURES = [
  { fichier: "/projets/factice/accueil.png", legende: "L'écran d'accueil" },
  { fichier: "/projets/factice/rapport.png", legende: "Le rapport de tests" },
];

describe("Galerie légendée sur la page (PFO-63)", () => {
  it("montre une figure par capture, dans l'ordre déclaré, l'image avec la légende en alt et la légende exacte dessous", () => {
    const { container } = render(<Fiche fiche={fakeFiche({ captures: CAPTURES })} />);
    const figures = Array.from(container.querySelectorAll("figure"));
    expect(figures).toHaveLength(2);
    for (const [i, figure] of figures.entries()) {
      const img = figure.querySelector("img")!;
      expect(img.getAttribute("src")).toBe(CAPTURES[i].fichier);
      expect(img.getAttribute("alt")).toBe(CAPTURES[i].legende);
      expect(img.getAttribute("loading")).toBe("lazy");
      const caption = figure.querySelector("figcaption")!;
      expect(caption.textContent).toBe(CAPTURES[i].legende);
      // La légende est sous l'image.
      expect(img.compareDocumentPosition(caption) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  });

  it("se place entre « En bref » et « Problème », en une colonne puis deux dès sm, images à leur ratio, sans script ni lightbox", () => {
    const { container } = render(<Fiche fiche={fakeFiche({ captures: CAPTURES })} />);
    const gallery = container.querySelector("figure")!.parentElement!;
    expect(gallery.querySelectorAll("figure")).toHaveLength(2);
    expect(gallery).toHaveClass("grid", "grid-cols-1", "sm:grid-cols-2");
    const enBref = container.querySelector("p strong")!.closest("p")!;
    expect(enBref.textContent).toContain("En bref.");
    expect(enBref.compareDocumentPosition(gallery) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(gallery.compareDocumentPosition(container.querySelector("section#probleme")!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    for (const img of Array.from(gallery.querySelectorAll("img"))) {
      expect(img.className).not.toMatch(/aspect-|object-cover/);
      expect(img.className).toMatch(/\bw-full\b/);
      expect(img.className).toMatch(/\bh-auto\b/);
    }
    expect(container.querySelector("script, button, dialog, a[href$='.png']")).toBeNull();
  });

  it("refus : une liste de captures vide ne rend ni galerie ni conteneur, le corps est identique à une fiche sans captures", () => {
    const sans = render(<Fiche fiche={fakeFiche()} />).container.innerHTML;
    cleanup();
    const vide = render(<Fiche fiche={fakeFiche({ captures: [] })} />).container;
    expect(vide.querySelector("figure")).toBeNull();
    expect(vide.innerHTML).toBe(sans);
  });

  it("refus : la carte de l'accueil garde le seul visuel principal et ne montre aucune capture de galerie", () => {
    const { container } = render(<ProjectCard fiche={fakeFiche({ captures: CAPTURES })} />);
    const imgs = Array.from(container.querySelectorAll("img"));
    expect(imgs).toHaveLength(1);
    expect(imgs[0].getAttribute("src")).toBe("/projets/generated/factice.png");
    expect(container.querySelector("figure")).toBeNull();
    expect(container.innerHTML).not.toContain("accueil.png");
  });
});

const VIDEO = { fichier: "/projets/factice/demo.mp4", duree: "2 min" };

describe("Lecteur vidéo sous l'ancre #video (PFO-64)", () => {
  it("montre un lecteur natif avec controls, preload metadata et le visuel en poster, sous l'ancre video, entre En bref et la galerie", () => {
    const { container } = render(<Fiche fiche={fakeFiche({ video: VIDEO, captures: CAPTURES })} />);
    const anchor = container.querySelector("#video")!;
    expect(anchor).not.toBeNull();
    const video = anchor.querySelector("video")!;
    expect(video).not.toBeNull();
    expect(video.hasAttribute("controls")).toBe(true);
    expect(video.getAttribute("preload")).toBe("metadata");
    expect(video.getAttribute("poster")).toBe("/projets/generated/factice.png");
    const source = video.querySelector("source")!;
    expect(source.getAttribute("src")).toBe(VIDEO.fichier);
    expect(source.getAttribute("type")).toBe("video/mp4");
    const enBref = container.querySelector("p strong")!.closest("p")!;
    const gallery = container.querySelector("figure")!.parentElement!;
    expect(enBref.compareDocumentPosition(anchor) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(anchor.compareDocumentPosition(gallery) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("refus : une fiche sans vidéo n'a ni lecteur ni ancre video ; avec vidéo, jamais autoplay ni muted, aucun script", () => {
    const sans = render(<Fiche fiche={fakeFiche({ captures: CAPTURES })} />).container;
    expect(sans.querySelector("video")).toBeNull();
    expect(sans.querySelector("#video")).toBeNull();
    cleanup();
    const avec = render(<Fiche fiche={fakeFiche({ video: VIDEO })} />).container;
    const video = avec.querySelector("video")!;
    expect(video.hasAttribute("autoplay")).toBe(false);
    expect(video.hasAttribute("muted")).toBe(false);
    expect(avec.querySelector("script")).toBeNull();
    expect(avec.innerHTML).not.toMatch(/autoplay|onplay|onclick/i);
  });
});

describe("Mention « Vidéo (N min) » sur la carte (PFO-66)", () => {
  it("lie « Vidéo (2 min) » vers /projets/<slug>/#video, à côté de Code et Démo, sans déborder", () => {
    render(
      <ProjectCard fiche={fakeFiche({ video: VIDEO, frontmatter: { ...fakeFiche().frontmatter, demo: "https://factice.example.test/" } })} />,
    );
    const lien = screen.getByRole("link", { name: "Vidéo (2 min)" });
    expect(lien).toHaveAttribute("href", "/projets/factice/#video");
    const ligne = screen.getByRole("link", { name: "Code" }).parentElement!;
    expect(ligne).toContainElement(screen.getByRole("link", { name: "Démo" }));
    expect(ligne).toContainElement(lien);
    expect(ligne.className).toMatch(/\bflex-wrap\b/);
  });

  it("une carte anonyme avec vidéo garde sa mention, montre « Vidéo (45 s) » et toujours aucun lien Code ni Démo", () => {
    const anonyme = { ...fakeFiche().frontmatter, visibilite: "anonyme" as const, depot: "", depotNote: "", demo: "", demoNote: "" };
    render(<ProjectCard fiche={fakeFiche({ frontmatter: anonyme, video: { fichier: "/projets/factice/demo.mp4", duree: "45 s" } })} />);
    expect(screen.getByText("Projet anonymisé : code et client non publiés")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Vidéo (45 s)" })).toHaveAttribute("href", "/projets/factice/#video");
    expect(screen.queryByRole("link", { name: "Code" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Démo" })).toBeNull();
  });

  it("refus : une carte sans vidéo ne contient pas le mot « Vidéo » et garde son visuel principal", () => {
    const { container } = render(<ProjectCard fiche={fakeFiche({ captures: CAPTURES })} />);
    expect(container.textContent).not.toMatch(/Vidéo/);
    expect(container.querySelector("a[href$='#video']")).toBeNull();
    expect(container.querySelector("img")!.getAttribute("src")).toBe("/projets/generated/factice.png");
  });
});
