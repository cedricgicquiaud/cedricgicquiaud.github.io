import Link from "next/link";
import type { ReactNode } from "react";
import site from "../content/site.json";
import type { Fiche as FicheData } from "../lib/fiches";
import { Badge } from "./ui/badge";
import { AFFICHER_STATUT } from "../lib/affichage";
import { DemoLink } from "./demo-link";
import { GitHubLink } from "./github-link";

// Mise en forme du HTML Markdown (Tailwind retire les puces et le soulignement par défaut).
const MARKDOWN =
  "space-y-4 text-base leading-relaxed [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-foreground [&_a]:break-words [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:text-sm";

const LINK =
  "underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** Intitulés affichés, dans l'ordre du README GitHub (PFO-75) ; les fiches gardent leurs propres intitulés. */
const AFFICHAGE: Record<string, string> = {
  probleme: "Contexte",
  construit: "Le produit",
  architecture: "Architecture",
  preuves: "Où en est le projet",
  appris: "Ce que j'en retiens",
  artefacts: "Liens",
};

// Paragraphe qui ouvre les décisions dans « Ce que j'ai construit » : ce qui suit passe dans Architecture.
const DECISIONS = /<p>Décisions qui ont compté\s*:?<\/p>\s*/;

/** Coupe le HTML de « Ce que j'ai construit » : le produit avant les décisions, les décisions après. */
function splitConstruit(html: string): { produit: string; decisions: string } {
  const m = html.match(DECISIONS);
  if (!m || m.index === undefined) return { produit: html, decisions: "" };
  return { produit: html.slice(0, m.index).trim(), decisions: html.slice(m.index + m[0].length).trim() };
}

function Section({ id, titre, children }: { id: string; titre: string; children: ReactNode }) {
  return (
    <section id={id} className="mt-14">
      <h2 className="mb-4 text-xl font-semibold tracking-tight">{titre}</h2>
      {children}
    </section>
  );
}

function Markdown({ html }: { html: string }) {
  // HTML produit par `marked` depuis les fiches du dépôt : contenu maîtrisé, contrôlé au build.
  return <div className={MARKDOWN} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function Fiche({ fiche }: { fiche: FicheData }) {
  const { frontmatter } = fiche;
  const html = (id: string) => fiche.sections.find((s) => s.id === id)?.html ?? "";
  const { produit, decisions } = splitConstruit(html("construit"));
  const accroche = [fiche.enBref.quoi, fiche.enBref.chiffre, fiche.enBref.lien].filter(Boolean).join(" ");
  const meta = [AFFICHER_STATUT ? frontmatter.statut : "", frontmatter.periode, frontmatter.role].filter(Boolean);
  return (
    <article className="px-6 py-16 lg:px-16">
      <div className="mx-auto w-full max-w-3xl">
        <Link href={`/#${site.sections.projects}`} className={`text-sm text-muted-foreground ${LINK}`}>
          ← Projets
        </Link>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-balance">{fiche.titre || frontmatter.nom}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{accroche}</p>
        {/* Mêmes règles que les cartes : un lien par URL non vide ; une fiche anonyme n'a aucun lien, une mention à la place. */}
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {frontmatter.visibilite === "anonyme" ? (
            <span className="text-muted-foreground">Projet anonymisé : code et client non publiés</span>
          ) : frontmatter.visibilite === "prive" ? (
            <span className="text-muted-foreground">Code privé</span>
          ) : (
            <>
              {frontmatter.depot && <GitHubLink href={frontmatter.depot} />}
              {frontmatter.demo && <DemoLink href={frontmatter.demo} />}
            </>
          )}
          {meta.length > 0 && <span className="min-w-0 text-muted-foreground">{meta.join(" · ")}</span>}
        </div>
        {/* Même visuel que la carte, en couleur ; balise native (export statique, pas de next/image). Au-dessus du pli : pas de loading="lazy". */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fiche.visuel}
          alt=""
          width={1200}
          height={750}
          className="mt-8 aspect-[16/10] w-full rounded-lg border border-border object-cover"
        />
        {fiche.chiffres?.length ? (
          <ul aria-label="Chiffres clés" className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {fiche.chiffres.map(({ valeur, libelle }) => (
              <li key={`${valeur}-${libelle}`} className="min-w-0 rounded-lg border border-border bg-card/40 px-4 py-3">
                <span className="block text-2xl font-semibold tracking-tight text-cyber">{valeur}</span>
                <span className="block text-sm text-muted-foreground">{libelle}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {html("probleme") && (
          <Section id="probleme" titre={AFFICHAGE.probleme}>
            <Markdown html={html("probleme")} />
          </Section>
        )}
        {(produit || fiche.captures?.length || fiche.video) && (
          <Section id="construit" titre={AFFICHAGE.construit}>
            {produit && <Markdown html={produit} />}
            {fiche.video && (
              <div id="video" className="mt-6">
                {/* Lecteur natif, contrôles au clavier ; jamais d'autoplay. Le poster est le visuel principal de la fiche. */}
                <video controls preload="metadata" poster={fiche.visuel} className="w-full rounded-lg border border-border">
                  <source src={fiche.video.fichier} type="video/mp4" />
                </video>
              </div>
            )}
            {fiche.captures?.length ? (
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {fiche.captures.map(({ fichier, legende }) => (
                  <figure key={fichier}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={fichier} alt={legende} loading="lazy" className="h-auto w-full rounded-lg border border-border" />
                    <figcaption className="mt-2 text-sm text-muted-foreground">{legende}</figcaption>
                  </figure>
                ))}
              </div>
            ) : null}
          </Section>
        )}
        <Section id="architecture" titre={AFFICHAGE.architecture}>
          <ul aria-label="Stack" className="flex flex-wrap gap-2">
            {frontmatter.stack.map((tag) => (
              <li key={tag}>
                <Badge variant="cyber">{tag}</Badge>
              </li>
            ))}
          </ul>
          {decisions && (
            <>
              <h3 className="mt-6 mb-3 text-base font-semibold">Décisions qui ont compté</h3>
              <Markdown html={decisions} />
            </>
          )}
        </Section>
        {(["preuves", "appris", "artefacts"] as const).map((id) =>
          html(id) ? (
            <Section key={id} id={id} titre={AFFICHAGE[id]}>
              <Markdown html={html(id)} />
            </Section>
          ) : null,
        )}
      </div>
    </article>
  );
}

