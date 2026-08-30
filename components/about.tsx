import site from "../content/site.json";
import { contentDir, loadAbout } from "../lib/content";

export function About() {
  const about = loadAbout(contentDir);
  return (
    <section id={site.sections.about} className="py-16">
      <div className="w-full">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">{about.titre}</h2>
        <div
          className="space-y-4 leading-relaxed text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: about.html }}
        />
      </div>
    </section>
  );
}
