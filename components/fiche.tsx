import Link from "next/link";
import type { ReactNode } from "react";
import type { Fiche as FicheData } from "../lib/fiches";
import { Badge } from "./ui/badge";

// Mise en forme du HTML Markdown (Tailwind retire les puces et le soulignement par défaut).
const MARKDOWN =
  "space-y-4 leading-relaxed [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-foreground [&_a]:break-words [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:text-sm";

const LINK =
  "underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function Fiche({ fiche }: { fiche: FicheData }) {
  const { frontmatter } = fiche;
  return (
    <article className="px-6 py-16 lg:px-16">
      <div className="mx-auto w-full max-w-3xl">
        <Link href="/#projets" className={`text-sm text-muted-foreground ${LINK}`}>
          ← Projets
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">{fiche.titre || frontmatter.nom}</h1>
        {/* Même visuel que la carte, en couleur ; balise native (export statique, pas de next/image). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fiche.visuel}
          alt=""
          width={1200}
          height={750}
          loading="lazy"
          className="mt-6 aspect-[16/10] w-full rounded-lg border border-border object-cover"
        />
        <dl className="mt-6 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
          <Row term="Statut">{frontmatter.statut}</Row>
          <Row term="Période">{frontmatter.periode}</Row>
          <Row term="Rôle">{frontmatter.role}</Row>
          <Row term="Stack">
            <ul className="flex flex-wrap gap-2">
              {frontmatter.stack.map((tag) => (
                <li key={tag}>
                  <Badge variant="outline">{tag}</Badge>
                </li>
              ))}
            </ul>
          </Row>
          <Row term="Visibilité">{frontmatter.visibilite}</Row>
        </dl>
        {/* Mêmes règles que les cartes : un lien par URL non vide ; `lib/fiches` vide déjà tout pour `anonyme`. */}
        {(frontmatter.depot || frontmatter.demo) && (
          <p className="mt-4 flex gap-4 text-sm">
            {frontmatter.depot && (
              <a href={frontmatter.depot} className={LINK}>
                Code
              </a>
            )}
            {frontmatter.demo && (
              <a href={frontmatter.demo} className={LINK}>
                Démo
              </a>
            )}
          </p>
        )}
        <p className="mt-8 border-l-2 border-primary pl-4 leading-relaxed">
          <strong>En bref.</strong> {[fiche.enBref.quoi, fiche.enBref.chiffre, fiche.enBref.lien].filter(Boolean).join(" ")}
        </p>
        {fiche.sections.map(({ id, titre, html }) => (
          <section key={id} id={id} className="mt-12">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight">{titre}</h2>
            {/* HTML produit par `marked` depuis les fiches du dépôt : contenu maîtrisé, contrôlé au build. */}
            <div className={MARKDOWN} dangerouslySetInnerHTML={{ __html: html }} />
          </section>
        ))}
      </div>
    </article>
  );
}

function Row({ term, children }: { term: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{term}</dt>
      <dd>{children}</dd>
    </>
  );
}
