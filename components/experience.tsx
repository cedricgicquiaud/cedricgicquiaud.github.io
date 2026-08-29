import { contentDir, loadExperience } from "../lib/content";
import { Badge } from "./ui/badge";

export function Experience() {
  const experience = loadExperience(contentDir);
  return (
    <section id="experience" className="px-6 py-16 lg:px-16">
      <div className="mx-auto w-full max-w-3xl">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">{experience.titre}</h2>
        <ol className="space-y-10">
          {experience.blocs.map((bloc) => (
            <li key={bloc.periode}>
              <article className="grid gap-2 sm:grid-cols-[8rem_1fr] sm:gap-6">
                <p className="text-sm text-muted-foreground">{bloc.periode}</p>
                <div className="space-y-2">
                  <h3 className="font-medium">{bloc.role}</h3>
                  <p className="text-sm text-muted-foreground">{bloc.secteur}</p>
                  <p className="leading-relaxed">{bloc.description}</p>
                  <ul className="flex flex-wrap gap-2 pt-1">
                    {bloc.tags.map((tag) => (
                      <li key={tag}>
                        <Badge variant="secondary">{tag}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
