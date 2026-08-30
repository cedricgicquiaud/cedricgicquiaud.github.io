import site from "../content/site.json";

const repoLabel = site.links.repo.replace(/^https?:\/\//, "");

export function Footer() {
  return (
    <footer id="contact" className="border-t px-6 py-10 text-sm text-muted-foreground lg:px-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        <p>
          Site généré depuis mes fiches de preuve.{" "}
          <a
            href={site.links.repo}
            className="break-all underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {repoLabel}
          </a>
        </p>
        <p>
          Contact :{" "}
          <a
            href={`mailto:${site.email}`}
            className="underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Mail
          </a>
        </p>
      </div>
    </footer>
  );
}
