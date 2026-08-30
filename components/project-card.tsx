import type { Fiche } from "../lib/fiches";
import { Badge } from "./ui/badge";

const isUrl = (s: string) => s.startsWith("http");

export function ProjectCard({ fiche }: { fiche: Fiche }) {
  const { titre, frontmatter, enBref } = fiche;
  const anonyme = frontmatter.visibilite === "anonyme";
  const codePrive = frontmatter.visibilite === "vitrine" && !isUrl(frontmatter.depot);
  return (
    <article className="group/item grid min-w-0 gap-4 rounded-lg border border-transparent p-5 transition-colors hover:border-border hover:bg-accent/50 focus-within:border-border focus-within:bg-accent/50 sm:grid-cols-[200px_1fr] lg:group-hover/list:opacity-50 lg:hover:!opacity-100">
      {/* Monochrome bleu au repos : image en niveaux de gris fondue (multiply, screen en sombre) sur le bleu
          du parent ; au survol ou au focus, fondu et gris retirés, l'image reprend ses couleurs. */}
      <div className="self-start overflow-hidden rounded border border-border bg-primary">
        {/* Export statique : balise native, pas d'optimisation next/image. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fiche.visuel}
          alt=""
          width={1200}
          height={750}
          loading="lazy"
          className="aspect-[16/10] w-full object-cover grayscale mix-blend-multiply transition dark:mix-blend-screen group-hover/item:grayscale-0 group-hover/item:mix-blend-normal group-focus-within/item:grayscale-0 group-focus-within/item:mix-blend-normal"
        />
      </div>
      <div className="min-w-0 space-y-3">
        <h3 className="font-medium break-words group-hover/item:text-primary group-focus-within/item:text-primary">
          <a href={`/projets/${fiche.slug}/`} className="hover:underline underline-offset-4">
            {titre || frontmatter.nom}
          </a>
        </h3>
        <p className="leading-relaxed">{enBref.quoi}</p>
        <p className="text-lg font-semibold tabular-nums">{enBref.chiffre}</p>
        <Badge variant="secondary" className="h-auto whitespace-normal">
          {frontmatter.statut}
        </Badge>
        <ul aria-label="Stack" className="flex flex-wrap gap-2">
          {frontmatter.stack.slice(0, 5).map((tag) => (
            <li key={tag}>
              <Badge variant="outline">{tag}</Badge>
            </li>
          ))}
        </ul>
        <p className="flex gap-4 text-sm">
          {isUrl(frontmatter.depot) && (
            <a href={frontmatter.depot} className="underline underline-offset-4">
              Code
            </a>
          )}
          {isUrl(frontmatter.demo) && (
            <a href={frontmatter.demo} className="underline underline-offset-4">
              Démo
            </a>
          )}
          {codePrive && <span className="text-muted-foreground">code privé, démo à venir</span>}
          {anonyme && <span className="text-muted-foreground">Projet anonymisé : code et client non publiés</span>}
        </p>
      </div>
    </article>
  );
}
