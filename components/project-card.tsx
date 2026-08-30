import type { Fiche } from "../lib/fiches";
import { Badge } from "./ui/badge";

export function ProjectCard({ fiche }: { fiche: Fiche }) {
  const { titre, frontmatter, enBref } = fiche;
  return (
    <article className="space-y-3 rounded-lg border border-border p-5">
      <h3 className="font-medium">{titre || frontmatter.nom}</h3>
      <p className="leading-relaxed">{enBref.quoi}</p>
      <p className="text-lg font-semibold tabular-nums">{enBref.chiffre}</p>
      <Badge variant="secondary">{frontmatter.statut}</Badge>
      <ul aria-label="Stack" className="flex flex-wrap gap-2">
        {frontmatter.stack.slice(0, 5).map((tag) => (
          <li key={tag}>
            <Badge variant="outline">{tag}</Badge>
          </li>
        ))}
      </ul>
    </article>
  );
}
