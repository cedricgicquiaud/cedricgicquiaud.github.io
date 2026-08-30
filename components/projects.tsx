import site from "../content/site.json";
import { loadFiches, type Fiche } from "../lib/fiches";
import { ProjectCard } from "./project-card";

/** Les cartes viennent de `loadFiches()` (déjà triées par `ordre`) ; `fiches` sert aux tests. */
export function Projects({ fiches = loadFiches() }: { fiches?: Fiche[] }) {
  return (
    <section id={site.sections.projects} className="py-16">
      <div className="w-full">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">Projets</h2>
        <ol className="group/list grid grid-cols-[minmax(0,1fr)] gap-6">
          {fiches.map((fiche) => (
            <li key={fiche.slug} className="min-w-0">
              <ProjectCard fiche={fiche} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
