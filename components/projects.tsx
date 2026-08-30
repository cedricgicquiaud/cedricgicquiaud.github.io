import { loadFiches, type Fiche } from "../lib/fiches";
import { ProjectCard } from "./project-card";

/** Les cartes viennent de `loadFiches()` (déjà triées par `ordre`) ; `fiches` sert aux tests. */
export function Projects({ fiches = loadFiches() }: { fiches?: Fiche[] }) {
  return (
    <section id="projets" className="px-6 py-16 lg:px-16">
      <div className="mx-auto w-full max-w-3xl">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">Projets</h2>
        <ol className="grid gap-6">
          {fiches.map((fiche) => (
            <li key={fiche.slug}>
              <ProjectCard fiche={fiche} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
