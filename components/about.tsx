import site from "../content/site.json";
import { contentDir, loadAbout } from "../lib/content";

export function About() {
  const about = loadAbout(contentDir);
  return (
    <section id={site.sections.about} className="py-16">
      <div className="w-full">
        <h2 className="mb-6 text-sm font-bold uppercase tracking-widest">{about.titre}</h2>
        <div
          className="space-y-4 text-base leading-relaxed text-muted-foreground [&_strong]:font-medium [&_strong]:text-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:hover:text-cyber [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-2 [&_a]:focus-visible:outline-ring"
          dangerouslySetInnerHTML={{ __html: about.html }}
        />
      </div>
    </section>
  );
}
