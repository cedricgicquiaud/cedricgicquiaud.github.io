import site from "../content/site.json";

const links = [
  { label: "GitHub", href: site.links.github },
  { label: "LinkedIn", href: site.links.linkedin },
  { label: "Mail", href: `mailto:${site.email}` },
];

export function Intro() {
  return (
    <section
      id="intro"
      className="bg-grid flex min-h-screen flex-col justify-center px-6 py-16 lg:px-16"
    >
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{site.name}</h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">{site.title}</p>
        <ul className="mt-10 flex flex-wrap gap-6">
          {links.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                className="underline underline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
