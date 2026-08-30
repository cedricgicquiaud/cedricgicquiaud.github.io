import type { Fiche } from "../lib/fiches";
import { Badge } from "./ui/badge";

const isUrl = (s: string) => s.startsWith("http");

export function ProjectCard({ fiche }: { fiche: Fiche }) {
  const { titre, frontmatter, enBref } = fiche;
  const codePrive = frontmatter.visibilite === "vitrine" && !isUrl(frontmatter.depot);
  return (
    <article className="group/item min-w-0 space-y-3 rounded-lg border border-transparent p-5 transition-colors hover:border-border hover:bg-accent/50 lg:group-hover/list:opacity-50 lg:hover:!opacity-100">
      <h3 className="font-medium break-words group-hover/item:text-primary">
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
      </p>
    </article>
  );
}
