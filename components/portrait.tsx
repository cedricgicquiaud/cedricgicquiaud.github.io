import site from "../content/site.json";

export function Portrait() {
  return (
    <section id="portrait" className="px-6 py-16 lg:px-16">
      <figure className="mx-auto w-full max-w-3xl">
        <div className="w-40 overflow-hidden rounded-lg bg-primary sm:w-48">
          <img
            src="/portrait.jpg"
            alt={`Portrait de ${site.name}`}
            width={480}
            height={600}
            className="block h-auto w-full grayscale contrast-110 mix-blend-multiply dark:mix-blend-screen"
          />
        </div>
      </figure>
    </section>
  );
}
