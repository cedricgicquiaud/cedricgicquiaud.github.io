import site from "../content/site.json";
import { contentDir, loadExperience } from "../lib/content";
import { Badge } from "./ui/badge";

export function Experience() {
  const experience = loadExperience(contentDir);
  return (
    <section id={site.sections.experience} className="py-16">
      <div className="w-full">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">{experience.titre}</h2>
        <ol className="group/list space-y-10">
          {experience.blocs.map((bloc) => (
            <li key={bloc.periode}>
              <article className="group/item -mx-4 grid gap-2 rounded-lg border border-transparent p-4 transition-colors hover:border-border hover:bg-accent/50 focus-within:border-border focus-within:bg-accent/50 sm:grid-cols-[8rem_1fr] sm:gap-6 lg:group-hover/list:opacity-50 lg:hover:!opacity-100">
                <p className="text-sm text-muted-foreground">{bloc.periode}</p>
                <div className="space-y-2">
                  <h3 className="font-medium group-hover/item:text-primary group-focus-within/item:text-primary">{bloc.role}</h3>
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
