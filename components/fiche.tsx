import Link from "next/link";
import type { ReactNode } from "react";
import site from "../content/site.json";
import type { Fiche as FicheData } from "../lib/fiches";
import { Badge } from "./ui/badge";
import { AFFICHER_STATUT } from "../lib/affichage";
import { BookingLink } from "./booking-link";
import { DemoLink } from "./demo-link";
import { GitHubLink } from "./github-link";

// Mise en forme du HTML Markdown. Listes de premier niveau en lignes séparées par un trait, sans puce (PFO-130).
const MARKDOWN =
  "space-y-4 text-base leading-relaxed [&>ul]:list-none [&>ul]:pl-0 [&>ul>li]:my-0 [&>ul>li]:border-b [&>ul>li]:border-border [&>ul>li]:py-3 [&>ul>li:first-child]:pt-0 [&>ul>li:last-child]:border-b-0 [&_ul_ul]:list-disc [&_ul_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-foreground [&_a]:break-words [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:text-sm" +
  // Sous-titres, images du corps (captures placées dans le texte) et tableaux quadrillés : le tableau défile seul sur mobile, jamais la page.
  " [&_h3]:pt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:tracking-tight [&_ol>li]:my-1.5 [&_ul_ul>li]:my-1.5 [&_ol>li]:pl-1 [&_ul_ul]:mt-2 [&_img]:mt-6 [&_img]:w-full [&_img]:rounded-lg [&_img]:border [&_img]:border-border [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:border-collapse [&_table]:text-sm [&_th]:border [&_th]:border-border [&_th]:bg-muted/60 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:align-bottom [&_th]:font-semibold [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:align-top";

const LINK =
  "underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** Intitulés affichés, dans l'ordre du README GitHub (PFO-75) ; les fiches gardent leurs propres intitulés. */
const AFFICHAGE: Record<string, string> = {
  probleme: "Contexte",
  livrables: "Livrables",
  construit: "Le produit",
  architecture: "Architecture",
  stack: "Stack technique",
  decisions: "Décisions",
  preuves: "Où en est le projet",
  appris: "Ce que j'en retiens",
  artefacts: "Liens",
};

// Paragraphe qui ouvre les décisions dans « Ce que j'ai construit » : ce qui suit passe dans Décisions (PFO-130).
const DECISIONS = /<p>Décisions qui ont compté\s*:?<\/p>\s*/;

/** Coupe le HTML de « Ce que j'ai construit » : le produit avant les décisions, les décisions après. */
function splitConstruit(html: string): { produit: string; decisions: string } {
  const m = html.match(DECISIONS);
  if (!m || m.index === undefined) return { produit: html, decisions: "" };
  return { produit: html.slice(0, m.index).trim(), decisions: html.slice(m.index + m[0].length).trim() };
}

function Section({ id, titre, children }: { id: string; titre: string; children: ReactNode }) {
  return (
    // Deux colonnes sur écran large (PFO-130) : le titre à gauche, le contenu à droite, sans filet (le quadrillage suffit) ; empilés sur téléphone.
    <section id={id} className="mt-20 scroll-mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-x-20">
      {/* Titres en grand, graisse normale, comme le modèle (retour du 03/11). */}
      <h2 className="mb-4 text-2xl font-normal tracking-tight lg:mb-0 lg:text-3xl">{titre}</h2>
      <div className="min-w-0 max-w-3xl">{children}</div>
    </section>
  );
}

/** Vidéo puis captures de la fiche ; rien si elle n'en déclare pas. */
function Medias({ fiche }: { fiche: FicheData }) {
  return (
    <>
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
    </>
  );
}

function Pastilles({ outils, label }: { outils: string[]; label?: string }) {
  return (
    <ul aria-label={label} className="flex min-w-0 flex-wrap gap-2">
      {outils.map((tag) => (
        <li key={tag} className="min-w-0">
          <Badge variant="cyber" className="h-auto whitespace-normal">
            {tag}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

/** Stack technique (PFO-130) : une ligne par catégorie si la fiche déclare `stack_detail`, sinon les pastilles de `stack`. */
function Stack({ fiche }: { fiche: FicheData }) {
  if (!fiche.stackDetail?.length) {
    return fiche.frontmatter.stack.length ? <Pastilles outils={fiche.frontmatter.stack} label="Stack" /> : null;
  }
  return (
    <table className="w-full border-collapse text-sm">
      <tbody>
        {fiche.stackDetail.map(({ categorie, outils }) => (
          <tr key={categorie} className="border-b border-border last:border-b-0">
            <th scope="row" className="w-32 py-3 pr-4 text-left align-top font-normal text-muted-foreground sm:w-40">
              {categorie}
            </th>
            <td className="py-3">
              <Pastilles outils={outils} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Markdown({ html }: { html: string }) {
  // HTML produit par `marked` depuis les fiches du dépôt : contenu maîtrisé, contrôlé au build.
  return <div className={MARKDOWN} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function Fiche({ fiche }: { fiche: FicheData }) {
  const { frontmatter } = fiche;
  const html = (id: string) => fiche.sections.find((s) => s.id === id)?.html ?? "";
  const facultative = (id: string) => fiche.facultatives?.find((s) => s.id === id)?.html ?? "";
  const { produit, decisions: anciennesDecisions } = splitConstruit(html("construit"));
  const livrables = facultative("livrables");
  const decisions = facultative("decisions") || anciennesDecisions;
  const medias = Boolean(fiche.captures?.length || fiche.video);
  // Captures et vidéo vont dans Le produit ; à défaut de Le produit, dans Livrables.
  const mediasDansLivrables = medias && !produit && Boolean(livrables);
  const blocs: { id: string; contenu: ReactNode }[] = [
    { id: "probleme", contenu: html("probleme") && <Markdown html={html("probleme")} /> },
    {
      id: "livrables",
      contenu: livrables && (
        <>
          <Markdown html={livrables} />
          {mediasDansLivrables && <Medias fiche={fiche} />}
        </>
      ),
    },
    {
      id: "construit",
      contenu: (produit || (medias && !mediasDansLivrables)) && (
        <>
          {produit && <Markdown html={produit} />}
          {!mediasDansLivrables && <Medias fiche={fiche} />}
        </>
      ),
    },
    { id: "architecture", contenu: facultative("architecture") && <Markdown html={facultative("architecture")} /> },
    { id: "stack", contenu: <Stack fiche={fiche} /> },
    { id: "decisions", contenu: decisions && <Markdown html={decisions} /> },
    ...(["preuves", "appris", "artefacts"] as const).map((id) => ({ id, contenu: html(id) && <Markdown html={html(id)} /> })),
  ].filter((b) => b.contenu);
  const accroche = [fiche.enBref.quoi, fiche.enBref.chiffre, fiche.enBref.lien].filter(Boolean).join(" ");
  const meta = [AFFICHER_STATUT ? frontmatter.statut : "", frontmatter.periode, frontmatter.role].filter(Boolean);
  return (
    <article className="px-6 py-16 lg:px-16">
      <div className="mx-auto w-full max-w-6xl">
        <Link href={`/#${site.sections.projects}`} className={`text-sm text-muted-foreground ${LINK}`}>
          ← Projets
        </Link>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-balance">{fiche.titre || frontmatter.nom}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">{accroche}</p>
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
          className="mt-8 aspect-[16/10] w-full max-w-4xl rounded-lg border border-border object-cover"
        />
        {fiche.chiffres?.length ? (
          <ul aria-label="Chiffres clés" className="mt-6 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3">
            {fiche.chiffres.map(({ valeur, libelle }) => (
              <li key={`${valeur}-${libelle}`} className="min-w-0 rounded-lg border border-border bg-card/40 px-4 py-3">
                <span className="block text-2xl font-semibold tracking-tight text-cyber">{valeur}</span>
                <span className="block text-sm text-muted-foreground">{libelle}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <nav aria-label="Sommaire" className="mt-10">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {blocs.map(({ id }) => (
              <li key={id}>
                <a href={`#${id}`} className={LINK}>
                  {AFFICHAGE[id]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {blocs.map(({ id, contenu }) => (
          <Section key={id} id={id} titre={AFFICHAGE[id]}>
            {contenu}
          </Section>
        ))}
        {/* Invitation de fin de fiche (PFO-119) : un visiteur convaincu réserve un échange. */}
        <aside id="rendez-vous" className="mx-auto mt-20 flex w-fit max-w-full flex-wrap items-center justify-center gap-x-8 gap-y-4 rounded-lg border border-border bg-card/40 px-6 py-4">
          <p className="text-base font-medium">Un projet similaire ? Parlons-en.</p>
          <BookingLink />
        </aside>
      </div>
    </article>
  );
}

