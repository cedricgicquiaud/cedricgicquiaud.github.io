import { contentDir, loadAbout } from "../lib/content";

export function About() {
  const about = loadAbout(contentDir);
  return (
    <section id="a-propos" className="py-16">
      <div className="w-full">
        <h2 className="mb-6 text-sm font-bold uppercase tracking-widest">{about.titre}</h2>
        <div
          className="space-y-4 text-base leading-relaxed text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: about.html }}
        />
      </div>
    </section>
  );
}
