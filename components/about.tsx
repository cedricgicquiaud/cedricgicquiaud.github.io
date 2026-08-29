import { contentDir, loadAbout } from "../lib/content";

export function About() {
  const about = loadAbout(contentDir);
  return (
    <section id="a-propos" className="px-6 py-16 lg:px-16">
      <div className="mx-auto w-full max-w-3xl">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">{about.titre}</h2>
        <div
          className="space-y-4 leading-relaxed text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: about.html }}
        />
      </div>
    </section>
  );
}
