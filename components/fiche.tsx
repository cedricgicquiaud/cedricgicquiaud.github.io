import type { Fiche as FicheData } from "../lib/fiches";
import { Badge } from "./ui/badge";

export function Fiche({ fiche }: { fiche: FicheData }) {
  const { frontmatter } = fiche;
  return (
    <article className="px-6 py-16 lg:px-16">
      <div className="mx-auto w-full max-w-3xl">
        <a href="/#projets" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          ← Projets
        </a>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">{fiche.titre || frontmatter.nom}</h1>
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
      </div>
    </article>
  );
}

function Row({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{term}</dt>
      <dd>{children}</dd>
    </>
  );
}
